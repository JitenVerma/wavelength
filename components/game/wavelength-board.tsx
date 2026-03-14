"use client";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import {
  getArcPoint,
  getBandRange,
  getBandStrokeDasharray,
  getBandStrokeDashoffset,
  getScoreLabelValues,
  THREE_POINT_RADIUS,
  TWO_POINT_RADIUS,
  FOUR_POINT_RADIUS,
} from "@/lib/dial";

interface WavelengthBoardProps {
  leftLabel: string;
  rightLabel: string;
  dialPosition: number;
  hiddenTarget: number | null;
  targetVisible: boolean;
  phase: string;
}

const ARC_PATH = "M 40 180 A 120 120 0 0 1 280 180";
const ARC_CENTER_X = 160;
const ARC_CENTER_Y = 180;
const ARC_RADIUS = 120;

export function WavelengthBoard({
  leftLabel,
  rightLabel,
  dialPosition,
  hiddenTarget,
  targetVisible,
  phase,
}: WavelengthBoardProps) {
  const dialTipPoint = getArcPoint(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS - 6, dialPosition);
  const twoPointBand = hiddenTarget !== null ? getBandRange(hiddenTarget, TWO_POINT_RADIUS) : null;
  const threePointBand = hiddenTarget !== null ? getBandRange(hiddenTarget, THREE_POINT_RADIUS) : null;
  const fourPointBand = hiddenTarget !== null ? getBandRange(hiddenTarget, FOUR_POINT_RADIUS) : null;
  const scoreLabelValues = hiddenTarget !== null ? getScoreLabelValues(hiddenTarget) : null;
  const scoreLabels =
    scoreLabelValues !== null
      ? [
          { text: "2", point: getArcPoint(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, scoreLabelValues.twoLeft), fill: "#854d0e" },
          { text: "3", point: getArcPoint(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, scoreLabelValues.threeLeft), fill: "#7c2d12" },
          { text: "4", point: getArcPoint(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, scoreLabelValues.four), fill: "white" },
          { text: "3", point: getArcPoint(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, scoreLabelValues.threeRight), fill: "#7c2d12" },
          { text: "2", point: getArcPoint(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, scoreLabelValues.twoRight), fill: "#854d0e" },
        ]
      : [];

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-12 top-10 h-28 rounded-full bg-[radial-gradient(circle,_rgba(148,163,184,0.18),_transparent_65%)] blur-3xl" />
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <div className="relative h-52">
          <svg viewBox="0 0 320 210" className="h-full w-full overflow-visible">
            <path
              d={ARC_PATH}
              fill="none"
              stroke="rgba(71,85,105,0.92)"
              strokeWidth="36"
              strokeLinecap="round"
              pathLength={100}
            />
            <path
              d={ARC_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="14"
              strokeLinecap="round"
              pathLength={100}
            />
            {targetVisible && twoPointBand ? (
              <>
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  d={ARC_PATH}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="36"
                  strokeLinecap="butt"
                  pathLength={100}
                  strokeDasharray={getBandStrokeDasharray(twoPointBand.start, twoPointBand.end)}
                  strokeDashoffset={getBandStrokeDashoffset(twoPointBand.start)}
                />
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  d={ARC_PATH}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="36"
                  strokeLinecap="butt"
                  pathLength={100}
                  strokeDasharray={getBandStrokeDasharray(threePointBand!.start, threePointBand!.end)}
                  strokeDashoffset={getBandStrokeDashoffset(threePointBand!.start)}
                />
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  d={ARC_PATH}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="36"
                  strokeLinecap="butt"
                  pathLength={100}
                  strokeDasharray={getBandStrokeDasharray(fourPointBand!.start, fourPointBand!.end)}
                  strokeDashoffset={getBandStrokeDashoffset(fourPointBand!.start)}
                />
                {scoreLabels.map((label) => (
                  <motion.g
                    key={`${label.text}-${label.point.x}-${label.point.y}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <circle cx={label.point.x} cy={label.point.y} r="8" fill="rgba(255,255,255,0.88)" />
                    <text
                      x={label.point.x}
                      y={label.point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={label.fill}
                      fontSize="10"
                      fontWeight="800"
                    >
                      {label.text}
                    </text>
                  </motion.g>
                ))}
              </>
            ) : null}
            <line
              x1={ARC_CENTER_X}
              y1={ARC_CENTER_Y}
              x2={dialTipPoint.x}
              y2={dialTipPoint.y}
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx={ARC_CENTER_X} cy={ARC_CENTER_Y} r="13" fill="#0f172a" stroke="white" strokeWidth="4" />
            <text
              x={dialTipPoint.x}
              y={dialTipPoint.y - 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#0f172a"
              fontSize="12"
              fontWeight="700"
            >
              {Math.round(dialPosition)}
            </text>
          </svg>
          {!targetVisible || hiddenTarget === null ? (
            <div className="absolute inset-x-0 bottom-10 flex justify-center">
              <span className="rounded-full bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                Hidden from the active player
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>Phase: {phase}</span>
          <span>Guess: {Math.round(dialPosition * 10) / 10}</span>
        </div>
      </div>
    </Card>
  );
}
