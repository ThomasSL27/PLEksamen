export interface ApiPlayer {
  nickname?: string;
  name?: string;
  steamid?: string;
  image?: string;
  role?: string;
  age?: number | string;
  twitter?: string;
  social?: { twitter?: string };
}

export interface ApiTeam {
  _id: string;
  name?: string;
  shortName?: string;
  logoUrl?: string;
  lineups?: { players: ApiPlayer[] };
}

export interface ApiMatch {
  _id: string;
  team1: string;
  team2: string;
  startDate?: string;
  streamUrl?: string;
}

export interface ApiSeason {
  name?: string;
  teams?: ApiTeam[];
  matches?: ApiMatch[];
}
