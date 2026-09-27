import { ERAS } from './eras';
import { GROUPS } from './groups';
import { POLITIES } from './polities';
import { SAMPLE_SNAPSHOTS } from './snapshots/00-sample';
import type { Polity, PolityId, Snapshot } from './types';

export const SNAPSHOTS: Snapshot[] = [...SAMPLE_SNAPSHOTS];
export const POLITY_BY_ID: Map<PolityId, Polity> = new Map(POLITIES.map((p) => [p.id, p]));
export { ERAS, GROUPS, POLITIES };
