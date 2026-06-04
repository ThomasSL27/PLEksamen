// ============================================================
// Spillerdatabase: app/spillere/page.tsx (Next.js App Router)
// Viser alle spillere på tværs af alle hold og divisioner.
// Inkluderer søgning og "Indlæs flere" pagination (20 ad gangen).
// "use client" er nødvendigt pga. useState, useEffect og events.
// ============================================================
"use client";

// useState styrer lokal state, useEffect kører side-effekter
import { useEffect, useState } from "react";
// PlayerCard er det genbrugelige spillerkort der vises i gridden
import PlayerCard from "@/components/PlayerCard";
// toLower er en hjælpefunktion til case-insensitiv sammenligning
import { toLower } from "@/lib/utils";

// ============================================================
// Typer: Beskriver en spiller i den interne repræsentation
// ============================================================
// PlayerData er den flade struktur vi bruger internt (ikke API-strukturen)
interface PlayerData {
  id: string;           // Unikt ID til React key
  nickname: string;
  name?: string;
  image?: string;
  role?: string;
  age?: number | string;
  twitter?: string;
  teamName: string;
  teamLogo: string;
  division: string;     // Sæsonens/divisionens navn, fx "Sæson 31 Grundspil"
}

// Season beskriver én sæson fra API'et med dens hold
interface Season {
  name: string;
  teams: any[]; // any[] fordi API-holdstrukturen kan variere
}

// ============================================================
// FetchState: Discriminated union type med tre mulige tilstande
// loading → ok (med allPlayers-array) eller error (med besked)
// ============================================================
type FetchState =
  | { status: "loading" }
  | { status: "ok"; allPlayers: PlayerData[] }
  | { status: "error"; message: string };

// ============================================================
// Konstanter: Endpoint og sæsonnavn
// ============================================================
// SEASON_ENDPOINT er parameteren der sendes til API'et
const SEASON_ENDPOINT = "a/31";
// SEASON_NAME vises i sektionsoverskriften
const SEASON_NAME = "Sæson 31";

// ============================================================
// mapAllPlayersFromSeasons: Konverterer API-sæsondata til et fladt PlayerData-array
// Itererer over alle sæsoner → alle hold → alle spillere
// ============================================================
function mapAllPlayersFromSeasons(seasons: Season[]): PlayerData[] {
  // playersList akkumulerer alle spillere
  const playersList: PlayerData[] = [];

  // Gennemgår alle sæsoner
  seasons.forEach((season) => {
    // Gemmer divisionens navn til brug på spillerkortene
    const divisionName = season.name;

    // Gennemgår alle hold i sæsonen
    season.teams?.forEach((team) => {
      // Henter spillerlisten — tomt array som fallback hvis lineups mangler
      const teamPlayers = team.lineups?.players || [];
      // Holdnavn med fallback
      const teamName = team.name || "Ukendt hold";
      // Logo-URL med tom fallback
      const teamLogo = team.logoUrl || "";

      // Gennemgår alle spillere i holdet
      teamPlayers.forEach((p: any, idx: number) => {
        // Tilføjer spilleren til listen
        playersList.push({
          // ID kombinerer steamid, nickname, holdnavn og index for garanteret unikhed
          id: `${p.steamid || p.nickname || p.name}-${teamName}-${idx}`,
          // ?? (nullish coalescing): nickname, så name, så fallback tekst
          nickname: p.nickname ?? p.name ?? "Ukendt",
          // Spillerens rigtige navn
          name: p.name,
          // Billede-URL — tom streng som fallback
          image: p.image || "",
          // Rolle, fx "IGL" eller "Rifler"
          role: p.role || "",
          // Alder — kan mangle
          age: p.age || "",
          // Twitter kan ligge i p.twitter eller p.social.twitter afhængig af API-version
          twitter: p.twitter || p.social?.twitter || "",
          // Holdoplysninger gemmes på spilleren til brug på kortet
          teamName: teamName,
          teamLogo: teamLogo,
          division: divisionName,
        });
      });
    });
  });

  // Returnerer det samlede array med alle spillere
  return playersList;
}

// ============================================================
// SpillerePage: Selve spillerdatabasesidens komponent
// ============================================================
export default function SpillerePage() {
  // state styrer loading/ok/error og indeholder spillerlisten
  const [state, setState] = useState<FetchState>({ status: "loading" });
  // searchQuery holder søgeteksten fra inputfeltet
  const [searchQuery, setSearchQuery] = useState("");
  // displayCount styrer hvor mange spillere der vises (pagination — starter på 20)
  const [displayCount, setDisplayCount] = useState(20);

  // ============================================================
  // Datahentning: Henter alle spillere fra API'et ved sideindlæsning
  // ============================================================
  useEffect(() => {
    // Definerer async funktion inde i useEffect
    async function loadPlayers() {
      try {
        // Kalder den interne API-route med Sæson 31 endpoint
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        // Kaster fejl hvis svaret ikke er OK
        if (!res.ok) {
          // Forsøger at læse fejlbeskeden som JSON
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            // Bruger API'ets fejlbesked eller generisk tekst
            errorData?.error || `API fejl: ${res.status} ${res.statusText}`
          );
        }

        // Parser successvaret som JSON
        const json = await res.json();
        // Udtrækker sæson-arrayet
        const seasonsList: Season[] = json.data;

        // Validerer at data er et array
        if (!Array.isArray(seasonsList)) {
          throw new Error("Ugyldigt data-respons fra systemets API");
        }

        // Konverterer alle sæsoner til et enkelt fladt array af spillere
        const mapped = mapAllPlayersFromSeasons(seasonsList);

        // Sorterer spillerne alfabetisk efter kaldenavn med dansk locale
        mapped.sort((a, b) => a.nickname.localeCompare(b.nickname, "da"));

        // Opdaterer state til "ok" med det sorterede spillerarray
        setState({
          status: "ok",
          allPlayers: mapped,
        });
      } catch (e: unknown) {
        // Sætter state til "error" med fejlbeskeden
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    // Starter datahentningen
    loadPlayers();
  }, []); // Tomt array: kører kun én gang ved første render

  // Opdaterer søgningen og nulstiller pagination til 20 ved ny søgning
  const handleSearchChange = (val: string) => {
    // Gemmer den nye søgestreng
    setSearchQuery(val);
    // Nulstiller til 20 resultater så man starter forfra ved ny søgning
    setDisplayCount(20);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Dekorative glow-cirkler — pointer-events-none gør dem ikke-klikbare */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Stor orange cirkel øverst til højre */}
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
        {/* Mindre orange cirkel nederst til venstre */}
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      {/* Indholds-wrapper: max-w-7xl begrænser bredden */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">

        {/* Sektionsoverskrift */}
        <header className="mb-8">
          {/* Sektionsmærkat i lille orange tekst */}
          <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Power Ligaen • {SEASON_NAME}
          </p>
          {/* Primær H1 overskrift */}
          <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
            Spillerdatabase
          </h1>
          {/* Dekorativ orange understregslinje */}
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
        </header>

        {/* Loading-tilstand: Spinner og tekst mens data hentes */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              {/* animate-spin roterer border-t-orange-brand */}
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/65">Henter alle ligaspillere...</p>
            </div>
          </div>
        )}

        {/* Fejl-tilstand: Vises ved API-fejl */}
        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              {/* Viser fejlbeskeden fra state */}
              <p className="text-sm text-red-400">FEJL: {state.message}</p>
              {/* window.location.reload() genindlæser hele siden */}
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background uppercase tracking-wider"
              >
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {/* Succes-tilstand: Viser søgefelt og spillergrid */}
        {state.status === "ok" && (
          <>
            {/* Søgefelt */}
            <div className="mb-8 max-w-md">
              <div className="relative">
                {/* Søgeinput: value/onChange styrer to-vejs binding med searchQuery state */}
                <input
                  type="text"
                  placeholder="Søg efter kaldenavn, navn eller hold..."
                  value={searchQuery}
                  // Kalder handleSearchChange med den nye søgeværdi ved hvert tastetryk
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-orange-brand/20 bg-input px-5 py-3.5 text-sm font-semibold text-white placeholder-orange-soft/30 focus:border-orange-brand/65 focus:outline-none focus:ring-1 focus:ring-orange-brand/65 transition-all duration-300"
                />
                {/* Nulstil-knap: Vises kun når søgefeltet har indhold (searchQuery er ikke tomt) */}
                {searchQuery && (
                  <button
                    // Nulstiller søgningen ved at sætte tom streng
                    onClick={() => handleSearchChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-brand hover:text-orange-soft/60 transition-colors uppercase tracking-wider"
                  >
                    Nulstil
                  </button>
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* Filtreringsdel: IIFE (Immediately Invoked Function Expression)  */}
            {/* Bruges til at beregne filteredPlayers og visiblePlayers inline   */}
            {/* og rendere dem uden at definere ekstra state                    */}
            {/* ============================================================ */}
            {(() => {
              // toLower konverterer søgningen til lowercase og trim() fjerner whitespace
              const query = toLower(searchQuery).trim();
              // Filtrerer spillerlisten: Matcher søgningen mod kaldenavn, navn og holdnavn
              const filteredPlayers = state.allPlayers.filter(
                (p) =>
                  // includes() tjekker om søgeteksten er en del af feltet
                  toLower(p.nickname).includes(query) ||
                  toLower(p.name).includes(query) ||
                  toLower(p.teamName).includes(query)
              );

              // slice(0, displayCount) begrænser de synlige spillere til pagination-antallet
              const visiblePlayers = filteredPlayers.slice(0, displayCount);

              return (
                <section>
                  {/* Resultatoverskrift med antal fundne spillere */}
                  <div className="mb-6 flex justify-between items-end border-b border-orange-brand/10 pb-2">
                    {/* "Resultater" label til venstre */}
                    <h3 className="text-xs font-black uppercase tracking-widest text-orange-brand">
                      Resultater
                    </h3>
                    {/* Antal spillere der matcher søgningen til højre */}
                    <span className="text-xs font-bold text-orange-soft/45 uppercase tracking-wide">
                      {filteredPlayers.length} spillere fundet
                    </span>
                  </div>

                  {/* Tjekker at der er spillere at vise */}
                  {visiblePlayers.length > 0 ? (
                    <>
                      {/* Responsivt grid: 2 kolonner på mobil, op til 5 på desktop */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
                        {/* Renderers ét PlayerCard for hver synlig spiller */}
                        {visiblePlayers.map((player) => (
                          <PlayerCard
                            // player.id er det unikke ID vi beregnede i mapAllPlayersFromSeasons
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

                      {/* "Indlæs flere" knap — vises kun hvis der er flere spillere end displayCount */}
                      {filteredPlayers.length > displayCount && (
                        <div className="mt-10 flex justify-center">
                          <button
                            // prev => prev + 20 tilføjer 20 til den nuværende displayCount
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
