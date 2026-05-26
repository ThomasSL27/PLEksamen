"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ==================================================
// Ikoner
// ==================================================
function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ==================================================
// Konstanter
// ==================================================
const SEASON_ENDPOINT = "a/31";
const SEASON_NAME = "Sæson 31";
const GRUNDSPIL_MATCH = "grundspil";

// ==================================================
// Hjælpefunktioner
// ==================================================
const toLower = (value?: string) => String(value || "").toLowerCase();

// ==================================================
// Typer
// ==================================================
interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

interface Match {
  _id: string;
  team1: string;
  team2: string;
  winnerId?: string;
  status?: string;
  state?: string;
  team1Score?: number;
  team2Score?: number;
  streamUrl?: string;
  startDate?: string;
}

interface Season {
  name: string;
  teams: Team[];
  matches: Match[];
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      seasons: Season[];
      selectedSeason: Season;
    };

// ==================================================
// Komponent: MatchRow
// ==================================================
function MatchRow({ match, teams }: { match: Match; teams: Team[] }) {
  const t1 = teams.find((t) => t._id === match.team1);
  const t2 = teams.find((t) => t._id === match.team2);

  if (!t1 || !t2) return null;

  const isT1Winner = match.winnerId === t1._id;
  const isT2Winner = match.winnerId === t2._id;

  return (
    <Link href={`/kampe/${match._id}`} className="block">
      <div className="group overflow-hidden rounded-xl border border-[#FF6B00]/10 bg-[#1a1a1a] p-5 transition-all duration-300 hover:border-[#FF6B00]/40 hover:bg-[#222222] cursor-pointer">
        <div className="flex items-center justify-between gap-4 text-center">
          
          {/* Hold 1 */}
          <div className="flex flex-1 flex-col items-center">
            <div
              className={`relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${
                isT1Winner ? "drop-shadow-[0_0_12px_rgba(255,107,0,0.6)]" : "opacity-80 group-hover:opacity-100"
              }`}
            >
              <img
                src={t1.logoUrl}
                alt={t1.name}
                className="h-full w-full object-contain"
              />
            </div>
            <span 
              className={`text-xs sm:text-sm font-black uppercase truncate w-full transition-colors duration-300 ${
                isT1Winner ? "text-[#FF6B00]" : "text-white"
              }`}
            >
              {t1.shortName}
            </span>
          </div>

          {/* Score Area */}
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-black tracking-tight ${
                  isT1Winner ? "text-[#FF6B00]" : "text-white"
                }`}
              >
                {match.team1Score ?? 0}
              </span>
              <span className="text-[#FF6B00]/40 text-lg font-black">-</span>
              <span
                className={`text-2xl font-black tracking-tight ${
                  isT2Winner ? "text-[#FF6B00]" : "text-white"
                }`}
              >
                {match.team2Score ?? 0}
              </span>
            </div>
            <span className="mt-1 rounded-full bg-[#FF6B00]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#FF6B00]">
              {match.state === "complete" || match.status === "finished"
                ? "Slut"
                : "LIVE"}
            </span>
          </div>

          {/* Hold 2 */}
          <div className="flex flex-1 flex-col items-center">
            <div
              className={`relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 ${
                isT2Winner ? "drop-shadow-[0_0_12px_rgba(255,107,0,0.6)]" : "opacity-80 group-hover:opacity-100"
              }`}
            >
              <img
                src={t2.logoUrl}
                alt={t2.name}
                className="h-full w-full object-contain"
              />
            </div>
            <span 
              className={`text-xs sm:text-sm font-black uppercase truncate w-full transition-colors duration-300 ${
                isT2Winner ? "text-[#FF6B00]" : "text-white"
              }`}
            >
              {t2.shortName}
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
}

// ==================================================
// Season Filter Dropdown
// ==================================================
function SeasonFilter({
  seasons,
  selectedSeason,
  onSelectSeason,
}: {
  seasons: Season[];
  selectedSeason: Season;
  onSelectSeason: (season: Season) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[#FF6B00]/30 bg-gradient-to-r from-[#FF6B00]/10 to-transparent px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-[#FFD8B1] transition-all hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/15 sm:px-5 sm:py-3"
      >
        <span className="text-[10px] text-[#FF6B00] sm:text-xs">FILTER</span>
        <ChevronIcon
          className={`h-4 w-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-[#FF6B00]/30 bg-[#0d0d0d] shadow-2xl">
          <div className="max-h-96 overflow-y-auto">
            {seasons.map((season, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectSeason(season);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-3 text-left text-sm transition-all ${
                  selectedSeason.name === season.name
                    ? "border-l-2 border-[#FF6B00] bg-[#FF6B00]/10 font-bold text-white"
                    : "border-l-2 border-transparent text-[#FFD8B1]/70 hover:bg-[#1a1a1a] hover:text-[#FFD8B1]"
                }`}
              >
                {season.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================================================
// Main Page
// ==================================================
export default function KampePage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData?.error || `API fejl: ${res.status} ${res.statusText}`
          );
        }

        const json = await res.json();
        const seasons: Season[] = json.data;

        if (!Array.isArray(seasons)) {
          throw new Error("Ugyldigt svar fra API");
        }

        // Find Grundspillet som default
        const grundspil = seasons.find((s: any) =>
          toLower(s.name).includes(GRUNDSPIL_MATCH)
        );

        if (!grundspil?.teams?.length || !grundspil?.matches?.length) {
          throw new Error("Fandt ikke kampe for Grundsspillet i Sæson 31");
        }

        setState({
          status: "ok",
          seasons,
          selectedSeason: grundspil,
        });
      } catch (e: unknown) {
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    fetchData();
  }, []);

  const handleSeasonChange = (newSeason: Season) => {
    if (state.status === "ok") {
      setState({
        status: "ok",
        seasons: state.seasons,
        selectedSeason: newSeason,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#111111]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-[#FF6B00] opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-[#FF6B00] opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#FF6B00] sm:text-xs">
              Power Ligaen • {SEASON_NAME}
            </p>
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
              Kampprogram
            </h1>
            <div className="mt-2 h-0.5 w-16 rounded-full bg-[#FF6B00] sm:w-20" />
          </div>

          {state.status === "ok" && (
            <SeasonFilter
              seasons={state.seasons}
              selectedSeason={state.selectedSeason}
              onSelectSeason={handleSeasonChange}
            />
          )}
        </header>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00]/20 border-t-[#FF6B00]" />
              <p className="text-sm text-[#FFD8B1]/60">
                Henter kampe for {SEASON_NAME}…
              </p>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              <p className="text-sm text-red-400">{state.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-full bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-[#111111]"
              >
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {state.status === "ok" && state.selectedSeason && (
          <section>
            <h2 className="mb-6 text-xs font-black uppercase tracking-widest text-[#FF6B00] sm:text-sm">
              {state.selectedSeason.name}{" "}
              <span className="font-medium normal-case text-[#FFD8B1]/40">
                ({state.selectedSeason.matches?.length || 0} kampe)
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {state.selectedSeason.matches && state.selectedSeason.matches.length > 0 ? (
                state.selectedSeason.matches.map((match) => (
                  <MatchRow
                    key={match._id}
                    match={match}
                    teams={state.selectedSeason.teams}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-lg border border-[#FF6B00]/10 bg-[#1a1a1a] p-8 text-center">
                  <p className="text-sm text-[#FFD8B1]/40">
                    Ingen kampe fundet for denne ligaen
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}