import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const isAuth = await verifyAdminRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}
