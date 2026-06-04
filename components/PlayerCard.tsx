// ============================================================
// PlayerCard: components/PlayerCard.tsx
// Genbrugelig spillerkort-komponent der vises i spillerdatabasen
// og på holdoversigten. Kortet har et hover-overlay med ekstra info.
// GSAP ScrambleText animerer spillerens navn med tilfældige tegn.
// "use client" er nødvendigt pga. GSAP-animationer og onClick.
// ============================================================
"use client";

import { useRef, useState } from "react";
// GSAP er et animationsbibliotek til avancerede JavaScript-animationer
import { gsap } from "gsap";
// ScrambleTextPlugin animerer tekst ved at vise tilfældige tegn før den rigtige tekst
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
// getTwitterUrl formaterer Twitter-håndtag til en fuld URL
import { getTwitterUrl } from "@/lib/utils";

// ============================================================
// GSAP plugin-registrering: Skal kun ske på klientsiden (ikke server-render)
// typeof window !== "undefined" tjekker om vi er i browseren
// ============================================================
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// ============================================================
// X (Twitter) ikon: Inline SVG-komponent for X-logoet
// Bruger en className-prop til styling udefra
// ============================================================
function XTwitterIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
    </svg>
  );
}

// ============================================================
// PlayerCardProps: TypeScript-interface der definerer alle props
// Spørgsmålstegn (?) markerer valgfrie props
// ============================================================
export interface PlayerCardProps {
  nickname: string;       // Spillerens kaldenavn (altid påkrævet)
  name?: string;          // Spillerens rigtige navn (valgfrit)
  image?: string;         // URL til spillerbillede (valgfrit)
  role?: string;          // Spillerrolle, fx "IGL" eller "Rifler" (valgfrit)
  age?: number | string;  // Spillerens alder (valgfrit)
  twitter?: string;       // Twitter/X håndtag (valgfrit)
  teamName: string;       // Holdets navn (påkrævet)
  teamLogo: string;       // URL til holdlogo (påkrævet)
  division: string;       // Ligaens navn, fx "Sæson 31" (påkrævet)
}

// ============================================================
// PlayerCard: Selve kortkomponenten
// Destructuring udtrækker alle props direkte i funktionssignaturen
// ============================================================
export default function PlayerCard({
  nickname,
  name,
  image,
  role,
  age,
  twitter,
  teamName,
  teamLogo,
  division,
}: PlayerCardProps) {
  // isOpen styrer om hover-overlay'et er synligt (bruges til touch-enheder)
  const [isOpen, setIsOpen] = useState(false);
  // hoverNicknameRef er en reference til nickname-teksten i overlay'et til GSAP
  const hoverNicknameRef = useRef<HTMLParagraphElement>(null);

  // ============================================================
  // GSAP ScrambleText: Animerer nicknamen med tilfældige tegn ved hover
  // chars definerer hvilke tegn der bruges i scramble-effekten
  // ============================================================
  const handleMouseEnter = () => {
    if (hoverNicknameRef.current) {
      gsap.to(hoverNicknameRef.current, {
        duration: 0.4,
        scrambleText: {
          text: nickname,            // Den endelige tekst der vises
          chars: "01X#$@!?%&*",     // Tilfældige tegn brugt under animationen
          speed: 0.3,                // Hastighed på afsløringen (lavere = langsommere)
          revealDelay: 0.05,         // Forsinkelse før afsløringen starter
        },
      });
    }
  };

  const handleMouseLeave = () => {
    if (hoverNicknameRef.current) {
      gsap.to(hoverNicknameRef.current, {
        duration: 0.3,
        scrambleText: {
          text: nickname,
          chars: "01X#$@!?%&*",
          speed: 0.4,
        },
      });
    }
  };

  return (
    // Kort-wrapper: Klik toggle isOpen (til touch/mobil), hover udløser GSAP
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsOpen(o => !o)}
      className={`group relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border bg-input transition-all duration-300 cursor-pointer hover:border-orange-brand/50 hover:shadow-[0_0_20px_rgba(var(--brand-orange-rgb),0.15)] ${isOpen ? "border-orange-brand/50 shadow-[0_0_20px_rgba(var(--brand-orange-rgb),0.15)]" : "border-orange-brand/15"}`}
    >
      {/* ============================================================ */}
      {/* Lag 1: Dæmpet holdlogo i baggrunden (opacity 8%)              */}
      {/* pointer-events-none forhindrer at det blokerer klik           */}
      {/* ============================================================ */}
      {teamLogo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110">
          <img src={teamLogo} alt="" className="h-full w-full object-contain" />
        </div>
      )}

      {/* ============================================================ */}
      {/* Lag 2: Hold-logo øverst til højre (synligt holdlogo)          */}
      {/* ============================================================ */}
      {teamLogo && (
        <img
          src={teamLogo}
          alt={teamName}
          className="absolute top-3 right-3 h-10 w-10 object-contain z-5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(var(--brand-orange-rgb),0.2)]"
        />
      )}

      {/* ============================================================ */}
      {/* Lag 3: Spillerbillede cutout                                  */}
      {/* pb-14 skubber billedet op så det ikke dækker info-bjælken     */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pb-14 flex items-end justify-center select-none">
        {image ? (
          <img
            src={image}
            alt={nickname}
            className="h-full w-full object-contain object-bottom opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {/* Gradient-fade i bunden: Smelter billedet ind i baggrunden */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ============================================================ */}
      {/* Lag 4: Standard info-bjælke i bunden (vises normalt)          */}
      {/* Skjules ved hover eller når isOpen er true                    */}
      {/* ============================================================ */}
      <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-deeper to-card-bottom border-t border-orange-brand/10 p-3.5 h-14 flex items-center justify-between z-10 transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none ${isOpen ? "opacity-0 pointer-events-none" : ""}`}>
        <p className="text-sm font-black uppercase text-white truncate max-w-full">
          {nickname}
        </p>
      </div>

      {/* ============================================================ */}
      {/* Lag 5: Hover Overlay Panel med ekstra spillerinfo             */}
      {/* translate-y-4 ved skjult, translate-y-0 ved synlig (glider op) */}
      {/* ============================================================ */}
      <div className={`absolute inset-0 bg-gradient-to-b from-input/40 via-background/95 to-darkest p-4 flex flex-col justify-end transition-all duration-300 z-20 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        {/* Nickname med GSAP ScrambleText-animation — overflow-hidden begrænser højden */}
        <p
          ref={hoverNicknameRef}
          className="text-base font-black uppercase text-orange-brand mb-0.5 h-6 overflow-hidden select-none"
        >
          {nickname}
        </p>

        {/* Spillerens rigtige navn (vises kun hvis det er tilgængeligt) */}
        {name && (
          <p className="text-xs text-orange-soft/45 leading-tight line-clamp-2 mb-3">
            {name}
          </p>
        )}

        {/* Holdoplysninger */}
        <div className="border-t border-orange-brand/15 pt-2.5 flex items-center gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-label font-black uppercase text-white truncate leading-tight">
              {teamName}
            </p>
            {/* Division, fx "Sæson 31 Grundspil" */}
            <p className="text-2xs font-bold text-orange-soft/35 uppercase tracking-wider truncate leading-tight">
              {division}
            </p>
            {/* Spillerrolle (vises kun hvis tilgængeligt) */}
            {role && (
              <p className="text-2xs font-bold text-orange-brand uppercase tracking-wider truncate leading-tight">
                {role}
              </p>
            )}
          </div>
        </div>

        {/* Alder og X/Twitter-link */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2">
          {/* Alder — viser "–" hvis ukendt */}
          <span className="text-label font-semibold text-orange-soft/60">
            {age ? `${age} år` : "–"}
          </span>
          {/* Twitter-link: Klikbart ikon hvis Twitter er angivet, ellers grå placeholder */}
          {twitter ? (
            <a
              href={getTwitterUrl(twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-5 w-5 items-center justify-center rounded bg-orange-brand/10 text-orange-soft/50 hover:bg-orange-brand/20 hover:text-white transition-colors"
            >
              <XTwitterIcon className="h-2.5 w-2.5" />
            </a>
          ) : (
            // Deaktiveret Twitter-ikon hvis ingen Twitter er tilgængeligt
            <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-brand/5 text-orange-soft/20">
              <XTwitterIcon className="h-2.5 w-2.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
