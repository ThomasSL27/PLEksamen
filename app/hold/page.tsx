// ============================================================
// Hold: app/hold/page.tsx (Next.js App Router)
// Viser alle hold med klikbare logo-knapper og en detaljeret
// holdvisning (FeaturedTeam) med spillerkort og trænerprofil.
// Inkluderer sæson-filter dropdown til at skifte sæson.
// "use client" er nødvendigt pga. useState, useEffect og events.
// ============================================================
"use client";
// useState styrer lokal state, useEffect kører side-effekter, useRef holder DOM-referencer
import { useEffect, useState, useRef } from "react";
// PlayerCard er det genbrugelige spillerkort der vises i holdvisningen
import PlayerCard from "@/components/PlayerCard";
// toLower bruges til case-insensitiv sammenligning, getTwitterUrl formaterer Twitter-URL
import { toLower, getTwitterUrl } from "@/lib/utils";

// ============================================================
// X (Twitter) ikon: Inline SVG-komponent
// ============================================================
function XTwitterIcon({ className = "" }: { className?: string }) {
  // Returnerer X-logoet som et SVG-element — fill="currentColor" arver farven fra CSS
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
    </svg>
  );
}

// ============================================================
// ChevronIcon: Lille pil-ikon brugt i dropdown-knappen
// ============================================================
function ChevronIcon({ className = "" }: { className?: string }) {
  // stroke="currentColor" arver tekstfarven fra det omgivende element
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      {/* Path beskriver en nedadgående pil: start øverst til venstre, ned i midten, op til højre */}
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ============================================================
// Typer: Beskriver datastrukturen for hold og spillere
// ============================================================
// PlayerData beskriver én spiller i den interne repræsentation
interface PlayerData {
  nickname: string;
  name?: string;
  image?: string;
  role?: string;
  age?: number | string;
  twitter?: string;
}

// TeamData beskriver et hold med sine spillere og holdmetadata
interface TeamData {
  name: string;
  shortName: string;
  logoUrl: string;
  division: string;    // Divisionsnavnet, fx "Sæson 31 Grundspil"
  players: PlayerData[];
}

// Season beskriver én sæson fra API'et med dens hold
interface Season {
  name: string;
  teams: any[]; // any[] fordi API-strukturen kan variere
}

// FetchState er en discriminated union: TypeScript sikrer at alle tilstande håndteres
type FetchState =
  | { status: "loading" }
  | {
      status: "ok";
      seasons: Season[];
      selectedSeason: Season;
      teams: TeamData[];
      divisionName: string;
    }
  | { status: "error"; message: string };

// ============================================================
// Konstanter
// ============================================================
// SEASON_ENDPOINT er parameteren der sendes til API'et for at hente Sæson 31
const SEASON_ENDPOINT = "a/31";
// SEASON_NAME vises i sektionsoverskriften og på hvert spillerkort
const SEASON_NAME = "Sæson 31";
// GRUNDSPIL_MATCH bruges til at finde den rigtige sæson via navn-matching
const GRUNDSPIL_MATCH = "grundspil";

// ============================================================
// mapTeam: Konverterer et API-holdobjekt til TeamData-type
// Håndterer tilfælde hvor feltnavne mangler med || og ?? fallbacks
// ============================================================
function mapTeam(team: any, divisionName: string): TeamData {
  return {
    // team.name fra API'et — falder tilbage på "Ukendt hold" hvis feltet mangler
    name: team.name || "Ukendt hold",
    // shortName bruges som kortvisning — falder tilbage på name eller "???"
    shortName: team.shortName || team.name || "???",
    // logoUrl er URL til holdlogoet — tom streng som fallback hvis mangler
    logoUrl: team.logoUrl || "",
    // divisionName sendes ind udefra og gemmes på holdet til visning
    division: divisionName,
    // Mapper spillere: optional chaining (?.) forhindrer fejl hvis lineups er undefined
    players:
      team.lineups?.players?.map((p: any) => ({
        // Kaldenavn: ?? (nullish coalescing) prioriterer nickname, så name, så "Ukendt"
        nickname: p.nickname ?? p.name ?? "Ukendt",
        // Spillerens rigtige navn gemmes separat
        name: p.name,
        // Billede-URL — tom streng som fallback
        image: p.image || "",
        // Rolle, fx "IGL" eller "Coach"
        role: p.role || "",
        // Alder — kan mangle i API-svaret
        age: p.age || "",
        // Twitter kan ligge i enten p.twitter eller p.social.twitter afhængigt af API-version
        twitter: p.twitter || p.social?.twitter || "",
      })) || [], // Tomt array som fallback hvis players-listen er undefined
  };
}

// ============================================================
// FeaturedTeam: Viser detaljeret holdvisning med logo, spillere og træner
// onClose-prop er en callback der lukker visningen igen
// ============================================================
function FeaturedTeam({
  team,
  onClose,
}: {
  team: TeamData;
  onClose: () => void;
}) {
  // Finder træneren ved at søge efter rollen "coach" eller "træner" (case-insensitiv)
  const coach = team.players.find((p) =>
    ["coach", "træner"].includes(p.role?.toLowerCase() || "")
  );
  // Aktive spillere er alle i listen undtagen træneren
  const activePlayers = team.players.filter((p) => p !== coach);

  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-orange-brand/25 bg-gradient-to-br from-card to-card-deep shadow-2xl">

      {/* Holdheader med logo og navn */}
      <div className="relative border-b border-orange-brand/15 bg-gradient-to-r from-orange-brand/10 to-transparent p-6 sm:p-8">
        {/* Luk-knap øverst til højre — kalder onClose() callback ved klik */}
        <button
          onClick={onClose}
          aria-label="Luk holdvisning"
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-orange-brand/20 bg-background text-orange-soft/60 transition-all hover:border-orange-brand/50 hover:text-white"
        >
          {/* X-ikon tegnet med to krydsende diagonale linjer via SVG path */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo og holdnavn vises side om side med gap */}
        <div className="flex items-center gap-5">
          {/* Logocontainer med fast størrelse — shrink-0 forhindrer at det mindskes */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28 transition-transform duration-350">
            {/* Vis holdlogoet hvis URL er tilgængeligt */}
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                // drop-shadow giver en subtil orange glow rundt om logoet
                className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(var(--brand-orange-rgb),0.15)]"
              />
            ) : (
              // Fallback: Orange firkant med første bogstav fra holdets kortnavn
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-orange-brand/10 border border-orange-brand/20">
                <span className="text-3xl font-black text-orange-brand">
                  {/* charAt(0) henter det allerførste bogstav fra shortName eller name */}
                  {(team.shortName || team.name).charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            {/* Divisionsnavn og sæsonnavn i lille orange tekst over holdnavnet */}
            <p className="mb-0.5 !text-[10px] sm:!text-xs font-black uppercase tracking-widest text-orange-brand">
              {team.division} • {SEASON_NAME}
            </p>
            {/* Holdets fulde navn i stor fed hvid skrift */}
            <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl">
              {team.name}
            </h2>
            {/* Viser antal spillere og om der er en træner */}
            <p className="mt-1.5 text-xs text-orange-soft/60">
              {/* activePlayers.length er antallet uden træneren */}
              {activePlayers.length} spillere{coach ? " • 1 træner" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Spillergrid */}
      <div className="p-6">
        {/* Overskrift til spillerkorte-gridden */}
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
          Spillere
        </h3>
        {/* Responsivt grid: 2 kolonner på mobil, op til 5 på desktop */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {/* slice(0, 5) begrænser til de første 5 aktive spillere */}
          {activePlayers.slice(0, 5).map((player, idx) => (
            // Genbruger den globale PlayerCard-komponent for hver spiller
            <PlayerCard
              // key kombinerer nickname og idx for at sikre unikhed i listen
              key={`${player.nickname}-${idx}`}
              nickname={player.nickname}
              name={player.name}
              image={player.image}
              role={player.role}
              age={player.age}
              twitter={player.twitter}
              // Holdoplysninger sendes med til kortet
              teamName={team.name}
              teamLogo={team.logoUrl}
              division={team.division}
            />
          ))}
        </div>

        {/* Trænersektionen vises kun hvis en træner er fundet i spillerlisten */}
        {coach && (
          <div className="mt-8 border-t border-orange-brand/10 pt-5">
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
              Træner
            </h3>
            <div className="inline-flex items-center gap-3 rounded-lg border border-orange-brand/20 bg-card/50 p-3.5 transition-all hover:border-orange-brand/40">
              {/* Trænerbillede i lille cirkel/firkant */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-orange-brand/20 to-orange-brand/5">
                {/* Billede vises kun hvis coach.image er et ikke-tomt string */}
                {coach.image ? (
                  <img src={coach.image} alt={coach.nickname} className="h-full w-full object-cover object-top" />
                ) : null}
              </div>
              <div>
                {/* Trænernavn i hvid fed skrift */}
                <p className="text-sm font-bold text-white">{coach.nickname}</p>
                {/* Trænerens rigtige navn vises kun hvis det er tilgængeligt */}
                {coach.name && (
                  <p className="text-label text-orange-soft/50">{coach.name}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {/* "Coach" tekst i orange som rolle-label */}
                  <p className="text-2xs font-bold uppercase tracking-wider text-orange-brand">Coach</p>
                  {/* Træneres alder vises kun hvis coach.age er sat */}
                  {coach.age && (
                    <span className="text-2xs text-orange-soft/40">{coach.age} år</span>
                  )}
                  {/* Twitter-link vises kun hvis coach.twitter er sat */}
                  {coach.twitter && (
                    <a href={getTwitterUrl(coach.twitter)} target="_blank" rel="noopener noreferrer" className="text-orange-soft/40 transition-colors hover:text-white">
                      <XTwitterIcon className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Udskifter-sektion vises kun hvis holdet har mere end 5 aktive spillere */}
        {activePlayers.length > 5 && (
          <div className="mt-6 border-t border-orange-brand/10 pt-5">
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-orange-brand/60 sm:text-sm">
              Udskiftere
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* slice(5) starter fra index 5 — de første 5 er allerede vist i gridden ovenfor */}
              {activePlayers.slice(5).map((player, idx) => (
                <div
                  key={`sub-${player.nickname}-${idx}`}
                  className="flex items-center gap-3 rounded-lg border border-orange-brand/10 bg-card/40 px-3.5 py-2.5"
                >
                  {/* Lille spillerbillede for udskiftere */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-gradient-to-br from-orange-brand/15 to-transparent">
                    {/* Billede vises kun hvis player.image er sat */}
                    {player.image ? (
                      <img src={player.image} alt={player.nickname} className="h-full w-full object-cover object-top" />
                    ) : null}
                  </div>
                  <div>
                    {/* Spillernavn i lille fed hvid skrift */}
                    <span className="text-xs font-bold text-white">{player.nickname}</span>
                    <div className="flex items-center gap-2">
                      {/* Alder vises kun hvis player.age er sat */}
                      {player.age && <span className="text-2xs text-orange-soft/40">{player.age} år</span>}
                      {/* Twitter-link vises kun hvis player.twitter er sat */}
                      {player.twitter && (
                        <a href={getTwitterUrl(player.twitter)} target="_blank" rel="noopener noreferrer" className="text-orange-soft/30 hover:text-white">
                          <XTwitterIcon className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// TeamButton: Klikbar hold-knap med logo og navn
// isActive fremhæver det aktuelt valgte hold med orange kant
// ============================================================
function TeamButton({
  team,
  isActive,
  onClick,
}: {
  team: TeamData;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    // Betinget klasse: Aktivt hold får orange kant og orange baggrund
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-between rounded-xl border p-4 transition-all duration-300 w-28 sm:w-36 ${
        // isActive er true for det hold der er valgt
        isActive
          ? "border-orange-brand bg-orange-brand/10 shadow-[0_0_16px_rgba(var(--brand-orange-rgb),0.15)]"
          : "border-orange-brand/10 bg-card hover:border-orange-brand/40 hover:bg-card-hover"
      }`}
    >
      {/* Logocontainer med scale-animation ved hover via group-hover */}
      <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-105">
        {/* Vis logo hvis logoUrl er sat — ellers fallback til tekst */}
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={team.name}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              // Aktivt holds logo har fuld opacity — inaktivt er 75% dæmpet
              isActive ? "opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        ) : (
          // Fallback: De første 3 bogstaver fra holdets kortnavn i store bogstaver
          <span className={`text-xl font-black ${isActive ? 'text-orange-brand' : 'text-orange-soft/50'}`}>
            {/* substring(0, 3) tager de 3 første tegn, toUpperCase() gør dem store */}
            {team.shortName.substring(0, 3).toUpperCase()}
          </span>
        )}
      </div>

      {/* Holdnavn under logoet — truncate afkorter med "..." hvis teksten er for lang */}
      <span
        className={`text-2xs sm:text-xs font-black uppercase tracking-wider text-center truncate w-full transition-colors duration-300 ${
          // Aktivt holds navn er orange — inaktivt er hvidt og skifter til orange ved hover
          isActive ? "text-orange-brand" : "text-white group-hover:text-orange-brand"
        }`}
      >
        {/* Brug shortName som primær label — falder tilbage på name hvis shortName mangler */}
        {team.shortName || team.name}
      </span>
    </button>
  );
}

// ============================================================
// SeasonFilter: Dropdown til at skifte sæson
// (Identisk implementation som i kampe/page.tsx)
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
  // isOpen styrer om dropdown-listen er synlig eller skjult
  const [isOpen, setIsOpen] = useState(false);
  // dropdownRef bruges til at detektere klik udenfor dropdown-elementet
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lukker dropdown automatisk ved klik udenfor
  useEffect(() => {
    // handleClickOutside modtager mus-event og tjekker om klik er udenfor dropdownRef
    const handleClickOutside = (event: MouseEvent) => {
      // dropdownRef.current eksisterer (element er mounted) og klikket er UDEN for det
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Lukker dropdown ved at sætte isOpen til false
        setIsOpen(false);
      }
    };
    // Tilslutter event listener til hele dokumentet — mousedown er før click
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup-funktion returneres: Fjerner listener når komponenten unmountes
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Tomt array: kører kun ved mount og unmount

  return (
    // dropdownRef er sat på den ydre container til klik-udenfor detektion
    <div ref={dropdownRef} className="relative inline-block">
      {/* Filter-knap — toggler isOpen (åben/luk) ved klik */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-orange-brand/30 bg-gradient-to-r from-orange-brand/10 to-transparent px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-orange-soft transition-all hover:border-orange-brand/50 hover:bg-orange-brand/15 sm:px-5 sm:py-3"
      >
        {/* "FILTER" label i orange */}
        <span className="text-label text-orange-brand sm:text-xs">FILTER</span>
        {/* ChevronIcon roteres 180° med rotate-180 CSS-klassen når dropdown er åben */}
        <ChevronIcon className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {/* Dropdown-panel: Renderes kun i DOM når isOpen er true */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-orange-brand/30 bg-surface shadow-2xl">
          {/* max-h-96 med overflow-y-auto tillader scrolling hvis mange sæsoner */}
          <div className="max-h-96 overflow-y-auto">
            {/* Renderers én knap for hver tilgængelig sæson */}
            {seasons.map((season, idx) => (
              <button
                key={idx}
                // Klik: Vælg sæson via callback og luk dropdown
                onClick={() => { onSelectSeason(season); setIsOpen(false); }}
                className={`block w-full px-4 py-3 text-left text-sm transition-all ${
                  // Aktiv sæson fremhæves med orange kant og baggrund
                  selectedSeason.name === season.name
                    ? "border-l-2 border-orange-brand bg-orange-brand/10 font-bold text-white"
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
// HoldPage: Hoved-sidkomponent
// ============================================================
export default function HoldPage() {
  // state styrer sidens tilstand: starter som "loading" og skifter til "ok" eller "error"
  const [state, setState] = useState<FetchState>({ status: "loading" });
  // selectedTeam holder det aktuelt valgte hold — null betyder ingen hold er valgt endnu
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);

  // ============================================================
  // Datahentning: Henter hold fra API'et ved første sideindlæsning
  // ============================================================
  useEffect(() => {
    // Definerer async funktion inde i useEffect — useEffect kan ikke selv være async
    async function fetchTeams() {
      try {
        // Kalder den interne API-route med Sæson 31 endpoint (a/31)
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        // Hvis res.ok er false (status >= 400) kastes en fejl
        if (!res.ok) {
          // Forsøger at parse fejlbeskeden som JSON — catch giver {} ved parse-fejl
          const errorData = await res.json().catch(() => ({}));
          // Kaster fejl med API'ets besked eller en generisk fallback
          throw new Error(errorData?.error || `API fejl: ${res.status} ${res.statusText}`);
        }

        // Parser successvaret som JSON
        const json = await res.json();
        // Udtrækker data-arrayet — indeholder alle tilgængelige sæsoner
        const seasons: Season[] = json.data;

        // Validerer at data er et array — ellers kastes en fejl
        if (!Array.isArray(seasons)) throw new Error("Ugyldigt svar fra API");

        // Finder Grundspil-sæsonen ved case-insensitiv søgning i sæsonnavnet
        const grundspilSeason = seasons.find((s: any) =>
          toLower(s.name).includes(GRUNDSPIL_MATCH)
        );

        // Kaster fejl hvis Grundspillet ikke er fundet eller har ingen hold
        if (!grundspilSeason?.teams?.length) {
          throw new Error("Fandt ikke Grundsspillet for Sæson 31");
        }

        // Gemmer divisionens navn til brug på holdkortene
        const divisionName: string = grundspilSeason.name;
        // Konverterer alle API-hold til intern TeamData-type via mapTeam-funktionen
        const teams: TeamData[] = grundspilSeason.teams.map((team: any) =>
          mapTeam(team, divisionName)
        );

        // Sorterer holdene alfabetisk efter shortName med dansk locale ("da")
        teams.sort((a, b) =>
          (a.shortName || a.name).localeCompare(b.shortName || b.name, "da")
        );

        // Sætter Tricked som standard-hold — falder tilbage på første hold i listen
        const defaultTeam =
          teams.find(
            (t) => toLower(t.shortName) === "tricked" || toLower(t.name).includes("tricked")
          ) || teams[0];

        // Opdaterer state til "ok" med alle hentede data
        setState({ status: "ok", seasons, selectedSeason: grundspilSeason, teams, divisionName });
        // Sætter standard-holdet som det initialt valgte hold
        setSelectedTeam(defaultTeam);
      } catch (e: unknown) {
        // Hvis noget går galt sættes state til "error" med fejlbeskeden
        setState({
          status: "error",
          // instanceof Error tjekker om e er et Error-objekt — bruger e.message, ellers fallback
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    // Starter datahentningen
    fetchTeams();
  }, []); // Tomt dependency-array: kører kun én gang ved første render

  // Skifter til en ny sæson og opdaterer holdlisten og standard-valget
  const handleSeasonChange = (newSeason: Season) => {
    // Kun muligt at skifte sæson hvis data er hentet succesfuldt
    if (state.status === "ok") {
      // Konverterer den nye sæsons hold til intern TeamData-type
      const teams: TeamData[] = newSeason.teams.map((team: any) =>
        mapTeam(team, newSeason.name)
      );
      // Sorterer holdene alfabetisk for den nye sæson
      teams.sort((a, b) =>
        (a.shortName || a.name).localeCompare(b.shortName || b.name, "da")
      );
      // Sætter Tricked som standard-hold for den nye sæson
      const defaultTeam =
        teams.find((t) => toLower(t.shortName) === "tricked" || toLower(t.name).includes("tricked")) || teams[0];

      // Opdaterer state med ny sæson — beholder state.seasons (hele listen af sæsoner)
      setState({ status: "ok", seasons: state.seasons, selectedSeason: newSeason, teams, divisionName: newSeason.name });
      // Opdaterer valgt hold til den nye sæsons standard-hold
      setSelectedTeam(defaultTeam);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Dekorative glow-cirkler — pointer-events-none gør dem ikke-klikbare */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Stor orange cirkel øverst til højre med meget lav opacity (4%) */}
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.04] blur-3xl" />
        {/* Mindre orange cirkel nederst til venstre med 3% opacity */}
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      {/* Indholds-wrapper: max-w-7xl begrænser bredden, z-10 er over glow-cirlerne */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">

        {/* Sektionsoverskrift med filter — justify-between placerer dem i hver sin side */}
        <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            {/* Sektionsmærkat i lille orange tekst */}
            <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
              Power Ligaen • {SEASON_NAME}
            </p>
            {/* Primær H1 overskrift */}
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
              Hold
            </h1>
            {/* Dekorativ orange understregslinje */}
            <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
          </div>

          {/* SeasonFilter vises kun når data er hentet succesfuldt (state er "ok") */}
          {state.status === "ok" && (
            <SeasonFilter seasons={state.seasons} selectedSeason={state.selectedSeason} onSelectSeason={handleSeasonChange} />
          )}
        </header>

        {/* Loading-tilstand: Spinner og tekst mens API-kaldet kører */}
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              {/* Spinner: animate-spin roterer border-t-orange-brand som en cirkel */}
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/60">Henter hold for {SEASON_NAME}…</p>
            </div>
          </div>
        )}

        {/* Fejl-tilstand: Vises ved API-fejl med fejlbeskeden fra state */}
        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              {/* Viser den specifikke fejlbesked der blev gemt i state */}
              <p className="text-sm text-red-400">FEJL: {state.message}</p>
              {/* window.location.reload() genindlæser hele siden ved klik */}
              <button onClick={() => window.location.reload()} className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background">
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {/* Succes-tilstand: Viser holddetaljer og holdgrid */}
        {state.status === "ok" && (
          <>
            {/* Vis FeaturedTeam hvis et hold er valgt — ellers vis placeholder */}
            {selectedTeam ? (
              // Sender valgt hold og luk-callback til FeaturedTeam
              <FeaturedTeam team={selectedTeam} onClose={() => setSelectedTeam(null)} />
            ) : (
              // Placeholder når intet hold er valgt
              <div className="mb-8 rounded-lg border border-orange-brand/10 bg-card p-8 text-center">
                <p className="text-sm text-orange-soft/40">
                  Vælg et hold nedenfor for at se holdopstillingen
                </p>
              </div>
            )}

            {/* Hold-grid med klikbare logo-knapper */}
            <section>
              {/* Divisionsnavn og antal hold */}
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
                {state.divisionName}{" "}
                {/* state.teams.length er det samlede antal hold i sæsonen */}
                <span className="font-medium normal-case text-orange-soft/45">
                  ({state.teams.length} hold)
                </span>
              </h3>
              {/* flex-wrap: Knapperne flyder til næste linje når der ikke er mere plads */}
              <div className="flex flex-wrap gap-2 sm:gap-4 justify-start">
                {/* Renderers én TeamButton for hvert hold */}
                {state.teams.map((team, idx) => (
                  <TeamButton
                    key={`${team.shortName}-${idx}`}
                    team={team}
                    // Holdet er aktivt hvis shortName OG division matcher selectedTeam
                    isActive={
                      selectedTeam?.shortName === team.shortName &&
                      selectedTeam?.division === team.division
                    }
                    // Klik opdaterer selectedTeam til dette hold
                    onClick={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
