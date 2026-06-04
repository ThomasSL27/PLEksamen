// ============================================================
// NewSeason: components/NewSeason.tsx
// En lille badge-knap med pulserende dot der linker til
// tilmeldingssiden for POWER Ligaen Sæson 32.
// Vises øverst på forsiden over hovedoverskriften.
// ============================================================

export default function NewSeason() {
  return (
    // Klikbar badge-knap der åbner tilmeldingssiden i nyt vindue
    // aria-label giver en tilgængelig beskrivelse til skærmlæsere
    <a
      href="https://www.dust2.dk/nyheder/72213/tilmeldingen-til-power-ligaen-og-cepter-divisionerne-saeson-32-er-aabnet"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-full border border-orange-brand/30 bg-orange-brand/10 px-4 py-2 transition-colors hover:border-orange-brand/50 hover:bg-orange-brand/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-brand"
      aria-label="Læs nyhed om tilmelding til POWER Ligaen og CEPTER Divisionerne sæson 32 på Dust2.dk (åbner i nyt vindue)"
    >
      {/* Pulserende orange dot — to lag: ydre ping-animation og indre fast cirkel */}
      {/* aria-hidden skjuler det dekorative element fra skærmlæsere */}
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
        {/* Ydre ring: animate-ping laver en udadgående puls-animation */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-brand opacity-60" />
        {/* Indre cirkel: Fast orange dot med orange gløde */}
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-brand shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
      </span>

      {/* Tekst: "Tilmeld jer S32" — S32 fremhæves i orange */}
      <span className="text-sm font-semibold tracking-wide text-white md:text-base">
        Tilmeld jer <span className="text-orange-brand">S32</span>
      </span>
    </a>
  );
}
