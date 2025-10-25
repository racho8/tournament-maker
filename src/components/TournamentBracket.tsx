import React from 'react';
import { Match, Team } from '../types/tournament';
import { Trophy, ArrowRight, Award } from 'lucide-react';
import { calculateLeaderboard } from '../utils/tournamentUtils';

interface TournamentBracketProps {
  matches: Match[];
  teams: Team[];
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, teams }) => {
  // Separate match types
  const groupStageMatches = matches.filter(m => 
    !m.id.includes('semi') && !m.id.includes('final') && !m.id.includes('third')
  );
  const semiFinals = matches.filter(m => m.id.includes('semi'));
  const final = matches.find(m => m.id === 'final');
  const thirdPlace = matches.find(m => m.id === 'third-place');
  
  // Get top 4 teams from leaderboard for bracket display
  const leaderboard = calculateLeaderboard(teams);
  const top4Teams = leaderboard.slice(0, Math.min(4, teams.length)).map(entry => entry.team);
  
  // Check if this is a 4-team tournament (skips semi-finals)
  const isFourTeamTournament = teams.length === 4;

  const renderTeamBox = (team: Team, score?: number, isWinner?: boolean, showRank?: boolean, rank?: number) => {
    return (
      <div
        className={`relative p-3 rounded-lg border-2 transition-all ${
          isWinner
            ? 'border-green-500 bg-green-50 shadow-md'
            : score !== undefined
            ? 'border-gray-300 bg-gray-50'
            : 'border-blue-300 bg-blue-50'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className={`font-semibold text-sm ${isWinner ? 'text-green-800' : 'text-gray-800'} flex items-center gap-2`}>
              {showRank && rank && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  rank === 1 ? 'bg-yellow-200 text-yellow-800' :
                  rank === 2 ? 'bg-gray-300 text-gray-700' :
                  rank === 3 ? 'bg-orange-200 text-orange-700' :
                  'bg-blue-200 text-blue-700'
                }`}>
                  #{rank}
                </span>
              )}
              {team.name}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {team.players.map(p => p.name).join(' & ')}
            </div>
          </div>
          {score !== undefined && (
            <div className={`text-2xl font-bold ml-3 ${isWinner ? 'text-green-600' : 'text-gray-600'}`}>
              {score}
            </div>
          )}
        </div>
        {isWinner && (
          <div className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full p-1">
            <Trophy className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  };

  const renderConnector = (type: 'semi-to-final' | 'final-to-champion', position?: 'top' | 'bottom') => {
    if (type === 'semi-to-final') {
      return (
        <div className="flex items-center justify-center mx-4">
          <div className={`flex flex-col items-center ${position === 'top' ? 'mb-8' : 'mt-8'}`}>
            <div className="w-12 border-t-2 border-gray-300"></div>
            <div className={`h-16 border-l-2 border-gray-300 ${position === 'top' ? '-mt-1' : '-mb-1'}`}></div>
            <div className="w-12 border-t-2 border-gray-300"></div>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 ml-2" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center mx-4">
        <ArrowRight className="w-8 h-8 text-yellow-500" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-gray-800">Tournament Bracket</h3>
      </div>

      {teams.length >= 4 ? (
        <div className="space-y-8">
          {/* Tournament Overview Stats */}
          <div className={`grid ${isFourTeamTournament ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mb-6`}>
            <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{groupStageMatches.length}</div>
              <div className="text-sm text-blue-700 font-medium">Group Stage Matches</div>
              <div className="text-xs text-blue-600 mt-1">
                {groupStageMatches.filter(m => m.completed).length} completed
              </div>
            </div>
            {!isFourTeamTournament && (
              <div className="bg-purple-50 rounded-lg p-4 text-center border-2 border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{semiFinals.length}</div>
                <div className="text-sm text-purple-700 font-medium">Semi-Finals</div>
                <div className="text-xs text-purple-600 mt-1">
                  {semiFinals.filter(m => m.completed).length} completed
                </div>
              </div>
            )}
            <div className="bg-yellow-50 rounded-lg p-4 text-center border-2 border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{final ? '1' : '0'}</div>
              <div className="text-sm text-yellow-700 font-medium">Championship Final</div>
              <div className="text-xs text-yellow-600 mt-1">
                {final?.completed ? 'Complete' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Visual Tournament Tree */}
          <div className="overflow-x-auto pb-4">
            {isFourTeamTournament && (
              <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                <div className="text-blue-800 font-semibold text-sm">
                  ℹ️ 4-Team Tournament Format
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  All teams play each other in group stage (6 matches), then top 2 teams advance directly to the championship final
                </div>
              </div>
            )}
            
            <div className="inline-flex items-start gap-12 min-w-max px-4">
              
              {/* COLUMN 1: Group Stage Matches (All matches) */}
              <div className="space-y-4" style={{ minWidth: '280px' }}>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                    <Trophy className="w-4 h-4" />
                    GROUP STAGE - ROUND ROBIN
                  </div>
                  <div className="text-xs text-gray-500 mt-2">All teams compete</div>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {groupStageMatches.map((match, idx) => (
                    <div key={match.id} className="bg-white border-2 border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="text-xs text-blue-600 font-semibold mb-2">Match {idx + 1}</div>
                      <div className="space-y-2">
                        <div className={`flex justify-between items-center p-2 rounded ${
                          match.completed && match.winner === match.team1.id ? 'bg-green-50 border border-green-300' : 'bg-gray-50'
                        }`}>
                          <div className="text-sm font-medium text-gray-800">{match.team1.name}</div>
                          {match.completed && <div className="text-lg font-bold text-gray-700">{match.team1Score}</div>}
                        </div>
                        <div className={`flex justify-between items-center p-2 rounded ${
                          match.completed && match.winner === match.team2.id ? 'bg-green-50 border border-green-300' : 'bg-gray-50'
                        }`}>
                          <div className="text-sm font-medium text-gray-800">{match.team2.name}</div>
                          {match.completed && <div className="text-lg font-bold text-gray-700">{match.team2Score}</div>}
                        </div>
                      </div>
                      {match.completed && (
                        <div className="mt-2 text-xs text-center text-green-600 font-semibold">
                          ✓ Complete
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {groupStageMatches.every(m => m.completed) && (
                  <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                    <div className="text-green-700 font-bold text-sm">✓ Group Stage Complete</div>
                    <div className="text-xs text-green-600 mt-1">Top 4 teams advance →</div>
                  </div>
                )}
              </div>

              {/* Connector Arrow to Rankings */}
              {groupStageMatches.length > 0 && (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: '200px' }}>
                  <ArrowRight className="w-8 h-8 text-blue-500" />
                  <div className="text-xs text-gray-500 font-semibold mt-2 rotate-0">Rankings</div>
                </div>
              )}

              {/* COLUMN 2: Top Rankings */}
              <div className="space-y-4" style={{ minWidth: '240px' }}>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
                    <Award className="w-4 h-4" />
                    {isFourTeamTournament ? 'TOP 2 TEAMS' : 'TOP 4 TEAMS'}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {isFourTeamTournament ? 'Advance to finals' : 'Qualify for playoffs'}
                  </div>
                </div>
                
                <div className="space-y-3" style={{ paddingTop: '120px' }}>
                  {top4Teams.slice(0, isFourTeamTournament ? 2 : 4).map((team, idx) => {
                    const rank = idx + 1;
                    const bgColor = rank === 1 ? 'bg-yellow-50 border-yellow-400' : 
                                   rank === 2 ? 'bg-gray-100 border-gray-400' :
                                   rank === 3 ? 'bg-orange-50 border-orange-400' :
                                   'bg-blue-50 border-blue-400';
                    const badgeColor = rank === 1 ? 'bg-yellow-200 text-yellow-800' :
                                       rank === 2 ? 'bg-gray-300 text-gray-700' :
                                       rank === 3 ? 'bg-orange-200 text-orange-700' :
                                       'bg-blue-200 text-blue-700';
                    
                    return (
                      <div key={team.id} className={`${bgColor} border-2 rounded-lg p-3 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`${badgeColor} text-xs font-bold px-2 py-1 rounded`}>
                            #{rank}
                          </span>
                          <span className="font-bold text-gray-800">{team.name}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {team.players.map(p => p.name).join(' & ')}
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          <span className="text-gray-600">Record: {team.wins}-{team.losses}</span>
                          <span className="text-gray-600">+/-: {team.pointsFor - team.pointsAgainst}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {top4Teams.length >= (isFourTeamTournament ? 2 : 4) && (
                  <div className="mt-4 p-2 bg-indigo-50 border border-indigo-300 rounded text-center text-xs text-indigo-700 font-semibold">
                    {isFourTeamTournament ? 'Direct to Finals: #1 vs #2' : 'Matchups: #1 vs #4 • #2 vs #3'}
                  </div>
                )}
              </div>

              {/* Connector Arrow to Semi-Finals or Finals */}
              {(semiFinals.length > 0 || final) && (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: '200px' }}>
                  <ArrowRight className={`w-8 h-8 ${isFourTeamTournament ? 'text-yellow-500' : 'text-purple-500'}`} />
                  <div className="text-xs text-gray-500 font-semibold mt-2">
                    {isFourTeamTournament ? 'Finals' : 'Playoffs'}
                  </div>
                </div>
              )}

              {/* COLUMN 3: Semi-Finals (2 matches) - Only for >4 team tournaments */}
              {!isFourTeamTournament && semiFinals.length > 0 && (
                <div className="space-y-4" style={{ minWidth: '280px' }}>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
                      <Trophy className="w-4 h-4" />
                      SEMI-FINALS
                    </div>
                    <div className="text-xs text-gray-500 mt-2">2 matches</div>
                  </div>
                  
                  <div className="space-y-6" style={{ paddingTop: '160px' }}>
                    {semiFinals.map((match, idx) => (
                      <div key={match.id} className="bg-white border-2 border-purple-300 rounded-lg p-4 shadow-md">
                        <div className="text-xs text-purple-600 font-semibold mb-3 text-center">
                          SEMI-FINAL {idx + 1}
                        </div>
                        <div className="space-y-2">
                          {renderTeamBox(
                            match.team1,
                            match.team1Score,
                            match.winner === match.team1.id
                          )}
                          <div className="text-center text-xs text-gray-500 py-1 font-semibold">vs</div>
                          {renderTeamBox(
                            match.team2,
                            match.team2Score,
                            match.winner === match.team2.id
                          )}
                        </div>
                        {match.completed && (
                          <div className="mt-3 text-xs text-center text-green-600 font-bold">
                            ✓ Winner Advances
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {semiFinals.every(m => m.completed) && (
                    <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-300 rounded-lg text-center">
                      <div className="text-purple-700 font-bold text-sm">✓ Semi-Finals Complete</div>
                      <div className="text-xs text-purple-600 mt-1">Winners advance to final →</div>
                    </div>
                  )}
                </div>
              )}

              {/* Connector Arrow from Semi-Finals to Finals - Only for >4 team tournaments */}
              {!isFourTeamTournament && final && semiFinals.length > 0 && (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: '200px' }}>
                  <ArrowRight className="w-8 h-8 text-yellow-500" />
                  <div className="text-xs text-gray-500 font-semibold mt-2">Championship</div>
                </div>
              )}

              {/* COLUMN 4 (or 3 for 4-team): Championship Final (1 match) */}
              {final && (
                <div className="space-y-4" style={{ minWidth: '300px' }}>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold">
                      <Trophy className="w-5 h-5" />
                      CHAMPIONSHIP FINAL
                    </div>
                    <div className="text-xs text-gray-500 mt-2">1 match to crown champion</div>
                  </div>
                  
                  <div style={{ paddingTop: '220px' }}>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-3 border-yellow-400 rounded-xl p-5 shadow-xl">
                      <div className="text-sm text-yellow-700 font-bold mb-4 text-center">
                        🏆 FINAL MATCH
                      </div>
                      <div className="space-y-3">
                        {renderTeamBox(
                          final.team1,
                          final.team1Score,
                          final.winner === final.team1.id
                        )}
                        <div className="text-center text-sm text-gray-700 py-1 font-bold">VS</div>
                        {renderTeamBox(
                          final.team2,
                          final.team2Score,
                          final.winner === final.team2.id
                        )}
                      </div>
                      {!final.completed && (
                        <div className="mt-4 text-xs text-center text-yellow-700 font-semibold">
                          ⏱️ Match Pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Connector Arrow to Champion */}
              {final && final.completed && final.winner && (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: '200px' }}>
                  <ArrowRight className="w-10 h-10 text-yellow-600" />
                  <div className="text-xs text-yellow-600 font-bold mt-2">Winner!</div>
                </div>
              )}

              {/* COLUMN 5: Champion (Final result) */}
              {final && final.completed && final.winner && (
                <div className="space-y-4" style={{ minWidth: '280px' }}>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Trophy className="w-5 h-5" />
                      TOURNAMENT CHAMPION
                    </div>
                  </div>
                  
                  <div style={{ paddingTop: '220px' }}>
                    <div className="bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 border-4 border-yellow-500 rounded-xl p-8 text-center shadow-2xl">
                      <Trophy className="w-20 h-20 text-yellow-600 mx-auto mb-4 drop-shadow-lg" />
                      <div className="text-4xl font-extrabold text-yellow-800 mb-2">
                        🏆
                      </div>
                      <div className="text-2xl font-bold text-yellow-900 mb-3">
                        {final.winner === final.team1.id ? final.team1.name : final.team2.name}
                      </div>
                      <div className="text-sm text-yellow-700 font-medium mb-4">
                        {final.winner === final.team1.id 
                          ? final.team1.players.map(p => p.name).join(' & ')
                          : final.team2.players.map(p => p.name).join(' & ')
                        }
                      </div>
                      <div className="pt-4 border-t-2 border-yellow-400">
                        <div className="text-xs text-yellow-700 font-semibold mb-1">FINAL SCORE</div>
                        <div className="text-2xl font-bold text-yellow-900">
                          {final.team1Score} - {final.team2Score}
                        </div>
                      </div>
                      <div className="mt-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-xs font-bold">
                        ⭐ CHAMPIONS ⭐
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Third Place Match */}
          {thirdPlace && (
            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    THIRD PLACE MATCH
                  </div>
                  {!thirdPlace.completed && (
                    <div className="text-xs text-orange-600 mt-2">
                      📝 Enter scores in the Match Schedule tab
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {renderTeamBox(
                    thirdPlace.team1,
                    thirdPlace.team1Score,
                    thirdPlace.winner === thirdPlace.team1.id
                  )}
                  <div className="text-center text-xs text-gray-500 py-1">vs</div>
                  {renderTeamBox(
                    thirdPlace.team2,
                    thirdPlace.team2Score,
                    thirdPlace.winner === thirdPlace.team2.id
                  )}
                  {thirdPlace.completed && thirdPlace.winner && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <div className="text-orange-700 font-medium">
                        🥉 3rd Place: {thirdPlace.winner === thirdPlace.team1.id ? thirdPlace.team1.name : thirdPlace.team2.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <div className="font-semibold mb-2">Bracket Legend:</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
                <span>Winner / Advancing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 bg-gray-50 rounded"></div>
                <span>Eliminated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-300 bg-blue-50 rounded"></div>
                <span>Upcoming Match</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Trophy className="w-16 h-16 mx-auto mb-2" />
          </div>
          <p className="text-gray-600 text-lg font-medium mb-2">
            Complete Group Stage First
          </p>
          <p className="text-gray-500 text-sm">
            Finish all round-robin matches to advance top 4 teams to knockout rounds
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
