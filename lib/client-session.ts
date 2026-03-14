"use client";

import type { PlayerSession } from "@/lib/types";

const ROOM_SESSION_PREFIX = "wavelength-room-session";

function getSessionKey(roomCode: string) {
  return `${ROOM_SESSION_PREFIX}:${roomCode}`;
}

export function getRoomSession(roomCode: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(getSessionKey(roomCode));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PlayerSession;
  } catch {
    return null;
  }
}

export function setRoomSession(session: PlayerSession) {
  if (typeof window === "undefined") {
    return;
  }

  const sessionKey = getSessionKey(session.roomCode);
  window.sessionStorage.setItem(sessionKey, JSON.stringify(session));
  window.localStorage.removeItem(sessionKey);
}

export function clearRoomSession(roomCode: string) {
  if (typeof window === "undefined") {
    return;
  }

  const sessionKey = getSessionKey(roomCode);
  window.sessionStorage.removeItem(sessionKey);
  window.localStorage.removeItem(sessionKey);
}
