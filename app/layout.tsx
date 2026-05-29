import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TheNav from "@/components/TheNav";
import SponsorBanner from "@/components/SponsorBanner";
import TheFooter from "@/components/TheFooter";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Power Ligaen",
  description: "Danmarks største CS2-liga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Nav er fixed — den fjerner sig ikke fra dokumentflow, derfor padding på wrapper. */}
        <TheNav />
        {/* Fast baggrund så intet gennemsigtigt lag “slår igennem” med forkert farve */}
        <div className="min-h-screen bg-background pt-[var(--nav-height)]">
          <SponsorBanner />
          {children}
        </div>
        <TheFooter />
      </body>
    </html>
  );
}
