// ============================================================
// Forside: app/page.tsx (Next.js App Router)
// Denne fil er hjemmesiden — den vises, når man besøger rod-URL'en (/).
// "use client" er nødvendigt fordi vi bruger useState og useEffect.
// ============================================================
"use client";

// useState og useEffect er React hooks til henholdsvis state og side-effekter
import { useState, useEffect } from "react";
// ApiSeason er en TypeScript-type der beskriver datastrukturen fra Dust2 API'et
import type { ApiSeason } from "@/lib/types";
// Importerer alle sektionskomponenter der bruges på forsiden
import NewSeason from '../components/NewSeason';
import Season31Champs from '../components/Season31Champs';
import News from '../components/News';
import NextMatch from '@/components/NextMatch';
import AllstarsHighlights from '@/components/AllstarsHighlights';

// ============================================================
// Page: Forsidenskomponent
// Henter sæsondata fra vores interne API og sender det videre
// til komponenterne, der har brug for det.
// ============================================================
export default function Page() {
  // seasons gemmer API-dataen — null betyder "data er ikke hentet endnu"
  const [seasons, setSeasons] = useState<ApiSeason[] | null>(null);

  // useEffect kører én gang, når komponenten første gang vises (tomt dependency-array [])
  useEffect(() => {
    // Kalder vores interne API-route (/api/powerstats)
    fetch("/api/powerstats")
      // Hvis svaret er OK, parses det som JSON — ellers returneres et tomt array
      .then((res) => (res.ok ? res.json() : { data: [] }))
      // Gemmer data-arrayet i state — tjekker at det er et rigtigt array
      .then((json) => setSeasons(Array.isArray(json?.data) ? json.data : []));
  }, []);

  return (
    <main className="min-h-screen bg-background relative">

      {/* ============================================================ */}
      {/* Hero Sektion: Øverste del af forsiden med titel og næste kamp */}
      {/* ============================================================ */}
      <section className="relative z-10 flex min-h-[80vh] items-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl w-full items-start gap-12 pb-12 pt-10 md:pt-8 lg:grid-cols-12 lg:gap-8">

          {/* Venstre side: Pulsing dot "Ny Sæson" + POWER LIGAEN titel */}
          <div className="flex flex-col justify-center items-center lg:items-start lg:col-span-7">
            {/* NewSeason: Lille orange badge-knap der linker til tilmeldingssiden */}
            <div className="inline-block self-center lg:self-start mb-2">
              <NewSeason />
            </div>

            {/* POWER LIGAEN h1: Primær overskrift på forsiden */}
            <h1 className="font-black uppercase tracking-tighter text-white text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] leading-[0.85] mb-6 text-center lg:text-left">
              {/* POWER skrives i orange brandfarve med subtil gløde-effekt */}
              <span className="text-orange-brand drop-shadow-[0_0_30px_rgba(var(--brand-orange-rgb),0.15)]">POWER</span>
              <br />
              LIGAEN
            </h1>

            {/* Underoverskrifter: Dansk leagues USP og præmiepulje */}
            <div className="space-y-2 mt-4 text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                Danmarks <span className="text-orange-brand font-black">største</span> CS2 Liga
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                <span className="text-orange-brand drop-shadow-[0_0_15px_rgba(var(--brand-orange-rgb),0.25)] font-black">160.000 KR</span> PÅ HØJKANT
              </h2>
            </div>
          </div>

          {/* Højre side: NextMatch kortet (modtager seasons som prop) */}
          <div className="w-full flex justify-center lg:justify-end lg:col-span-5">
            {/* hover:scale-[1.015]: Lille zoom-effekt ved hover */}
            <div className="w-full max-w-md lg:max-w-full transition-all duration-500 hover:scale-[1.015]">
              <NextMatch seasons={seasons} />
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* MVP / Season Highlight: Viser Sæson 31's mester og hold       */}
      {/* ============================================================ */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Season31Champs modtager seasons-data og viser MVP og holdkammerater */}
          <Season31Champs seasons={seasons} />
        </div>
      </section>

      {/* ============================================================ */}
      {/* Allstars Highlights: YouTube-playliste med de bedste spil     */}
      {/* ============================================================ */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* AllstarsHighlights modtager seasons-data til at hente spillerbilleder */}
          <AllstarsHighlights seasons={seasons} />
        </div>
      </section>

      {/* ============================================================ */}
      {/* Nyheder: Nyhedslider med seneste artikler fra Dust2.dk        */}
      {/* ============================================================ */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Sektionsoverskrift med orange dekorativ linje */}
          <div className="mb-8">
            <p className="text-label font-black uppercase tracking-widest text-orange-brand mb-1">
              NYHEDER
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Seneste artikler
            </h2>
            {/* Dekorativ orange understreging */}
            <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand" />
          </div>
          {/* News: Nyhedsslider-komponent */}
          <News />
        </div>
      </section>
    </main>
  );
}
