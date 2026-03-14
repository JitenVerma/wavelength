"use client";

export type SoundCue = "join" | "spin" | "lock" | "score" | "finish";

export function useSoundCue() {
  return {
    play: (_cue: SoundCue) => {
      return;
    },
  };
}
