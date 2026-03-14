"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { RoomLobby } from "@/components/room-lobby";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRoomState } from "@/hooks/use-room-state";

interface RoomPageClientProps {
  roomCode: string;
}

export function RoomPageClient({ roomCode }: RoomPageClientProps) {
  const router = useRouter();
  const { snapshot, playerId, isLoading, isReconnecting, busyAction, error, runAction } = useRoomState(roomCode);

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    if (snapshot.room.status !== "lobby") {
      router.replace(`/game/${roomCode}`);
    }
  }, [roomCode, router, snapshot?.room.status]);

  if (isLoading || !snapshot) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Card className="p-10 text-center text-slate-600">Loading room...</Card>
      </div>
    );
  }

  const viewer = snapshot.room.players.find((player) => player.id === playerId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Room {snapshot.room.code}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Lobby and team setup</h1>
        </div>
        <div className="flex gap-3">
          {isReconnecting ? <span className="rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700">Reconnecting...</span> : null}
          <Button variant="secondary" onClick={() => router.push("/")}>
            Leave room
          </Button>
        </div>
      </div>
      {error ? <Card className="border-rose-200 bg-rose-50/90 text-rose-700">{error}</Card> : null}
      <RoomLobby
        room={snapshot.room}
        viewer={viewer}
        busyAction={busyAction}
        onTeamSelect={(team) => {
          if (!playerId) {
            return;
          }

          void runAction(`/api/rooms/${roomCode}/team`, { playerId, team }, "team");
        }}
        onShuffle={() => {
          if (!playerId) {
            return;
          }

          void runAction(`/api/rooms/${roomCode}/shuffle`, { playerId }, "shuffle");
        }}
        onStart={() => {
          if (!playerId) {
            return;
          }

          void runAction(`/api/rooms/${roomCode}/start`, { playerId }, "start");
        }}
      />
    </div>
  );
}
