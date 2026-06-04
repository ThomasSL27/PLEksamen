// ============================================================
// AllstarsHighlights: components/AllstarsHighlights.tsx
// Viser en YouTube-video-playliste med highlights fra Sæson 31.
// Henter spillerbilleder fra API'et og matcher dem til playlisten.
// GSAP ScrambleText animerer spillernavn ved hover over playliste-items.
// "use client" er nødvendigt pga. GSAP, state og event handlers.
// ============================================================
"use client";

// useState styrer playlisten og aktiv video, useRef holder DOM-referencer, useEffect matcher billeder
import { useState, useRef, useEffect } from "react";
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from "gsap";
// ScrambleTextPlugin animerer tekst med tilfældige tegn
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
// ApiSeason er TypeScript-typen der beskriver API-datastrukturen
import type { ApiSeason } from "@/lib/types";

// ============================================================
// GSAP plugin-registrering: Kun på klientsiden
// typeof window !== "undefined" tjekker om vi er i browser-konteksten
// ============================================================
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// ============================================================
// Typer: Beskriver et highlight-video-item i playlisten
// ============================================================
// HighlightVideo beskriver én video i playlisten
interface HighlightVideo {
  id: string;                   // Unikt ID til React key
  playerNickname: string;       // Bruges til at matche spillerbillede fra API
  teamName: string;             // Holdets navn
  title: string;                // Videoens titel
  youtubeId: string;            // YouTube video-ID bruges i embed URL
  playerImage?: string;         // Hentes dynamisk fra API — starter tom
}

// ============================================================
// HIGHLIGHTS_PLAYLIST: Statisk liste af highlight-videoer
// playerImage er tom som standard og udfyldes fra API-data
// ============================================================
const HIGHLIGHTS_PLAYLIST: HighlightVideo[] = [
  {
    id: "v1",
    playerNickname: "leakz",
    teamName: "Tricked",
    title: "Sæson 31 MVP Main Highlights",
    // youtubeId er den unikke del af YouTube-URL'en (efter ?v=)
    youtubeId: "HU58ns_r13k",
    playerImage: "",
  },
  {
    id: "v2",
    playerNickname: "nicoodoz",
    teamName: "Ecstatic",
    title: "AWP Ace on Ancient Defense",
    youtubeId: "KGOYdfcqHZ8",
    playerImage: "",
  },
  {
    id: "v4",
    playerNickname: "Salazar",
    teamName: "Tricked",
    title: "1v3 Clutch vs Astralis Talent",
    youtubeId: "pg7Pkd0WmVM",
    playerImage: "",
  },
];


// ============================================================
// PlaylistItem: Viser ét element i playliste-sidebjælken
// Modtager video-data, om det er aktivt, og en onClick-handler
// ============================================================
function PlaylistItem({
  video,
  isActive,
  onClick,
}: {
  video: HighlightVideo;
  isActive: boolean;
  onClick: () => void;
}) {
  // nicknameRef bruges til GSAP ScrambleText-animation af spillernavnet
  const nicknameRef = useRef<HTMLSpanElement>(null);
  // imageError håndterer tilfælde hvor spillerbilledet ikke kan indlæses
  const [imageError, setImageError] = useState(false);

  // ScrambleText-animation aktiveres ved hover — kun hvis item ikke allerede er aktivt
  const handleMouseEnter = () => {
    // Tjekker at elementet eksisterer og item ikke er aktivt
    if (nicknameRef.current && !isActive) {
      gsap.to(nicknameRef.current, {
        duration: 0.4,
        scrambleText: {
          text: video.playerNickname,  // Den endelige tekst der vises
          chars: "01X#$@!?%&*",       // Tegn brugt i scramble-effekten
          speed: 0.3,                  // Afsløringshastighed
          revealDelay: 0.05,           // Forsinkelse inden afsløringen
        },
      });
    }
  };

  // Genkører scramble-animation ved mouseLeave
  const handleMouseLeave = () => {
    if (nicknameRef.current && !isActive) {
      gsap.to(nicknameRef.current, {
        duration: 0.3,
        scrambleText: {
          text: video.playerNickname,
          chars: "01X#$@!?%&*",
          speed: 0.4,
        },
      });
    }
  };

  return (
    // Hele rækken er en knap — klik aktiverer videoen via onClick-callback
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // last:border-0 fjerner bundkanten på det sidste element i listen
      className="group w-full text-left flex flex-row items-center gap-5 py-3.5 bg-transparent border-0 outline-none focus:outline-none cursor-pointer border-b border-white/[0.03] last:border-0"
    >
      {/* Spillerbillede — svævende cutout uden ramme */}
      <div className="relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden flex items-end justify-center select-none">
        {/* Vises kun hvis playerImage er sat OG ingen billedfejl opstod */}
        {video.playerImage && !imageError ? (
          <img
            src={video.playerImage}
            alt={video.playerNickname}
            // onError sætter imageError til true hvis billedet ikke kan indlæses
            onError={() => setImageError(true)}
            className={`h-full w-full object-contain object-bottom transition-all duration-300 z-10 ${
              // Aktivt item: Fuld opacity og scale-up — inaktivt: Dæmpet og skaleres ved hover
              isActive ? "scale-105 drop-shadow-[0_0_10px_rgba(255,107,0,0.35)]" : "opacity-60 group-hover:opacity-100 group-hover:scale-105"
            }`}
          />
        ) : null}
        {/* Gradient-fade: Smelter bunden af billedet ind i baggrunden */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent z-15" />
      </div>

      {/* Tekstindhold: Holdnavn, spillernavn og videotitel */}
      <div className="flex-1 min-w-0">
        {/* Holdnavn — orange hvis aktivt, ellers dæmpet */}
        <div className="flex justify-between items-center w-full gap-2 mb-1">
          <span className={`text-2xs font-black uppercase tracking-widest transition-colors duration-300 ${
            isActive ? "text-orange-brand" : "text-orange-soft/35 group-hover:text-orange-brand"
          }`}>
            {video.teamName}
          </span>
        </div>

        {/* Spillernavn — nicknameRef bruges til GSAP ScrambleText-animation */}
        <span
          ref={nicknameRef}
          className={`text-base font-black uppercase tracking-tight block select-none leading-none transition-colors duration-300 ${
            // Aktivt item: Orange tekst — inaktivt: Hvid med orange ved hover
            isActive ? "text-orange-brand" : "text-white group-hover:text-orange-brand"
          }`}
        >
          {video.playerNickname}
        </span>
        {/* Videotitel — truncate skærer for lang tekst af med "..." */}
        <p className="text-caption font-semibold text-orange-soft/50 truncate mt-1.5 leading-tight">
          {video.title}
        </p>
      </div>
    </button>
  );
}

// ============================================================
// AllstarsHighlights: Hoved-komponent med YouTube-player + playliste
// seasons sendes fra forsiden og bruges til at hente spillerbilleder
// ============================================================
export default function AllstarsHighlights({ seasons }: { seasons: ApiSeason[] | null }) {
  // playlist starter med statisk data og opdateres med spillerbilleder fra API
  const [playlist, setPlaylist] = useState<HighlightVideo[]>(HIGHLIGHTS_PLAYLIST);
  // activeVideo holder styr på hvilken video der afspilles i playeren
  const [activeVideo, setActiveVideo] = useState<HighlightVideo>(playlist[0]);

  // ============================================================
  // Spillerbillede-matching: Finder spillerbilleder fra API-data
  // Kører når seasons-prop'en opdateres
  // ============================================================
  useEffect(() => {
    // Stopper hvis seasons endnu ikke er hentet
    if (!seasons) return;
    // Hjælpefunktion til case-insensitiv sammenligning
    const toLower = (val: string) => val.toLowerCase();
    try {
      // Finder Sæson 31 Grundspil-sæsonen i API-dataen
      const season = seasons.find(
        s =>
          // includes() tjekker om strengen indeholder sæsonnavnet
          String(s?.name || "").includes("Sæson 31") &&
          toLower(String(s?.name || "")).includes("grundspil")
      );
      // Stopper hvis sæsonen ikke er fundet eller har ingen hold
      if (!season?.teams) return;

      // Finder Tricked og Ecstatic-holdene via case-insensitiv navn-matching
      const tricked = season.teams.find(t => toLower(String(t.shortName || t.name)).includes("tricked"));
      const ecstatic = season.teams.find(t => toLower(String(t.shortName || t.name)).includes("ecstatic"));

      // Sammensætter alle spillere fra begge hold i ét array via spread-operator
      const playersList = [
        ...(tricked?.lineups?.players || []),   // Tricked's spillere (tomt array hvis undefined)
        ...(ecstatic?.lineups?.players || []),  // Ecstatic's spillere
      ];

      // Matcher hvert video-item med den tilsvarende spiller fra API'et
      const updatedPlaylist = HIGHLIGHTS_PLAYLIST.map((video) => {
        // Finder spilleren ved case-insensitiv nickname-matching
        const apiPlayer = playersList.find(
          p => toLower(String(p?.nickname || "")) === toLower(video.playerNickname)
        );
        // Returnerer al original video-data med opdateret playerImage
        // || "" giver tom streng som fallback hvis spilleren ikke har et billede
        return { ...video, playerImage: apiPlayer?.image || "" };
      });

      // Opdaterer playlisten med de fundne spillerbilleder
      setPlaylist(updatedPlaylist);

      // Opdaterer activeVideo hvis dens billede er blevet opdateret
      const updatedActive = updatedPlaylist.find((v) => v.id === activeVideo.id);
      // Kun opdater hvis vi faktisk fandt det opdaterede item
      if (updatedActive) setActiveVideo(updatedActive);
    } catch {
      // Fallback: Ignorer fejl lydløst — statisk data uden billeder bruges stadig
    }
  }, [seasons]); // [seasons]: Kører igen når seasons-prop'en ændres

  // Opdaterer activeVideo til det klikkede item
  const handleVideoSelect = (video: HighlightVideo) => {
    // Sætter det valgte video som aktivt
    setActiveVideo(video);
  };

  return (
    <section className="relative w-full font-sans text-foreground py-8 sm:py-12" aria-label="Allstars-highlights">
      <div className="relative z-10 mx-auto flex w-full flex-col">

        {/* Sektionsoverskrift */}
        <div className="mb-8">
          {/* Sektionsmærkat i lille orange tekst */}
          <p className="text-label font-black uppercase tracking-[0.25em] text-orange-brand mb-1">
            ALLSTARS HIGHLIGHTS
          </p>
          {/* Primær H2 overskrift */}
          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Highlights & Plays
          </h2>
          {/* Dekorativ orange understregslinje */}
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand" />
        </div>

        {/* ============================================================ */}
        {/* To-kolonne grid: YouTube-player (8 kol) + playliste (4 kol)  */}
        {/* grid-cols-12 på desktop giver fleksibel kolonnefordeling      */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">

          {/* YouTube-afspiller (8 ud af 12 kolonner på desktop) */}
          <div className="relative lg:col-span-8 flex flex-col justify-center">
            {/* aspect-video giver YouTube's standard 16:9 billedformat */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-brand/15 bg-player shadow-2xl transition-all duration-300 hover:border-orange-brand/35 w-full aspect-video">
              {/* key={activeVideo.id} tvinger React til at genskabe iframe'en når video skifter */}
              {/* Uden key ville YouTube blot opdatere src og ikke nulstille playeren */}
              <iframe
                key={activeVideo.id}
                // Bygger YouTube embed URL fra youtubeId
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                title={`${activeVideo.playerNickname} highlight`}
                // allow-parametrene giver tilladelse til de nødvendige browser-features
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>
          </div>

          {/* Playliste-sidebjælke (4 ud af 12 kolonner på desktop) */}
          <div className="lg:col-span-4 flex flex-col h-full justify-start">
            {/* overflow-y-auto tillader scrolling hvis playlisten er lang */}
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[380px] lg:max-h-full pr-1">
              {/* Renderers ét PlaylistItem for hver video i playlisten */}
              {playlist.map((video) => (
                <PlaylistItem
                  key={video.id}
                  video={video}
                  // isActive er true for den video der aktuelt afspilles
                  isActive={activeVideo.id === video.id}
                  onClick={() => handleVideoSelect(video)}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
