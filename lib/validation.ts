import { z } from "zod";

export const createRoomSchema = z.object({
  displayName: z.string().trim().min(2).max(24),
  origin: z.string().url().optional(),
});

export const joinRoomSchema = z.object({
  displayName: z.string().trim().min(2).max(24),
  origin: z.string().url().optional(),
});

export const hostActionSchema = z.object({
  playerId: z.string().min(1),
});

export const teamUpdateSchema = z.object({
  playerId: z.string().min(1),
  team: z.enum(["blue", "red", "neutral"]),
});

export const clueSchema = z.object({
  playerId: z.string().min(1),
  clue: z.string().trim().min(1).max(120),
});

export const dialSchema = z.object({
  playerId: z.string().min(1),
  dialPosition: z.number().min(0).max(100),
});
