import { clampDialValue, FOUR_POINT_RADIUS, THREE_POINT_RADIUS, TWO_POINT_RADIUS } from "@/lib/dial";

export interface ScoreResult {
  distance: number;
  points: number;
}

export function scoreDialGuess(target: number, guess: number): ScoreResult {
  const distance = Math.abs(clampDialValue(target) - clampDialValue(guess));

  if (distance <= FOUR_POINT_RADIUS) {
    return { distance, points: 4 };
  }

  if (distance <= THREE_POINT_RADIUS) {
    return { distance, points: 3 };
  }

  if (distance <= TWO_POINT_RADIUS) {
    return { distance, points: 2 };
  }

  return { distance, points: 0 };
}
