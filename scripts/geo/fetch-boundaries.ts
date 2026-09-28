import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REV = '9469f09';
const LAYERS = [
  'VNM/ADM1',
  'VNM/ADM2',
  'LAO/ADM1',
  'LAO/ADM2',
  'KHM/ADM1',
  'KHM/ADM2',
  'CHN/ADM1',
  'CHN/ADM2'
];
const OUT = path.resolve('scripts/geo/raw');

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  for (const layer of LAYERS) {
    const [iso, adm] = layer.split('/');
    const url = `https://github.com/wmgeolab/geoBoundaries/raw/${REV}/releaseData/gbOpen/${iso}/${adm}/geoBoundaries-${iso}-${adm}_simplified.geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${layer}: HTTP ${res.status}`);
    await writeFile(path.join(OUT, `${iso}-${adm}.geojson`), await res.text());
    console.log('✓', layer);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
