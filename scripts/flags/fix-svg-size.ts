import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ensureSvgSize } from './svg-size';

const dir = path.resolve('public/flags');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.svg'))) {
  const p = path.join(dir, f);
  const before = readFileSync(p, 'utf8');
  const after = ensureSvgSize(before);
  if (after !== before) {
    writeFileSync(p, after);
    console.log('fixed', f);
  }
}
