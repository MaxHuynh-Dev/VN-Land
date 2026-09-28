import { signal } from '@preact/signals-react';

export const snapshotIndex = signal(0);
export const hoveredPolity = signal<string | null>(null);
export const selectedPolity = signal<string | null>(null);
export const playing = signal(false);
export const pointerPos = signal<{ x: number; y: number } | null>(null);

export function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
