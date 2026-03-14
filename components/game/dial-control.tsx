"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { angleToValue, getArcPoint } from "@/lib/dial";

interface DialControlProps {
  value: number;
  canAdjust: boolean;
  busy?: boolean;
  onChange: (value: number) => void;
  onLock: () => void;
  onInteractionChange?: (interacting: boolean) => void;
}

const VIEWBOX_WIDTH = 320;
const VIEWBOX_HEIGHT = 210;
const DIAL_CENTER_X = 160;
const DIAL_CENTER_Y = 180;
const POINTER_RADIUS = 116;
const NETWORK_FLUSH_MS = 90;

export function DialControl({
  value,
  canAdjust,
  busy,
  onChange,
  onLock,
  onInteractionChange,
}: DialControlProps) {
  const [localValue, setLocalValue] = useState(value);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const pendingValueRef = useRef<number | null>(null);
  const flushTimeoutRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);

  const dialTipPoint = useMemo(() => getArcPoint(DIAL_CENTER_X, DIAL_CENTER_Y, POINTER_RADIUS, localValue), [localValue]);

  useEffect(() => {
    if (isDraggingRef.current) {
      return;
    }

    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current !== null) {
        window.clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  const sendDialValue = (nextValue: number, force = false) => {
    pendingValueRef.current = nextValue;
    const now = Date.now();
    const elapsed = now - lastSentAtRef.current;

    if (flushTimeoutRef.current !== null) {
      window.clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    if (force || elapsed >= NETWORK_FLUSH_MS) {
      lastSentAtRef.current = now;
      onChange(nextValue);
      pendingValueRef.current = null;
      return;
    }

    flushTimeoutRef.current = window.setTimeout(() => {
      if (pendingValueRef.current === null) {
        return;
      }

      lastSentAtRef.current = Date.now();
      onChange(pendingValueRef.current);
      pendingValueRef.current = null;
      flushTimeoutRef.current = null;
    }, NETWORK_FLUSH_MS - elapsed);
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    const element = dialRef.current;
    if (!element || !canAdjust || busy) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
    const angle = (Math.atan2(DIAL_CENTER_Y - y, x - DIAL_CENTER_X) * 180) / Math.PI;
    const nextValue = angleToValue(angle);

    setLocalValue(nextValue);
    sendDialValue(nextValue);
  };

  const beginInteraction = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    onInteractionChange?.(true);
    updateFromPointer(clientX, clientY);

    const handlePointerMove = (event: PointerEvent) => {
      updateFromPointer(event.clientX, event.clientY);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      onInteractionChange?.(false);
      if (pendingValueRef.current !== null) {
        sendDialValue(pendingValueRef.current, true);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Dial control</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">Dial toward the clue</h3>
      </div>
      <div
        ref={dialRef}
        className="cursor-pointer select-none touch-none"
        onPointerDown={(event) => {
          if (!canAdjust || busy) {
            return;
          }

          beginInteraction(event.clientX, event.clientY);
        }}
      >
        <svg viewBox="0 0 320 210" className="h-auto w-full overflow-visible">
          <path
            d="M 40 180 A 120 120 0 0 1 280 180"
            fill="none"
            stroke="rgba(148,163,184,0.45)"
            strokeWidth="32"
            strokeLinecap="round"
            pathLength={100}
          />
          <path
            d="M 40 180 A 120 120 0 0 1 280 180"
            fill="none"
            stroke="rgba(30,41,59,0.9)"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength={100}
          />
          <line
            x1={DIAL_CENTER_X}
            y1={DIAL_CENTER_Y}
            x2={dialTipPoint.x}
            y2={dialTipPoint.y}
            stroke="#0f172a"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx={DIAL_CENTER_X} cy={DIAL_CENTER_Y} r="13" fill="#0f172a" stroke="white" strokeWidth="4" />
          <text
            x={dialTipPoint.x}
            y={dialTipPoint.y - 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#0f172a"
            fontSize="12"
            fontWeight="700"
          >
            {Math.round(localValue)}
          </text>
        </svg>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">0</span>
        <span className="text-sm font-semibold text-slate-700">{Math.round(localValue * 10) / 10}</span>
        <span className="text-sm text-slate-500">100</span>
      </div>
      <Button className="w-full" disabled={!canAdjust || busy} onClick={onLock}>
        {busy ? "Locking..." : "Lock in guess"}
      </Button>
    </Card>
  );
}
