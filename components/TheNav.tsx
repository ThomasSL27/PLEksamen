"use client";
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap'; // GSAP bibliotek til smooth animationer
import Link from 'next/link'; // Next.js Link-komponent til navigation

// Array med fast definerede navigationsvalgmuligheder
// Hver objekt indeholder label (navn) og link (rute)
const NAV_ITEMS = [
  { label: 'FORSIDE', link: '/' },
  { label: 'KAMPE', link: '/kampe' },
  { label: 'STILLINGER', link: '/stillinger' },
  { label: 'HOLD', link: '/hold' },
  { label: 'SPILLERE', link: '/spillere' },
  { label: 'OM', link: '/om' },
];

// Props-type for komponenten
type TheNavProps = {
  logoUrl?: string;
  accentColor?: string;
  colors?: string[];
};

// TheNav er hovedkomponenten - en responsiv navigationsbalk med desktop-nav og mobile burger-menu
export default function TheNav({
  logoUrl = './logo.webp',
  accentColor = '#FF6B00',
  colors = ['#FFD8B1', '#FF6B00']
}: TheNavProps) {
  // State for at tracke om mobile menu er åben/lukket
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for at tracke om siden er scrolled ned (for blur-effekt)
  const [scrolled, setScrolled] = useState(false);
  
  // Ref til sidepanelet - bruges til GSAP animationer
  const panelRef = useRef<HTMLElement | null>(null);
  
  // Ref til burger-ikonet - bruges til at rotere når menu åbnes/lukkes
  const iconRef = useRef<HTMLSpanElement | null>(null);

  // useEffect der lytter på scroll-events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper-funktion der animerer burger-ikonet
  const animateIcon = (rotation: number) => {
    gsap.to(iconRef.current, { rotate: rotation, duration: 0.5 });
  };

  // Callback-funktion der åbner/lukker mobile menu
  const toggleMobileMenu = useCallback(() => {
    const isOpening = !mobileMenuOpen;
    setMobileMenuOpen(isOpening);

    if (isOpening) {
      const tl = gsap.timeline();
      
      tl.to(".sm-prelayer", {
        xPercent: -100,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power4.out'
      });
      
      tl.to(panelRef.current, {
        xPercent: -100,
        duration: 0.6,
        ease: 'power4.out'
      }, "-=0.4");
      
      tl.fromTo(".sm-panel-itemLabel",
        { yPercent: 140, rotate: 10 },
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.1, ease: 'power4.out' },
        "-=0.3"
      );
      
      animateIcon(225);
    } else {
      gsap.to([panelRef.current, ".sm-prelayer"], {
        xPercent: 0,
        duration: 0.4,
        ease: 'power3.in'
      });
      
      animateIcon(0);
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
            <div 
              key={i} 
              className="sm-prelayer absolute top-0 left-0 w-full h-full" 
              style={{ background: c }}
            />
          ))}
        </div>

        {/* ========== DESKTOP NAVBAR ========== */}
        <header className="hidden md:flex relative w-full justify-between items-center px-12 py-6 z-[100]">
          {/* Desktop Logo */}
          <Link href="/" className="pointer-events-auto flex-shrink-0">
            <img src={logoUrl} alt="Logo" className="h-24 w-auto" />
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-12">
            <ul className="list-none flex gap-12 m-0 p-0">
              {NAV_ITEMS.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.link}
                    className="text-white text-sm font-bold no-underline transition-colors duration-200"
                    style={{
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#ffffff';
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* ========== MOBILE HEADER ========== */}
        <header className="md:hidden relative w-full flex justify-between items-center px-8 py-8 z-[100]">
          {/* Mobile Logo */}
          <Link href="/" className="pointer-events-auto">
            <img src={logoUrl} alt="Logo" className="h-20 w-auto" />
          </Link>
          
          {/* Mobile Menu Toggle Button */}
          <button
            className="pointer-events-auto flex items-center gap-2.5 font-bold bg-none border-none cursor-pointer transition-colors duration-300"
            onClick={toggleMobileMenu}
            style={{ color: mobileMenuOpen ? '#000' : '#fff' }}
          >
            <span className="text-sm">{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
            
            <span ref={iconRef} className="relative w-5 h-5">
              <span 
                className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" 
                style={{ background: 'currentColor' }} 
              />
              <span 
                className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2" 
                style={{ background: 'currentColor', transform: 'translateY(-50%) rotate(90deg)' }} 
              />
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
              {NAV_ITEMS.map((it, idx) => (
                <li key={idx} className="overflow-hidden">
                  <Link
                    href={it.link}
                    className="block text-3xl font-black no-underline text-black leading-tight"
                    onClick={toggleMobileMenu} // Rette-punkt: Lukker menupanelet korrekt via GSAP nu
                    onMouseEnter={(e) => { 
                      (e.currentTarget as HTMLElement).style.color = accentColor; 
                    }}
                    onMouseLeave={(e) => { 
                      (e.currentTarget as HTMLElement).style.color = 'black'; 
                    }}
                  >
                    <span className="sm-panel-itemLabel inline-block">
                      {it.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* CSS for mobile responsivitet */}
      <style jsx>{`
        @media (max-width: 768px) {
          aside, .sm-prelayer { width: 100% !important; }
        }
      `}</style>
    </>
  );
}