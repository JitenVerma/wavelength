"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Orbit, RefreshCcw } from "lucide-react";

import { ClueInput } from "@/components/game/clue-input";
import { DialControl } from "@/components/game/dial-control";
import { ScorePanel } from "@/components/game/score-panel";
import { TurnBanner } from "@/components/game/turn-banner";
import { WavelengthBoard } from "@/components/game/wavelength-board";
import { PlayerList } from "@/components/player-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSoundCue } from "@/lib/sound";
import type { RoomSnapshot } from "@/lib/types";

interface GameShellProps {
  snapshot: RoomSnapshot;
  playerId: string | null;
  busyAction: string | null;
  runAction: <TBody extends object>(path: string, body: TBody, actionName: string) => Promise<RoomSnapshot | null>;
}

export function GameShell({ snapshot, playerId, busyAction, runAction }: GameShellProps) {
  const { play } = useSoundCue();
  const { room } = snapshot;
  const game = room.game;
  const [optimisticDialPosition, setOptimisticDialPosition] = useState<number | null>(null);
  const [isDialInteracting, setIsDialInteracting] = useState(false);

  useEffect(() => {
    if (!game) {
      return;
    }

    if (game.phase === "spin") {
      play("spin");
    }

    if (game.phase === "lock-in") {
      play("lock");
    }

    if (game.phase === "scoring") {
      play("score");
    }

    if (game.phase === "finished") {
      play("finish");
    }
  }, [game, play]);

  const viewer = room.players.find((player) => player.id === playerId);
  const activePlayer = room.players.find((player) => player.id === game?.activePlayerId);
  const currentRound = game?.currentRound ?? null;
  const clueCount = currentRound?.clues?.length ?? 0;
  const dialPosition = currentRound?.lockedPosition ?? optimisticDialPosition ?? currentRound?.dialPosition ?? 50;
  const activeTeamPlayers = room.players.filter((player) => player.team === game?.activeTeam);
  const activeTeamPlayerCount = activeTeamPlayers.length;
  const bluePlayers = room.players.filter((player) => player.team === "blue");
  const redPlayers = room.players.filter((player) => player.team === "red");
  const turnsTaken = activePlayer && game ? game.turnCounts[activePlayer.id] ?? 0 : 0;

  const canSpin = Boolean(game && playerId && game.activePlayerId === playerId && ["starting", "next-turn"].includes(game.phase));
  const canSubmitClue = Boolean(
    game &&
      playerId &&
      currentRound &&
      game.phase === "clue" &&
      viewer?.team === game.activeTeam &&
      (playerId !== game.activePlayerId || activeTeamPlayerCount === 1),
  );
  const canAdjustDial = Boolean(
    game && playerId && currentRound && game.phase === "dial-adjustment" && game.activePlayerId === playerId,
  );
  const canAdvance = Boolean(
    game &&
      playerId &&
      game.phase === "finished" &&
      (room.hostPlayerId === playerId || game.activePlayerId === playerId),
  );

  const teamPanelData = useMemo(
    () => [
      { label: "Blue team", className: "bg-sky-50/90 text-sky-700", players: bluePlayers },
      { label: "Red team", className: "bg-rose-50/90 text-rose-700", players: redPlayers },
    ],
    [bluePlayers, redPlayers],
  );

  useEffect(() => {
    if (!currentRound || game?.phase !== "dial-adjustment") {
      setOptimisticDialPosition(null);
      setIsDialInteracting(false);
      return;
    }

    if (!isDialInteracting) {
      setOptimisticDialPosition(currentRound.dialPosition);
    }
  }, [currentRound?.dialPosition, currentRound?.id, game?.phase, isDialInteracting]);

  if (!game) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TurnBanner
        activePlayer={activePlayer}
        phase={game.phase}
        activeTeam={game.activeTeam}
        turnsTaken={turnsTaken}
        bluePlayers={bluePlayers}
        redPlayers={redPlayers}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <ScorePanel
            blueScore={game.blueScore}
            redScore={game.redScore}
            winScore={game.winScore}
            winner={game.winner}
          />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <WavelengthBoard
              leftLabel={currentRound?.card.leftLabel ?? "Spin to draw"}
              rightLabel={currentRound?.card.rightLabel ?? "the next spectrum"}
              dialPosition={dialPosition}
              hiddenTarget={currentRound?.hiddenTarget ?? null}
              targetVisible={currentRound?.targetVisible ?? false}
              phase={game.phase}
            />
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Round card</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {currentRound
                    ? `${currentRound.card.leftLabel} vs ${currentRound.card.rightLabel}`
                    : "Awaiting spin"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {currentRound
                    ? `Category: ${currentRound.card.category}`
                    : "The active player starts the round by spinning the wheel."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/55 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Clue</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {currentRound?.clues?.length
                    ? currentRound.clues.map((clue, index) => `Clue ${index + 1}: ${clue}`).join(" • ")
                    : "No clue yet"}
                </p>
              </div>
              <Button
                className="w-full"
                disabled={!canSpin || busyAction === "spin"}
                onClick={() => void runAction(`/api/rooms/${room.code}/round/spin`, { playerId }, "spin")}
              >
                <Orbit className="mr-2 h-4 w-4" />
                {busyAction === "spin" ? "Spinning..." : "Spin wheel"}
              </Button>
            </Card>
            <ClueInput
              clues={currentRound?.clues ?? []}
              clueRound={clueCount + (game.phase === "clue" ? 1 : 0)}
              canSubmit={canSubmitClue}
              busy={busyAction === "clue"}
              isSoloClueGiver={Boolean(game?.phase === "clue" && playerId === game?.activePlayerId && activeTeamPlayerCount === 1)}
              onSubmit={(clue) => {
                void runAction(`/api/rooms/${room.code}/round/clue`, { playerId, clue }, "clue");
              }}
            />
          </div>
          <DialControl
            value={dialPosition}
            canAdjust={canAdjustDial}
            busy={busyAction === "dial" || busyAction === "lock"}
            onInteractionChange={setIsDialInteracting}
            onChange={(value) => {
              setOptimisticDialPosition(value);
              void runAction(`/api/rooms/${room.code}/round/dial`, { playerId, dialPosition: value }, "dial");
            }}
            onLock={() => {
              void runAction(`/api/rooms/${room.code}/round/lock`, { playerId }, "lock");
            }}
          />
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Round controls</p>
              <p className="mt-2 text-sm text-slate-600">
                After the second clue and final lock, the round reveals, scores, and advances automatically.
              </p>
            </div>
            <Button
              variant="secondary"
              disabled={!canAdvance || busyAction === "next"}
              onClick={() => void runAction(`/api/rooms/${room.code}/next`, { playerId }, "next")}
            >
              {busyAction === "next" ? "Advancing..." : "Finish game"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
        <div className="space-y-6">
          {teamPanelData.map((team) => (
            <Card key={team.label} className="space-y-4">
              <div className={`rounded-[1.5rem] px-4 py-3 ${team.className}`}>
                <h3 className="font-bold">{team.label}</h3>
              </div>
              <PlayerList players={team.players} activePlayerId={game.activePlayerId} viewerPlayerId={viewer?.id} />
            </Card>
          ))}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Realtime mode</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{snapshot.realtimeProvider}</h3>
              </div>
              <RefreshCcw className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600">
              Gameplay stays server-authoritative. Supabase mode listens for room broadcasts and keeps a slow HTTP
              resync running as a fallback.
            </p>
            {activeTeamPlayers.length > 0 ? (
              <div className="rounded-[1.5rem] border border-white/55 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current clue team</p>
                <p className="mt-2 text-sm text-slate-700">
                  {activeTeamPlayers.map((player) => player.displayName).join(", ")}
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
