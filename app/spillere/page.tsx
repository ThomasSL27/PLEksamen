// ============================================================
// Spillerdatabase: app/spillere/page.tsx (Next.js App Router)
// Viser alle spillere på tværs af alle hold og divisioner.
// Inkluderer søgning og "Indlæs flere" pagination (20 ad gangen).
// "use client" er nødvendigt pga. useState, useEffect og events.
// ============================================================
"use client";

import { useEffect, useState } from "react";
// PlayerCard er det genbrugelige spillerkort der vises i griddet
import PlayerCard from "@/components/PlayerCard";
// toLower er en hjælpefunktion til case-insensitiv sammenligning
import { toLower } from "@/lib/utils";

// ============================================================
// Typer: Beskriver en spiller i den interne repræsentation
// ============================================================
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
  division: string; // Sæsonens/divisionens navn
}

// Beskriver en sæson fra API'et
interface Season {
  name: string;
  teams: any[]; // any[] bruges da API-strukturen kan variere
}

// ============================================================
// FetchState: Discriminated union type til at håndtere de tre tilstande
// loading → ok eller error
// ============================================================
type FetchState =
  | { status: "loading" }
  | { status: "ok"; allPlayers: PlayerData[] }
  | { status: "error"; message: string };

// ============================================================
// Konstanter: Endpoint og sæsonnavn
// ============================================================
const SEASON_ENDPOINT = "a/31"; // Bruges i API-URL: /api/powerstats?type=a/31
const SEASON_NAME = "Sæson 31";

// ============================================================
// mapAllPlayersFromSeasons: Konverterer API-sæsondata til PlayerData-array
// Itererer over alle sæsoner → alle hold → alle spillere
// ============================================================
function mapAllPlayersFromSeasons(seasons: Season[]): PlayerData[] {
  const playersList: PlayerData[] = [];

  seasons.forEach((season) => {
    const divisionName = season.name; // Bruges som "division" på kortet

    season.teams?.forEach((team) => {
      const teamPlayers = team.lineups?.players || []; // Tomt array som fallback
      const teamName = team.name || "Ukendt hold";
      const teamLogo = team.logoUrl || "";

      teamPlayers.forEach((p: any, idx: number) => {
        playersList.push({
          // ID kombinerer steamid, nickname, holdnavn og index for unikhed
          id: `${p.steamid || p.nickname || p.name}-${teamName}-${idx}`,
          nickname: p.nickname ?? p.name ?? "Ukendt",
          name: p.name,
          image: p.image || "",
          role: p.role || "",
          age: p.age || "",
          // Twitter kan ligge i p.twitter eller p.social.twitter
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

// ============================================================
// SpillerePage: Selve spillerdatabasesidens komponent
// ============================================================
export default function SpillerePage() {
  // state styrer loading/ok/error tilstanden og data
  const [state, setState] = useState<FetchState>({ status: "loading" });
  // searchQuery holder søgeteksten fra inputfeltet
  const [searchQuery, setSearchQuery] = useState("");
  // displayCount styrer hvor mange spillere der vises (pagination)
  const [displayCount, setDisplayCount] = useState(20);

  // ============================================================
  // Datahentning: Henter alle spillere fra API'et ved sideindlæsning
  // ============================================================
  useEffect(() => {
    async function loadPlayers() {
      try {
        // Kalder vores interne API-route med Sæson 31 endpoint
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        if (!res.ok) {
          // Forsøger at læse fejlbeskeden fra API'et
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData?.error || `API fejl: ${res.status} ${res.statusText}`
          );
        }

        const json = await res.json();
        const seasonsList: Season[] = json.data;

        // Validerer at data er et array
        if (!Array.isArray(seasonsList)) {
          throw new Error("Ugyldigt data-respons fra systemets API");
        }

        // Konverterer alle sæsoner til et fladt array af spillere
        const mapped = mapAllPlayersFromSeasons(seasonsList);

        // Sorterer spillerne alfabetisk efter kaldenavn (dansk locale)
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
  }, []); // Tomt array: kører kun én gang ved første render

  // Nulstiller pagination når søgningen ændres
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setDisplayCount(20); // Start forfra med 20 resultater ved ny søgning
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Dekorative subtile glow-cirkler i baggrunden */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">

        {/* Sektionsoverskrift */}
        <header className="mb-8">
          <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Power Ligaen • {SEASON_NAME}
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
            Spillerdatabase
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
        </header>

        {/* ============================================================ */}
        {/* Loading-tilstand: Spinner mens data hentes                    */}
        {/* ============================================================ */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/65">Henter alle ligaspillere...</p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* Fejl-tilstand: Vises hvis API-kald fejler                     */}
        {/* ============================================================ */}
        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              <p className="text-sm text-red-400">FEJL: {state.message}</p>
              {/* Prøv igen-knap genindlæser siden */}
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background uppercase tracking-wider"
              >
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* Succes-tilstand: Viser søgefelt og spillergrid               */}
        {/* ============================================================ */}
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
                {/* Nulstil-knap vises kun når søgefeltet har indhold */}
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

            {/* ============================================================ */}
            {/* Filtreringsdel: Bruger IIFE (Immediately Invoked Function)    */}
            {/* til at beregne filteredPlayers og visiblePlayers inline       */}
            {/* ============================================================ */}
            {(() => {
              // Konverterer søgningen til lowercase til case-insensitiv matching
              const query = toLower(searchQuery).trim();
              // Filtrerer spillere baseret på kaldenavn, navn og holdnavn
              const filteredPlayers = state.allPlayers.filter(
                (p) =>
                  toLower(p.nickname).includes(query) ||
                  toLower(p.name).includes(query) ||
                  toLower(p.teamName).includes(query)
              );

              // Begrænser de synlige spillere til displayCount (pagination)
              const visiblePlayers = filteredPlayers.slice(0, displayCount);

              return (
                <section>
                  {/* Resultatoverskrift med antal fundne spillere */}
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
                      {/* Spiller-Grid: Responsivt grid fra 2 til 5 kolonner */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
                        {visiblePlayers.map((player) => (
                          // Renderer et PlayerCard for hver spiller
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

                      {/* "Indlæs flere" knap — vises kun hvis der er flere spillere */}
                      {filteredPlayers.length > displayCount && (
                        <div className="mt-10 flex justify-center">
                          <button
                            // Tilføjer 20 til displayCount ved klik
                            onClick={() => setDisplayCount((prev) => prev + 20)}
                            className="rounded-full border border-orange-brand/30 bg-orange-brand/5 hover:bg-orange-brand hover:text-background px-8 py-3 text-xs font-black uppercase tracking-widest text-orange-brand transition-all duration-300"
                          >
                            Indlæs flere
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // Tom-tilstand: Vises når ingen spillere matcher søgningen
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
