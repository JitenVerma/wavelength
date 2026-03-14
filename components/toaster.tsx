"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useUiStore } from "@/stores/use-ui-store";

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            onClick={() => dismissToast(toast.id)}
            className={`pointer-events-auto rounded-3xl border px-4 py-3 text-left text-sm shadow-xl backdrop-blur-xl ${
              toast.tone === "error"
                ? "border-rose-200 bg-rose-50/90 text-rose-700"
                : "border-white/60 bg-white/85 text-slate-700"
            }`}
          >
            {toast.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
