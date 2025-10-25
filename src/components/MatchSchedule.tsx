import React, { useState } from 'react';
import { Match } from '../types/tournament';
import { Calendar, MapPin, Trophy, Edit2, Save, X } from 'lucide-react';

interface MatchScheduleProps {
  matches: Match[];
  onScoreUpdate: (matchId: string, team1Score: number, team2Score: number) => void;
  readonly?: boolean;
}

const MatchSchedule: React.FC<MatchScheduleProps> = ({
  matches,
  onScoreUpdate,
  readonly = false
}) => {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);

  const handleStartEdit = (match: Match) => {
    setEditingMatch(match.id);
    setTeam1Score(match.team1Score || 0);
    setTeam2Score(match.team2Score || 0);
  };

  const handleSaveScore = (matchId: string) => {
    onScoreUpdate(matchId, team1Score, team2Score);
    setEditingMatch(null);
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
    setTeam1Score(0);
    setTeam2Score(0);
  };

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.id === 'third-place' ? 'Third Place Match' :
                  match.id.includes('semi') ? 'Semi-Finals' : 
                  match.id === 'final' ? 'Championship Final' : 
                  `Round ${match.round}`;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Define round order for proper sorting
  const roundOrder = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Round 6', 'Semi-Finals', 'Third Place Match', 'Championship Final'];
  const sortedRounds = Object.keys(matchesByRound).sort((a, b) => {
    const indexA = roundOrder.indexOf(a);
    const indexB = roundOrder.indexOf(b);
    // If not in predefined order, sort alphabetically
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Match Schedule</h3>
      </div>

      {sortedRounds.map((round) => {
        const roundMatches = matchesByRound[round];
        const isThirdPlace = round === 'Third Place Match';
        const isFinal = round === 'Championship Final';
        
        return (
          <div key={round} className={`bg-white rounded-xl shadow-lg p-6 ${
            isThirdPlace ? 'border-2 border-orange-200' : 
            isFinal ? 'border-2 border-yellow-300' : ''
          }`}>
            <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${
                isThirdPlace ? 'text-orange-500' :
                isFinal ? 'text-yellow-500' : 
                'text-purple-500'
              }`} />
              {round}
            </h4>

          <div className="space-y-3">
            {roundMatches.map((match) => {
              const isEditing = editingMatch === match.id;
              const hasScore = match.team1Score !== undefined && match.team2Score !== undefined;

              return (
                <div
                  key={match.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    match.completed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {match.court && (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>{match.court}</span>
                        </>
                      )}
                      {match.date && (
                        <span className="text-gray-400">
                          • {new Date(match.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {!readonly && (
                      <div>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveScore(match.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 text-sm hover:bg-green-600"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded flex items-center gap-1 text-sm hover:bg-gray-400"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(match)}
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            {match.completed ? 'Edit Score' : 'Add Score'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Team 1 */}
                    <div className={`text-right ${
                      match.winner === match.team1.id ? 'font-bold' : ''
                    }`}>
                      <div className="text-gray-800 font-medium">{match.team1.name}</div>
                      <div className="text-xs text-gray-500">
                        {match.team1.players.map(p => p.name).join(' & ')}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={team1Score}
                            onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            min="0"
                            value={team2Score}
                            onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                        </div>
                      ) : hasScore ? (
                        <div className="text-2xl font-bold text-gray-800">
                          {match.team1Score} - {match.team2Score}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">vs</div>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className={`text-left ${
                      match.winner === match.team2.id ? 'font-bold' : ''
                    }`}>
                      <div className="text-gray-800 font-medium">{match.team2.name}</div>
                      <div className="text-xs text-gray-500">
                        {match.team2.players.map(p => p.name).join(' & ')}
                      </div>
                    </div>
                  </div>

                  {match.completed && match.winner && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Winner: {match.winner === match.team1.id ? match.team1.name : match.team2.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        );
      })}

      {matches.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No matches scheduled yet</p>
        </div>
      )}
    </div>
  );
};

export default MatchSchedule;
