"use client";
import { useEffect, useState } from "react";

// ==================================================
// TYPER & KONSTANTER
// ==================================================
const SEASON_ENDPOINT = "a/31";
const SEASON_NAME = "Sæson 31";

interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

interface SwissMatch {
  team1: Team | null;
  team2: Team | null;
}

interface Standing {
  team: Team;
  matches: number;
  wins: number;
  losses: number;
  rd: number;
  points: number;
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      teams: Team[];
      standings: Standing[];
    };

// ==================================================
// KOMPONENTER
// ==================================================

function SwissPool({
  title,
  matches,
  columns = 1,
}: {
  title: string;
  matches: any[];
  columns?: number;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="border border-[#FF6B00]/15 rounded-xl p-3 bg-gradient-to-b from-[#1a1a1a] to-[#0c0c0c] shadow-2xl">
        <h3 className="text-center text-[10px] font-black text-[#FF6B00] mb-3 uppercase tracking-widest border-b border-[#FF6B00]/10 pb-1.5">
          {title}
        </h3>
        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: "0.5rem",
          }}
        >
          {matches.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 bg-[#111111]/60 border border-[#FF6B00]/5 hover:border-[#FF6B00]/30 p-2 rounded-lg transition-all duration-300"
            >
              <div className="h-7 w-7 flex items-center justify-center shrink-0">
                {m.team1?.logoUrl ? (
                  <img
                    src={m.team1.logoUrl}
                    alt={m.team1.name}
                    title={m.team1.name}
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                  />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-white/5" />
                )}
              </div>

              <span className="text-[9px] font-black text-[#FF6B00]/40 select-none">VS</span>

              <div className="h-7 w-7 flex items-center justify-center shrink-0">
                {m.team2?.logoUrl ? (
                  <img
                    src={m.team2.logoUrl}
                    alt={m.team2.name}
                    title={m.team2.name}
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                  />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-white/5" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinalSelection({
  title,
  teams,
  isWinner,
}: {
  title: string;
  teams: Team[];
  isWinner: boolean;
}) {
  const borderColor = isWinner ? "border-green-500/30" : "border-red-500/20";
  const glowShadow = isWinner ? "shadow-[0_0_20px_rgba(34,197,94,0.05)] bg-gradient-to-b from-[#1a2d1d] to-[#111111]" : "shadow-none bg-[#1a1a1a]/40";
  const badgeColor = isWinner ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20";

  return (
    <div className={`border ${borderColor} ${glowShadow} rounded-2xl p-4 w-full shadow-2xl`}>
      <div className="text-center mb-4">
        <span className={`inline-block text-[9px] font-black uppercase tracking-widest border px-2.5 py-1 rounded-full ${badgeColor}`}>
          {isWinner ? "Kvalificeret • LAN" : "Elimineret"}
        </span>
        <h3 className="text-center text-[11px] font-black text-white/50 uppercase tracking-wider mt-2">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-3 justify-center items-center">
        {teams.map((t, i) => (
          <div
            key={i}
            className="h-8 w-8 flex items-center justify-center transition-transform hover:scale-110 duration-200"
          >
            {t.logoUrl ? (
              <img
                src={t.logoUrl}
                alt={t.name}
                title={t.name}
                className="h-full w-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-white/5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StandingTable({
  title,
  standings,
}: {
  title: string;
  standings: Standing[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#FF6B00]/10 pb-2">
        <h3 className="text-sm font-black text-white uppercase tracking-tight">
          {title}
        </h3>
        <span className="text-[10px] font-bold text-[#FFD8B1]/45 uppercase tracking-wide">
          Sæson Status
        </span>
      </div>

      <div className="border border-[#FF6B00]/10 rounded-xl overflow-hidden bg-gradient-to-b from-[#1a1a1a]/80 to-[#121212]/80 shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="text-[#FF6B00] uppercase border-b border-[#FF6B00]/10 bg-[#FF6B00]/5 select-none">
            <tr>
              <th className="p-3 w-10 text-center font-black">#</th>
              <th className="p-3">Hold</th>
              <th className="p-3 text-center font-black">Kampe</th>
              <th className="p-3 text-center font-black">Vundet</th>
              <th className="p-3 text-center font-black">RD</th>
              <th className="p-3 text-right font-black pr-4">Point</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {standings.map((s, i) => (
              <tr
                key={i}
                className="border-b border-white/[0.02] hover:bg-[#FF6B00]/5 transition-colors duration-200"
              >
                <td className="p-3 text-center font-black text-[#FF6B00]">
                  {i + 1}
                </td>
                <td className="p-3 flex items-center gap-3">
                  <div className="h-6 w-6 flex items-center justify-center shrink-0">
                    <img
                      src={s.team.logoUrl}
                      alt={s.team.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                    />
                  </div>
                  <span className="font-bold uppercase tracking-tight text-white/95">
                    {s.team.name}
                  </span>
                </td>
                <td className="p-3 text-center text-[#FFD8B1]/80 font-semibold">{s.matches}</td>
                <td className="p-3 text-center text-[#FFD8B1]/80 font-semibold">{s.wins}</td>
                <td className="p-3 text-center text-[#FFD8B1]/80 font-semibold">{s.rd}</td>
                <td className="p-3 text-right font-black pr-4 text-[#FF6B00]">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================================================
// MAIN PAGE WITH MOBILE TAB RESPONSIVENESS
// ==================================================
export default function SwissStillinger() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [mobileRound, setMobileRound] = useState(0); // 0 = R1, 1 = R2, 2 = R3, 3 = R4, 4 = Finaler

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        const json = await res.json();

        const grundspil = json.data.find((s: any) =>
          s.name.toLowerCase().includes("grundspil")
        );

        const teams = grundspil.teams || [];

        const simulatedStandings = teams.map((t: Team) => ({
          team: t,
          matches: 0,
          wins: 0,
          losses: 0,
          rd: 0,
          points: 0,
        }));

        setState({ status: "ok", teams, standings: simulatedStandings });
      } catch (e) {
        setState({ status: "error", message: "Fejl ved indlæsning af stillinger" });
      }
    }

    fetchData();
  }, []);

  if (state.status === "loading") {
    return (
      <main className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00]/20 border-t-[#FF6B00]" />
          <p className="text-sm text-[#FFD8B1]/60">Henter stillinger for {SEASON_NAME}...</p>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="min-h-screen bg-[#111111] flex items-center justify-center p-8">
        <p className="text-sm text-red-500">FEJL: {state.message}</p>
      </main>
    );
  }

  const t = state.teams;

  const dummyMatch = (idx1: number, idx2: number) => ({
    team1: t[idx1] || null,
    team2: t[idx2] || null,
  });

  return (
    <main className="min-h-screen bg-[#111111] text-white font-sans overflow-hidden relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-[#FF6B00] opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-[#FF6B00] opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
        
        {/* HEADER */}
        <header className="mb-12">
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#FF6B00] sm:text-xs">
            Power Ligaen • {SEASON_NAME}
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
            Stillinger
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-[#FF6B00] sm:w-20" />
        </header>

        {/* SWISS SYSTEM BRACKET */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] sm:text-sm">
              Swiss Bracket Status
            </h2>
          </div>

          {/* MOBIL MENU (Kun synlig på mobile enheder under md-skærmstørrelse) */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-4 mb-6 select-none border-b border-white/5 scrollbar-none">
            {["Runde 1", "Runde 2", "Runde 3", "Runde 4", "Playoff"].map((roundName, idx) => (
              <button
                key={idx}
                onClick={() => setMobileRound(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all border ${
                  mobileRound === idx
                    ? "bg-[#FF6B00] text-[#111111] border-[#FF6B00]"
                    : "bg-[#161616] text-[#FFD8B1]/45 border-[#FF6B00]/10 hover:border-[#FF6B00]/30"
                }`}
              >
                {roundName}
              </button>
            ))}
          </div>

          {/* MOBIL VISNING (Viser kun den aktuelt tilvalgte runde) */}
          <div className="flex md:hidden w-full">
            {mobileRound === 0 && (
              <SwissPool title="Runde 1 • 0:0" matches={Array(8).fill(null).map((_, i) => dummyMatch(i, i + 8))} />
            )}
            {mobileRound === 1 && (
              <div className="flex flex-col gap-6 w-full">
                <SwissPool title="Runde 2 • 1:0" matches={Array(4).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                <SwissPool title="Runde 2 • 0:1" matches={Array(4).fill(null).map((_, i) => dummyMatch(i + 4, i + 5))} />
              </div>
            )}
            {mobileRound === 2 && (
              <div className="flex flex-col gap-6 w-full">
                <SwissPool title="Runde 3 • 2:0" matches={Array(2).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                <SwissPool title="Runde 3 • 1:1" matches={Array(4).fill(null).map((_, i) => dummyMatch(i + 2, i + 3))} />
                <SwissPool title="Runde 3 • 0:2" matches={Array(2).fill(null).map((_, i) => dummyMatch(i + 6, i + 7))} />
              </div>
            )}
            {mobileRound === 3 && (
              <div className="flex flex-col gap-6 w-full">
                <SwissPool title="Runde 4 • 2:1" matches={Array(3).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                <SwissPool title="Runde 4 • 1:2" matches={Array(3).fill(null).map((_, i) => dummyMatch(i + 3, i + 4))} />
              </div>
            )}
            {mobileRound === 4 && (
              <div className="flex flex-col gap-6 w-full">
                <FinalSelection title="Kvalificeret til LAN" teams={t.slice(0, 8)} isWinner={true} />
                <SwissPool title="2:2 • Decider" matches={Array(3).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                <FinalSelection title="Ikke kvalificeret" teams={t.slice(8, 16)} isWinner={false} />
              </div>
            )}
          </div>

          {/* DESKTOP VISNING (Hele det brede sidelayout indlæses – skjult på mobil) */}
          <div className="hidden md:flex gap-10 items-start overflow-x-auto pb-6 select-none leading-none px-0">
            {/* RUNDE 1 */}
            <div className="flex flex-col pt-16 flex-shrink-0">
              <SwissPool
                title="0:0"
                matches={Array(8)
                  .fill(null)
                  .map((_, i) => dummyMatch(i, i + 8))}
              />
            </div>

            {/* RUNDE 2 */}
            <div className="flex flex-col gap-6 flex-shrink-0">
              <SwissPool
                title="1:0"
                matches={Array(4)
                  .fill(null)
                  .map((_, i) => dummyMatch(i, i + 1))}
              />
              <SwissPool
                title="0:1"
                matches={Array(4)
                  .fill(null)
                  .map((_, i) => dummyMatch(i + 4, i + 5))}
              />
            </div>

            {/* RUNDE 3 */}
            <div className="flex flex-col gap-6 flex-shrink-0">
              <SwissPool
                title="2:0"
                matches={Array(2)
                  .fill(null)
                  .map((_, i) => dummyMatch(i, i + 1))}
              />
              <SwissPool
                title="1:1"
                matches={Array(4)
                  .fill(null)
                  .map((_, i) => dummyMatch(i + 2, i + 3))}
              />
              <SwissPool
                title="0:2"
                matches={Array(2)
                  .fill(null)
                  .map((_, i) => dummyMatch(i + 6, i + 7))}
              />
            </div>

            {/* RUNDE 4 */}
            <div className="flex flex-col gap-6 pt-20 flex-shrink-0">
              <SwissPool
                title="2:1"
                matches={Array(3)
                  .fill(null)
                  .map((_, i) => dummyMatch(i, i + 1))}
              />
              <SwissPool
                title="1:2"
                matches={Array(3)
                  .fill(null)
                  .map((_, i) => dummyMatch(i + 3, i + 4))}
              />
            </div>

            {/* FINALER / STATUS BRACKET */}
            <div className="flex flex-col gap-6 flex-shrink-0">
              <FinalSelection
                title="Kvalificeret til LAN"
                teams={t.slice(0, 8)}
                isWinner={true}
              />

              <div>
                <SwissPool
                  title="2:2 • Decider"
                  matches={Array(3)
                    .fill(null)
                    .map((_, i) => dummyMatch(i, i + 1))}
                />
              </div>

              <FinalSelection
                title="Ikke kvalificeret"
                teams={t.slice(8, 16)}
                isWinner={false}
              />
            </div>
          </div>
        </section>

        {/* DIVISIONER - STANDINGSTABELLER */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">
          <StandingTable
            title="Division 1"
            standings={state.standings.slice(0, 10)}
          />
          <StandingTable
            title="Division 2"
            standings={state.standings.slice(10, 20)}
          />
          <StandingTable
            title="Division 3"
            standings={state.standings.slice(20, 30)}
          />
          <StandingTable
            title="Division 4"
            standings={state.standings.slice(30, 40)}
          />
        </section>
        
      </div>
    </main>
  );
}