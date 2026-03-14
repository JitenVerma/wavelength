"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ClueInputProps {
  clues: string[];
  clueRound: number;
  canSubmit: boolean;
  busy?: boolean;
  isSoloClueGiver?: boolean;
  onSubmit: (clue: string) => void;
}

export function ClueInput({ clues, clueRound, canSubmit, busy, isSoloClueGiver, onSubmit }: ClueInputProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(canSubmit ? "" : clues.at(-1) ?? "");
  }, [canSubmit, clueRound, clues]);

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Team clue</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">Guide the guesser</h3>
        <p className="mt-2 text-sm text-slate-600">Clue {Math.min(clueRound, 2)} of 2</p>
        {isSoloClueGiver ? (
          <p className="mt-2 text-sm text-slate-600">You are the only player on your team, so you can enter the clue yourself.</p>
        ) : null}
      </div>
      <div className="space-y-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type the team's clue..."
          disabled={!canSubmit || busy}
          maxLength={120}
        />
        <Button
          className="w-full"
          disabled={!canSubmit || busy || draft.trim().length === 0}
          onClick={() => onSubmit(draft)}
        >
          {busy ? "Submitting..." : "Submit clue"}
        </Button>
        {clues.length > 0 ? (
          <div className="space-y-1 text-sm text-slate-600">
            {clues.map((clue, index) => (
              <p key={`${index + 1}-${clue}`}>Clue {index + 1}: {clue}</p>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
