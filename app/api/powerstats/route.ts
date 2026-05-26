import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "a/31";

  const apiKey = process.env.DUST2_API_KEY;

  if (!apiKey) {
    console.error("❌ DUST2_API_KEY ikke fundet i environment variables");
    return NextResponse.json(
      { error: "API nøgle ikke konfigureret" },
      { status: 500 }
    );
  }

  console.log("🔑 API key længde:", apiKey.length);
  console.log("🌐 Fetcher fra:", `https://api.dust2.org/powerstats/${type}`);

  try {
    const res = await fetch(`https://api.dust2.org/powerstats/${type}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log("📊 Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API fejl:", res.status, errorText);
      return NextResponse.json(
        { error: `API fejl: ${res.status} - ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("✅ Data modtaget successfully");
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Fetch fejl:", error);
    return NextResponse.json(
      { error: "Kunne ikke fetche data fra API" },
      { status: 500 }
    );
  }
}