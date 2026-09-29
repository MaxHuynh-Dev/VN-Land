import { readFileSync } from 'node:fs';
import { neighbors } from 'topojson-client';
import { describe, expect, it } from 'vitest';
import { GROUPS, POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { NULL_COLOR } from './cellState';
import { type CellsTopology, cellsFromTopology } from './cells';
import {
  adjacentOwnerPairs,
  deltaE2000,
  deltaE2000Lab,
  hexToLab,
  MIN_ADJACENT_DELTA_E
} from './colorDistance';
import { resolveAllSnapshots } from './resolve';

describe('hexToLab', () => {
  it('trắng là L=100, đen là L=0, xám trung tính có a = b ≈ 0', () => {
    expect(hexToLab('#ffffff')[0]).toBeCloseTo(100, 1);
    expect(hexToLab('#000000')[0]).toBeCloseTo(0, 5);
    const [, a, b] = hexToLab('#777777');
    expect(Math.abs(a)).toBeLessThan(0.01);
    expect(Math.abs(b)).toBeLessThan(0.01);
  });
});

describe('deltaE2000Lab', () => {
  // Bộ dữ liệu kiểm chuẩn của Sharma, Wu & Dalal (2005), bảng 1.
  it.each([
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373]
  ] as [[number, number, number], [number, number, number], number][])(
    '%j ↔ %j = %d',
    (a, b, expected) => {
      expect(deltaE2000Lab(a, b)).toBeCloseTo(expected, 3);
      expect(deltaE2000Lab(b, a)).toBeCloseTo(expected, 3);
    }
  );
  it('một màu so với chính nó là 0', () => {
    expect(deltaE2000('#b3261e', '#b3261e')).toBe(0);
  });
});

describe('adjacentOwnerPairs', () => {
  it('mỗi cặp chủ giáp nhau trả đúng một lần, gồm cả ô không có chủ', () => {
    // 0–1–2–3 nối thành chuỗi, 4 đứng riêng
    const nei = [[1], [0, 2], [1, 3], [2], []];
    const pairs = adjacentOwnerPairs(['a', 'a', 'b', null, 'c'], nei);
    expect(pairs).toHaveLength(2);
    expect(pairs).toContainEqual(['a', 'b']);
    expect(pairs).toContainEqual([null, 'b']);
  });
});

describe('Màu lãnh thổ trên dữ liệu thật', () => {
  const topo = JSON.parse(readFileSync('public/data/cells.topo.json', 'utf8')) as CellsTopology;
  const cells = cellsFromTopology(topo);
  const nei = neighbors(topo.objects.cells.geometries as never) as number[][];
  const owners = resolveAllSnapshots(SNAPSHOTS, cells, GROUPS);
  const colorOf = (id: string | null): string =>
    id === null ? NULL_COLOR : (POLITY_BY_ID.get(id)?.color ?? '#000000');

  it(`mọi cặp chính thể giáp nhau ở cùng một mốc lệch màu ≥ ΔE2000 ${MIN_ADJACENT_DELTA_E}`, () => {
    const tooClose: string[] = [];
    owners.forEach((o, i) => {
      for (const [a, b] of adjacentOwnerPairs(o, nei)) {
        const d = deltaE2000(colorOf(a), colorOf(b));
        if (d < MIN_ADJACENT_DELTA_E)
          tooClose.push(
            `${SNAPSHOTS[i].id}: ${a ?? 'không chủ'} ↔ ${b ?? 'không chủ'} (${d.toFixed(1)})`
          );
      }
    });
    expect(tooClose).toEqual([]);
  });
});
