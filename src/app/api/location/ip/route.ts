import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Vercel automatically injects these headers in production
  const lat = request.headers.get("x-vercel-ip-latitude");
  const lon = request.headers.get("x-vercel-ip-longitude");
  const city = request.headers.get("x-vercel-ip-city");

  if (lat && lon) {
    return NextResponse.json({
      success: true,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      city: city ? decodeURIComponent(city) : "Unknown Location",
    });
  }

  // Fallback if headers are missing (e.g. local dev)
  return NextResponse.json({
    success: false,
    message: "IP location headers not found.",
  }, { status: 404 });
}
