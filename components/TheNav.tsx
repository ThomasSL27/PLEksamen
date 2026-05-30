"use client";
import { useCallback, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitch, faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';

const NAV_ITEMS = [
  { label: 'FORSIDE', link: '/' },
  { label: 'KAMPE', link: '/kampe' },
  { label: 'STILLINGER', link: '/stillinger' },
  { label: 'HOLD', link: '/hold' },
  { label: 'SPILLERE', link: '/spillere' },
  { label: 'OM', link: '/om' },
];

type TheNavProps = {
  logoUrl?: string;
  accentColor?: string;
  colors?: string[];
};

export default function TheNav({
  logoUrl = './logo.webp',
  accentColor = 'var(--brand-orange)',
  colors = ['var(--brand-orange-light)', 'var(--brand-orange)']
}: TheNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [medierOpen, setMedierOpen] = useState(false);
  const [mobileMedierOpen, setMobileMedierOpen] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const medierTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMedier = () => {
    if (medierTimeoutRef.current) clearTimeout(medierTimeoutRef.current);
    setMedierOpen(true);
  };

  const closeMedier = () => {
    medierTimeoutRef.current = setTimeout(() => setMedierOpen(false), 150);
  };

  const animateIcon = (rotation: number) => {
    gsap.to(iconRef.current, { rotate: rotation, duration: 0.5 });
  };

  const toggleMobileMenu = useCallback(() => {
    const isOpening = !mobileMenuOpen;
    setMobileMenuOpen(isOpening);

    if (isOpening) {
      const tl = gsap.timeline();
      tl.to(".sm-prelayer", { xPercent: -100, duration: 0.5, stagger: 0.1, ease: 'power4.out' });
      tl.to(panelRef.current, { xPercent: -100, duration: 0.6, ease: 'power4.out' }, "-=0.4");
      tl.fromTo(".sm-panel-itemLabel",
        { yPercent: 140, rotate: 10 },
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' },
        "-=0.3"
      );
      animateIcon(225);
    } else {
      gsap.to([panelRef.current, ".sm-prelayer"], { xPercent: 0, duration: 0.4, ease: 'power3.in' });
      animateIcon(0);
      setMobileMedierOpen(false);
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full z-[9999] transition-all duration-500"
        style={{
          backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
      >
        {/* Farvede pre-layers for mobile menu */}
        <div className="fixed top-0 left-full w-[400px] h-screen z-[5] flex md:hidden">
          {colors.map((c, i) => (
            <div key={i} className="sm-prelayer absolute top-0 left-0 w-full h-full" style={{ background: c }} />
          ))}
        </div>

        {/* ========== DESKTOP NAVBAR ========== */}
        <header className="hidden md:flex relative w-full justify-between items-center px-12 py-4 z-[100]">
          <Link href="/" className="pointer-events-auto flex-shrink-0">
            <img src={logoUrl} alt="Logo" className="h-32 w-auto object-contain" />
          </Link>

          <nav className="flex items-center gap-12">
            <ul className="list-none flex gap-12 m-0 p-0 items-center">
              {NAV_ITEMS.map((item, idx) => {
                const isActive = pathname === item.link;
                return (
                  <li key={idx}>
                    <Link
                      href={item.link}
                      className="text-sm font-bold no-underline transition-colors duration-200"
                      style={{ letterSpacing: '0.05em', color: isActive ? accentColor : '#ffffff' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive ? accentColor : '#ffffff'; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              {/* MEDIER dropdown */}
              <li className="relative" onMouseEnter={openMedier} onMouseLeave={closeMedier}>
                <button
                  className="text-sm font-bold no-underline transition-colors duration-200 bg-transparent border-none cursor-pointer flex items-center gap-1"
                  style={{ letterSpacing: '0.05em', color: medierOpen ? accentColor : '#ffffff' }}
                >
                  MEDIER
                  <svg
                    className="w-3 h-3 transition-transform duration-200"
                    style={{ transform: medierOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown panel */}
                <div
                  className="absolute top-full right-0 mt-3 w-[420px] rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 shadow-2xl transition-all duration-200"
                  style={{
                    opacity: medierOpen ? 1 : 0,
                    pointerEvents: medierOpen ? 'auto' : 'none',
                    transform: medierOpen ? 'translateY(0)' : 'translateY(-6px)',
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

                    {/* Podcast kort */}
                    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2.5">
                        <img src="/OGCPodcast.avif" alt="OGC Podcast" className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider text-white/60">Podcast</span>
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-base leading-tight">OGC PODCAST</p>
                        <p className="text-xs text-white/40 mt-0.5">CS2 talk og analyse</p>
                      </div>
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

        {/* ========== MOBILE HEADER ========== */}
        <header className="md:hidden relative w-full flex justify-between items-center px-8 py-6 z-[100]">
          <Link href="/" className="pointer-events-auto">
            <img src={logoUrl} alt="Logo" className="h-26 w-auto object-contain" />
          </Link>

          <button
            className="pointer-events-auto flex items-center gap-2.5 font-bold bg-none border-none cursor-pointer transition-colors duration-300"
            onClick={toggleMobileMenu}
            style={{ color: mobileMenuOpen ? '#000' : '#fff' }}
          >
            <span className="text-sm">{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
            <span ref={iconRef} className="relative w-5 h-5">
              <span className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" style={{ background: 'currentColor' }} />
              <span className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" style={{ background: 'currentColor', transform: 'translateY(-50%) rotate(90deg)' }} />
            </span>
          </button>
        </header>

        {/* ========== MOBILE SIDE PANEL ========== */}
        <aside
          ref={panelRef}
          className="md:hidden fixed top-0 left-full w-[400px] h-screen bg-white p-12 pt-32 z-10 text-black shadow-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="w-full h-full flex flex-col">
            <ul className="list-none p-0 space-y-4">
              {NAV_ITEMS.map((it, idx) => {
                const isActive = pathname === it.link;
                return (
                  <li key={idx} className="overflow-hidden">
                    <Link
                      href={it.link}
                      className="block text-3xl font-black no-underline leading-tight"
                      style={{ color: isActive ? accentColor : 'black' }}
                      onClick={toggleMobileMenu}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = accentColor; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = isActive ? accentColor : 'black'; }}
                    >
                      <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Mobil: MEDIER accordion */}
              <li>
                <div className="overflow-hidden">
                  <button
                    className="sm-panel-itemLabel inline-flex items-center gap-2 text-3xl font-black leading-tight text-black bg-transparent border-none cursor-pointer p-0"
                    onClick={() => setMobileMedierOpen(o => !o)}
                  >
                    MEDIER
                    <svg
                      className="w-5 h-5 transition-transform duration-300"
                      style={{ transform: mobileMedierOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Accordion indhold */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: mobileMedierOpen ? '200px' : '0px', opacity: mobileMedierOpen ? 1 : 0 }}
                >
                  <div className="pt-3 ml-1 flex flex-col gap-2.5">
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

      <style jsx>{`
        @media (max-width: 768px) {
          aside, .sm-prelayer { width: 100% !important; }
        }
      `}</style>
    </>
  );
}
