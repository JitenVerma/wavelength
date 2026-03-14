import { clamp } from "@/lib/utils";

export const DIAL_MIN = 0;
export const DIAL_MAX = 100;
export const FOUR_POINT_BAND_WIDTH = 5;
export const THREE_POINT_BAND_WIDTH = 5;
export const TWO_POINT_BAND_WIDTH = 5;

export const FOUR_POINT_RADIUS = FOUR_POINT_BAND_WIDTH / 2;
export const THREE_POINT_RADIUS = FOUR_POINT_RADIUS + THREE_POINT_BAND_WIDTH;
export const TWO_POINT_RADIUS = THREE_POINT_RADIUS + TWO_POINT_BAND_WIDTH;

export function clampDialValue(value: number) {
  return clamp(value, DIAL_MIN, DIAL_MAX);
}

export function valueToAngle(value: number) {
  return 180 - (clampDialValue(value) / DIAL_MAX) * 180;
}

export function angleToValue(angle: number) {
  return clampDialValue(((180 - clamp(angle, 0, 180)) / 180) * DIAL_MAX);
}

export function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy - radius * Math.sin(radians),
  };
}

export function getArcPoint(cx: number, cy: number, radius: number, value: number) {
  return polarToCartesian(cx, cy, radius, valueToAngle(value));
}

export function getBandRange(target: number, radius: number) {
  return {
    start: clampDialValue(target - radius),
    end: clampDialValue(target + radius),
  };
}

export function getBandStrokeDasharray(start: number, end: number) {
  const range = Math.max(0, end - start);
  return `${range} ${DIAL_MAX - range}`;
}

export function getBandStrokeDashoffset(start: number) {
  return -clampDialValue(start);
}

export function getScoreLabelValues(target: number) {
  return {
    twoLeft: clampDialValue(target - (THREE_POINT_RADIUS + TWO_POINT_BAND_WIDTH / 2)),
    threeLeft: clampDialValue(target - (FOUR_POINT_RADIUS + THREE_POINT_BAND_WIDTH / 2)),
    four: clampDialValue(target),
    threeRight: clampDialValue(target + (FOUR_POINT_RADIUS + THREE_POINT_BAND_WIDTH / 2)),
    twoRight: clampDialValue(target + (THREE_POINT_RADIUS + TWO_POINT_BAND_WIDTH / 2)),
  };
}
