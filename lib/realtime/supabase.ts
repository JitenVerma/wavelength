import type { RealtimeAdapter } from "@/lib/realtime/types";

export function createSupabaseRealtimeAdapter(): RealtimeAdapter {
  return {
    name: "supabase-realtime",
    mode: "broadcast",
    description:
      "Supabase Realtime room broadcasts with server-authoritative HTTP snapshots as the source of truth.",
  };
}
