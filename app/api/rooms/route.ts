import { NextResponse } from "next/server";

import { createRoom } from "@/lib/server/room-service";
import { jsonError, parseRequestBody } from "@/lib/server/route-helpers";
import { createRoomSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, createRoomSchema);
    const snapshot = await createRoom(payload.displayName, payload.origin);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
