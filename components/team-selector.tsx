"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeamAssignment } from "@/lib/types";

interface TeamSelectorProps {
  team: TeamAssignment;
  onSelect: (team: TeamAssignment) => void;
  disabled?: boolean;
}

export function TeamSelector({ team, onSelect, disabled }: TeamSelectorProps) {
  const options: { value: TeamAssignment; label: string; color: string }[] = [
    { value: "blue", label: "Blue team", color: "from-sky-400 to-indigo-500" },
    { value: "neutral", label: "Waiting room", color: "from-slate-300 to-stone-300" },
    { value: "red", label: "Red team", color: "from-rose-400 to-orange-400" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => (
        <motion.div
          key={option.value}
          layout
          whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          <Button
            variant={team === option.value ? "primary" : "secondary"}
            className={cn(
              "h-14 w-full rounded-[1.5rem] transition-transform duration-200 hover:shadow-[0_18px_30px_rgba(15,23,42,0.12)]",
              team === option.value
                ? `bg-gradient-to-r ${option.color} hover:brightness-110`
                : "hover:-translate-y-0.5",
            )}
            onClick={() => onSelect(option.value)}
            disabled={disabled}
          >
            {option.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
