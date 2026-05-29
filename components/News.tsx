"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";

// -------------------------------------------
// Typer
// -------------------------------------------
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  url: string;
}

// -------------------------------------------
// Data (midlertidigt hardcoded)
// -------------------------------------------
const BASE_NEWS: NewsItem = {
  id: "1",
  title: "POWER Ligaens bedste stopper som spiller",
  excerpt:
    "En af de mest markante spillere i Power Ligaens historie har valgt at stoppe karrieren. Læs hele historien bag beslutningen.",
  category: "Nyhed",
  date: "2025",
  image: "/lumsenBillede.webp",
  url: "https://www.dust2.dk/nyheder/60079/power-ligaens-bedste-stopper-som-spiller",
};

const NEWS_ITEMS: NewsItem[] = Array.from({ length: 5 }, (_, i) => ({
  ...BASE_NEWS,
  id: String(i + 1),
}));

export default function NewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const isAnimating = useRef(false);

  // Din originale tidslinje-animation med 'xPercent' - optimeret mod React-re-render glitches
  const animateSlide = (newIndex: number, direction: "left" | "right") => {
    if (isAnimating.current || !cardRef.current) return;
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      },
    });

    // 1. Slide og fade ud
    tl.to(cardRef.current, {
      xPercent: direction === "left" ? -110 : 110,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        // Opdater indholdet i React midt i tidslinjen
        setCurrentIndex(newIndex);
        
        // Flyt det tomme element til den modsatte startside
        gsap.set(cardRef.current, {
          xPercent: direction === "left" ? 110 : -110,
          opacity: 0,
        });
      },
    });

    // 2. Slide og fade ind til 0 (Med en lille forsinkelse, så React når at tegne det nye billede i kulissen)
    tl.to(
      cardRef.current,
      {
        xPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      },
      "+=0.02" // Forhindrer visuelle hop/glitches ved state-ændring
    );
  };

  const goToSlide = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    animateSlide(newIndex, newIndex > currentIndex ? "left" : "right");
  };

  // Undgå link navigation ved klik på knapper og dots
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goToSlide((currentIndex - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goToSlide((currentIndex + 1) % NEWS_ITEMS.length);
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    goToSlide(idx);
  };

  const currentItem = NEWS_ITEMS[currentIndex];

  return (
    <section className="relative w-full font-sans text-foreground" aria-label="Seneste nyheder">
      <div className="relative z-10 mx-auto flex w-full flex-col">
        
        {/* Slider-område */}
        <div className="relative h-[340px] sm:h-[380px] w-full overflow-hidden">
          
          {/* Link-kort - Flot mørkt design uden glød-cirkler */}
          <a
            ref={cardRef}
            href={currentItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute inset-0 flex overflow-hidden rounded-2xl border border-orange-brand/15 bg-gradient-to-br from-card to-card-deep transition-all duration-300 hover:border-orange-brand/40 hover:shadow-[0_0_24px_rgba(var(--brand-orange-rgb),0.06)]"
          >
            {/* Venstre side: Billede på desktop */}
            <div className="relative hidden w-[50%] shrink-0 overflow-hidden bg-surface sm:block">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card" />
              <div className="absolute left-4 top-4">
                <span className="inline-block rounded-full bg-orange-brand/10 border border-orange-brand/25 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-orange-brand sm:text-[10px]">
                  {currentItem.category}
                </span>
              </div>
            </div>

            {/* Baggrundsbillede på mobil */}
            <div className="absolute inset-0 sm:hidden">
              <img src={currentItem.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-background/85" />
            </div>

            {/* Højre side/indhold */}
            <div className="relative z-10 flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
              <span className="mb-3 inline-block w-fit rounded-full bg-orange-brand/10 border border-orange-brand/25 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-orange-brand sm:hidden">
                {currentItem.category}
              </span>
              <h3 className="mb-3 text-xl font-black uppercase leading-tight tracking-tighter text-white transition-colors duration-300 group-hover:text-orange-brand sm:text-2xl lg:text-3xl max-w-lg">
                {currentItem.title}
              </h3>
              <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-orange-soft/60 sm:text-sm max-w-md">
                {currentItem.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-orange-brand/5 pt-4">
                <span className="text-[11px] font-bold text-orange-brand/70 sm:text-xs tracking-wider">
                  {currentItem.date}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-soft/75 transition-colors duration-300 group-hover:text-orange-brand sm:text-xs">
                  Læs mere
                  <svg
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* Minimalistiske piletaster, der er klikbare og synlige (z-30) */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-orange-brand/20 bg-input/95 text-white shadow-xl transition-all hover:scale-105 hover:bg-card hover:border-orange-brand/50"
            aria-label="Forrige nyhed"
          >
            <svg className="h-5 w-5 text-orange-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-orange-brand/20 bg-input/95 text-white shadow-xl transition-all hover:scale-105 hover:bg-card hover:border-orange-brand/50"
            aria-label="Næste nyhed"
          >
            <svg className="h-5 w-5 text-orange-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Paginerings-prikker nedenunder */}
        <div className="mt-4 flex justify-center gap-2">
          {NEWS_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => handleDotClick(e, idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-orange-brand"
                  : "w-1.5 bg-orange-brand/30 hover:bg-orange-brand/60"
              }`}
              aria-label={`Gå til nyhed ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}