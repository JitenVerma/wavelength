"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

export function LandingPage() {
  const router = useRouter();
  const pushToast = useUiStore((state) => state.pushToast);
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const createRoom = async () => {
    if (isCreatingRef.current) {
      return;
    }

    if (displayName.trim().length < 2) {
      pushToast("Add a display name first.", "error");
      return;
    }

    try {
      isCreatingRef.current = true;
      setIsCreating(true);
      const snapshot = await parseJson<RoomSnapshot>(
        await fetch("/api/rooms", {
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
      pushToast(error instanceof Error ? error.message : "Unable to create room.", "error");
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.15fr,0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-full border border-white/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4 text-rose-500" />
              Warm multiplayer party prototype
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
                Wavelength, remixed for cozy online game night.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Create a room, split into teams, spin for a hidden target, then steer the dial based on a clue from
                your teammates. Everyone sees the spectrum. Only the active player misses the secret zone.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Create a room and share the short code.",
              "Pick blue or red teams in the lobby.",
              "Spin, clue, dial, reveal, and race to 10 points.",
            ].map((item) => (
              <Card key={item} className="min-h-36 p-5">
                <p className="text-sm leading-7 text-slate-600">{item}</p>
              </Card>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Create game</p>
              <h2 className="text-2xl font-bold text-slate-900">Start a fresh room</h2>
            </div>
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Display name"
              maxLength={24}
            />
            <Button className="w-full" onClick={createRoom} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create game"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
          <Card className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Join game</p>
              <h2 className="text-2xl font-bold text-slate-900">Hop into an existing room</h2>
            </div>
            <Input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Room code"
              maxLength={5}
            />
            <Button variant="secondary" className="w-full" onClick={() => router.push(`/join?code=${joinCode}`)}>
              <Users className="mr-2 h-4 w-4" />
              Join with code
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
