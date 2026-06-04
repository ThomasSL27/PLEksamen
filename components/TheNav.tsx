// ============================================================
// TheNav: components/TheNav.tsx
// Navigationskomponent der vises øverst på alle sider.
// Indeholder: Logo, desktop-menu, Medier-dropdown, mobil-menu
// med GSAP-animationer (slide-ind panel + scramble-tekst).
// "use client" er nødvendigt pga. hooks, events og animationer.
// ============================================================
"use client";
import { useCallback, useRef, useState, useEffect } from 'react';
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from 'gsap';
// Link bruges til intern navigation i Next.js (hurtigere end <a>)
import Link from 'next/link';
// usePathname bruges til at detektere aktiv side og fremhæve det aktive menuitem
import { usePathname } from 'next/navigation';
// FontAwesomeIcon er en ikonkomponent fra Font Awesome biblioteket
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importerer Twitch, Spotify og YouTube-ikoner til Medier-dropdown
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
// TypeScript-type for komponentens props (valgfrie parametre)
// Giver mulighed for at tilpasse logo, accentfarve og animationsfarver
// ============================================================
type TheNavProps = {
  logoUrl?: string;
  accentColor?: string;
  colors?: string[];
};

// ============================================================
// TheNav: Selve navigationskomponenten
// Standard-værdier bruges når ingen props sendes ind
// ============================================================
export default function TheNav({
  logoUrl = './logo.webp',
  accentColor = 'var(--brand-orange)',
  colors = ['var(--brand-orange-light)', 'var(--brand-orange)']
}: TheNavProps) {
  // usePathname returnerer den aktuelle URL-sti, fx "/kampe"
  const pathname = usePathname();
  // mobileMenuOpen styrer om mobil-menuen er åben eller lukket
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // scrolled tracker om brugeren har scrollet mere end 20px ned
  const [scrolled, setScrolled] = useState(false);
  // medierOpen styrer synligheden af Medier-dropdown på desktop
  const [medierOpen, setMedierOpen] = useState(false);
  // mobileMedierOpen styrer accordion-åbning i mobil-menuen
  const [mobileMedierOpen, setMobileMedierOpen] = useState(false);
  // panelRef er en reference til mobilmenu-panelet — bruges af GSAP til animation
  const panelRef = useRef<HTMLElement | null>(null);
  // iconRef er en reference til hamburger-ikonet — bruges til GSAP rotation
  const iconRef = useRef<HTMLSpanElement | null>(null);
  // medierTimeoutRef bruges til at forsinke lukning af Medier-dropdown
  const medierTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // Scroll-detektion: Tilføjer glasmorph-baggrund til nav ved scroll
  // addEventListener/removeEventListener er cleanup for at undgå memory leaks
  // ============================================================
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    // Cleanup-funktion: fjerner event listener når komponenten unmountes
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Åbner Medier-dropdown — annullerer eventuel igangværende luk-timeout
  const openMedier = () => {
    if (medierTimeoutRef.current) clearTimeout(medierTimeoutRef.current);
    setMedierOpen(true);
  };

  // Lukker Medier-dropdown med 150ms forsinkelse (så man kan flytte musen til dropdown)
  const closeMedier = () => {
    medierTimeoutRef.current = setTimeout(() => setMedierOpen(false), 150);
  };

  // Animerer hamburger-ikonen med GSAP — rotation giver en "X"-effekt ved åbning
  const animateIcon = (rotation: number) => {
    gsap.to(iconRef.current, { rotate: rotation, duration: 0.5 });
  };

  // ============================================================
  // toggleMobileMenu: Åbner/lukker mobil side-panelet med GSAP
  // useCallback sikrer at funktionen kun genskabes når mobileMenuOpen ændres
  // ============================================================
  const toggleMobileMenu = useCallback(() => {
    const isOpening = !mobileMenuOpen;
    setMobileMenuOpen(isOpening);

    if (isOpening) {
      // Åbnings-animation: pre-layers glider ind, derefter panel og menupunkter
      const tl = gsap.timeline();
      // 1. Farve-lagene (sm-prelayer) glider ind fra højre med stagger
      tl.to(".sm-prelayer", { xPercent: -100, duration: 0.5, stagger: 0.1, ease: 'power4.out' });
      // 2. Selve panelet glider ind (overlapper lidt med forrige animation: "-=0.4")
      tl.to(panelRef.current, { xPercent: -100, duration: 0.6, ease: 'power4.out' }, "-=0.4");
      // 3. Menupunkterne fader op nedefra med stagger
      tl.fromTo(".sm-panel-itemLabel",
        { yPercent: 140, rotate: 10 },
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' },
        "-=0.3"
      );
      // Hamburger-ikonet roteres 225° for at se ud som et X
      animateIcon(225);
    } else {
      // Lukke-animation: Panel og pre-layers glider tilbage til udgangspunktet
      gsap.to([panelRef.current, ".sm-prelayer"], { xPercent: 0, duration: 0.4, ease: 'power3.in' });
      // Ikonet roteres tilbage til 0°
      animateIcon(0);
      // Lukker Medier-accordion i mobilmenuen
      setMobileMedierOpen(false);
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Ydre wrapper: fast positioneret øverst, glasmorph-effekt ved scroll */}
      <div
        className="fixed top-0 left-0 w-full z-[9999] transition-all duration-500"
        style={{
          // Halvgennemsigtig sort baggrund + blur-effekt aktiveres ved scroll
          backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
      >
        {/* ============================================================ */}
        {/* Mobil pre-layers: Farve-lag der animerer ind bag menupanelet  */}
        {/* Skjult på desktop (md:hidden), kun synlig på mobil            */}
        {/* ============================================================ */}
        <div className="fixed top-0 left-full w-[400px] h-screen z-[5] flex md:hidden">
          {colors.map((c, i) => (
            // Hvert lag er en hel-skærms div med en farve fra colors-arrayet
            <div key={i} className="sm-prelayer absolute top-0 left-0 w-full h-full" style={{ background: c }} />
          ))}
        </div>

        {/* ============================================================ */}
        {/* DESKTOP NAVBAR: Skjult på mobil (hidden md:flex)              */}
        {/* Viser logo til venstre og navigationslinks til højre          */}
        {/* ============================================================ */}
        <header className="hidden md:flex relative w-full justify-between items-center px-12 py-4 z-[100]">
          {/* Logo-link: Klik navigerer til forsiden */}
          <Link href="/" className="pointer-events-auto flex-shrink-0">
            <img src={logoUrl} alt="Logo" className="h-32 w-auto object-contain" />
          </Link>

          <nav className="flex items-center gap-12">
            <ul className="list-none flex gap-12 m-0 p-0 items-center">
              {/* Renderers NAV_ITEMS som links — aktiv side fremhæves med accentfarve */}
              {NAV_ITEMS.map((item, idx) => {
                // isActive er true hvis den aktuelle URL matcher linkens sti
                const isActive = pathname === item.link;
                return (
                  <li key={idx}>
                    <Link
                      href={item.link}
                      className="text-sm font-bold no-underline transition-colors duration-200"
                      // Aktive links er orange, inaktive er hvide
                      style={{ letterSpacing: '0.05em', color: isActive ? accentColor : '#ffffff' }}
                      // Hover-effekt: Farven skifter til accentfarven
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      // Hover-ud: Aktive links forbliver orange, inaktive går tilbage til hvid
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive ? accentColor : '#ffffff'; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              {/* ============================================================ */}
              {/* MEDIER dropdown — åbner ved hover (onMouseEnter/Leave)        */}
              {/* ============================================================ */}
              <li className="relative" onMouseEnter={openMedier} onMouseLeave={closeMedier}>
                <button
                  className="text-sm font-bold no-underline transition-colors duration-200 bg-transparent border-none cursor-pointer flex items-center gap-1"
                  style={{ letterSpacing: '0.05em', color: medierOpen ? accentColor : '#ffffff' }}
                >
                  MEDIER
                  {/* Pil-ikon der roteres 180° når dropdown er åben */}
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
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
                    opacity: medierOpen ? 1 : 0,
                    pointerEvents: medierOpen ? 'auto' : 'none', // Deaktiverer klik når lukket
                    transform: medierOpen ? 'translateY(0)' : 'translateY(-6px)', // Lille slidedown
                  }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-1">MEDIER</p>
                  <div className="grid grid-cols-2 gap-3">

                    {/* Twitch kort */}
                    <a
                      href="https://www.twitch.tv/dust2tv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10 no-underline"
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Twitch-lilla ikon-badge */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-600 flex-shrink-0">
                          <FontAwesomeIcon icon={faTwitch} className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-white/60">Twitch</span>
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-base leading-tight">dust2tv</p>
                        <p className="text-xs text-white/40 mt-0.5">Live CS2 streams</p>
                      </div>
                      <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                        Se live →
                      </span>
                    </a>

                    {/* Podcast kort med Spotify og YouTube links */}
                    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2.5">
                        <img src="/OGCPodcast.avif" alt="OGC Podcast" className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider text-white/60">Podcast</span>
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-base leading-tight">OGC PODCAST</p>
                        <p className="text-xs text-white/40 mt-0.5">CS2 talk og analyse</p>
                      </div>
                      {/* Platform-knapper: Spotify (grøn) og YouTube (rød) */}
                      <div className="flex flex-col gap-1.5 mt-auto">
                        <a
                          href="https://open.spotify.com/show/2AJtotrfW0cTqw27RpJVQy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold no-underline transition-all duration-200 border border-white/10 bg-white/5 hover:bg-[#1DB954]/20 hover:border-[#1DB954]/50 hover:text-[#1DB954] text-white/60"
                        >
                          <FontAwesomeIcon icon={faSpotify} className="h-3 w-3" />
                          Spotify
                        </a>
                        <a
                          href="https://www.youtube.com/@ograndecanhao"
                          target="_blank"
                          rel="noopener noreferrer"
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
        {/* MOBILE HEADER: Kun synlig på mobil (md:hidden)               */}
        {/* Viser logo til venstre og MENU/CLOSE-knap til højre          */}
        {/* ============================================================ */}
        <header className="md:hidden relative w-full flex justify-between items-center px-8 py-6 z-[100]">
          <Link href="/" className="pointer-events-auto">
            <img src={logoUrl} alt="Logo" className="h-26 w-auto object-contain" />
          </Link>

          {/* Hamburger/Close-knap — kalder toggleMobileMenu ved klik */}
          <button
            className="pointer-events-auto flex items-center gap-2.5 font-bold bg-none border-none cursor-pointer transition-colors duration-300"
            onClick={toggleMobileMenu}
            // Skriffarven skifter til sort mens menuen er åben (hvid baggrund)
            style={{ color: mobileMenuOpen ? '#000' : '#fff' }}
          >
            <span className="text-sm">{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
            {/* Hamburger-ikon bestående af to krydsende streger */}
            <span ref={iconRef} className="relative w-5 h-5">
              {/* Vandret streg */}
              <span className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" style={{ background: 'currentColor' }} />
              {/* Lodret streg — kombineret med vandret streg danner det et + som roterer til X */}
              <span className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" style={{ background: 'currentColor', transform: 'translateY(-50%) rotate(90deg)' }} />
            </span>
          </button>
        </header>

        {/* ============================================================ */}
        {/* MOBILE SIDE PANEL: Det hvide slide-ind panel                  */}
        {/* Starter uden for skærmen (left:full = 100% til højre)        */}
        {/* GSAP animerer det ind med xPercent: -100 (glider til venstre) */}
        {/* ============================================================ */}
        <aside
          ref={panelRef}
          className="md:hidden fixed top-0 left-full w-[400px] h-screen bg-white p-12 pt-32 z-10 text-black shadow-2xl"
          style={{ willChange: 'transform' }} // Optimerer GSAP-animationens ydeevne
        >
          <div className="w-full h-full flex flex-col">
            <ul className="list-none p-0 space-y-4">
              {/* Renderers NAV_ITEMS i mobilmenuen */}
              {NAV_ITEMS.map((it, idx) => {
                const isActive = pathname === it.link;
                return (
                  <li key={idx} className="overflow-hidden">
                    <Link
                      href={it.link}
                      className="block text-3xl font-black no-underline leading-tight"
                      style={{ color: isActive ? accentColor : 'black' }}
                      // Lukker mobilmenuen når et link klikkes
                      onClick={toggleMobileMenu}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive ? accentColor : 'black'; }}
                    >
                      {/* sm-panel-itemLabel bruges af GSAP til den forsinkede animering */}
                      <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* ============================================================ */}
              {/* Mobil MEDIER accordion: Åbner/lukker med max-height transition */}
              {/* ============================================================ */}
              <li>
                <div className="overflow-hidden">
                  {/* Accordion-toggle-knap */}
                  <button
                    className="sm-panel-itemLabel inline-flex items-center gap-2 text-3xl font-black leading-tight text-black bg-transparent border-none cursor-pointer p-0"
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

                {/* Accordion indhold: max-height animeres fra 0 til 200px */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: mobileMedierOpen ? '200px' : '0px', opacity: mobileMedierOpen ? 1 : 0 }}
                >
                  <div className="pt-3 ml-1 flex flex-col gap-2.5">
                    {/* Twitch link — lilla Twitch-farve */}
                    <a
                      href="https://www.twitch.tv/dust2tv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold no-underline"
                      style={{ color: '#6441a5' }}
                      onClick={toggleMobileMenu}
                    >
                      <FontAwesomeIcon icon={faTwitch} className="h-3.5 w-3.5" />
                      dust2tv
                    </a>
                    {/* Spotify link — grøn Spotify-farve */}
                    <a
                      href="https://open.spotify.com/show/2AJtotrfW0cTqw27RpJVQy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold no-underline"
                      style={{ color: '#1DB954' }}
                      onClick={toggleMobileMenu}
                    >
                      <FontAwesomeIcon icon={faSpotify} className="h-3.5 w-3.5" />
                      OGC Podcast – Spotify
                    </a>
                    {/* YouTube link — rød YouTube-farve */}
                    <a
                      href="https://www.youtube.com/@ograndecanhao"
                      target="_blank"
                      rel="noopener noreferrer"
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
      <style jsx>{`
        @media (max-width: 768px) {
          aside, .sm-prelayer { width: 100% !important; }
        }
      `}</style>
    </>
  );
}
