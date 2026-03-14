import type { RealtimeAdapter } from "@/lib/realtime/types";

export function createLocalRealtimeAdapter(): RealtimeAdapter {
  return {
    name: "local-polling",
    mode: "polling",
    description: "HTTP polling with a server-authoritative in-memory room store.",
  };
}
