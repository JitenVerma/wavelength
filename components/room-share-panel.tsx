"use client";

import { Copy, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUiStore } from "@/stores/use-ui-store";

interface RoomSharePanelProps {
  roomCode: string;
  shareUrl: string;
}

export function RoomSharePanel({ roomCode, shareUrl }: RoomSharePanelProps) {
  const pushToast = useUiStore((state) => state.pushToast);

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    pushToast(`${label} copied.`);
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-slate-500">Room code</p>
          <h3 className="text-3xl font-black tracking-[0.2em] text-slate-900">{roomCode}</h3>
        </div>
        <Button variant="secondary" onClick={() => void copyText(roomCode, "Room code")}>
          <Copy className="mr-2 h-4 w-4" />
          Copy code
        </Button>
      </div>
      <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Shareable link</p>
        <p className="mt-2 break-all text-sm text-slate-700">{shareUrl}</p>
      </div>
      <Button variant="secondary" className="w-full" onClick={() => void copyText(shareUrl, "Join link")}>
        <Link2 className="mr-2 h-4 w-4" />
        Copy link
      </Button>
    </Card>
  );
}
