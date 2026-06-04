// ============================================================
// News: components/News.tsx
// En nyhedsslider med GSAP-animationer der viser seneste artikler.
// Brugeren kan navigere med pile-knapper og paginerings-prikker.
// "use client" er nødvendigt pga. GSAP-animationer og event handlers.
// ============================================================
"use client";

import { useRef, useState, useEffect } from "react";
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from "gsap";

// ============================================================
// Typer: Beskriver strukturen af et nyheds-item
// ============================================================
interface NewsItem {
  id: string;
  title: string;
  excerpt: string;    // Kort uddrag af artiklen
  category: string;
  date: string;
  image: string;      // Sti til forsidebillede
  url: string;        // Link til den fulde artikel på Dust2.dk
}

// ============================================================
// Data: Én basisnyhed der gentages 5 gange i slideren
// I en fremtidig version kan dette erstattes af et rigtigt API-kald
// ============================================================
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

// Opretter et array med 5 kopier af BASE_NEWS med unikke ID'er
const NEWS_ITEMS: NewsItem[] = Array.from({ length: 5 }, (_, i) => ({
  ...BASE_NEWS,
  id: String(i + 1),
}));

// ============================================================
// NewsSlider: Selve slider-komponenten
// Animationen er delt i to faser for at synkronisere korrekt med React:
//   Del 1 (animateSlide): Slide det nuværende kort UD og opdater state
//   Del 2 (useEffect):    React har nu rendret det nye kort — slide det IND
// ============================================================
export default function NewsSlider() {
  // currentIndex tracker hvilket nyheds-item der vises
  const [currentIndex, setCurrentIndex] = useState(0);
  // cardRef er en reference til nyhedskort-elementet — bruges til GSAP-animation
  const cardRef = useRef<HTMLAnchorElement>(null);
  // isAnimating forhindrer at brugeren starter en ny animation imens en kører
  const isAnimating = useRef(false);
  // pendingDirection gemmer retningen fra Del 1 til Del 2 af animationen
  const pendingDirection = useRef<"left" | "right" | null>(null);

  // ============================================================
  // Del 2 af animationen: Kører EFTER React har committed nyt indhold til DOM
  // useEffect med [currentIndex] som dependency kører når currentIndex opdateres
  // ============================================================
  useEffect(() => {
    // Hvis ingen afventende retning, spring over (fx første render)
    if (pendingDirection.current === null) return;
    const direction = pendingDirection.current;
    pendingDirection.current = null; // Nulstil for næste animation
    if (!cardRef.current) return;

    // Sæt startposition: Nyt kort starter uden for skærmen (høj/re side)
    gsap.set(cardRef.current, {
      xPercent: direction === "left" ? 110 : -110,
      opacity: 0,
    });
    // Animer kortet ind til sin naturlige position
    gsap.to(cardRef.current, {
      xPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        // Frigiver animationslåsen når animationen er færdig
        isAnimating.current = false;
      },
    });
  }, [currentIndex]);

  // ============================================================
  // Del 1 af animationen: Slider det aktuelle kort UD og opdaterer state
  // ============================================================
  const animateSlide = (newIndex: number, direction: "left" | "right") => {
    // Forhindrer ny animation hvis en allerede kører
    if (isAnimating.current || !cardRef.current) return;
    isAnimating.current = true;

    // Slider det aktuelle kort ud til venstre eller højre
    gsap.to(cardRef.current, {
      xPercent: direction === "left" ? -110 : 110,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        // Gemmer retningen og opdaterer state (trigger Del 2 via useEffect)
        pendingDirection.current = direction;
        setCurrentIndex(newIndex);
      },
    });
  };

  // Navigerer til et specifikt slide — bestemmer retning baseret på ny vs. gammel index
  const goToSlide = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    animateSlide(newIndex, newIndex > currentIndex ? "left" : "right");
  };

  // ============================================================
  // Event handlers: e.preventDefault() og e.stopPropagation() forhindrer
  // at klik på pile-knapper aktiverer linket bag dem
  // ============================================================
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Modulo-regning sikrer at vi wrapper rundt (fra 0 tilbage til sidst)
    goToSlide((currentIndex - 1 + NEWS_ITEMS.length) % NEWS_ITEMS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goToSlide((currentIndex + 1) % NEWS_ITEMS.length);
  };

  // Handler til paginerings-prikker
  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    goToSlide(idx);
  };

  // Det aktuelle nyheds-item der vises
  const currentItem = NEWS_ITEMS[currentIndex];

  return (
    <section className="relative w-full font-sans text-foreground" aria-label="Seneste nyheder">
      <div className="relative z-10 mx-auto flex w-full flex-col">

        {/* ============================================================ */}
        {/* Slider-område: Relativt positioneret container til GSAP       */}
        {/* overflow-hidden skjuler kortene der animeres ind/ud           */}
        {/* ============================================================ */}
        <div className="relative h-[340px] sm:h-[380px] w-full overflow-hidden">

          {/* Nyhedskort — er et <a>-tag så hele kortet er klikbart */}
          <a
            ref={cardRef}
            href={currentItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute inset-0 flex overflow-hidden rounded-2xl border border-orange-brand/15 bg-gradient-to-br from-card to-card-deep transition-all duration-300 hover:border-orange-brand/40 hover:shadow-[0_0_24px_rgba(var(--brand-orange-rgb),0.06)]"
          >
            {/* Venstre side: Forsidebillede (skjult på mobil, vist på desktop) */}
            <div className="relative hidden w-[50%] shrink-0 overflow-hidden bg-surface sm:block">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay: Blød overgang fra billede til kortets baggrund */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card" />
              {/* Kategori-badge oven på billedet */}
              <div className="absolute left-4 top-4">
                <span className="inline-block rounded-full bg-orange-brand/10 border border-orange-brand/25 px-3 py-1 text-2xs font-black uppercase tracking-widest text-orange-brand sm:text-label">
                  {currentItem.category}
                </span>
              </div>
            </div>

            {/* Baggrundsbillede på mobil — overlapper hele kortet med en mørk overlay */}
            <div className="absolute inset-0 sm:hidden">
              <img src={currentItem.image} alt="" className="h-full w-full object-cover" />
              {/* Semi-gennemsigtig overlay gør teksten læsbar på mobil */}
              <div className="absolute inset-0 bg-background/85" />
            </div>

            {/* Tekstindhold — vises til højre på desktop, over billedet på mobil */}
            <div className="relative z-10 flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
              {/* Kategori-badge (kun på mobil — desktop-versionen er oven på billedet) */}
              <span className="mb-3 inline-block w-fit rounded-full bg-orange-brand/10 border border-orange-brand/25 px-3 py-1 text-2xs font-black uppercase tracking-widest text-orange-brand sm:hidden">
                {currentItem.category}
              </span>
              {/* Overskrift — skifter til orange ved hover */}
              <h3 className="mb-3 text-xl font-black uppercase leading-tight tracking-tighter text-white transition-colors duration-300 group-hover:text-orange-brand sm:text-2xl lg:text-3xl max-w-lg">
                {currentItem.title}
              </h3>
              {/* Uddrag — line-clamp-2 begrænser til 2 linjer */}
              <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-orange-soft/60 sm:text-sm max-w-md">
                {currentItem.excerpt}
              </p>
              {/* Bund: Dato til venstre, "Læs mere" til højre */}
              <div className="mt-4 flex items-center justify-between border-t border-orange-brand/5 pt-4">
                <span className="text-caption font-bold text-orange-brand/70 sm:text-xs tracking-wider">
                  {currentItem.date}
                </span>
                {/* "Læs mere" pilen rykker sig 1px til højre ved hover */}
                <span className="flex items-center gap-1.5 text-caption font-black uppercase tracking-wider text-orange-soft/75 transition-colors duration-300 group-hover:text-orange-brand sm:text-xs">
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

          {/* Forrige-knap — z-30 sikrer at den er klikbar oven på kortet */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-orange-brand/20 bg-input/95 text-white shadow-xl transition-all hover:scale-105 hover:bg-card hover:border-orange-brand/50"
            aria-label="Forrige nyhed"
          >
            <svg className="h-5 w-5 text-orange-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Næste-knap */}
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

        {/* ============================================================ */}
        {/* Paginerings-prikker: Aktiv prik er bredere (w-8) end inaktive */}
        {/* ============================================================ */}
        <div className="mt-4 flex justify-center gap-2">
          {NEWS_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => handleDotClick(e, idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-orange-brand"         // Aktiv prik: bred og orange
                  : "w-1.5 bg-orange-brand/30 hover:bg-orange-brand/60" // Inaktiv prik: lille
              }`}
              aria-label={`Gå til nyhed ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
