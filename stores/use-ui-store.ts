"use client";

import { create } from "zustand";

export interface ToastMessage {
  id: string;
  tone: "info" | "error";
  text: string;
}

interface UiStore {
  toasts: ToastMessage[];
  pushToast: (text: string, tone?: ToastMessage["tone"]) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],
  pushToast: (text, tone = "info") => {
    const id = crypto.randomUUID();

    set((state) => ({
      toasts: [...state.toasts, { id, text, tone }],
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 3500);
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
