"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { GameShell } from "@/components/game-shell";
import { Card } from "@/components/ui/card";
import { useRoomState } from "@/hooks/use-room-state";

interface GamePageClientProps {
  roomCode: string;
}

export function GamePageClient({ roomCode }: GamePageClientProps) {
  const router = useRouter();
  const { snapshot, playerId, isLoading, isReconnecting, busyAction, error, runAction } = useRoomState(roomCode);
  const activeTeam = snapshot?.room.game?.activeTeam ?? null;

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    if (snapshot.room.status === "lobby") {
      router.replace(`/room/${roomCode}`);
    }
  }, [roomCode, router, snapshot?.room.status]);

  if (isLoading || !snapshot) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Card className="p-10 text-center text-slate-600">Loading game...</Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div
        className={[
          "pointer-events-none fixed inset-0 transition-opacity duration-500",
          activeTeam === "blue" &&
            "bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.2),transparent_32%)]",
          activeTeam === "red" &&
            "bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(234,88,12,0.18),transparent_32%)]",
          !activeTeam &&
            "bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.1),transparent_30%)]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Game board</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Room {snapshot.room.code}</h1>
        </div>
        {isReconnecting ? <span className="rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700">Reconnecting...</span> : null}
      </div>
      {error ? <Card className="border-rose-200 bg-rose-50/90 text-rose-700">{error}</Card> : null}
      <GameShell snapshot={snapshot} playerId={playerId} busyAction={busyAction} runAction={runAction} />
    </div>
  );
}
