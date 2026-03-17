"use client";

import { create } from "zustand";

export type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbStore = {
  items: BreadcrumbItem[];
  setBreadcrumb: (items: BreadcrumbItem[]) => void;
  resetBreadcrumb: () => void;
};

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  items: [],
  setBreadcrumb: (items) => set({ items }),
  resetBreadcrumb: () => set({ items: [] }),
}));

export function useBreadcrumb() {
  return useBreadcrumbStore();
}
