import { NextResponse } from "next/server";
import { z } from "zod";

export function jsonError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Something went wrong." },
    { status },
  );
}

export async function parseRequestBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const payload = await request.json();
  return schema.parse(payload);
}
