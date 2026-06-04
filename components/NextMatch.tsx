// ============================================================
// NextMatch: components/NextMatch.tsx
// Viser det næste store opgør på forsiden med spillercutouts.
// Henter spillerbilleder fra seasons-prop'en (API-data).
// GSAP ScrambleText animerer holdnavnene og VS-teksten ved hover.
// "use client" er nødvendigt pga. GSAP-animationer og event handlers.
// ============================================================
"use client";

// useState styrer spillerdata, useEffect henter det, useRef holder DOM-referencer
import { useEffect, useState, useRef } from "react";
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from "gsap";
// ScrambleTextPlugin animerer tekst ved at vise tilfældige tegn
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
// Typer: Beskriver en spiller der vises i kampvisningen
// ============================================================
// MatchPlayer beskriver de oplysninger vi har brug for om én spiller
type MatchPlayer = {
  teamName: string;  // Holdets korte navn, fx "Ecstatic"
  teamLogo: string;  // URL til holdlogoet
  nickname: string;  // Spillerens kaldenavn
  image: string;     // URL til spillerbilledet
};

// ============================================================
// PlayerShowcase: Viser én spiller med holdlogo i baggrunden
// textRef sendes ind så forælderkomponenten kan animere holdnavnet
// ============================================================
function PlayerShowcase({
  teamName,
  teamLogo,
  nickname,
  image,
  textRef,
}: MatchPlayer & { textRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    // group-klassen aktiverer group-hover effekter på child-elementer
    <div className="group relative flex flex-col items-center select-none">

      {/* Stort dæmpet holdlogo i baggrunden — skaleres op ved hover */}
      {/* pointer-events-none forhindrer at logoet blokerer klik */}
      {teamLogo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 opacity-10 pointer-events-none transition-transform duration-750 ease-out group-hover:scale-110">
          <img
            src={teamLogo}
            // Tom alt-tekst fordi logoet er dekorativt (det rigtige logo vises andetsteds)
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Spillerbillede — skaleres op ved hover via group-hover */}
      <div className="relative h-56 w-40 sm:h-72 sm:w-56 z-10 flex items-end justify-center">
        {/* Viser billedet kun hvis image er en ikke-tom streng */}
        {image ? (
          <img
            src={image}
            alt={nickname}
            // object-bottom viser bunden af billedet (spillerens krop)
            className="h-full w-full object-contain object-bottom transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : null}
      </div>

      {/* Holdnavn — ref bruges af GSAP til ScrambleText-animation i forælderkomponenten */}
      <span
        ref={textRef}
        // h-5 overflow-hidden afgrænser højden for GSAP-animationen
        className="mt-4 text-xs sm:text-sm font-black uppercase tracking-widest text-orange-soft/90 transition-colors duration-300 group-hover:text-orange-brand z-20 h-5 overflow-hidden block select-none"
      >
        {teamName}
      </span>

    </div>
  );
}

// ============================================================
// NextMatch: Henter og viser de to hold i "næste kamp" kortet
// seasons prop sendes fra forsidens useEffect (app/page.tsx)
// ============================================================
export default function NextMatch({ seasons }: { seasons: ApiSeason[] | null }) {
  // players er null mens data hentes — opdateres med begge spilleres data
  const [players, setPlayers] = useState<{ a: MatchPlayer; b: MatchPlayer } | null>(null);
  // vsTextRef er en reference til "(VS)" teksten — animeres med GSAP
  const vsTextRef = useRef<HTMLDivElement>(null);
  // teamARef er en reference til Hold A's holdnavn — animeres med GSAP
  const teamARef = useRef<HTMLSpanElement>(null);
  // teamBRef er en reference til Hold B's holdnavn — animeres med GSAP
  const teamBRef = useRef<HTMLSpanElement>(null);

  // ============================================================
  // Dataudtrækning: Finder specifikke spillere fra API-dataen
  // Kører når seasons-prop'en opdateres fra forsiden
  // ============================================================
  useEffect(() => {
    // Stopper hvis seasons endnu ikke er hentet
    if (!seasons) return;
    // Lokal hjælpefunktion til case-insensitiv sammenligning
    const toLower = (value: string) => value.toLowerCase();
    try {
      // Finder Sæson 31 Grundspil i det samlede seasons-array
      const season = seasons.find(
        s =>
          String(s?.name || "").includes("Sæson 31") &&
          toLower(String(s?.name || "")).includes("grundspil")
      );
      // Stopper hvis sæsonen ikke er fundet
      if (!season?.teams) return;

      // Henter hold-arrayet fra den fundne sæson
      const teams = season.teams!;
      // Finder Ecstatic-holdet via case-insensitiv navn-matching
      const ecstatic = teams.find(t => toLower(String(t.shortName || t.name || "")).includes("ecstatic"));
      // Finder Sashi-holdet via case-insensitiv navn-matching
      const sashi = teams.find(t => toLower(String(t.shortName || t.name || "")).includes("sashi"));
      // Finder den specifikke spiller "nicoodoz" i Ecstatic's lineup
      const nicoodoz = ecstatic?.lineups?.players?.find(p => toLower(String(p.nickname || "")) === "nicoodoz");
      // Finder den specifikke spiller "zyphon" i Sashi's lineup
      const zyphon = sashi?.lineups?.players?.find(p => toLower(String(p.nickname || "")) === "zyphon");
      // Stopper hvis et af holdene eller spillerne ikke kan findes
      if (!ecstatic || !sashi || !nicoodoz || !zyphon) return;

      // Opdaterer state med de fundne spilleres data
      setPlayers({
        a: {
          // || "" giver tom streng som fallback hvis feltet er undefined
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
      // Ignorerer fejl lydløst — loading-spinner vises fortsat
    }
  }, [seasons]); // [seasons]: Kører igen når seasons-prop'en ændres

  // ============================================================
  // GSAP ScrambleText hover-effekter
  // Animerer VS-tekst og begge holdnavne når musen er over kortet
  // ============================================================
  const handleWrapperMouseEnter = () => {
    // Animerer "(VS)" teksten med ScrambleText-effekten
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
    // Animerer begge holdnavne hvis spillerdata er tilgængeligt
    if (players) {
      // Animerer Hold A's holdnavn
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
      // Animerer Hold B's holdnavn
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

  // Kører samme scramble-animation igen ved mouseLeave for symmetri
  const handleWrapperMouseLeave = () => {
    // Gentager animation af VS-teksten
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
    // Gentager animation af holdnavnene
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
  // Returnerer tidligt med en spinner-komponent
  // ============================================================
  if (!players) {
    return (
      <div className="w-full max-w-[480px] p-6 text-sm flex items-center gap-3">
        {/* Spinner: animate-spin roterer border-t-orange-brand */}
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
          {/* Sektionsmærkat i lille orange tekst */}
          <p className="text-label font-black uppercase tracking-[0.25em] text-orange-brand">POWER Ligaen</p>
          {/* H2 overskrift */}
          <h2 className="text-xl font-black uppercase tracking-tight text-white m-0">Næste kamp</h2>
        </div>
      </div>

      {/* Kamp-kortet: Et <a>-tag der linker til Twitch-streamen */}
      <a
        href="https://www.twitch.tv/dust2tv"
        target="_blank"
        rel="noopener noreferrer"
        // Kalder GSAP hover-effekter ved mouseEnter/Leave
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleWrapperMouseLeave}
        className="group block w-full bg-transparent cursor-pointer no-underline"
      >
        <div className="relative pt-1 pb-6">
          {/* Tre-kolonne grid: Spiller A | VS-knap | Spiller B */}
          {/* grid-cols-[1fr_auto_1fr]: Midterste kolonne er kun så bred som dens indhold */}
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">

            {/* Spiller A (Ecstatic/nicoodoz) */}
            {/* Spread-operator (...players.a) sender alle MatchPlayer-props til PlayerShowcase */}
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
