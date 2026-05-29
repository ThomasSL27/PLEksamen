"use client";

import Link from "next/link";

export default function TheFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-orange-brand/10 text-foreground font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Top sektion: Logoer og tilhørsforhold */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/[0.03] pb-8 md:flex-row">
          
          {/* POWER Ligaen Brand - Forstørret logo fra h-16 til h-24 */}
          <div className="h-24 w-auto flex items-center shrink-0">
            <img
              src="/logo.webp"
              alt="Power Ligaen"
              className="h-full w-auto object-contain"
            />
          </div>

          {/* En del af Dust2.dk - Justeret py-4 for at matche det større hovedlogo */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4">
            <span className="text-xs font-black uppercase tracking-wider text-orange-soft/65">
              En del af
            </span>
            <div className="h-6 w-auto flex items-center shrink-0">
              <img
                src="/Dust2DKLogo.png"
                alt="Dust2.dk Logo"
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
          
        </div>

        {/* Ansvarligt spil / Lovpligtige informationer */}
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-12 items-baseline">
          
          {/* Lovpligtig advarselstekst */}
          <div className="lg:col-span-8">
            <p className="text-xs leading-relaxed text-orange-soft/45">
              Du skal være 18 år eller derover for at bruge denne hjemmeside. Spil venligst ansvarligt. 
              StopSpillet er Spillemyndighedens hjælpelinje til ansvarligt spil. Hvis du har brug for hjælp, 
              kan du ringe til{" "}
              <a 
                href="tel:+4570222825" 
                className="text-orange-brand hover:text-orange-soft font-bold transition-colors"
                aria-label="Ring til StopSpillet på 70 22 28 25"
              >
                +45 70 22 28 25
              </a>
              . Ønsker du at udelukke dig selv for spil, kan du gøre det via{" "}
              <a 
                href="https://www.rofus.nu" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-brand hover:text-orange-soft font-bold transition-colors"
                aria-label="Besøg ROFUS hjemmeside"
              >
                ROFUS
              </a>
              .
            </p>
          </div>

          {/* Links i højre side */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="flex flex-wrap gap-4 text-orange-soft/40">
              <Link href="/" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-[10px]">
                Forside
              </Link>
              <Link href="/kampe" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-[10px]">
                Kampe
              </Link>
              <Link href="/stillinger" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-[10px]">
                Stillinger
              </Link>
              <Link href="/hold" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-[10px]">
                Hold
              </Link>
              <Link href="/spillere" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-[10px]">
                Spillere
              </Link>
              <Link href="/om" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-[10px]">
                Om
              </Link>
            </div>
          </div>

          {/* Bund-sektion i griddet: Logoer til venstre, Copyright til højre */}
          <div className="lg:col-span-8 pt-2">
            {/* Ansvarligt spil links */}
            <div className="flex flex-wrap items-center gap-6 select-none">
              <a
                href="https://www.rofus.nu/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-auto flex items-center transition-transform duration-300 hover:scale-105"
                aria-label="Gå til ROFUS"
              >
                <img src="/rofus.png" alt="ROFUS" className="h-full w-auto object-contain" />
              </a>

              <a
                href="https://ludomani.dk/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-auto flex items-center transition-transform duration-300 hover:scale-105"
                aria-label="Gå til Center for Ludomani"
              >
                <img src="/centerForLudomani.png" alt="Center for Ludomani" className="h-full w-auto object-contain" />
              </a>

              <a
                href="https://www.stopspillet.dk/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-auto flex items-center transition-transform duration-300 hover:scale-105"
                aria-label="Gå til StopSpillet"
              >
                <img src="/stopSpillet.png" alt="StopSpillet" className="h-full w-auto object-contain" />
              </a>
              
              <span className="text-[10px] font-black tracking-widest bg-white/5 text-orange-soft/40 border border-white/10 px-3 py-1.5 rounded-full uppercase">
                18+ • Regler og vilkår gælder
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end lg:pt-2">
            <p className="text-[10px] font-bold tracking-widest text-orange-soft/20 uppercase text-left lg:text-right">
              &copy; {currentYear} POWER Ligaen. Alle rettigheder forbeholdes.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}