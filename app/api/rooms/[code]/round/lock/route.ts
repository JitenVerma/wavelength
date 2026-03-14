import { NextResponse } from "next/server";

import { jsonError, parseRequestBody } from "@/lib/server/route-helpers";
import { lockGuess } from "@/lib/server/room-service";
import { hostActionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RoomRouteProps {
  params: Promise<{ code: string }>;
}

export async function POST(request: Request, { params }: RoomRouteProps) {
  try {
    const { code } = await params;
    const payload = await parseRequestBody(request, hostActionSchema);
    const snapshot = await lockGuess(code.toUpperCase(), payload.playerId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
