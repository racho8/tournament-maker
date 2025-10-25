import { Player, Team, Match } from '../types/tournament';

// Generate random teams from available players
export const generateRandomTeams = (players: Player[]): Team[] => {
  if (players.length < 4 || players.length % 2 !== 0) {
    throw new Error('Need at least 4 players (even number) to create teams');
  }

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const teams: Team[] = [];
  
  for (let i = 0; i < shuffled.length; i += 2) {
    teams.push({
      id: `team-${i / 2 + 1}`,
      name: `Team ${i / 2 + 1}`,
      players: [shuffled[i], shuffled[i + 1]],
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      gamesPlayed: 0
    });
  }
  
  return teams;
};

// Generate balanced teams based on skill level
export const generateBalancedTeams = (players: Player[]): Team[] => {
  if (players.length < 4 || players.length % 2 !== 0) {
    throw new Error('Need at least 4 players (even number) to create teams');
  }

  // Sort players by skill level (if available), otherwise by wins
  const sorted = [...players].sort((a, b) => {
    const aSkill = a.skillLevel || (a.wins || 0) - (a.losses || 0);
    const bSkill = b.skillLevel || (b.wins || 0) - (b.losses || 0);
    return bSkill - aSkill;
  });

  const teams: Team[] = [];
  const numTeams = sorted.length / 2;
  
  // Snake draft: 1st with last, 2nd with 2nd-last, etc.
  for (let i = 0; i < numTeams; i++) {
    teams.push({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      players: [sorted[i], sorted[sorted.length - 1 - i]],
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      gamesPlayed: 0
    });
  }
  
  return teams;
};

// Generate round-robin matches
export const generateRoundRobinMatches = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;
  let round = 1;

  // Generate all possible matchups
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `match-${matchId++}`,
        round,
        team1: teams[i],
        team2: teams[j],
        completed: false
      });
      
      // Distribute matches across rounds
      if (matchId % (teams.length / 2) === 1) {
        round++;
      }
    }
  }
  
  return matches;
};

// Generate knockout bracket from top teams
export const generateKnockoutBracket = (teams: Team[], topN: number = 4): Match[] => {
  const sortedTeams = [...teams]
    .sort((a, b) => {
      // Sort by wins, then by point differential
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
    })
    .slice(0, topN);

  const matches: Match[] = [];
  
  // If only 4 teams total, skip semi-finals and go straight to finals with top 2
  // This avoids teams playing each other twice (once in group stage, once in semis)
  if (teams.length === 4) {
    // Just create the final match with top 2 teams
    if (sortedTeams.length >= 2) {
      matches.push(
        {
          id: 'final',
          round: 1,
          team1: sortedTeams[0],
          team2: sortedTeams[1],
          completed: false
        },
        {
          id: 'third-place',
          round: 1,
          team1: sortedTeams[2],
          team2: sortedTeams[3],
          completed: false
        }
      );
    }
  } else {
    // Semi-finals for tournaments with more than 4 teams
    if (sortedTeams.length >= 4) {
      matches.push(
        {
          id: 'semi-1',
          round: 1,
          team1: sortedTeams[0],
          team2: sortedTeams[3],
          completed: false
        },
        {
          id: 'semi-2',
          round: 1,
          team1: sortedTeams[1],
          team2: sortedTeams[2],
          completed: false
        }
      );
    }
  }
  
  return matches;
};

// Generate finals from semi-final winners
export const generateFinalMatches = (semiFinalMatches: Match[]): Match[] => {
  const semi1 = semiFinalMatches.find(m => m.id === 'semi-1');
  const semi2 = semiFinalMatches.find(m => m.id === 'semi-2');

  if (!semi1?.completed || !semi2?.completed || !semi1.winner || !semi2.winner) {
    return [];
  }

  // Get winner teams
  const winner1Team = semi1.winner === semi1.team1.id ? semi1.team1 : semi1.team2;
  const winner2Team = semi2.winner === semi2.team1.id ? semi2.team1 : semi2.team2;

  // Get loser teams for third place match
  const loser1Team = semi1.winner === semi1.team1.id ? semi1.team2 : semi1.team1;
  const loser2Team = semi2.winner === semi2.team1.id ? semi2.team2 : semi2.team1;

  return [
    {
      id: 'third-place',
      round: 2,
      team1: loser1Team,
      team2: loser2Team,
      completed: false
    },
    {
      id: 'final',
      round: 2,
      team1: winner1Team,
      team2: winner2Team,
      completed: false
    }
  ];
};

// Calculate leaderboard
export const calculateLeaderboard = (teams: Team[]) => {
  return [...teams]
    .map((team) => {
      const points = team.wins * 3 + (team.gamesPlayed - team.wins - team.losses); // 3 points for win, 1 for tie
      const winPercentage = team.gamesPlayed > 0 ? (team.wins / team.gamesPlayed) * 100 : 0;
      const pointDifferential = team.pointsFor - team.pointsAgainst;
      
      return {
        team,
        points,
        winPercentage,
        pointDifferential
      };
    })
    .sort((a, b) => {
      // Sort by points, then win percentage, then point differential
      if (b.points !== a.points) return b.points - a.points;
      if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
      return b.pointDifferential - a.pointDifferential;
    })
    .map((entry, index) => ({
      ...entry,
      position: index + 1
    }));
};

// Update match result
export const updateMatchResult = (
  match: Match,
  team1Score: number,
  team2Score: number
): { updatedMatch: Match; updatedTeams: Team[] } => {
  const winner = team1Score > team2Score ? match.team1.id : match.team2.id;
  
  const updatedMatch: Match = {
    ...match,
    team1Score,
    team2Score,
    winner,
    completed: true,
    date: new Date().toISOString()
  };

  // Update team stats
  const updatedTeam1: Team = {
    ...match.team1,
    wins: team1Score > team2Score ? match.team1.wins + 1 : match.team1.wins,
    losses: team1Score < team2Score ? match.team1.losses + 1 : match.team1.losses,
    pointsFor: match.team1.pointsFor + team1Score,
    pointsAgainst: match.team1.pointsAgainst + team2Score,
    gamesPlayed: match.team1.gamesPlayed + 1
  };

  const updatedTeam2: Team = {
    ...match.team2,
    wins: team2Score > team1Score ? match.team2.wins + 1 : match.team2.wins,
    losses: team2Score < team1Score ? match.team2.losses + 1 : match.team2.losses,
    pointsFor: match.team2.pointsFor + team2Score,
    pointsAgainst: match.team2.pointsAgainst + team1Score,
    gamesPlayed: match.team2.gamesPlayed + 1
  };

  return {
    updatedMatch,
    updatedTeams: [updatedTeam1, updatedTeam2]
  };
};

// Check if tournament phase should advance
export const shouldAdvanceToKnockout = (matches: Match[], totalTeams: number): boolean => {
  const groupStageMatches = matches.filter(m => !m.id.includes('semi') && !m.id.includes('final') && !m.id.includes('third'));
  return groupStageMatches.every(m => m.completed);
};

// Check if semi-finals are complete and finals should be generated
export const shouldGenerateFinals = (matches: Match[]): boolean => {
  const semiMatches = matches.filter(m => m.id.includes('semi'));
  // Only generate finals if we have semi-finals (tournaments with >4 teams)
  // For 4-team tournaments, finals are created directly
  return semiMatches.length === 2 && semiMatches.every(m => m.completed);
};
