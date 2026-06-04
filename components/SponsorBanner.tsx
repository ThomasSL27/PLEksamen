// ============================================================
// SponsorBanner: components/SponsorBanner.tsx
// En kombineret komponent der viser:
// 1. Sponsor-bannerbillede (POWER logo til venstre)
// 2. En automatisk løbende kamp-ticker med kommende kampe
// Vises på alle sider via layout.tsx, under navigationen.
// "use client" er nødvendigt fordi vi bruger useState og useEffect.
// ============================================================
"use client";
// useState styrer tickerens kamp-data, useEffect henter data fra API'et
import { useEffect, useState } from "react";

// ============================================================
// Typer: Beskriver strukturen af én kamp i tickeren
// ============================================================
// TickerMatch er den formaterede repræsentation af en kamp til tickeren
interface TickerMatch {
  id: string;
  date: string;   // Formateret dato, fx "16. jun"
  time: string;   // Formateret tid med "Kl" prefix, fx "Kl 19:00"
  teams: string;  // "Hold A vs Hold B" som én streng
  stream: string; // Stream-URL i forkortet format, fx "twitch.tv/dust2tv"
}

// ============================================================
// Fallback-data: Vises hvis API-kaldet fejler eller data mangler
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
  // matches starter med fallback-data og opdateres når API-data er hentet
  const [matches, setMatches] = useState<TickerMatch[]>(FALLBACK_MATCHES);

  // ============================================================
  // Datahentning: Henter kommende kampe fra vores interne API
  // ============================================================
  useEffect(() => {
    // Definerer async funktion inde i useEffect
    async function loadMatchesForTicker() {
      try {
        // Henter Sæson 31 data fra den interne API-route
        const res = await fetch("/api/powerstats?type=a/31");
        // Returnerer tidligt hvis svaret ikke er OK — fallback forbliver aktiv
        if (!res.ok) return;

        // Parser svaret som JSON
        const json = await res.json();
        // Udtrækker sæson-arrayet
        const seasons = json?.data;
        // Stopper hvis data ikke er et array
        if (!Array.isArray(seasons)) return;

        // Finder Sæson 31 Grundspil via navn-matching
        const season = seasons.find(
          (s: any) =>
            String(s?.name || "").includes("Sæson 31") &&
            String(s?.name || "").toLowerCase().includes("grundspil")
        );
        // Stopper hvis sæsonen ikke er fundet eller mangler kampe/hold
        if (!season?.matches || !season?.teams) return;

        // Mapper API-kampdata til ticker-format
        const mapped: TickerMatch[] = season.matches
          // Filtrerer kampe uden startDate da vi ikke kan formatere datoen
          .filter((m: any) => m.startDate)
          .map((m: any) => {
            // Slår hold 1 op i teams-arrayet via ID
            const t1 = season.teams.find((t: any) => t._id === m.team1);
            // Slår hold 2 op på samme måde
            const t2 = season.teams.find((t: any) => t._id === m.team2);

            // Opretter et Date-objekt fra ISO-datostrengen
            const dateObj = new Date(m.startDate);
            // Formaterer datoen til dansk, fx "16. jun"
            const formattedDate = dateObj.toLocaleDateString("da-DK", {
              day: "numeric",
              month: "short",
            });
            // Formaterer tidspunktet til dansk, fx "19:00"
            const formattedTime = dateObj.toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Renser stream-URL'en: Fjerner https://www. og tilføjer /dust2tv
            let streamUrlClean = "twitch.tv/dust2tv";
            if (m.streamUrl) {
              // replace() fjerner protokol og www-prefix
              // split("/")[0] beholder kun domænet (fx "twitch.tv")
              streamUrlClean = m.streamUrl
                .replace(/^https?:\/\/(www\.)?/, "")
                .split("/")[0] + "/dust2tv";
            }

            // Returnerer det formaterede ticker-objekt
            return {
              id: m._id,
              date: formattedDate,
              // "Kl " prefix tilføjes foran tidspunktet
              time: `Kl ${formattedTime}`,
              // || "Ukendt" som fallback hvis holdet ikke kan slås op
              teams: `${t1?.shortName || "Ukendt"} vs ${t2?.shortName || "Ukendt"}`,
              stream: streamUrlClean,
            };
          });

        // Opdaterer kun state hvis vi faktisk fandt kampe at vise
        if (mapped.length > 0) {
          setMatches(mapped);
        }
      } catch {
        // Ignorerer fejl lydløst — fallback-data er stadig aktiv
      }
    }

    // Starter datahentningen
    loadMatchesForTicker();
  }, []); // Tomt array: kører kun én gang ved første render

  // ============================================================
  // Marquee-loop: Elementerne gentages 4 gange for et flydende loop
  // Spread-operatoren (...) kopierer arrayet og sætter det bagefter sig selv
  // Når animationen er halvvejs, er de originale elementer stadig synlige,
  // så der ikke opstår et "hul" når animationen starter forfra
  // ============================================================
  const marqueeItems = [...matches, ...matches, ...matches, ...matches];

  return (
    <>
      {/* ============================================================ */}
      {/* CSS-animation til den løbende ticker                          */}
      {/* Injiceres direkte i komponentens <style>-tag                 */}
      {/* ============================================================ */}
      <style>{`
        @keyframes horizontalSlide {
          0% {
            transform: translateX(0);      /* Starter i original position */
          }
          100% {
            transform: translateX(-50%);   /* Slutter halvvejs igennem (50% = ét gentagelse) */
          }
        }
        .animate-ticker-slide {
          display: flex;
          width: max-content;             /* Tillader indholdet at være bredere end viewport */
          animation: horizontalSlide 120s linear infinite; /* 120s = langsom, jævn og uendelig */
        }
        /* Ticker pauses når brugeren holder musen henover */
        .animate-ticker-slide:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ============================================================ */}
      {/* Banneret: Mobil = stacked (billede over ticker),              */}
      {/* Desktop = side-by-side (billede til venstre, ticker til højre)*/}
      {/* ============================================================ */}
      <aside
        className="relative w-full border-b border-white/10 bg-background overflow-hidden mb-8 sm:mb-12 sm:h-28"
        aria-label="Sponsorer"
      >

        {/* SPONSOR BANNER: Billede til venstre på desktop */}
        {/* sm:absolute sm:inset-y-0 sm:left-0: Fast til venstre på desktop */}
        <div className="relative z-20 flex items-center h-20 sm:absolute sm:inset-y-0 sm:left-0 pointer-events-none">
          <img
            src="/powerSponsorBanner.avif"
            alt="POWER Ligaen sponsor"
            // pointer-events-auto overskriver pointer-events-none fra forældre-div
            className="max-h-20 sm:max-h-28 w-auto max-w-full object-contain object-left pointer-events-auto"
          />
        </div>

        {/* KAMP-TICKER: Løbende feed med kampinformation */}
        {/* sm:pl-28 skubber tickeren forbi sponsor-banneret på desktop */}
        <div className="relative sm:absolute sm:inset-0 sm:z-10 flex items-center sm:pl-28 overflow-hidden">
          {/* animate-ticker-slide-klassen aktiverer CSS-animationen */}
          <div className="animate-ticker-slide gap-8 sm:gap-12 pl-2 sm:pl-0">
            {/* Renderers hvert kamp-element i tickeren */}
            {marqueeItems.map((match, idx) => (
              <div
                // key kombinerer match.id og idx da match.id gentages 4 gange
                key={`${match.id}-${idx}`}
                className="flex flex-col items-start justify-center min-w-[160px] sm:min-w-[190px] select-none py-1"
              >
                {/* Dato i lille dæmpet tekst */}
                <span className="text-2xs sm:text-label font-bold uppercase tracking-wider text-orange-soft/50">
                  {match.date}
                </span>
                {/* Tidspunkt i orange fed tekst */}
                <span className="text-label sm:text-xs font-black uppercase tracking-wider text-orange-brand">
                  {match.time}
                </span>
                {/* Hold-navne i stor hvid tekst — whitespace-nowrap forhindrer linjeskift */}
                <span className="text-sm sm:text-base font-black uppercase tracking-tight text-white mt-0.5 sm:mt-1 mb-0 sm:mb-0.5 whitespace-nowrap">
                  {match.teams}
                </span>
                {/* Stream URL i lille dæmpet tekst */}
                <span className="text-label sm:text-xs font-bold tracking-wide text-orange-soft/45">
                  {match.stream}
                </span>
              </div>
            ))}
          </div>
          {/* Gradient-fades på siderne (kun mobil) for at skjule kantafskæring */}
          <div className="sm:hidden absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="sm:hidden absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Desktop: Mørk maske der skjuler tickeren bag sponsor-banneret */}
        {/* z-15 er over tickeren (z-10) men under banneret (z-20) */}
        <div className="hidden sm:block absolute inset-y-0 left-0 w-24 sm:w-36 bg-background z-15 pointer-events-none" />
        {/* Blød gradient-overgang fra masken til tickeren */}
        <div className="hidden sm:block absolute inset-y-0 left-24 sm:left-36 w-16 bg-gradient-to-r from-background to-transparent z-15 pointer-events-none" />

        {/* Desktop: Fade-out i højre yderkant */}
        <div className="hidden sm:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-30 pointer-events-none" />

      </aside>
    </>
  );
}
