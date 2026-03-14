"use client";

import { AlertTriangle, Shuffle } from "lucide-react";

import { PlayerList } from "@/components/player-list";
import { RoomSharePanel } from "@/components/room-share-panel";
import { TeamSelector } from "@/components/team-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PlayerState, RoomState, TeamAssignment } from "@/lib/types";

interface RoomLobbyProps {
  room: RoomState;
  viewer: PlayerState | undefined;
  busyAction: string | null;
  onTeamSelect: (team: TeamAssignment) => void;
  onShuffle: () => void;
  onStart: () => void;
}

export function RoomLobby({
  room,
  viewer,
  busyAction,
  onTeamSelect,
  onShuffle,
  onStart,
}: RoomLobbyProps) {
  const blueCount = room.players.filter((player) => player.team === "blue").length;
  const redCount = room.players.filter((player) => player.team === "red").length;
  const neutralCount = room.players.filter((player) => player.team === "neutral").length;
  const teamsUneven = Math.abs(blueCount - redCount) > 1;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Lobby</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Choose a team and gather everyone in.</h2>
            <p className="mt-2 text-sm text-slate-600">
              Players start centered. Pick blue or red, then let the host shuffle or begin once everyone is ready.
            </p>
          </div>
          <TeamSelector team={viewer?.team ?? "neutral"} onSelect={onTeamSelect} disabled={!viewer} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-sky-50/95 p-4 text-sky-700">
              <p className="text-xs uppercase tracking-[0.2em]">Blue</p>
              <p className="mt-2 text-3xl font-black">{blueCount}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-100/95 p-4 text-slate-600">
              <p className="text-xs uppercase tracking-[0.2em]">Waiting room</p>
              <p className="mt-2 text-3xl font-black">{neutralCount}</p>
            </div>
            <div className="rounded-[1.5rem] bg-rose-50/95 p-4 text-rose-700">
              <p className="text-xs uppercase tracking-[0.2em]">Red</p>
              <p className="mt-2 text-3xl font-black">{redCount}</p>
            </div>
          </div>
          {teamsUneven ? (
            <div className="flex items-center gap-2 rounded-[1.5rem] border border-amber-200 bg-amber-50/85 p-4 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Teams are uneven. You can still start, but the match will feel best when they’re close.
            </div>
          ) : null}
          {neutralCount > 0 ? (
            <div className="flex items-center gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-4 text-sm text-slate-600">
              <AlertTriangle className="h-4 w-4" />
              Everyone needs to leave the waiting room before the host can start.
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onShuffle}
              disabled={!viewer?.isHost || busyAction === "shuffle"}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              {busyAction === "shuffle" ? "Shuffling..." : "Shuffle players"}
            </Button>
            <Button className="flex-1" onClick={onStart} disabled={!viewer?.isHost || busyAction === "start"}>
              {busyAction === "start" ? "Starting..." : "Start game"}
            </Button>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Players</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {room.players.length} / {room.maxPlayers} ready
              </h3>
            </div>
          </div>
          <PlayerList players={room.players} viewerPlayerId={viewer?.id} />
        </Card>
      </div>
      <RoomSharePanel roomCode={room.code} shareUrl={room.shareUrl} />
    </div>
  );
}
