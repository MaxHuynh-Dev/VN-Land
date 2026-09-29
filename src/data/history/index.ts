import { ERAS } from './eras';
import { GROUPS } from './groups';
import { POLITIES } from './polities';
import { TIEN_SU } from './snapshots/01-tien-su';
import { CO_DAI } from './snapshots/02-co-dai';
import { NGO_LY_TRAN } from './snapshots/03-ngo-ly-tran';
import { HO_LE_MAC } from './snapshots/04-ho-le-mac';
import { TRINH_NGUYEN } from './snapshots/05-trinh-nguyen';
import { TAY_SON_NGUYEN } from './snapshots/06-tay-son-nguyen';
import { PHAP_THUOC } from './snapshots/07-phap-thuoc';
import { HIEN_DAI } from './snapshots/08-hien-dai';
import type { Polity, PolityId, Snapshot } from './types';

/** Toàn bộ mốc, theo thứ tự thời gian (mỗi file thời kỳ đã xếp đúng thứ tự). */
export const SNAPSHOTS: Snapshot[] = [
  ...TIEN_SU,
  ...CO_DAI,
  ...NGO_LY_TRAN,
  ...HO_LE_MAC,
  ...TRINH_NGUYEN,
  ...TAY_SON_NGUYEN,
  ...PHAP_THUOC,
  ...HIEN_DAI
];
export const POLITY_BY_ID: Map<PolityId, Polity> = new Map(POLITIES.map((p) => [p.id, p]));
export { ERAS, GROUPS, POLITIES };
