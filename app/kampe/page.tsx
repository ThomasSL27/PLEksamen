// ============================================================
// Kampprogram: app/kampe/page.tsx (Next.js App Router)
// Viser alle kampe for den valgte sæson i et responsivt grid.
// Hvert kamp-kort linker til en detaljeside (/kampe/[id]).
// Inkluderer en sæson-filter dropdown til at skifte mellem sæsoner.
// "use client" er nødvendigt pga. useState, useEffect og events.
// ============================================================
"use client";
// useState styrer lokal state, useEffect kører side-effekter, useRef holder DOM-referencer
import { useEffect, useState, useRef } from "react";
// Link bruges til intern navigation — hurtigere end <a> da Next.js håndterer det klientsiden
import Link from "next/link";
// toLower er en hjælpefunktion til case-insensitiv sammenligning
import { toLower } from "@/lib/utils";

// ============================================================
// ChevronIcon: Lille pil-ikon brugt i dropdown-knappen
// ============================================================
function ChevronIcon({ className = "" }: { className?: string }) {
  // stroke="currentColor" arver tekstfarven fra det omgivende element
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      {/* Path beskriver en nedadgående pil */}
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ============================================================
// Konstanter
// ============================================================
// SEASON_ENDPOINT er parameteren der sendes til API'et for Sæson 31
const SEASON_ENDPOINT = "a/31";
// SEASON_NAME vises i sektionsoverskriften
const SEASON_NAME = "Sæson 31";
// GRUNDSPIL_MATCH bruges til at finde standard-sæsonen via navn-matching
const GRUNDSPIL_MATCH = "grundspil";

// ============================================================
// Typer: Beskriver API-datastrukturen for hold, kampe og sæsoner
// ============================================================
// Team beskriver ét hold med ID, navn og logo
interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

// Match beskriver én kamp med hold-ID'er og resultater
interface Match {
  _id: string;
  team1: string;        // Hold-ID (ikke objekt — slås op separat i teams-arrayet)
  team2: string;        // Hold-ID (ikke objekt — slås op separat i teams-arrayet)
  winnerId?: string;    // ID på det vindende hold (undefined hvis uafgjort/ikke spillet)
  status?: string;      // "finished" fra API
  state?: string;       // "complete" fra API
  team1Score?: number;  // Antal kort vundet af hold 1
  team2Score?: number;  // Antal kort vundet af hold 2
  streamUrl?: string;   // URL til live-stream
  startDate?: string;   // ISO-datostreng for kampens starttidspunkt
}

// Season beskriver én sæson med hold og kampe
interface Season {
  name: string;
  teams: Team[];
  matches: Match[];
}

// FetchState er en discriminated union: TypeScript garanterer at alle tilstande håndteres
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      seasons: Season[];
      selectedSeason: Season; // Den aktuelle sæson der vises
    };

// ============================================================
// MatchRow: Viser én kamp som et klikbart kort
// teams-arrayet bruges til at slå holdnavne og logoer op fra ID
// ============================================================
function MatchRow({ match, teams }: { match: Match; teams: Team[] }) {
  // Finder hold 1 ved at matche match.team1 (et ID) med _id i teams-arrayet
  const t1 = teams.find((t) => t._id === match.team1);
  // Finder hold 2 på samme måde
  const t2 = teams.find((t) => t._id === match.team2);

  // Springer over og returnerer null hvis et af holdene ikke kan findes i arrayet
  if (!t1 || !t2) return null;

  // Bestemmer om hold 1 har vundet ved at sammenligne winnerId med holdets ID
  const isT1Winner = match.winnerId === t1._id;
  // Bestemmer om hold 2 har vundet
  const isT2Winner = match.winnerId === t2._id;

  return (
    // Hele kortet er et Link — klik navigerer til kampdetaljsiden med matchets unikke ID
    <Link href={`/kampe/${match._id}`} className="block">
      {/* group-klassen aktiverer group-hover effekter på child-elementer */}
      <div className="group overflow-hidden rounded-xl border border-orange-brand/10 bg-card p-5 transition-all duration-300 hover:border-orange-brand/40 hover:bg-card-hover cursor-pointer">
        {/* Tre-kolonne layout: Hold 1 | Score | Hold 2 */}
        <div className="flex items-center justify-between gap-4 text-center">

          {/* Hold 1 — logoet skaleres op ved hover med group-hover:scale-110 */}
          <div className="flex flex-1 flex-col items-center">
            <div
              className={`relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${
                // Vinderens logo får orange glow-skygge — taberens er dæmpet
                isT1Winner ? "drop-shadow-[0_0_12px_rgba(var(--brand-orange-rgb),0.6)]" : "opacity-80 group-hover:opacity-100"
              }`}
            >
              {/* Hold 1's logo */}
              <img src={t1.logoUrl} alt={t1.name} className="h-full w-full object-contain" />
            </div>
            {/* Holdets kortnavn — orange tekst for vinderen, hvid for taberen */}
            <span
              className={`text-xs sm:text-sm font-black uppercase truncate w-full transition-colors duration-300 ${
                isT1Winner ? "text-orange-brand" : "text-white"
              }`}
            >
              {/* shortName er det korte holdnavn, fx "Tricked" */}
              {t1.shortName}
            </span>
          </div>

          {/* Score og status i midten */}
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-2">
              {/* Hold 1's score — orange tekst hvis de har vundet */}
              <span className={`text-2xl font-black tracking-tight ${isT1Winner ? "text-orange-brand" : "text-white"}`}>
                {/* ?? 0 giver 0 som fallback hvis score mangler */}
                {match.team1Score ?? 0}
              </span>
              {/* Bindestreg mellem de to scores */}
              <span className="text-orange-brand/40 text-lg font-black">-</span>
              {/* Hold 2's score */}
              <span className={`text-2xl font-black tracking-tight ${isT2Winner ? "text-orange-brand" : "text-white"}`}>
                {match.team2Score ?? 0}
              </span>
            </div>
            {/* Status-badge: "Slut" hvis kampen er færdig, ellers "LIVE" */}
            <span className="mt-1 rounded-full bg-orange-brand/10 px-2 py-0.5 text-2xs font-black uppercase tracking-widest text-orange-brand">
              {/* Kampen er slut hvis state er "complete" ELLER status er "finished" */}
              {match.state === "complete" || match.status === "finished" ? "Slut" : "LIVE"}
            </span>
          </div>

          {/* Hold 2 — spejlvendt layout af hold 1 */}
          <div className="flex flex-1 flex-col items-center">
            <div
              className={`relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${
                isT2Winner ? "drop-shadow-[0_0_12px_rgba(var(--brand-orange-rgb),0.6)]" : "opacity-80 group-hover:opacity-100"
              }`}
            >
              {/* Hold 2's logo */}
              <img src={t2.logoUrl} alt={t2.name} className="h-full w-full object-contain" />
            </div>
            <span
              className={`text-xs sm:text-sm font-black uppercase truncate w-full transition-colors duration-300 ${
                isT2Winner ? "text-orange-brand" : "text-white"
              }`}
            >
              {t2.shortName}
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
}

// ============================================================
// SeasonFilter: Dropdown til at skifte mellem sæsoner
// Lukker automatisk ved klik udenfor dropdown-elementet
// ============================================================
function SeasonFilter({
  seasons,
  selectedSeason,
  onSelectSeason,
}: {
  seasons: Season[];
  selectedSeason: Season;
  onSelectSeason: (season: Season) => void;
}) {
  // isOpen styrer om dropdown-listen er synlig
  const [isOpen, setIsOpen] = useState(false);
  // dropdownRef bruges til at detektere klik udenfor dropdown-elementet
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // Klik-udenfor detektion: Lukker dropdown ved klik andre steder
  // ============================================================
  useEffect(() => {
    // handleClickOutside modtager mus-event og tjekker om klikket er udenfor
    const handleClickOutside = (event: MouseEvent) => {
      // Tjekker om elementet eksisterer og klikket er UDEN for det
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Lukker dropdown
        setIsOpen(false);
      }
    };

    // Tilslutter listener til hele dokumentet — mousedown sker før click-event
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup: Fjerner event listener når komponenten unmountes for at undgå memory leaks
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Tomt array: kører kun ved mount og unmount

  return (
    // dropdownRef er sat på den ydre container
    <div ref={dropdownRef} className="relative inline-block">
      {/* Filter-knap — toggler isOpen ved klik */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-orange-brand/30 bg-gradient-to-r from-orange-brand/10 to-transparent px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-orange-soft transition-all hover:border-orange-brand/50 hover:bg-orange-brand/15 sm:px-5 sm:py-3"
      >
        {/* "FILTER" label i orange */}
        <span className="text-label text-orange-brand sm:text-xs">FILTER</span>
        {/* ChevronIcon: rotate-180 CSS-klassen roterer pilen 180° når dropdown er åben */}
        <ChevronIcon
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown-panel vises kun når isOpen er true */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-orange-brand/30 bg-surface shadow-2xl">
          {/* max-h-96 med overflow-y-auto tillader scrolling hvis mange sæsoner */}
          <div className="max-h-96 overflow-y-auto">
            {/* Renderers én knap for hver sæson i seasons-arrayet */}
            {seasons.map((season, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // Kalder callback med den valgte sæson
                  onSelectSeason(season);
                  // Lukker dropdown efter valg
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-3 text-left text-sm transition-all ${
                  // Aktiv sæson: Orange kant, fremhævet baggrund, hvid tekst
                  selectedSeason.name === season.name
                    ? "border-l-2 border-orange-brand bg-orange-brand/10 font-bold text-white"
                    // Inaktiv sæson: Gennemsigtig kant og dæmpet tekst
                    : "border-l-2 border-transparent text-orange-soft/70 hover:bg-card hover:text-orange-soft"
                }`}
              >
                {/* Sæsonens navn, fx "Sæson 31 Grundspil" */}
                {season.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// KampePage: Hoved-sidkomponent
// ============================================================
export default function KampePage() {
  // state styrer sidens tilstand: starter som "loading"
  const [state, setState] = useState<FetchState>({ status: "loading" });

  // ============================================================
  // Datahentning: Henter alle sæsoner og kampe fra API'et
  // ============================================================
  useEffect(() => {
    // Definerer async funktion inde i useEffect da useEffect ikke kan være async direkte
    async function fetchData() {
      try {
        // Kalder den interne API-route med Sæson 31 endpoint
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        // Hvis svaret ikke er OK kastes en fejl
        if (!res.ok) {
          // Forsøger at læse fejlbeskeden som JSON — {} som fallback
          const errorData = await res.json().catch(() => ({}));
          // Kaster fejl med API'ets besked eller generisk tekst
          throw new Error(errorData?.error || `API fejl: ${res.status} ${res.statusText}`);
        }

        // Parser successvaret som JSON
        const json = await res.json();
        // Udtrækker data-arrayet med alle sæsoner
        const seasons: Season[] = json.data;

        // Validerer at data er et array
        if (!Array.isArray(seasons)) throw new Error("Ugyldigt svar fra API");

        // Finder Grundspillet som standard-sæson via case-insensitiv navn-matching
        const grundspil = seasons.find((s: any) =>
          toLower(s.name).includes(GRUNDSPIL_MATCH)
        );

        // Kaster fejl hvis Grundspillet ikke er fundet eller har ingen hold/kampe
        if (!grundspil?.teams?.length || !grundspil?.matches?.length) {
          throw new Error("Fandt ikke kampe for Grundsspillet i Sæson 31");
        }

        // Opdaterer state med alle sæsoner og Grundspillet som standard-valg
        setState({ status: "ok", seasons, selectedSeason: grundspil });
      } catch (e: unknown) {
        // Sætter state til "error" med fejlbeskeden
        setState({
          status: "error",
          // instanceof Error checker om e er et Error-objekt
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    // Starter datahentningen
    fetchData();
  }, []); // Tomt array: kører kun én gang ved første render

  // Skifter den valgte sæson uden at genindlæse alle data fra API'et
  const handleSeasonChange = (newSeason: Season) => {
    // Kun muligt at skifte sæson hvis data allerede er hentet
    if (state.status === "ok") {
      // Beholder state.seasons men opdaterer selectedSeason
      setState({
        status: "ok",
        seasons: state.seasons,
        selectedSeason: newSeason,
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Dekorative glow-cirkler — pointer-events-none gør dem ikke-klikbare */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Stor orange cirkel øverst til højre */}
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.04] blur-3xl" />
        {/* Mindre orange cirkel nederst til venstre */}
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      {/* Indholds-wrapper: max-w-7xl begrænser bredden */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">

        {/* Sektionsoverskrift med filter til højre */}
        <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            {/* Sektionsmærkat */}
            <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
              Power Ligaen • {SEASON_NAME}
            </p>
            {/* Primær H1 overskrift */}
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
              Kampprogram
            </h1>
            {/* Dekorativ orange understregslinje */}
            <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
          </div>

          {/* SeasonFilter vises kun når data er hentet succesfuldt */}
          {state.status === "ok" && (
            <SeasonFilter
              seasons={state.seasons}
              selectedSeason={state.selectedSeason}
              onSelectSeason={handleSeasonChange}
            />
          )}
        </header>

        {/* Loading-tilstand: Spinner og beskedtekst */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              {/* animate-spin roterer border-t-orange-brand for at skabe spinner-effekten */}
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/60">Henter kampe for {SEASON_NAME}…</p>
            </div>
          </div>
        )}

        {/* Fejl-tilstand: Vises ved API-fejl */}
        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              {/* Viser den specifikke fejlbesked fra state */}
              <p className="text-sm text-red-400">{state.message}</p>
              {/* window.location.reload() genindlæser hele siden */}
              <button onClick={() => window.location.reload()} className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background">
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {/* Succes-tilstand: Viser kamp-grid */}
        {state.status === "ok" && state.selectedSeason && (
          <section>
            {/* Sæsonnavnet og antal kampe i overskriften */}
            <h2 className="mb-6 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
              {state.selectedSeason.name}{" "}
              {/* Antal kampe i parenteser — || 0 som fallback hvis matches er undefined */}
              <span className="font-medium normal-case text-orange-soft/40">
                ({state.selectedSeason.matches?.length || 0} kampe)
              </span>
            </h2>
            {/* Responsivt grid: 1 kolonne på mobil, 2 på tablet, 3 på desktop */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Tjekker at matches eksisterer og ikke er tomt */}
              {state.selectedSeason.matches && state.selectedSeason.matches.length > 0 ? (
                // Renderers én MatchRow for hver kamp i sæsonen
                state.selectedSeason.matches.map((match) => (
                  <MatchRow
                    // key er matchets unikke ID fra MongoDB
                    key={match._id}
                    match={match}
                    // Sender sæsonens hold-array med så MatchRow kan slå navne op
                    teams={state.selectedSeason.teams}
                  />
                ))
              ) : (
                // Tom-tilstand: Vises hvis ingen kampe er fundet for sæsonen
                <div className="col-span-full rounded-lg border border-orange-brand/10 bg-card p-8 text-center">
                  <p className="text-sm text-orange-soft/40">
                    Ingen kampe fundet for denne ligaen
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
