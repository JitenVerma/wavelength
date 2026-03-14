import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

import { getRoomChannelName, ROOM_STATE_CHANGED_EVENT } from "@/lib/realtime/channel";

declare global {
  // eslint-disable-next-line no-var
  var __wavelengthSupabaseServerClient: SupabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __wavelengthSupabaseRoomChannels: Map<string, Promise<RealtimeChannel | null>> | undefined;
}

function getServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    return null;
  }

  if (!globalThis.__wavelengthSupabaseServerClient) {
    globalThis.__wavelengthSupabaseServerClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return globalThis.__wavelengthSupabaseServerClient;
}

function getRoomChannelCache() {
  if (!globalThis.__wavelengthSupabaseRoomChannels) {
    globalThis.__wavelengthSupabaseRoomChannels = new Map<string, Promise<RealtimeChannel | null>>();
  }

  return globalThis.__wavelengthSupabaseRoomChannels;
}

async function getServerRoomChannel(roomCode: string) {
  const client = getServerSupabaseClient();
  if (!client) {
    return null;
  }

  const channelKey = roomCode.toLowerCase();
  const channelCache = getRoomChannelCache();
  const cachedChannel = channelCache.get(channelKey);
  if (cachedChannel) {
    return cachedChannel;
  }

  const channel = client.channel(getRoomChannelName(roomCode), {
    config: {
      broadcast: {
        self: false,
      },
    },
  });

  const channelPromise = new Promise<RealtimeChannel>((resolve, reject) => {
    const timeout = setTimeout(() => {
      channelCache.delete(channelKey);
      reject(new Error("Timed out subscribing to Supabase Realtime."));
    }, 5000);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve(channel);
        return;
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        clearTimeout(timeout);
        channelCache.delete(channelKey);
        reject(new Error(`Supabase Realtime subscription failed with status: ${status}`));
      }
    });
  });

  channelCache.set(channelKey, channelPromise);

  try {
    return await channelPromise;
  } catch (error) {
    await client.removeChannel(channel);
    throw error;
  }
}

export async function broadcastRoomStateChanged(roomCode: string, eventType: string) {
  if (process.env.NEXT_PUBLIC_REALTIME_PROVIDER !== "supabase") {
    return;
  }

  try {
    const channel = await getServerRoomChannel(roomCode);
    if (!channel) {
      return;
    }

    await channel.send({
      type: "broadcast",
      event: ROOM_STATE_CHANGED_EVENT,
      payload: {
        eventType,
        roomCode,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to broadcast room state change.", error);
  }
}
