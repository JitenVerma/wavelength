"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { getRoomChannelName, ROOM_STATE_CHANGED_EVENT } from "@/lib/realtime/channel";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getRoomSession } from "@/lib/client-session";
import type { RoomSnapshot } from "@/lib/types";
import { useUiStore } from "@/stores/use-ui-store";

interface ActionState {
  busyAction: string | null;
  error: string | null;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Something went wrong.");
  }

  return payload as T;
}

export function useRoomState(roomCode: string) {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [{ busyAction, error }, setActionState] = useState<ActionState>({
    busyAction: null,
    error: null,
  });
  const lastEventIdRef = useRef<string | null>(null);
  const pushToast = useUiStore((state) => state.pushToast);

  const playerSession = useMemo(() => getRoomSession(roomCode), [roomCode]);
  const supabase = useMemo(() => getBrowserSupabaseClient(), []);
  const playerId = playerSession?.playerId ?? null;
  const isSupabaseRealtimeEnabled =
    process.env.NEXT_PUBLIC_REALTIME_PROVIDER === "supabase" && Boolean(supabase);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: number | null = null;
    let roomChannel: RealtimeChannel | null = null;

    const fetchState = async (background = false) => {
      try {
        if (!background) {
          setIsLoading(true);
        }

        const query = playerId ? `?playerId=${playerId}` : "";
        const nextSnapshot = await parseJson<RoomSnapshot>(
          await fetch(`/api/rooms/${roomCode}${query}`, {
            cache: "no-store",
          }),
        );

        if (!isMounted) {
          return;
        }

        const latestEvent = nextSnapshot.room.events[0];
        if (latestEvent && latestEvent.id !== lastEventIdRef.current) {
          if (latestEvent.type === "player_joined" && latestEvent.payload.displayName) {
            pushToast(`${String(latestEvent.payload.displayName)} joined the room.`);
          }

          if (latestEvent.type === "player_left" && latestEvent.payload.displayName) {
            pushToast(`${String(latestEvent.payload.displayName)} left the room.`);
          }

          lastEventIdRef.current = latestEvent.id;
        }

        setSnapshot(nextSnapshot);
        setIsReconnecting(false);
      } catch (fetchError) {
        if (isMounted) {
          setIsReconnecting(true);
          setActionState((current) => ({
            ...current,
            error: fetchError instanceof Error ? fetchError.message : "Unable to sync room state.",
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchState();

    if (isSupabaseRealtimeEnabled && supabase) {
      roomChannel = supabase.channel(getRoomChannelName(roomCode), {
        config: {
          broadcast: {
            self: false,
          },
        },
      });

      roomChannel.on("broadcast", { event: ROOM_STATE_CHANGED_EVENT }, () => {
        void fetchState(true);
      });

      roomChannel.subscribe((status) => {
        if (!isMounted) {
          return;
        }

        if (status === "SUBSCRIBED") {
          setIsReconnecting(false);
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setIsReconnecting(true);
        }
      });

      pollInterval = window.setInterval(() => {
        void fetchState(true);
      }, 15000);
    } else {
      pollInterval = window.setInterval(() => {
        void fetchState(true);
      }, 1250);
    }

    return () => {
      isMounted = false;

      if (pollInterval !== null) {
        window.clearInterval(pollInterval);
      }

      if (roomChannel) {
        void supabase?.removeChannel(roomChannel);
      }
    };
  }, [isSupabaseRealtimeEnabled, playerId, pushToast, roomCode, supabase]);

  useEffect(() => {
    if (!playerId) {
      return;
    }

    const heartbeatInterval = window.setInterval(() => {
      void fetch(`/api/rooms/${roomCode}/heartbeat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });
    }, 10000);

    return () => {
      window.clearInterval(heartbeatInterval);
    };
  }, [playerId, roomCode]);

  const runAction = async <TBody extends object>(path: string, body: TBody, actionName: string) => {
    setActionState({ busyAction: actionName, error: null });

    try {
      const nextSnapshot = await parseJson<RoomSnapshot>(
        await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      );

      setSnapshot(nextSnapshot);
      setActionState({ busyAction: null, error: null });
      return nextSnapshot;
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : "Action failed.";
      setActionState({ busyAction: null, error: message });
      pushToast(message, "error");
      return null;
    }
  };

  return {
    snapshot,
    playerSession,
    playerId,
    isLoading,
    isReconnecting,
    busyAction,
    error,
    runAction,
  };
}
