import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/45 bg-white/70 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
