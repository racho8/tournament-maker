import React, { useState } from 'react';
import { Team, Player } from '../types/tournament';
import { Edit2, Users, Shuffle, X, Lock, Unlock } from 'lucide-react';

interface TeamSetupProps {
  teams: Team[];
  allPlayers: Player[];
  onTeamsUpdate: (teams: Team[]) => void;
  onShuffle: () => void;
  allowEditing?: boolean;
}

const TeamSetup: React.FC<TeamSetupProps> = ({
  teams,
  allPlayers,
  onTeamsUpdate,
  onShuffle,
  allowEditing = true
}) => {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [lockedTeams, setLockedTeams] = useState<Set<string>>(new Set());

  const handleNameChange = (teamId: string, newName: string) => {
    const updatedTeams = teams.map(team =>
      team.id === teamId ? { ...team, name: newName } : team
    );
    onTeamsUpdate(updatedTeams);
    setEditingTeam(null);
  };

  const handlePlayerSwap = (teamId: string, playerIndex: number, newPlayer: Player) => {
    // Find the old player being replaced
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    const oldPlayer = team.players[playerIndex];
    
    const updatedTeams = teams.map(t => {
      // Update the team where we're placing the new player
      if (t.id === teamId) {
        const newPlayers = [...t.players];
        newPlayers[playerIndex] = newPlayer;
        return { ...t, players: newPlayers };
      }
      // Find and update the team that had the new player, replace with old player
      const hasNewPlayer = t.players.some(p => p.id === newPlayer.id);
      if (hasNewPlayer) {
        const newPlayers = t.players.map(p => 
          p.id === newPlayer.id ? oldPlayer : p
        );
        return { ...t, players: newPlayers };
      }
      return t;
    });
    onTeamsUpdate(updatedTeams);
  };

  const getAvailablePlayersForSwap = (currentTeam: Team, currentPlayer: Player): Player[] => {
    // Get all players from other teams
    const otherTeamPlayers = teams
      .filter(t => t.id !== currentTeam.id)
      .flatMap(t => t.players);
    return otherTeamPlayers;
  };

  const toggleTeamLock = (teamId: string) => {
    const newLockedTeams = new Set(lockedTeams);
    if (newLockedTeams.has(teamId)) {
      newLockedTeams.delete(teamId);
    } else {
      newLockedTeams.add(teamId);
    }
    setLockedTeams(newLockedTeams);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Team Configuration ({teams.length} teams)
        </h3>
        {allowEditing && (
          <button
            onClick={onShuffle}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle Teams
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {teams.map((team) => {
          const isEditing = editingTeam === team.id;
          const isLocked = lockedTeams.has(team.id);

          return (
            <div
              key={team.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                isLocked 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-purple-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                {isEditing ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded"
                      autoFocus
                    />
                    <button
                      onClick={() => handleNameChange(team.id, teamName)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTeam(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                      {team.name}
                      {isLocked && <Lock className="w-4 h-4 text-green-600" />}
                    </h4>
                    <div className="flex gap-2">
                      {allowEditing && (
                        <>
                          <button
                            onClick={() => toggleTeamLock(team.id)}
                            className={`p-2 rounded transition-colors ${
                              isLocked
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={isLocked ? 'Unlock team' : 'Lock team'}
                          >
                            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingTeam(team.id);
                              setTeamName(team.name);
                            }}
                            className="text-gray-500 hover:text-blue-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                {team.players.map((player, index) => {
                  const availablePlayers = getAvailablePlayersForSwap(team, player);
                  
                  return (
                    <div
                      key={player.id}
                      className="bg-purple-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-800">{player.name}</div>
                        <div className="text-xs text-gray-600">
                          {player.skillLevel && `Skill: ${player.skillLevel}/10`}
                          {player.wins !== undefined && ` • ${player.wins}W-${player.losses}L`}
                        </div>
                      </div>

                      {allowEditing && !isLocked && availablePlayers.length > 0 && (
                        <select
                          onChange={(e) => {
                            const newPlayer = allPlayers.find(
                              p => p.id === e.target.value
                            );
                            if (newPlayer && newPlayer.id !== player.id) {
                              handlePlayerSwap(team.id, index, newPlayer);
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                          value=""
                        >
                          <option value="">Swap with...</option>
                          {availablePlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Skill: {p.skillLevel || 5})
                            </option>
                          ))}
                        </select>
                      )}
                      {isLocked && (
                        <Lock className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="text-sm text-gray-600">
                  Avg Skill: {
                    (team.players.reduce((sum, p) => sum + (p.skillLevel || 5), 0) / 
                    team.players.length).toFixed(1)
                  } • 
                  Combined Record: {
                    team.players.reduce((sum, p) => sum + (p.wins || 0), 0)
                  }W-{
                    team.players.reduce((sum, p) => sum + (p.losses || 0), 0)
                  }L
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSetup;
