"use client";
import { useEffect, useState, useRef } from "react";

import PlayerCard from "@/components/PlayerCard";
import { toLower, getTwitterUrl } from "@/lib/utils";

// ==================================================
// Ikoner
// ==================================================
function XTwitterIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
    </svg>
  );
}


function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ==================================================
// Typer
// ==================================================
interface PlayerData {
  nickname: string;
  name?: string;
  image?: string;
  role?: string;
  age?: number | string;
  twitter?: string;
}

interface TeamData {
  name: string;
  shortName: string;
  logoUrl: string;
  division: string;
  players: PlayerData[];
}

interface Season {
  name: string;
  teams: any[];
}

type FetchState =
  | { status: "loading" }
  | {
      status: "ok";
      seasons: Season[];
      selectedSeason: Season;
      teams: TeamData[];
      divisionName: string;
    }
  | { status: "error"; message: string };

// ==================================================
// Konstanter
// ==================================================
const SEASON_ENDPOINT = "a/31";
const SEASON_NAME = "Sæson 31";
const GRUNDSPIL_MATCH = "grundspil";

function mapTeam(team: any, divisionName: string): TeamData {
  return {
    name: team.name || "Ukendt hold",
    shortName: team.shortName || team.name || "???",
    logoUrl: team.logoUrl || "",
    division: divisionName,
    players:
      team.lineups?.players?.map((p: any) => ({
        nickname: p.nickname ?? p.name ?? "Ukendt",
        name: p.name,
        image: p.image || "",
        role: p.role || "",
        age: p.age || "",
        twitter: p.twitter || p.social?.twitter || "",
      })) || [],
  };
}

// ==================================================
// Featured Team Sektion (Bruger nu den eksterne PlayerCard)
// ==================================================
function FeaturedTeam({
  team,
  onClose,
}: {
  team: TeamData;
  onClose: () => void;
}) {
  const coach = team.players.find((p) =>
    ["coach", "træner"].includes(p.role?.toLowerCase() || "")
  );
  const activePlayers = team.players.filter((p) => p !== coach);

  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-orange-brand/25 bg-gradient-to-br from-card to-card-deep shadow-2xl">
      {/* Header */}
      <div className="relative border-b border-orange-brand/15 bg-gradient-to-r from-orange-brand/10 to-transparent p-6 sm:p-8">
        <button
          onClick={onClose}
          aria-label="Luk holdvisning"
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-orange-brand/20 bg-background text-orange-soft/60 transition-all hover:border-orange-brand/50 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center sm:h-28 sm:w-28 transition-transform duration-350">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={`${team.name} logo`}
                className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(var(--brand-orange-rgb),0.15)]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-orange-brand/10 border border-orange-brand/20">
                <span className="text-3xl font-black text-orange-brand">
                  {(team.shortName || team.name).charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="mb-0.5 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
              {team.division} • {SEASON_NAME}
            </p>
            <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl">
              {team.name}
            </h2>
            <p className="mt-1.5 text-xs text-orange-soft/60">
              {activePlayers.length} spillere{coach ? " • 1 træner" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Spillere */}
      <div className="p-6">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
          Spillere
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {activePlayers.slice(0, 5).map((player, idx) => (
            <PlayerCard
              key={`${player.nickname}-${idx}`}
              nickname={player.nickname}
              name={player.name}
              image={player.image}
              role={player.role}
              age={player.age}
              twitter={player.twitter}
              teamName={team.name}
              teamLogo={team.logoUrl}
              division={team.division}
            />
          ))}
        </div>

        {/* Træner */}
        {coach && (
          <div className="mt-8 border-t border-orange-brand/10 pt-5">
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
              Træner
            </h3>
            <div className="inline-flex items-center gap-3 rounded-lg border border-orange-brand/20 bg-card/50 p-3.5 transition-all hover:border-orange-brand/40">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-orange-brand/20 to-orange-brand/5">
                {coach.image ? (
                  <img
                    src={coach.image}
                    alt={coach.nickname}
                    className="h-full w-full object-cover object-top"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{coach.nickname}</p>
                {coach.name && (
                  <p className="text-label text-orange-soft/50">{coach.name}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-2xs font-bold uppercase tracking-wider text-orange-brand">
                    Coach
                  </p>
                  {coach.age && (
                    <span className="text-2xs text-orange-soft/40">{coach.age} år</span>
                  )}
                  {coach.twitter && (
                    <a
                      href={getTwitterUrl(coach.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-soft/40 transition-colors hover:text-white"
                    >
                      <XTwitterIcon className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reserves */}
        {activePlayers.length > 5 && (
          <div className="mt-6 border-t border-orange-brand/10 pt-5">
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-orange-brand/60 sm:text-sm">
              Udskiftere
            </h3>
            <div className="flex flex-wrap gap-2">
              {activePlayers.slice(5).map((player, idx) => (
                <div
                  key={`sub-${player.nickname}-${idx}`}
                  className="flex items-center gap-3 rounded-lg border border-orange-brand/10 bg-card/40 px-3.5 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-gradient-to-br from-orange-brand/15 to-transparent">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.nickname}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : null}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">
                      {player.nickname}
                    </span>
                    <div className="flex items-center gap-2">
                      {player.age && (
                        <span className="text-2xs text-orange-soft/40">
                          {player.age} år
                        </span>
                      )}
                      {player.twitter && (
                        <a
                          href={getTwitterUrl(player.twitter)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-soft/30 hover:text-white"
                        >
                          <XTwitterIcon className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ==================================================
// Team Logo og Navne-knap (Navne altid synlige)
// ==================================================
function TeamButton({
  team,
  isActive,
  onClick,
}: {
  team: TeamData;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-between rounded-xl border p-4 transition-all duration-300 w-28 sm:w-36 ${
        isActive
          ? "border-orange-brand bg-orange-brand/10 shadow-[0_0_16px_rgba(var(--brand-orange-rgb),0.15)]"
          : "border-orange-brand/10 bg-card hover:border-orange-brand/40 hover:bg-card-hover"
      }`}
    >
      <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-105">
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={team.name}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        ) : (
          <span className={`text-xl font-black ${isActive ? 'text-orange-brand' : 'text-orange-soft/50'}`}>
            {team.shortName.substring(0, 3).toUpperCase()}
          </span>
        )}
      </div>

      <span
        className={`text-2xs sm:text-xs font-black uppercase tracking-wider text-center truncate w-full transition-colors duration-300 ${
          isActive ? "text-orange-brand" : "text-white group-hover:text-orange-brand"
        }`}
      >
        {team.shortName || team.name}
      </span>
    </button>
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
        className="flex items-center gap-2 rounded-lg border border-orange-brand/30 bg-gradient-to-r from-orange-brand/10 to-transparent px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-orange-soft transition-all hover:border-orange-brand/50 hover:bg-orange-brand/15 sm:px-5 sm:py-3"
      >
        <span className="text-label text-orange-brand sm:text-xs">FILTER</span>
        <ChevronIcon
          className={`h-4 w-4 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-orange-brand/30 bg-surface shadow-2xl">
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
                    ? "border-l-2 border-orange-brand bg-orange-brand/10 font-bold text-white"
                    : "border-l-2 border-transparent text-orange-soft/70 hover:bg-card hover:text-orange-soft"
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
// Main Page (HoldPage)
// ==================================================
export default function HoldPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);

  useEffect(() => {
    async function fetchTeams() {
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

        if (!Array.isArray(seasons)) throw new Error("Ugyldigt svar fra API");

        const grundspilSeason = seasons.find((s: any) =>
          toLower(s.name).includes(GRUNDSPIL_MATCH)
        );

        if (!grundspilSeason?.teams?.length) {
          throw new Error("Fandt ikke Grundspillet for Sæson 31");
        }

        const divisionName: string = grundspilSeason.name;
        const teams: TeamData[] = grundspilSeason.teams.map((team: any) =>
          mapTeam(team, divisionName)
        );

        teams.sort((a, b) =>
          (a.shortName || a.name).localeCompare(b.shortName || b.name, "da")
        );

        const defaultTeam =
          teams.find(
            (t) =>
              toLower(t.shortName) === "tricked" ||
              toLower(t.name).includes("tricked")
          ) || teams[0];

        setState({
          status: "ok",
          seasons,
          selectedSeason: grundspilSeason,
          teams,
          divisionName,
        });
        setSelectedTeam(defaultTeam);
      } catch (e: unknown) {
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    fetchTeams();
  }, []);

  const handleSeasonChange = (newSeason: Season) => {
    if (state.status === "ok") {
      const teams: TeamData[] = newSeason.teams.map((team: any) =>
        mapTeam(team, newSeason.name)
      );

      teams.sort((a, b) =>
        (a.shortName || a.name).localeCompare(b.shortName || b.name, "da")
      );

      const defaultTeam =
        teams.find(
          (t) =>
            toLower(t.shortName) === "tricked" ||
            toLower(t.name).includes("tricked")
        ) || teams[0];

      setState({
        status: "ok",
        seasons: state.seasons,
        selectedSeason: newSeason,
        teams,
        divisionName: newSeason.name,
      });
      setSelectedTeam(defaultTeam);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
              Power Ligaen • {SEASON_NAME}
            </p>
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
              Hold
            </h1>
            <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
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
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
              <p className="text-sm text-orange-soft/60">
                Henter hold for {SEASON_NAME}…
              </p>
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="flex items-center justify-center py-32">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-4 text-center">
              <p className="text-sm text-red-400">FEJL: {state.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-full bg-orange-brand px-4 py-1.5 text-xs font-bold text-background"
              >
                Prøv igen
              </button>
            </div>
          </div>
        )}

        {state.status === "ok" && (
          <>
            {selectedTeam ? (
              <FeaturedTeam
                team={selectedTeam}
                onClose={() => setSelectedTeam(null)}
              />
            ) : (
              <div className="mb-8 rounded-lg border border-orange-brand/10 bg-card p-8 text-center">
                <p className="text-sm text-orange-soft/40">
                  Vælg et hold nedenfor for at se holdopstillingen
                </p>
              </div>
            )}

            <section>
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
                {state.divisionName}{" "}
                <span className="font-medium normal-case text-orange-soft/45">
                  ({state.teams.length} hold)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-4 justify-start">
                {state.teams.map((team, idx) => (
                  <TeamButton
                    key={`${team.shortName}-${idx}`}
                    team={team}
                    isActive={
                      selectedTeam?.shortName === team.shortName &&
                      selectedTeam?.division === team.division
                    }
                    onClick={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}