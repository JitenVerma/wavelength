import { NextResponse } from "next/server";

import { jsonError, parseRequestBody } from "@/lib/server/route-helpers";
import { submitClue } from "@/lib/server/room-service";
import { clueSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RoomRouteProps {
  params: Promise<{ code: string }>;
}

export async function POST(request: Request, { params }: RoomRouteProps) {
  try {
    const { code } = await params;
    const payload = await parseRequestBody(request, clueSchema);
    const snapshot = await submitClue(code.toUpperCase(), payload.playerId, payload.clue);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
