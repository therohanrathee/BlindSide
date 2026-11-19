import { NextRequest, NextResponse } from "next/server";
import { generateDropEmailHtml } from "@/lib/services/dropEmailTemplate";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name") || "Alex";
  const amount = parseFloat(searchParams.get("amount") || "69") || 69;

  const html = generateDropEmailHtml({
    firstName: name,
    amount,
    appUrl: "https://blindside.in/dashboard",
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
