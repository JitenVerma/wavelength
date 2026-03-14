import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { RoomState } from "@/lib/types";

declare global {
  // eslint-disable-next-line no-var
  var __wavelengthRooms: Map<string, RoomState> | undefined;
}

const DATA_DIRECTORY = path.join(process.cwd(), ".data");
const ROOMS_FILE_PATH = path.join(DATA_DIRECTORY, "rooms.json");

function ensureRoomsFile() {
  if (!existsSync(DATA_DIRECTORY)) {
    mkdirSync(DATA_DIRECTORY, { recursive: true });
  }

  if (!existsSync(ROOMS_FILE_PATH)) {
    writeFileSync(ROOMS_FILE_PATH, "{}", "utf8");
  }
}

function readRoomMap() {
  ensureRoomsFile();

  try {
    const raw = readFileSync(ROOMS_FILE_PATH, "utf8");
    const parsed = raw ? (JSON.parse(raw) as Record<string, RoomState>) : {};
    return new Map<string, RoomState>(Object.entries(parsed));
  } catch {
    return new Map<string, RoomState>();
  }
}

function writeRoomMap(roomMap: Map<string, RoomState>) {
  ensureRoomsFile();
  writeFileSync(ROOMS_FILE_PATH, JSON.stringify(Object.fromEntries(roomMap), null, 2), "utf8");
}

function getRoomMap(refresh = false) {
  if (refresh || !globalThis.__wavelengthRooms) {
    globalThis.__wavelengthRooms = readRoomMap();
  }

  return globalThis.__wavelengthRooms;
}

export function getRoom(code: string) {
  return getRoomMap(true).get(code);
}

export function setRoom(code: string, room: RoomState) {
  const roomMap = getRoomMap(true);
  roomMap.set(code, room);
  globalThis.__wavelengthRooms = roomMap;
  writeRoomMap(roomMap);
  return room;
}

export function getAllRooms() {
  return getRoomMap(true);
}

export function saveRoom(room: RoomState) {
  return setRoom(room.code, room);
}
