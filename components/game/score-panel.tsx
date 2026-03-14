import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ScorePanelProps {
  blueScore: number;
  redScore: number;
  winScore: number;
  winner?: "blue" | "red" | null;
}

export function ScorePanel({ blueScore, redScore, winScore, winner }: ScorePanelProps) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Score race</p>
          <h3 className="text-xl font-bold text-slate-900">First to {winScore}</h3>
        </div>
        {winner ? (
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            <Trophy className="mr-1 h-3 w-3" />
            {winner} wins
          </Badge>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.5rem] bg-sky-50/95 p-4 text-sky-700">
          <p className="text-xs uppercase tracking-[0.2em]">Blue</p>
          <p className="mt-2 text-4xl font-black">{blueScore}</p>
        </div>
        <div className="rounded-[1.5rem] bg-rose-50/95 p-4 text-rose-700">
          <p className="text-xs uppercase tracking-[0.2em]">Red</p>
          <p className="mt-2 text-4xl font-black">{redScore}</p>
        </div>
      </div>
    </Card>
  );
}
