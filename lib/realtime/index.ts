import { createLocalRealtimeAdapter } from "@/lib/realtime/local";
import { createSupabaseRealtimeAdapter } from "@/lib/realtime/supabase";

export function getRealtimeAdapter() {
  if (
    process.env.NEXT_PUBLIC_REALTIME_PROVIDER === "supabase" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  ) {
    return createSupabaseRealtimeAdapter();
  }

  return createLocalRealtimeAdapter();
}
