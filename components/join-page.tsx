"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { setRoomSession } from "@/lib/client-session";
import type { RoomSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/stores/use-ui-store";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Something went wrong.");
  }

  return payload as T;
}

export function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pushToast = useUiStore((state) => state.pushToast);
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState(searchParams.get("code")?.toUpperCase() ?? "");
  const [isJoining, setIsJoining] = useState(false);
  const isJoiningRef = useRef(false);

  useEffect(() => {
    setRoomCode(searchParams.get("code")?.toUpperCase() ?? "");
  }, [searchParams]);

  const joinRoom = async () => {
    if (isJoiningRef.current) {
      return;
    }

    if (displayName.trim().length < 2 || roomCode.trim().length < 4) {
      pushToast("Enter a display name and valid room code.", "error");
      return;
    }

    try {
      isJoiningRef.current = true;
      setIsJoining(true);
      const snapshot = await parseJson<RoomSnapshot>(
        await fetch(`/api/rooms/${roomCode}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName,
            origin: window.location.origin,
          }),
        }),
      );

      const player = snapshot.room.players.find((entry) => entry.id === snapshot.viewerPlayerId);
      if (snapshot.viewerPlayerId && player) {
        setRoomSession({
          roomCode: snapshot.room.code,
          playerId: snapshot.viewerPlayerId,
          displayName: player.displayName,
        });
      }

      router.push(`/room/${snapshot.room.code}`);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to join room.", "error");
    } finally {
      isJoiningRef.current = false;
      setIsJoining(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Join room</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Step into the lobby.</h1>
          <p className="text-sm text-slate-600">
            Join with a room code or shared link. We’ll keep your display name on this device for easy refreshes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={5}
          />
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
            maxLength={24}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={joinRoom} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join game"}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => router.push("/")}>
            Back home
          </Button>
        </div>
      </Card>
    </div>
  );
}
