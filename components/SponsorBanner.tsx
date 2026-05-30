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

      {/* Mobil: stacked (banner øverst, kamp-ticker nedenunder). Desktop: side-by-side med absolut positionering */}
      <aside
        className="relative w-full border-b border-white/10 bg-background overflow-hidden mb-8 sm:mb-12 sm:h-28"
        aria-label="Sponsorer"
      >

        {/* SPONSOR BANNER – mobil: øverste række; desktop: absolut, venstre, z-20 */}
        <div className="relative z-20 flex items-center h-20 sm:absolute sm:inset-y-0 sm:left-0 pointer-events-none">
          <img
            src="/powerSponsorBanner.avif"
            alt="POWER Ligaen sponsor"
            className="max-h-20 sm:max-h-28 w-auto max-w-full object-contain object-left pointer-events-auto"
          />
        </div>

        {/* KAMP-TICKER – mobil: nederste række; desktop: absolut overlay, z-10, padding forbi banneret */}
        <div className="relative sm:absolute sm:inset-0 sm:z-10 flex items-center sm:pl-28 overflow-hidden">
          <div className="animate-ticker-slide gap-8 sm:gap-12 pl-2 sm:pl-0">
            {marqueeItems.map((match, idx) => (
              <div
                key={`${match.id}-${idx}`}
                className="flex flex-col items-start justify-center min-w-[160px] sm:min-w-[190px] select-none py-1"
              >
                <span className="text-2xs sm:text-label font-bold uppercase tracking-wider text-orange-soft/50">
                  {match.date}
                </span>
                <span className="text-label sm:text-xs font-black uppercase tracking-wider text-orange-brand">
                  {match.time}
                </span>
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white mt-0.5 sm:mt-1 mb-0 sm:mb-0.5 whitespace-nowrap">
                  {match.teams}
                </span>
                <span className="text-label sm:text-xs font-bold tracking-wide text-orange-soft/45">
                  {match.stream}
                </span>
              </div>
            ))}
          </div>
          {/* Mobil: subtile side-fades på ticker-rækken */}
          <div className="sm:hidden absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="sm:hidden absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Desktop: mørk maske der skjuler ticker bag banneret */}
        <div className="hidden sm:block absolute inset-y-0 left-0 w-24 sm:w-36 bg-background z-15 pointer-events-none" />
        <div className="hidden sm:block absolute inset-y-0 left-24 sm:left-36 w-16 bg-gradient-to-r from-background to-transparent z-15 pointer-events-none" />

        {/* Desktop: fade-out i højre yderkant */}
        <div className="hidden sm:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />

      </aside>
    </>
  );
}