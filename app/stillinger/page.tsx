// ============================================================
// Stillinger: app/stillinger/page.tsx (Next.js App Router)
// Viser Swiss Bracket-struktur og CEPTER divisions-standings.
// Swiss Bracket: 16 hold spiller med W/L-record (0:0 → 3:0 eller 0:3).
// Responsive: Mobil har tab-navigation, desktop viser hele bracketet.
// "use client" er nødvendigt pga. useState, useEffect og tab-navigation.
// ============================================================
"use client";
// useState styrer lokal state, useEffect kører side-effekter
import { useEffect, useState } from "react";

// ============================================================
// Konstanter
// ============================================================
// SEASON_ENDPOINT er parameteren der sendes til API'et
const SEASON_ENDPOINT = "a/31";
// SEASON_NAME vises i sektionsoverskriften
const SEASON_NAME = "Sæson 31";

// ============================================================
// Typer: Beskriver API-datastrukturen
// ============================================================
// Team beskriver ét hold med ID, navn og logo
interface Team {
  _id: string;
  name: string;
  shortName: string;
  logoUrl: string;
}

// Standing beskriver ét holds standings-data i en division
interface Standing {
  team: Team;
  matches: number;   // Antal spillede kampe
  wins: number;      // Antal sejre
  losses: number;    // Antal tab
  rd: number;        // Round difference (runde-forskel)
  points: number;    // Samlet point
}

// DivisionData beskriver én division med dens navn og standings
interface DivisionData {
  name: string;
  standings: Standing[];
}

// FetchState er en discriminated union med tre mulige tilstande
type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      grundspilTeams: Team[];    // Alle 16 hold i Swiss Bracket
      divisions: DivisionData[]; // CEPTER-divisioner med standings
    };

// ============================================================
// SwissPool: Viser én runde i Swiss Bracket med kamp-par
// columns-prop tillader grid-layout med flere kolonner
// ============================================================
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
      <div className="border border-orange-brand/15 rounded-xl p-3 bg-gradient-to-b from-card to-card-deep shadow-2xl">
        {/* Runde-titel øverst, fx "0:0", "1:0" eller "2:2 • Decider" */}
        <h3 className="text-center text-label font-black text-orange-brand mb-3 uppercase tracking-widest border-b border-orange-brand/10 pb-1.5">
          {title}
        </h3>

        {/* Dynamisk grid: columns-prop bestemmer antal kolonner via inline style */}
        <div
          style={{
            display: "grid",
            // repeat(${columns}, ...) laver ${columns} antal kolonner
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: "0.5rem",
          }}
        >
          {/* Renderers ét kamp-par for hvert element i matches-arrayet */}
          {matches.map((m, i) => (
            // Hvert kamp-par viser to holdlogoer med "VS" imellem
            <div
              key={i}
              className="flex items-center justify-between gap-3 bg-background/60 border border-orange-brand/5 hover:border-orange-brand/30 p-2 rounded-lg transition-all duration-300"
            >
              {/* Hold 1 logo — vises kun hvis m.team1 har en logoUrl */}
              <div className="h-7 w-7 flex items-center justify-center shrink-0">
                {m.team1?.logoUrl ? (
                  <img
                    src={m.team1.logoUrl}
                    alt={m.team1.name}
                    // title vises som tooltip ved hover
                    title={m.team1.name}
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                  />
                ) : (
                  // Fallback: Lille grå cirkel hvis intet logo
                  <div className="h-4 w-4 rounded-full bg-white/5" />
                )}
              </div>

              {/* "VS" tekst i midten — select-none forhindrer tekstmarkering */}
              <span className="text-2xs font-black text-orange-brand/40 select-none">VS</span>

              {/* Hold 2 logo — samme logik som Hold 1 */}
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

// ============================================================
// FinalSelection: Viser de 8 kvalificerede eller eliminerede hold
// isWinner bestemmer farver (grøn = kvalificeret, rød = elimineret)
// ============================================================
function FinalSelection({
  teams,
  isWinner,
}: {
  teams: Team[];
  isWinner: boolean;
}) {
  // Vælger farver baseret på om holdene er kvalificerede (grøn) eller eliminerede (rød)
  const borderColor = isWinner ? "border-green-500/30" : "border-red-500/20";
  // Vinder-boksen har en grøn glow-skygge og gradient — taberboksen er neutral
  const glowShadow = isWinner ? "shadow-[0_0_20px_rgba(34,197,94,0.05)] bg-gradient-to-b from-winner to-background" : "shadow-none bg-card/40";
  // Badge-farver: Grøn badge for kvalificerede, rød for eliminerede
  const badgeColor = isWinner ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20";

  return (
    <div className={`border ${borderColor} ${glowShadow} rounded-2xl p-4 w-full shadow-2xl`}>
      {/* Status-badge: "Kvalificeret • LAN" eller "Elimineret" */}
      <div className="text-center mb-4">
        <span className={`inline-block text-2xs font-black uppercase tracking-widest border px-2.5 py-1 rounded-full ${badgeColor}`}>
          {/* Viser den korrekte status baseret på isWinner */}
          {isWinner ? "Kvalificeret • LAN" : "Elimineret"}
        </span>
      </div>

      {/* 4-kolonne grid med holdlogoer — op til 8 hold (2 rækker) */}
      <div className="grid grid-cols-4 gap-3 justify-center items-center">
        {/* Renderers ét logo for hvert hold */}
        {teams.map((t, i) => (
          <div
            key={i}
            // hover:scale-110 giver en lille zoom-effekt ved hover
            className="h-8 w-8 flex items-center justify-center transition-transform hover:scale-110 duration-200"
          >
            {/* Vis logo hvis tilgængeligt — ellers lille grå cirkel */}
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

// ============================================================
// StandingTable: Viser standings-tabel for én division
// ============================================================
function StandingTable({
  title,
  standings,
}: {
  title: string;
  standings: Standing[];
}) {
  return (
    <div className="space-y-4">
      {/* Divisionsnavn og "Sæson Status" label */}
      <div className="flex items-center justify-between border-b border-orange-brand/10 pb-2">
        <h3 className="text-sm font-black text-white uppercase tracking-tight">
          {title}
        </h3>
        <span className="text-label font-bold text-orange-soft/45 uppercase tracking-wide">
          Sæson Status
        </span>
      </div>

      {/* Standings-tabel med overskriftsrække og datarrækker */}
      <div className="border border-orange-brand/10 rounded-xl overflow-hidden bg-gradient-to-b from-card/80 to-medium/80 shadow-2xl">
        <table className="w-full text-left text-xs">
          {/* Overskriftsrække — select-none forhindrer tekstmarkering */}
          <thead className="text-orange-brand uppercase border-b border-orange-brand/10 bg-orange-brand/5 select-none">
            <tr>
              {/* # = Placering */}
              <th className="p-3 w-10 text-center font-black">#</th>
              <th className="p-3">Hold</th>
              <th className="p-3 text-center font-black">Kampe</th>
              <th className="p-3 text-center font-black">Vundet</th>
              {/* RD = Round Difference (runde-forskel) */}
              <th className="p-3 text-center font-black">RD</th>
              <th className="p-3 text-right font-black pr-4">Point</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {/* Renderers én tabelrække for hvert hold i standings */}
            {standings.map((s, i) => (
              <tr
                key={i}
                // hover:bg-orange-brand/5 giver subtil orange baggrundsfarve ved hover
                className="border-b border-white/[0.02] hover:bg-orange-brand/5 transition-colors duration-200"
              >
                {/* Placering — i + 1 fordi i starter på 0 */}
                <td className="p-3 text-center font-black text-orange-brand">
                  {i + 1}
                </td>
                {/* Holdnavn med logo til venstre */}
                <td className="p-3 flex items-center gap-3">
                  {/* Lille holdlogo */}
                  <div className="h-6 w-6 flex items-center justify-center shrink-0">
                    <img
                      src={s.team.logoUrl}
                      alt={s.team.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                    />
                  </div>
                  {/* Holdets fulde navn */}
                  <span className="font-bold uppercase tracking-tight text-white/95">
                    {s.team.name}
                  </span>
                </td>
                {/* Antal spillede kampe */}
                <td className="p-3 text-center text-orange-soft/80 font-semibold">{s.matches}</td>
                {/* Antal sejre */}
                <td className="p-3 text-center text-orange-soft/80 font-semibold">{s.wins}</td>
                {/* Round difference */}
                <td className="p-3 text-center text-orange-soft/80 font-semibold">{s.rd}</td>
                {/* Point i orange fed tekst */}
                <td className="p-3 text-right font-black pr-4 text-orange-brand">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// SwissStillinger: Hoved-sidkomponent
// ============================================================
export default function SwissStillinger() {
  // state styrer sidens tilstand og data
  const [state, setState] = useState<FetchState>({ status: "loading" });
  // mobileRound tracker hvilken runde der vises på mobil (0=R1, 1=R2, 2=R3, 3=R4, 4=Playoff)
  const [mobileRound, setMobileRound] = useState(0);

  // ============================================================
  // Datahentning: Henter hold- og divisionsdata fra API'et
  // ============================================================
  useEffect(() => {
    // Definerer async funktion inde i useEffect
    async function fetchData() {
      try {
        // Kalder den interne API-route
        const res = await fetch(`/api/powerstats?type=${SEASON_ENDPOINT}`);
        // Parser svaret som JSON
        const json = await res.json();

        // Udtrækker alle sæsoner — || [] som fallback hvis data er undefined
        const allSeasons: any[] = json.data || [];

        // Finder Grundspil-sæsonen — ikke CEPTER — ved navn-matching
        const grundspil = allSeasons.find((s: any) =>
          s.name.toLowerCase().includes("grundspil") &&
          !s.name.toLowerCase().includes("cepter")
        );

        // Hjælpefunktion: Konverterer et API-holdobjekt til intern Team-type
        const toTeam = (t: any): Team => ({
          _id: t._id || "",
          name: t.name || "Ukendt",
          shortName: t.shortName || t.name || "???",
          logoUrl: t.logoUrl || "",
        });

        // Hjælpefunktion: Konverterer et API-hold til Standing med placeholder-værdier
        const toStanding = (t: any): Standing => ({
          team: toTeam(t),
          // Nulstiller alle stats da de reelle standings ikke er i API'et
          matches: 0, wins: 0, losses: 0, rd: 0, points: 0,
        });

        // Konverterer alle Grundspil-hold til Team-type — eller tomt array
        const grundspilTeams: Team[] = (grundspil?.teams || []).map(toTeam);

        // Finder alle CEPTER division-sæsoner — filtrerer dem der indeholder "cepter" og har hold
        const divisionSeasons = allSeasons.filter((s: any) =>
          s.name.toLowerCase().includes("cepter") && (s.teams?.length ?? 0) > 0
        );

        // divisions er arrayet af divisioner til standings-tabellerne
        let divisions: DivisionData[];

        if (divisionSeasons.length > 0) {
          // Mapper CEPTER-sæsoner til DivisionData med forkortet navn
          divisions = divisionSeasons.map((s: any) => {
            // Forkorter divisionsnavnet ved at fjerne den lange prefix
            const shortName = s.name
              .replace(/cepter divisionerne sæson \d+\s*[-–]\s*/i, "")
              .replace(/\s*[-–]\s*grundspil.*$/i, "")
              .trim();
            return {
              // Bruger det forkortede navn — falder tilbage på fuldt navn
              name: shortName || s.name,
              // Mapper holdene til Standing-objekter
              standings: (s.teams as any[]).map(toStanding),
            };
          });
        } else {
          // Fallback: Opdeler grundspil-hold i grupper på 8 hvis ingen CEPTER-divisioner
          // chunk er en hjælpefunktion der opdeler et array i dele af størrelse size
          const chunk = <T,>(arr: T[], size: number): T[][] =>
            Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
              arr.slice(i * size, i * size + size)
            );
          // Opdeler de 16 hold i to grupper på 8
          divisions = chunk(grundspilTeams, 8).map((group, i) => ({
            name: `Gruppe ${i + 1}`,
            standings: group.map(team => ({ team, matches: 0, wins: 0, losses: 0, rd: 0, points: 0 })),
          }));
        }

        // Opdaterer state med alle hentede data
        setState({ status: "ok", grundspilTeams, divisions });
      } catch (e) {
        // Sætter state til "error" med generisk fejlbesked
        setState({ status: "error", message: "Fejl ved indlæsning af stillinger" });
      }
    }

    // Starter datahentningen
    fetchData();
  }, []); // Tomt array: kører kun én gang

  // Loading-tilstand: Returnerer tidligt med spinner
  if (state.status === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          {/* animate-spin roterer border-t-orange-brand */}
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-brand/20 border-t-orange-brand" />
          <p className="text-sm text-orange-soft/60">Henter stillinger for {SEASON_NAME}...</p>
        </div>
      </main>
    );
  }

  // Fejl-tilstand: Returnerer tidligt med fejlbesked
  if (state.status === "error") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <p className="text-sm text-red-500">FEJL: {state.message}</p>
      </main>
    );
  }

  // t er et alias til grundspilTeams for kortere kode nedenfor
  const t = state.grundspilTeams;

  // ============================================================
  // dummyMatch: Opretter et kamp-par fra hold-indeks i t-arrayet
  // idx1 og idx2 er indekser i grundspilTeams-arrayet
  // ============================================================
  const dummyMatch = (idx1: number, idx2: number) => ({
    // || null giver null som fallback hvis indekset er out of range
    team1: t[idx1] || null,
    team2: t[idx2] || null,
  });

  return (
    <main className="min-h-screen bg-background text-white font-sans overflow-hidden relative">
      {/* Dekorative glow-cirkler */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 right-10 h-96 w-96 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-orange-brand opacity-[0.03] blur-3xl" />
      </div>

      {/* Indholds-wrapper */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10">

        {/* Sektionsoverskrift */}
        <header className="mb-12">
          <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Power Ligaen • {SEASON_NAME}
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
            Stillinger
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
        </header>

        {/* ============================================================ */}
        {/* Swiss Bracket                                                  */}
        {/* ============================================================ */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
              Swiss Bracket Status
            </h2>
          </div>

          {/* ============================================================ */}
          {/* MOBIL TAB-NAVIGATION: flex md:hidden = kun synlig på mobil    */}
          {/* overflow-x-auto tillader horisontal scrolling af tab-knapper */}
          {/* ============================================================ */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-4 mb-6 select-none border-b border-white/5 scrollbar-none">
            {/* Renderers én tab-knap for hver runde */}
            {["Runde 1", "Runde 2", "Runde 3", "Runde 4", "Playoff"].map((roundName, idx) => (
              <button
                key={idx}
                // Sætter mobileRound til det klikkede tab-indeks
                onClick={() => setMobileRound(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all border ${
                  // Aktiv tab: Orange baggrund med mørk tekst
                  mobileRound === idx
                    ? "bg-orange-brand text-background border-orange-brand"
                    // Inaktiv tab: Mørk baggrund med dæmpet tekst
                    : "bg-input text-orange-soft/45 border-orange-brand/10 hover:border-orange-brand/30"
                }`}
              >
                {roundName}
              </button>
            ))}
          </div>

          {/* ============================================================ */}
          {/* MOBIL VISNING: Kun den valgte runde vises                     */}
          {/* Betinget rendering baseret på mobileRound state              */}
          {/* ============================================================ */}
          <div className="flex md:hidden w-full">
            {/* Runde 1: 8 kampe — index 0-7 mod index 8-15 (seeding-match) */}
            {mobileRound === 0 && (
              <SwissPool title="Runde 1 • 0:0" matches={Array(8).fill(null).map((_, i) => dummyMatch(i, i + 8))} />
            )}
            {/* Runde 2: To puljer — 1:0-vinderne og 0:1-taberne */}
            {mobileRound === 1 && (
              <div className="flex flex-col gap-6 w-full">
                {/* 1:0-pulje: Hold 0-3 spiller mod hold 1-4 */}
                <SwissPool title="Runde 2 • 1:0" matches={Array(4).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                {/* 0:1-pulje: Hold 4-7 spiller mod hold 5-8 */}
                <SwissPool title="Runde 2 • 0:1" matches={Array(4).fill(null).map((_, i) => dummyMatch(i + 4, i + 5))} />
              </div>
            )}
            {/* Runde 3: Tre puljer (2:0, 1:1 og 0:2) */}
            {mobileRound === 2 && (
              <div className="flex flex-col gap-6 w-full">
                <SwissPool title="Runde 3 • 2:0" matches={Array(2).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                <SwissPool title="Runde 3 • 1:1" matches={Array(4).fill(null).map((_, i) => dummyMatch(i + 2, i + 3))} />
                <SwissPool title="Runde 3 • 0:2" matches={Array(2).fill(null).map((_, i) => dummyMatch(i + 6, i + 7))} />
              </div>
            )}
            {/* Runde 4: To puljer (2:1 og 1:2) */}
            {mobileRound === 3 && (
              <div className="flex flex-col gap-6 w-full">
                <SwissPool title="Runde 4 • 2:1" matches={Array(3).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                <SwissPool title="Runde 4 • 1:2" matches={Array(3).fill(null).map((_, i) => dummyMatch(i + 3, i + 4))} />
              </div>
            )}
            {/* Playoff: Top 8 kvalificerede, 3 decider-kampe, bundhold elimineret */}
            {mobileRound === 4 && (
              <div className="flex flex-col gap-6 w-full">
                {/* slice(0, 8): De første 8 hold er kvalificeret til LAN */}
                <FinalSelection teams={t.slice(0, 8)} isWinner={true} />
                {/* Tre decider-kampe for de 2:2-hold */}
                <SwissPool title="2:2 • Decider" matches={Array(3).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
                {/* slice(8, 16): Hold 8-15 er elimineret */}
                <FinalSelection teams={t.slice(8, 16)} isWinner={false} />
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* DESKTOP VISNING: Hele bracketet side om side                  */}
          {/* hidden md:flex: Skjult på mobil, flex-row på desktop          */}
          {/* ============================================================ */}
          <div className="hidden md:flex gap-10 items-start overflow-x-auto pb-6 select-none leading-none px-0">

            {/* RUNDE 1: 8 kampe — alle starter med 0:0-record */}
            {/* pt-16 skaber lodret mellemrum så layoutet passer med de andre kolonner */}
            <div className="flex flex-col pt-16 flex-shrink-0">
              <SwissPool
                title="0:0"
                matches={Array(8).fill(null).map((_, i) => dummyMatch(i, i + 8))}
              />
            </div>

            {/* RUNDE 2: To puljer — 1:0 vindere og 0:1 tabere */}
            <div className="flex flex-col gap-6 flex-shrink-0">
              <SwissPool title="1:0" matches={Array(4).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
              <SwissPool title="0:1" matches={Array(4).fill(null).map((_, i) => dummyMatch(i + 4, i + 5))} />
            </div>

            {/* RUNDE 3: Tre puljer — 2:0, 1:1 og 0:2 */}
            <div className="flex flex-col gap-6 flex-shrink-0">
              <SwissPool title="2:0" matches={Array(2).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
              <SwissPool title="1:1" matches={Array(4).fill(null).map((_, i) => dummyMatch(i + 2, i + 3))} />
              <SwissPool title="0:2" matches={Array(2).fill(null).map((_, i) => dummyMatch(i + 6, i + 7))} />
            </div>

            {/* RUNDE 4: To puljer — 2:1 og 1:2 */}
            {/* pt-20 justerer lodret position for at matche andre kolonner */}
            <div className="flex flex-col gap-6 pt-20 flex-shrink-0">
              <SwissPool title="2:1" matches={Array(3).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
              <SwissPool title="1:2" matches={Array(3).fill(null).map((_, i) => dummyMatch(i + 3, i + 4))} />
            </div>

            {/* FINALER: Kvalificerede, decider-kampe og eliminerede */}
            <div className="flex flex-col gap-6 flex-shrink-0">
              {/* Hold 0-7 er de 8 kvalificerede til LAN-finalen */}
              <FinalSelection teams={t.slice(0, 8)} isWinner={true} />
              <div>
                {/* Tre 2:2-hold spiller decider for den 8. LAN-plads */}
                <SwissPool title="2:2 • Decider" matches={Array(3).fill(null).map((_, i) => dummyMatch(i, i + 1))} />
              </div>
              {/* Hold 8-15 er elimineret */}
              <FinalSelection teams={t.slice(8, 16)} isWinner={false} />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CEPTER Divisions-standings: Responsivt 2-kolonne grid         */}
        {/* ============================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16">
          {/* Renderers én StandingTable for hver division */}
          {state.divisions.map((div, idx) => (
            <StandingTable key={idx} title={div.name} standings={div.standings} />
          ))}
        </section>

      </div>
    </main>
  );
}
