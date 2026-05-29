"use client";

import { useEffect, useState } from "react";

// -------------------------------------------
// Typer
// -------------------------------------------
interface TickerMatch {
  id: string;
  date: string;
  time: string;
  teams: string;
  stream: string;
}

// Realistiske testdata til brug ved din eksamensfremvisning
const FALLBACK_MATCHES: TickerMatch[] = [
  { id: "f1", date: "16. jun", time: "Kl 19:00", teams: "Sashi vs Ecstatic", stream: "twitch.tv/dust2tv" },
  { id: "f2", date: "16. jun", time: "Kl 20:00", teams: "Tricked vs Astralis Talent", stream: "twitch.tv/dust2tv" },
  { id: "f3", date: "17. jun", time: "Kl 21:00", teams: "WOPA vs XI Esport", stream: "twitch.tv/dust2tv2" },
  { id: "f4", date: "17. jun", time: "Kl 22:00", teams: "Sashi vs Tricked", stream: "twitch.tv/dust2tv" },
  { id: "f5", date: "18. jun", time: "Kl 23:00", teams: "Ecstatic vs Astralis Talent", stream: "twitch.tv/dust2tv" },
];

export default function SponsorBanner() {
  const [matches, setMatches] = useState<TickerMatch[]>(FALLBACK_MATCHES);

  useEffect(() => {
    async function loadMatchesForTicker() {
      try {
        const res = await fetch("/api/powerstats?type=a/31");
        if (!res.ok) return;

        const json = await res.json();
        const seasons = json?.data;
        if (!Array.isArray(seasons)) return;

        const season = seasons.find(
          (s: any) =>
            String(s?.name || "").includes("Sæson 31") &&
            String(s?.name || "").toLowerCase().includes("grundspil")
        );
        if (!season?.matches || !season?.teams) return;

        const mapped: TickerMatch[] = season.matches
          .filter((m: any) => m.startDate)
          .map((m: any) => {
            const t1 = season.teams.find((t: any) => t._id === m.team1);
            const t2 = season.teams.find((t: any) => t._id === m.team2);
            
            const dateObj = new Date(m.startDate);
            const formattedDate = dateObj.toLocaleDateString("da-DK", {
              day: "numeric",
              month: "short",
            });
            const formattedTime = dateObj.toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit",
            });

            let streamUrlClean = "twitch.tv/dust2tv";
            if (m.streamUrl) {
              streamUrlClean = m.streamUrl
                .replace(/^https?:\/\/(www\.)?/, "")
                .split("/")[0] + "/dust2tv";
            }

            return {
              id: m._id,
              date: formattedDate,
              time: `Kl ${formattedTime}`,
              teams: `${t1?.shortName || "Ukendt"} vs ${t2?.shortName || "Ukendt"}`,
              stream: streamUrlClean,
            };
          });

        if (mapped.length > 0) {
          setMatches(mapped);
        }
      } catch {
        // Fallback forbliver aktiv ved databasefejl
      }
    }

    loadMatchesForTicker();
  }, []);

  // Vi dobler elementerne op for at skabe et flydende, uafbrudt loop
  const marqueeItems = [...matches, ...matches, ...matches, ...matches];

  return (
    <>
      {/* Horisontal CSS-marquee: ruller fra højre mod venstre */}
      <style>{`
        @keyframes horizontalSlide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker-slide {
          display: flex;
          width: max-content;
          animation: horizontalSlide 120s linear infinite;
        }
        .animate-ticker-slide:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Sektion – mb-8 sm:mb-12 tilføjet for at genskabe den oprindelige afstand til indholdet under */}
      <aside
        className="relative flex w-full justify-between items-center border-b border-white/10 bg-background overflow-hidden h-24 sm:h-28 mb-8 sm:mb-12"
        aria-label="Sponsorer"
      >
        
        {/* 1. KAMP-TICKER (Z-index 10 - Går uforstyrret helt ind under banneret) */}
        <div className="absolute inset-0 z-10 flex items-center pl-16 sm:pl-28">
          <div className="animate-ticker-slide gap-12">
            {marqueeItems.map((match, idx) => (
              <div
                key={`${match.id}-${idx}`}
                className="flex flex-col items-start justify-center min-w-[190px] select-none py-1"
              >
                {/* 1. Dato (øverst) */}
                <span className="text-2xs sm:text-label font-bold uppercase tracking-wider text-orange-soft/50">
                  {match.date}
                </span>
                {/* 2. Tidspunkt */}
                <span className="text-label sm:text-xs font-black uppercase tracking-wider text-orange-brand">
                  {match.time}
                </span>
                
                {/* 2. Kamp og hold (midten) */}
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white mt-1 mb-0.5 whitespace-nowrap">
                  {match.teams}
                </span>
                
                {/* 3. Stream link (nederst) */}
                <span className="text-label sm:text-xs font-bold tracking-wide text-orange-soft/45">
                  {match.stream}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. MØRK MASKE (Z-index 15 - Ligger under sponsoren, men oven på kampene, og stopper midtvejs) */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-36 bg-background z-15 pointer-events-none" />
        <div className="absolute inset-y-0 left-24 sm:left-36 w-16 bg-gradient-to-r from-background to-transparent z-15 pointer-events-none" />

        {/* 3. SPONSOR BANNER (Z-index 20 - Placeret yderst til venstre på gennemsigtig baggrund) */}
        <div className="relative z-20 flex items-center h-full pointer-events-none">
          <img 
            src="/powerSponsorBanner.avif" 
            alt="POWER Ligaen sponsor" 
            className="max-h-24 sm:max-h-28 w-auto max-w-full object-contain object-left pointer-events-auto"
          />
        </div>

        {/* Fade-out i højre yderkant af skærmen for perfekt integration */}
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />

      </aside>
    </>
  );
}