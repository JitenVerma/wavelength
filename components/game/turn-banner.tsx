import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GamePhase, PlayerState, TeamColor } from "@/lib/types";

interface TurnBannerProps {
  activePlayer: PlayerState | undefined;
  phase: GamePhase;
  activeTeam: TeamColor | null;
  turnsTaken: number;
  bluePlayers: PlayerState[];
  redPlayers: PlayerState[];
}

const phaseCopy: Record<GamePhase, string> = {
  lobby: "Pick teams and get the room ready.",
  starting: "The active player can spin whenever they're ready.",
  spin: "Wheel is spinning. The secret target is being set.",
  clue: "Teammates should submit the next clue for the active player.",
  "dial-adjustment": "Active player is refining the dial based on the current clue.",
  "lock-in": "Final guess locked. Preparing reveal.",
  reveal: "Reveal is live. Watch how close the dial lands.",
  scoring: "Points are being tallied before the next turn starts.",
  "next-turn": "Next team is up. The active player can spin when ready.",
  finished: "Game over. Start a new room for a fresh run.",
};

export function TurnBanner({ activePlayer, phase, activeTeam, turnsTaken, bluePlayers, redPlayers }: TurnBannerProps) {
  return (
    <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current turn</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {activePlayer ? `${activePlayer.displayName} on ${activeTeam} team` : "Waiting for a player"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{phaseCopy[phase]}</p>
      </div>
      <div className="space-y-3 lg:text-right">
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
            <Sparkles className="mr-1 h-3 w-3" />
            Phase: {phase}
          </Badge>
          <Badge>Turn {turnsTaken + 1} of 2</Badge>
        </div>
        <div className="space-y-2 text-xs">
          <p className="text-sky-700">
            <span className="font-semibold uppercase tracking-[0.18em]">Blue</span>
            {" "}
            {bluePlayers.map((player) => player.displayName).join(", ")}
          </p>
          <p className="text-rose-700">
            <span className="font-semibold uppercase tracking-[0.18em]">Red</span>
            {" "}
            {redPlayers.map((player) => player.displayName).join(", ")}
          </p>
        </div>
      </div>
    </Card>
  );
}
