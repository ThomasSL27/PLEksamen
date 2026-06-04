// ============================================================
// Typer: lib/types.ts
// Delte TypeScript-interfaces der beskriver datastrukturen
// fra Dust2 API'et (powerstats). Disse typer importeres og
// bruges i komponenter og sider der arbejder med API-data.
// ============================================================

// ApiPlayer: Beskriver én spiller returneret fra API'et.
// Alle felter er valgfrie (?) fordi API'et ikke altid sender dem alle.
export interface ApiPlayer {
  nickname?: string;               // Spillerens kaldenavn, fx "leakz"
  name?: string;                   // Spillerens rigtige navn, fx "Simon Sundstrøm"
  steamid?: string;                // Steam-ID bruges til unik identifikation
  image?: string;                  // URL til spillerbillede (cutout)
  role?: string;                   // Spillerens rolle, fx "IGL", "Coach" eller "Rifler"
  age?: number | string;           // Alder — kan komme som tal eller tekst fra API
  twitter?: string;                // Twitter/X håndtag, fx "@leakz"
  social?: { twitter?: string };   // Alternativ placering af Twitter-håndtag i API-svaret
}

// ApiTeam: Beskriver ét hold returneret fra API'et.
// Indeholder holdinfo og spillerliste via lineups.players
export interface ApiTeam {
  _id: string;                             // Unikt hold-ID fra MongoDB
  name?: string;                           // Holdets fulde navn, fx "Tricked Esport"
  shortName?: string;                      // Kortnavnet, fx "Tricked"
  logoUrl?: string;                        // URL til holdlogo
  lineups?: { players: ApiPlayer[] };      // Holdets spillerliste
}

// ApiMatch: Beskriver én kamp returneret fra API'et.
// team1 og team2 er hold-ID'er — ikke objekter — og slås op separat.
export interface ApiMatch {
  _id: string;          // Unikt kamp-ID fra MongoDB
  team1: string;        // ID på hold 1 — bruges til at slå hold op i teams-arrayet
  team2: string;        // ID på hold 2 — bruges til at slå hold op i teams-arrayet
  startDate?: string;   // ISO-datostreng, fx "2025-06-14T19:00:00.000Z"
  streamUrl?: string;   // URL til live-stream, fx "https://www.twitch.tv/dust2tv"
}

// ApiSeason: Beskriver én sæson/division returneret fra API'et.
// Indeholder sæsonens navn, alle hold og alle kampe.
export interface ApiSeason {
  name?: string;          // Sæsonens navn, fx "Sæson 31 Grundspil"
  teams?: ApiTeam[];      // Alle hold i sæsonen
  matches?: ApiMatch[];   // Alle kampe i sæsonen
}
