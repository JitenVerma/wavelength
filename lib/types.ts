export type TeamColor = "blue" | "red";
export type TeamAssignment = TeamColor | "neutral";

export type RoomStatus = "lobby" | "in-progress" | "finished";

export type GamePhase =
  | "lobby"
  | "starting"
  | "spin"
  | "clue"
  | "dial-adjustment"
  | "lock-in"
  | "reveal"
  | "scoring"
  | "next-turn"
  | "finished";

export type RealtimeEventType =
  | "player_joined"
  | "player_left"
  | "player_updated"
  | "team_changed"
  | "players_shuffled"
  | "game_started"
  | "turn_started"
  | "wheel_spun"
  | "clue_submitted"
  | "dial_updated"
  | "guess_locked"
  | "round_revealed"
  | "score_updated"
  | "game_finished";

export interface SpectrumCard {
  id: string;
  leftLabel: string;
  rightLabel: string;
  category: string;
}

export interface RoomEvent {
  id: string;
  type: RealtimeEventType;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface PlayerState {
  id: string;
  displayName: string;
  team: TeamAssignment;
  isHost: boolean;
  connected: boolean;
  joinedAt: string;
  lastSeenAt: string;
}

export interface RoundState {
  id: string;
  roundNumber: number;
  actorPlayerId: string;
  actorTeam: TeamColor;
  card: SpectrumCard;
  clue: string;
  clues: string[];
  hiddenTarget: number | null;
  dialPosition: number;
  lockedPosition: number | null;
  revealed: boolean;
  targetVisible: boolean;
  scoreAwarded: number;
  startedAt: string;
  spunAt: string | null;
  clueSubmittedAt: string | null;
  lockedAt: string | null;
  revealedAt: string | null;
}

export interface GameState {
  phase: GamePhase;
  roundNumber: number;
  activePlayerId: string | null;
  activeTeam: TeamColor | null;
  turnOrder: string[];
  turnCounts: Record<string, number>;
  blueScore: number;
  redScore: number;
  winScore: number;
  winner: TeamColor | null;
  currentRound: RoundState | null;
  recentCardIds: string[];
  updatedAt: string;
}

export interface RoomState {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  hostPlayerId: string;
  shareUrl: string;
  status: RoomStatus;
  maxPlayers: number;
  players: PlayerState[];
  game: GameState | null;
  events: RoomEvent[];
}

export interface RoomSnapshot {
  room: RoomState;
  viewerPlayerId: string | null;
  realtimeProvider: string;
  serverNow: string;
}

export interface PlayerSession {
  roomCode: string;
  playerId: string;
  displayName: string;
}
