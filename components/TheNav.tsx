// ============================================================
// TheNav: components/TheNav.tsx
// Navigationskomponent der vises øverst på alle sider.
// Indeholder: Logo, desktop-menu, Medier-dropdown, mobil-menu
// med GSAP-animationer (slide-ind panel + scramble-tekst).
// "use client" er nødvendigt pga. hooks, events og animationer.
// ============================================================
"use client";
// useCallback: Husker funktioner mellem renders, useRef: DOM-referencer,
// useState: Lokal state, useEffect: Side-effekter (scroll, event listeners)
import { useCallback, useRef, useState, useEffect } from 'react';
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from 'gsap';
// Link bruges til intern navigation — hurtigere end <a> da Next.js håndterer det klientsiden
import Link from 'next/link';
// usePathname returnerer den aktuelle URL-sti og bruges til at fremhæve aktivt menuitem
import { usePathname } from 'next/navigation';
// FontAwesomeIcon er en ikonkomponent fra Font Awesome biblioteket
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Sociale medie-ikoner til Medier-dropdown
import { faTwitch, faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';

// ============================================================
// NAV_ITEMS: Alle menulinks i navigationen
// label vises i menuen, link er URL'en der navigeres til
// ============================================================
const NAV_ITEMS = [
  { label: 'STILLINGER', link: '/stillinger' },
  { label: 'KAMPE', link: '/kampe' },
  { label: 'SPILLERE', link: '/spillere' },
  { label: 'HOLD', link: '/hold' },
  { label: 'OM', link: '/om' },
];

// ============================================================
// TypeScript-type for komponentens props (alle valgfrie)
// Giver mulighed for at tilpasse logo, accentfarve og animationsfarver
// ============================================================
type TheNavProps = {
  logoUrl?: string;     // URL til logo-billedet
  accentColor?: string; // Primær accentfarve (CSS-variabel)
  colors?: string[];    // Farvearray til mobil pre-layer animation
};

// ============================================================
// TheNav: Selve navigationskomponenten
// Standard-værdier bruges når ingen props sendes ind
// ============================================================
export default function TheNav({
  // Standard-værdier via destructuring default
  logoUrl = './logo.webp',
  accentColor = 'var(--brand-orange)',
  colors = ['var(--brand-orange-light)', 'var(--brand-orange)']
}: TheNavProps) {
  // usePathname returnerer den aktuelle URL-sti, fx "/kampe"
  const pathname = usePathname();
  // mobileMenuOpen styrer om mobil-menuen er åben (true) eller lukket (false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // scrolled er true hvis brugeren har scrollet mere end 20px ned
  const [scrolled, setScrolled] = useState(false);
  // medierOpen styrer om Medier-dropdown er synlig på desktop
  const [medierOpen, setMedierOpen] = useState(false);
  // mobileMedierOpen styrer om Medier-accordion er åben i mobilmenuen
  const [mobileMedierOpen, setMobileMedierOpen] = useState(false);
  // panelRef er en reference til mobil side-panelet — GSAP animerer dets position
  const panelRef = useRef<HTMLElement | null>(null);
  // iconRef er en reference til hamburger-ikonet — GSAP roterer det til et X
  const iconRef = useRef<HTMLSpanElement | null>(null);
  // medierTimeoutRef holder timeout-ID'et til forsinket lukning af Medier-dropdown
  const medierTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // Scroll-detektion: Tilføjer glasmorph-effekt til nav ved scroll
  // addEventListener og removeEventListener er cleanup mod memory leaks
  // ============================================================
  useEffect(() => {
    // handleScroll opdaterer scrolled state baseret på vertical scroll-position
    const handleScroll = () => setScrolled(window.scrollY > 20);
    // Tilslutter event listener til window-scroll-event
    window.addEventListener('scroll', handleScroll);
    // Cleanup-funktion returneres: Fjerner listener når komponenten unmountes
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Tomt array: Kører kun ved mount og unmount

  // Åbner Medier-dropdown og annullerer en eventuel igangværende luk-timeout
  const openMedier = () => {
    // Rydder eksisterende timeout for at forhindre at dropdown lukker midt i
    if (medierTimeoutRef.current) clearTimeout(medierTimeoutRef.current);
    // Sætter dropdown til åben
    setMedierOpen(true);
  };

  // Lukker Medier-dropdown med 150ms forsinkelse (giver tid til at flytte musen ind i dropdown)
  const closeMedier = () => {
    // setTimeout returnerer et ID som vi gemmer for at kunne annullere det
    medierTimeoutRef.current = setTimeout(() => setMedierOpen(false), 150);
  };

  // Animerer hamburger-ikonet med GSAP — rotation skaber "X"-effekten
  const animateIcon = (rotation: number) => {
    // gsap.to animerer iconRef.current's rotate-property til den angivne vinkel
    gsap.to(iconRef.current, { rotate: rotation, duration: 0.5 });
  };

  // ============================================================
  // toggleMobileMenu: Åbner/lukker mobil side-panelet med GSAP
  // useCallback sikrer at funktionen kun genskabes når mobileMenuOpen ændres
  // ============================================================
  const toggleMobileMenu = useCallback(() => {
    // isOpening er true hvis vi skal åbne (altså menuen er lukket nu)
    const isOpening = !mobileMenuOpen;
    // Opdaterer state
    setMobileMenuOpen(isOpening);

    if (isOpening) {
      // ÅBNINGS-animation: Opretter en GSAP timeline for sekvenseret animation
      const tl = gsap.timeline();
      // 1. Farve-lagene (.sm-prelayer) glider ind fra højre med stagger (forskudt timing)
      tl.to(".sm-prelayer", { xPercent: -100, duration: 0.5, stagger: 0.1, ease: 'power4.out' });
      // 2. Selve panelet glider ind — "-=0.4" overlapper med forrige animation (starter 0.4s før den slutter)
      tl.to(panelRef.current, { xPercent: -100, duration: 0.6, ease: 'power4.out' }, "-=0.4");
      // 3. Menupunkterne (.sm-panel-itemLabel) fader op nedefra med stagger
      tl.fromTo(".sm-panel-itemLabel",
        // Fra: Menuitem er nede (140% nedad) og lidt roteret
        { yPercent: 140, rotate: 10 },
        // Til: Menuitem glider op til sin naturlige position
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' },
        "-=0.3" // Starter 0.3s inden forrige animation slutter
      );
      // Roterer hamburger-ikonet 225° så det ser ud som et X
      animateIcon(225);
    } else {
      // LUKKE-animation: Glider panel og pre-layers tilbage til startposition (xPercent: 0)
      gsap.to([panelRef.current, ".sm-prelayer"], { xPercent: 0, duration: 0.4, ease: 'power3.in' });
      // Roterer ikonet tilbage til 0° (hamburger-position)
      animateIcon(0);
      // Lukker Medier-accordion i mobilmenuen
      setMobileMedierOpen(false);
    }
  }, [mobileMenuOpen]); // [mobileMenuOpen]: Genskabes kun når denne state ændres

  return (
    <>
      {/* Ydre wrapper: fast positioneret øverst på siden, høj z-index */}
      <div
        className="fixed top-0 left-0 w-full z-[9999] transition-all duration-500"
        style={{
          // Halvgennemsigtig sort baggrund aktiveres kun ved scroll
          backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          // backdrop-filter: blur() giver glasmorph-effekten (frosted glass)
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          // WebkitBackdropFilter er nødvendig for Safari-understøttelse
          WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
          // Subtil bundkant vises kun ved scroll
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
      >
        {/* ============================================================ */}
        {/* Mobil pre-layers: Farve-lag der animerer ind bag menupanelet  */}
        {/* md:hidden: Skjult på desktop, synlig på mobil                */}
        {/* left:full = 100% til højre (udenfor viewport)                 */}
        {/* ============================================================ */}
        <div className="fixed top-0 left-full w-[400px] h-screen z-[5] flex md:hidden">
          {/* Renderers ét farvelag for hvert element i colors-arrayet */}
          {colors.map((c, i) => (
            // Hvert lag er en hel-skærms div med en farve fra colors-arrayet
            // sm-prelayer-klassen bruges af GSAP til at animere lagene
            <div key={i} className="sm-prelayer absolute top-0 left-0 w-full h-full" style={{ background: c }} />
          ))}
        </div>

        {/* ============================================================ */}
        {/* DESKTOP NAVBAR: hidden md:flex = kun synlig på desktop        */}
        {/* Viser logo til venstre og navigationslinks til højre          */}
        {/* ============================================================ */}
        <header className="hidden md:flex relative w-full justify-between items-center px-12 py-4 z-[100]">
          {/* Logo-link: Klik navigerer til forsiden (/) */}
          <Link href="/" className="pointer-events-auto flex-shrink-0">
            {/* h-32: Fast højde på logo-billedet */}
            <img src={logoUrl} alt="Logo" className="h-32 w-auto object-contain" />
          </Link>

          {/* Navigationsmenu med links og Medier-dropdown */}
          <nav className="flex items-center gap-12">
            <ul className="list-none flex gap-12 m-0 p-0 items-center">
              {/* Renderers ét menuitem for hvert element i NAV_ITEMS */}
              {NAV_ITEMS.map((item, idx) => {
                // isActive er true hvis den aktuelle URL-sti matcher linkens sti
                const isActive = pathname === item.link;
                return (
                  <li key={idx}>
                    <Link
                      href={item.link}
                      className="text-sm font-bold no-underline transition-colors duration-200"
                      // Aktivt link er orange, inaktivt er hvidt
                      style={{ letterSpacing: '0.05em', color: isActive ? accentColor : '#ffffff' }}
                      // onMouseEnter: Farven skifter til accentfarven ved hover
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      // onMouseLeave: Aktivt link forbliver orange, inaktivt går tilbage til hvid
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive ? accentColor : '#ffffff'; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              {/* ============================================================ */}
              {/* MEDIER dropdown — åbnes ved hover (onMouseEnter/Leave)        */}
              {/* onMouseEnter/Leave er sat på <li> for at dække hele området   */}
              {/* ============================================================ */}
              <li className="relative" onMouseEnter={openMedier} onMouseLeave={closeMedier}>
                {/* Dropdown-trigger knap */}
                <button
                  className="text-sm font-bold no-underline transition-colors duration-200 bg-transparent border-none cursor-pointer flex items-center gap-1"
                  // Aktiv farve hvis dropdown er åben
                  style={{ letterSpacing: '0.05em', color: medierOpen ? accentColor : '#ffffff' }}
                >
                  MEDIER
                  {/* Pil-ikon der roteres 180° når dropdown er åben */}
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
                    // Inline style rotation er hurtigere end Tailwind til dynamiske værdier
                    style={{ transform: medierOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown-panel: opacity og pointerEvents styres af medierOpen */}
                <div
                  className="absolute top-full right-0 mt-3 w-[420px] rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 shadow-2xl transition-all duration-200"
                  style={{
                    // opacity: 1 = synlig, 0 = usynlig men stadig i DOM
                    opacity: medierOpen ? 1 : 0,
                    // pointerEvents: none deaktiverer klik når dropdown er skjult
                    pointerEvents: medierOpen ? 'auto' : 'none',
                    // translateY giver en lille slide-down effekt ved åbning
                    transform: medierOpen ? 'translateY(0)' : 'translateY(-6px)',
                  }}
                >
                  {/* "MEDIER" label øverst i dropdown */}
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-1">MEDIER</p>
                  {/* To-kolonne grid med Twitch og Podcast-kort */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Twitch-kort */}
                    <a
                      href="https://www.twitch.tv/dust2tv"
                      target="_blank"
                      rel="noopener noreferrer"
                      // group-klassen aktiverer group-hover effekter på child-elementer
                      className="group flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10 no-underline"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Twitch-lilla ikon-badge */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-600 flex-shrink-0">
                          <FontAwesomeIcon icon={faTwitch} className="h-4 w-4 text-white" />
                        </div>
                        {/* "Twitch" platform-label */}
                        <span className="text-xs font-black uppercase tracking-wider text-white/60">Twitch</span>
                      </div>
                      <div>
                        {/* Kanalnavn i stor fed hvid tekst */}
                        <p className="font-black text-white uppercase text-base leading-tight">dust2tv</p>
                        {/* Kanal-beskrivelse */}
                        <p className="text-xs text-white/40 mt-0.5">Live CS2 streams</p>
                      </div>
                      {/* "Se live" link med lilla hover-farve */}
                      <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                        Se live →
                      </span>
                    </a>

                    {/* Podcast-kort med Spotify og YouTube links */}
                    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2.5">
                        {/* Podcast-logo fra /public */}
                        <img src="/OGCPodcast.avif" alt="OGC Podcast" className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider text-white/60">Podcast</span>
                      </div>
                      <div>
                        {/* Podcast-navn i stor fed hvid tekst */}
                        <p className="font-black text-white uppercase text-base leading-tight">OGC PODCAST</p>
                        <p className="text-xs text-white/40 mt-0.5">CS2 talk og analyse</p>
                      </div>
                      {/* Platform-knapper: Spotify (grøn) og YouTube (rød) */}
                      <div className="flex flex-col gap-1.5 mt-auto">
                        {/* Spotify-link */}
                        <a
                          href="https://open.spotify.com/show/2AJtotrfW0cTqw27RpJVQy"
                          target="_blank"
                          rel="noopener noreferrer"
                          // hover: Grøn Spotify-farve (#1DB954)
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold no-underline transition-all duration-200 border border-white/10 bg-white/5 hover:bg-[#1DB954]/20 hover:border-[#1DB954]/50 hover:text-[#1DB954] text-white/60"
                        >
                          <FontAwesomeIcon icon={faSpotify} className="h-3 w-3" />
                          Spotify
                        </a>
                        {/* YouTube-link */}
                        <a
                          href="https://www.youtube.com/@ograndecanhao"
                          target="_blank"
                          rel="noopener noreferrer"
                          // hover: Rød YouTube-farve
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold no-underline transition-all duration-200 border border-white/10 bg-white/5 hover:bg-red-600/20 hover:border-red-600/50 hover:text-red-400 text-white/60"
                        >
                          <FontAwesomeIcon icon={faYoutube} className="h-3 w-3" />
                          YouTube
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </header>

        {/* ============================================================ */}
        {/* MOBILE HEADER: md:hidden = kun synlig på mobil               */}
        {/* Viser logo til venstre og MENU/CLOSE-knap til højre          */}
        {/* ============================================================ */}
        <header className="md:hidden relative w-full flex justify-between items-center px-8 py-6 z-[100]">
          {/* Logo-link navigerer til forsiden */}
          <Link href="/" className="pointer-events-auto">
            <img src={logoUrl} alt="Logo" className="h-26 w-auto object-contain" />
          </Link>

          {/* Hamburger/Close-knap */}
          <button
            className="pointer-events-auto flex items-center gap-2.5 font-bold bg-none border-none cursor-pointer transition-colors duration-300"
            onClick={toggleMobileMenu}
            // Farven skifter til sort mens menuen er åben (hvid panel-baggrund)
            style={{ color: mobileMenuOpen ? '#000' : '#fff' }}
          >
            {/* Viser "CLOSE" tekst når åben, "MENU" når lukket */}
            <span className="text-sm">{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
            {/* Hamburger-ikon: To streger der danner et + som roteres til X af GSAP */}
            <span ref={iconRef} className="relative w-5 h-5">
              {/* Vandret streg */}
              <span className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" style={{ background: 'currentColor' }} />
              {/* Lodret streg — rotate(90deg) gør den lodret, kombineret med vandret = + tegn */}
              <span className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" style={{ background: 'currentColor', transform: 'translateY(-50%) rotate(90deg)' }} />
            </span>
          </button>
        </header>

        {/* ============================================================ */}
        {/* MOBILE SIDE PANEL: Hvidt slide-ind panel                     */}
        {/* left:full = 100% til højre (udenfor viewport som standard)   */}
        {/* GSAP animerer det ind til venstre med xPercent: -100         */}
        {/* ============================================================ */}
        <aside
          ref={panelRef}
          className="md:hidden fixed top-0 left-full w-[400px] h-screen bg-white p-12 pt-32 z-10 text-black shadow-2xl"
          // willChange: Optimerer GSAP-animationens ydeevne via GPU-acceleration
          style={{ willChange: 'transform' }}
        >
          <div className="w-full h-full flex flex-col">
            <ul className="list-none p-0 space-y-4">
              {/* Renderers navigationslinks i mobilmenuen */}
              {NAV_ITEMS.map((it, idx) => {
                // isActive er true hvis den aktuelle URL-sti matcher linkens sti
                const isActive = pathname === it.link;
                return (
                  // overflow-hidden er nødvendigt for GSAP yPercent-animation af itemLabel
                  <li key={idx} className="overflow-hidden">
                    <Link
                      href={it.link}
                      className="block text-3xl font-black no-underline leading-tight"
                      // Aktivt link er orange, inaktivt er sort
                      style={{ color: isActive ? accentColor : 'black' }}
                      // Lukker mobilmenuen automatisk når et link klikkes
                      onClick={toggleMobileMenu}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive ? accentColor : 'black'; }}
                    >
                      {/* sm-panel-itemLabel-klassen bruges af GSAP til den forsinkede animation */}
                      <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* ============================================================ */}
              {/* Mobil MEDIER accordion                                        */}
              {/* max-height transition fra 0 til 200px animerer åbning/lukning */}
              {/* ============================================================ */}
              <li>
                {/* overflow-hidden er nødvendigt for yPercent-animation af label */}
                <div className="overflow-hidden">
                  {/* Accordion-toggle-knap */}
                  <button
                    className="sm-panel-itemLabel inline-flex items-center gap-2 text-3xl font-black leading-tight text-black bg-transparent border-none cursor-pointer p-0"
                    // Toggler mobileMedierOpen ved klik
                    onClick={() => setMobileMedierOpen(o => !o)}
                  >
                    MEDIER
                    {/* Pil-ikon der roteres 180° når accordion er åben */}
                    <svg
                      className="w-5 h-5 transition-transform duration-300"
                      style={{ transform: mobileMedierOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Accordion indhold: maxHeight animeres fra 0 til 200px */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    // Åben: max 200px højde — Lukket: 0px (skjult)
                    maxHeight: mobileMedierOpen ? '200px' : '0px',
                    // opacity animeres fra 0 til 1 for en blød overgang
                    opacity: mobileMedierOpen ? 1 : 0
                  }}
                >
                  <div className="pt-3 ml-1 flex flex-col gap-2.5">
                    {/* Twitch-link med lilla Twitch-farve */}
                    <a
                      href="https://www.twitch.tv/dust2tv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold no-underline"
                      // Twitch-lilla farve (#6441a5)
                      style={{ color: '#6441a5' }}
                      // Lukker mobilmenuen når linket klikkes
                      onClick={toggleMobileMenu}
                    >
                      <FontAwesomeIcon icon={faTwitch} className="h-3.5 w-3.5" />
                      dust2tv
                    </a>
                    {/* Spotify-link med grøn Spotify-farve */}
                    <a
                      href="https://open.spotify.com/show/2AJtotrfW0cTqw27RpJVQy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold no-underline"
                      // Spotify-grøn farve (#1DB954)
                      style={{ color: '#1DB954' }}
                      onClick={toggleMobileMenu}
                    >
                      <FontAwesomeIcon icon={faSpotify} className="h-3.5 w-3.5" />
                      OGC Podcast – Spotify
                    </a>
                    {/* YouTube-link med rød YouTube-farve */}
                    <a
                      href="https://www.youtube.com/@ograndecanhao"
                      target="_blank"
                      rel="noopener noreferrer"
                      // text-red-400 er Tailwind's røde farve
                      className="flex items-center gap-2 text-sm font-bold no-underline text-red-400"
                      onClick={toggleMobileMenu}
                    >
                      <FontAwesomeIcon icon={faYoutube} className="h-3.5 w-3.5" />
                      OGC Podcast – YouTube
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Responsiv override: Gør panel og pre-layers 100% bredde på meget små skærme */}
      {/* Nødvendig fordi panelet er fast til 400px — 100% er bedre på telefoner */}
      <style jsx>{`
        @media (max-width: 768px) {
          aside, .sm-prelayer { width: 100% !important; }
        }
      `}</style>
    </>
  );
}
