// ============================================================
// TheFooter: components/TheFooter.tsx
// Footer-komponent der vises i bunden af alle sider via layout.tsx.
// Indeholder: Logo, sociale medier, lovpligtige ansvarsspil-oplysninger,
// navigationslinks og copyright.
// "use client" er nødvendigt fordi vi bruger new Date() dynamisk.
// ============================================================
"use client";

// Link bruges til intern navigation (hurtigere end <a> da det ikke genindlæser siden)
import Link from "next/link";
// FontAwesomeIcon er en ikonkomponent fra Font Awesome biblioteket
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Importerer de specifikke sociale medie-ikoner vi bruger
import { faXTwitter, faInstagram, faTwitch, faFacebook } from "@fortawesome/free-brands-svg-icons";

export default function TheFooter() {
  // Henter det aktuelle årstal dynamisk — sikrer copyright-teksten altid er opdateret
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-orange-brand/10 text-foreground font-sans">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ============================================================ */}
        {/* Top sektion: Logo til venstre, sociale medier til højre      */}
        {/* ============================================================ */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/[0.03] pb-8 md:flex-row">

          {/* POWER Ligaen logo */}
          <div className="h-24 w-auto flex items-center shrink-0">
            <img
              src="/logo.webp"
              alt="Power Ligaen"
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Højre side: Sociale medie ikoner + Dust2.dk-logo */}
          <div className="flex flex-col items-center md:items-end gap-4">

            {/* Sociale medie ikoner — hver er et rundt ikon-link */}
            <div className="flex items-center gap-3">
              {/* X (Twitter) */}
              <a href="https://x.com/dust2dk" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-orange-soft/50 transition-all duration-300 hover:border-orange-brand/40 hover:bg-orange-brand/10 hover:text-orange-brand">
                <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/dust2dk" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-orange-soft/50 transition-all duration-300 hover:border-orange-brand/40 hover:bg-orange-brand/10 hover:text-orange-brand">
                <FontAwesomeIcon icon={faInstagram} className="h-4 w-4" />
              </a>
              {/* Twitch */}
              <a href="https://www.twitch.tv/dust2tv" target="_blank" rel="noopener noreferrer" aria-label="Twitch" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-orange-soft/50 transition-all duration-300 hover:border-orange-brand/40 hover:bg-orange-brand/10 hover:text-orange-brand">
                <FontAwesomeIcon icon={faTwitch} className="h-4 w-4" />
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/dust2dk" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-orange-soft/50 transition-all duration-300 hover:border-orange-brand/40 hover:bg-orange-brand/10 hover:text-orange-brand">
                <FontAwesomeIcon icon={faFacebook} className="h-4 w-4" />
              </a>
            </div>

            {/* "En del af Dust2.dk" sektion med Dust2.dk-logo */}
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

        </div>

        {/* ============================================================ */}
        {/* Bund-sektion: Lovpligtige tekster, links og copyright        */}
        {/* lg:grid-cols-12 opdeler bunden i 12 kolonner på desktop      */}
        {/* ============================================================ */}
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-12 items-baseline">

          {/* Lovpligtig advarselstekst — kræves af Spillemyndigheden */}
          <div className="lg:col-span-8">
            <p className="text-xs leading-relaxed text-orange-soft/45">
              Du skal være 18 år eller derover for at bruge denne hjemmeside. Spil venligst ansvarligt.
              StopSpillet er Spillemyndighedens hjælpelinje til ansvarligt spil. Hvis du har brug for hjælp,
              kan du ringe til{" "}
              {/* Klikbart telefonnummer til StopSpillet */}
              <a
                href="tel:+4570222825"
                className="text-orange-brand hover:text-orange-soft font-bold transition-colors"
                aria-label="Ring til StopSpillet på 70 22 28 25"
              >
                +45 70 22 28 25
              </a>
              . Ønsker du at udelukke dig selv for spil, kan du gøre det via{" "}
              {/* Link til ROFUS selvudelukkelsesregister */}
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

          {/* Interne navigationslinks i footer */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="flex flex-wrap gap-4 text-orange-soft/40">
              <Link href="/stillinger" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-label">
                Stillinger
              </Link>
              <Link href="/kampe" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-label">
                Kampe
              </Link>
              <Link href="/spillere" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-label">
                Spillere
              </Link>
              <Link href="/hold" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-label">
                Hold
              </Link>
              <Link href="/om" className="hover:text-orange-brand transition-colors font-bold uppercase tracking-wider text-label">
                Om
              </Link>
            </div>
          </div>

          {/* Ansvarligt spil logoer: ROFUS, Center for Ludomani, StopSpillet */}
          <div className="lg:col-span-8 pt-2">
            <div className="flex flex-wrap items-center gap-6 select-none">
              {/* ROFUS logo-link */}
              <a
                href="https://www.rofus.nu/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-auto flex items-center transition-transform duration-300 hover:scale-105"
                aria-label="Gå til ROFUS"
              >
                <img src="/rofus.png" alt="ROFUS" className="h-full w-auto object-contain" />
              </a>

              {/* Center for Ludomani logo-link */}
              <a
                href="https://ludomani.dk/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-auto flex items-center transition-transform duration-300 hover:scale-105"
                aria-label="Gå til Center for Ludomani"
              >
                <img src="/centerForLudomani.png" alt="Center for Ludomani" className="h-full w-auto object-contain" />
              </a>

              {/* StopSpillet logo-link */}
              <a
                href="https://www.stopspillet.dk/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-auto flex items-center transition-transform duration-300 hover:scale-105"
                aria-label="Gå til StopSpillet"
              >
                <img src="/stopSpillet.png" alt="StopSpillet" className="h-full w-auto object-contain" />
              </a>

              {/* 18+ badge */}
              <span className="text-label font-black tracking-widest bg-white/5 text-orange-soft/40 border border-white/10 px-3 py-1.5 rounded-full uppercase">
                18+ • Regler og vilkår gælder
              </span>
            </div>
          </div>

          {/* Copyright — årstallet opdateres automatisk via new Date().getFullYear() */}
          <div className="lg:col-span-4 flex items-center justify-start lg:justify-end lg:pt-2">
            <p className="text-label font-bold tracking-widest text-orange-soft/20 uppercase text-left lg:text-right">
              &copy; {currentYear} POWER Ligaen. Alle rettigheder forbeholdes.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
