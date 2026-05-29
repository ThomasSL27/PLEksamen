"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Registrer GSAP plugin (kun på klientsiden)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

function XTwitterIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z" />
    </svg>
  );
}

function DefaultPlayerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

// -------------------------------------------
// Typer & Hjælpefunktioner
// -------------------------------------------
export interface PlayerCardProps {
  nickname: string;
  name?: string;
  image?: string;
  role?: string;
  age?: number | string;
  twitter?: string;
  teamName: string;
  teamLogo: string;
  division: string;
}

function getTwitterUrl(twitter?: string) {
  if (!twitter) return "";
  return twitter.startsWith("http")
    ? twitter
    : `https://x.com/${twitter.replace("@", "")}`;
}

// -------------------------------------------
// PlayerCard Komponent
// -------------------------------------------
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
  const hoverNicknameRef = useRef<HTMLParagraphElement>(null);

  const handleMouseEnter = () => {
    if (hoverNicknameRef.current) {
      gsap.to(hoverNicknameRef.current, {
        duration: 0.4,
        scrambleText: {
          text: nickname,
          chars: "01X#$@!?%&*",
          speed: 0.3,
          revealDelay: 0.05,
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
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-orange-brand/15 bg-input transition-all duration-300 hover:border-orange-brand/50 hover:shadow-[0_0_20px_rgba(var(--brand-orange-rgb),0.15)]"
    >
      {/* 1. Fast dæmpet holdlogo i baggrunden */}
      {teamLogo && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 opacity-[0.08] pointer-events-none transition-transform duration-500 group-hover:scale-110">
          <img src={teamLogo} alt="" className="h-full w-full object-contain" />
        </div>
      )}

      {/* 2. Hold-logo øverst til højre */}
      {teamLogo && (
        <img 
          src={teamLogo} 
          alt={teamName}
          className="absolute top-3 right-3 h-10 w-10 object-contain z-5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(var(--brand-orange-rgb),0.2)]" 
        />
      )}

      {/* 3. Spiller cutout */}
      <div className="absolute inset-0 pb-14 flex items-end justify-center select-none">
        {image ? (
          <img
            src={image}
            alt={nickname}
            className="h-full w-full object-contain object-bottom opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center pb-6">
            <DefaultPlayerIcon className="h-14 w-14 text-orange-brand/15" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* 4. Standard-bjælke nederst */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-deeper to-card-bottom border-t border-orange-brand/10 p-3.5 h-14 flex items-center justify-between z-10 transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
        <p className="text-sm font-black uppercase text-white truncate max-w-full">
          {nickname}
        </p>
      </div>

      {/* 5. Hover Overlay Panel */}
      <div className="absolute inset-0 bg-gradient-to-b from-input/40 via-background/95 to-darkest p-4 flex flex-col justify-end opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-20">
        <p
          ref={hoverNicknameRef}
          className="text-base font-black uppercase text-orange-brand mb-0.5 h-6 overflow-hidden select-none"
        >
          {nickname}
        </p>
        
        {name && (
          <p className="text-[10px] text-orange-soft/45 truncate mb-3">
            {name}
          </p>
        )}

        {/* Holdoplysninger */}
        <div className="border-t border-orange-brand/15 pt-2.5 flex items-center gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase text-white truncate leading-tight">
              {teamName}
            </p>
            <p className="text-[8px] font-bold text-orange-soft/35 uppercase tracking-wider truncate leading-tight">
              {division}
            </p>
            {role && (
              <p className="text-[8px] font-bold text-orange-brand uppercase tracking-wider truncate leading-tight">
                {role}
              </p>
            )}
          </div>
        </div>

        {/* Alder og Twitter */}
        <div className="flex items-center justify-between border-t border-white/5 pt-2">
          <span className="text-[10px] font-semibold text-orange-soft/60">
            {age ? `${age} år` : "–"}
          </span>
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
            <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-brand/5 text-orange-soft/20">
              <XTwitterIcon className="h-2.5 w-2.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}