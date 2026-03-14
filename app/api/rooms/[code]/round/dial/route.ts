import { NextResponse } from "next/server";

import { jsonError, parseRequestBody } from "@/lib/server/route-helpers";
import { updateDial } from "@/lib/server/room-service";
import { dialSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RoomRouteProps {
  params: Promise<{ code: string }>;
}

export async function POST(request: Request, { params }: RoomRouteProps) {
  try {
    const { code } = await params;
    const payload = await parseRequestBody(request, dialSchema);
    const snapshot = await updateDial(code.toUpperCase(), payload.playerId, payload.dialPosition);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
