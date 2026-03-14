import { drawSpectrumCard } from "@/lib/cards";
import { DIAL_MAX, TWO_POINT_RADIUS } from "@/lib/dial";
import { scoreDialGuess } from "@/lib/scoring";
import type {
  GameState,
  PlayerState,
  RoomEvent,
  RoomState,
  RoundState,
  TeamColor,
} from "@/lib/types";

const DISCONNECTED_AFTER_MS = 30_000;
const REMOVE_AFTER_MS = 5 * 60_000;
const MAX_CLUES_PER_ROUND = 2;
const REVEAL_DURATION_MS = 2_000;
const SCORING_DURATION_MS = 1_500;

export function createEvent(
  type: RoomEvent["type"],
  payload: Record<string, unknown>,
): RoomEvent {
  return {
    id: crypto.randomUUID(),
    type,
    createdAt: new Date().toISOString(),
    payload,
  };
}

export function pushRoomEvent(room: RoomState, event: RoomEvent) {
  room.events = [event, ...room.events].slice(0, 50);
  room.updatedAt = event.createdAt;
}

export function ensureUniqueDisplayName(displayName: string, players: PlayerState[]) {
  const trimmed = displayName.trim().slice(0, 24);
  const normalized = trimmed.toLowerCase();

  if (!players.some((player) => player.displayName.toLowerCase() === normalized)) {
    return trimmed;
  }

  let suffix = 2;
  let candidate = `${trimmed} ${suffix}`;

  while (players.some((player) => player.displayName.toLowerCase() === candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${trimmed} ${suffix}`;
  }

  return candidate;
}

export function shuffleEvenTeams(players: PlayerState[]) {
  const shuffled = [...players];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }

  shuffled.forEach((player, index) => {
    player.team = index % 2 === 0 ? "blue" : "red";
  });
}

export function getPlayerById(room: RoomState, playerId: string) {
  return room.players.find((player) => player.id === playerId);
}

export function createGameState(turnOrder: string[], winScore = 10): GameState {
  return {
    phase: "starting",
    roundNumber: 0,
    activePlayerId: null,
    activeTeam: null,
    turnOrder,
    turnCounts: Object.fromEntries(turnOrder.map((playerId) => [playerId, 0])),
    blueScore: 0,
    redScore: 0,
    winScore,
    winner: null,
    currentRound: null,
    recentCardIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function getNextEligiblePlayer(room: RoomState) {
  const game = room.game;
  if (!game) {
    return null;
  }

  const currentIndex = game.activePlayerId ? game.turnOrder.indexOf(game.activePlayerId) : -1;
  const preferredTeam: TeamColor | null =
    game.activeTeam === "blue" ? "red" : game.activeTeam === "red" ? "blue" : null;

  const findEligiblePlayer = (team: TeamColor | null) => {
    for (let offset = 1; offset <= game.turnOrder.length; offset += 1) {
      const playerId = game.turnOrder[(currentIndex + offset) % game.turnOrder.length];
      const player = getPlayerById(room, playerId);
      if (!player || player.team === "neutral") {
        continue;
      }

      if (team && player.team !== team) {
        continue;
      }

      if ((game.turnCounts[playerId] ?? 0) < 2) {
        return player;
      }
    }

    return null;
  };

  return findEligiblePlayer(preferredTeam) ?? findEligiblePlayer(null);
}

export function beginNextTurn(room: RoomState) {
  const game = room.game;
  if (!game) {
    return;
  }

  const nextPlayer = getNextEligiblePlayer(room);
  if (!nextPlayer) {
    game.phase = "finished";
    room.status = "finished";
    game.winner = game.blueScore === game.redScore ? "blue" : game.blueScore > game.redScore ? "blue" : "red";
    pushRoomEvent(room, createEvent("game_finished", { winner: game.winner }));
    return;
  }

  game.activePlayerId = nextPlayer.id;
  game.activeTeam = nextPlayer.team === "neutral" ? null : nextPlayer.team;
  game.currentRound = null;
  game.phase = game.roundNumber === 0 ? "starting" : "next-turn";
  game.updatedAt = new Date().toISOString();

  pushRoomEvent(
    room,
    createEvent("turn_started", {
      activePlayerId: nextPlayer.id,
      activeTeam: nextPlayer.team,
      turnsRemaining: 2 - (game.turnCounts[nextPlayer.id] ?? 0),
    }),
  );
}

export function createRound(room: RoomState) {
  const game = room.game;
  if (!game || !game.activePlayerId || !game.activeTeam) {
    throw new Error("There is no active player to start a round.");
  }

  const { selectedCard, nextRecentCardIds } = drawSpectrumCard(game.recentCardIds);
  const now = new Date().toISOString();
  const minTarget = Math.ceil(TWO_POINT_RADIUS);
  const maxTarget = Math.floor(DIAL_MAX - TWO_POINT_RADIUS);
  const round: RoundState = {
    id: crypto.randomUUID(),
    roundNumber: game.roundNumber + 1,
    actorPlayerId: game.activePlayerId,
    actorTeam: game.activeTeam,
    card: selectedCard,
    clue: "",
    clues: [],
    hiddenTarget: Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget,
    dialPosition: 50,
    lockedPosition: null,
    revealed: false,
    targetVisible: false,
    scoreAwarded: 0,
    startedAt: now,
    spunAt: now,
    clueSubmittedAt: null,
    lockedAt: null,
    revealedAt: null,
  };

  game.roundNumber = round.roundNumber;
  game.recentCardIds = nextRecentCardIds;
  game.currentRound = round;
  game.phase = "spin";
  game.updatedAt = now;

  pushRoomEvent(
    room,
    createEvent("wheel_spun", {
      roundId: round.id,
      roundNumber: round.roundNumber,
      actorPlayerId: round.actorPlayerId,
      actorTeam: round.actorTeam,
      cardId: round.card.id,
    }),
  );
}

export function transitionPhaseIfReady(room: RoomState) {
  const game = room.game;
  if (!game || !game.currentRound) {
    return;
  }

  const now = Date.now();
  const round = game.currentRound;

  if (game.phase === "spin" && round.spunAt && now - new Date(round.spunAt).getTime() >= 3000) {
    game.phase = "clue";
    game.updatedAt = new Date().toISOString();
    return;
  }

  if (game.phase === "lock-in" && round.lockedAt && now - new Date(round.lockedAt).getTime() >= 450) {
    game.phase = "reveal";
    round.revealed = true;
    round.targetVisible = true;
    round.revealedAt = new Date().toISOString();
    pushRoomEvent(
      room,
      createEvent("round_revealed", {
        roundId: round.id,
        hiddenTarget: round.hiddenTarget,
        lockedPosition: round.lockedPosition,
        scoreAwarded: round.scoreAwarded,
      }),
    );
    return;
  }

  if (game.phase === "reveal" && round.revealedAt && now - new Date(round.revealedAt).getTime() >= REVEAL_DURATION_MS) {
    game.phase = "scoring";
    game.updatedAt = new Date().toISOString();
    return;
  }

  if (
    game.phase === "scoring" &&
    room.status !== "finished" &&
    now - new Date(game.updatedAt).getTime() >= SCORING_DURATION_MS
  ) {
    beginNextTurn(room);
  }
}

export function completeRound(room: RoomState) {
  const game = room.game;
  if (!game || !game.currentRound || !game.activePlayerId || !game.activeTeam) {
    throw new Error("There is no active round to score.");
  }

  const round = game.currentRound;
  const target = round.hiddenTarget ?? 50;
  const lockedPosition = round.lockedPosition ?? round.dialPosition;
  const result = scoreDialGuess(target, lockedPosition);

  if (round.clues.length < MAX_CLUES_PER_ROUND) {
    round.dialPosition = lockedPosition;
    round.lockedPosition = null;
    round.lockedAt = null;
    game.phase = "clue";
    game.updatedAt = new Date().toISOString();

    pushRoomEvent(
      room,
      createEvent("guess_locked", {
        roundId: round.id,
        lockedPosition,
        clueCount: round.clues.length,
        finalGuess: false,
      }),
    );
    return;
  }

  round.scoreAwarded = result.points;
  round.lockedPosition = lockedPosition;
  round.lockedAt = new Date().toISOString();

  if (game.activeTeam === "blue") {
    game.blueScore += result.points;
  } else {
    game.redScore += result.points;
  }

  game.turnCounts[game.activePlayerId] = (game.turnCounts[game.activePlayerId] ?? 0) + 1;
  game.phase = "lock-in";
  game.updatedAt = new Date().toISOString();

  pushRoomEvent(
    room,
    createEvent("guess_locked", {
      roundId: round.id,
      lockedPosition,
      distance: result.distance,
      scoreAwarded: result.points,
    }),
  );
  pushRoomEvent(
    room,
    createEvent("score_updated", {
      blueScore: game.blueScore,
      redScore: game.redScore,
      activeTeam: game.activeTeam,
      scoreAwarded: result.points,
    }),
  );

  if (game.blueScore >= game.winScore || game.redScore >= game.winScore) {
    room.status = "finished";
    game.phase = "finished";
    game.winner = game.blueScore >= game.winScore ? "blue" : "red";
    pushRoomEvent(room, createEvent("game_finished", { winner: game.winner }));
  }
}

export function getTeamBalance(room: RoomState) {
  const blueCount = room.players.filter((player) => player.team === "blue").length;
  const redCount = room.players.filter((player) => player.team === "red").length;

  return {
    blueCount,
    redCount,
    isEven: blueCount === redCount,
    hasNeutralPlayers: room.players.some((player) => player.team === "neutral"),
  };
}

export function pruneRoomPlayers(room: RoomState) {
  const now = Date.now();

  const stalePlayers = room.players.filter(
    (player) => now - new Date(player.lastSeenAt).getTime() > REMOVE_AFTER_MS,
  );

  if (stalePlayers.length > 0) {
    room.players = room.players.filter((player) => !stalePlayers.some((stale) => stale.id === player.id));
    stalePlayers.forEach((player) => {
      pushRoomEvent(room, createEvent("player_left", { playerId: player.id, displayName: player.displayName }));
    });
  }

  room.players.forEach((player) => {
    player.connected = now - new Date(player.lastSeenAt).getTime() <= DISCONNECTED_AFTER_MS;
  });

  const currentHost = getPlayerById(room, room.hostPlayerId);
  if (!currentHost || !currentHost.connected) {
    const replacementHost = room.players.find((player) => player.connected) ?? room.players[0];
    if (replacementHost) {
      room.hostPlayerId = replacementHost.id;
      room.players.forEach((player) => {
        player.isHost = player.id === replacementHost.id;
      });
    }
  }
}

export function sanitizeRoomForPlayer(room: RoomState, viewerPlayerId: string | null): RoomState {
  const copy = structuredClone(room);

  if (!copy.game?.currentRound) {
    return copy;
  }

  const round = copy.game.currentRound;
  const shouldHideTarget =
    viewerPlayerId === round.actorPlayerId &&
    !["reveal", "scoring", "next-turn", "finished"].includes(copy.game.phase);

  if (shouldHideTarget) {
    round.hiddenTarget = null;
    round.targetVisible = false;
  } else {
    round.targetVisible = true;
  }

  return copy;
}

export function canPlayerSubmitClue(room: RoomState, playerId: string) {
  const game = room.game;
  if (!game || game.phase !== "clue" || !game.activeTeam || !game.currentRound) {
    return false;
  }

  if (game.currentRound.clues.length >= MAX_CLUES_PER_ROUND) {
    return false;
  }

  const player = getPlayerById(room, playerId);
  if (!player || player.team !== game.activeTeam) {
    return false;
  }

  const activeTeammateCount = room.players.filter((candidate) => candidate.team === game.activeTeam).length;
  return player.id !== game.activePlayerId || activeTeammateCount === 1;
}

export function canPlayerAdjustDial(room: RoomState, playerId: string) {
  const game = room.game;
  return Boolean(game && game.phase === "dial-adjustment" && game.activePlayerId === playerId);
}

export function isHost(room: RoomState, playerId: string) {
  return room.hostPlayerId === playerId;
}

export function getPlayerTeam(room: RoomState, playerId: string): TeamColor | null {
  const player = getPlayerById(room, playerId);
  return player && player.team !== "neutral" ? player.team : null;
}
