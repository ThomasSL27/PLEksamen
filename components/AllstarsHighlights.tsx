// ============================================================
// AllstarsHighlights: components/AllstarsHighlights.tsx
// Viser en YouTube-video-playliste med highlights fra Sæson 31.
// Henter spillerbilleder fra API'et og matcher dem til playlisten.
// GSAP ScrambleText animerer spillernavn ved hover over playliste-items.
// "use client" er nødvendigt pga. GSAP, state og event handlers.
// ============================================================
"use client";

import { useState, useRef, useEffect } from "react";
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from "gsap";
// ScrambleTextPlugin animerer tekst med tilfældige tegn
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
// ApiSeason er TypeScript-typen der beskriver API-datastrukturen
import type { ApiSeason } from "@/lib/types";

// ============================================================
// GSAP plugin-registrering: Kun på klientsiden
// ============================================================
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// ============================================================
// Typer: Beskriver et highlight-video-item i playlisten
// ============================================================
interface HighlightVideo {
  id: string;
  playerNickname: string;  // Bruges til at matche spillerbillede fra API
  teamName: string;
  title: string;
  youtubeId: string;       // YouTube video-ID bruges i embed URL
  playerImage?: string;    // Hentes dynamisk fra API — starter tom
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
// Modtager video-data, om det er aktiv, og en onClick-handler
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
  // nicknameRef bruges til GSAP ScrambleText-animation
  const nicknameRef = useRef<HTMLSpanElement>(null);
  // imageError håndterer tilfælde hvor spillerbilledet ikke kan indlæses
  const [imageError, setImageError] = useState(false);

  // ScrambleText-animation aktiveres ved hover — kun hvis item ikke allerede er aktivt
  const handleMouseEnter = () => {
    if (nicknameRef.current && !isActive) {
      gsap.to(nicknameRef.current, {
        duration: 0.4,
        scrambleText: {
          text: video.playerNickname,
          chars: "01X#$@!?%&*",
          speed: 0.3,
          revealDelay: 0.05,
        },
      });
    }
  };

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
    // Hele rækken er en knap — klik aktiverer videoen
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group w-full text-left flex flex-row items-center gap-5 py-3.5 bg-transparent border-0 outline-none focus:outline-none cursor-pointer border-b border-white/[0.03] last:border-0"
    >
      {/* Spillerbillede — svævende cutout uden ramme */}
      <div className="relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden flex items-end justify-center select-none">
        {/* Vises kun hvis billede-URL er sat og ingen fejl opstod */}
        {video.playerImage && !imageError ? (
          <img
            src={video.playerImage}
            alt={video.playerNickname}
            // Sætter imageError til true hvis billede ikke kan indlæses (onError)
            onError={() => setImageError(true)}
            className={`h-full w-full object-contain object-bottom transition-all duration-300 z-10 ${
              isActive ? "scale-105 drop-shadow-[0_0_10px_rgba(255,107,0,0.35)]" : "opacity-60 group-hover:opacity-100 group-hover:scale-105"
            }`}
          />
        ) : null}
        {/* Gradient-fade i bunden: Smelter bunden af spillerbilledet ind i baggrunden */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent z-15" />
      </div>

      {/* Tekstindhold: holdnavn, nickname og titel */}
      <div className="flex-1 min-w-0">
        {/* Holdnavn — orange hvis aktiv, ellers dæmpet */}
        <div className="flex justify-between items-center w-full gap-2 mb-1">
          <span className={`text-2xs font-black uppercase tracking-widest transition-colors duration-300 ${
            isActive ? "text-orange-brand" : "text-orange-soft/35 group-hover:text-orange-brand"
          }`}>
            {video.teamName}
          </span>
        </div>

        {/* Spillernavn med GSAP-animation via nicknameRef */}
        <span
          ref={nicknameRef}
          className={`text-base font-black uppercase tracking-tight block select-none leading-none transition-colors duration-300 ${
            isActive ? "text-orange-brand" : "text-white group-hover:text-orange-brand"
          }`}
        >
          {video.playerNickname}
        </span>
        {/* Video-titel — truncate afskærer for lang tekst med "..." */}
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
  // activeVideo holder styr på hvilken video der afspilles
  const [activeVideo, setActiveVideo] = useState<HighlightVideo>(playlist[0]);

  // ============================================================
  // Spillerbillede-matching: Finder spillerbilleder fra API-data
  // og opdaterer playlisten med dem
  // ============================================================
  useEffect(() => {
    if (!seasons) return;
    // Hjælpefunktion til case-insensitiv sammenligning
    const toLower = (val: string) => val.toLowerCase();
    try {
      // Finder Sæson 31 Grundspil-sæsonen i API-dataen
      const season = seasons.find(
        s =>
          String(s?.name || "").includes("Sæson 31") &&
          toLower(String(s?.name || "")).includes("grundspil")
      );
      if (!season?.teams) return;

      // Finder Tricked og Ecstatic-holdene
      const tricked = season.teams.find(t => toLower(String(t.shortName || t.name)).includes("tricked"));
      const ecstatic = season.teams.find(t => toLower(String(t.shortName || t.name)).includes("ecstatic"));

      // Sammensætter alle spillere fra begge hold i ét array
      const playersList = [
        ...(tricked?.lineups?.players || []),
        ...(ecstatic?.lineups?.players || []),
      ];

      // Matcher hvert video-item med den tilsvarende spiller fra API'et
      const updatedPlaylist = HIGHLIGHTS_PLAYLIST.map((video) => {
        // Finder spilleren ved case-insensitiv nickname-matching
        const apiPlayer = playersList.find(
          p => toLower(String(p?.nickname || "")) === toLower(video.playerNickname)
        );
        // Beholder al original video-data, men erstatter playerImage med API-billedet
        return { ...video, playerImage: apiPlayer?.image || "" };
      });

      setPlaylist(updatedPlaylist);

      // Opdaterer activeVideo hvis dens billede er blevet opdateret
      const updatedActive = updatedPlaylist.find((v) => v.id === activeVideo.id);
      if (updatedActive) setActiveVideo(updatedActive);
    } catch {
      // Fallback bevares lydløst — statisk data bruges stadig
    }
  }, [seasons]);

  // Håndterer klik på et playliste-item
  const handleVideoSelect = (video: HighlightVideo) => {
    setActiveVideo(video);
  };

  return (
    <section className="relative w-full font-sans text-foreground py-8 sm:py-12" aria-label="Allstars-highlights">
      <div className="relative z-10 mx-auto flex w-full flex-col">

        {/* Sektionsoverskrift */}
        <div className="mb-8">
          <p className="text-label font-black uppercase tracking-[0.25em] text-orange-brand mb-1">
            ALLSTARS HIGHLIGHTS
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Highlights & Plays
          </h2>
          {/* Dekorativ orange understreging */}
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand" />
        </div>

        {/* ============================================================ */}
        {/* Indhold: 12-kolonne grid — video (8 kol) + playliste (4 kol) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">

          {/* YouTube-afspiller (8 kolonner på desktop) */}
          <div className="relative lg:col-span-8 flex flex-col justify-center">
            {/* aspect-video giver korrekt 16:9 format til YouTube-embed */}
            <div className="relative overflow-hidden rounded-2xl border border-orange-brand/15 bg-player shadow-2xl transition-all duration-300 hover:border-orange-brand/35 w-full aspect-video">
              {/* key={activeVideo.id} tvinger React til at genrendere iframe når video skifter */}
              <iframe
                key={activeVideo.id}
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                title={`${activeVideo.playerNickname} highlight`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>
          </div>

          {/* Playliste-sidebjælke (4 kolonner på desktop) */}
          <div className="lg:col-span-4 flex flex-col h-full justify-start">
            {/* overflow-y-auto tillader scrolling hvis playlisten er lang */}
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[380px] lg:max-h-full pr-1">
              {playlist.map((video) => (
                <PlaylistItem
                  key={video.id}
                  video={video}
                  // isActive er true for den video der afspilles
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
