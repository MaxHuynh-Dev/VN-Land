import type { Anchor } from './centroid';

export interface FlagEntry {
  id: string;
  state: 'enter' | 'stay' | 'exit';
  anchor: Anchor;
}

export function reconcileFlags(prev: FlagEntry[], targets: Map<string, Anchor>): FlagEntry[] {
  const out: FlagEntry[] = [];
  const done = new Set<string>();
  for (const e of prev) {
    const t = targets.get(e.id);
    out.push(t ? { id: e.id, state: 'stay', anchor: t } : { ...e, state: 'exit' });
    done.add(e.id);
  }
  for (const [id, anchor] of targets) {
    if (!done.has(id)) out.push({ id, state: 'enter', anchor });
  }
  return out;
}

export function dropFlag(entries: FlagEntry[], id: string): FlagEntry[] {
  return entries.filter((e) => e.id !== id);
}
