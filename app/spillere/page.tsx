"use client";

import { useEffect, useState } from "react";
// Importér din genanvendelige PlayerCard komponent
import PlayerCard from "@/components/PlayerCard";

// ==================================================
// Typer
// ==================================================
interface PlayerData {
  id: string;
  nickname: string;
  name?: string;
  image?: string;
  role?: string;
  age?: number | string;
  twitter?: string;
  teamName: string;
  teamLogo: string;
  division: string;
}

interface Season {
  name: string;
  teams: any[];
}

type FetchState =
  | { status: "loading" }
  | { status: "ok"; allPlayers: PlayerData[] }
  | { status: "error"; message: string };

// ==================================================
// Konstanter
// ==================================================
const SEASON_ENDPOINT = "a/31";
const SEASON_NAME = "Sæson 31";

// ==================================================
// Hjælpefunktioner
// ==================================================
const toLower = (value?: string) => String(value || "").toLowerCase();

function mapAllPlayersFromSeasons(seasons: Season[]): PlayerData[] {
  const playersList: PlayerData[] = [];

  seasons.forEach((season) => {
    const divisionName = season.name;
    
    season.teams?.forEach((team) => {
      const teamPlayers = team.lineups?.players || [];
      const teamName = team.name || "Ukendt hold";
      const teamLogo = team.logoUrl || "";

      teamPlayers.forEach((p: any, idx: number) => {
        playersList.push({
          id: `${p.steamid || p.nickname || p.name}-${teamName}-${idx}`,
          nickname: p.nickname ?? p.name ?? "Ukendt",
          name: p.name,
          image: p.image || "",
          role: p.role || "",
          age: p.age || "",
          twitter: p.twitter || p.social?.twitter || "",
          teamName: teamName,
          teamLogo: teamLogo,
          division: divisionName,
        });
      });
    });
  });

  return playersList;
}

// ==================================================
// Hovedside (Spillerdatabase)
// ==================================================
export default function SpillerePage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData?.error || `API fejl: ${res.status} ${res.statusText}`
          );
        }

        const json = await res.json();
        const seasonsList: Season[] = json.data;

        if (!Array.isArray(seasonsList)) {
          throw new Error("Ugyldigt data-respons fra systemets API");
        }

        const mapped = mapAllPlayersFromSeasons(seasonsList);

        // Sortér spillerne alfabetisk baseret på aliasset som standard
        mapped.sort((a, b) => a.nickname.localeCompare(b.nickname, "da"));

        setState({
          status: "ok",
          allPlayers: mapped,
        });
      } catch (e: unknown) {
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    loadPlayers();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setDisplayCount(20);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        
        {/* Header */}
        <header className="mb-8">
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Power Ligaen • {SEASON_NAME}
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
            Spillerdatabase
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
        </header>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/65">Henter alle ligaspillere...</p>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              <p className="text-sm text-red-400">FEJL: {state.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background uppercase tracking-wider"
              >
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {state.status === "ok" && (
          <>
            {/* Søgefelt */}
            <div className="mb-8 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Søg efter kaldenavn, navn eller hold..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-orange-brand/20 bg-input px-5 py-3.5 text-sm font-semibold text-white placeholder-orange-soft/30 focus:border-orange-brand/65 focus:outline-none focus:ring-1 focus:ring-orange-brand/65 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-brand hover:text-orange-soft/60 transition-colors uppercase tracking-wider"
                  >
                    Nulstil
                  </button>
                )}
              </div>
            </div>

            {/* Filtreret resultatliste */}
            {(() => {
              const query = toLower(searchQuery).trim();
              const filteredPlayers = state.allPlayers.filter(
                (p) =>
                  toLower(p.nickname).includes(query) ||
                  toLower(p.name).includes(query) ||
                  toLower(p.teamName).includes(query)
              );

              const visiblePlayers = filteredPlayers.slice(0, displayCount);

              return (
                <section>
                  <div className="mb-6 flex justify-between items-end border-b border-orange-brand/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-orange-brand">
                      Resultater
                    </h3>
                    <span className="text-xs font-bold text-orange-soft/45 uppercase tracking-wide">
                      {filteredPlayers.length} spillere fundet
                    </span>
                  </div>

                  {visiblePlayers.length > 0 ? (
                    <>
                      {/* Spiller-Grid: Kalder nu det importerede globale PlayerCard */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
                        {visiblePlayers.map((player) => (
                          <PlayerCard
                            key={player.id}
                            nickname={player.nickname}
                            name={player.name}
                            image={player.image}
                            role={player.role}
                            age={player.age}
                            twitter={player.twitter}
                            teamName={player.teamName}
                            teamLogo={player.teamLogo}
                            division={player.division}
                          />
                        ))}
                      </div>

                      {/* Indlæs flere knap */}
                      {filteredPlayers.length > displayCount && (
                        <div className="mt-10 flex justify-center">
                          <button
                            onClick={() => setDisplayCount((prev) => prev + 20)}
                            className="rounded-full border border-orange-brand/30 bg-orange-brand/5 hover:bg-orange-brand hover:text-background px-8 py-3 text-xs font-black uppercase tracking-widest text-orange-brand transition-all duration-300"
                          >
                            Indlæs flere
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-orange-brand/10 bg-input/40 p-12 text-center">
                      <p className="text-sm font-bold text-orange-soft/45 uppercase tracking-widest">
                        Ingen spillere matcher din søgning
                      </p>
                    </div>
                  )}
                </section>
              );
            })()}
          </>
        )}
      </div>
    </main>
  );
}