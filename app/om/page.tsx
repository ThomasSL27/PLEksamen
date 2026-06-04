// ============================================================
// Om Ligaen: app/om/page.tsx (Next.js App Router)
// Informationsside med: Liga-struktur, præmiepulje og FAQ.
// FaqItem-komponenten bruger CSS Grid til at animere højde.
// "use client" er nødvendigt pga. useState i FaqItem.
// ============================================================
"use client";

import { useState } from "react";

// ============================================================
// FaqItem: Accordion-komponent til ofte stillede spørgsmål
// Bruger CSS Grid height transition — den mest ydeevnestærke måde
// at animere et elements højde fra 0 til "auto" i CSS.
// ============================================================
function FaqItem({ question, answer }: { question: string; answer: string }) {
  // isOpen styrer om svaret er synligt
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-orange-brand/10 py-5 transition-colors">
      {/* Spørgsmål-knap: Klik toggler isOpen */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-black uppercase tracking-tight text-white hover:text-orange-brand transition-colors focus:outline-none"
      >
        <span className="text-sm sm:text-base">{question}</span>
        {/* Pil-ikon der roteres 180° når accordion er åben */}
        <span
          className={`transform transition-transform duration-305 text-orange-brand shrink-0 ml-4 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* ============================================================ */}
      {/* Svar-container: CSS Grid animerer højde fra 0 til 1fr         */}
      {/* grid-rows-[1fr] = fuld højde, grid-rows-[0fr] = ingen højde  */}
      {/* overflow-hidden på den indre div skjuler indholdet ved 0fr    */}
      {/* ============================================================ */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-3.5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {/* whitespace-pre-line bevarer linjeskift i svaret */}
          <p className="text-sm text-orange-soft/70 leading-relaxed max-w-3xl whitespace-pre-line">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OmPage: Selve Om-sidens indhold
// ============================================================
export default function OmPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-hidden relative">
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-10">

        {/* Sektionsoverskrift */}
        <header className="mb-12">
          <p className="mb-1 text-label font-black uppercase tracking-widest text-orange-brand sm:text-xs">
            Power Ligaen • Information
          </p>
          <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl md:text-6xl">
            Om ligaen
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand sm:w-20" />
        </header>

        {/* Sektioner med lodret mellemrum */}
        <div className="space-y-16">

          {/* ============================================================ */}
          {/* Sektion 1: Ligastruktur — forklarer Swiss og CEPTER           */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm">
              Liga struktur
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-white font-black max-w-4xl tracking-tight">
              Danmarks førende CS2-liga. Turneringen er opdelt i to tydelige sektioner: POWER Ligaen (VRS) og CEPTER Divisionerne.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-orange-soft/70 max-w-3xl">
              POWER Ligaen køres som et Swiss-format med 16 hold — de 8 bedst placerede kvalificerer sig til en LAN-finale.
              Holdene kommer ind via én af fire kvalifikationer, mens CEPTER Divisionerne fortsætter som separate divisioner med oprykning, nedrykning og egne præmiepuljer.
            </p>
          </section>

          {/* ============================================================ */}
          {/* Sektion 2: Præmiepulje — fremhævet markant i stor skrift      */}
          {/* ============================================================ */}
          <section className="border-t border-orange-brand/10 pt-10">
            <p className="text-label font-black uppercase tracking-widest text-orange-brand mb-2">
              Sæsonens samlede præmiepulje
            </p>
            {/* Stor orange beløbstekst med glow-skygge */}
            <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white leading-none">
              <span className="text-orange-brand drop-shadow-[0_0_30px_rgba(var(--brand-orange-rgb),0.25)]">160.000 KR.</span>
            </h2>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-soft/40 mt-2">
              Præstationspulje fordelt på tværs af ligaen og divisionerne
            </p>
          </section>

          {/* ============================================================ */}
          {/* Sektion 3: Pengefordeling — to kolonner med lister            */}
          {/* ============================================================ */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-orange-brand/10 pt-10">

            {/* POWER Ligaen præmiefordeling */}
            <div className="space-y-4">
              <div className="border-b border-orange-brand/10 pb-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Power Ligaen</h3>
                <p className="text-2xs font-bold text-orange-soft/40 uppercase tracking-widest">Hovedturnering • 100.000 KR.</p>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li className="flex justify-between items-center text-white font-black uppercase pb-1.5 border-b border-white/[0.03]">
                  <span>1. plads</span>
                  <span className="text-orange-brand">40.000 KR. <span className="text-label text-orange-soft/55">+ 5.000 kr. i club share</span></span>
                </li>
                <li className="flex justify-between items-center text-white/90 pb-1.5 border-b border-white/[0.03]">
                  <span>2. plads</span>
                  <span>15.000 KR. <span className="text-label text-orange-soft/45">+ 5.000 kr. i club share</span></span>
                </li>
                <li className="flex justify-between items-center text-white/80 pb-1.5 border-b border-white/[0.03]">
                  <span>3. plads</span>
                  <span>5.000 KR. <span className="text-label text-orange-soft/45">+ 5.000 kr. i club share</span></span>
                </li>
                <li className="flex justify-between items-center text-white/70 pb-1.5 border-b border-white/[0.03]">
                  <span>4. plads</span>
                  <span>5.000 KR. <span className="text-label text-orange-soft/45">i club share</span></span>
                </li>
                <li className="flex justify-between items-center text-white/60 pb-1.5 border-b border-white/[0.03]">
                  <span>5.-6. plads</span>
                  <span>5.000 KR. <span className="text-label text-orange-soft/45">i club share</span></span>
                </li>
                <li className="flex justify-between items-center text-white/50 pb-1.5">
                  <span>7.-8. plads</span>
                  <span>5.000 KR. <span className="text-label text-orange-soft/45">i club share</span></span>
                </li>
              </ul>
            </div>

            {/* Divisionernes præmiefordeling */}
            <div className="space-y-4">
              <div className="border-b border-orange-brand/10 pb-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Divisionerne</h3>
                <p className="text-2xs font-bold text-orange-soft/40 uppercase tracking-widest">CEPTER divisioner • 60.000 KR.</p>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm">
                <li className="flex flex-col gap-0.5 pb-1.5 border-b border-white/[0.03]">
                  <span className="font-black text-white uppercase text-xs">1. Division</span>
                  <div className="flex justify-between text-orange-soft/80">
                    <span>1. plads: 12.000 KR.</span>
                    <span>2. plads: 6.000 KR.</span>
                  </div>
                </li>
                <li className="flex flex-col gap-0.5 pb-1.5 border-b border-white/[0.03]">
                  <span className="font-black text-white uppercase text-xs">2. Division A/B</span>
                  <div className="flex justify-between text-orange-soft/80">
                    <span>1. plads: 5.000 KR. <span className="text-label text-orange-soft/45">(per div)</span></span>
                  </div>
                </li>
                <li className="flex flex-col gap-0.5 pb-1.5 border-b border-white/[0.03]">
                  <span className="font-black text-white uppercase text-xs">3. Division A/B/C/D</span>
                  <div className="flex justify-between text-orange-soft/80">
                    <span>1. plads: 4.500 KR. <span className="text-label text-orange-soft/45">(per div)</span></span>
                  </div>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="font-black text-white uppercase text-xs">4. Division A/B/C/D</span>
                  <div className="flex justify-between text-orange-soft/80">
                    <span>1. plads: 3.500 KR. <span className="text-label text-orange-soft/45">(per div)</span></span>
                  </div>
                </li>
              </ul>
            </div>

          </section>

          {/* ============================================================ */}
          {/* Sektion 4: FAQ med accordion-items                            */}
          {/* ============================================================ */}
          <section className="border-t border-orange-brand/10 pt-10">
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-brand sm:text-sm mb-4">
              Ofte stillede spørgsmål (FAQ)
            </h2>
            <div className="flex flex-col">
              {/* Hvert FaqItem er en selvstændig accordion */}
              <FaqItem
                question="Hvordan tilmelder man sig POWER Ligaen?"
                answer="POWER Ligaen er en lukket liga, hvor hold kvalificerer sig gennem fire kvalifikationsturneringer. Tilmeldingen til kvalifikationerne åbner mellem sæsonerne via Dust2.dk — hold øje med nyheder. Sørg for at holde jer opdateret på vores officielle kanaler for at få besked om åbning af tilmeldingen."
              />
              <FaqItem
                question="Hvordan tilmelder man sig CEPTER Divisionerne?"
                answer="Tilmeldingen til CEPTER Divisionerne forgår via ansøgninger. Vi åbner op for ansøgninger mellem sæsonerne via Dust2.dk — hold øje med nyheder for link og detaljer. Sørg for at holde jer opdateret på vores officielle kanaler for at få besked om åbning af tilmeldingen."
              />
              <FaqItem
                question="Hvordan er præmiefordelingen?"
                answer={`Samlet præmiepulje: 160.000 kr. (100.000 til POWER, 60.000 fordelt i divisionerne).\n\n• 1. Division: Nr. 1: 12.000 kr., Nr. 2: 6.000 kr.\n• 2. Div A/B: Nr. 1: 5.000 kr.\n• 3. Div A/B/C/D: Nr. 1: 4.500 kr.\n• 4. Div A/B/C/D: Nr. 1: 3.500 kr.`}
              />
            </div>
          </section>

        </div>

      </div>
    </main>
  );
}
