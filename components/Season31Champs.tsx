"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import PlayerCard from "@/components/PlayerCard";

// Registrer GSAP plugin på klientsiden
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// -------------------------------------------
// Konfiguration & Afgrænsning
// -------------------------------------------
const MVP_NICKNAME = "leakz";
const TEAM_MATCH = "tricked";
const SEASON_NAME_PART = "Sæson 31";

// Præcis afgrænsning af, hvilke holdkammerater der må vises
const ALLOWED_TEAMMATES = ["boye", "nickyb", "salazar", "iceberg"];

// -------------------------------------------
// Typer
// -------------------------------------------
interface Player {
  id: string;
  name: string; // Nickname/kaldenavn i API'et
  fullName?: string; // Spillerens rigtige navn
  imageUrl: string;
  teamLogo: string;
  teamName: string;
  role?: string;
  age?: number | string;
  twitter?: string;
}

interface MvpShowcaseProps {
  mvpPlayer: Player;
  teammates: Player[];
}

// Mapper rå API-player til den struktur vi bruger
function mapRosterToPlayers(
  players: { 
    name?: string; 
    nickname?: string; 
    steamid?: string; 
    image?: string;
    role?: string;
    age?: number | string;
    twitter?: string;
    social?: { twitter?: string };
  }[],
  teamName: string,
  teamLogo: string
): Player[] {
  return players.map((p, i) => ({
    id: [p.steamid, p.nickname, p.name, String(i)].filter(Boolean).join("-"),
    name: String(p.nickname ?? p.name ?? "Spiller"),
    fullName: p.name,
    imageUrl: p.image || "",
    teamLogo,
    teamName,
    role: p.role || "",
    age: p.age || "",
    twitter: p.twitter || p.social?.twitter || "",
  }));
}


// ==================================================
// MVP Showcase Sektion
// ==================================================
function MvpShowcase({ mvpPlayer, teammates }: MvpShowcaseProps) {
  const mvpNameRef = useRef<HTMLHeadingElement>(null);

  const handleMvpMouseEnter = () => {
    if (mvpNameRef.current) {
      gsap.to(mvpNameRef.current, {
        duration: 0.5,
        scrambleText: {
          text: mvpPlayer.name,
          chars: "01X#$@!?%&*",
          speed: 0.3,
          revealDelay: 0.1,
        },
      });
    }
  };

  const handleMvpMouseLeave = () => {
    if (mvpNameRef.current) {
      gsap.to(mvpNameRef.current, {
        duration: 0.4,
        scrambleText: {
          text: mvpPlayer.name,
          chars: "01X#$@!?%&*",
          speed: 0.4,
        },
      });
    }
  };

  return (
    <section className="relative w-full bg-background font-sans text-foreground" aria-labelledby="season31-mvp-heading">
      <div className="relative z-10 mx-auto max-w-7xl flex flex-col">
        {/* Sektionsoverskrift */}
        <header className="mb-6">
          <p className="mb-0.5 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            {SEASON_NAME_PART}
          </p>
          <h2
            id="season31-mvp-heading"
            className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl"
          >
            Sæsonens MVP
          </h2>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand" />
        </header>

        {/* Content grid */}
        <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8 mb-8">
          
          {/* Main MVP Card */}
          <div 
            onMouseEnter={handleMvpMouseEnter}
            onMouseLeave={handleMvpMouseLeave}
            className="group relative min-h-0"
          >
            <div className="relative flex h-full min-h-[220px] flex-col overflow-visible rounded-xl border border-orange-brand/25 bg-gradient-to-br from-card to-card-deep shadow-xl transition-all duration-300 hover:border-orange-brand/50 hover:shadow-[0_0_24px_rgba(var(--brand-orange-rgb),0.08)]">
              
              <div className="relative -mx-px -mt-px h-44 shrink-0 overflow-visible rounded-t-xl bg-gradient-to-br from-orange-brand/25 to-orange-soft/5 sm:h-52 lg:h-[min(32dvh,260px)]">
                {mvpPlayer.imageUrl ? (
                  <img
                    src={mvpPlayer.imageUrl}
                    alt={mvpPlayer.name}
                    className="h-full w-full object-contain object-bottom opacity-95 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                <div className="absolute right-4 top-4 rounded-full bg-orange-brand px-3 py-1 text-label font-black uppercase tracking-widest text-background shadow-lg">
                  MVP
                </div>

                {mvpPlayer.teamLogo && (
                  <div className="absolute bottom-4 right-4 h-12 w-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <img
                      src={mvpPlayer.teamLogo}
                      alt={mvpPlayer.teamName}
                      className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-center p-5">
                <p className="mb-0.5 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
                  {mvpPlayer.teamName}
                </p>
                <h3 
                  ref={mvpNameRef}
                  className="text-2xl sm:text-3xl font-black uppercase leading-none tracking-tighter text-white h-9 overflow-hidden select-none"
                >
                  {mvpPlayer.name}
                </h3>
                <p className="mt-1.5 text-xs text-orange-soft/60 leading-relaxed">
                  {[mvpPlayer.fullName, "Sæsonens mest værdifulde spiller"].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>
          </div>

          {/* Højre side: Beskrivelse og Stats */}
          <div className="flex min-h-0 flex-col justify-center gap-6">
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
                Udsagn
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-foreground">
                Vi havde regnet med at vinde. Alt andet ville være en skuffelse.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Kampe", value: "30" },
                { label: "K/D", value: "1.37" },
                { label: "Rating", value: "1.20" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-orange-brand/15 bg-card px-3 py-3 text-center transition-all duration-300 hover:border-orange-brand/45"
                >
                  <p className="text-xl sm:text-2xl font-black text-orange-brand">
                    {stat.value}
                  </p>
                  <p className="text-2xs sm:text-label font-bold uppercase tracking-wider text-orange-soft/45 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holdkammerater sektion */}
        <div className="mt-2 border-t border-orange-brand/10 pt-6">
          <p className="mb-0.5 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Holdet
          </p>
          <h3 className="mb-4 text-xl font-black uppercase tracking-tighter text-white">
            Holdkammerater
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {teammates.map((player) => (
              <PlayerCard
                key={player.id}
                nickname={player.name}
                name={player.fullName}
                image={player.imageUrl}
                role={player.role}
                age={player.age}
                twitter={player.twitter}
                teamName={player.teamName}
                teamLogo={player.teamLogo}
                division={SEASON_NAME_PART}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================================================
// Hovedkomponent til data-hentning
// ==================================================
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; mvpPlayer: Player; teammates: Player[] };

export default function Season31Champs() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    async function loadSeasonChamps() {
      try {
        const res = await fetch("/api/powerstats?type=a/31");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.error || `API fejl: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        const seasons = json.data;
        if (!Array.isArray(seasons)) {
          throw new Error("Ugyldigt svar fra API - 'data' er ikke et array");
        }

        const season = seasons.find((s: any) => s.name?.includes(SEASON_NAME_PART));
        if (!season?.teams?.length) {
          throw new Error(`Fandt ikke ${SEASON_NAME_PART}`);
        }

        const team = season.teams.find((t: any) => {
          const name = String(t.name || "").toLowerCase();
          const shortName = String(t.shortName || "").toLowerCase();
          return name === TEAM_MATCH || shortName === TEAM_MATCH;
        });
        if (!team?.lineups?.players?.length) {
          throw new Error("Fandt ikke Tricked-roster");
        }

        const roster = mapRosterToPlayers(
          team.lineups.players,
          team.shortName || team.name || "Tricked",
          team.logoUrl || ""
        );

        // Find MVP-spillerens indeks
        const mvpIdx = roster.findIndex((p) => p.name.toLowerCase() === MVP_NICKNAME);
        const selectedIdx = mvpIdx >= 0 ? mvpIdx : 0;

        // Filtrer makkere ud, så vi KUN tager dem der er i vores whitelist
        const filteredTeammates = roster.filter((p) => {
          const checkName = p.name.toLowerCase();
          return checkName !== MVP_NICKNAME && ALLOWED_TEAMMATES.includes(checkName);
        });

        setState({
          status: "ok",
          mvpPlayer: roster[selectedIdx],
          teammates: filteredTeammates,
        });
      } catch (e: unknown) {
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Ukendt fejl",
        });
      }
    }

    loadSeasonChamps();
  }, []);

  if (state.status === "loading") {
    return (
      <section className="flex py-16 items-center justify-center bg-background px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
          <p className="text-sm text-orange-soft/65">Henter Sæson 31 Champions...</p>
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="flex py-16 items-center justify-center bg-background px-4 text-center">
        <p className="text-sm text-red-400">FEJL: {state.message}</p>
      </section>
    );
  }

  return <MvpShowcase mvpPlayer={state.mvpPlayer} teammates={state.teammates} />;
}