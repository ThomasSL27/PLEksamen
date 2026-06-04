// ============================================================
// Hjælpefunktioner: lib/utils.ts
// Delte utility-funktioner brugt på tværs af komponenter og sider.
// Placeret i /lib/ så de let kan importeres fra alle steder i projektet.
// ============================================================

// toLower: Konverterer en streng til lowercase for case-insensitiv sammenligning.
// Håndterer undefined/null ved at falde tilbage på en tom streng via || ""
// Bruges fx til at sammenligne holdnavne og spillernavne fra API'et.
export const toLower = (value?: string) => String(value || "").toLowerCase();

// getTwitterUrl: Konverterer et Twitter/X håndtag til en fuld URL.
// Returnerer en tom streng hvis ingen twitter er angivet.
// Håndterer tre mulige inputformater:
//   1. Allerede en fuld URL, fx "https://x.com/leakz" → returneres uændret
//   2. Håndtag med @-tegn, fx "@leakz" → @-tegnet fjernes
//   3. Håndtag uden @, fx "leakz" → bruges direkte
export function getTwitterUrl(twitter?: string) {
  if (!twitter) return "";
  // Hvis det allerede starter med "http", er det en fuld URL — returner den direkte
  return twitter.startsWith("http")
    ? twitter
    // Ellers: Fjern eventuelt @-tegn og byg URL'en op
    : `https://x.com/${twitter.replace("@", "")}`;
}
