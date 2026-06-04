// ============================================================
// NextMatch: components/NextMatch.tsx
// Viser det næste store opgør på forsiden med spillercutouts.
// Henter spillerbilleder fra seasons-prop'en (API-data).
// GSAP ScrambleText animerer holdnavnene og VS-teksten ved hover.
// "use client" er nødvendigt pga. GSAP-animationer og event handlers.
// ============================================================
"use client";

import { useEffect, useState, useRef } from "react";
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
// Typer: Beskriver en spiller der vises i kampvisningen
// ============================================================
type MatchPlayer = {
  teamName: string;  // Holdets korte navn
  teamLogo: string;  // URL til holdlogo
  nickname: string;  // Spillerens kaldenavn
  image: string;     // URL til spillerbillede
};

// ============================================================
// PlayerShowcase: Viser en spiller med holdlogo-baggrund
// textRef sendes ind så forælderkomponenten kan animere teamName
// ============================================================
function PlayerShowcase({
  teamName,
  teamLogo,
  nickname,
  image,
  textRef,
}: MatchPlayer & { textRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div className="group relative flex flex-col items-center select-none">

      {/* Stor dæmpet holdlogo i baggrunden — skaleres lidt op ved hover */}
      {teamLogo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 opacity-10 pointer-events-none transition-transform duration-750 ease-out group-hover:scale-110">
          <img
            src={teamLogo}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Spillerbillede — skaleres op ved hover */}
      <div className="relative h-56 w-40 sm:h-72 sm:w-56 z-10 flex items-end justify-center">
        {image ? (
          <img
            src={image}
            alt={nickname}
            className="h-full w-full object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : null}
      </div>

      {/* Holdnavn — ref bruges af GSAP til ScrambleText-animation */}
      <span
        ref={textRef}
        className="mt-4 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-soft/90 transition-colors duration-300 group-hover:text-orange-brand z-20 h-5 overflow-hidden block select-none"
      >
        {teamName}
      </span>

    </div>
  );
}

// ============================================================
// NextMatch: Henter og viser de to hold i "næste kamp" på forsiden
// seasons prop sendes fra forsidens useEffect (app/page.tsx)
// ============================================================
export default function NextMatch({ seasons }: { seasons: ApiSeason[] | null }) {
  // players gemmer de to spillere der vises — null mens data hentes
  const [players, setPlayers] = useState<{ a: MatchPlayer; b: MatchPlayer } | null>(null);
  // Refs til tekstelementer der animeres med GSAP ScrambleText
  const vsTextRef = useRef<HTMLDivElement>(null);
  const teamARef = useRef<HTMLSpanElement>(null);
  const teamBRef = useRef<HTMLSpanElement>(null);

  // ============================================================
  // Datahentning: Finder specifikke spillere fra API-dataen
  // Kører når seasons-prop'en opdateres (indeholder API-data)
  // ============================================================
  useEffect(() => {
    if (!seasons) return;
    // Hjælpefunktion til case-insensitiv sammenligning
    const toLower = (value: string) => value.toLowerCase();
    try {
      // Finder Sæson 31 Grundspil i det samlede seasons-array
      const season = seasons.find(
        s =>
          String(s?.name || "").includes("Sæson 31") &&
          toLower(String(s?.name || "")).includes("grundspil")
      );
      if (!season?.teams) return;

      const teams = season.teams!;
      // Finder de to specifikke hold ved navn-match
      const ecstatic = teams.find(t => toLower(String(t.shortName || t.name || "")).includes("ecstatic"));
      const sashi = teams.find(t => toLower(String(t.shortName || t.name || "")).includes("sashi"));
      // Finder de specifikke spillere inden for hvert hold
      const nicoodoz = ecstatic?.lineups?.players?.find(p => toLower(String(p.nickname || "")) === "nicoodoz");
      const zyphon = sashi?.lineups?.players?.find(p => toLower(String(p.nickname || "")) === "zyphon");
      // Springer over hvis et af holdene eller spillerne ikke blev fundet
      if (!ecstatic || !sashi || !nicoodoz || !zyphon) return;

      // Opdaterer state med de fundne spillere
      setPlayers({
        a: {
          teamName: ecstatic.shortName || ecstatic.name || "",
          teamLogo: ecstatic.logoUrl || "",
          nickname: nicoodoz.nickname || "",
          image: nicoodoz.image || "",
        },
        b: {
          teamName: sashi.shortName || sashi.name || "",
          teamLogo: sashi.logoUrl || "",
          nickname: zyphon.nickname || "",
          image: zyphon.image || "",
        },
      });
    } catch {
      // Fallback — viser loading-spinner hvis noget går galt
    }
  }, [seasons]);

  // ============================================================
  // GSAP ScrambleText hover-effekter
  // Animerer VS-tekst og begge holdnavne ved hover over kamp-kortet
  // ============================================================
  const handleWrapperMouseEnter = () => {
    // Scrambler "(VS)" teksten
    if (vsTextRef.current) {
      gsap.to(vsTextRef.current, {
        duration: 0.5,
        scrambleText: {
          text: "(VS)",
          chars: "01X#$@!?%&*",
          speed: 0.4,
          revealDelay: 0.05,
        },
      });
    }
    // Scrambler begge holdnavne
    if (players) {
      if (teamARef.current) {
        gsap.to(teamARef.current, {
          duration: 0.5,
          scrambleText: {
            text: players.a.teamName,
            chars: "01X#$@!?%&*",
            speed: 0.4,
          },
        });
      }
      if (teamBRef.current) {
        gsap.to(teamBRef.current, {
          duration: 0.5,
          scrambleText: {
            text: players.b.teamName,
            chars: "01X#$@!?%&*",
            speed: 0.4,
          },
        });
      }
    }
  };

  // Kører samme scramble-animation igen ved mouseLeave (for symmetri)
  const handleWrapperMouseLeave = () => {
    if (vsTextRef.current) {
      gsap.to(vsTextRef.current, {
        duration: 0.4,
        scrambleText: {
          text: "(VS)",
          chars: "01X#$@!?%&*",
          speed: 0.4,
        },
      });
    }
    if (players) {
      if (teamARef.current) {
        gsap.to(teamARef.current, {
          duration: 0.4,
          scrambleText: {
            text: players.a.teamName,
            chars: "01X#$@!?%&*",
            speed: 0.4,
          },
        });
      }
      if (teamBRef.current) {
        gsap.to(teamBRef.current, {
          duration: 0.4,
          scrambleText: {
            text: players.b.teamName,
            chars: "01X#$@!?%&*",
            speed: 0.4,
          },
        });
      }
    }
  };

  // ============================================================
  // Loading-tilstand: Vises mens spillerdata hentes
  // ============================================================
  if (!players) {
    return (
      <div className="w-full max-w-[480px] p-6 text-sm flex items-center gap-3">
        {/* Spinner: animate-spin roterer border-t-orange-brand om sin akse */}
        <div className="h-4 w-4 animate-spin rounded-full border border-orange-brand/20 border-t-orange-brand" />
        <span className="text-orange-soft/65">Henter næste kamp...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[560px] text-white">

      {/* Sektionshoved med POWER Ligaen label og "Næste kamp" titel */}
      <div className="mb-2 flex items-end justify-between gap-4 border-b border-orange-brand/10 pb-3 select-none">
        <div>
          <p className="text-label font-black uppercase tracking-[0.25em] text-orange-brand">POWER Ligaen</p>
          <h2 className="text-xl font-black uppercase tracking-tight text-white m-0">Næste kamp</h2>
        </div>
      </div>

      {/* Kamp-kortet: Et <a>-tag der linker til Twitch-streamen */}
      <a
        href="https://www.twitch.tv/dust2tv"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleWrapperMouseLeave}
        className="group block w-full bg-transparent cursor-pointer no-underline"
      >
        <div className="relative pt-1 pb-6">
          {/* 3-kolonne grid: Spiller A | VS-knap | Spiller B */}
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">

            {/* Spiller A (Ecstatic/nicoodoz) */}
            <PlayerShowcase {...players.a} textRef={teamARef} />

            {/* VS-knap i midten */}
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-orange-brand/25 bg-background text-xs font-black text-orange-brand sm:h-12 sm:w-12 z-25">
              {/* vsTextRef bruges til GSAP ScrambleText-animation */}
              <span ref={vsTextRef} className="select-none inline-block">
                (VS)
              </span>
            </div>

            {/* Spiller B (Sashi/zyphon) */}
            <PlayerShowcase {...players.b} textRef={teamBRef} />

          </div>
        </div>
      </a>

    </div>
  );
}
