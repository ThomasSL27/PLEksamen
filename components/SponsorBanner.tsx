// ============================================================
// SponsorBanner: components/SponsorBanner.tsx
// En kombineret komponent der viser:
// 1. Sponsor-bannerbillede (POWER logo til venstre)
// 2. En automatisk løbende kamp-ticker med kommende kampe
// Vises på alle sider via layout.tsx, under navigationen.
// "use client" er nødvendigt fordi vi bruger useState og useEffect.
// ============================================================
"use client";
import { useEffect, useState } from "react";

// ============================================================
// Typer: Beskriver strukturen af en kamp i tickeren
// ============================================================
interface TickerMatch {
  id: string;
  date: string;   // Formateret dato, fx "16. jun"
  time: string;   // Formateret tid, fx "Kl 19:00"
  teams: string;  // "Hold A vs Hold B"
  stream: string; // Stream-URL, fx "twitch.tv/dust2tv"
}

// ============================================================
// Fallback-data: Vises hvis API-kaldet fejler
// Sikrer at tickeren altid har noget at vise
// ============================================================
const FALLBACK_MATCHES: TickerMatch[] = [
  { id: "f1", date: "16. jun", time: "Kl 19:00", teams: "Sashi vs Ecstatic", stream: "twitch.tv/dust2tv" },
  { id: "f2", date: "16. jun", time: "Kl 20:00", teams: "Tricked vs Astralis Talent", stream: "twitch.tv/dust2tv" },
  { id: "f3", date: "17. jun", time: "Kl 21:00", teams: "WOPA vs XI Esport", stream: "twitch.tv/dust2tv2" },
  { id: "f4", date: "17. jun", time: "Kl 22:00", teams: "Sashi vs Tricked", stream: "twitch.tv/dust2tv" },
  { id: "f5", date: "18. jun", time: "Kl 23:00", teams: "Ecstatic vs Astralis Talent", stream: "twitch.tv/dust2tv" },
];

export default function SponsorBanner() {
  // matches starter med fallback-data og opdateres hvis API-data er tilgængeligt
  const [matches, setMatches] = useState<TickerMatch[]>(FALLBACK_MATCHES);

  // ============================================================
  // Datahentning: Henter kommende kampe fra vores interne API
  // ============================================================
  useEffect(() => {
    async function loadMatchesForTicker() {
      try {
        // Henter Sæson 31 data fra vores interne API (type=a/31)
        const res = await fetch("/api/powerstats?type=a/31");
        if (!res.ok) return; // Fallback forbliver aktiv hvis API fejler

        const json = await res.json();
        const seasons = json?.data;
        if (!Array.isArray(seasons)) return;

        // Finder den specifikke Sæson 31 Grundspil-sæson
        const season = seasons.find(
          (s: any) =>
            String(s?.name || "").includes("Sæson 31") &&
            String(s?.name || "").toLowerCase().includes("grundspil")
        );
        if (!season?.matches || !season?.teams) return;

        // Mapper og formaterer kampdata til ticker-format
        const mapped: TickerMatch[] = season.matches
          .filter((m: any) => m.startDate) // Filtrerer kampe uden dato fra
          .map((m: any) => {
            // Slår holdnavne op via hold-ID
            const t1 = season.teams.find((t: any) => t._id === m.team1);
            const t2 = season.teams.find((t: any) => t._id === m.team2);

            // Konverterer ISO-dato til dansk format
            const dateObj = new Date(m.startDate);
            const formattedDate = dateObj.toLocaleDateString("da-DK", {
              day: "numeric",
              month: "short",
            });
            const formattedTime = dateObj.toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Renser stream-URL'en så kun domæne + kanal vises
            let streamUrlClean = "twitch.tv/dust2tv";
            if (m.streamUrl) {
              streamUrlClean = m.streamUrl
                .replace(/^https?:\/\/(www\.)?/, "") // Fjerner https://www.
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

        // Opdaterer kun state hvis der faktisk er kampe at vise
        if (mapped.length > 0) {
          setMatches(mapped);
        }
      } catch {
        // Fallback forbliver aktiv ved databasefejl
      }
    }

    loadMatchesForTicker();
  }, []);

  // ============================================================
  // Marquee-loop: Elementerne gentages 4 gange for et flydende,
  // uafbrudt loop — når animationen starter forfra, er der stadig
  // elementer at vise, så der ikke opstår et "hul" i tickeren.
  // ============================================================
  const marqueeItems = [...matches, ...matches, ...matches, ...matches];

  return (
    <>
      {/* ============================================================ */}
      {/* CSS-animation til den løbende ticker                          */}
      {/* horizontalSlide: Animerer fra 0% til -50% (halvvejs)          */}
      {/* Da elementerne er dubleret, ser det ud som et uendeligt loop  */}
      {/* ============================================================ */}
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
        /* Tickeren sættes på pause når brugeren holder musen over */
        .animate-ticker-slide:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ============================================================ */}
      {/* Banneret: Mobil = stacked, Desktop = side-by-side             */}
      {/* ============================================================ */}
      <aside
        className="relative w-full border-b border-white/10 bg-background overflow-hidden mb-8 sm:mb-12 sm:h-28"
        aria-label="Sponsorer"
      >

        {/* SPONSOR BANNER — vises øverst på mobil, fast til venstre på desktop */}
        <div className="relative z-20 flex items-center h-20 sm:absolute sm:inset-y-0 sm:left-0 pointer-events-none">
          <img
            src="/powerSponsorBanner.avif"
            alt="POWER Ligaen sponsor"
            className="max-h-20 sm:max-h-28 w-auto max-w-full object-contain object-left pointer-events-auto"
          />
        </div>

        {/* KAMP-TICKER — løbende kamp-feed */}
        {/* sm:pl-28 skubber tickeren forbi sponsor-banneret på desktop */}
        <div className="relative sm:absolute sm:inset-0 sm:z-10 flex items-center sm:pl-28 overflow-hidden">
          <div className="animate-ticker-slide gap-8 sm:gap-12 pl-2 sm:pl-0">
            {/* Renderer hvert kamp-element i tickeren */}
            {marqueeItems.map((match, idx) => (
              <div
                key={`${match.id}-${idx}`}
                className="flex flex-col items-start justify-center min-w-[160px] sm:min-w-[190px] select-none py-1"
              >
                {/* Dato */}
                <span className="text-2xs sm:text-label font-bold uppercase tracking-wider text-orange-soft/50">
                  {match.date}
                </span>
                {/* Tidspunkt — fremhævet i orange */}
                <span className="text-label sm:text-xs font-black uppercase tracking-wider text-orange-brand">
                  {match.time}
                </span>
                {/* Hold-navne */}
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white mt-0.5 sm:mt-1 mb-0 sm:mb-0.5 whitespace-nowrap">
                  {match.teams}
                </span>
                {/* Stream URL */}
                <span className="text-label sm:text-xs font-bold tracking-wide text-orange-soft/45">
                  {match.stream}
                </span>
              </div>
            ))}
          </div>
          {/* Subtile side-fades på ticker-rækken på mobil */}
          <div className="sm:hidden absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="sm:hidden absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Desktop: Mørk maske der skjuler tickeren bag sponsor-banneret */}
        <div className="hidden sm:block absolute inset-y-0 left-0 w-24 sm:w-36 bg-background z-15 pointer-events-none" />
        {/* Blød overgang fra maske til ticker */}
        <div className="hidden sm:block absolute inset-y-0 left-24 sm:left-36 w-16 bg-gradient-to-r from-background to-transparent z-15 pointer-events-none" />

        {/* Desktop: Fade-out i højre yderkant for at skjule afskæring */}
        <div className="hidden sm:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />

      </aside>
    </>
  );
}
