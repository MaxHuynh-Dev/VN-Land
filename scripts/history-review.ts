import { readFileSync, writeFileSync } from 'node:fs';
import { ERAS, GROUPS, POLITY_BY_ID, SNAPSHOTS } from '../src/data/history';
import { COPY } from '../src/modules/HistoryMap/copy';
import { type CellsTopology, cellsFromTopology } from '../src/modules/HistoryMap/lib/cells';
import { politiesInSnapshot } from '../src/modules/HistoryMap/lib/polities';
import {
  effectivePolity,
  lowConfidenceCells,
  resolveAllSnapshots
} from '../src/modules/HistoryMap/lib/resolve';

// Bảng duyệt nội dung: mỗi mốc một mục (tiêu đề, tóm tắt, chính thể đang tồn tại với diện tích
// xấp xỉ, nguồn), gom theo thời kỳ. Sinh lại bằng `yarn history:review` sau mỗi lần sửa dữ liệu.
const topo = JSON.parse(readFileSync('public/data/cells.topo.json', 'utf8')) as CellsTopology;
const cells = cellsFromTopology(topo);
const owners = resolveAllSnapshots(SNAPSHOTS, cells, GROUPS);

const lines = [
  '# Bảng duyệt nội dung lịch sử',
  '',
  `Sinh tự động bằng \`yarn history:review\` — ${SNAPSHOTS.length} mốc, ${ERAS.length} thời kỳ. Đánh dấu [x] khi đã duyệt. Mở mốc trên bản đồ bằng đường dẫn \`/?y=<id>\`.`,
  ''
];
for (const era of ERAS) {
  const items = SNAPSHOTS.map((s, i) => ({ s, i })).filter(({ s }) => s.era === era.id);
  if (!items.length) continue;
  lines.push(`## ${era.label}`, '');
  for (const { s, i } of items) {
    lines.push(`### [ ] ${s.yearLabel} — ${s.title}  \`?y=${s.id}\``, '', s.summary, '');
    for (const { id, area } of politiesInSnapshot(owners[i], cells)) {
      const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, id);
      lines.push(
        `- **${p.name}** (${COPY.flagKind[p.flagKind]}) — ~${Math.round(area / 1000)} nghìn km²`
      );
    }
    if (lowConfidenceCells(s, cells, GROUPS).size) lines.push('- ≈ có vùng ranh giới ước đoán');
    lines.push('', `Nguồn: ${s.sources.map((x) => x.title).join('; ')}`, '');
  }
}
writeFileSync('docs/history-review.md', lines.join('\n'));
console.log(`✓ docs/history-review.md (${SNAPSHOTS.length} mốc)`);
