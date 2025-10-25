import React, { useState } from 'react';
import { Player } from '../types/tournament';
import { Users, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface PlayerSelectionProps {
  availablePlayers: Player[];
  selectedPlayers: Player[];
  onPlayerToggle: (player: Player) => void;
  minPlayers?: number;
  maxPlayers?: number;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  availablePlayers,
  selectedPlayers,
  onPlayerToggle,
  minPlayers = 4,
  maxPlayers = 20
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'skill' | 'wins'>('name');

  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    switch (sortBy) {
      case 'skill':
        return (b.skillLevel || 0) - (a.skillLevel || 0);
      case 'wins':
        return (b.wins || 0) - (a.wins || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const isPlayerSelected = (player: Player) => 
    selectedPlayers.some(p => p.id === player.id);

  const canSelectMore = selectedPlayers.length < maxPlayers;
  const isValid = selectedPlayers.length >= minPlayers && selectedPlayers.length % 2 === 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Select Players ({selectedPlayers.length} selected)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select {minPlayers}-{maxPlayers} players (must be even number)
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Name
          </button>
          <button
            onClick={() => setSortBy('skill')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'skill' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Skill
          </button>
          <button
            onClick={() => setSortBy('wins')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'wins' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Wins
          </button>
        </div>
      </div>

      <div className={`p-3 rounded-lg ${
        isValid 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <p className="text-sm font-medium">
          {isValid 
            ? `✓ Valid selection: ${selectedPlayers.length} players = ${selectedPlayers.length / 2} teams`
            : selectedPlayers.length < minPlayers
            ? `⚠ Need at least ${minPlayers} players (${minPlayers - selectedPlayers.length} more)`
            : `⚠ Need even number of players (add or remove 1)`
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
        {sortedPlayers.map((player) => {
          const selected = isPlayerSelected(player);
          const canToggle = selected || canSelectMore;
          
          return (
            <div
              key={player.id}
              onClick={() => canToggle && onPlayerToggle(player)}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : canToggle
                  ? 'border-gray-200 bg-white hover:border-blue-300'
                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    {player.name}
                    {selected && <span className="text-blue-500">✓</span>}
                  </div>
                  
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    {player.skillLevel && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>Skill: {player.skillLevel}/10</span>
                      </div>
                    )}
                    
                    {(player.wins !== undefined || player.losses !== undefined) && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          {player.wins || 0}W
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="w-3 h-3" />
                          {player.losses || 0}L
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No players available</p>
        </div>
      )}
    </div>
  );
};

export default PlayerSelection;
