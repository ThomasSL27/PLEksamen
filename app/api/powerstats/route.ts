// ============================================================
// API Route: Henter power-statistik fra Dust2 API'et
// Placering: /app/api/powerstats/route.ts (Next.js App Router)
// ============================================================

// Importerer Next.js' indbyggede typer til request og response i API routes
import { NextRequest, NextResponse } from "next/server";

// Definerer og eksporterer en GET-handler — Next.js kalder denne automatisk ved GET-requests til denne route
export async function GET(req: NextRequest) {

  // Udtrækker query-parametrene fra URL'en (fx ?type=b/32)
  const { searchParams } = new URL(req.url);
  // Henter værdien af "type"-parameteren — falder tilbage på "a/31" hvis ingen er angivet
  const type = searchParams.get("type") || "a/31";

  // Henter API-nøglen fra environment variables (ligger i .env.local, aldrig i koden)
  const apiKey = process.env.DUST2_API_KEY;

  // ============================================================
  // Validering: Tjekker om API-nøglen findes
  // ============================================================

  // Hvis API-nøglen mangler, logges en fejl og der returneres en 500-fejl til klienten
  if (!apiKey) {
    console.error("❌ DUST2_API_KEY ikke fundet i environment variables");
    // Returnerer et JSON-fejlobjekt med HTTP status 500 (Internal Server Error)
    return NextResponse.json(
      { error: "API nøgle ikke konfigureret" },
      { status: 500 }
    );
  }

  // ============================================================
  // Datahentning: Kalder det eksterne Dust2 API
  // ============================================================

  // try/catch fanger eventuelle netværksfejl eller uventede fejl
  try {
    // Laver et fetch-kald til Dust2 API'et med den dynamiske "type"-værdi i URL'en
    const res = await fetch(`https://api.dust2.org/powerstats/${type}`, {
      headers: {
        // Sender API-nøglen som en Bearer token i Authorization-headeren
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Logger HTTP-statuskoden fra API-svaret til terminalen (til debugging)
    console.log("Response status:", res.status);

    // ============================================================
    // Fejlhåndtering: Tjekker om API-svaret er OK (status 200-299)
    // ============================================================

    // Hvis res.ok er false (fx 404 eller 403), håndteres fejlen her
    if (!res.ok) {
      // Læser fejlbeskedens tekst fra API-svaret
      const errorText = await res.text();
      console.error("API fejl:", res.status, errorText);
      // Returnerer fejlbeskeden videre til klienten med samme statuskode som API'et gav
      return NextResponse.json(
        { error: `API fejl: ${res.status} - ${errorText}` },
        { status: res.status }
      );
    }

    // ============================================================
    // Succesrespons: Parser og returnerer data
    // ============================================================

    // Parser API-svaret som JSON
    const data = await res.json();
    console.log("Data modtaget successfully");
    // Returnerer den hentede data som JSON til klienten (HTTP 200 som standard)
    return NextResponse.json(data);

  } catch (error) {
    // Fanger netværksfejl, fx hvis Dust2 API'et er nede eller URL'en er forkert
    console.error("Fetch fejl:", error);
    // Returnerer en generisk fejlbesked med status 500
    return NextResponse.json(
      { error: "Kunne ikke fetche data fra API" },
      { status: 500 }
    );
  }
}