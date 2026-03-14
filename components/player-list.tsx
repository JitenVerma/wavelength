import { Crown, Wifi, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { PlayerState } from "@/lib/types";

interface PlayerListProps {
  players: PlayerState[];
  activePlayerId?: string | null;
  viewerPlayerId?: string | null;
}

export function PlayerList({ players, activePlayerId, viewerPlayerId }: PlayerListProps) {
  return (
    <div className="space-y-3">
      {players.map((player) => (
        <div
          key={player.id}
          className={cn(
            "flex items-center justify-between rounded-3xl border px-4 py-3 transition",
            player.id === activePlayerId
              ? "border-amber-200 bg-amber-50/90 shadow-[0_18px_30px_rgba(245,158,11,0.14)]"
              : "border-white/55 bg-white/65",
          )}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">
                {player.displayName}
                {player.id === viewerPlayerId ? " (you)" : ""}
              </p>
              {player.isHost ? (
                <Badge className="gap-1 text-[10px] tracking-[0.18em] text-amber-700">
                  <Crown className="h-3 w-3" />
                  Host
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">Seen {formatRelativeTime(player.lastSeenAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "text-[10px]",
                player.team === "blue" && "border-sky-200 bg-sky-50/90 text-sky-700",
                player.team === "red" && "border-rose-200 bg-rose-50/90 text-rose-700",
                player.team === "neutral" && "border-slate-200 bg-slate-50/90 text-slate-600",
              )}
            >
              {player.team === "neutral" ? "waiting room" : player.team}
            </Badge>
            {player.connected ? (
              <Wifi className="h-4 w-4 text-emerald-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
