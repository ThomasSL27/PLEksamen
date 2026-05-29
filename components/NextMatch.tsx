"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Registrer GSAP plugin (kun på klientsiden)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// -------------------------------------------
// Typer
// -------------------------------------------
type MatchPlayer = {
  teamName: string;
  teamLogo: string;
  nickname: string;
  image: string;
};

// Standard Spiller Ikon
function DefaultPlayerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

// ==================================================
// Spiller Showcase (Frit svævende)
// ==================================================
function PlayerShowcase({
  teamName,
  teamLogo,
  nickname,
  image,
  textRef,
}: MatchPlayer & { textRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div className="group relative flex flex-col items-center select-none">
      
      {/* Stor dæmpet holdlogo i baggrunden */}
      {teamLogo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 opacity-10 pointer-events-none transition-transform duration-750 ease-out group-hover:scale-110">
          <img
            src={teamLogo}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Spiller container */}
      <div className="relative h-56 w-40 sm:h-72 sm:w-56 z-10 flex items-end justify-center">
        {image ? (
          <img
            src={image}
            alt={nickname}
            className="h-full w-full object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center pb-12 transition-transform duration-500 group-hover:scale-110">
            <DefaultPlayerIcon className="h-20 w-20 text-orange-brand/20 animate-pulse" />
          </div>
        )}
      </div>

      {/* Holdnavn under spilleren med Scramble-reference */}
      <span
        ref={textRef}
        className="mt-4 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-soft/90 transition-colors duration-300 group-hover:text-orange-brand z-20 h-5 overflow-hidden block select-none"
      >
        {teamName}
      </span>
      
    </div>
  );
}

// ==================================================
// Hovedkomponent
// ==================================================
export default function NextMatch() {
  const [players, setPlayers] = useState<{ a: MatchPlayer; b: MatchPlayer } | null>(null);
  const vsTextRef = useRef<HTMLDivElement>(null);
  const teamARef = useRef<HTMLSpanElement>(null);
  const teamBRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const toLower = (value: string) => value.toLowerCase();
    async function loadNextMatchPlayers() {
      try {
        const res = await fetch("/api/powerstats");
        const json = await res.json();
        const seasons = json?.data;
        if (!Array.isArray(seasons)) return;
        const season = seasons.find(
          (s: any) =>
            String(s?.name || "").includes("Sæson 31") &&
            toLower(String(s?.name || "")).includes("grundspil")
        );
        if (!season?.teams) return;
        
        const findTeam = (key: string) =>
          season.teams.find((t: any) =>
            toLower(String(t?.shortName || t?.name || "")).includes(key)
          );
        const findPlayer = (team: any, nick: string) =>
          team?.lineups?.players?.find(
            (p: any) => toLower(String(p?.nickname || "")) === nick
          );
          
        const ecstatic = findTeam("ecstatic");
        const sashi = findTeam("sashi");
        const nicoodoz = findPlayer(ecstatic, "nicoodoz");
        const zyphon = findPlayer(sashi, "zyphon");
        if (!ecstatic || !sashi || !nicoodoz || !zyphon) return;
        
        setPlayers({
          a: {
            teamName: ecstatic.shortName || ecstatic.name,
            teamLogo: ecstatic.logoUrl || "",
            nickname: nicoodoz.nickname,
            image: nicoodoz.image || "",
          },
          b: {
            teamName: sashi.shortName || sashi.name,
            teamLogo: sashi.logoUrl || "",
            nickname: zyphon.nickname,
            image: zyphon.image || "",
          },
        });
      } catch {
        // Fallback
      }
    }
    loadNextMatchPlayers();
  }, []);

  // GSAP Scramble Text – trigges synkront for alle tekster
  const handleWrapperMouseEnter = () => {
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

  if (!players) {
    return (
      <div className="w-full max-w-[480px] p-6 text-sm flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border border-orange-brand/20 border-t-orange-brand" />
        <span className="text-orange-soft/65">Henter næste kamp...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[560px] text-white">
      
      {/* Sektion Info – Nu placeret HELT uden for linket for at undgå at dingle/skubbe sig under hover */}
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-orange-brand/10 pb-3 select-none">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-brand">POWER Ligaen</p>
          <h2 className="text-xl font-black uppercase tracking-tight text-white m-0">Næste kamp</h2>
        </div>
      </div>

      {/* Interaktiv Kamp-Anchor */}
      <a
        href="https://www.twitch.tv/dust2tv"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleWrapperMouseLeave}
        className="group block w-full bg-transparent cursor-pointer no-underline"
      >
        <div className="relative py-6">
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">

            {/* Spiller 1 */}
            <PlayerShowcase {...players.a} textRef={teamARef} />

            {/* Svævende VS-indikator */}
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-orange-brand/25 bg-background text-xs font-black text-orange-brand sm:h-12 sm:w-12 z-25">
              <span ref={vsTextRef} className="select-none inline-block">
                (VS)
              </span>
            </div>

            {/* Spiller 2 */}
            <PlayerShowcase {...players.b} textRef={teamBRef} />

          </div>
        </div>
      </a>

    </div>
  );
}