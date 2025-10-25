export interface Player {
  id: string;
  name: string;
  active: boolean;
  skillLevel?: number;
  wins?: number;
  losses?: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  gamesPlayed: number;
}

export interface Match {
  id: string;
  round: number;
  team1: Team;
  team2: Team;
  team1Score?: number;
  team2Score?: number;
  winner?: string;
  completed: boolean;
  date?: string;
  court?: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'round-robin' | 'knockout' | 'hybrid';
  format: 'singles' | 'doubles';
  teams: Team[];
  matches: Match[];
  currentRound: number;
  status: 'group-stage' | 'knockout' | 'completed';
  createdAt: string;
  completedAt?: string;
  settings: {
    pointsToWin: number;
    autoBalance: boolean;
    numberOfCourts: number;
  };
}

export interface LeaderboardEntry {
  team: Team;
  position: number;
  points: number;
  winPercentage: number;
  pointDifferential: number;
}
