import React, { useState, useEffect } from 'react';
import { Tournament, Player, Team, Match } from '../types/tournament';
import {
  generateRandomTeams,
  generateBalancedTeams,
  generateRoundRobinMatches,
  generateKnockoutBracket,
  generateFinalMatches,
  updateMatchResult,
  shouldAdvanceToKnockout,
  shouldGenerateFinals
} from '../utils/tournamentUtils';
import PlayerSelection from './PlayerSelection';
import TeamSetup from './TeamSetup';
import MatchSchedule from './MatchSchedule';
import Leaderboard from './Leaderboard';
import TournamentBracket from './TournamentBracket';
import { 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Play,
  Settings,
  X,
  Download,
  Upload
} from 'lucide-react';

interface TournamentManagerProps {
  players: Player[];
  onClose: () => void;
}

type TournamentStep = 'setup' | 'player-select' | 'team-config' | 'settings' | 'active';

const TournamentManager: React.FC<TournamentManagerProps> = ({ players, onClose }) => {
  const [step, setStep] = useState<TournamentStep>('setup');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentName, setTournamentName] = useState('');
  const [balanceTeams, setBalanceTeams] = useState(true);
  const [pointsToWin, setPointsToWin] = useState(21);
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard' | 'bracket'>('matches');

  // Load tournament from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('courtsync-tournament');
    if (saved) {
      const savedTournament = JSON.parse(saved);
      setTournament(savedTournament);
      setTeams(savedTournament.teams);
      setMatches(savedTournament.matches);
      setStep('active');
    }
  }, []);

  // Save tournament to localStorage
  useEffect(() => {
    if (tournament) {
      localStorage.setItem('courtsync-tournament', JSON.stringify(tournament));
    }
  }, [tournament]);

  const handlePlayerToggle = (player: Player) => {
    setSelectedPlayers(prev => {
      const exists = prev.some(p => p.id === player.id);
      if (exists) {
        return prev.filter(p => p.id !== player.id);
      }
      return [...prev, player];
    });
  };

  const handleGenerateTeams = () => {
    if (selectedPlayers.length < 4 || selectedPlayers.length % 2 !== 0) {
      alert('Please select at least 4 players (must be even number)');
      return;
    }

    const newTeams = balanceTeams 
      ? generateBalancedTeams(selectedPlayers)
      : generateRandomTeams(selectedPlayers);
    
    setTeams(newTeams);
    setStep('team-config');
  };

  const handleShuffleTeams = () => {
    const newTeams = generateRandomTeams(selectedPlayers);
    setTeams(newTeams);
  };

  const handleStartTournament = () => {
    if (teams.length < 2) {
      alert('Need at least 2 teams to start tournament');
      return;
    }

    const roundRobinMatches = generateRoundRobinMatches(teams);
    
    const newTournament: Tournament = {
      id: `tournament-${Date.now()}`,
      name: tournamentName || `Tournament ${new Date().toLocaleDateString()}`,
      type: 'round-robin',
      format: 'doubles',
      teams: teams,
      matches: roundRobinMatches,
      currentRound: 1,
      status: 'group-stage',
      createdAt: new Date().toISOString(),
      settings: {
        pointsToWin,
        autoBalance: balanceTeams,
        numberOfCourts: 1
      }
    };

    setTournament(newTournament);
    setMatches(roundRobinMatches);
    setStep('active');
  };

  const handleScoreUpdate = (matchId: string, team1Score: number, team2Score: number) => {
    const matchIndex = matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    const match = matches[matchIndex];
    
    // Get current team stats from the main teams array (not from match snapshot)
    const currentTeam1 = teams.find(t => t.id === match.team1.id);
    const currentTeam2 = teams.find(t => t.id === match.team2.id);
    
    if (!currentTeam1 || !currentTeam2) return;

    // Create updated match with current team data
    const updatedMatchWithCurrentTeams = {
      ...match,
      team1: currentTeam1,
      team2: currentTeam2
    };

    const { updatedMatch, updatedTeams } = updateMatchResult(updatedMatchWithCurrentTeams, team1Score, team2Score);

    // Update matches - use the original team references in the match for display purposes
    const newMatches = [...matches];
    newMatches[matchIndex] = {
      ...updatedMatch,
      // Keep original team references for player names, but update scores and winner
      team1: match.team1,
      team2: match.team2,
      team1Score,
      team2Score,
      winner: updatedMatch.winner,
      completed: true,
      date: updatedMatch.date
    };

    // Update teams - properly merge all stats by accumulating them
    const newTeams = teams.map(team => {
      const updatedTeam = updatedTeams.find(t => t.id === team.id);
      if (updatedTeam) {
        // Use the updated stats from updateMatchResult which properly incremented values
        return {
          ...team,
          wins: updatedTeam.wins,
          losses: updatedTeam.losses,
          pointsFor: updatedTeam.pointsFor,
          pointsAgainst: updatedTeam.pointsAgainst,
          gamesPlayed: updatedTeam.gamesPlayed,
          players: team.players // Keep original players
        };
      }
      return team;
    });

    setMatches(newMatches);
    setTeams(newTeams);

    // Update tournament
    if (tournament) {
      let updatedTournament = {
        ...tournament,
        matches: newMatches,
        teams: newTeams
      };

      // Check if should advance to knockout
      if (shouldAdvanceToKnockout(newMatches, teams.length) && tournament.status === 'group-stage') {
        const knockoutMatches = generateKnockoutBracket(newTeams, 4);
        updatedTournament.matches = [...newMatches, ...knockoutMatches];
        updatedTournament.status = 'knockout';
        setMatches(updatedTournament.matches);
      }
      
      // Check if semi-finals are done and generate finals
      if (shouldGenerateFinals(newMatches) && tournament.status === 'knockout') {
        const semiMatches = newMatches.filter(m => m.id.includes('semi'));
        const finalMatches = generateFinalMatches(semiMatches);
        
        // Only add finals if they don't exist yet
        const hasFinalsAlready = newMatches.some(m => m.id === 'final');
        if (!hasFinalsAlready && finalMatches.length > 0) {
          updatedTournament.matches = [...newMatches, ...finalMatches];
          setMatches(updatedTournament.matches);
        }
      }

      setTournament(updatedTournament);
    }
  };

  const handleEndTournament = () => {
    const confirmed = window.confirm('Are you sure you want to end this tournament? This will save the results.');
    if (confirmed && tournament) {
      const completedTournament = {
        ...tournament,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      };
      setTournament(completedTournament);
      
      // Save to history
      const history = JSON.parse(localStorage.getItem('courtsync-tournament-history') || '[]');
      history.push(completedTournament);
      localStorage.setItem('courtsync-tournament-history', JSON.stringify(history));
    }
  };

  const handleNewTournament = () => {
    const confirmed = window.confirm('Start a new tournament? Current tournament will be saved to history.');
    if (confirmed) {
      if (tournament) {
        const history = JSON.parse(localStorage.getItem('courtsync-tournament-history') || '[]');
        history.push(tournament);
        localStorage.setItem('courtsync-tournament-history', JSON.stringify(history));
      }
      
      localStorage.removeItem('courtsync-tournament');
      setTournament(null);
      setTeams([]);
      setMatches([]);
      setSelectedPlayers([]);
      setStep('setup');
    }
  };

  const exportTournamentData = () => {
    if (!tournament) return;
    const dataStr = JSON.stringify(tournament, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tournament.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-t-xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-7 h-7" />
                Doubles Tournament Manager
              </h2>
              {tournament && (
                <p className="text-purple-100 mt-1">{tournament.name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          {step !== 'active' && (
            <div className="mt-4 flex items-center gap-2">
              {['setup', 'player-select', 'team-config', 'settings'].map((s, idx) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    step === s ? 'bg-white text-purple-600 font-semibold' : 'bg-purple-400 text-white'
                  }`}>
                    <span className="w-5 h-5 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                  {idx < 3 && <ArrowRight className="w-4 h-4 text-white" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Setup Step */}
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Trophy className="w-20 h-20 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Create Doubles Tournament
                </h3>
                <p className="text-gray-600 mb-6">
                  Organize a round-robin doubles tournament with automatic team balancing,
                  score tracking, and knockout stages
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="e.g., Summer Championship 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="balance"
                    checked={balanceTeams}
                    onChange={(e) => setBalanceTeams(e.target.checked)}
                    className="w-5 h-5 text-purple-600"
                  />
                  <label htmlFor="balance" className="flex-1 text-gray-700">
                    <div className="font-medium">Balance Teams Automatically</div>
                    <div className="text-sm text-gray-600">
                      Use player skill levels and win records for fair team creation
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setStep('player-select')}
                  className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  Continue to Player Selection
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Player Selection Step */}
          {step === 'player-select' && (
            <div className="space-y-6">
              <PlayerSelection
                availablePlayers={players.filter(p => p.active)}
                selectedPlayers={selectedPlayers}
                onPlayerToggle={handlePlayerToggle}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('setup')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleGenerateTeams}
                  disabled={selectedPlayers.length < 4 || selectedPlayers.length % 2 !== 0}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Generate Teams
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Team Configuration Step */}
          {step === 'team-config' && (
            <div className="space-y-6">
              <TeamSetup
                teams={teams}
                allPlayers={selectedPlayers}
                onTeamsUpdate={setTeams}
                onShuffle={handleShuffleTeams}
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('player-select')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={() => setStep('settings')}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Continue to Settings
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Settings Step */}
          {step === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Tournament Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points to Win (per game)
                    </label>
                    <select
                      value={pointsToWin}
                      onChange={(e) => setPointsToWin(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={11}>11 Points</option>
                      <option value={15}>15 Points</option>
                      <option value={21}>21 Points</option>
                      <option value={25}>25 Points</option>
                    </select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Tournament Format</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Round-Robin Group Stage: All teams play each other</li>
                      <li>• Top 4 teams advance to knockout semi-finals</li>
                      <li>• Winners compete in championship final</li>
                      <li>• Complete leaderboard and statistics tracking</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Tournament Summary</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Teams</div>
                        <div className="text-2xl font-bold text-purple-600">{teams.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Group Stage Matches</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {teams.length * (teams.length - 1) / 2}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Players</div>
                        <div className="text-2xl font-bold text-purple-600">{selectedPlayers.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('team-config')}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleStartTournament}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  <Play className="w-5 h-5" />
                  Start Tournament
                </button>
              </div>
            </div>
          )}

          {/* Active Tournament */}
          {step === 'active' && tournament && (
            <div className="space-y-6">
              {/* Status Bar */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">Tournament Status</div>
                    <div className="text-lg font-semibold text-gray-800 capitalize">
                      {tournament.status.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={exportTournamentData}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={handleEndTournament}
                      className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      End Tournament
                    </button>
                    <button
                      onClick={handleNewTournament}
                      className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      <Play className="w-4 h-4" />
                      New Tournament
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'matches'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Matches
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'leaderboard'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab('bracket')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'bracket'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Bracket
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'matches' && (
                <MatchSchedule
                  matches={matches}
                  onScoreUpdate={handleScoreUpdate}
                  readonly={tournament.status === 'completed'}
                />
              )}

              {activeTab === 'leaderboard' && (
                <Leaderboard teams={teams} />
              )}

              {activeTab === 'bracket' && (
                <TournamentBracket matches={matches} teams={teams} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentManager;
