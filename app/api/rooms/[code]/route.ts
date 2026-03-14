import { NextResponse } from "next/server";

import { getRoomState } from "@/lib/server/room-service";
import { jsonError } from "@/lib/server/route-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RoomRouteProps {
  params: Promise<{ code: string }>;
}

export async function GET(request: Request, { params }: RoomRouteProps) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");
    const snapshot = getRoomState(code.toUpperCase(), playerId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error, 404);
  }
}
