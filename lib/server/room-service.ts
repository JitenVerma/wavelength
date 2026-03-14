import {
  beginNextTurn,
  canPlayerAdjustDial,
  canPlayerSubmitClue,
  completeRound,
  createEvent,
  createGameState,
  createRound,
  ensureUniqueDisplayName,
  getPlayerById,
  getTeamBalance,
  isHost,
  pruneRoomPlayers,
  pushRoomEvent,
  sanitizeRoomForPlayer,
  shuffleEvenTeams,
  transitionPhaseIfReady,
} from "@/lib/game-engine";
import { getRealtimeAdapter } from "@/lib/realtime";
import { generateRoomCode } from "@/lib/room-code";
import { getAllRooms, getRoom, saveRoom, setRoom } from "@/lib/server/store";
import { broadcastRoomStateChanged } from "@/lib/supabase/server";
import type { PlayerState, RoomSnapshot, RoomState, TeamAssignment } from "@/lib/types";

const MAX_PLAYERS = 12;
const JOIN_RETRY_WINDOW_MS = 15_000;

function getOrigin(origin?: string) {
  return origin ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function createShareUrl(origin: string, roomCode: string) {
  return `${origin}/join?code=${roomCode}`;
}

function createPlayer(displayName: string, isHost: boolean): PlayerState {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    displayName,
    team: "neutral",
    isHost,
    connected: true,
    joinedAt: now,
    lastSeenAt: now,
  };
}

function requireRoom(code: string) {
  const room = getRoom(code);
  if (!room) {
    throw new Error("Room not found.");
  }

  if (room.game?.currentRound && !Array.isArray(room.game.currentRound.clues)) {
    room.game.currentRound.clues = room.game.currentRound.clue ? [room.game.currentRound.clue] : [];
  }

  pruneRoomPlayers(room);
  transitionPhaseIfReady(room);
  saveRoom(room);
  return room;
}

function withRoomSnapshot(room: RoomState, viewerPlayerId: string | null): RoomSnapshot {
  return {
    room: sanitizeRoomForPlayer(room, viewerPlayerId),
    viewerPlayerId,
    realtimeProvider: getRealtimeAdapter().name,
    serverNow: new Date().toISOString(),
  };
}

export async function createRoom(displayName: string, origin?: string) {
  const roomMap = getAllRooms();
  let code = generateRoomCode();

  while (roomMap.has(code)) {
    code = generateRoomCode();
  }

  const host = createPlayer(displayName.trim(), true);
  const now = new Date().toISOString();
  const room: RoomState = {
    id: crypto.randomUUID(),
    code,
    createdAt: now,
    updatedAt: now,
    hostPlayerId: host.id,
    shareUrl: createShareUrl(getOrigin(origin), code),
    status: "lobby",
    maxPlayers: MAX_PLAYERS,
    players: [host],
    game: null,
    events: [],
  };

  pushRoomEvent(room, createEvent("player_joined", { playerId: host.id, displayName: host.displayName }));
  setRoom(code, room);
  await broadcastRoomStateChanged(room.code, "player_joined");

  return withRoomSnapshot(room, host.id);
}

export async function joinRoom(code: string, displayName: string, origin?: string) {
  const room = requireRoom(code);

  if (room.status !== "lobby") {
    throw new Error("This game has already started.");
  }

  if (room.players.length >= room.maxPlayers) {
    throw new Error("This room is already full.");
  }

  const now = new Date().toISOString();
  const normalizedDisplayName = displayName.trim().slice(0, 24).toLowerCase();
  const existingPlayer = room.players.find((player) => {
    if (player.displayName.toLowerCase() !== normalizedDisplayName) {
      return false;
    }

    return Date.now() - new Date(player.joinedAt).getTime() <= JOIN_RETRY_WINDOW_MS;
  });

  if (existingPlayer) {
    existingPlayer.connected = true;
    existingPlayer.lastSeenAt = now;
    room.shareUrl = createShareUrl(getOrigin(origin), room.code);
    saveRoom(room);
    return withRoomSnapshot(room, existingPlayer.id);
  }

  const player = createPlayer(ensureUniqueDisplayName(displayName, room.players), false);
  room.shareUrl = createShareUrl(getOrigin(origin), room.code);
  room.players.push(player);

  pushRoomEvent(room, createEvent("player_joined", { playerId: player.id, displayName: player.displayName }));
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "player_joined");

  return withRoomSnapshot(room, player.id);
}

export function getRoomState(code: string, viewerPlayerId: string | null) {
  const room = requireRoom(code);
  return withRoomSnapshot(room, viewerPlayerId);
}

export async function heartbeat(code: string, playerId: string) {
  const room = requireRoom(code);
  const player = getPlayerById(room, playerId);
  if (!player) {
    throw new Error("Player not found.");
  }

  player.lastSeenAt = new Date().toISOString();
  player.connected = true;
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "heartbeat");
  return withRoomSnapshot(room, playerId);
}

export async function updateTeam(code: string, playerId: string, team: TeamAssignment) {
  const room = requireRoom(code);
  if (room.status !== "lobby") {
    throw new Error("Teams can only change in the lobby.");
  }

  const player = getPlayerById(room, playerId);
  if (!player) {
    throw new Error("Player not found.");
  }

  player.team = team;
  pushRoomEvent(room, createEvent("team_changed", { playerId, team }));
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "team_changed");
  return withRoomSnapshot(room, playerId);
}

export async function shufflePlayers(code: string, playerId: string) {
  const room = requireRoom(code);
  if (!isHost(room, playerId)) {
    throw new Error("Only the host can shuffle teams.");
  }

  shuffleEvenTeams(room.players);
  pushRoomEvent(room, createEvent("players_shuffled", { byPlayerId: playerId }));
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "players_shuffled");
  return withRoomSnapshot(room, playerId);
}

export async function startGame(code: string, playerId: string) {
  const room = requireRoom(code);
  if (!isHost(room, playerId)) {
    throw new Error("Only the host can start the game.");
  }

  const { blueCount, redCount, hasNeutralPlayers } = getTeamBalance(room);
  if (hasNeutralPlayers) {
    throw new Error("Everyone needs to choose a team before the game starts.");
  }

  if (blueCount === 0 || redCount === 0) {
    throw new Error("Both teams need at least one player.");
  }

  room.game = createGameState(room.players.map((player) => player.id));
  room.status = "in-progress";
  beginNextTurn(room);
  pushRoomEvent(room, createEvent("game_started", { byPlayerId: playerId, blueCount, redCount }));
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "game_started");
  return withRoomSnapshot(room, playerId);
}

export async function spinRound(code: string, playerId: string) {
  const room = requireRoom(code);
  if (!room.game || room.game.activePlayerId !== playerId) {
    throw new Error("Only the active player can spin the wheel.");
  }

  if (!["starting", "next-turn"].includes(room.game.phase)) {
    throw new Error("The wheel cannot be spun right now.");
  }

  createRound(room);
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "wheel_spun");
  return withRoomSnapshot(room, playerId);
}

export async function submitClue(code: string, playerId: string, clue: string) {
  const room = requireRoom(code);
  if (!room.game?.currentRound) {
    throw new Error("There is no round to clue.");
  }

  if (!canPlayerSubmitClue(room, playerId)) {
    throw new Error("Only active teammates can submit the clue.");
  }

  const nextClue = clue.trim();
  room.game.currentRound.clue = nextClue;
  room.game.currentRound.clues = [...room.game.currentRound.clues, nextClue].slice(0, 2);
  room.game.currentRound.clueSubmittedAt = new Date().toISOString();
  room.game.phase = "dial-adjustment";
  pushRoomEvent(room, createEvent("clue_submitted", { playerId, clue }));
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "clue_submitted");
  return withRoomSnapshot(room, playerId);
}

export async function updateDial(code: string, playerId: string, dialPosition: number) {
  const room = requireRoom(code);
  if (!room.game?.currentRound) {
    throw new Error("There is no round in progress.");
  }

  if (!canPlayerAdjustDial(room, playerId)) {
    throw new Error("Only the active player can move the dial.");
  }

  room.game.currentRound.dialPosition = dialPosition;
  room.game.updatedAt = new Date().toISOString();
  pushRoomEvent(room, createEvent("dial_updated", { playerId, dialPosition }));
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "dial_updated");
  return withRoomSnapshot(room, playerId);
}

export async function lockGuess(code: string, playerId: string) {
  const room = requireRoom(code);
  if (!room.game?.currentRound) {
    throw new Error("There is no active round.");
  }

  if (!canPlayerAdjustDial(room, playerId)) {
    throw new Error("Only the active player can lock the guess.");
  }

  completeRound(room);
  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "guess_locked");
  return withRoomSnapshot(room, playerId);
}

export async function advanceTurn(code: string, playerId: string) {
  const room = requireRoom(code);
  if (!room.game) {
    throw new Error("Game not found.");
  }

  if (!isHost(room, playerId) && room.game.activePlayerId !== playerId) {
    throw new Error("Only the host or active player can advance the turn.");
  }

  if (room.game.phase !== "finished") {
    throw new Error("The game advances automatically until a winner is decided.");
  }

  saveRoom(room);
  await broadcastRoomStateChanged(room.code, "turn_advanced");
  return withRoomSnapshot(room, playerId);
}
