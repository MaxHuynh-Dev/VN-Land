import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ERAS, GROUPS, POLITIES, SNAPSHOTS } from '../src/data/history';
import { type CellsTopology, cellsFromTopology } from '../src/modules/HistoryMap/lib/cells';
import { validateHistory } from '../src/modules/HistoryMap/lib/validate';

const topo = JSON.parse(readFileSync('public/data/cells.topo.json', 'utf8')) as CellsTopology;
const errs = validateHistory({
  snapshots: SNAPSHOTS,
  polities: POLITIES,
  groups: GROUPS,
  eras: ERAS,
  cells: cellsFromTopology(topo),
  flagExists: (p) => existsSync(path.join('public', p))
});
if (errs.length) {
  console.error(`✗ ${errs.length} lỗi dữ liệu lịch sử:\n- ${errs.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `✓ ${SNAPSHOTS.length} mốc, ${POLITIES.length} chính thể, ${GROUPS.length} nhóm hợp lệ`
);
