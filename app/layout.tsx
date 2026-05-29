import type { Metadata } from "next";
import "./globals.css";
import TheNav from "@/components/TheNav";
import SponsorBanner from "@/components/SponsorBanner";
import TheFooter from "@/components/TheFooter";

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
      <body className="font-sans antialiased">
        <TheNav />
        <div className="min-h-screen bg-background pt-[var(--nav-height)]">
          <SponsorBanner />
          {children}
        </div>
        <TheFooter />
      </body>
    </html>
  );
}
