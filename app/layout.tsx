// ============================================================
// Root Layout: app/layout.tsx (Next.js App Router)
// Denne fil er det øverste layout for hele applikationen.
// Alt indhold på ALLE sider pakkes ind i dette layout.
// ============================================================

// Importerer Next.js' Metadata-type til at sætte sidetitel og beskrivelse
import type { Metadata } from "next";
// Importerer den globale CSS-fil — gælder for hele applikationen
import "./globals.css";
// Importerer genbrugelige komponenter der vises på alle sider
import TheNav from "@/components/TheNav";
import SponsorBanner from "@/components/SponsorBanner";
import TheFooter from "@/components/TheFooter";

// ============================================================
// Metadata: Definerer sidetitel og beskrivelse
// Vises i browser-fanen og bruges af søgemaskiner (SEO)
// ============================================================
export const metadata: Metadata = {
  title: "Power Ligaen",
  description: "Danmarks største CS2-liga.",
};

// ============================================================
// RootLayout: Rodkomponenten der omslutter alle sider
// "children" er det indhold der skifter fra side til side
// Readonly<{}> er en TypeScript-type der gør props skrivebeskyttet
// ============================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="da" fortæller browseren at siden er på dansk (tilgængelighed + SEO)
    <html lang="da">
      <body className="font-sans antialiased">
        {/* Navigation vises øverst på alle sider */}
        <TheNav />

        {/* Hoved-wrapper: min-h-screen sikrer at siden fylder hele skærmhøjden */}
        {/* pt-[var(--nav-height)] skubber indholdet ned, så det ikke gemmes bag navigationen */}
        <div className="min-h-screen bg-background pt-[var(--nav-height)]">
          {/* Sponsorbanner vises under navigationen på alle sider */}
          <SponsorBanner />
          {/* children er det unikke sideindhold — fx forside, kampe, spillere osv. */}
          {children}
        </div>

        {/* Footer vises i bunden på alle sider */}
        <TheFooter />
      </body>
    </html>
  );
}
