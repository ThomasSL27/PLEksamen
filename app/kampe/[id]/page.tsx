// ============================================================
// Kampdetaljer: app/kampe/[id]/page.tsx (Next.js App Router)
// Dynamisk route — [id] i mappenavnet er et URL-parameter.
// Viser detaljeret info om én specifik kamp: score, hold, veto,
// maps (med billeder og demo-links) og player lineups.
// "use client" er nødvendigt pga. useState, useEffect og useRouter.
// ============================================================
"use client";
// useState styrer lokal state, useEffect kører side-effekter, use udpakker Promise-params
import { useEffect, useState, use } from "react";
// useRouter bruges til at navigere tilbage til forrige side
import { useRouter } from "next/navigation";
// Link bruges til intern navigation til kampprogram-oversigten
import Link from "next/link";

// ============================================================
// Konstanter
// ============================================================
// SEASON_ENDPOINT er parameteren der sendes til API'et for Sæson 31
const SEASON_ENDPOINT = "a/31";

// ============================================================
// Hjælpefunktioner
// ============================================================

// formatDate: Konverterer ISO-datostreng til dansk format, fx "14. jun 2025, 19:00"
const formatDate = (dateString?: string) => {
  // Returnerer tom streng hvis ingen dato er angivet
  if (!dateString) return "";
  // Opretter et Date-objekt og formaterer det med dansk locale
  return new Date(dateString).toLocaleDateString("da-DK", {
    day: "numeric",    // Dagnummer, fx "14"
    month: "short",    // Månedsforkortelse, fx "jun"
    year: "numeric",   // Årstal med 4 cifre
    hour: "2-digit",   // Time med 2 cifre, fx "19"
    minute: "2-digit", // Minut med 2 cifre, fx "00"
  });
};

// getVetoTypeLabel: Oversætter API's veto-type til dansk label
const getVetoTypeLabel = (type: string) => {
  // Record<string, string> er et objekt med string-nøgler og string-værdier
  const labels: Record<string, string> = {
    pickBanTeam: "Starthold", // Holdet der startede veto-processen
    ban: "Ban",               // Hold bannede en bane
    pick: "Pick",             // Hold valgte en bane
  };
  // Returnerer den oversatte label — falder tilbage på den originale type hvis ukendt
  return labels[type] || type;
};

// getMapImageUrl: Returnerer stien til et bane-billede i .webp-format
// Billederne ligger i /public/maps/ og navngives med mapnavn i lowercase
const getMapImageUrl = (mapName: string) => {
  // Returnerer default-billedet hvis mapName er tomt
  if (!mapName) return "/maps/default.webp";
  // trim() fjerner whitespace, toLowerCase() gør det til lowercase til filnavnet
  const formattedName = mapName.trim().toLowerCase();
  // Bygger filstien: /maps/ + mapnavn + .webp
  return `/maps/${formattedName}.webp`;
};

// ============================================================
// Typer: Beskriver API-datastrukturen for en kamp og dens dele
// ============================================================
// Team beskriver ét hold med ID, navn og logo
interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

// MapData beskriver én bane i kampen med score og demo-links
interface MapData {
  map: string;              // Banens navn, fx "Dust2"
  demos?: string[];         // URL'er til demo-filer (tom array hvis bane ikke er spillet)
  team1Score?: number;      // Runder vundet af hold 1
  team2Score?: number;      // Runder vundet af hold 2
}

// Player beskriver én spiller i en lineup
interface Player {
  _id: string;
  nickname: string;
  name?: string;
  avatar?: string;
}

// Veto beskriver én handling i veto-processen (ban, pick eller starthold)
interface Veto {
  type: string;             // "ban", "pick" eller "pickBanTeam"
  teamId: string;           // ID på det hold der foretog handlingen
  side?: string;            // Hvilken side holdet starter på
  time: string;             // Tidspunktet for handlingen
  _id: string;              // Unikt ID for handlingen
  map?: string;             // Kortnavn for den valgte/bannede bane
}

// Match beskriver en hel kamp med alle tilhørende data
interface Match {
  _id: string;
  team1: string;            // Hold-ID (ikke objekt — slås op separat)
  team2: string;            // Hold-ID (ikke objekt — slås op separat)
  winnerId?: string;        // ID på det vindende hold
  state?: string;           // "complete" fra API
  status?: string;          // "finished" fra API
  team1Score?: number;      // Antal kort vundet af hold 1
  team2Score?: number;      // Antal kort vundet af hold 2
  startDate?: string;       // ISO-datostreng for kampens start
  streamUrl?: string;       // URL til live-stream
  maps?: MapData[];         // Alle baner i kampen
  veto?: Veto[];            // Veto-rækkefølge med bans og picks
  lineups?: {
    team1?: Player[];       // Hold 1's spillerliste
    team2?: Player[];       // Hold 2's spillerliste
  };
}

// LeagueData beskriver én sæson med hold og kampe
interface LeagueData {
  name: string;
  teams: Team[];
  matches: Match[];
}

// FetchState er en discriminated union med tre mulige tilstande
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; match: Match; teams: Team[]; leagueName: string };

// ============================================================
// VetoSection: Viser veto-rækkefølgen med farvekodet type
// Grøn = pick, rød = ban, blå = starthold (pickBanTeam)
// ============================================================
function VetoSection({ veto, teams }: { veto: Veto[]; teams: Team[] }) {
  return (
    <div className="space-y-3">
      {/* Itererer over hvert veto-trin med index */}
      {veto.map((action, idx) => {
        // Slår holdet op via teamId for at vise holdnavnet
        const team = teams.find((t) => t._id === action.teamId);
        // Tilføjer et mellemrum foran kortnavn hvis det er en pick/ban af en bane
        const mapText = action.map ? ` ${action.map}` : "";
        return (
          <div key={action._id || idx} className="flex items-start gap-3">
            {/* Nummeret på handlingen i rækkefølgen — idx + 1 fordi idx starter på 0 */}
            <span className="font-bold text-orange-brand text-sm flex-shrink-0 w-6">
              {idx + 1}.
            </span>
            <p className="text-sm text-white">
              {/* Holdets kortnavn i fed hvid tekst */}
              <span className="font-bold">{team?.shortName || team?.name}</span>{" "}
              {/* Type farvekodet baseret på veto-handlingen */}
              <span
                className={`font-semibold ${
                  action.type === "ban"
                    ? "text-red-400"    // Ban er rød
                    : action.type === "pick"
                    ? "text-green-400"  // Pick er grøn
                    : "text-blue-400"   // pickBanTeam (starthold) er blå
                }`}
              >
                {/* toLowerCase() gør typen til lille bogstaver */}
                {getVetoTypeLabel(action.type).toLowerCase()}
              </span>
              {/* Kortnavn for den valgte/bannede bane — tomt hvis ingen bane */}
              <span className="text-orange-soft/70">{mapText}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// LineupSection: Viser spillerlisten for ét hold
// ============================================================
function LineupSection({
  lineup,
  teamName,
}: {
  lineup: Player[];
  teamName: string;
}) {
  return (
    <div className="space-y-3">
      {/* Holdnavn som overskrift over spillerlisten */}
      <h4 className="text-sm font-bold text-white uppercase">{teamName}</h4>
      {/* 2-kolonne grid med spillerkort */}
      <div className="grid grid-cols-2 gap-2">
        {/* Renderers ét spillerkort for hver spiller i lineup-arrayet */}
        {lineup.map((player) => (
          <div
            // Bruger spillerens unikke ID som key
            key={player._id}
            className="rounded-lg border border-orange-brand/10 bg-card p-3"
          >
            {/* Spillernavn i fed hvid skrift */}
            <p className="text-xs font-bold text-white">{player.nickname}</p>
            {/* Spillerens rigtige navn vises kun hvis det er tilgængeligt */}
            {player.name && (
              <p className="text-label text-orange-soft/50">{player.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MatchDetailPage: Hoved-sidkomponent
// params er et Promise i Next.js App Router — udpakkes med use()
// ============================================================
export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // useRouter giver adgang til Next.js navigationsmetoder
  const router = useRouter();
  // use() er en React-hook der udpakker Promise-baserede props (Next.js 15)
  const { id } = use(params);
  // state styrer sidens tilstand: starter som "loading"
  const [state, setState] = useState<FetchState>({ status: "loading" });

  // ============================================================
  // Datahentning: Henter alle sæsoner og finder kampen med det givne ID
  // ============================================================
  useEffect(() => {
    // Definerer async funktion inde i useEffect
    async function fetchData() {
      try {
        // Kalder den interne API-route med Sæson 31 endpoint
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        // Kaster fejl hvis svaret ikke er OK
        if (!res.ok) {
          // Forsøger at læse fejlbeskeden som JSON
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || `API fejl: ${res.status} ${res.statusText}`);
        }

        // Parser successvaret som JSON
        const json = await res.json();
        // Udtrækker sæson-arrayet
        const seasons: LeagueData[] = json.data;

        // Validerer at data er et array
        if (!Array.isArray(seasons)) {
          throw new Error("Ugyldigt svar fra API");
        }

        // foundMatch og foundLeague er undefined indtil kampen er fundet
        let foundMatch: Match | undefined;
        let foundLeague: LeagueData | undefined;

        // Søger alle sæsoner igennem for at finde kampen med det givne URL-parameter id
        for (const season of seasons) {
          // find() søger i sæsonens matches-array
          const match = season.matches?.find((m: Match) => m._id === id);
          if (match) {
            // Gemmer den fundne kamp og dens sæson
            foundMatch = match;
            foundLeague = season;
            break; // Stopper løkken så snart kampen er fundet
          }
        }

        // Kaster fejl hvis kampen ikke findes i nogen sæson
        if (!foundMatch || !foundLeague) {
          throw new Error("Kamp blev ikke fundet");
        }

        // Opdaterer state med den fundne kamp og dens hold
        setState({
          status: "ok",
          match: foundMatch,
          teams: foundLeague.teams,
          leagueName: foundLeague.name,
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
    fetchData();
  }, [id]); // [id] betyder: kør igen hvis URL-parametret id ændres

  // ============================================================
  // Afledte variabler: Beregnes fra state — kun meningsfyldte når state er "ok"
  // ============================================================
  // Finder hold 1's objekt fra teams-arrayet ved at matche ID
  const t1 = state.status === "ok" ? state.teams.find((t) => t._id === state.match.team1) : null;
  // Finder hold 2's objekt
  const t2 = state.status === "ok" ? state.teams.find((t) => t._id === state.match.team2) : null;
  // isT1Winner er true hvis kampens winnerId matcher hold 1's ID
  const isT1Winner = state.status === "ok" ? state.match.winnerId === t1?._id : false;
  // isT2Winner er true hvis kampens winnerId matcher hold 2's ID
  const isT2Winner = state.status === "ok" ? state.match.winnerId === t2?._id : false;
  // isComplete er true hvis kampen er afsluttet (state "complete" ELLER status "finished")
  const isComplete = state.status === "ok" ? (state.match.state === "complete" || state.match.status === "finished") : false;

  return (
    <main className="min-h-screen bg-background">
      {/* Dekorative glow-cirkler — pointer-events-none gør dem ikke-klikbare */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      {/* Indholds-wrapper: max-w-4xl begrænser bredden til et smalere layout */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">

        {/* Side-header med tilbage-link */}
        <header className="mb-8">
          {/* Link til kampprogram-oversigten — venstre pil som tekstsymbol */}
          <Link
            href="/kampe"
            className="inline-flex items-center gap-2 text-orange-brand hover:text-orange-soft transition-colors mb-4 text-sm font-bold"
          >
            <span>←</span> Tilbage til kampprogram
          </Link>
          {/* Sektionsmærkat */}
          <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Power Ligaen
          </p>
          {/* Primær H1 overskrift */}
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl">
            Kampdetaljer
          </h1>
          {/* Dekorativ orange understregslinje */}
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
        </header>

        {/* Loading-tilstand: Spinner og tekst */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              {/* animate-spin roterer border-t-orange-brand */}
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/60">Henter kampdetaljler...</p>
            </div>
          </div>
        )}

        {/* Fejl-tilstand: Vises ved API-fejl */}
        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              {/* Viser fejlbeskeden fra state */}
              <p className="font-bold mb-2 text-red-400">FEJL: {state.message}</p>
              {/* router.back() navigerer til forrige side i browser-historikken */}
              <button
                onClick={() => router.back()}
                className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background"
              >
                Gå tilbage
              </button>
            </div>
          </div>
        )}

        {/* Succes-tilstand: Viser kampdetaljerne */}
        {/* && t1 && t2 sikrer at begge hold er fundet inden rendering */}
        {state.status === "ok" && state.match && t1 && t2 && (
          <section className="space-y-8">

            {/* ============================================================ */}
            {/* Match Hero: Score og holdlogoer i tre-kolonne layout          */}
            {/* ============================================================ */}
            <div className="relative overflow-visible p-2 sm:p-4">
              {/* Subtil glow-cirkel bag scoren — pointer-events-none gør den ikke-klikbar */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-brand opacity-[0.04] blur-[120px] pointer-events-none" />

              {/* Meta-info: Liganavn + kamp-status og dato */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-orange-brand/10 pb-5 mb-6 sm:mb-8">
                {/* Ligaens navn i lille orange tekst */}
                <span className="text-label sm:text-xs font-black uppercase tracking-widest text-orange-brand">
                  {state.leagueName}
                </span>

                <div className="flex items-center gap-3">
                  {/* Status-badge: "Afsluttet" med orange baggrund eller "LIVE" med grøn pulserende animation */}
                  <span
                    className={`text-2xs sm:text-label font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      // isComplete er true hvis kampen er færdig
                      isComplete
                        ? "bg-orange-brand/10 text-orange-brand border border-orange-brand/20"
                        // animate-pulse giver en pulserende animation for LIVE-badge
                        : "bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse"
                    }`}
                  >
                    {isComplete ? "Afsluttet" : "LIVE"}
                  </span>

                  {/* Kampens dato og tidspunkt — vises kun hvis startDate er sat */}
                  {state.match.startDate && (
                    <span className="text-caption font-bold text-orange-soft/60">
                      {/* formatDate konverterer ISO-dato til dansk format */}
                      {formatDate(state.match.startDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* ============================================================ */}
              {/* Hold + Score: Tre-kolonne layout (Hold 1 | Score | Hold 2)   */}
              {/* ============================================================ */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">

                {/* Hold 1: flex-1 giver det samme bredde som Hold 2 */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto">
                  <div
                    className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 flex items-center justify-center mb-4 transition-all duration-300 ${
                      // Vinderens logo har orange glow og er skaleret op
                      isT1Winner
                        ? "drop-shadow-[0_0_24px_rgba(var(--brand-orange-rgb),0.6)] scale-105"
                        // Taberens logo er dæmpet til 35% opacity hvis kampen er slut
                        : isComplete ? "opacity-35" : "opacity-95"
                    }`}
                  >
                    {/* Hold 1's logo */}
                    <img src={t1.logoUrl} alt={t1.name} className="h-full w-full object-contain" />
                  </div>
                  {/* Hold 1's navn — orange tekst for vinderen */}
                  <span
                    className={`text-xl sm:text-2xl font-black uppercase tracking-wide text-center transition-colors duration-300 ${
                      isT1Winner ? "text-orange-brand" : "text-white"
                    }`}
                  >
                    {t1.name}
                  </span>
                </div>

                {/* Score i midten */}
                <div className="flex flex-col items-center py-4 px-6 md:py-0">
                  {/* "RESULTAT" label over scoren */}
                  <span className="text-label font-bold uppercase tracking-widest text-orange-brand/40 mb-1">
                    RESULTAT
                  </span>
                  <div className="flex items-center gap-4">
                    {/* Hold 1's score — stor fed tekst, orange for vinderen */}
                    <span className={`text-4xl sm:text-5xl md:text-6xl font-black tabular-nums transition-colors duration-300 ${isT1Winner ? "text-orange-brand" : "text-white"}`}>
                      {/* ?? 0 giver 0 som fallback hvis score er undefined */}
                      {state.match.team1Score ?? 0}
                    </span>
                    {/* Bindestreg mellem de to scores */}
                    <span className="text-3xl sm:text-4xl font-black text-orange-brand/30 select-none">-</span>
                    {/* Hold 2's score */}
                    <span className={`text-4xl sm:text-5xl md:text-6xl font-black tabular-nums transition-colors duration-300 ${isT2Winner ? "text-orange-brand" : "text-white"}`}>
                      {state.match.team2Score ?? 0}
                    </span>
                  </div>
                </div>

                {/* Hold 2 — spejlvendt layout af Hold 1 */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto">
                  <div
                    className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 flex items-center justify-center mb-4 transition-all duration-300 ${
                      isT2Winner
                        ? "drop-shadow-[0_0_24px_rgba(var(--brand-orange-rgb),0.6)] scale-105"
                        : isComplete ? "opacity-35" : "opacity-95"
                    }`}
                  >
                    {/* Hold 2's logo */}
                    <img src={t2.logoUrl} alt={t2.name} className="h-full w-full object-contain" />
                  </div>
                  <span
                    className={`text-xl sm:text-2xl font-black uppercase tracking-wide text-center transition-colors duration-300 ${
                      isT2Winner ? "text-orange-brand" : "text-white"
                    }`}
                  >
                    {t2.name}
                  </span>
                </div>

              </div>

              {/* Vinder-display i bunden — vises kun hvis winnerId er registreret */}
              {state.match.winnerId && (
                <div className="relative z-10 mt-8 flex justify-center border-t border-orange-brand/5 pt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-soft bg-orange-brand/10 px-4 py-1.5 rounded-full border border-orange-brand/20">
                    <span>
                      {/* find() slår det vindende hold op via winnerId */}
                      {state.teams.find((t) => t._id === state.match.winnerId)?.name} vinder kampen
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* Live Match Overview: Placeholder-billede                      */}
            {/* ============================================================ */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-brand/15 shadow-2xl bg-gradient-to-b from-card to-background">
              {/* Placeholder-billede for Live Match Overview funktionalitet */}
              <img
                src="/placeholderTilKampOverview.png"
                alt="Live Kamp Overview"
                className="w-full h-auto object-cover opacity-90 block"
              />
              {/* Badge øverst til venstre over billedet */}
              <div className="absolute top-4 left-4 rounded-full bg-orange-brand/10 border border-orange-brand/25 px-3 py-1.5 text-2xs font-black uppercase tracking-widest text-orange-brand select-none z-10">
                LIVE MATCH OVERVIEW
              </div>
            </div>

            {/* ============================================================ */}
            {/* Veto og Maps: To-kolonne grid                                 */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Veto-sektion — vises kun hvis veto-data eksisterer og ikke er tomt */}
              {state.match.veto && state.match.veto.length > 0 && (
                <div className="space-y-4">
                  {/* Overskrift for veto-sektionen */}
                  <h3 className="text-xs font-bold uppercase tracking-widest text-orange-brand mb-2">
                    Veto
                  </h3>
                  <div className="rounded-xl border border-orange-brand/10 bg-card/40 p-5">
                    {/* Sender veto-arrayet og teams-arrayet til VetoSection */}
                    <VetoSection veto={state.match.veto} teams={state.teams} />
                  </div>
                </div>
              )}

              {/* Maps-sektion — vises kun hvis map-data eksisterer og ikke er tomt */}
              {state.match.maps && state.match.maps.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-orange-brand mb-2">
                    Maps
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Renderers ét kort for hver bane */}
                    {state.match.maps.map((mapData, idx) => {
                      // Henter billedesstien til banen baseret på dens navn
                      const mapBg = getMapImageUrl(mapData.map);
                      // En bane er spillet hvis der er demo-filer tilknyttet
                      const isPlayed = mapData.demos && mapData.demos.length > 0;

                      return (
                        <div
                          key={idx}
                          className="relative overflow-hidden rounded-xl border border-orange-brand/15 min-h-[140px] flex flex-col justify-between p-5 transition-all duration-300 hover:border-orange-brand/40"
                          // CSS inline style: Banebillede som baggrund med gradient overlay
                          style={{
                            // linear-gradient giver en mørk venstre side over billedet (for læsbarhed)
                            backgroundImage: `linear-gradient(to right, rgba(var(--bg-player-rgb), 0.95) 45%, rgba(var(--bg-player-rgb), 0.3) 100%), url(${mapBg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-start justify-between">
                              {/* Banens navn i stor fed hvid tekst */}
                              <h4 className="font-black text-white uppercase text-base tracking-wide">
                                {mapData.map}
                              </h4>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                              {/* Score vises kun for baner der er spillet */}
                              {isPlayed ? (
                                <div className="inline-flex items-center gap-2.5 bg-background/90 rounded-lg border border-orange-brand/20 px-3.5 py-1.5 shadow-lg">
                                  {/* Hold 1's runder */}
                                  <span className="text-sm font-black text-white tabular-nums">{mapData.team1Score ?? 0}</span>
                                  <span className="text-orange-brand/40 text-xs font-black">-</span>
                                  {/* Hold 2's runder */}
                                  <span className="text-sm font-black text-white tabular-nums">{mapData.team2Score ?? 0}</span>
                                </div>
                              ) : (
                                // Vises hvis banen ikke er spillet
                                <div className="text-label font-black uppercase tracking-widest bg-black/60 text-orange-soft/55 px-2.5 py-1.5 rounded">
                                  Ikke spillet
                                </div>
                              )}

                              {/* Demo-download links — vises kun for afspillede baner med demos */}
                              {isPlayed && mapData.demos && mapData.demos.length > 0 && (
                                <div className="space-y-1">
                                  {/* Renderers ét link for hver demo-fil */}
                                  {mapData.demos.map((demo, demoIdx) => (
                                    <a
                                      key={demoIdx}
                                      href={demo}
                                      target="_blank"
                                      // noopener noreferrer sikkerhedsregler for links der åbner i nyt vindue
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-orange-brand hover:text-orange-soft transition-colors"
                                    >
                                      Download demo
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* Lineups: Viser begge holds spillerlister side om side         */}
            {/* ============================================================ */}
            {/* Vises kun hvis lineups-data er tilgængeligt på kampen */}
            {state.match.lineups && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-brand">
                  Lineups
                </h3>
                {/* To-kolonne grid: Hold 1's lineup til venstre, Hold 2's til højre */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Hold 1's lineup — vises kun hvis det er tilgængeligt */}
                  {state.match.lineups.team1 && (
                    <LineupSection lineup={state.match.lineups.team1} teamName={t1.name} />
                  )}
                  {/* Hold 2's lineup — vises kun hvis det er tilgængeligt */}
                  {state.match.lineups.team2 && (
                    <LineupSection lineup={state.match.lineups.team2} teamName={t2.name} />
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
