"use client";

import { useEffect, useState } from "react";

interface TickerMatch {
  id: string;
  time: string;
  teams: string;
  stream: string;
}

const FALLBACK_MATCHES: TickerMatch[] = [
  { id: "f1", time: "Kl 19:00", teams: "Sashi vs Ecstatic", stream: "twitch.tv/dust2tv" },
  { id: "f2", time: "Kl 20:00", teams: "Tricked vs Astralis Talent", stream: "twitch.tv/dust2tv" },
  { id: "f3", time: "Kl 21:00", teams: "WOPA vs XI Esport", stream: "twitch.tv/dust2tv2" },
  { id: "f4", time: "Kl 22:00", teams: "Sashi vs Tricked", stream: "twitch.tv/dust2tv" },
  { id: "f5", time: "Kl 23:00", teams: "Ecstatic vs Astralis Talent", stream: "twitch.tv/dust2tv" },
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
          animation: horizontalSlide 150s linear infinite;
        }
        .animate-ticker-slide:hover {
          animation-play-state: paused;
        }
      `}</style>

      <aside
        className="relative flex w-full justify-start border-b border-white/10 bg-[#111111] px-4 py-4 sm:px-6 sm:py-5"
        aria-label="Sponsorer"
      >
        {/* Marquee-kampene i baggrunden */}
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center">
          {/* Fade-gradient på venstre side så kampene forsvinder ind under banneret */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#111111] to-transparent z-20 pointer-events-none" />
          
          <div className="animate-ticker-slide gap-12 pl-4">
            {marqueeItems.map((match, idx) => (
              <div
                key={`${match.id}-${idx}`}
                className="flex flex-col items-start justify-center min-w-[190px] select-none py-1"
              >
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FF6B00]">
                  {match.time}
                </span>
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white mt-1 mb-0.5">
                  {match.teams}
                </span>
                <span className="text-[10px] sm:text-xs font-bold tracking-wide text-[#FFD8B1]/45">
                  {match.stream}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsor banner på toppen */}
        <div className="relative z-10">
          <img
            src="/powerSponsorBanner.avif"
            alt="POWER Ligaen sponsor"
            className="max-h-24 w-auto max-w-full object-contain object-left sm:max-h-28"
          />
        </div>
      </aside>
    </>
  );
}