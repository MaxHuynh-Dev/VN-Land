import { ERAS } from './eras';
import { GROUPS } from './groups';
import { POLITIES } from './polities';
import { SAMPLE_SNAPSHOTS } from './snapshots/00-sample';
import type { Polity, PolityId, Snapshot } from './types';

/** Các task C2–C5 thêm import file thời kỳ vào mảng này. */
const REAL: Snapshot[] = [];

const realIds = new Set(REAL.map((s) => s.id));
export const SNAPSHOTS: Snapshot[] = [
  ...REAL,
  ...SAMPLE_SNAPSHOTS.filter((s) => !realIds.has(s.id))
].sort((a, b) => a.year - b.year);
export const POLITY_BY_ID: Map<PolityId, Polity> = new Map(POLITIES.map((p) => [p.id, p]));
export { ERAS, GROUPS, POLITIES };
