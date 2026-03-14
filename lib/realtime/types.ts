export interface RealtimeAdapter {
  name: string;
  mode: "polling" | "broadcast";
  description: string;
}
