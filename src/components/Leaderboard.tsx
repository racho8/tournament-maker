import React from 'react';
import { calculateLeaderboard } from '../utils/tournamentUtils';
import { Team } from '../types/tournament';
import { Trophy, TrendingUp, Award } from 'lucide-react';

interface LeaderboardProps {
  teams: Team[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams }) => {
  const leaderboard = calculateLeaderboard(teams);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-gray-400';
    }
  };

  const getMedalIcon = (position: number) => {
    if (position <= 3) {
      return <Trophy className={`w-5 h-5 ${getMedalColor(position)}`} />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-gray-800">Leaderboard</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Pos</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Team</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">GP</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">W</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">L</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">PF</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">PA</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">+/-</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Win%</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Pts</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={entry.team.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  entry.position === 1 ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {getMedalIcon(entry.position)}
                    <span className="font-semibold text-gray-800">{entry.position}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-gray-800">{entry.team.name}</div>
                    <div className="text-xs text-gray-500">
                      {entry.team.players.map(p => p.name).join(' & ')}
                    </div>
                  </div>
                </td>
                <td className="text-center py-3 px-2 text-gray-700">{entry.team.gamesPlayed}</td>
                <td className="text-center py-3 px-2 text-green-600 font-medium">{entry.team.wins}</td>
                <td className="text-center py-3 px-2 text-red-600 font-medium">{entry.team.losses}</td>
                <td className="text-center py-3 px-2 text-gray-700">{entry.team.pointsFor}</td>
                <td className="text-center py-3 px-2 text-gray-700">{entry.team.pointsAgainst}</td>
                <td className={`text-center py-3 px-2 font-medium ${
                  entry.pointDifferential > 0 ? 'text-green-600' : 
                  entry.pointDifferential < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {entry.pointDifferential > 0 ? '+' : ''}{entry.pointDifferential}
                </td>
                <td className="text-center py-3 px-2 text-gray-700">
                  {entry.winPercentage.toFixed(0)}%
                </td>
                <td className="text-center py-3 px-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {entry.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No games played yet</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div className="font-semibold mb-1">Scoring System:</div>
        <div>GP = Games Played • W = Wins • L = Losses • PF = Points For • PA = Points Against</div>
        <div>+/- = Point Differential • Win% = Win Percentage • Pts = Tournament Points (3 for win, 1 for tie)</div>
      </div>
    </div>
  );
};

export default Leaderboard;
