"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ==================================================
// Konstanter
// ==================================================
const SEASON_ENDPOINT = "a/31";

// ==================================================
// Hjælpefunktioner
// ==================================================
const toLower = (value?: string) => String(value || "").toLowerCase();

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (timeString?: string) => {
  if (!timeString) return "";
  return new Date(timeString).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getVetoTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    pickBanTeam: "Starthold",
    ban: "Ban",
    pick: "Pick",
  };
  return labels[type] || type;
};

// Returnerer den korrekte sti til et banebillede i .webp-format
const getMapImageUrl = (mapName: string) => {
  if (!mapName) return "/maps/default.webp";
  const formattedName = mapName.trim().toLowerCase();
  return `/maps/${formattedName}.webp`;
};

// ==================================================
// Typer
// ==================================================
interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

interface MapData {
  map: string;
  demos?: string[];
  team1Score?: number;
  team2Score?: number;
}

interface Player {
  _id: string;
  nickname: string;
  name?: string;
  avatar?: string;
}

interface Veto {
  type: string;
  teamId: string;
  side?: string;
  time: string;
  _id: string;
  map?: string;
}

interface Match {
  _id: string;
  team1: string;
  team2: string;
  winnerId?: string;
  state?: string;
  status?: string;
  team1Score?: number;
  team2Score?: number;
  startDate?: string;
  streamUrl?: string;
  maps?: MapData[];
  veto?: Veto[];
  lineups?: {
    team1?: Player[];
    team2?: Player[];
  };
}

interface LeagueData {
  name: string;
  teams: Team[];
  matches: Match[];
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; match: Match; teams: Team[]; leagueName: string };

// ==================================================
// Komponenter
// ==================================================

function VetoSection({ veto, teams }: { veto: Veto[]; teams: Team[] }) {
  return (
    <div className="space-y-3">
      {veto.map((action, idx) => {
        const team = teams.find((t) => t._id === action.teamId);
        const mapText = action.map ? ` ${action.map}` : "";
        return (
          <div key={action._id || idx} className="flex items-start gap-3">
            <span className="font-bold text-[#FF6B00] text-sm flex-shrink-0 w-6">
              {idx + 1}.
            </span>
            <p className="text-sm text-white">
              <span className="font-bold">{team?.shortName || team?.name}</span>{" "}
              <span
                className={`font-semibold ${
                  action.type === "ban"
                    ? "text-red-400"
                    : action.type === "pick"
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {getVetoTypeLabel(action.type).toLowerCase()}
              </span>
              <span className="text-[#FFD8B1]/70">{mapText}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

function LineupSection({
  lineup,
  teamName,
}: {
  lineup: Player[];
  teamName: string;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-white uppercase">{teamName}</h4>
      <div className="grid grid-cols-2 gap-2">
        {lineup.map((player) => (
          <div
            key={player._id}
            className="rounded-lg border border-[#FF6B00]/10 bg-[#1a1a1a] p-3"
          >
            <p className="text-xs font-bold text-white">{player.nickname}</p>
            {player.name && (
              <p className="text-[10px] text-[#FFD8B1]/50">{player.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================================================
// Main Page (Kampdetaljer)
// ==================================================
export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
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
        const seasons: LeagueData[] = json.data;

        if (!Array.isArray(seasons)) {
          throw new Error("Ugyldigt svar fra API");
        }

        let foundMatch: Match | undefined;
        let foundLeague: LeagueData | undefined;

        for (const season of seasons) {
          const match = season.matches?.find((m: Match) => m._id === id);
          if (match) {
            foundMatch = match;
            foundLeague = season;
            break;
          }
        }

        if (!foundMatch || !foundLeague) {
          throw new Error("Kamp blev ikke fundet");
        }

        setState({
          status: "ok",
          match: foundMatch,
          teams: foundLeague.teams,
          leagueName: foundLeague.name,
        });
      } catch (e: unknown) {
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    fetchData();
  }, [id]);

  const t1 = state.status === "ok" ? state.teams.find((t) => t._id === state.match.team1) : null;
  const t2 = state.status === "ok" ? state.teams.find((t) => t._id === state.match.team2) : null;
  const isT1Winner = state.status === "ok" ? state.match.winnerId === t1?._id : false;
  const isT2Winner = state.status === "ok" ? state.match.winnerId === t2?._id : false;
  const isComplete = state.status === "ok" ? (state.match.state === "complete" || state.match.status === "finished") : false;

  return (
    <main className="min-h-screen bg-[#111111]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-[#FF6B00] opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-[#FF6B00] opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <header className="mb-8">
          <Link
            href="/kampe"
            className="inline-flex items-center gap-2 text-[#FF6B00] hover:text-[#FFD8B1] transition-colors mb-4 text-sm font-bold"
          >
            <span>←</span> Tilbage til kampprogram
          </Link>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#FF6B00] sm:text-xs">
            Power Ligaen
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl">
            Kampdetaljer
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-[#FF6B00] sm:w-20" />
        </header>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00]/20 border-t-[#FF6B00]" />
              <p className="text-sm text-[#FFD8B1]/60">Henter kampdetaljler...</p>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              <p className="font-bold mb-2 text-red-400">FEJL: {state.message}</p>
              <button
                onClick={() => router.back()}
                className="mt-3 rounded-full bg-[#FF6B00] px-4 py-1.5 text-xs font-bold text-[#111111]"
              >
                Gå tilbage
              </button>
            </div>
          </div>
        )}

        {state.status === "ok" && state.match && t1 && t2 && (
          <section className="space-y-8">
            
            {/* Unificeret Match Hero - Nu helt svævende uden mørke baggrundskasser */}
            <div className="relative overflow-visible p-2 sm:p-4">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#FF6B00] opacity-[0.04] blur-[120px] pointer-events-none" />

              {/* Top Meta info */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#FF6B00]/10 pb-5 mb-6 sm:mb-8">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF6B00]">
                  {state.leagueName}
                </span>
                
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isComplete
                        ? "bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse"
                    }`}
                  >
                    {isComplete ? "Afsluttet" : "LIVE"}
                  </span>
                  
                  {state.match.startDate && (
                    <span className="text-[11px] font-bold text-[#FFD8B1]/60">
                      {formatDate(state.match.startDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Kamp Layout - Med markant større logoer */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                
                {/* Hold 1 */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto">
                  <div
                    className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 flex items-center justify-center mb-4 transition-all duration-300 ${
                      isT1Winner 
                        ? "drop-shadow-[0_0_24px_rgba(255,107,0,0.6)] scale-105" 
                        : isComplete ? "opacity-35" : "opacity-95"
                    }`}
                  >
                    <img
                      src={t1.logoUrl}
                      alt={t1.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span 
                    className={`text-xl sm:text-2xl font-black uppercase tracking-wide text-center transition-colors duration-300 ${
                      isT1Winner ? "text-[#FF6B00]" : "text-white"
                    }`}
                  >
                    {t1.name}
                  </span>
                </div>

                {/* VS / Score Centreret */}
                <div className="flex flex-col items-center py-4 px-6 md:py-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]/40 mb-1">
                    RESULTAT
                  </span>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-4xl sm:text-5xl md:text-6xl font-black tabular-nums transition-colors duration-300 ${
                        isT1Winner ? "text-[#FF6B00]" : "text-white"
                      }`}
                    >
                      {state.match.team1Score ?? 0}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-[#FF6B00]/30 select-none">-</span>
                    <span
                      className={`text-4xl sm:text-5xl md:text-6xl font-black tabular-nums transition-colors duration-300 ${
                        isT2Winner ? "text-[#FF6B00]" : "text-white"
                      }`}
                    >
                      {state.match.team2Score ?? 0}
                    </span>
                  </div>
                </div>

                {/* Hold 2 */}
                <div className="flex flex-col items-center flex-1 w-full md:w-auto">
                  <div
                    className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 flex items-center justify-center mb-4 transition-all duration-300 ${
                      isT2Winner 
                        ? "drop-shadow-[0_0_24px_rgba(255,107,0,0.6)] scale-105" 
                        : isComplete ? "opacity-35" : "opacity-95"
                    }`}
                  >
                    <img
                      src={t2.logoUrl}
                      alt={t2.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span 
                    className={`text-xl sm:text-2xl font-black uppercase tracking-wide text-center transition-colors duration-300 ${
                      isT2Winner ? "text-[#FF6B00]" : "text-white"
                    }`}
                  >
                    {t2.name}
                  </span>
                </div>

              </div>

              {/* Vinder Display i bunden */}
              {state.match.winnerId && (
                <div className="relative z-10 mt-8 flex justify-center border-t border-[#FF6B00]/5 pt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD8B1] bg-[#FF6B00]/10 px-4 py-1.5 rounded-full border border-[#FF6B00]/20">
                    <span>
                      {state.teams.find((t) => t._id === state.match.winnerId)?.name} vinder kampen
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* LIVE KAMP OVERVIEW PLACEHOLDER (Matcher designet 1:1 i bredden) */}
            <div className="relative overflow-hidden rounded-2xl border border-[#FF6B00]/15 shadow-2xl bg-gradient-to-b from-[#1a1a1a] to-[#111111]">
              <img
                src="/placeholderTilKampOverview.png"
                alt="Live Kamp Overview"
                className="w-full h-auto object-cover opacity-90 block"
              />
              <div className="absolute top-4 left-4 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#FF6B00] select-none z-10">
                LIVE MATCH OVERVIEW
              </div>
            </div>

            {/* Veto og Maps */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Veto - Venstre */}
              {state.match.veto && state.match.veto.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] mb-2">
                    Veto
                  </h3>
                  <div className="rounded-xl border border-[#FF6B00]/10 bg-[#1a1a1a]/40 p-5">
                    <VetoSection veto={state.match.veto} teams={state.teams} />
                  </div>
                </div>
              )}

              {/* Maps - Højre med WebP-billeder og demo-logik check */}
              {state.match.maps && state.match.maps.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] mb-2">
                    Maps
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {state.match.maps.map((mapData, idx) => {
                      const mapBg = getMapImageUrl(mapData.map);
                      const isPlayed = mapData.demos && mapData.demos.length > 0;
                      
                      return (
                        <div
                          key={idx}
                          className="relative overflow-hidden rounded-xl border border-[#FF6B00]/15 min-h-[140px] flex flex-col justify-between p-5 transition-all duration-300 hover:border-[#FF6B00]/40"
                          style={{
                            backgroundImage: `linear-gradient(to right, rgba(20, 20, 20, 0.95) 45%, rgba(20, 20, 20, 0.3) 100%), url(${mapBg})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Map Info */}
                          <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-start justify-between">
                              <h4 className="font-black text-white uppercase text-base tracking-wide">
                                {mapData.map}
                              </h4>
                            </div>

                            <div className="mt-4 flex items-end justify-between">
                              {/* Scores */}
                              {isPlayed ? (
                                <div className="inline-flex items-center gap-2.5 bg-[#111111]/90 rounded-lg border border-[#FF6B00]/20 px-3.5 py-1.5 shadow-lg">
                                  <span className="text-sm font-black text-white tabular-nums">
                                    {mapData.team1Score ?? 0}
                                  </span>
                                  <span className="text-[#FF6B00]/40 text-xs font-black">-</span>
                                  <span className="text-sm font-black text-white tabular-nums">
                                    {mapData.team2Score ?? 0}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[10px] font-black uppercase tracking-widest bg-black/60 text-[#FFD8B1]/55 px-2.5 py-1.5 rounded">
                                  Ikke spillet
                                </div>
                              )}

                              {/* Demos */}
                              {isPlayed && mapData.demos && mapData.demos.length > 0 && (
                                <div className="space-y-1">
                                  {mapData.demos.map((demo, demoIdx) => (
                                    <a
                                      key={demoIdx}
                                      href={demo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#FF6B00] hover:text-[#FFD8B1] transition-colors"
                                    >
                                      Download demo
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Lineups */}
            {state.match.lineups && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  Lineups
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {state.match.lineups.team1 && (
                    <LineupSection
                      lineup={state.match.lineups.team1}
                      teamName={t1.name}
                    />
                  )}
                  {state.match.lineups.team2 && (
                    <LineupSection
                      lineup={state.match.lineups.team2}
                      teamName={t2.name}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}