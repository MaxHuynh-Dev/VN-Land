import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import area from '@turf/area';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import pointOnFeature from '@turf/point-on-feature';
import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson';
// @ts-expect-error mapshaper không kèm type
import mapshaper from 'mapshaper';
import {
  type Country,
  dedupeIds,
  keepChinaCell,
  makeCellId,
  normalizeAdm1Name,
  slugify
} from './cell-helpers';

type Poly = Feature<Polygon | MultiPolygon, { shapeName: string }>;
type Adm2Props = { shapeName: string | null; shapeID?: string };
const RAW = path.resolve('scripts/geo/raw');
const load = async (f: string): Promise<FeatureCollection<Polygon | MultiPolygon, { shapeName: string }>> =>
  JSON.parse(await readFile(path.join(RAW, f), 'utf8'));

function findAdm1(pt: Feature<Point>, adm1: Poly[]): Poly | undefined {
  const hit = adm1.find((a) => booleanPointInPolygon(pt, a));
  if (hit) return hit;
  // Đảo nhỏ lệch khỏi ADM1 đã đơn giản hóa: lấy ADM1 có điểm đại diện gần nhất
  const [x, y] = pt.geometry.coordinates;
  let best: Poly | undefined;
  let bestD = Number.POSITIVE_INFINITY;
  for (const a of adm1) {
    const [ax, ay] = pointOnFeature(a).geometry.coordinates;
    const d = (ax - x) ** 2 + (ay - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}

async function main(): Promise<void> {
  const out: Feature<Polygon | MultiPolygon, Record<string, unknown>>[] = [];
  for (const country of ['VNM', 'LAO', 'KHM', 'CHN'] as Country[]) {
    const adm1 = (await load(`${country}-ADM1.geojson`)).features;
    const adm2 = (await load(`${country}-ADM2.geojson`)).features;
    for (const f of adm2) {
      const pt = pointOnFeature(f);
      const [lon, lat] = pt.geometry.coordinates;
      // geoBoundaries CHN/ADM2 chứa 1 feature không có shapeName (shapeID
      // 17275852B34966799109471, ~113.54E 22.18N — rơi vào Ma Cao sau khi
      // tra ADM1). Dùng hậu tố shapeID làm tên dự phòng thay vì crash trên
      // `.trim()` của null.
      const props = f.properties as unknown as Adm2Props;
      const name = (props.shapeName ?? '').trim() || `unnamed-${(props.shapeID ?? '').slice(-6)}`;
      let adm1Raw: string;
      let adm1Name: string;
      if (country === 'VNM' && /^(Hoang Sa|Truong Sa)$/.test(name)) {
        adm1Raw = name;
        adm1Name = name === 'Hoang Sa' ? 'Hoàng Sa' : 'Trường Sa';
      } else {
        adm1Raw = findAdm1(pt, adm1)?.properties.shapeName ?? 'unknown';
        adm1Name = normalizeAdm1Name(country, adm1Raw);
      }
      if (country === 'CHN' && !keepChinaCell(adm1Raw, lat)) continue;
      out.push({
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          id: makeCellId(country, adm1Name, name),
          name,
          country,
          adm1: `${country}.${slugify(adm1Name)}`,
          adm1Name,
          lon: +lon.toFixed(4),
          lat: +lat.toFixed(4),
          area: Math.round(area(f) / 1e6)
        }
      });
    }
  }
  const ids = dedupeIds(out.map((f) => f.properties.id as string));
  out.forEach((f, i) => {
    f.properties.id = ids[i];
  });

  const input = { 'cells.json': { type: 'FeatureCollection', features: out } };
  const result = await mapshaper.applyCommands(
    '-i cells.json snap -simplify dp 7% keep-shapes -clean -o cells.topo.json format=topojson quantization=100000',
    input
  );
  const topoText = result['cells.topo.json'].toString();
  await mkdir('public/data', { recursive: true });
  await writeFile('public/data/cells.topo.json', topoText);

  const byAdm1 = new Map<string, string[]>();
  for (const f of out) {
    const k = `${f.properties.country} · ${f.properties.adm1} (${f.properties.adm1Name})`;
    byAdm1.set(k, [...(byAdm1.get(k) ?? []), f.properties.id as string]);
  }
  const md = [
    '# Tra cứu ô bản đồ',
    '',
    `Tổng ${out.length} ô. Selector hợp lệ: \`*\`, mã nước (\`VNM\`), adm1 (\`VNM.quang-nam\`), id ô, \`group:<id>\`.`,
    '',
    ...[...byAdm1.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([k, ids]) => [`## ${k}`, '', ids.map((id) => `\`${id}\``).join(' · '), ''])
  ].join('\n');
  await mkdir('docs/history', { recursive: true });
  await writeFile('docs/history/cells-reference.md', md);
  console.log(`cells: ${out.length}, topo: ${(topoText.length / 1024).toFixed(0)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
