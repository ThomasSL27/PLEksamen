"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Registrer GSAP plugin (kun på klientsiden)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// -------------------------------------------
// Typer
// -------------------------------------------
interface HighlightVideo {
  id: string;
  playerNickname: string;
  teamName: string;
  title: string;
  youtubeId: string;
  playerImage?: string; // Hentes dynamisk fra API via useEffect
}

// -------------------------------------------
// Kamp-Data (Spillere uden Cabbi)
// -------------------------------------------
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


// ==================================================
// PlaylistItem Komponent uden rammer, kasser eller varighed
// ==================================================
function PlaylistItem({
  video,
  isActive,
  onClick,
}: {
  video: HighlightVideo;
  isActive: boolean;
  onClick: () => void;
}) {
  const nicknameRef = useRef<HTMLSpanElement>(null);
  const [imageError, setImageError] = useState(false);

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
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group w-full text-left flex flex-row items-center gap-5 py-3.5 bg-transparent border-0 outline-none focus:outline-none cursor-pointer border-b border-white/[0.03] last:border-0"
    >
      {/* Venstre side: Stor spillercutout (Frit svævende uden nogen kasse/ramme) */}
      <div className="relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden flex items-end justify-center select-none">
        {video.playerImage && !imageError ? (
          <img
            src={video.playerImage}
            alt={video.playerNickname}
            onError={() => setImageError(true)}
            className={`h-full w-full object-contain object-bottom transition-all duration-300 z-10 ${
              isActive ? "scale-105 drop-shadow-[0_0_10px_rgba(255,107,0,0.35)]" : "opacity-60 group-hover:opacity-100 group-hover:scale-105"
            }`}
          />
        ) : null}
        {/* Blød bund-fade til at smelte bunden af spilleren sammen med baggrunden */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent z-15" />
      </div>

      {/* Højre side: Teksterne tæt stakket, hvilket danner sin egen form */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center w-full gap-2 mb-1">
          <span className={`text-2xs font-black uppercase tracking-widest transition-colors duration-300 ${
            isActive ? "text-orange-brand" : "text-orange-soft/35 group-hover:text-orange-brand"
          }`}>
            {video.teamName}
          </span>
        </div>

        <span
          ref={nicknameRef}
          className={`text-base font-black uppercase tracking-tight block select-none leading-none transition-colors duration-300 ${
            isActive ? "text-orange-brand" : "text-white group-hover:text-orange-brand"
          }`}
        >
          {video.playerNickname}
        </span>
        <p className="text-caption font-semibold text-orange-soft/50 truncate mt-1.5 leading-tight">
          {video.title}
        </p>
      </div>
    </button>
  );
}

// ================================================= =
// Allstars Highlights Hovedkomponent
// ================================================= =
export default function AllstarsHighlights() {
  const [playlist, setPlaylist] = useState<HighlightVideo[]>(HIGHLIGHTS_PLAYLIST);
  const [activeVideo, setActiveVideo] = useState<HighlightVideo>(playlist[0]);

  // Hent spillernes billeder dynamisk fra Sæson 31 API'et ved load
  useEffect(() => {
    const toLower = (val: string) => val.toLowerCase();

    async function fetchPlayerImages() {
      try {
        const res = await fetch("/api/powerstats?type=a/31");
        if (!res.ok) return;
        const json = await res.json();
        const seasons = json?.data;
        if (!Array.isArray(seasons)) return;

        const season = seasons.find(
          (s: any) =>
            String(s?.name || "").includes("Sæson 31") &&
            toLower(String(s?.name || "")).includes("grundspil")
        );
        if (!season?.teams) return;

        // Saml alle spillere fra Tricked og Ecstatic
        const tricked = season.teams.find((t: any) => toLower(String(t.shortName || t.name)).includes("tricked"));
        const ecstatic = season.teams.find((t: any) => toLower(String(t.shortName || t.name)).includes("ecstatic"));

        const playersList = [
          ...(tricked?.lineups?.players || []),
          ...(ecstatic?.lineups?.players || []),
        ];

        // Opdater playlisten med billederne fra API'et
        const updatedPlaylist = playlist.map((video) => {
          const apiPlayer = playersList.find(
            (p: any) => toLower(String(p?.nickname || "")) === toLower(video.playerNickname)
          );
          return {
            ...video,
            playerImage: apiPlayer?.image || "",
          };
        });

        setPlaylist(updatedPlaylist);
        
        // Synkroniser activeVideo med det nye opdaterede objekt
        const updatedActive = updatedPlaylist.find((v) => v.id === activeVideo.id);
        if (updatedActive) {
          setActiveVideo(updatedActive);
        }
      } catch {
        // Fallback bevares lydløst
      }
    }

    fetchPlayerImages();
  }, []);

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
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand" />
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          
          {/* Venstre kolonne: Stor Video Player – UDEN AUTOPLAY */}
          <div className="relative lg:col-span-8 flex flex-col justify-center">
            <div className="relative overflow-hidden rounded-2xl border border-orange-brand/15 bg-player shadow-2xl transition-all duration-300 hover:border-orange-brand/35 w-full aspect-video">
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

          {/* Højre kolonne: Playlist uden kasser eller unødvendig luft */}
          <div className="lg:col-span-4 flex flex-col h-full justify-start">
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[380px] lg:max-h-full pr-1">
              {playlist.map((video) => (
                <PlaylistItem
                  key={video.id}
                  video={video}
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