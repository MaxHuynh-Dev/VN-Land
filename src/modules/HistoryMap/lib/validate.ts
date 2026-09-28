import type { CellGroup, Era, Polity, Snapshot } from '@/data/history/types';
import type { CellMeta } from './cells';
import { expandSelector } from './resolve';

interface Input {
  snapshots: Snapshot[];
  polities: Polity[];
  groups: CellGroup[];
  eras: Era[];
  cells: CellMeta[];
  flagExists: (publicPath: string) => boolean;
}

const KINDS = new Set(['national', 'banner', 'reconstructed', 'symbol']);

export function validateHistory({
  snapshots,
  polities,
  groups,
  eras,
  cells,
  flagExists
}: Input): string[] {
  const errs: string[] = [];
  const polityIds = new Set<string>();
  for (const p of polities) {
    if (polityIds.has(p.id)) errs.push(`Chính thể trùng id: ${p.id}`);
    polityIds.add(p.id);
    if (!/^#[0-9a-f]{6}$/i.test(p.color))
      errs.push(`${p.id}: màu phải dạng #rrggbb, đang là "${p.color}"`);
    if (!KINDS.has(p.flagKind)) errs.push(`${p.id}: flagKind không hợp lệ "${p.flagKind}"`);
    if (!flagExists(p.flag)) errs.push(`${p.id}: không thấy file cờ ${p.flag}`);
    if (p.flagCredit === null && p.flagKind !== 'symbol')
      errs.push(`${p.id}: cờ không phải biểu tượng tự vẽ thì phải có ghi công (flagCredit)`);
    if (p.sources.length < 1) errs.push(`${p.id}: cần ít nhất 1 nguồn`);
  }

  const groupIds = new Set<string>();
  for (const g of groups) {
    if (groupIds.has(g.id)) errs.push(`Nhóm trùng id: ${g.id}`);
    groupIds.add(g.id);
    try {
      expandSelector(`group:${g.id}`, cells, groups);
    } catch (e) {
      errs.push(`Nhóm ${g.id}: ${(e as Error).message}`);
    }
  }

  const eraIds = new Set(eras.map((e) => e.id));
  const snapIds = new Set<string>();
  let prevYear = Number.NEGATIVE_INFINITY;
  snapshots.forEach((s, idx) => {
    if (snapIds.has(s.id)) errs.push(`Mốc trùng id: ${s.id}`);
    snapIds.add(s.id);
    if (!/^[a-z0-9-]+$/.test(s.id)) errs.push(`Mốc "${s.id}": id chỉ gồm a-z, 0-9, dấu gạch`);
    if (!(s.year > prevYear))
      errs.push(`${s.id}: năm ${s.year} phải lớn hơn mốc trước (${prevYear})`);
    prevYear = s.year;
    if (!eraIds.has(s.era)) errs.push(`${s.id}: thời kỳ không tồn tại "${s.era}"`);
    if (!s.title.trim() || !s.summary.trim()) errs.push(`${s.id}: thiếu tiêu đề hoặc tóm tắt`);
    if (s.sources.length < 2)
      errs.push(`${s.id}: cần ít nhất 2 nguồn, đang có ${s.sources.length}`);
    if (idx === 0 && !('*' in s.assign))
      errs.push(`${s.id}: mốc đầu tiên phải có khóa '*' để gán đầy đủ`);
    for (const [sel, pol] of Object.entries(s.assign)) {
      try {
        expandSelector(sel, cells, groups);
      } catch (e) {
        errs.push(`${s.id}: ${(e as Error).message}`);
      }
      if (pol !== null && !polityIds.has(pol))
        errs.push(`${s.id}: chính thể không tồn tại "${pol}" (selector ${sel})`);
    }
    for (const sel of s.lowConfidence ?? []) {
      try {
        expandSelector(sel, cells, groups);
      } catch (e) {
        errs.push(`${s.id} lowConfidence: ${(e as Error).message}`);
      }
    }
    for (const pid of Object.keys(s.polityOverrides ?? {})) {
      if (!polityIds.has(pid)) errs.push(`${s.id}: override cho chính thể không tồn tại "${pid}"`);
    }
    if (s.focus && (s.focus.lon < 97 || s.focus.lon > 118 || s.focus.lat < 7 || s.focus.lat > 27)) {
      errs.push(`${s.id}: focus nằm ngoài vùng bản đồ (${s.focus.lon}, ${s.focus.lat})`);
    }
  });
  return errs;
}
