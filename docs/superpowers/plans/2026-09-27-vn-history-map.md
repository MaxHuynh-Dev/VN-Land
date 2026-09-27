# Bản đồ 3D lịch sử mở mang bờ cõi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay trang Home của VN-Land bằng một bản đồ 3D khám phá: kéo dòng thời gian qua ~59 mốc từ thời đồ đá đến 2025, thấy lãnh thổ và cờ của từng chính thể trên Việt Nam, Lào, Campuchia và Hoa Nam.

**Architecture:** Một pipeline Node (chạy tay) biến ranh giới hành chính geoBoundaries thành ~1.300 "ô nguyên tử" trong `public/data/cells.topo.json`. Dữ liệu lịch sử viết tay bằng TypeScript (`src/data/history/`) gán ô → chính thể theo delta từng mốc. Client dùng React Three Fiber và dựng **một mesh gộp duy nhất** cho mọi ô. Màu và độ nổi của từng ô được đọc từ một `DataTexture` trong shader, nhờ đó đổi mốc chỉ phải cập nhật texture chứ không dựng lại hình học.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, `three`, `@react-three/fiber` v9, `@react-three/drei` v10, `topojson-client`, `@preact/signals-react` (đã có), GSAP (đã có), Tailwind 4 (đã có). Dev: `mapshaper`, `@turf/*`, `tsx` (đã có), `vitest`, `@playwright/test`, `topojson-server`.

**Spec:** `docs/superpowers/specs/2026-09-27-vn-history-map-design.md`

## Global Constraints

- Package manager: **yarn 1.x** (`yarn add`, `yarn add -D`). Không dùng npm để thêm gói (repo có cả `package-lock.json` nhưng README chỉ định yarn; xóa `package-lock.json` ở Task 1 để tránh lệch lock).
- **Trước khi viết code Next.js**, đọc hướng dẫn liên quan trong `node_modules/next/dist/docs/` (tối thiểu: lazy loading / `next/dynamic`, `next/font`, route groups). Theo `AGENTS.md`: API có thể khác kiến thức sẵn có. Tuân theo mọi deprecation notice.
- Biome: 2 space, single quote, semicolons, lineWidth 100, `trailingCommas: none`. Chạy `yarn lint` trước mỗi commit (husky + lint-staged cũng tự chạy).
- Path alias: `@Modules/*`, `@Components/*`, `@Layout/*`, `@Constants/*`, `@Styles/*`, `@Utils/*`, `@/*` → `src/*`.
- Toàn bộ chữ hiển thị là **tiếng Việt**, nằm trong file dữ liệu (`src/data/history/*` hoặc `src/modules/HistoryMap/copy.ts`), không hardcode trong JSX.
- Font phải có subset `vietnamese`.
- Nhãn loại cờ cố định: `national` → "Quốc kỳ", `banner` → "Cờ hiệu", `reconstructed` → "Cờ phục dựng", `symbol` → "Biểu tượng".
- Màu ô không có chủ (`null`): `#6b6358`.
- **Chỉ hiện lãnh thổ:** ô là đơn vị dữ liệu ẩn. Mọi ô cùng chính thể có **đúng một màu** (không jitter) và cùng độ cao. Không vẽ ranh giới tỉnh/huyện, không hiện tên tỉnh/huyện ở bất kỳ UI nào. Chỉ vẽ biên giữa các chính thể. Hover và click tác động lên **toàn bộ lãnh thổ** của chính thể.
- Hoàng Sa và Trường Sa luôn là ô thuộc `VNM` (`VNM.hoang-sa.*`, `VNM.truong-sa.*`). Không ô `CHN` nào được nằm dưới vĩ độ 18.0°N.
- URL: `?y=<snapshot.id>`, cập nhật bằng `history.replaceState`.
- Mỗi snapshot có `sources.length >= 2`. Mốc đầu tiên gán đầy đủ, các mốc sau chỉ ghi delta.
- Hiệu năng: 60 fps trên laptop, ≥30 fps trên mobile. Không tạo một mesh riêng cho mỗi ô.
- `prefers-reduced-motion: reduce` → tắt gợn sóng cờ, nhấp nhô ô và bay camera.
- Commit message dạng Conventional Commits, kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Ô Trung Quốc chồng lên Hoàng Sa hoặc Trường Sa**: ADM2 của Hải Nam có thể chứa đảo ngoài khơi. Mong đợi: bộ lọc `lat < 18` loại hết (test ở Task 2).
2. **`?y=` rác hoặc năm không khớp mốc nào** (`?y=abc`, `?y=1500`, `?y=-99999`): mong đợi trang không crash, lần lượt chọn mốc đầu, mốc gần nhất ≤ 1500, và mốc đầu (test ở Task 6).
3. **Selector trùng nhau trong cùng một mốc** (ví dụ gán `VNM.quang-nam` rồi gán lại một huyện của nó): mong đợi selector cụ thể hơn thắng, bất kể thứ tự khóa (test ở Task 3).
4. **Texture cờ lỗi hoặc thiếu file**: mong đợi hiện cờ màu trơn, không hỏng cả cảnh (test `validate-history` kiểm tra file tồn tại ở Task 3; fallback runtime ở Task 8).
5. **Chính thể có lãnh thổ rời rạc** (Đại Việt kèm Hoàng Sa; Chăm Pa bị chia cắt): mong đợi cờ cắm ở cụm ô lớn nhất và luôn nằm trong lãnh thổ, không rơi ra biển (test ở Task 8).

## File Map

| File | Trách nhiệm |
|---|---|
| `scripts/geo/fetch-boundaries.ts` | Tải 8 file geoBoundaries vào `scripts/geo/raw/` (gitignored) |
| `scripts/geo/cell-helpers.ts` | Hàm thuần: `slugify`, `makeCellId`, `normalizeAdm1Name`, `keepChinaCell`, `dedupeIds` |
| `scripts/geo/build-cells.ts` | Ghép, gán tỉnh, đơn giản hóa → `public/data/cells.topo.json` + `docs/history/cells-reference.md` |
| `scripts/validate-history.ts` | CLI chạy `validateHistory` trên dữ liệu thật, exit 1 nếu lỗi |
| `src/data/history/types.ts` | Mọi type dữ liệu lịch sử |
| `src/data/history/eras.ts` | 9 thời kỳ lớn: id, nhãn, màu |
| `src/data/history/polities.ts` | Danh mục chính thể |
| `src/data/history/groups.ts` | Nhóm ô có tên lịch sử |
| `src/data/history/snapshots/*.ts` | Các mốc, chia theo thời kỳ |
| `src/data/history/index.ts` | Gom và export `SNAPSHOTS`, `POLITIES`, `GROUPS`, `ERAS` |
| `src/modules/HistoryMap/lib/cells.ts` | `CellMeta`, `cellsFromTopology` |
| `src/modules/HistoryMap/lib/resolve.ts` | Bung selector, `resolveAllSnapshots`, `effectivePolity` |
| `src/modules/HistoryMap/lib/validate.ts` | `validateHistory` (thuần, dùng trong test và CLI) |
| `src/modules/HistoryMap/lib/projection.ts` | `px`, `pz`, `lonLatToVec3`, hằng số bản đồ |
| `src/modules/HistoryMap/lib/terrainGeometry.ts` | `buildTerrainGeometry` → BufferGeometry gộp có `aCell` |
| `src/modules/HistoryMap/lib/cellState.ts` | `CellStateStore`: màu và độ nổi từng ô, tween, ghi vào Float32Array |
| `src/modules/HistoryMap/lib/borders.ts` | `buildBorderPositions` (topojson.mesh theo chủ) |
| `src/modules/HistoryMap/lib/centroid.ts` | `polityAnchors` (cụm liền kề lớn nhất → ô neo) |
| `src/modules/HistoryMap/lib/flagsReconcile.ts` | `reconcileFlags` (enter / stay / exit) |
| `src/modules/HistoryMap/lib/timeline.ts` | `snapshotIndexFromParam`, `polityColorForCell` |
| `src/modules/HistoryMap/state/store.ts` | signals: `snapshotIndex`, `hoveredCell`, `selectedCell`, `playing` |
| `src/modules/HistoryMap/copy.ts` | Chuỗi UI tiếng Việt |
| `src/modules/HistoryMap/index.tsx` | Client wrapper, `next/dynamic` ssr:false |
| `src/modules/HistoryMap/HistoryMap.tsx` | Tải dữ liệu, state machine loading/error/ready, bố cục UI + Canvas |
| `src/modules/HistoryMap/scene/*.tsx` | `Scene`, `Terrain`, `Borders`, `Sea`, `Lights`, `CameraRig`, `Flags`, `FlagPole` |
| `src/modules/HistoryMap/ui/*.tsx` | `Masthead`, `Timeline`, `EraBand`, `InfoCard`, `CellTooltip`, `PolityDetail`, `SourceList`, `CreditsDialog`, `NoWebGLFallback`, `LoadError` |
| `e2e/history-map.spec.ts` | Playwright smoke |

---

## Phase P1 — Nền móng

### Task 1: Thiết lập công cụ và thay trang Home

**Files:**
- Modify: `package.json` (scripts, deps), `.gitignore`, `src/layout/MainLayout/index.tsx`, `src/constants/fonts.ts`, `app/(frontend)/layout.tsx`
- Delete: `app/(frontend)/(withFooter)/page.tsx`, `src/modules/HomePage/` (cả thư mục), `package-lock.json`
- Create: `app/(frontend)/(withoutFooter)/page.tsx`, `src/modules/HistoryMap/index.tsx` (tạm), `vitest.config.ts`, `playwright.config.ts`, `e2e/history-map.spec.ts`

**Interfaces:**
- Produces: route `/` render `<main data-testid="history-map-root">`; lệnh `yarn test`, `yarn e2e`; font variable `--font-be-vietnam`.

- [ ] **Step 1: Cài dependency hiện có và đọc tài liệu Next**

```bash
yarn install
ls node_modules/next/dist/docs/
```
Đọc các file về `next/dynamic` / lazy loading, `next/font`, và route groups trong thư mục đó. Ghi nhận mọi khác biệt so với Next 15 (ví dụ: `ssr: false` chỉ hợp lệ trong Client Component).

- [ ] **Step 2: Thêm thư viện**

```bash
yarn add three @react-three/fiber @react-three/drei topojson-client
yarn add -D @types/three @types/topojson-client @types/topojson-specification topojson-server @types/topojson-server mapshaper @turf/area @turf/point-on-feature @turf/boolean-point-in-polygon @turf/helpers vitest vite-tsconfig-paths @playwright/test
yarn playwright install chromium
git rm -q package-lock.json
```
Kiểm tra `node_modules/@react-three/fiber/package.json`: `version` phải là 9.x (hỗ trợ React 19). Nếu yarn chọn 8.x, chạy `yarn add @react-three/fiber@^9 @react-three/drei@^10`.

- [ ] **Step 3: Scripts và gitignore**

Thêm vào `package.json` → `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest",
"e2e": "playwright test",
"geo:fetch": "tsx scripts/geo/fetch-boundaries.ts",
"geo:build": "tsx scripts/geo/build-cells.ts",
"validate:history": "tsx scripts/validate-history.ts",
"prebuild": "yarn validate:history"
```
Thêm vào `.gitignore`:
```
# geo pipeline
/scripts/geo/raw/
# playwright
/test-results/
/playwright-report/
```
Ghi chú: `prebuild` gọi `validate:history`, script này được tạo ở Task 3. Cho tới khi có Task 3, tạm để `"prebuild": "echo skip"` và đổi lại ở Task 3 Step 7.

- [ ] **Step 4: Cấu hình Vitest**

`vitest.config.ts`:
```ts
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
  }
});
```

- [ ] **Step 5: Cấu hình Playwright và viết test e2e thất bại**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3100',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: 'yarn dev --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 180_000
  }
});
```

`e2e/history-map.spec.ts`:
```ts
import { expect, test } from '@playwright/test';

test('trang chủ là bản đồ lịch sử', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('history-map-root')).toBeVisible();
});
```

Run: `yarn e2e --project=desktop`
Expected: FAIL (không tìm thấy `history-map-root`: trang Home cũ vẫn đang render).

- [ ] **Step 6: Font tiếng Việt**

Thay nội dung `src/constants/fonts.ts`:
```ts
import { Be_Vietnam_Pro } from 'next/font/google';

export const beVietnam = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600', '800'],
  display: 'swap'
});
```
Trong `app/(frontend)/layout.tsx`: đổi import thành `import { beVietnam } from '@Constants/fonts';`, đổi `<html lang="en">` thành `<html lang="vi">`, đổi `className` của body thành `` `${beVietnam.variable} font-[family-name:var(--font-be-vietnam)]` ``. Chạy `grep -rn "inter\|raleway" src app` rồi sửa mọi chỗ còn tham chiếu `inter` hoặc `raleway`.

- [ ] **Step 7: Gỡ Lenis và Header khỏi MainLayout**

`src/layout/MainLayout/index.tsx`:
```tsx
import GridDebug from '@Components/GridDebug';
import type React from 'react';
import type { PropsWithChildren } from 'react';

export default function MainLayout({ children }: PropsWithChildren): React.ReactElement {
  return (
    <>
      {children}
      <GridDebug />
    </>
  );
}
```
Không xóa `src/components/SmoothScroll` và `src/layout/Header` (spec yêu cầu giữ lại).

- [ ] **Step 8: Thay trang Home**

```bash
git rm -q "app/(frontend)/(withFooter)/page.tsx"
git rm -rq src/modules/HomePage
```
`app/(frontend)/(withoutFooter)/page.tsx`:
```tsx
import { DEFAULT_METADATA } from '@Constants/metadata';
import HistoryMap from '@Modules/HistoryMap';
import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  title: 'Việt Nam — Mở mang bờ cõi',
  description: 'Bản đồ 3D lịch sử lãnh thổ Việt Nam từ thời đồ đá đến nay.'
};

export default function Home(): React.ReactElement {
  return <HistoryMap />;
}
```
`src/modules/HistoryMap/index.tsx` (tạm, Task 5 sẽ thay):
```tsx
'use client';

import type React from 'react';

export default function HistoryMap(): React.ReactElement {
  return <main data-testid="history-map-root" className="fixed inset-0 overflow-hidden bg-[#0a1420]" />;
}
```
Chạy `grep -rn "HomePage\|withFooter" app src` và sửa mọi import còn trỏ tới module đã xóa. Layout `(withFooter)` có thể giữ lại nếu vẫn còn route khác dùng. Nếu không còn route nào, xóa `app/(frontend)/(withFooter)/layout.tsx`.

- [ ] **Step 9: Chạy lại e2e và build**

Run: `yarn e2e --project=desktop` → Expected: PASS
Run: `yarn lint && yarn build` → Expected: không lỗi.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: set up 3D map toolchain and replace home page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Pipeline địa lý — các ô nguyên tử

**Files:**
- Create: `scripts/geo/fetch-boundaries.ts`, `scripts/geo/cell-helpers.ts`, `scripts/geo/cell-helpers.test.ts`, `scripts/geo/build-cells.ts`
- Output (commit): `public/data/cells.topo.json`, `docs/history/cells-reference.md`

**Interfaces:**
- Produces: `public/data/cells.topo.json` là TopoJSON có object `cells` (GeometryCollection). Mỗi geometry có `properties: { id: string; name: string; country: 'VNM'|'LAO'|'KHM'|'CHN'; adm1: string; adm1Name: string; lon: number; lat: number; area: number }`, trong đó `adm1` có dạng `VNM.quang-nam`, `id` có dạng `VNM.quang-nam.dien-ban`, và `area` tính bằng km².
- Produces: `docs/history/cells-reference.md`, danh sách country → adm1 → cell id để người soạn dữ liệu tra cứu.

- [ ] **Step 1: Viết test cho helper**

`scripts/geo/cell-helpers.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { dedupeIds, keepChinaCell, makeCellId, normalizeAdm1Name, slugify } from './cell-helpers';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt, đ → d, khoảng trắng → gạch', () => {
    expect(slugify('Thừa Thiên Huế')).toBe('thua-thien-hue');
    expect(slugify('Đắk Lắk')).toBe('dak-lak');
    expect(slugify('Bà Rịa–Vũng Tàu')).toBe('ba-ria-vung-tau');
    expect(slugify('  Hà Nội\t')).toBe('ha-noi');
  });
});

describe('normalizeAdm1Name', () => {
  it('sửa tên thiếu dấu và ký tự thừa', () => {
    expect(normalizeAdm1Name('VNM', 'Ho Chi Minh')).toBe('TP. Hồ Chí Minh');
    expect(normalizeAdm1Name('VNM', 'Hà Nội\t')).toBe('Hà Nội');
    expect(normalizeAdm1Name('CHN', 'Guangzhou Province')).toBe('Quảng Đông');
    expect(normalizeAdm1Name('CHN', 'Guangxi Zhuang Autonomous Region')).toBe('Quảng Tây');
    expect(normalizeAdm1Name('CHN', 'Hainan Province')).toBe('Hải Nam');
    expect(normalizeAdm1Name('KHM', 'Ratanakiri Province')).toBe('Ratanakiri');
  });
});

describe('makeCellId', () => {
  it('ghép country.adm1.name', () => {
    expect(makeCellId('VNM', 'Quảng Nam', 'Dien Ban')).toBe('VNM.quang-nam.dien-ban');
  });
});

describe('dedupeIds', () => {
  it('thêm hậu tố -2, -3 cho id trùng', () => {
    expect(dedupeIds(['a', 'b', 'a', 'a'])).toEqual(['a', 'b', 'a-2', 'a-3']);
  });
});

describe('keepChinaCell', () => {
  it('chỉ giữ Quảng Tây, Quảng Đông, Hải Nam, Hồng Kông, Ma Cao và lat >= 18', () => {
    expect(keepChinaCell('Guangxi Zhuang Autonomous Region', 22.8)).toBe(true);
    expect(keepChinaCell('Hainan Province', 18.3)).toBe(true);
    expect(keepChinaCell('Hainan Province', 16.5)).toBe(false);
    expect(keepChinaCell('Yunnan Province', 23)).toBe(false);
  });
});
```

- [ ] **Step 2: Chạy test để thấy thất bại**

Run: `yarn test scripts/geo`
Expected: FAIL, "Cannot find module './cell-helpers'".

- [ ] **Step 3: Cài đặt helper**

`scripts/geo/cell-helpers.ts`:
```ts
export type Country = 'VNM' | 'LAO' | 'KHM' | 'CHN';

export function slugify(s: string): string {
  return s
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ADM1_FIX: Record<string, string> = {
  'VNM:Ho Chi Minh': 'TP. Hồ Chí Minh',
  'CHN:Guangzhou Province': 'Quảng Đông',
  'CHN:Guangxi Zhuang Autonomous Region': 'Quảng Tây',
  'CHN:Hainan Province': 'Hải Nam',
  'CHN:Hong Kong Special Administrative Region': 'Hồng Kông',
  'CHN:Macau Special Administrative Region': 'Ma Cao',
  'KHM:Ratanakiri Province': 'Ratanakiri'
};

export function normalizeAdm1Name(country: Country, raw: string): string {
  const trimmed = raw.trim();
  return ADM1_FIX[`${country}:${trimmed}`] ?? trimmed;
}

export function makeCellId(country: Country, adm1Name: string, cellName: string): string {
  return `${country}.${slugify(adm1Name)}.${slugify(cellName)}`;
}

export function dedupeIds(ids: string[]): string[] {
  const seen = new Map<string, number>();
  return ids.map((id) => {
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    return n === 1 ? id : `${id}-${n}`;
  });
}

const CHINA_KEEP = new Set([
  'Guangxi Zhuang Autonomous Region',
  'Guangzhou Province',
  'Hainan Province',
  'Hong Kong Special Administrative Region',
  'Macau Special Administrative Region'
]);

/** Giữ ô Trung Quốc thuộc Hoa Nam, loại mọi thứ dưới 18°N (Hoàng Sa, Trường Sa thuộc VNM). */
export function keepChinaCell(adm1Raw: string, lat: number): boolean {
  return CHINA_KEEP.has(adm1Raw.trim()) && lat >= 18.0;
}
```

- [ ] **Step 4: Chạy test để thấy thành công**

Run: `yarn test scripts/geo` → Expected: PASS (5 nhóm test).

- [ ] **Step 5: Script tải dữ liệu**

`scripts/geo/fetch-boundaries.ts`:
```ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REV = '9469f09';
const LAYERS = ['VNM/ADM1', 'VNM/ADM2', 'LAO/ADM1', 'LAO/ADM2', 'KHM/ADM1', 'KHM/ADM2', 'CHN/ADM1', 'CHN/ADM2'];
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
```
Run: `yarn geo:fetch` → Expected: 8 dòng `✓`, và `scripts/geo/raw/` có 8 file.

- [ ] **Step 6: Script dựng ô**

`scripts/geo/build-cells.ts`:
```ts
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
      const name = f.properties.shapeName.trim();
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
```

- [ ] **Step 7: Chạy và kiểm tra đầu ra**

Run: `yarn geo:build`
Expected: dòng `cells: N, topo: M KB` với 1.100 ≤ N ≤ 1.400 và M < 1.500. Nếu M ≥ 1.500, giảm `7%` xuống `5%` rồi chạy lại.

Kiểm tra ràng buộc:
```bash
node -e "const t=require('./public/data/cells.topo.json');const g=t.objects.cells.geometries.map(x=>x.properties);console.log(g.filter(p=>p.country==='CHN'&&p.lat<18).length, g.filter(p=>p.adm1==='VNM.hoang-sa').length, g.filter(p=>p.adm1==='VNM.truong-sa').length, g.filter(p=>p.adm1.endsWith('.unknown')).length)"
```
Expected: `0 1 1 0` (không có ô CHN nào dưới 18°N, có 1 ô Hoàng Sa, 1 ô Trường Sa, không có tỉnh "unknown").

- [ ] **Step 8: Commit**

```bash
git add scripts/geo public/data/cells.topo.json docs/history/cells-reference.md
git commit -m "feat(geo): build atomic cell boundaries for Indochina and South China

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 3: Mô hình dữ liệu lịch sử, bung selector, validator

**Files:**
- Create: `src/data/history/types.ts`, `src/data/history/eras.ts`, `src/modules/HistoryMap/lib/cells.ts`, `src/modules/HistoryMap/lib/resolve.ts`, `src/modules/HistoryMap/lib/resolve.test.ts`, `src/modules/HistoryMap/lib/validate.ts`, `src/modules/HistoryMap/lib/validate.test.ts`, `src/modules/HistoryMap/lib/testFixtures.ts`, `scripts/validate-history.ts`
- Create (dữ liệu mẫu, Task C1 xóa): `src/data/history/polities.ts`, `src/data/history/groups.ts`, `src/data/history/snapshots/00-sample.ts`, `src/data/history/index.ts`, `public/flags/_sample.svg`
- Modify: `package.json` (`prebuild`)

**Interfaces:**
- Produces (types, `@/data/history/types`):
```ts
export type PolityId = string;
/** '*' | 'VNM' | 'VNM.quang-nam' | 'VNM.quang-nam.dien-ban' | 'group:chau-o' */
export type Selector = string;
export type EraId = 'tien-su' | 'hong-bang' | 'bac-thuoc' | 'doc-lap' | 'nam-tien' | 'nha-nguyen' | 'phap-thuoc' | 'chia-cat' | 'thong-nhat';
export type FlagKind = 'national' | 'banner' | 'reconstructed' | 'symbol';
export interface Source { title: string; author?: string; url?: string; note?: string }
export interface FlagCredit { author?: string; license: string; url: string }
export interface Polity { id: PolityId; name: string; altNames?: string[]; color: string; flag: string; flagKind: FlagKind; flagNote: string; flagCredit: FlagCredit | null; capital?: string; period: string; sources: Source[] }
export interface CellGroup { id: string; name: string; selectors: Selector[] }
export interface Snapshot { id: string; year: number; yearLabel: string; era: EraId; title: string; summary: string; assign: Record<Selector, PolityId | null>; polityOverrides?: Record<PolityId, Partial<Omit<Polity, 'id' | 'sources'>>>; lowConfidence?: Selector[]; focus?: { lon: number; lat: number; distance?: number }; sources: Source[] }
export interface Era { id: EraId; label: string; color: string }
```
- Produces (`@Modules/HistoryMap/lib/cells`): `type Country`, `interface CellMeta { id; name; country; adm1; adm1Name; lon; lat; area }`, `type CellsTopology`, `cellsFromTopology(topo: CellsTopology): CellMeta[]`.
- Produces (`@Modules/HistoryMap/lib/resolve`): `selectorSpecificity(sel): number`, `expandSelector(sel, cells, groups): number[]`, `resolveAllSnapshots(snapshots, cells, groups): (PolityId | null)[][]`, `effectivePolity(polities: Map<PolityId, Polity>, snapshots, index, id): Polity`, `lowConfidenceCells(snapshot, cells, groups): Set<number>`.
- Produces (`@Modules/HistoryMap/lib/validate`): `validateHistory(input: { snapshots; polities; groups; eras; cells; flagExists: (publicPath: string) => boolean }): string[]` (mảng rỗng nghĩa là hợp lệ).
- Produces (`@/data/history`): `SNAPSHOTS: Snapshot[]`, `POLITIES: Polity[]`, `POLITY_BY_ID: Map<PolityId, Polity>`, `GROUPS: CellGroup[]`, `ERAS: Era[]`.

Ghi chú lệch spec có chủ đích: spec viết `confidence?: Record<…, 'low'>`, còn plan dùng `lowConfidence?: Selector[]`. Nghĩa giống nhau, cách này gọn hơn. `year` có thể là số thập phân để phân biệt hai mốc trong cùng năm (ví dụ `1945.2` cho tháng 3, `1945.7` cho tháng 9). `id` của mốc là giá trị dùng trong `?y=`.

- [ ] **Step 1: Types, eras, cells**

`src/data/history/types.ts`: đúng như khối Interfaces ở trên, mỗi type được `export`.

`src/data/history/eras.ts`:
```ts
import type { Era } from './types';

export const ERAS: Era[] = [
  { id: 'tien-su', label: 'Tiền sử', color: '#7a6a55' },
  { id: 'hong-bang', label: 'Hồng Bàng – Âu Lạc', color: '#b08a3e' },
  { id: 'bac-thuoc', label: 'Bắc thuộc', color: '#8a4b3c' },
  { id: 'doc-lap', label: 'Độc lập tự chủ', color: '#c2402f' },
  { id: 'nam-tien', label: 'Nam tiến & phân tranh', color: '#d0762c' },
  { id: 'nha-nguyen', label: 'Nhà Nguyễn', color: '#d9b233' },
  { id: 'phap-thuoc', label: 'Pháp thuộc', color: '#4f6d8f' },
  { id: 'chia-cat', label: 'Kháng chiến & chia cắt', color: '#8f3c52' },
  { id: 'thong-nhat', label: 'Thống nhất', color: '#d6332a' }
];
```

`src/modules/HistoryMap/lib/cells.ts`:
```ts
import type { GeometryCollection, Topology } from 'topojson-specification';

export type Country = 'VNM' | 'LAO' | 'KHM' | 'CHN';

export interface CellMeta {
  id: string;
  name: string;
  country: Country;
  adm1: string;
  adm1Name: string;
  lon: number;
  lat: number;
  area: number;
}

export type CellsTopology = Topology<{ cells: GeometryCollection<CellMeta> }>;

export function cellsFromTopology(topo: CellsTopology): CellMeta[] {
  return topo.objects.cells.geometries.map((g) => g.properties as CellMeta);
}
```

- [ ] **Step 2: Fixture cho test**

`src/modules/HistoryMap/lib/testFixtures.ts`:
```ts
import type { CellGroup, Polity, Snapshot } from '@/data/history/types';
import type { CellMeta } from './cells';

const c = (id: string, lon: number, lat: number, area = 100): CellMeta => {
  const [country, adm1] = id.split('.');
  return { id, name: id, country: country as CellMeta['country'], adm1: `${country}.${adm1}`, adm1Name: adm1, lon, lat, area };
};

/** 6 ô: 4 VNM (2 tỉnh), 1 KHM, 1 LAO */
export const CELLS: CellMeta[] = [
  c('VNM.bac.a', 105.8, 21.0),
  c('VNM.bac.b', 106.0, 20.8),
  c('VNM.nam.c', 106.7, 10.8),
  c('VNM.nam.d', 105.5, 10.0),
  c('KHM.pp.e', 104.9, 11.5),
  c('LAO.vt.f', 102.6, 17.9)
];

export const GROUPS: CellGroup[] = [{ id: 'song-cuu-long', name: 'Đồng bằng sông Cửu Long', selectors: ['VNM.nam.d', 'KHM'] }];

const polity = (id: string, extra: Partial<Polity> = {}): Polity => ({
  id,
  name: id,
  color: '#aa0000',
  flag: `/flags/${id}.svg`,
  flagKind: 'banner',
  flagNote: 'n',
  flagCredit: { license: 'PD', url: 'https://commons.wikimedia.org/x' },
  period: 'p',
  sources: [{ title: 's' }],
  ...extra
});

export const POLITIES: Polity[] = [polity('dai-viet'), polity('khmer'), polity('champa')];

const src = [{ title: 'A' }, { title: 'B' }];
export const SNAPSHOTS: Snapshot[] = [
  { id: 's1', year: 1000, yearLabel: '1000', era: 'doc-lap', title: 't', summary: 's', sources: src, assign: { '*': null, 'VNM.bac': 'dai-viet', 'group:song-cuu-long': 'khmer' } },
  { id: 's2', year: 1100, yearLabel: '1100', era: 'doc-lap', title: 't', summary: 's', sources: src, assign: { 'VNM.nam.c': 'champa' }, polityOverrides: { 'dai-viet': { name: 'Đại Việt (Lý)' } } },
  { id: 's3', year: 1200, yearLabel: '1200', era: 'doc-lap', title: 't', summary: 's', sources: src, assign: { 'VNM.nam.c': 'dai-viet', VNM: 'dai-viet' }, polityOverrides: { 'dai-viet': { flag: '/flags/tran.svg' } } }
];
```

- [ ] **Step 3: Viết test resolve (thất bại)**

`src/modules/HistoryMap/lib/resolve.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { effectivePolity, expandSelector, lowConfidenceCells, resolveAllSnapshots, selectorSpecificity } from './resolve';
import { CELLS, GROUPS, POLITIES, SNAPSHOTS } from './testFixtures';

describe('selectorSpecificity', () => {
  it('* < country < adm1 < group < cell', () => {
    expect(['*', 'VNM', 'VNM.bac', 'group:x', 'VNM.bac.a'].map(selectorSpecificity)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('expandSelector', () => {
  it('bung đúng từng loại selector', () => {
    expect(expandSelector('*', CELLS, GROUPS)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(expandSelector('VNM', CELLS, GROUPS)).toEqual([0, 1, 2, 3]);
    expect(expandSelector('VNM.nam', CELLS, GROUPS)).toEqual([2, 3]);
    expect(expandSelector('VNM.nam.d', CELLS, GROUPS)).toEqual([3]);
    expect(expandSelector('group:song-cuu-long', CELLS, GROUPS)).toEqual([3, 4]);
  });
  it('ném lỗi khi selector không khớp ô nào', () => {
    expect(() => expandSelector('VNM.khong-co', CELLS, GROUPS)).toThrow(/VNM.khong-co/);
    expect(() => expandSelector('group:khong-co', CELLS, GROUPS)).toThrow(/group:khong-co/);
  });
});

describe('resolveAllSnapshots', () => {
  const owners = resolveAllSnapshots(SNAPSHOTS, CELLS, GROUPS);
  it('mốc đầu áp đầy đủ, null cho ô không gán', () => {
    expect(owners[0]).toEqual(['dai-viet', 'dai-viet', null, 'khmer', 'khmer', null]);
  });
  it('mốc sau chỉ áp delta, giữ nguyên phần còn lại', () => {
    expect(owners[1]).toEqual(['dai-viet', 'dai-viet', 'champa', 'khmer', 'khmer', null]);
  });
  it('selector cụ thể hơn thắng, bất kể thứ tự khóa', () => {
    // s3: 'VNM.nam.c' đứng trước 'VNM' trong object nhưng vẫn phải được áp sau
    expect(owners[2]).toEqual(['dai-viet', 'dai-viet', 'dai-viet', 'dai-viet', 'khmer', null]);
  });
  it('không sửa mảng của mốc trước', () => {
    expect(owners[0][2]).toBeNull();
  });
});

describe('effectivePolity', () => {
  const map = new Map(POLITIES.map((p) => [p.id, p]));
  it('cộng dồn override theo thời gian', () => {
    expect(effectivePolity(map, SNAPSHOTS, 0, 'dai-viet').name).toBe('dai-viet');
    expect(effectivePolity(map, SNAPSHOTS, 1, 'dai-viet').name).toBe('Đại Việt (Lý)');
    const p3 = effectivePolity(map, SNAPSHOTS, 2, 'dai-viet');
    expect(p3.name).toBe('Đại Việt (Lý)');
    expect(p3.flag).toBe('/flags/tran.svg');
  });
});

describe('lowConfidenceCells', () => {
  it('bung selector thành tập chỉ số', () => {
    const snap = { ...SNAPSHOTS[0], lowConfidence: ['VNM.nam'] };
    expect([...lowConfidenceCells(snap, CELLS, GROUPS)]).toEqual([2, 3]);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/resolve` → Expected: FAIL (module chưa tồn tại).

- [ ] **Step 4: Cài đặt resolve**

`src/modules/HistoryMap/lib/resolve.ts`:
```ts
import type { CellGroup, Polity, PolityId, Selector, Snapshot } from '@/data/history/types';
import type { CellMeta } from './cells';

export function selectorSpecificity(sel: Selector): number {
  if (sel === '*') return 0;
  if (sel.startsWith('group:')) return 3;
  const parts = sel.split('.').length;
  return parts === 1 ? 1 : parts === 2 ? 2 : 4;
}

export function expandSelector(sel: Selector, cells: CellMeta[], groups: CellGroup[]): number[] {
  let out: number[];
  if (sel === '*') {
    out = cells.map((_, i) => i);
  } else if (sel.startsWith('group:')) {
    const g = groups.find((x) => `group:${x.id}` === sel);
    if (!g) throw new Error(`Không có nhóm: ${sel}`);
    const set = new Set<number>();
    for (const s of g.selectors) {
      if (s.startsWith('group:')) throw new Error(`Nhóm lồng nhóm không được phép: ${sel} → ${s}`);
      for (const i of expandSelector(s, cells, groups)) set.add(i);
    }
    out = [...set].sort((a, b) => a - b);
  } else {
    const level = selectorSpecificity(sel);
    const key: keyof CellMeta = level === 1 ? 'country' : level === 2 ? 'adm1' : 'id';
    out = [];
    cells.forEach((c, i) => {
      if (c[key] === sel) out.push(i);
    });
  }
  if (out.length === 0) throw new Error(`Selector không khớp ô nào: ${sel}`);
  return out;
}

export function resolveAllSnapshots(
  snapshots: Snapshot[],
  cells: CellMeta[],
  groups: CellGroup[]
): (PolityId | null)[][] {
  const result: (PolityId | null)[][] = [];
  let cur: (PolityId | null)[] = new Array(cells.length).fill(null);
  for (const snap of snapshots) {
    const next = cur.slice();
    const entries = Object.entries(snap.assign).sort(
      ([a], [b]) => selectorSpecificity(a) - selectorSpecificity(b)
    );
    for (const [sel, polity] of entries) {
      for (const i of expandSelector(sel, cells, groups)) next[i] = polity;
    }
    result.push(next);
    cur = next;
  }
  return result;
}

export function effectivePolity(
  polities: Map<PolityId, Polity>,
  snapshots: Snapshot[],
  index: number,
  id: PolityId
): Polity {
  const base = polities.get(id);
  if (!base) throw new Error(`Không có chính thể: ${id}`);
  let p: Polity = base;
  for (let i = 0; i <= index && i < snapshots.length; i++) {
    const o = snapshots[i].polityOverrides?.[id];
    if (o) p = { ...p, ...o };
  }
  return p;
}

export function lowConfidenceCells(snapshot: Snapshot, cells: CellMeta[], groups: CellGroup[]): Set<number> {
  const set = new Set<number>();
  for (const sel of snapshot.lowConfidence ?? []) {
    for (const i of expandSelector(sel, cells, groups)) set.add(i);
  }
  return set;
}
```
Run: `yarn test src/modules/HistoryMap/lib/resolve` → Expected: PASS.

- [ ] **Step 5: Viết test validator (thất bại)**

`src/modules/HistoryMap/lib/validate.test.ts`:
```ts
import { ERAS } from '@/data/history/eras';
import type { Snapshot } from '@/data/history/types';
import { describe, expect, it } from 'vitest';
import { CELLS, GROUPS, POLITIES, SNAPSHOTS } from './testFixtures';
import { validateHistory } from './validate';

const base = { polities: POLITIES, groups: GROUPS, eras: ERAS, cells: CELLS, flagExists: () => true };
const withSnaps = (snapshots: Snapshot[]) => validateHistory({ ...base, snapshots });

describe('validateHistory', () => {
  it('dữ liệu hợp lệ không có lỗi', () => {
    expect(withSnaps(SNAPSHOTS)).toEqual([]);
  });
  it('mốc đầu phải có khóa *', () => {
    const s = [{ ...SNAPSHOTS[0], assign: { VNM: 'dai-viet' } }];
    expect(withSnaps(s).join()).toMatch(/s1.*\*/);
  });
  it('bắt selector sai, chính thể không tồn tại, thiếu nguồn, năm không tăng', () => {
    const s: Snapshot[] = [
      SNAPSHOTS[0],
      { ...SNAPSHOTS[1], assign: { 'VNM.sai': 'dai-viet', VNM: 'ma' }, sources: [{ title: 'x' }] },
      { ...SNAPSHOTS[2], year: 1100 }
    ];
    const errs = withSnaps(s).join('\n');
    expect(errs).toMatch(/VNM\.sai/);
    expect(errs).toMatch(/ma/);
    expect(errs).toMatch(/s2.*nguồn/);
    expect(errs).toMatch(/s3.*năm/);
  });
  it('bắt id mốc trùng hoặc sai định dạng', () => {
    const s = [SNAPSHOTS[0], { ...SNAPSHOTS[1], id: 's1' }, { ...SNAPSHOTS[2], id: 'Năm 1200' }];
    const errs = withSnaps(s).join('\n');
    expect(errs).toMatch(/trùng.*s1/);
    expect(errs).toMatch(/Năm 1200/);
  });
  it('bắt file cờ không tồn tại và thiếu ghi công', () => {
    const errs = validateHistory({
      ...base,
      polities: [...POLITIES.slice(0, 2), { ...POLITIES[2], flagCredit: null }],
      snapshots: SNAPSHOTS,
      flagExists: (p) => !p.includes('khmer')
    }).join('\n');
    expect(errs).toMatch(/khmer.*\/flags\/khmer\.svg/);
    expect(errs).toMatch(/champa.*ghi công/);
  });
  it('bắt màu sai định dạng và focus ngoài vùng bản đồ', () => {
    const errs = validateHistory({
      ...base,
      polities: [{ ...POLITIES[0], color: 'red' }, ...POLITIES.slice(1)],
      snapshots: [{ ...SNAPSHOTS[0], focus: { lon: 150, lat: 10 } }, ...SNAPSHOTS.slice(1)]
    }).join('\n');
    expect(errs).toMatch(/dai-viet.*màu/);
    expect(errs).toMatch(/s1.*focus/);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/validate` → Expected: FAIL.

- [ ] **Step 6: Cài đặt validator**

`src/modules/HistoryMap/lib/validate.ts`:
```ts
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

export function validateHistory({ snapshots, polities, groups, eras, cells, flagExists }: Input): string[] {
  const errs: string[] = [];
  const polityIds = new Set<string>();
  for (const p of polities) {
    if (polityIds.has(p.id)) errs.push(`Chính thể trùng id: ${p.id}`);
    polityIds.add(p.id);
    if (!/^#[0-9a-f]{6}$/i.test(p.color)) errs.push(`${p.id}: màu phải dạng #rrggbb, đang là "${p.color}"`);
    if (!KINDS.has(p.flagKind)) errs.push(`${p.id}: flagKind không hợp lệ "${p.flagKind}"`);
    if (!flagExists(p.flag)) errs.push(`${p.id}: không thấy file cờ ${p.flag}`);
    if (p.flagCredit === null && p.flagKind !== 'symbol') errs.push(`${p.id}: cờ không phải biểu tượng tự vẽ thì phải có ghi công (flagCredit)`);
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
    if (!(s.year > prevYear)) errs.push(`${s.id}: năm ${s.year} phải lớn hơn mốc trước (${prevYear})`);
    prevYear = s.year;
    if (!eraIds.has(s.era)) errs.push(`${s.id}: thời kỳ không tồn tại "${s.era}"`);
    if (!s.title.trim() || !s.summary.trim()) errs.push(`${s.id}: thiếu tiêu đề hoặc tóm tắt`);
    if (s.sources.length < 2) errs.push(`${s.id}: cần ít nhất 2 nguồn, đang có ${s.sources.length}`);
    if (idx === 0 && !('*' in s.assign)) errs.push(`${s.id}: mốc đầu tiên phải có khóa '*' để gán đầy đủ`);
    for (const [sel, pol] of Object.entries(s.assign)) {
      try {
        expandSelector(sel, cells, groups);
      } catch (e) {
        errs.push(`${s.id}: ${(e as Error).message}`);
      }
      if (pol !== null && !polityIds.has(pol)) errs.push(`${s.id}: chính thể không tồn tại "${pol}" (selector ${sel})`);
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
```
Run: `yarn test src/modules/HistoryMap/lib/validate` → Expected: PASS.

- [ ] **Step 7: Dữ liệu mẫu và CLI**

Dữ liệu mẫu cho P1–P2 chạy được trong lúc chờ nội dung thật. Task C1 **xóa** `00-sample.ts` và `_sample.svg`.

`public/flags/_sample.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#444"/><circle cx="150" cy="100" r="60" fill="none" stroke="#ddd" stroke-width="8"/><text x="150" y="112" font-size="36" text-anchor="middle" fill="#ddd" font-family="sans-serif">MẪU</text></svg>
```

`src/data/history/polities.ts`:
```ts
import type { Polity } from './types';

const SAMPLE = { flag: '/flags/_sample.svg', flagKind: 'symbol', flagNote: 'Dữ liệu mẫu', flagCredit: null, period: '—', sources: [{ title: 'Dữ liệu mẫu' }] } as const;

export const POLITIES: Polity[] = [
  { id: 'van-lang', name: 'Văn Lang', color: '#b08a3e', ...SAMPLE },
  { id: 'dai-viet', name: 'Đại Việt', color: '#c2402f', ...SAMPLE },
  { id: 'champa', name: 'Chăm Pa', color: '#3f8f7a', ...SAMPLE },
  { id: 'khmer', name: 'Chân Lạp', color: '#5a6fb0', ...SAMPLE },
  { id: 'lan-xang', name: 'Lan Xang', color: '#8a7bb8', ...SAMPLE },
  { id: 'minh', name: 'Nhà Minh', color: '#a8844f', ...SAMPLE },
  { id: 'viet-nam', name: 'Việt Nam', color: '#d6332a', ...SAMPLE },
  { id: 'lao', name: 'Lào', color: '#6f7fc4', ...SAMPLE },
  { id: 'campuchia', name: 'Campuchia', color: '#4d67a8', ...SAMPLE },
  { id: 'trung-quoc', name: 'Trung Quốc', color: '#9b6b4a', ...SAMPLE }
];
```

`src/data/history/groups.ts`:
```ts
import type { CellGroup } from './types';

export const GROUPS: CellGroup[] = [
  {
    id: 'dong-bang-bac-bo',
    name: 'Đồng bằng Bắc Bộ và Bắc Trung Bộ',
    selectors: ['VNM.ha-noi', 'VNM.bac-ninh', 'VNM.hung-yen', 'VNM.hai-duong', 'VNM.ha-nam', 'VNM.nam-dinh', 'VNM.thai-binh', 'VNM.ninh-binh', 'VNM.vinh-phuc', 'VNM.phu-tho', 'VNM.thanh-hoa', 'VNM.nghe-an', 'VNM.ha-tinh']
  },
  {
    id: 'champa-sau-1471',
    name: 'Chăm Pa sau năm 1471 (xấp xỉ)',
    selectors: ['VNM.phu-yen', 'VNM.khanh-hoa', 'VNM.ninh-thuan', 'VNM.binh-thuan', 'VNM.lam-dong', 'VNM.dak-lak', 'VNM.dak-nong', 'VNM.gia-lai', 'VNM.kon-tum']
  },
  {
    id: 'nam-bo',
    name: 'Nam Bộ',
    selectors: ['VNM.tp-ho-chi-minh', 'VNM.ba-ria-vung-tau', 'VNM.binh-duong', 'VNM.binh-phuoc', 'VNM.dong-nai', 'VNM.tay-ninh', 'VNM.long-an', 'VNM.tien-giang', 'VNM.ben-tre', 'VNM.tra-vinh', 'VNM.vinh-long', 'VNM.dong-thap', 'VNM.an-giang', 'VNM.kien-giang', 'VNM.can-tho', 'VNM.hau-giang', 'VNM.soc-trang', 'VNM.bac-lieu', 'VNM.ca-mau', 'VNM.con-dao']
  }
];
```

`src/data/history/snapshots/00-sample.ts`:
```ts
import type { Snapshot } from '../types';

const S = [{ title: 'Dữ liệu mẫu 1' }, { title: 'Dữ liệu mẫu 2' }];

export const SAMPLE_SNAPSHOTS: Snapshot[] = [
  { id: 'tcn700', year: -700, yearLabel: '~700 TCN', era: 'hong-bang', title: 'Văn Lang (mẫu)', summary: 'Dữ liệu mẫu để dựng giao diện.', sources: S, assign: { '*': null, 'group:dong-bang-bac-bo': 'van-lang' } },
  { id: '1471', year: 1471, yearLabel: '1471', era: 'nam-tien', title: 'Năm 1471 (mẫu)', summary: 'Dữ liệu mẫu để dựng giao diện.', sources: S, focus: { lon: 108.9, lat: 14.0 }, assign: { VNM: 'dai-viet', 'group:champa-sau-1471': 'champa', 'group:nam-bo': 'khmer', KHM: 'khmer', LAO: 'lan-xang', CHN: 'minh', 'VNM.hoang-sa': null, 'VNM.truong-sa': null } },
  { id: '2025', year: 2025, yearLabel: '2025', era: 'thong-nhat', title: 'Ngày nay (mẫu)', summary: 'Dữ liệu mẫu để dựng giao diện.', sources: S, assign: { VNM: 'viet-nam', LAO: 'lao', KHM: 'campuchia', CHN: 'trung-quoc' } }
];
```

`src/data/history/index.ts`:
```ts
import { ERAS } from './eras';
import { GROUPS } from './groups';
import { POLITIES } from './polities';
import { SAMPLE_SNAPSHOTS } from './snapshots/00-sample';
import type { Polity, PolityId, Snapshot } from './types';

export const SNAPSHOTS: Snapshot[] = [...SAMPLE_SNAPSHOTS];
export const POLITY_BY_ID: Map<PolityId, Polity> = new Map(POLITIES.map((p) => [p.id, p]));
export { ERAS, GROUPS, POLITIES };
```

`scripts/validate-history.ts`:
```ts
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
console.log(`✓ ${SNAPSHOTS.length} mốc, ${POLITIES.length} chính thể, ${GROUPS.length} nhóm hợp lệ`);
```
Nếu `tsx` không phân giải được alias `@/data/history/types` bên trong `src/`, đổi các import đó sang đường dẫn tương đối, hoặc chạy bằng `tsx --tsconfig tsconfig.json`. `tsx` có đọc `paths` trong tsconfig, nên thường không cần sửa.

Trong `package.json`, đổi `"prebuild"` thành `"yarn validate:history"`.

Run: `yarn validate:history` → Expected: `✓ 3 mốc, 10 chính thể, 3 nhóm hợp lệ`. Nếu báo selector adm1 sai (ví dụ tên tỉnh được slug khác), mở `docs/history/cells-reference.md`, sửa `groups.ts` cho đúng slug thật rồi chạy lại.

- [ ] **Step 8: Chạy toàn bộ test và commit**

Run: `yarn test && yarn lint` → Expected: PASS.
```bash
git add -A
git commit -m "feat(history): data model, selector resolution and validator with sample data

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: Phép chiếu, hình học gộp, đường biên chính thể

**Files:**
- Create: `src/modules/HistoryMap/lib/projection.ts`, `src/modules/HistoryMap/lib/terrainGeometry.ts`, `src/modules/HistoryMap/lib/borders.ts`, `src/modules/HistoryMap/lib/geometry.test.ts`, `src/modules/HistoryMap/lib/topoFixture.ts`

**Interfaces:**
- Consumes: `CellsTopology`, `CellMeta`, `cellsFromTopology` (Task 3).
- Produces (`projection.ts`): `LON0 = 107.5`, `LAT0 = 16.5`, `SCALE = 6`, `DEPTH = 1.2`, `px(lon): number`, `pz(lat): number`, `unprojectX(x): number`, `unprojectZ(z): number`.
- Produces (`terrainGeometry.ts`): `buildTerrainGeometry(topo: CellsTopology): THREE.BufferGeometry`, trả về geometry non-indexed có attribute `position`, `normal`, `aCell` (Float32, chỉ số ô, theo thứ tự `topo.objects.cells.geometries`). Thêm `cellAtVertex(geometry, vertexIndex): number`.
- Produces (`borders.ts`): `buildBorderPositions(topo: CellsTopology, owners: (string | null)[]): Float32Array` (các cặp điểm cho `LineSegments`, y = `DEPTH + 0.03`, chỉ gồm cạnh giữa hai ô khác chủ). Thêm `buildCoastPositions(topo): Float32Array` (các cạnh ngoài cùng).

- [ ] **Step 1: Fixture topology tổng hợp**

`src/modules/HistoryMap/lib/topoFixture.ts`:
```ts
import type { FeatureCollection, Polygon } from 'geojson';
import { topology } from 'topojson-server';
import type { CellMeta, CellsTopology } from './cells';

const square = (id: string, lon: number, lat: number): FeatureCollection<Polygon, CellMeta>['features'][number] => ({
  type: 'Feature',
  properties: { id, name: id, country: 'VNM', adm1: 'VNM.t', adm1Name: 't', lon: lon + 0.5, lat: lat + 0.5, area: 100 },
  geometry: { type: 'Polygon', coordinates: [[[lon, lat], [lon + 1, lat], [lon + 1, lat + 1], [lon, lat + 1], [lon, lat]]] }
});

/** Ba ô vuông 1°x1° liền nhau theo hàng ngang, bắt đầu tại (106, 16). */
export function makeFixtureTopology(): CellsTopology {
  const fc: FeatureCollection<Polygon, CellMeta> = {
    type: 'FeatureCollection',
    features: [square('VNM.t.a', 106, 16), square('VNM.t.b', 107, 16), square('VNM.t.c', 108, 16)]
  };
  return topology({ cells: fc }) as unknown as CellsTopology;
}
```

- [ ] **Step 2: Viết test (thất bại)**

`src/modules/HistoryMap/lib/geometry.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { buildBorderPositions, buildCoastPositions } from './borders';
import { DEPTH, LAT0, LON0, px, pz, unprojectX, unprojectZ } from './projection';
import { buildTerrainGeometry, cellAtVertex } from './terrainGeometry';
import { makeFixtureTopology } from './topoFixture';

describe('projection', () => {
  it('gốc tọa độ tại (LON0, LAT0); đông → +x; bắc → -z', () => {
    expect(px(LON0)).toBeCloseTo(0);
    expect(pz(LAT0)).toBeCloseTo(0);
    expect(px(LON0 + 1)).toBeGreaterThan(0);
    expect(pz(LAT0 + 1)).toBeLessThan(0);
  });
  it('unproject là phép nghịch đảo', () => {
    expect(unprojectX(px(110.25))).toBeCloseTo(110.25);
    expect(unprojectZ(pz(9.5))).toBeCloseTo(9.5);
  });
});

describe('buildTerrainGeometry', () => {
  const topo = makeFixtureTopology();
  const geo = buildTerrainGeometry(topo);
  const aCell = geo.getAttribute('aCell');
  const pos = geo.getAttribute('position');

  it('mỗi đỉnh có aCell hợp lệ và đủ 3 ô', () => {
    const seen = new Set<number>();
    for (let i = 0; i < aCell.count; i++) seen.add(aCell.getX(i));
    expect([...seen].sort()).toEqual([0, 1, 2]);
    expect(aCell.count).toBe(pos.count);
  });
  it('mặt trên ở y = DEPTH, đáy ở y = 0', () => {
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < pos.count; i++) {
      minY = Math.min(minY, pos.getY(i));
      maxY = Math.max(maxY, pos.getY(i));
    }
    expect(minY).toBeCloseTo(0);
    expect(maxY).toBeCloseTo(DEPTH);
  });
  it('x nằm trong khoảng chiếu của lon 106..109', () => {
    geo.computeBoundingBox();
    expect(geo.boundingBox?.min.x).toBeCloseTo(px(106), 1);
    expect(geo.boundingBox?.max.x).toBeCloseTo(px(109), 1);
  });
  it('cellAtVertex đọc đúng chỉ số', () => {
    expect(cellAtVertex(geo, 0)).toBe(aCell.getX(0));
  });
});

describe('borders', () => {
  const topo = makeFixtureTopology();
  it('không có biên khi cả ba ô cùng chủ', () => {
    expect(buildBorderPositions(topo, ['a', 'a', 'a']).length).toBe(0);
  });
  it('có biên giữa hai chủ khác nhau, nằm trên mặt đất', () => {
    const p = buildBorderPositions(topo, ['a', 'a', 'b']);
    expect(p.length).toBeGreaterThan(0);
    expect(p.length % 6).toBe(0);
    for (let i = 1; i < p.length; i += 3) expect(p[i]).toBeCloseTo(DEPTH + 0.03);
    // biên chỉ nằm ở kinh tuyến 108
    for (let i = 0; i < p.length; i += 3) expect(p[i]).toBeCloseTo(px(108), 3);
  });
  it('ô null cũng tạo biên với ô có chủ', () => {
    expect(buildBorderPositions(topo, ['a', null, null]).length).toBeGreaterThan(0);
  });
  it('đường bờ bao quanh cả khối', () => {
    expect(buildCoastPositions(topo).length).toBeGreaterThan(0);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/geometry` → Expected: FAIL (module chưa tồn tại).

- [ ] **Step 3: Cài đặt projection**

`src/modules/HistoryMap/lib/projection.ts`:
```ts
export const LON0 = 107.5;
export const LAT0 = 16.5;
export const SCALE = 6;
export const DEPTH = 1.2;
const KLON = Math.cos((LAT0 * Math.PI) / 180);

export const px = (lon: number): number => (lon - LON0) * KLON * SCALE;
export const pz = (lat: number): number => -(lat - LAT0) * SCALE;
export const unprojectX = (x: number): number => x / (KLON * SCALE) + LON0;
export const unprojectZ = (z: number): number => -z / SCALE + LAT0;
```

- [ ] **Step 4: Cài đặt terrainGeometry**

`src/modules/HistoryMap/lib/terrainGeometry.ts`:
```ts
import type { MultiPolygon, Polygon, Position } from 'geojson';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { feature } from 'topojson-client';
import type { CellsTopology } from './cells';
import { DEPTH, px, pz } from './projection';

function ringToPath(ring: Position[], path: THREE.Path): void {
  ring.forEach(([lon, lat], i) => {
    // Shape nằm trong mặt XY; sau rotateX(-90°) thì y → -z, nên dùng y = -pz(lat)
    const x = px(lon);
    const y = -pz(lat);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
}

function polygonToShape(rings: Position[][]): THREE.Shape | null {
  if (!rings[0] || rings[0].length < 4) return null;
  const shape = new THREE.Shape();
  ringToPath(rings[0], shape);
  for (const hole of rings.slice(1)) {
    if (hole.length < 4) continue;
    const h = new THREE.Path();
    ringToPath(hole, h);
    shape.holes.push(h);
  }
  return shape;
}

export function buildTerrainGeometry(topo: CellsTopology): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  topo.objects.cells.geometries.forEach((g, cellIndex) => {
    const f = feature(topo, g) as unknown as { geometry: Polygon | MultiPolygon | null };
    if (!f.geometry) return;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const rings of polys) {
      const shape = polygonToShape(rings);
      if (!shape) continue;
      const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);
      geo.deleteAttribute('uv');
      geo.clearGroups();
      const n = geo.getAttribute('position').count;
      geo.setAttribute('aCell', new THREE.BufferAttribute(new Float32Array(n).fill(cellIndex), 1));
      parts.push(geo);
    }
  });
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error('Không gộp được hình học các ô');
  for (const p of parts) p.dispose();
  return merged;
}

export function cellAtVertex(geometry: THREE.BufferGeometry, vertexIndex: number): number {
  return geometry.getAttribute('aCell').getX(vertexIndex);
}
```
Nếu import `three/examples/jsm/...` báo lỗi type, dùng `three/addons/utils/BufferGeometryUtils.js` (cả hai đều được `three` export).

- [ ] **Step 5: Cài đặt borders**

`src/modules/HistoryMap/lib/borders.ts`:
```ts
import type { MultiLineString } from 'geojson';
import { mesh } from 'topojson-client';
import type { CellsTopology } from './cells';
import { DEPTH, px, pz } from './projection';

const Y = DEPTH + 0.03;

function toSegments(ml: MultiLineString): Float32Array {
  const out: number[] = [];
  for (const line of ml.coordinates) {
    for (let i = 1; i < line.length; i++) {
      const [lon0, lat0] = line[i - 1];
      const [lon1, lat1] = line[i];
      out.push(px(lon0), Y, pz(lat0), px(lon1), Y, pz(lat1));
    }
  }
  return new Float32Array(out);
}

export function buildBorderPositions(topo: CellsTopology, owners: (string | null)[]): Float32Array {
  const index = new Map(topo.objects.cells.geometries.map((g, i) => [g, i]));
  const ml = mesh(topo, topo.objects.cells, (a, b) => {
    if (a === b) return false;
    const oa = owners[index.get(a as never) ?? -1] ?? null;
    const ob = owners[index.get(b as never) ?? -1] ?? null;
    return oa !== ob;
  }) as MultiLineString;
  return toSegments(ml);
}

export function buildCoastPositions(topo: CellsTopology): Float32Array {
  return toSegments(mesh(topo, topo.objects.cells, (a, b) => a === b) as MultiLineString);
}
```

- [ ] **Step 6: Chạy test**

Run: `yarn test src/modules/HistoryMap/lib/geometry` → Expected: PASS.
Kiểm tra trên dữ liệu thật (đo thời gian dựng, không cần commit):
```bash
yarn tsx -e "import {readFileSync} from 'node:fs';import {buildTerrainGeometry} from './src/modules/HistoryMap/lib/terrainGeometry';const t=JSON.parse(readFileSync('public/data/cells.topo.json','utf8'));const s=performance.now();const g=buildTerrainGeometry(t);console.log(g.getAttribute('position').count,'verts',Math.round(performance.now()-s),'ms')"
```
Expected: dưới ~1,5 triệu đỉnh, dưới ~1.500 ms. Nếu vượt ngưỡng, quay lại Task 2 giảm `-simplify` xuống 5% rồi chạy lại.

- [ ] **Step 7: Commit**

```bash
git add src/modules/HistoryMap/lib
git commit -m "feat(map): projection, merged terrain geometry and polity borders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 5: Trạng thái ô, shader lãnh thổ và khung cảnh 3D

**Files:**
- Create: `src/modules/HistoryMap/lib/cellState.ts`, `src/modules/HistoryMap/lib/cellState.test.ts`, `src/modules/HistoryMap/lib/loadMapData.ts`, `src/modules/HistoryMap/lib/webgl.ts`, `src/modules/HistoryMap/state/store.ts`, `src/modules/HistoryMap/copy.ts`, `src/modules/HistoryMap/HistoryMap.tsx`, `src/modules/HistoryMap/scene/Scene.tsx`, `src/modules/HistoryMap/scene/Terrain.tsx`, `src/modules/HistoryMap/scene/Borders.tsx`, `src/modules/HistoryMap/scene/Sea.tsx`, `src/modules/HistoryMap/scene/Lights.tsx`, `src/modules/HistoryMap/scene/CameraRig.tsx`, `src/modules/HistoryMap/ui/NoWebGLFallback.tsx`, `src/modules/HistoryMap/ui/LoadError.tsx`, `src/modules/HistoryMap/ui/Masthead.tsx`
- Modify: `src/modules/HistoryMap/index.tsx`, `e2e/history-map.spec.ts`

**Interfaces:**
- Consumes: `buildTerrainGeometry`, `buildBorderPositions`, `buildCoastPositions`, `DEPTH` (Task 4); `resolveAllSnapshots`, `effectivePolity`, `cellsFromTopology` (Task 3); `SNAPSHOTS`, `GROUPS`, `POLITY_BY_ID` (`@/data/history`).
- Produces (`cellState.ts`):
  - `class CellStateStore { constructor(count: number); readonly count: number; readonly width: number; readonly height: number; readonly data: Float32Array; setColors(rgb: Float32Array, opts?: { animate?: boolean; delays?: Float32Array }): void; setLiftMask(mask: Uint8Array | null): void; tick(dt: number): boolean; isAnimating(): boolean }`. `data` là RGBA float, trong đó rgb là màu linear và a là độ nổi 0..1.
  - `ownerColors(owners: (string | null)[], colorOf: (id: string) => string): Float32Array`, với `null` → `#6b6358`.
  - `spreadDelays(cells: CellMeta[], prev: (string | null)[], next: (string | null)[]): Float32Array`: độ trễ (giây) cho ô đổi chủ, tăng theo khoảng cách tới lãnh thổ cũ của chủ mới, tối đa 1,2 giây.
  - Hằng số `TRANSITION_S = 0.8`, `LIFT_MAX = 0.8`, `NULL_COLOR = '#6b6358'`.
- Produces (`loadMapData.ts`): `interface MapData { topo: CellsTopology; cells: CellMeta[]; geometry: THREE.BufferGeometry; owners: (string | null)[][]; coast: Float32Array }`, `loadMapData(signal?: AbortSignal): Promise<MapData>`.
- Produces (`state/store.ts`): signals `snapshotIndex: Signal<number>`, `hoveredPolity: Signal<string | null>`, `selectedPolity: Signal<string | null>`, `playing: Signal<boolean>`, `pointerPos: Signal<{ x: number; y: number } | null>`, cùng `reducedMotion(): boolean`.
- Produces: `<Scene data={MapData} />`, `<Terrain data store />` (component cho phép Task 7 gắn prop `onHoverCell(index | null)` và `onClickCell(index)`).
- Produces: root `<main data-testid="history-map-root" data-status="loading|error|ready|nowebgl">`.

- [ ] **Step 1: Cài BVH để raycast nhanh và kiểm tra API của signals**

```bash
yarn add three-mesh-bvh
cat node_modules/@preact/signals-react/package.json | grep '"version"'
ls node_modules/@preact/signals-react/runtime
```
Với `@preact/signals-react` bản 3.x: component đọc `.value` trong lúc render phải gọi `useSignals()` (import từ `@preact/signals-react/runtime`) ở dòng đầu, vì repo không dùng babel transform. Trong `useFrame` thì đọc bằng `.peek()`, không gây re-render.

- [ ] **Step 2: Viết test cellState (thất bại)**

`src/modules/HistoryMap/lib/cellState.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CellStateStore, LIFT_MAX, TRANSITION_S, ownerColors, spreadDelays } from './cellState';
import { CELLS } from './testFixtures';

const rgb = (...v: number[]) => new Float32Array(v);

describe('CellStateStore', () => {
  it('texture đủ chỗ cho mọi ô, là lũy thừa của 2 theo chiều rộng', () => {
    const s = new CellStateStore(1300);
    expect(s.width * s.height).toBeGreaterThanOrEqual(1300);
    expect(Math.log2(s.width) % 1).toBe(0);
    expect(s.data.length).toBe(s.width * s.height * 4);
  });
  it('setColors không animate thì ghi ngay', () => {
    const s = new CellStateStore(2);
    s.setColors(rgb(1, 0, 0, 0, 1, 0));
    s.tick(0);
    expect([...s.data.slice(0, 8)]).toEqual([1, 0, 0, 0, 0, 1, 0, 0]);
  });
  it('animate chuyển dần và kết thúc đúng màu đích, có nhịp nổi rồi hạ', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(0, 0, 0));
    s.tick(0);
    s.setColors(rgb(1, 1, 1), { animate: true });
    s.tick(TRANSITION_S / 2);
    expect(s.data[0]).toBeGreaterThan(0);
    expect(s.data[0]).toBeLessThan(1);
    expect(s.data[3]).toBeGreaterThan(0);
    s.tick(TRANSITION_S);
    expect(s.data[0]).toBeCloseTo(1);
    expect(s.data[3]).toBeCloseTo(0);
    expect(s.isAnimating()).toBe(false);
  });
  it('ô không đổi màu thì không nhấp nhô', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(1, 0, 0));
    s.tick(0);
    s.setColors(rgb(1, 0, 0), { animate: true });
    s.tick(TRANSITION_S / 2);
    expect(s.data[3]).toBe(0);
  });
  it('delay giữ màu cũ cho tới khi hết trễ', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(0, 0, 0));
    s.tick(0);
    s.setColors(rgb(1, 1, 1), { animate: true, delays: new Float32Array([0.5]) });
    s.tick(0.4);
    expect(s.data[0]).toBe(0);
  });
  it('setLiftMask nâng dần ô được đánh dấu và hạ khi bỏ', () => {
    const s = new CellStateStore(2);
    s.setColors(rgb(0, 0, 0, 0, 0, 0));
    s.setLiftMask(new Uint8Array([1, 0]));
    for (let i = 0; i < 30; i++) s.tick(1 / 30);
    expect(s.data[3]).toBeGreaterThan(0.9 * (0.5 / LIFT_MAX) * LIFT_MAX);
    expect(s.data[7]).toBe(0);
    s.setLiftMask(null);
    for (let i = 0; i < 60; i++) s.tick(1 / 30);
    expect(s.data[3]).toBeCloseTo(0, 2);
  });
  it('tick trả về false khi không có gì thay đổi', () => {
    const s = new CellStateStore(1);
    s.setColors(rgb(0, 0, 0));
    s.tick(0);
    expect(s.tick(0.016)).toBe(false);
  });
});

describe('ownerColors', () => {
  it('null → màu đá, chủ → màu của chủ (linear)', () => {
    const c = ownerColors(['a', null], () => '#ffffff');
    expect([...c.slice(0, 3)]).toEqual([1, 1, 1]);
    expect(c[3]).toBeGreaterThan(0);
    expect(c[3]).toBeLessThan(0.2);
  });
});

describe('spreadDelays', () => {
  it('ô không đổi chủ có trễ 0; ô xa lãnh thổ cũ trễ nhiều hơn ô gần', () => {
    const prev = ['x', 'x', null, null, null, null];
    const next = ['x', 'x', 'x', 'x', null, null];
    const d = spreadDelays(CELLS, prev, next);
    expect(d[0]).toBe(0);
    expect(d[2]).toBeGreaterThan(0);
    expect(d[3]).toBeGreaterThanOrEqual(d[2]);
    expect(Math.max(...d)).toBeLessThanOrEqual(1.2);
  });
  it('chủ mới hoàn toàn (không có lãnh thổ cũ) thì trễ 0', () => {
    const d = spreadDelays(CELLS, [null, null, null, null, null, null], ['y', null, null, null, null, null]);
    expect(d[0]).toBe(0);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/cellState` → Expected: FAIL.

- [ ] **Step 3: Cài đặt cellState**

`src/modules/HistoryMap/lib/cellState.ts`:
```ts
import * as THREE from 'three';
import type { CellMeta } from './cells';

export const TRANSITION_S = 0.8;
export const LIFT_MAX = 0.8;
export const NULL_COLOR = '#6b6358';
const HOVER_LIFT = 0.5; // tỉ lệ của LIFT_MAX
const PULSE_LIFT = 0.6;

const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class CellStateStore {
  readonly count: number;
  readonly width: number;
  readonly height: number;
  readonly data: Float32Array;
  private from: Float32Array;
  private to: Float32Array;
  private elapsed: Float32Array;
  private delay: Float32Array;
  private changed: Uint8Array;
  private lift: Float32Array;
  private liftTarget: Float32Array;
  private animating = false;
  private dirty = true;

  constructor(count: number) {
    this.count = count;
    this.width = 2 ** Math.ceil(Math.log2(Math.ceil(Math.sqrt(Math.max(1, count)))));
    this.height = Math.ceil(count / this.width);
    this.data = new Float32Array(this.width * this.height * 4);
    this.from = new Float32Array(count * 3);
    this.to = new Float32Array(count * 3);
    this.elapsed = new Float32Array(count).fill(Number.POSITIVE_INFINITY);
    this.delay = new Float32Array(count);
    this.changed = new Uint8Array(count);
    this.lift = new Float32Array(count);
    this.liftTarget = new Float32Array(count);
  }

  private currentColor(i: number, k: number): number {
    const t = ease(Math.min(1, Math.max(0, (this.elapsed[i] - this.delay[i]) / TRANSITION_S)));
    return this.from[i * 3 + k] + (this.to[i * 3 + k] - this.from[i * 3 + k]) * t;
  }

  setColors(rgb: Float32Array, opts: { animate?: boolean; delays?: Float32Array } = {}): void {
    for (let i = 0; i < this.count; i++) {
      const cur = [0, 1, 2].map((k) => this.currentColor(i, k));
      const same = cur.every((v, k) => Math.abs(v - rgb[i * 3 + k]) < 1e-4);
      for (let k = 0; k < 3; k++) {
        this.from[i * 3 + k] = opts.animate ? cur[k] : rgb[i * 3 + k];
        this.to[i * 3 + k] = rgb[i * 3 + k];
      }
      this.changed[i] = opts.animate && !same ? 1 : 0;
      this.delay[i] = opts.animate ? (opts.delays?.[i] ?? 0) : 0;
      this.elapsed[i] = opts.animate && !same ? 0 : Number.POSITIVE_INFINITY;
    }
    this.animating = !!opts.animate;
    this.dirty = true;
  }

  setLiftMask(mask: Uint8Array | null): void {
    for (let i = 0; i < this.count; i++) this.liftTarget[i] = mask?.[i] ? HOVER_LIFT : 0;
    this.dirty = true;
  }

  isAnimating(): boolean {
    return this.animating;
  }

  tick(dt: number): boolean {
    let active = false;
    let liftMoving = false;
    const k = Math.min(1, dt * 10);
    for (let i = 0; i < this.count; i++) {
      if (this.elapsed[i] !== Number.POSITIVE_INFINITY) {
        this.elapsed[i] += dt;
        if (this.elapsed[i] - this.delay[i] >= TRANSITION_S) this.elapsed[i] = Number.POSITIVE_INFINITY;
        else active = true;
      }
      const d = this.liftTarget[i] - this.lift[i];
      if (Math.abs(d) > 1e-4) {
        this.lift[i] = Math.abs(d) < 1e-3 ? this.liftTarget[i] : this.lift[i] + d * k;
        liftMoving = true;
      }
    }
    if (!active && !liftMoving && !this.dirty && !this.animating) return false;
    for (let i = 0; i < this.count; i++) {
      for (let c = 0; c < 3; c++) this.data[i * 4 + c] = this.currentColor(i, c);
      let pulse = 0;
      if (this.changed[i] && this.elapsed[i] !== Number.POSITIVE_INFINITY) {
        const p = Math.min(1, Math.max(0, (this.elapsed[i] - this.delay[i]) / TRANSITION_S));
        pulse = Math.sin(Math.PI * p) * PULSE_LIFT;
      }
      this.data[i * 4 + 3] = Math.min(1, pulse + this.lift[i]);
    }
    this.animating = active;
    this.dirty = false;
    return true;
  }
}

export function ownerColors(owners: (string | null)[], colorOf: (id: string) => string): Float32Array {
  const out = new Float32Array(owners.length * 3);
  const cache = new Map<string, THREE.Color>();
  owners.forEach((o, i) => {
    const hex = o === null ? NULL_COLOR : colorOf(o);
    let c = cache.get(hex);
    if (!c) {
      c = new THREE.Color(hex);
      cache.set(hex, c);
    }
    out[i * 3] = c.r;
    out[i * 3 + 1] = c.g;
    out[i * 3 + 2] = c.b;
  });
  return out;
}

export function spreadDelays(cells: CellMeta[], prev: (string | null)[], next: (string | null)[]): Float32Array {
  const out = new Float32Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    if (prev[i] === next[i] || next[i] === null) continue;
    let best = Number.POSITIVE_INFINITY;
    for (let j = 0; j < cells.length; j++) {
      if (prev[j] !== next[i]) continue;
      const d = Math.hypot(cells[i].lon - cells[j].lon, cells[i].lat - cells[j].lat);
      if (d < best) best = d;
    }
    out[i] = best === Number.POSITIVE_INFINITY ? 0 : Math.min(1.2, best * 0.12);
  }
  return out;
}
```
Run: `yarn test src/modules/HistoryMap/lib/cellState` → Expected: PASS. Nếu test `setLiftMask` quá chặt do hằng số làm mượt, chỉ nới ngưỡng so sánh trong test. Không đổi `HOVER_LIFT`.

- [ ] **Step 4: Store, copy, tải dữ liệu, phát hiện WebGL**

`src/modules/HistoryMap/state/store.ts`:
```ts
import { signal } from '@preact/signals-react';

export const snapshotIndex = signal(0);
export const hoveredPolity = signal<string | null>(null);
export const selectedPolity = signal<string | null>(null);
export const playing = signal(false);
export const pointerPos = signal<{ x: number; y: number } | null>(null);

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

`src/modules/HistoryMap/copy.ts`:
```ts
export const COPY = {
  eyebrow: 'Từ thời đồ đá đến nay',
  title: 'VIỆT NAM',
  subtitle: 'Mở mang bờ cõi',
  loading: 'Đang dựng non sông…',
  loadError: 'Không tải được dữ liệu bản đồ.',
  retry: 'Thử lại',
  noWebGL: 'Trình duyệt của bạn không hỗ trợ WebGL nên không hiển thị được bản đồ 3D. Dưới đây là các mốc lịch sử dạng văn bản.',
  hint: 'Kéo để xoay · lăn để thu phóng · rê vào lãnh thổ để xem chính thể',
  flagKind: { national: 'Quốc kỳ', banner: 'Cờ hiệu', reconstructed: 'Cờ phục dựng', symbol: 'Biểu tượng' },
  lowConfidence: 'Một phần ranh giới ở mốc này là ước đoán',
  sources: 'Nguồn',
  polities: 'Các chính thể',
  capital: 'Kinh đô',
  period: 'Thời gian tồn tại',
  flagNote: 'Về lá cờ',
  play: 'Tự chạy',
  pause: 'Tạm dừng',
  prev: 'Mốc trước',
  next: 'Mốc sau',
  timelineLabel: 'Dòng thời gian',
  credits: 'Nguồn & ghi công',
  close: 'Đóng',
  back: 'Quay lại toàn cảnh'
} as const;
```

`src/modules/HistoryMap/lib/webgl.ts`:
```ts
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
```

`src/modules/HistoryMap/lib/loadMapData.ts`:
```ts
import { GROUPS, SNAPSHOTS } from '@/data/history';
import type * as THREE from 'three';
import { buildCoastPositions } from './borders';
import { type CellMeta, type CellsTopology, cellsFromTopology } from './cells';
import { resolveAllSnapshots } from './resolve';
import { buildTerrainGeometry } from './terrainGeometry';

export interface MapData {
  topo: CellsTopology;
  cells: CellMeta[];
  geometry: THREE.BufferGeometry;
  owners: (string | null)[][];
  coast: Float32Array;
}

export async function loadMapData(signal?: AbortSignal): Promise<MapData> {
  const res = await fetch('/data/cells.topo.json', { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const topo = (await res.json()) as CellsTopology;
  const cells = cellsFromTopology(topo);
  return {
    topo,
    cells,
    geometry: buildTerrainGeometry(topo),
    owners: resolveAllSnapshots(SNAPSHOTS, cells, GROUPS),
    coast: buildCoastPositions(topo)
  };
}
```

- [ ] **Step 5: Các component cảnh**

`src/modules/HistoryMap/scene/Lights.tsx`:
```tsx
import type React from 'react';

export default function Lights({ shadows }: { shadows: boolean }): React.ReactElement {
  return (
    <>
      <hemisphereLight args={['#9fc8e8', '#1c3044', 1.0]} />
      <directionalLight
        color="#ffd9a0"
        intensity={2.4}
        position={[90, 130, 60]}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-far={420}
        shadow-bias={-0.0004}
      />
      <directionalLight color="#4fb3ff" intensity={0.7} position={[-80, 60, -90]} />
    </>
  );
}
```

`src/modules/HistoryMap/scene/Sea.tsx`:
```tsx
import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { reducedMotion } from '../state/store';

export default function Sea(): React.ReactElement {
  const geo = useMemo(() => new THREE.PlaneGeometry(700, 700, 70, 70), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const still = useRef(reducedMotion());
  useFrame(({ clock }) => {
    if (still.current) return;
    const t = clock.elapsedTime;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 2] = Math.sin(base[i] * 0.05 + t * 0.6) * 0.25 + Math.cos(base[i + 1] * 0.06 + t * 0.4) * 0.2;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return (
    <mesh geometry={geo} rotation-x={-Math.PI / 2} position-y={-0.55} receiveShadow>
      <meshStandardMaterial color="#123048" roughness={0.6} metalness={0.2} />
    </mesh>
  );
}
```

`src/modules/HistoryMap/scene/CameraRig.tsx`:
```tsx
import { OrbitControls } from '@react-three/drei';
import type React from 'react';

export const HOME_POS: [number, number, number] = [10, 130, 120];
export const HOME_TARGET: [number, number, number] = [0, 0, 0];

export default function CameraRig(): React.ReactElement {
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={40}
      maxDistance={260}
      minPolarAngle={0.12}
      maxPolarAngle={1.25}
      target={HOME_TARGET}
    />
  );
}
```

`src/modules/HistoryMap/scene/Terrain.tsx`:
```tsx
'use client';

import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { useSignalEffect } from '@preact/signals-react';
import type React from 'react';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CellStateStore, LIFT_MAX, ownerColors, spreadDelays } from '../lib/cellState';
import type { MapData } from '../lib/loadMapData';
import { effectivePolity } from '../lib/resolve';
import { cellAtVertex } from '../lib/terrainGeometry';
import { reducedMotion, snapshotIndex } from '../state/store';

interface Props {
  data: MapData;
  store: CellStateStore;
  onHoverCell?: (cell: number | null, e: ThreeEvent<PointerEvent>) => void;
  onClickCell?: (cell: number) => void;
}

function makeMaterial(tex: THREE.DataTexture, store: CellStateStore): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCellState = { value: tex };
    shader.uniforms.uCellTexSize = { value: new THREE.Vector2(store.width, store.height) };
    shader.uniforms.uLiftMax = { value: LIFT_MAX };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float aCell;
uniform sampler2D uCellState;
uniform vec2 uCellTexSize;
uniform float uLiftMax;
varying vec3 vCellColor;
varying float vSide;
varying float vLift;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vec2 cuv = (vec2(mod(aCell, uCellTexSize.x), floor(aCell / uCellTexSize.x)) + 0.5) / uCellTexSize;
vec4 cs = texture2D(uCellState, cuv);
vCellColor = cs.rgb;
vLift = cs.a;
vSide = 1.0 - step(0.5, normal.y);
transformed.y += cs.a * uLiftMax * step(0.001, position.y);`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vCellColor;
varying float vSide;
varying float vLift;`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'vec4 diffuseColor = vec4( vCellColor * mix(1.0, 0.55, vSide) * (1.0 + vLift * 0.3), opacity );'
      );
  };
  return mat;
}

export default function Terrain({ data, store, onHoverCell, onClickCell }: Props): React.ReactElement {
  const tex = useMemo(() => {
    const t = new THREE.DataTexture(store.data, store.width, store.height, THREE.RGBAFormat, THREE.FloatType);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [store]);
  const material = useMemo(() => makeMaterial(tex, store), [tex, store]);
  const prevIndex = useRef<number | null>(null);

  useSignalEffect(() => {
    const i = snapshotIndex.value;
    const owners = data.owners[i];
    const colors = ownerColors(owners, (id) => effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, id).color);
    const prev = prevIndex.current;
    const animate = prev !== null && !reducedMotion();
    store.setColors(colors, {
      animate,
      delays: animate && prev !== null ? spreadDelays(data.cells, data.owners[prev], owners) : undefined
    });
    prevIndex.current = i;
  });

  useFrame((_, dt) => {
    if (store.tick(Math.min(dt, 0.1))) tex.needsUpdate = true;
  });

  const cellOf = (e: ThreeEvent<PointerEvent | MouseEvent>): number | null =>
    e.face ? cellAtVertex(data.geometry, e.face.a) : null;

  return (
    <mesh
      geometry={data.geometry}
      material={material}
      castShadow
      receiveShadow
      onPointerMove={(e) => {
        e.stopPropagation();
        onHoverCell?.(cellOf(e), e);
      }}
      onPointerOut={(e) => onHoverCell?.(null, e)}
      onClick={(e) => {
        e.stopPropagation();
        const c = cellOf(e);
        if (c !== null) onClickCell?.(c);
      }}
    />
  );
}
```

`src/modules/HistoryMap/scene/Borders.tsx`:
```tsx
'use client';

import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { buildBorderPositions } from '../lib/borders';
import type { MapData } from '../lib/loadMapData';
import { snapshotIndex } from '../state/store';

function Lines({ positions, color, opacity }: { positions: Float32Array; color: string; opacity: number }): React.ReactElement {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}

export default function Borders({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const borders = useMemo(() => buildBorderPositions(data.topo, data.owners[i]), [data, i]);
  return (
    <>
      <Lines positions={data.coast} color="#9fb8c8" opacity={0.35} />
      <Lines positions={borders} color="#f4e3c1" opacity={0.85} />
    </>
  );
}
```

`src/modules/HistoryMap/scene/Scene.tsx`:
```tsx
'use client';

import { Bvh } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type React from 'react';
import { useMemo } from 'react';
import { CellStateStore } from '../lib/cellState';
import type { MapData } from '../lib/loadMapData';
import Borders from './Borders';
import CameraRig, { HOME_POS } from './CameraRig';
import Lights from './Lights';
import Sea from './Sea';
import Terrain from './Terrain';

export default function Scene({ data, children }: { data: MapData; children?: React.ReactNode }): React.ReactElement {
  const store = useMemo(() => new CellStateStore(data.cells.length), [data]);
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <Canvas
      shadows={!mobile}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: 40, position: HOME_POS, near: 1, far: 1200 }}
      gl={{ antialias: true, toneMappingExposure: 1.25 }}
    >
      <color attach="background" args={['#0a1420']} />
      <fogExp2 attach="fog" args={['#0a1420', 0.0022]} />
      <Lights shadows={!mobile} />
      <Sea />
      <Bvh firstHitOnly>
        <Terrain data={data} store={store} />
      </Bvh>
      <Borders data={data} />
      <CameraRig />
      {children}
    </Canvas>
  );
}
```
Task 7 sẽ đưa `store` và các handler lên `HistoryMap`. Lúc đó cho `Scene` nhận `store`, `onHoverCell`, `onClickCell` qua props.

- [ ] **Step 6: UI khung (masthead, lỗi, không WebGL) và HistoryMap**

`src/modules/HistoryMap/ui/Masthead.tsx`:
```tsx
import type React from 'react';
import { COPY } from '../copy';

export default function Masthead(): React.ReactElement {
  return (
    <header className="pointer-events-none absolute top-6 left-6 text-[#e8dcc2] drop-shadow-lg md:top-10 md:left-10">
      <p className="text-xs uppercase tracking-[0.3em] opacity-70">{COPY.eyebrow}</p>
      <h1 className="font-extrabold text-4xl tracking-wider md:text-6xl">{COPY.title}</h1>
      <p className="text-sm italic opacity-80 md:text-base">{COPY.subtitle}</p>
    </header>
  );
}
```

`src/modules/HistoryMap/ui/LoadError.tsx`:
```tsx
import type React from 'react';
import { COPY } from '../copy';

export default function LoadError({ onRetry }: { onRetry: () => void }): React.ReactElement {
  return (
    <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#e8dcc2]">
      <p>{COPY.loadError}</p>
      <button type="button" onClick={onRetry} className="rounded-full border border-[#e8dcc2]/40 px-5 py-2 hover:bg-white/10">
        {COPY.retry}
      </button>
    </div>
  );
}
```

`src/modules/HistoryMap/ui/NoWebGLFallback.tsx`:
```tsx
import { SNAPSHOTS } from '@/data/history';
import type React from 'react';
import { COPY } from '../copy';

export default function NoWebGLFallback(): React.ReactElement {
  return (
    <div className="absolute inset-0 overflow-y-auto p-6 text-[#e8dcc2] md:p-12">
      <p className="mb-6 max-w-2xl opacity-80">{COPY.noWebGL}</p>
      <ol className="max-w-2xl space-y-4">
        {SNAPSHOTS.map((s) => (
          <li key={s.id}>
            <p className="text-sm opacity-60">{s.yearLabel}</p>
            <h2 className="font-semibold text-lg">{s.title}</h2>
            <p className="opacity-85">{s.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

`src/modules/HistoryMap/HistoryMap.tsx`:
```tsx
'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { COPY } from './copy';
import { type MapData, loadMapData } from './lib/loadMapData';
import { hasWebGL } from './lib/webgl';
import Scene from './scene/Scene';
import LoadError from './ui/LoadError';
import Masthead from './ui/Masthead';
import NoWebGLFallback from './ui/NoWebGLFallback';

type LoadState = { status: 'loading' } | { status: 'error' } | { status: 'nowebgl' } | { status: 'ready'; data: MapData };

export default function HistoryMap(): React.ReactElement {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hasWebGL()) {
      setState({ status: 'nowebgl' });
      return;
    }
    const ac = new AbortController();
    setState({ status: 'loading' });
    loadMapData(ac.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setState({ status: 'error' });
      });
    return () => ac.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return (
    <main data-testid="history-map-root" data-status={state.status} className="fixed inset-0 overflow-hidden bg-[#0a1420] text-[#e8dcc2]">
      {state.status === 'ready' && <Scene data={state.data} />}
      {state.status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-80">{COPY.loading}</div>
      )}
      {state.status === 'error' && <LoadError onRetry={retry} />}
      {state.status === 'nowebgl' && <NoWebGLFallback />}
      {state.status !== 'nowebgl' && <Masthead />}
    </main>
  );
}
```

`src/modules/HistoryMap/index.tsx` (thay bản tạm của Task 1):
```tsx
'use client';

import dynamic from 'next/dynamic';

const HistoryMap = dynamic(() => import('./HistoryMap'), {
  ssr: false,
  loading: () => (
    <main data-testid="history-map-root" data-status="loading" className="fixed inset-0 bg-[#0a1420]" />
  )
});

export default HistoryMap;
```
Kiểm tra lại cú pháp `next/dynamic` với tài liệu đã đọc ở Task 1 Step 1.

- [ ] **Step 7: E2E cho trạng thái ready và lỗi**

Thêm vào `e2e/history-map.spec.ts`:
```ts
test('bản đồ tải xong và có canvas WebGL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('lỗi tải dữ liệu hiện nút thử lại và thử lại được', async ({ page }) => {
  await page.route('**/data/cells.topo.json', (r) => r.fulfill({ status: 500, body: 'x' }));
  await page.goto('/');
  const retry = page.getByRole('button', { name: 'Thử lại' });
  await expect(retry).toBeVisible();
  await page.unroute('**/data/cells.topo.json');
  await retry.click();
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
});
```
Run: `yarn e2e --project=desktop` → Expected: PASS cả 3 test.

- [ ] **Step 8: Kiểm tra bằng mắt**

Chạy `yarn dev`, mở `http://localhost:3000/?` bằng Browser pane và chụp màn hình. Kỳ vọng:
- Thấy bán đảo Đông Dương và Hoa Nam nổi khối trên biển đêm.
- Mốc mẫu đầu tiên (`tcn700`) chỉ tô màu vùng đồng bằng Bắc Bộ, phần còn lại màu đá.
- **Không** thấy đường ranh tỉnh hay huyện bên trong vùng cùng màu.
- Có đường biên sáng quanh Văn Lang.

Nếu thấy vệt kẽ hở giữa các ô cùng màu (z-fighting hoặc khe do đơn giản hóa), ghi lại để xử lý ở Task P4 bằng cách thêm `-snap-interval` hoặc giảm đơn giản hóa. Không sửa ở task này.

- [ ] **Step 9: Commit**

```bash
yarn lint && yarn test
git add -A
git commit -m "feat(map): render territories with cell-state shader, sea, lights and load states

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase P2 — Tương tác

### Task 6: Dòng thời gian, đồng bộ URL, bàn phím, tự chạy

**Files:**
- Create: `src/modules/HistoryMap/lib/timeline.ts`, `src/modules/HistoryMap/lib/timeline.test.ts`, `src/modules/HistoryMap/state/useTimelineControls.ts`, `src/modules/HistoryMap/ui/Timeline.tsx`, `src/modules/HistoryMap/ui/EraBand.tsx`
- Modify: `src/modules/HistoryMap/HistoryMap.tsx`, `e2e/history-map.spec.ts`

**Interfaces:**
- Consumes: `snapshotIndex`, `playing` (Task 5); `SNAPSHOTS`, `ERAS`.
- Produces (`timeline.ts`): `snapshotIndexFromParam(param: string | null, snapshots: Snapshot[]): number`, `clampIndex(i: number, len: number): number`, `eraSegments(snapshots: Snapshot[], eras: Era[]): { era: Era; start: number; count: number }[]`.
- Produces (`useTimelineControls.ts`): `useTimelineControls(): void`, hook gắn URL sync, phím ←/→/Space và interval tự chạy (4.000 ms).
- Produces: `<Timeline />` có `data-testid="timeline-current"` chứa `yearLabel` của mốc hiện tại.

- [ ] **Step 1: Viết test timeline (thất bại)**

`src/modules/HistoryMap/lib/timeline.test.ts`:
```ts
import { ERAS } from '@/data/history/eras';
import { describe, expect, it } from 'vitest';
import { SNAPSHOTS } from './testFixtures';
import { clampIndex, eraSegments, snapshotIndexFromParam } from './timeline';

describe('snapshotIndexFromParam', () => {
  it('khớp đúng id', () => {
    expect(snapshotIndexFromParam('s2', SNAPSHOTS)).toBe(1);
  });
  it('null, rỗng hoặc rác → mốc đầu', () => {
    expect(snapshotIndexFromParam(null, SNAPSHOTS)).toBe(0);
    expect(snapshotIndexFromParam('', SNAPSHOTS)).toBe(0);
    expect(snapshotIndexFromParam('abc', SNAPSHOTS)).toBe(0);
  });
  it('số năm → mốc gần nhất có year ≤ năm đó', () => {
    expect(snapshotIndexFromParam('1150', SNAPSHOTS)).toBe(1);
    expect(snapshotIndexFromParam('1200', SNAPSHOTS)).toBe(2);
    expect(snapshotIndexFromParam('9999', SNAPSHOTS)).toBe(2);
  });
  it('năm trước mọi mốc → mốc đầu', () => {
    expect(snapshotIndexFromParam('-99999', SNAPSHOTS)).toBe(0);
  });
});

describe('clampIndex', () => {
  it('kẹp trong [0, len-1]', () => {
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(1, 3)).toBe(1);
  });
});

describe('eraSegments', () => {
  it('gom các mốc liên tiếp cùng thời kỳ', () => {
    const snaps = [
      { ...SNAPSHOTS[0], era: 'tien-su' as const },
      { ...SNAPSHOTS[1], era: 'tien-su' as const },
      { ...SNAPSHOTS[2], era: 'doc-lap' as const }
    ];
    const seg = eraSegments(snaps, ERAS);
    expect(seg.map((s) => [s.era.id, s.start, s.count])).toEqual([['tien-su', 0, 2], ['doc-lap', 2, 1]]);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/timeline` → Expected: FAIL.

- [ ] **Step 2: Cài đặt timeline**

`src/modules/HistoryMap/lib/timeline.ts`:
```ts
import type { Era, Snapshot } from '@/data/history/types';

export function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

export function snapshotIndexFromParam(param: string | null, snapshots: Snapshot[]): number {
  if (!param) return 0;
  const exact = snapshots.findIndex((s) => s.id === param);
  if (exact >= 0) return exact;
  if (!/^-?\d+(\.\d+)?$/.test(param)) return 0;
  const year = Number(param);
  let found = 0;
  snapshots.forEach((s, i) => {
    if (s.year <= year) found = i;
  });
  return found;
}

export function eraSegments(snapshots: Snapshot[], eras: Era[]): { era: Era; start: number; count: number }[] {
  const out: { era: Era; start: number; count: number }[] = [];
  snapshots.forEach((s, i) => {
    const last = out[out.length - 1];
    if (last && last.era.id === s.era) last.count++;
    else {
      const era = eras.find((e) => e.id === s.era);
      if (era) out.push({ era, start: i, count: 1 });
    }
  });
  return out;
}
```
Run: `yarn test src/modules/HistoryMap/lib/timeline` → Expected: PASS.

- [ ] **Step 3: Hook điều khiển**

`src/modules/HistoryMap/state/useTimelineControls.ts`:
```ts
'use client';

import { SNAPSHOTS } from '@/data/history';
import { useSignalEffect } from '@preact/signals-react';
import { useEffect } from 'react';
import { clampIndex, snapshotIndexFromParam } from '../lib/timeline';
import { playing, snapshotIndex } from './store';

const STEP_MS = 4000;

export function useTimelineControls(): void {
  // URL → state (một lần khi mount)
  useEffect(() => {
    snapshotIndex.value = snapshotIndexFromParam(new URLSearchParams(window.location.search).get('y'), SNAPSHOTS);
  }, []);

  // state → URL
  useSignalEffect(() => {
    const id = SNAPSHOTS[snapshotIndex.value]?.id;
    if (!id) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('y') === id) return;
    url.searchParams.set('y', id);
    window.history.replaceState(null, '', url);
  });

  // bàn phím
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        playing.value = false;
        snapshotIndex.value = clampIndex(snapshotIndex.value + (e.key === 'ArrowRight' ? 1 : -1), SNAPSHOTS.length);
      } else if (e.key === ' ' && t?.tagName !== 'BUTTON') {
        e.preventDefault();
        playing.value = !playing.value;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // tự chạy
  useSignalEffect(() => {
    if (!playing.value) return;
    if (snapshotIndex.peek() >= SNAPSHOTS.length - 1) snapshotIndex.value = 0;
    const id = window.setInterval(() => {
      const next = snapshotIndex.peek() + 1;
      if (next >= SNAPSHOTS.length) {
        playing.value = false;
        return;
      }
      snapshotIndex.value = next;
    }, STEP_MS);
    return () => window.clearInterval(id);
  });
}
```

- [ ] **Step 4: UI dòng thời gian**

`src/modules/HistoryMap/ui/EraBand.tsx`:
```tsx
import { ERAS, SNAPSHOTS } from '@/data/history';
import type React from 'react';
import { eraSegments } from '../lib/timeline';

const SEGMENTS = eraSegments(SNAPSHOTS, ERAS);

export default function EraBand({ current }: { current: number }): React.ReactElement {
  return (
    <div className="flex h-5 w-full overflow-hidden rounded-sm text-[10px] leading-5" aria-hidden>
      {SEGMENTS.map((s) => {
        const active = current >= s.start && current < s.start + s.count;
        return (
          <div
            key={`${s.era.id}-${s.start}`}
            style={{ flexGrow: s.count, background: s.era.color, opacity: active ? 1 : 0.45 }}
            className="truncate px-1 text-white/90"
            title={s.era.label}
          >
            {s.era.label}
          </div>
        );
      })}
    </div>
  );
}
```

`src/modules/HistoryMap/ui/Timeline.tsx`:
```tsx
'use client';

import { SNAPSHOTS } from '@/data/history';
import { useSignals } from '@preact/signals-react/runtime';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type React from 'react';
import { COPY } from '../copy';
import { clampIndex } from '../lib/timeline';
import { playing, snapshotIndex } from '../state/store';
import EraBand from './EraBand';

const go = (i: number): void => {
  playing.value = false;
  snapshotIndex.value = clampIndex(i, SNAPSHOTS.length);
};

export default function Timeline(): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const snap = SNAPSHOTS[i];
  const last = SNAPSHOTS.length - 1;
  return (
    <nav
      aria-label={COPY.timelineLabel}
      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a1420] via-[#0a1420]/85 to-transparent px-4 pt-10 pb-4 md:px-10 md:pb-6"
    >
      <div className="mb-2 flex items-end gap-4">
        <p data-testid="timeline-current" className="font-extrabold text-3xl tabular-nums md:text-5xl">
          {snap.yearLabel}
        </p>
        <p className="mb-1 truncate text-sm opacity-80 md:text-base">{snap.title}</p>
        <div className="ml-auto flex gap-1">
          <button type="button" aria-label={COPY.prev} onClick={() => go(i - 1)} disabled={i === 0} className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30">
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={playing.value ? COPY.pause : COPY.play}
            onClick={() => {
              playing.value = !playing.value;
            }}
            className="rounded-full p-2 hover:bg-white/10"
          >
            {playing.value ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button type="button" aria-label={COPY.next} onClick={() => go(i + 1)} disabled={i === last} className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <EraBand current={i} />
      <div className="relative mt-2 h-8">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-[7px]">
          {SNAPSHOTS.map((s, k) => (
            <span key={s.id} className={`h-2 w-2 rounded-full ${k <= i ? 'bg-[#f4e3c1]' : 'bg-white/25'}`} />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={i}
          aria-label={COPY.timelineLabel}
          aria-valuetext={`${snap.yearLabel} — ${snap.title}`}
          onChange={(e) => go(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
    </nav>
  );
}
```
`lucide-react` đã có trong repo.

- [ ] **Step 5: Gắn vào HistoryMap**

Trong `HistoryMap.tsx`:
- Import `useTimelineControls` và `Timeline`.
- Gọi `useTimelineControls();` ở đầu component, trước `useState`.
- Khi `state.status === 'ready'` thì render `<Timeline />` sau `<Scene … />`.
- Trên `<main>`, thêm `onPointerDown={(e) => { if ((e.target as HTMLElement).tagName === 'CANVAS') playing.value = false; }}` (import `playing` từ `./state/store`). Như vậy bấm vào bản đồ sẽ dừng tự chạy.

- [ ] **Step 6: E2E**

Thêm vào `e2e/history-map.spec.ts`:
```ts
import { SNAPSHOTS } from '../src/data/history';

const ready = async (page: import('@playwright/test').Page, q = ''): Promise<void> => {
  await page.goto(`/${q}`);
  await expect(page.getByTestId('history-map-root')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
};

test('?y=1471 mở đúng mốc', async ({ page }) => {
  await ready(page, '?y=1471');
  const snap = SNAPSHOTS.find((s) => s.id === '1471');
  expect(snap).toBeDefined();
  await expect(page.getByTestId('timeline-current')).toHaveText(snap?.yearLabel ?? '');
});

test('?y rác → mốc đầu', async ({ page }) => {
  await ready(page, '?y=abc');
  await expect(page.getByTestId('timeline-current')).toHaveText(SNAPSHOTS[0].yearLabel);
});

test('phím → chuyển mốc và cập nhật URL', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('timeline-current')).toHaveText(SNAPSHOTS[1].yearLabel);
  await expect(page).toHaveURL(new RegExp(`[?&]y=${SNAPSHOTS[1].id}`));
});
```
Chuyển import `SNAPSHOTS` và helper `ready` lên đầu file, rồi dùng `ready` cho các test cũ nếu gọn hơn.

Run: `yarn e2e --project=desktop` → Expected: PASS.

- [ ] **Step 7: Commit**

```bash
yarn lint && yarn test
git add -A
git commit -m "feat(map): timeline with era band, URL sync, keyboard and autoplay

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 7: Tương tác theo lãnh thổ, thẻ thông tin, chi tiết chính thể

**Files:**
- Create: `src/modules/HistoryMap/lib/polities.ts`, `src/modules/HistoryMap/lib/polities.test.ts`, `src/modules/HistoryMap/ui/InfoCard.tsx`, `src/modules/HistoryMap/ui/PolityDetail.tsx`, `src/modules/HistoryMap/ui/SourceList.tsx`, `src/modules/HistoryMap/ui/CellTooltip.tsx`, `src/modules/HistoryMap/ui/FlagThumb.tsx`
- Modify: `src/modules/HistoryMap/HistoryMap.tsx`, `src/modules/HistoryMap/scene/Scene.tsx`, `e2e/history-map.spec.ts`

**Interfaces:**
- Consumes: `CellStateStore.setLiftMask`, `Terrain` props `onHoverCell`/`onClickCell` (Task 5); `effectivePolity`, `lowConfidenceCells` (Task 3); signals `hoveredPolity`, `selectedPolity`, `pointerPos`, `snapshotIndex`.
- Produces (`polities.ts`): `politiesInSnapshot(owners: (string | null)[], cells: CellMeta[]): { id: string; area: number; cellCount: number }[]` (sắp theo diện tích giảm dần, bỏ `null`), `ownerMask(owners: (string | null)[], id: string | null): Uint8Array | null`.
- Produces: `Scene` nhận props `{ data; store; onHoverCell; onClickCell; onMissed }`. `InfoCard` có `data-testid="info-title"`; `PolityDetail` có `data-testid="polity-detail"`.

- [ ] **Step 1: Test (thất bại)**

`src/modules/HistoryMap/lib/polities.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ownerMask, politiesInSnapshot } from './polities';
import { CELLS } from './testFixtures';

describe('politiesInSnapshot', () => {
  it('đếm ô, cộng diện tích, sắp giảm dần, bỏ null', () => {
    const cells = CELLS.map((c, i) => ({ ...c, area: (i + 1) * 10 }));
    const r = politiesInSnapshot(['a', 'a', 'b', null, 'b', 'b'], cells);
    expect(r).toEqual([
      { id: 'b', area: 30 + 50 + 60, cellCount: 3 },
      { id: 'a', area: 10 + 20, cellCount: 2 }
    ]);
  });
});

describe('ownerMask', () => {
  it('đánh dấu mọi ô của chính thể; null → null', () => {
    expect([...(ownerMask(['a', 'b', 'a'], 'a') ?? [])]).toEqual([1, 0, 1]);
    expect(ownerMask(['a'], null)).toBeNull();
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/polities` → Expected: FAIL.

- [ ] **Step 2: Cài đặt**

`src/modules/HistoryMap/lib/polities.ts`:
```ts
import type { CellMeta } from './cells';

export function politiesInSnapshot(
  owners: (string | null)[],
  cells: CellMeta[]
): { id: string; area: number; cellCount: number }[] {
  const acc = new Map<string, { id: string; area: number; cellCount: number }>();
  owners.forEach((o, i) => {
    if (o === null) return;
    const e = acc.get(o) ?? { id: o, area: 0, cellCount: 0 };
    e.area += cells[i].area;
    e.cellCount++;
    acc.set(o, e);
  });
  return [...acc.values()].sort((a, b) => b.area - a.area);
}

export function ownerMask(owners: (string | null)[], id: string | null): Uint8Array | null {
  if (id === null) return null;
  return Uint8Array.from(owners, (o) => (o === id ? 1 : 0));
}
```
Run: `yarn test src/modules/HistoryMap/lib/polities` → Expected: PASS.

- [ ] **Step 3: Các component UI**

`src/modules/HistoryMap/ui/FlagThumb.tsx`:
```tsx
import type { Polity } from '@/data/history/types';
import type React from 'react';
import { useState } from 'react';

export default function FlagThumb({ polity, className = 'h-6 w-9' }: { polity: Polity; className?: string }): React.ReactElement {
  const [broken, setBroken] = useState(false);
  if (broken) return <span className={`${className} inline-block rounded-sm`} style={{ background: polity.color }} />;
  return (
    // biome-ignore lint/performance/noImgElement: SVG cờ nhỏ, không cần next/image
    <img src={polity.flag} alt="" className={`${className} rounded-sm object-cover shadow`} onError={() => setBroken(true)} />
  );
}
```

`src/modules/HistoryMap/ui/SourceList.tsx`:
```tsx
import type { Source } from '@/data/history/types';
import type React from 'react';
import { COPY } from '../copy';

export default function SourceList({ sources }: { sources: Source[] }): React.ReactElement {
  return (
    <div className="mt-4 border-white/10 border-t pt-3 text-xs opacity-75">
      <p className="mb-1 font-semibold uppercase tracking-wider">{COPY.sources}</p>
      <ul className="space-y-1">
        {sources.map((s) => (
          <li key={`${s.title}-${s.url ?? ''}`}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white">
                {s.title}
              </a>
            ) : (
              s.title
            )}
            {s.author && ` — ${s.author}`}
            {s.note && <span className="opacity-70"> ({s.note})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

`src/modules/HistoryMap/ui/InfoCard.tsx`:
```tsx
'use client';

import { GROUPS, POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useMemo } from 'react';
import { COPY } from '../copy';
import type { MapData } from '../lib/loadMapData';
import { politiesInSnapshot } from '../lib/polities';
import { effectivePolity, lowConfidenceCells } from '../lib/resolve';
import { selectedPolity, snapshotIndex } from '../state/store';
import FlagThumb from './FlagThumb';
import SourceList from './SourceList';

export default function InfoCard({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const snap = SNAPSHOTS[i];
  const present = useMemo(() => politiesInSnapshot(data.owners[i], data.cells), [data, i]);
  const hasLow = useMemo(() => lowConfidenceCells(snap, data.cells, GROUPS).size > 0, [snap, data]);
  return (
    <div aria-live="polite">
      <p className="text-xs uppercase tracking-[0.25em] opacity-60">{snap.yearLabel}</p>
      <h2 data-testid="info-title" className="mt-1 font-bold text-xl leading-tight">{snap.title}</h2>
      <p className="mt-2 text-sm leading-relaxed opacity-85">{snap.summary}</p>
      {hasLow && <p className="mt-2 text-xs italic text-amber-200/80">≈ {COPY.lowConfidence}</p>}
      <p className="mt-4 mb-2 font-semibold text-xs uppercase tracking-wider opacity-60">{COPY.polities}</p>
      <ul className="space-y-1">
        {present.map(({ id }) => {
          const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, id);
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  selectedPolity.value = id;
                }}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1 text-left hover:bg-white/10"
              >
                <FlagThumb polity={p} />
                <span className="flex-1">
                  <span className="block text-sm">{p.name}</span>
                  <span className="block text-[11px] opacity-60">
                    {COPY.flagKind[p.flagKind]}
                    {p.capital ? ` · ${COPY.capital}: ${p.capital}` : ''}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <SourceList sources={snap.sources} />
    </div>
  );
}
```

`src/modules/HistoryMap/ui/PolityDetail.tsx`:
```tsx
'use client';

import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { useSignals } from '@preact/signals-react/runtime';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { COPY } from '../copy';
import { effectivePolity } from '../lib/resolve';
import { selectedPolity, snapshotIndex } from '../state/store';
import FlagThumb from './FlagThumb';
import SourceList from './SourceList';

export default function PolityDetail({ id }: { id: string }): React.ReactElement {
  useSignals();
  const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, snapshotIndex.value, id);
  return (
    <div data-testid="polity-detail" aria-live="polite">
      <button
        type="button"
        onClick={() => {
          selectedPolity.value = null;
        }}
        className="mb-3 flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
      >
        <ArrowLeft size={14} /> {COPY.back}
      </button>
      <FlagThumb polity={p} className="h-20 w-32" />
      <p className="mt-3 text-[11px] uppercase tracking-wider opacity-60">{COPY.flagKind[p.flagKind]}</p>
      <h2 className="font-bold text-xl">{p.name}</h2>
      {p.altNames?.length ? <p className="text-xs opacity-60">{p.altNames.join(' · ')}</p> : null}
      <dl className="mt-3 space-y-1 text-sm">
        <div><dt className="inline opacity-60">{COPY.period}: </dt><dd className="inline">{p.period}</dd></div>
        {p.capital && <div><dt className="inline opacity-60">{COPY.capital}: </dt><dd className="inline">{p.capital}</dd></div>}
      </dl>
      <p className="mt-3 font-semibold text-xs uppercase tracking-wider opacity-60">{COPY.flagNote}</p>
      <p className="text-sm leading-relaxed opacity-85">{p.flagNote}</p>
      {p.flagCredit && (
        <p className="mt-1 text-[11px] opacity-60">
          <a href={p.flagCredit.url} target="_blank" rel="noopener noreferrer" className="underline">
            {p.flagCredit.author ?? 'Wikimedia Commons'}
          </a>{' '}
          · {p.flagCredit.license}
        </p>
      )}
      <SourceList sources={p.sources} />
    </div>
  );
}
```

`src/modules/HistoryMap/ui/CellTooltip.tsx`:
```tsx
'use client';

import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { COPY } from '../copy';
import { effectivePolity } from '../lib/resolve';
import { hoveredPolity, pointerPos, snapshotIndex } from '../state/store';
import FlagThumb from './FlagThumb';

export default function CellTooltip(): React.ReactElement | null {
  useSignals();
  const id = hoveredPolity.value;
  const pos = pointerPos.value;
  if (!id || !pos) return null;
  const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, snapshotIndex.value, id);
  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-20 flex items-center gap-2 rounded-md bg-[#0a1420]/90 px-3 py-2 text-sm shadow-lg backdrop-blur"
      style={{ left: pos.x + 14, top: pos.y + 14 }}
    >
      <FlagThumb polity={p} className="h-5 w-8" />
      <span>
        <span className="block font-semibold">{p.name}</span>
        <span className="block text-[11px] opacity-60">{COPY.flagKind[p.flagKind]}</span>
      </span>
    </div>
  );
}
```
Tooltip **không** hiện tên tỉnh hay huyện (ràng buộc "chỉ hiện lãnh thổ").

- [ ] **Step 4: Nối handler trong HistoryMap và Scene**

Sửa `Scene.tsx`:
- Bỏ `useMemo` tạo store.
- Nhận props `{ data, store, onHoverCell, onClickCell, onMissed, children }`.
- Truyền `onHoverCell`/`onClickCell` vào `<Terrain>` và `onPointerMissed={onMissed}` vào `<Canvas>`.

Trong `HistoryMap.tsx`, tách phần ready thành component con `ReadyView({ data })` để hook chỉ chạy khi có dữ liệu:
```tsx
function ReadyView({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const store = useMemo(() => new CellStateStore(data.cells.length), [data]);

  // làm nổi cả lãnh thổ đang hover; tính lại khi đổi mốc
  useSignalEffect(() => {
    const owners = data.owners[snapshotIndex.value];
    const id = hoveredPolity.value ?? selectedPolity.value;
    store.setLiftMask(reducedMotion() ? null : ownerMask(owners, id));
  });

  // Esc bỏ chọn
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') selectedPolity.value = null;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onHoverCell = useCallback(
    (cell: number | null, e: ThreeEvent<PointerEvent>) => {
      const id = cell === null ? null : data.owners[snapshotIndex.peek()][cell];
      if (hoveredPolity.peek() !== id) hoveredPolity.value = id;
      pointerPos.value = id ? { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY } : null;
    },
    [data]
  );
  const onClickCell = useCallback(
    (cell: number) => {
      selectedPolity.value = data.owners[snapshotIndex.peek()][cell];
    },
    [data]
  );
  const onMissed = useCallback(() => {
    selectedPolity.value = null;
  }, []);

  return (
    <>
      <Scene data={data} store={store} onHoverCell={onHoverCell} onClickCell={onClickCell} onMissed={onMissed} />
      <CellTooltip />
      <aside className="absolute top-24 right-4 bottom-40 w-[340px] overflow-y-auto rounded-xl bg-[#0a1420]/80 p-5 shadow-2xl backdrop-blur md:top-8 md:right-8">
        {selectedPolity.value ? <PolityDetail id={selectedPolity.value} /> : <InfoCard data={data} />}
      </aside>
      <Timeline />
    </>
  );
}
```
Thay `{state.status === 'ready' && <Scene data={state.data} />}` và `<Timeline />` (đã thêm ở Task 6) bằng `{state.status === 'ready' && <ReadyView data={state.data} />}`. Bổ sung import: `useSignals`, `useSignalEffect`, `ThreeEvent`, `CellStateStore`, `ownerMask`, các signal, `reducedMotion`, và các component UI. Bố cục mobile (bottom sheet) làm ở Task 10.

Khi đổi mốc, nếu `selectedPolity` không còn tồn tại trong mốc mới thì bỏ chọn. Thêm vào `ReadyView`:
```tsx
useSignalEffect(() => {
  const owners = data.owners[snapshotIndex.value];
  const sel = selectedPolity.peek();
  if (sel && !owners.includes(sel)) selectedPolity.value = null;
});
```

- [ ] **Step 5: E2E**

Thêm vào `e2e/history-map.spec.ts`:
```ts
test('thẻ thông tin đổi theo mốc; mở và đóng chi tiết chính thể', async ({ page }) => {
  await ready(page);
  await expect(page.getByTestId('info-title')).toHaveText(SNAPSHOTS[0].title);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('info-title')).toHaveText(SNAPSHOTS[1].title);
  await page.locator('aside li button').first().click();
  await expect(page.getByTestId('polity-detail')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('info-title')).toBeVisible();
});
```
Run: `yarn e2e --project=desktop` → Expected: PASS.

- [ ] **Step 6: Kiểm tra bằng mắt**

Dùng Browser pane ở `/?y=1471`:
- Rê chuột lên vùng Đại Việt: **toàn bộ** lãnh thổ Đại Việt nổi lên và sáng nhẹ, tooltip hiện cờ và tên. Tooltip không có tên huyện hay tỉnh.
- Bấm vào lãnh thổ: panel chuyển sang chi tiết chính thể.
- Bấm ra biển: panel quay về thẻ thông tin.

Chụp màn hình để lưu lại.

- [ ] **Step 7: Commit**

```bash
yarn lint && yarn test
git add -A
git commit -m "feat(map): polity-level hover/select, info card and polity detail

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 8: Cờ — vị trí neo, vòng đời, cờ vải 3D

**Files:**
- Create: `src/modules/HistoryMap/lib/centroid.ts`, `src/modules/HistoryMap/lib/flagsReconcile.ts`, `src/modules/HistoryMap/lib/flags.test.ts`, `src/modules/HistoryMap/scene/useFlagTexture.ts`, `src/modules/HistoryMap/scene/FlagPole.tsx`, `src/modules/HistoryMap/scene/Flags.tsx`
- Modify: `src/modules/HistoryMap/lib/loadMapData.ts` (thêm `neighbors`), `src/modules/HistoryMap/scene/Scene.tsx`

**Interfaces:**
- Consumes: `MapData` (Task 5), `effectivePolity`, `px`, `pz`, `DEPTH`, `reducedMotion`, `snapshotIndex`.
- Produces (`centroid.ts`): `interface Anchor { cellIndex: number; lon: number; lat: number; area: number; cellCount: number }`, `polityAnchors(cells: CellMeta[], neighbors: number[][], owners: (string | null)[]): Map<string, Anchor>`. `area` và `cellCount` là của **toàn bộ** lãnh thổ; `cellIndex`, `lon` và `lat` là của ô neo nằm trong cụm liền kề lớn nhất.
- Produces (`flagsReconcile.ts`): `interface FlagEntry { id: string; state: 'enter' | 'stay' | 'exit'; anchor: Anchor }`, `reconcileFlags(prev: FlagEntry[], targets: Map<string, Anchor>): FlagEntry[]`, `dropFlag(entries: FlagEntry[], id: string): FlagEntry[]`.
- Produces: `MapData.neighbors: number[][]`.

- [ ] **Step 1: Test (thất bại)**

`src/modules/HistoryMap/lib/flags.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { polityAnchors } from './centroid';
import { dropFlag, reconcileFlags } from './flagsReconcile';
import { CELLS } from './testFixtures';

// 0–1 liền nhau, 2–3 liền nhau, 4 và 5 đứng riêng
const NEI = [[1], [0], [3], [2], [], []];

describe('polityAnchors', () => {
  it('neo vào cụm liền kề có diện tích lớn nhất, ô neo luôn thuộc chính thể', () => {
    const cells = CELLS.map((c, i) => ({ ...c, area: i === 2 ? 500 : 100 }));
    const owners = ['x', 'x', 'x', null, 'y', 'y'];
    const a = polityAnchors(cells, NEI, owners);
    const x = a.get('x');
    expect(x?.cellIndex).toBe(2); // cụm {2} rộng 500 > cụm {0,1} rộng 200
    expect(owners[x?.cellIndex ?? -1]).toBe('x');
    expect(x?.area).toBe(700);
    expect(x?.cellCount).toBe(3);
  });
  it('trong cụm, chọn ô gần tâm diện tích nhất', () => {
    const owners = ['x', 'x', null, null, null, null];
    const a = polityAnchors(CELLS, NEI, owners).get('x');
    expect([0, 1]).toContain(a?.cellIndex);
    expect(a?.lon).toBe(CELLS[a?.cellIndex ?? 0].lon);
  });
  it('bỏ qua ô null', () => {
    expect(polityAnchors(CELLS, NEI, [null, null, null, null, null, null]).size).toBe(0);
  });
});

describe('reconcileFlags', () => {
  const A = { cellIndex: 0, lon: 1, lat: 1, area: 1, cellCount: 1 };
  const B = { ...A, lon: 2 };
  it('mới → enter; còn → stay kèm neo mới; mất → exit', () => {
    const r1 = reconcileFlags([], new Map([['a', A]]));
    expect(r1).toEqual([{ id: 'a', state: 'enter', anchor: A }]);
    const r2 = reconcileFlags(r1, new Map([['a', B], ['b', A]]));
    expect(r2).toEqual([
      { id: 'a', state: 'stay', anchor: B },
      { id: 'b', state: 'enter', anchor: A }
    ]);
    const r3 = reconcileFlags(r2, new Map([['b', A]]));
    expect(r3.find((e) => e.id === 'a')?.state).toBe('exit');
  });
  it('cờ đang exit xuất hiện lại → stay', () => {
    const r = reconcileFlags([{ id: 'a', state: 'exit', anchor: A }], new Map([['a', B]]));
    expect(r).toEqual([{ id: 'a', state: 'stay', anchor: B }]);
  });
  it('dropFlag xóa hẳn', () => {
    expect(dropFlag([{ id: 'a', state: 'exit', anchor: A }], 'a')).toEqual([]);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/flags` → Expected: FAIL.

- [ ] **Step 2: Cài đặt centroid và reconcile**

`src/modules/HistoryMap/lib/centroid.ts`:
```ts
import type { CellMeta } from './cells';

export interface Anchor {
  cellIndex: number;
  lon: number;
  lat: number;
  area: number;
  cellCount: number;
}

export function polityAnchors(cells: CellMeta[], neighbors: number[][], owners: (string | null)[]): Map<string, Anchor> {
  const seen = new Uint8Array(cells.length);
  const best = new Map<string, { comp: number[]; area: number }>();
  const total = new Map<string, { area: number; count: number }>();

  for (let start = 0; start < cells.length; start++) {
    const id = owners[start];
    if (id === null || seen[start]) continue;
    const comp: number[] = [];
    let area = 0;
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop() as number;
      comp.push(i);
      area += cells[i].area;
      for (const j of neighbors[i] ?? []) {
        if (!seen[j] && owners[j] === id) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    const t = total.get(id) ?? { area: 0, count: 0 };
    t.area += area;
    t.count += comp.length;
    total.set(id, t);
    const b = best.get(id);
    if (!b || area > b.area) best.set(id, { comp, area });
  }

  const out = new Map<string, Anchor>();
  for (const [id, { comp, area }] of best) {
    let cx = 0;
    let cy = 0;
    for (const i of comp) {
      cx += cells[i].lon * cells[i].area;
      cy += cells[i].lat * cells[i].area;
    }
    cx /= area || 1;
    cy /= area || 1;
    let pick = comp[0];
    let pd = Number.POSITIVE_INFINITY;
    for (const i of comp) {
      const d = (cells[i].lon - cx) ** 2 + (cells[i].lat - cy) ** 2;
      if (d < pd) {
        pd = d;
        pick = i;
      }
    }
    const t = total.get(id) as { area: number; count: number };
    out.set(id, { cellIndex: pick, lon: cells[pick].lon, lat: cells[pick].lat, area: t.area, cellCount: t.count });
  }
  return out;
}
```

`src/modules/HistoryMap/lib/flagsReconcile.ts`:
```ts
import type { Anchor } from './centroid';

export interface FlagEntry {
  id: string;
  state: 'enter' | 'stay' | 'exit';
  anchor: Anchor;
}

export function reconcileFlags(prev: FlagEntry[], targets: Map<string, Anchor>): FlagEntry[] {
  const out: FlagEntry[] = [];
  const done = new Set<string>();
  for (const e of prev) {
    const t = targets.get(e.id);
    out.push(t ? { id: e.id, state: 'stay', anchor: t } : { ...e, state: 'exit' });
    done.add(e.id);
  }
  for (const [id, anchor] of targets) {
    if (!done.has(id)) out.push({ id, state: 'enter', anchor });
  }
  return out;
}

export function dropFlag(entries: FlagEntry[], id: string): FlagEntry[] {
  return entries.filter((e) => e.id !== id);
}
```
Run: `yarn test src/modules/HistoryMap/lib/flags` → Expected: PASS.

- [ ] **Step 3: Thêm neighbors vào MapData**

Trong `loadMapData.ts`: `import { neighbors } from 'topojson-client';`, thêm trường `neighbors: number[][]` vào `MapData`, và trong object trả về thêm `neighbors: neighbors(topo.objects.cells.geometries as never)`.

- [ ] **Step 4: Texture cờ có fallback**

`src/modules/HistoryMap/scene/useFlagTexture.ts`:
```ts
import { useEffect, useState } from 'react';
import * as THREE from 'three';

/** Trả về texture, hoặc null khi đang tải hay tải lỗi (lúc đó dùng màu trơn). */
export function useFlagTexture(url: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        loaded = t;
        if (alive) setTex(t);
      },
      undefined,
      () => {
        if (alive) setTex(null);
      }
    );
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [url]);
  return tex;
}
```
SVG phải có thuộc tính `width` và `height` thì trình duyệt mới rasterize làm texture được. Task C1 đảm bảo điều này, validator không kiểm tra.

- [ ] **Step 5: FlagPole**

`src/modules/HistoryMap/scene/FlagPole.tsx`:
```tsx
'use client';

import type { Polity } from '@/data/history/types';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { FlagEntry } from '../lib/flagsReconcile';
import { DEPTH, px, pz } from '../lib/projection';
import { reducedMotion } from '../state/store';
import { useFlagTexture } from './useFlagTexture';

const W = 6;
const H = 4;
const POLE = 9;

function clothMaterial(): { mat: THREE.MeshStandardMaterial; uniforms: { uTime: { value: number } } } {
  const uniforms = { uTime: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
float w = (position.x + ${(W / 2).toFixed(1)}) / ${W.toFixed(1)};
transformed.z += sin(position.x * 1.1 - uTime * 3.0) * 0.45 * w;
transformed.y += cos(position.x * 0.7 - uTime * 2.2) * 0.12 * w;`
      );
  };
  return { mat, uniforms };
}

interface Props {
  entry: FlagEntry;
  polity: Polity;
  onGone: (id: string) => void;
}

export default function FlagPole({ entry, polity, onGone }: Props): React.ReactElement {
  const group = useRef<THREE.Group>(null);
  const scale = useRef(entry.state === 'enter' ? 0 : 1);
  const still = useMemo(() => reducedMotion(), []);
  const tex = useFlagTexture(polity.flag);
  const { mat, uniforms } = useMemo(clothMaterial, []);
  const cloth = useMemo(() => new THREE.PlaneGeometry(W, H, 20, 12), []);
  const symbol = polity.flagKind === 'symbol';
  const badge = entry.anchor.cellCount < 3;
  const baseScale = badge ? 0.55 : 1;

  const gone = useRef(false);

  useEffect(() => {
    mat.map = tex;
    mat.color.set(tex ? '#ffffff' : polity.color);
    mat.needsUpdate = true;
  }, [mat, tex, polity.color]);

  useFrame(({ camera, clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const tx = px(entry.anchor.lon);
    const tz = pz(entry.anchor.lat);
    const k = still ? 1 : Math.min(1, dt * 4);
    g.position.x += (tx - g.position.x) * k;
    g.position.z += (tz - g.position.z) * k;
    const target = entry.state === 'exit' ? 0 : 1;
    scale.current += (target - scale.current) * (still ? 1 : Math.min(1, dt * 5));
    g.scale.setScalar(Math.max(0.0001, scale.current * baseScale));
    if (entry.state === 'exit' && scale.current < 0.02 && !gone.current) {
      gone.current = true;
      onGone(entry.id);
    }
    if (entry.state !== 'exit') gone.current = false;
    g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    if (!still) uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group ref={group} position={[px(entry.anchor.lon), DEPTH, pz(entry.anchor.lat)]}>
      <mesh position={[0, (symbol ? 3 : POLE) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, symbol ? 3 : POLE, 8]} />
        <meshStandardMaterial color="#d9c9a3" metalness={0.4} roughness={0.5} />
      </mesh>
      {symbol ? (
        <mesh position={[0, 3 + 2.4, 0]} castShadow>
          <circleGeometry args={[2.4, 48]} />
          <meshStandardMaterial map={tex} color={tex ? '#ffffff' : polity.color} side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
      ) : (
        <mesh geometry={cloth} material={mat} position={[W / 2 + 0.1, POLE - H / 2, 0]} castShadow />
      )}
      <Html center position={[0, -0.2, 0]} distanceFactor={90} style={{ pointerEvents: 'none' }}>
        <span className="whitespace-nowrap rounded bg-[#0a1420]/70 px-2 py-0.5 font-semibold text-[#f4e3c1] text-xs">
          {polity.name}
        </span>
      </Html>
    </group>
  );
}
```
Với biểu tượng (`symbol`), đĩa luôn quay về phía camera nhờ `rotation.y` của group. Đĩa dùng material riêng, không có shader gợn sóng.

- [ ] **Step 6: Flags manager**

`src/modules/HistoryMap/scene/Flags.tsx`:
```tsx
'use client';

import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { useSignals } from '@preact/signals-react/runtime';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { polityAnchors } from '../lib/centroid';
import { type FlagEntry, dropFlag, reconcileFlags } from '../lib/flagsReconcile';
import type { MapData } from '../lib/loadMapData';
import { effectivePolity } from '../lib/resolve';
import { snapshotIndex } from '../state/store';
import FlagPole from './FlagPole';

export default function Flags({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  const anchors = useMemo(() => polityAnchors(data.cells, data.neighbors, data.owners[i]), [data, i]);
  const [entries, setEntries] = useState<FlagEntry[]>([]);
  useEffect(() => setEntries((prev) => reconcileFlags(prev, anchors)), [anchors]);
  const onGone = useCallback((id: string) => setEntries((prev) => dropFlag(prev, id)), []);
  return (
    <>
      {entries.map((e) => (
        <FlagPole key={e.id} entry={e} polity={effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, e.id)} onGone={onGone} />
      ))}
    </>
  );
}
```
Trong `Scene.tsx`, render `<Flags data={data} />` sau `<Borders … />`.

- [ ] **Step 7: Kiểm tra bằng mắt và e2e hồi quy**

Thêm vào `e2e/history-map.spec.ts` (Review Focus #4):
```ts
test('cờ tải lỗi không làm hỏng cảnh', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/flags/**', (r) => r.abort());
  await ready(page, '?y=1471');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('info-title')).toHaveText(SNAPSHOTS[SNAPSHOTS.findIndex((s) => s.id === '1471') + 1].title);
  expect(errors).toEqual([]);
});
```
Chạy `yarn e2e --project=desktop`. Expected: PASS, không có `pageerror`.

Dùng Browser pane:
- Ở `/?y=tcn700`, một cờ cắm giữa đồng bằng Bắc Bộ.
- Nhấn → sang `1471`: cờ Văn Lang hạ xuống. Cờ Đại Việt, Chăm Pa, Chân Lạp, Lan Xang, Minh mọc lên, mỗi cờ nằm **trong** lãnh thổ của mình, không rơi ra biển hay Hoàng Sa.

Chụp màn hình để lưu lại.

- [ ] **Step 8: Commit**

```bash
yarn lint && yarn test
git add -A
git commit -m "feat(map): waving 3D flags anchored in each polity's largest territory

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 9: Camera bay theo mốc và theo chính thể được chọn

**Files:**
- Create: `src/modules/HistoryMap/lib/cameraPose.ts`, `src/modules/HistoryMap/lib/cameraPose.test.ts`
- Modify: `src/modules/HistoryMap/scene/CameraRig.tsx`, `src/modules/HistoryMap/scene/Scene.tsx`

**Interfaces:**
- Consumes: `polityAnchors` (Task 8), `px`, `pz`, `playing`, `selectedPolity`, `snapshotIndex`, `reducedMotion`, `HOME_POS`, `HOME_TARGET`.
- Produces (`cameraPose.ts`): `interface Pose { position: [number, number, number]; target: [number, number, number] }`, `focusPose(lon: number, lat: number, distance: number): Pose`, `distanceForArea(areaKm2: number): number`, với kết quả kẹp trong [50, 180].
- Produces: `<CameraRig data={MapData} />`.

- [ ] **Step 1: Test (thất bại)**

`src/modules/HistoryMap/lib/cameraPose.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { distanceForArea, focusPose } from './cameraPose';
import { px, pz } from './projection';

describe('focusPose', () => {
  it('target nằm tại điểm chiếu, camera ở phía nam và phía trên, đúng khoảng cách', () => {
    const p = focusPose(108, 14, 100);
    expect(p.target).toEqual([px(108), 0, pz(14)]);
    expect(p.position[1]).toBeGreaterThan(0);
    expect(p.position[2]).toBeGreaterThan(p.target[2]);
    const d = Math.hypot(p.position[0] - p.target[0], p.position[1] - p.target[1], p.position[2] - p.target[2]);
    expect(d).toBeCloseTo(100);
  });
});

describe('distanceForArea', () => {
  it('kẹp trong [50, 180] và tăng theo diện tích', () => {
    expect(distanceForArea(10)).toBe(50);
    expect(distanceForArea(10_000_000)).toBe(180);
    expect(distanceForArea(300_000)).toBeGreaterThan(distanceForArea(50_000));
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/cameraPose` → Expected: FAIL.

- [ ] **Step 2: Cài đặt**

`src/modules/HistoryMap/lib/cameraPose.ts`:
```ts
import { px, pz } from './projection';

export interface Pose {
  position: [number, number, number];
  target: [number, number, number];
}

const POLAR = 0.75; // rad tính từ phương thẳng đứng

export function focusPose(lon: number, lat: number, distance: number): Pose {
  const tx = px(lon);
  const tz = pz(lat);
  return {
    target: [tx, 0, tz],
    position: [tx, Math.cos(POLAR) * distance, tz + Math.sin(POLAR) * distance]
  };
}

export function distanceForArea(areaKm2: number): number {
  return Math.max(50, Math.min(180, Math.sqrt(areaKm2) / 4));
}
```
Run: `yarn test src/modules/HistoryMap/lib/cameraPose` → Expected: PASS.

- [ ] **Step 3: CameraRig bay bằng GSAP**

`src/modules/HistoryMap/scene/CameraRig.tsx`:
```tsx
'use client';

import { SNAPSHOTS } from '@/data/history';
import { useSignalEffect } from '@preact/signals-react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type React from 'react';
import { useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type Pose, distanceForArea, focusPose } from '../lib/cameraPose';
import { polityAnchors } from '../lib/centroid';
import type { MapData } from '../lib/loadMapData';
import { playing, reducedMotion, selectedPolity, snapshotIndex } from '../state/store';

export const HOME_POS: [number, number, number] = [10, 130, 120];
export const HOME_TARGET: [number, number, number] = [0, 0, 0];
const HOME: Pose = { position: HOME_POS, target: HOME_TARGET };

export default function CameraRig({ data }: { data: MapData }): React.ReactElement {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const wasSelected = useRef(false);

  const fly = (pose: Pose): void => {
    const c = controls.current;
    if (!c) return;
    tl.current?.kill();
    if (reducedMotion()) {
      camera.position.set(...pose.position);
      c.target.set(...pose.target);
      c.update();
      return;
    }
    tl.current = gsap
      .timeline({ onUpdate: () => c.update() })
      .to(camera.position, { x: pose.position[0], y: pose.position[1], z: pose.position[2], duration: 1.6, ease: 'power2.inOut' }, 0)
      .to(c.target, { x: pose.target[0], y: pose.target[1], z: pose.target[2], duration: 1.6, ease: 'power2.inOut' }, 0);
  };

  // Đang tự chạy thì bay tới focus của mốc (nếu có)
  useSignalEffect(() => {
    const snap = SNAPSHOTS[snapshotIndex.value];
    if (!playing.value || !snap?.focus) return;
    fly(focusPose(snap.focus.lon, snap.focus.lat, snap.focus.distance ?? 110));
  });

  // Chọn chính thể thì bay tới neo; bỏ chọn thì về toàn cảnh
  useSignalEffect(() => {
    const id = selectedPolity.value;
    if (id) {
      const a = polityAnchors(data.cells, data.neighbors, data.owners[snapshotIndex.peek()]).get(id);
      if (a) fly(focusPose(a.lon, a.lat, distanceForArea(a.area)));
      wasSelected.current = true;
    } else if (wasSelected.current) {
      wasSelected.current = false;
      fly(HOME);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={40}
      maxDistance={260}
      minPolarAngle={0.12}
      maxPolarAngle={1.25}
      target={HOME_TARGET}
      onStart={() => tl.current?.kill()}
    />
  );
}
```
Kiểm tra `three-stdlib` đã được cài kèm drei (`ls node_modules/three-stdlib`). Nếu type `OrbitControls` được export từ chỗ khác trong phiên bản drei đang dùng, dùng `React.ElementRef<typeof OrbitControls>` thay thế.

Trong `Scene.tsx`, đổi `<CameraRig />` thành `<CameraRig data={data} />`. Import `HOME_POS` vẫn từ `./CameraRig`.

- [ ] **Step 4: Kiểm tra**

Run: `yarn e2e --project=desktop` → Expected: PASS.

Kiểm tra bằng mắt:
- Bấm ▶ ở mốc `tcn700`: sang `1471`, camera trượt về phía Vijaya (focus của mốc mẫu).
- Bấm một chính thể trong danh sách: camera bay tới lãnh thổ đó.
- Nhấn Esc: camera về toàn cảnh.
- Kéo chuột trong lúc camera đang bay: chuyển động dừng ngay, không giật ngược.

- [ ] **Step 5: Commit**

```bash
yarn lint && yarn test
git add -A
git commit -m "feat(map): camera flies to snapshot focus and selected polity

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 10: Mobile, trang ghi công, gợi ý và khả năng truy cập

**Files:**
- Create: `src/modules/HistoryMap/ui/CreditsDialog.tsx`, `src/modules/HistoryMap/ui/SidePanel.tsx`
- Modify: `src/modules/HistoryMap/HistoryMap.tsx`, `e2e/history-map.spec.ts`

**Interfaces:**
- Consumes: `InfoCard`, `PolityDetail` (Task 7), `POLITIES`, `COPY`.
- Produces: `<SidePanel data />`: trên desktop (≥768px) là panel phải; trên mobile là bottom sheet thu gọn/mở rộng, nằm trên timeline. `<CreditsDialog />`: nút mở `<dialog>` liệt kê nguồn.

- [ ] **Step 1: E2E mobile và ghi công (thất bại)**

Thêm vào `e2e/history-map.spec.ts`:
```ts
test('mobile: bottom sheet mở ra xem thông tin, không cuộn ngang', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'chỉ chạy project mobile');
  await ready(page);
  const toggle = page.getByTestId('sheet-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByTestId('info-title')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('chụp ảnh màn hình tham chiếu', async ({ page }, info) => {
  await ready(page, '?y=1471');
  await page.waitForTimeout(2500); // chờ cờ mọc và chuyển màu xong
  await page.screenshot({ path: `test-results/screens/${info.project.name}-1471.png` });
});

test('mở trang Nguồn & ghi công', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Nguồn & ghi công' }).click();
  await expect(page.getByRole('dialog')).toContainText('geoBoundaries');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});
```
Run: `yarn e2e` → Expected: FAIL (chưa có `sheet-toggle` và nút ghi công).

- [ ] **Step 2: SidePanel**

`src/modules/HistoryMap/ui/SidePanel.tsx`:
```tsx
'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { ChevronUp } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import type { MapData } from '../lib/loadMapData';
import { selectedPolity } from '../state/store';
import InfoCard from './InfoCard';
import PolityDetail from './PolityDetail';

export default function SidePanel({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const [open, setOpen] = useState(false);
  const desktop = useMediaQuery('(min-width: 768px)');
  const sel = selectedPolity.value;
  const body = sel ? <PolityDetail id={sel} /> : <InfoCard data={data} />;
  // Chỉ render MỘT panel để không trùng data-testid trong DOM
  if (desktop) {
    return (
      <aside className="absolute top-8 right-8 bottom-44 w-[340px] overflow-y-auto rounded-xl bg-[#0a1420]/80 p-5 shadow-2xl backdrop-blur">
        {body}
      </aside>
    );
  }
  return (
    <>
      <section className="absolute inset-x-0 bottom-[132px] z-10">
        <button
          type="button"
          data-testid="sheet-toggle"
          aria-expanded={open || !!sel}
          onClick={() => setOpen((o) => !o)}
          className="mx-auto flex items-center gap-1 rounded-t-lg bg-[#0a1420]/90 px-4 py-1 text-xs"
        >
          <ChevronUp size={14} className={open || sel ? 'rotate-180' : ''} /> Thông tin
        </button>
        {(open || sel) && (
          <div className="max-h-[45vh] overflow-y-auto bg-[#0a1420]/95 p-4 backdrop-blur">{body}</div>
        )}
      </section>
    </>
  );
}
```
Trong `ReadyView` (HistoryMap.tsx), thay khối `<aside>…</aside>` của Task 7 bằng `<SidePanel data={data} />`. Chỉ render `<CellTooltip />` khi `window.matchMedia('(pointer: fine)').matches` (tính một lần bằng `useMemo`), vì trên màn hình cảm ứng không có hover.

`useMediaQuery` lấy từ `usehooks-ts`, đã có trong repo. Selector e2e `aside li button` vẫn đúng trên desktop.

- [ ] **Step 3: CreditsDialog**

`src/modules/HistoryMap/ui/CreditsDialog.tsx`:
```tsx
'use client';

import { POLITIES } from '@/data/history';
import type React from 'react';
import { useRef } from 'react';
import { COPY } from '../copy';

export default function CreditsDialog(): React.ReactElement {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="absolute top-6 right-6 z-10 rounded-full bg-[#0a1420]/70 px-3 py-1 text-xs opacity-80 hover:opacity-100 md:top-auto md:right-auto md:bottom-40 md:left-10"
      >
        {COPY.credits}
      </button>
      <dialog
        ref={ref}
        className="m-auto max-h-[80vh] w-[min(640px,92vw)] overflow-y-auto rounded-xl bg-[#0f1c2b] p-6 text-[#e8dcc2] backdrop:bg-black/60"
      >
        <h2 className="mb-3 font-bold text-lg">{COPY.credits}</h2>
        <p className="mb-2 text-sm">
          Ranh giới hành chính:{' '}
          <a className="underline" href="https://www.geoboundaries.org" target="_blank" rel="noopener noreferrer">geoBoundaries</a>{' '}
          (CC BY 3.0 IGO / CC BY 4.0 / PDDL). Lãnh thổ lịch sử được ghép từ ranh giới cấp huyện hiện đại nên chỉ là xấp xỉ.
        </p>
        <p className="mb-4 text-sm">Kỹ thuật dựng bản đồ tham khảo từ dự án vietnam-3d-map (holetex.com).</p>
        <h3 className="mb-2 font-semibold">Cờ và biểu tượng</h3>
        <ul className="space-y-1 text-xs">
          {POLITIES.map((p) => (
            <li key={p.id}>
              <span className="font-semibold">{p.name}</span> — {COPY.flagKind[p.flagKind]}.{' '}
              {p.flagCredit ? (
                <a className="underline" href={p.flagCredit.url} target="_blank" rel="noopener noreferrer">
                  {p.flagCredit.author ?? 'Wikimedia Commons'} · {p.flagCredit.license}
                </a>
              ) : (
                'Biểu tượng tự vẽ cho dự án.'
              )}
            </li>
          ))}
        </ul>
        <form method="dialog" className="mt-4 text-right">
          <button type="submit" className="rounded-full border border-white/30 px-4 py-1 text-sm">{COPY.close}</button>
        </form>
      </dialog>
    </>
  );
}
```
Gắn `<CreditsDialog />` vào `ReadyView`.

- [ ] **Step 4: Gợi ý thao tác**

Trong `ReadyView`, thêm dòng gợi ý chỉ hiện trên desktop:
```tsx
<p className="pointer-events-none absolute bottom-36 left-1/2 hidden -translate-x-1/2 text-xs opacity-50 md:block">{COPY.hint}</p>
```

- [ ] **Step 5: Chạy e2e cả hai project**

Run: `yarn e2e` → Expected: PASS trên cả `desktop` và `mobile`. Test chỉ dành cho mobile được skip trên desktop.

Nếu test `thẻ thông tin đổi theo mốc…` fail trên mobile vì `aside` bị ẩn, thêm `test.skip(isMobile)` cho test đó. Hành vi mobile đã có test riêng.

- [ ] **Step 6: Kiểm tra khả năng truy cập**

Dùng agent `testing-accessibility-auditor` (hoặc tự kiểm tra) trên `/`:
- Tab đi qua được nút prev/play/next, thanh trượt, danh sách chính thể và nút ghi công.
- Thanh trượt đọc được `aria-valuetext`.
- Thêm `outline` rõ ràng khi focus nếu thiếu: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]`.

Sửa các lỗi nghiêm trọng tìm được ngay trong task này.

- [ ] **Step 7: Commit**

```bash
yarn lint && yarn test
git add -A
git commit -m "feat(map): mobile bottom sheet, credits dialog and a11y polish

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase P3 — Nội dung lịch sử (chạy song song với P1–P2 sau khi Task 2 và Task 3 xong)

### Quy ước chung cho mọi task nội dung (C1–C6)

- **Người thực hiện:** agent nghiên cứu (`general-purpose`), có WebSearch và WebFetch. Mỗi khẳng định lịch sử phải có nguồn. Không bịa năm, tên hay ranh giới. Không chắc thì ghi `lowConfidence` và nói rõ trong `summary`.
- **Thứ tự ưu tiên nguồn:**
  1. Đại Việt sử ký toàn thư, Đại Nam thực lục, Đại Nam nhất thống chí, Khâm định Việt sử thông giám cương mục
  2. *Lịch sử Việt Nam* (15 tập, Viện Sử học)
  3. Sách chuyên khảo có tác giả (ví dụ Phan Khoang, *Việt sử xứ Đàng Trong*; Li Tana, *Nguyễn Cochinchina*; Michael Vickery về Chăm Pa và Khmer)
  4. Wikipedia tiếng Việt và tiếng Anh, **chỉ để đối chiếu**, không được là 1 trong 2 nguồn bắt buộc duy nhất của một mốc
- **Giọng văn:** sách giáo khoa, trung lập, không bình luận hay tính từ cảm xúc. `summary` dài 2–4 câu, nói chính thể nào kiểm soát vùng nào và vì sao thay đổi.
- **Tra cứu ô:** dùng `docs/history/cells-reference.md`. Ưu tiên selector cấp tỉnh (`VNM.quang-binh`). Dùng id huyện khi ranh giới lịch sử cắt ngang tỉnh (ví dụ đèo Hải Vân, sông Đà Rằng, Phan Rang). Vùng lịch sử có tên thì khai báo trong `groups.ts` (ví dụ `chau-o`, `chau-ly`, `kauthara`, `panduranga`, `gia-dinh-1698`).
- **Mỗi file thời kỳ tự đứng một mình:** mốc đầu tiên của **mỗi** file `snapshots/0N-*.ts` phải có `'*': null` và gán **đầy đủ** mọi vùng có chủ ở mốc đó. Nhờ vậy các task C2–C5 làm song song được và không phụ thuộc delta của nhau.
- **Hoàng Sa, Trường Sa:** `null` cho tới khi có bằng chứng thực thi chủ quyền (đội Hoàng Sa thời chúa Nguyễn, thế kỷ 17). Từ đó gán cho chính thể Việt đang kiểm soát miền Trung. Mốc `1974` và `1988` ghi rõ trong `summary` là bị chiếm đóng, nhưng **vẫn gán** cho chính thể Việt Nam (theo spec).
- **Chạy sau mỗi thay đổi:** `yarn validate:history && yarn test`. Cả hai phải PASS mới được commit.
- **Kiểm tra bằng mắt:** mở `/?y=<id>` cho từng mốc vừa soạn, kiểm tra lãnh thổ có liền mạch không, có ô nào sai chủ trông lạc lõng không. Chụp 2–3 màn hình tiêu biểu.

### Bảng id các mốc (bắt buộc dùng đúng `id`, `year`, `era`)

| # | id | year | yearLabel | era | File |
|---|---|---|---|---|---|
| 1 | `tcn20000` | -20000 | ~20.000 TCN | tien-su | 01-tien-su |
| 2 | `tcn10000` | -10000 | ~10.000 TCN | tien-su | 01-tien-su |
| 3 | `tcn5000` | -5000 | ~5.000 TCN | tien-su | 01-tien-su |
| 4 | `tcn2000` | -2000 | ~2.000 TCN | tien-su | 01-tien-su |
| 5 | `tcn700` | -700 | ~700 TCN | hong-bang | 02-co-dai |
| 6 | `tcn257` | -257 | 257 TCN | hong-bang | 02-co-dai |
| 7 | `tcn179` | -179 | 179 TCN | bac-thuoc | 02-co-dai |
| 8 | `tcn111` | -111 | 111 TCN | bac-thuoc | 02-co-dai |
| 9 | `40` | 40 | 40 | bac-thuoc | 02-co-dai |
| 10 | `43` | 43 | 43 | bac-thuoc | 02-co-dai |
| 11 | `192` | 192 | 192 | bac-thuoc | 02-co-dai |
| 12 | `544` | 544 | 544 | bac-thuoc | 02-co-dai |
| 13 | `602` | 602 | 602 | bac-thuoc | 02-co-dai |
| 14 | `679` | 679 | 679 | bac-thuoc | 02-co-dai |
| 15 | `802` | 802 | 802 | bac-thuoc | 02-co-dai |
| 16 | `939` | 939 | 939 | doc-lap | 02-co-dai |
| 17 | `968` | 968 | 968 | doc-lap | 03-tu-chu |
| 18 | `980` | 980 | 980 | doc-lap | 03-tu-chu |
| 19 | `1009` | 1009 | 1009 | doc-lap | 03-tu-chu |
| 20 | `1054` | 1054 | 1054 | doc-lap | 03-tu-chu |
| 21 | `1069` | 1069 | 1069 | doc-lap | 03-tu-chu |
| 22 | `1225` | 1225 | 1225 | doc-lap | 03-tu-chu |
| 23 | `1306` | 1306 | 1306 | doc-lap | 03-tu-chu |
| 24 | `1353` | 1353 | 1353 | doc-lap | 03-tu-chu |
| 25 | `1400` | 1400 | 1400–1402 | doc-lap | 03-tu-chu |
| 26 | `1407` | 1407 | 1407 | bac-thuoc | 03-tu-chu |
| 27 | `1428` | 1428 | 1428 | doc-lap | 03-tu-chu |
| 28 | `1471` | 1471 | 1471 | nam-tien | 03-tu-chu |
| 29 | `1527` | 1527 | 1527 | nam-tien | 03-tu-chu |
| 30 | `1533` | 1533 | 1533 | nam-tien | 03-tu-chu |
| 31 | `1558` | 1558 | 1558 | nam-tien | 04-nam-tien |
| 32 | `1592` | 1592 | 1592 | nam-tien | 04-nam-tien |
| 33 | `1611` | 1611 | 1611 | nam-tien | 04-nam-tien |
| 34 | `1627` | 1627 | 1627 | nam-tien | 04-nam-tien |
| 35 | `1653` | 1653 | 1653 | nam-tien | 04-nam-tien |
| 36 | `1697` | 1697 | 1697 | nam-tien | 04-nam-tien |
| 37 | `1698` | 1698 | 1698 | nam-tien | 04-nam-tien |
| 38 | `1708` | 1708 | 1708 | nam-tien | 04-nam-tien |
| 39 | `1732` | 1732 | 1732 | nam-tien | 04-nam-tien |
| 40 | `1757` | 1757 | 1757 | nam-tien | 04-nam-tien |
| 41 | `1778` | 1778 | 1778 | nam-tien | 04-nam-tien |
| 42 | `1788` | 1788 | 1788 | nam-tien | 04-nam-tien |
| 43 | `1802` | 1802 | 1802 | nha-nguyen | 04-nam-tien |
| 44 | `1816` | 1816 | 1816 | nha-nguyen | 04-nam-tien |
| 45 | `1834` | 1834 | 1834 | nha-nguyen | 04-nam-tien |
| 46 | `1841` | 1841 | 1841 | nha-nguyen | 04-nam-tien |
| 47 | `1862` | 1862 | 1862 | phap-thuoc | 05-can-hien-dai |
| 48 | `1867` | 1867 | 1867 | phap-thuoc | 05-can-hien-dai |
| 49 | `1887` | 1887 | 1887 | phap-thuoc | 05-can-hien-dai |
| 50 | `1945-03` | 1945.2 | 3/1945 | phap-thuoc | 05-can-hien-dai |
| 51 | `1945-09` | 1945.7 | 9/1945 | chia-cat | 05-can-hien-dai |
| 52 | `1949` | 1949 | 1949 | chia-cat | 05-can-hien-dai |
| 53 | `1954` | 1954 | 1954 | chia-cat | 05-can-hien-dai |
| 54 | `1955` | 1955 | 1955 | chia-cat | 05-can-hien-dai |
| 55 | `1969` | 1969 | 1969 | chia-cat | 05-can-hien-dai |
| 56 | `1974` | 1974 | 1974 | chia-cat | 05-can-hien-dai |
| 57 | `1975` | 1975 | 30/4/1975 | thong-nhat | 05-can-hien-dai |
| 58 | `1976` | 1976 | 1976 | thong-nhat | 05-can-hien-dai |
| 59 | `2025` | 2025 | 2025 | thong-nhat | 05-can-hien-dai |

Nếu nghiên cứu cho thấy một năm trong bảng sai, **dừng lại và báo** thay vì tự đổi. Người dùng quyết định.

### Mẫu một mốc hoàn chỉnh (định dạng tham khảo)

```ts
{
  id: '1069',
  year: 1069,
  yearLabel: '1069',
  era: 'doc-lap',
  title: 'Nhận ba châu Bố Chính, Địa Lý, Ma Linh',
  summary:
    'Năm 1069, Lý Thánh Tông cùng Lý Thường Kiệt đem quân đánh Chăm Pa, bắt được vua Chế Củ (Rudravarman III). Để được tha, Chế Củ dâng ba châu Bố Chính, Địa Lý và Ma Linh, tương ứng phần lớn Quảng Bình và bắc Quảng Trị ngày nay.',
  assign: { 'group:ba-chau-1069': 'dai-viet' },
  lowConfidence: ['group:ba-chau-1069'],
  focus: { lon: 106.6, lat: 17.3 },
  sources: [
    { title: 'Đại Việt sử ký toàn thư, Bản kỷ, quyển 3 — Lý Thánh Tông' },
    { title: 'Lịch sử Việt Nam, tập 2', author: 'Viện Sử học' }
  ]
}
```

### Task C1: Danh mục chính thể và cờ

**Files:**
- Create: `scripts/flags/svg-size.ts`, `scripts/flags/svg-size.test.ts`, `scripts/flags/fix-svg-size.ts`, `public/flags/*.svg`
- Modify: `src/data/history/polities.ts` (thay toàn bộ), `src/data/history/snapshots/00-sample.ts` (đổi id chính thể theo danh mục mới), `package.json` (script `flags:fix`)

**Interfaces:**
- Produces: `POLITIES` đầy đủ với các id **bắt buộc** dưới đây. Các task C2–C5 chỉ được dùng id có trong danh mục; cần thêm id thì bổ sung vào `polities.ts` trong cùng commit.

| Nhóm | id (tên hiển thị gốc) |
|---|---|
| Tiền sử (`symbol`) | `van-hoa-son-vi`, `van-hoa-hoa-binh`, `van-hoa-bac-son`, `van-hoa-quynh-van`, `van-hoa-phung-nguyen`, `van-hoa-sa-huynh`, `van-hoa-dong-nai`, `van-hoa-dong-son` |
| Việt | `van-lang`, `au-lac`, `hai-ba-trung`, `van-xuan`, `dai-viet` (939–1527, dùng `polityOverrides` cho Ngô → Đinh "Đại Cồ Việt" → Tiền Lê → Lý → "Đại Việt" 1054 → Trần → Hồ "Đại Ngu" → Hậu Lê), `nha-mac`, `mac-cao-bang`, `le-trung-hung` (sau 1600 là Lê–Trịnh, Đàng Ngoài), `dang-trong` (chúa Nguyễn), `ha-tien`, `tay-son`, `nha-nguyen` (Việt Nam 1804, Đại Nam 1838 qua override), `de-quoc-viet-nam`, `vndcch`, `quoc-gia-viet-nam`, `vnch`, `cpcmlt`, `chxhcnvn` |
| Chăm | `lam-ap`, `champa` (override: Hoàn Vương, Chiêm Thành), `panduranga` (Thuận Thành trấn sau 1697) |
| Khmer | `phu-nam`, `chan-lap`, `khmer` (Angkor), `campuchia-hau-angkor`, `vuong-quoc-campuchia`, `campuchia-dan-chu`, `chnd-campuchia` |
| Lào, Thái | `lan-xang`, `luang-prabang`, `vieng-chan`, `champasak`, `vuong-quoc-lao`, `chdcnd-lao`, `xiem` |
| Trung Hoa | `nam-viet` (nhà Triệu), `han`, `dong-ngo`, `nha-tan-jin`, `nam-trieu`, `nha-tuy`, `nha-duong`, `nam-han`, `nha-tong`, `nha-nguyen-mong`, `nha-minh`, `nha-thanh`, `trung-hoa-dan-quoc`, `chnd-trung-hoa` |
| Thuộc địa | `phap` (Đông Dương thuộc Pháp; `flagNote` giải thích việc dùng cờ Pháp cho lãnh thổ thuộc địa và bảo hộ) |

- [ ] **Step 1: Test helper kích thước SVG (thất bại)**

`scripts/flags/svg-size.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ensureSvgSize } from './svg-size';

describe('ensureSvgSize', () => {
  it('thêm width/height từ viewBox, chuẩn hóa chiều rộng 600', () => {
    const out = ensureSvgSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect/></svg>');
    expect(out).toMatch(/<svg[^>]*\swidth="600"/);
    expect(out).toMatch(/<svg[^>]*\sheight="400"/);
  });
  it('giữ nguyên nếu đã có width và height', () => {
    const svg = '<svg width="300" height="200" viewBox="0 0 3 2"></svg>';
    expect(ensureSvgSize(svg)).toBe(svg);
  });
  it('ném lỗi nếu không có viewBox lẫn kích thước', () => {
    expect(() => ensureSvgSize('<svg></svg>')).toThrow();
  });
});
```
Run: `yarn test scripts/flags` → Expected: FAIL.

- [ ] **Step 2: Cài đặt helper và CLI**

`scripts/flags/svg-size.ts`:
```ts
export function ensureSvgSize(svg: string): string {
  const open = svg.match(/<svg\b[^>]*>/);
  if (!open) throw new Error('Không phải SVG');
  const tag = open[0];
  if (/\swidth="/.test(tag) && /\sheight="/.test(tag)) return svg;
  const vb = tag.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (!vb) throw new Error('SVG thiếu cả viewBox lẫn width/height');
  const w = 600;
  const h = Math.round((w * Number(vb[2])) / Number(vb[1]));
  const cleaned = tag.replace(/\s(width|height)="[^"]*"/g, '');
  return svg.replace(tag, cleaned.replace(/^<svg\b/, `<svg width="${w}" height="${h}"`));
}
```

`scripts/flags/fix-svg-size.ts`:
```ts
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
```
Thêm script `"flags:fix": "tsx scripts/flags/fix-svg-size.ts"` vào `package.json`.
Run: `yarn test scripts/flags` → Expected: PASS.

- [ ] **Step 3: Nghiên cứu và tải cờ**

Với mỗi id trong bảng:
1. Tìm lá cờ, cờ hiệu hoặc biểu tượng được dùng phổ biến trong tài liệu học thuật hay trên Wikimedia Commons. Xác định `flagKind`:
   - `national`: quốc kỳ chính thức (từ thế kỷ 19–20)
   - `banner`: cờ hiệu hoặc cờ triều đình có tài liệu gốc ghi nhận
   - `reconstructed`: cờ do người sau phục dựng hoặc suy đoán
   - `symbol`: thời chưa có nhà nước hoặc không có cờ; dùng hiện vật tiêu biểu như rìu đá, mặt trống Đông Sơn, bình gốm Sa Huỳnh
2. Tải SVG:
   ```bash
   curl -sL -o public/flags/<id>.svg "https://commons.wikimedia.org/wiki/Special:FilePath/<Tên_file>.svg"
   ```
   Đọc trang `https://commons.wikimedia.org/wiki/File:<Tên_file>.svg` để lấy tác giả và giấy phép. **Chỉ nhận** Public Domain, CC0, CC BY hoặc CC BY-SA. Không có file SVG phù hợp giấy phép thì tự vẽ SVG đơn giản (màu và ký hiệu) và đặt `flagKind: 'symbol'`, `flagCredit: null`, `flagNote` ghi "Biểu tượng tự thiết kế cho dự án, không phải cờ lịch sử".
3. Viết `flagNote` (1–2 câu): lá cờ này là gì, có bằng chứng lịch sử hay không, vì sao chọn.
4. Chọn `color` (màu lãnh thổ):
   - Phân biệt rõ với chính thể láng giềng **cùng thời** (Đại Việt ≠ Chăm Pa ≠ Chân Lạp ≠ nhà Minh).
   - Các chính thể Việt kế tiếp nhau dùng họ màu đỏ/đỏ cam.
   - Chăm dùng họ xanh ngọc, Khmer họ xanh lam, Lào họ tím, Trung Hoa họ nâu vàng, Pháp xanh xám.
   - Không trùng `#6b6358`.

Chạy `yarn flags:fix` sau khi tải xong.

- [ ] **Step 4: Viết `polities.ts`**

Mỗi phần tử theo type `Polity`, có `period` (ví dụ `'1054–1400'`), `capital` nếu có, và `sources` ≥ 1. Xóa hằng `SAMPLE` và các chính thể mẫu cũ.

Cập nhật `00-sample.ts` để chỉ dùng id mới: `khmer` → `chan-lap`, `minh` → `nha-minh`, `viet-nam` → `chxhcnvn`, `lao` → `chdcnd-lao`, `campuchia` → `vuong-quoc-campuchia`, `trung-quoc` → `chnd-trung-hoa`.

Đổi `src/data/history/index.ts` để các task sau có chỗ cắm dữ liệu:
```ts
import { ERAS } from './eras';
import { GROUPS } from './groups';
import { POLITIES } from './polities';
import { SAMPLE_SNAPSHOTS } from './snapshots/00-sample';
import type { Polity, PolityId, Snapshot } from './types';

/** Các task C2–C5 thêm import file thời kỳ vào mảng này. */
const REAL: Snapshot[] = [];

const realIds = new Set(REAL.map((s) => s.id));
export const SNAPSHOTS: Snapshot[] = [...REAL, ...SAMPLE_SNAPSHOTS.filter((s) => !realIds.has(s.id))].sort(
  (a, b) => a.year - b.year
);
export const POLITY_BY_ID: Map<PolityId, Polity> = new Map(POLITIES.map((p) => [p.id, p]));
export { ERAS, GROUPS, POLITIES };
```
Ghi chú: trong giai đoạn chuyển tiếp, dữ liệu mẫu và dữ liệu thật trộn lẫn. Nhờ quy tắc "mốc đầu mỗi file thật có `'*'`", mỗi file thật tự thiết lập lại toàn bộ trạng thái. Task C6 xóa dữ liệu mẫu.

- [ ] **Step 5: Kiểm tra và commit**

Run: `yarn validate:history && yarn test && yarn e2e --project=desktop` → Expected: PASS.

Mở `/`, bấm lần lượt từng chính thể trong danh sách. Kỳ vọng: cờ hiển thị đúng (không có ô màu trơn do SVG lỗi), nhãn loại cờ đúng.
```bash
git add -A
git commit -m "feat(history): polity catalog with sourced flags and symbols

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task C2: Mốc 1–16 (tiền sử → 939)

**Files:**
- Create: `src/data/history/snapshots/01-tien-su.ts` (export `TIEN_SU: Snapshot[]`), `src/data/history/snapshots/02-co-dai.ts` (export `CO_DAI: Snapshot[]`)
- Modify: `src/data/history/groups.ts` (thêm nhóm), `src/data/history/index.ts` (`REAL = [...TIEN_SU, ...CO_DAI]`)

- [ ] **Step 1: Nghiên cứu phạm vi từng mốc**

Các điểm cần xác định:
- Phạm vi phân bố văn hóa khảo cổ: Sơn Vi, Hòa Bình, Bắc Sơn, Quỳnh Văn, Phùng Nguyên, Sa Huỳnh, Đồng Nai, Đông Sơn.
- Phạm vi Văn Lang và Âu Lạc (các tỉnh đồng bằng và trung du Bắc Bộ, Bắc Trung Bộ).
- Ba quận Giao Chỉ, Cửu Chân, Nhật Nam.
- Lâm Ấp tách khỏi Nhật Nam (192).
- Phù Nam ở hạ lưu Mekong.
- Chân Lạp thay Phù Nam (thế kỷ 6–7).
- Nam Chiếu và Hoa Nam qua các triều.

Mỗi mốc ghi `summary` và 2 nguồn.

- [ ] **Step 2: Viết hai file, khai báo nhóm, cắm vào `index.ts`**

Mốc `tcn20000` và mốc `tcn700` (mốc đầu của mỗi file) phải có `'*': null`. Các văn hóa khảo cổ dùng id `van-hoa-*` (kiểu `symbol`). Ô ngoài vùng phân bố đã biết giữ `null`.

- [ ] **Step 3: Validate, test, xem bằng mắt**

Run: `yarn validate:history && yarn test` → PASS. Mở `/?y=tcn20000` … `/?y=939`, chụp 3 ảnh tiêu biểu: `tcn700`, `tcn111`, `939`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(history): snapshots from prehistory to 939

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task C3: Mốc 17–30 (968 → 1533)

**Files:**
- Create: `src/data/history/snapshots/03-tu-chu.ts` (export `TU_CHU: Snapshot[]`)
- Modify: `groups.ts`, `index.ts` (thêm `...TU_CHU` vào `REAL`)

- [ ] **Step 1: Nghiên cứu**

Các điểm then chốt:
- Mở rộng 1069 (Bố Chính, Địa Lý, Ma Linh)
- 1306 (Châu Ô, Châu Lý: Huyền Trân công chúa)
- 1402 (Thăng Hoa, Tư Nghĩa)
- Minh thuộc 1407–1427
- 1471 (Vijaya thất thủ; ranh giới mới ở khoảng đèo Cù Mông / núi Đá Bia)
- Nhà Mạc 1527
- Nam – Bắc triều 1533 (Lê trung hưng ở Thanh Hóa, Nghệ An)
- Đế quốc Khmer suy yếu sau 1431
- Lan Xang 1353

Dùng `polityOverrides` cho `dai-viet` khi đổi triều hoặc quốc hiệu (tên, cờ, kinh đô).

- [ ] **Step 2: Viết file**

Mốc `968` có `'*': null` và gán đầy đủ. Dùng đúng mẫu mốc `1069` ở trên (có thể dùng nguyên văn). Khai báo `group:ba-chau-1069`, `group:chau-o`, `group:chau-ly`, `group:thang-hoa-tu-nghia`, `group:vijaya-1471` bằng id huyện hoặc tỉnh trong `cells-reference.md`.

- [ ] **Step 3: Validate, test, xem bằng mắt**

Run: `yarn validate:history && yarn test && yarn e2e --project=desktop` → PASS (e2e `?y=1471` giờ dùng dữ liệu thật). Chụp `1069`, `1306`, `1471`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(history): snapshots from 968 to 1533

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task C4: Mốc 31–46 (1558 → 1841)

**Files:**
- Create: `src/data/history/snapshots/04-nam-tien.ts` (export `NAM_TIEN: Snapshot[]`)
- Modify: `groups.ts`, `index.ts`

- [ ] **Step 1: Nghiên cứu**

Các điểm then chốt:
- Thuận Hóa – Quảng Nam dưới Nguyễn Hoàng
- Mạc ở Cao Bằng (1592–1677)
- Phú Yên 1611
- Ranh giới Trịnh – Nguyễn ở sông Gianh (1627–1672)
- Thái Khang, Diên Ninh 1653
- Thuận Thành trấn 1697
- Gia Định 1698
- Hà Tiên 1708 (Mạc Cửu thần phục chúa Nguyễn: **chính thể riêng** `ha-tien`, ghi rõ quan hệ thần phục)
- Long Hồ 1732
- Tầm Phong Long 1757
- Tây Sơn (1778; 1786–1788 chia ba vùng Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ, dùng override hoặc chính thể phụ nếu cần)
- Gia Long 1802
- Hoàng Sa (đội Hoàng Sa, 1816)
- Trấn Tây thành 1834–1841
- Lan Xang phân liệt 1707
- Xiêm can thiệp Campuchia

- [ ] **Step 2: Viết file**

Mốc `1558` có `'*': null` và gán đầy đủ. Từ mốc đội Hoàng Sa được ghi nhận (thế kỷ 17), gán `VNM.hoang-sa` và `VNM.truong-sa` cho `dang-trong`, sau đó cho `nha-nguyen`.

- [ ] **Step 3: Validate, test, xem bằng mắt**

Run: `yarn validate:history && yarn test` → PASS. Chụp `1627`, `1698`, `1757`, `1834`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(history): snapshots from 1558 to 1841

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task C5: Mốc 47–59 (1862 → 2025)

**Files:**
- Create: `src/data/history/snapshots/05-can-hien-dai.ts` (export `CAN_HIEN_DAI: Snapshot[]`)
- Modify: `groups.ts`, `index.ts`

- [ ] **Step 1: Nghiên cứu**

Các điểm then chốt:
- Nam Kỳ: 3 tỉnh miền Đông 1862, toàn bộ 1867
- Bảo hộ Bắc Kỳ và Trung Kỳ 1884; Liên bang Đông Dương 1887, gồm cả Lào và Campuchia
- Đế quốc Việt Nam (3/1945)
- VNDCCH (9/1945)
- Quốc gia Việt Nam 1949
- Genève 1954: vĩ tuyến 17, sông Bến Hải. Dùng id huyện Quảng Trị để cắt đúng
- VNCH 1955
- Chính phủ Cách mạng lâm thời 1969 (vùng kiểm soát rất phân tán, không vẽ chính xác được): **không** tô lãnh thổ riêng, chỉ nêu trong `summary`. Hoặc, nếu có nguồn bản đồ học thuật đáng tin, gán `lowConfidence`. Phải **báo lại** lựa chọn này cho người dùng trong phần tóm tắt của task.
- Hoàng Sa bị chiếm 1974
- 30/4/1975
- CHXHCN Việt Nam 1976
- 2025: địa giới hiện nay
- Lào, Campuchia và Trung Quốc qua cùng giai đoạn: Vương quốc Lào 1953, CHDCND Lào 1975, Campuchia Dân chủ 1975, CHND Campuchia 1979, Trung Hoa Dân quốc 1912, CHND Trung Hoa 1949

Giọng văn trung lập (spec mục 2): nêu chính quyền nào kiểm soát, không đánh giá.

- [ ] **Step 2: Viết file**

Mốc `1862` có `'*': null` và gán đầy đủ.

- [ ] **Step 3: Validate, test, xem bằng mắt**

Run: `yarn validate:history && yarn test && yarn e2e --project=desktop` → PASS. Chụp `1887`, `1954`, `1975`, `2025`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(history): snapshots from 1862 to 2025

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task C6: Bỏ dữ liệu mẫu và xuất bảng duyệt nội dung

**Files:**
- Delete: `src/data/history/snapshots/00-sample.ts`, `public/flags/_sample.svg`
- Modify: `src/data/history/index.ts`
- Create: `scripts/history-review.ts`, `docs/history-review.md` (sinh ra), `package.json` (script `history:review`)

- [ ] **Step 1: Test ràng buộc cuối (thất bại cho tới khi xóa mẫu)**

Thêm vào `src/modules/HistoryMap/lib/validate.test.ts`:
```ts
import { POLITIES as REAL_POLITIES, SNAPSHOTS as REAL_SNAPSHOTS } from '@/data/history';

describe('dữ liệu thật', () => {
  it('đủ 59 mốc theo bảng id, không còn dữ liệu mẫu', () => {
    expect(REAL_SNAPSHOTS).toHaveLength(59);
    expect(REAL_SNAPSHOTS.some((s) => /mẫu/i.test(s.title))).toBe(false);
    expect(REAL_POLITIES.some((p) => p.flag.includes('_sample'))).toBe(false);
  });
});
```
Run: `yarn test src/modules/HistoryMap/lib/validate` → Expected: FAIL (còn mốc mẫu).

- [ ] **Step 2: Xóa mẫu**

```bash
git rm -q src/data/history/snapshots/00-sample.ts public/flags/_sample.svg
```
`index.ts`:
```ts
export const SNAPSHOTS: Snapshot[] = [...TIEN_SU, ...CO_DAI, ...TU_CHU, ...NAM_TIEN, ...CAN_HIEN_DAI];
```
Bỏ import và bỏ logic lọc mẫu. Xóa các nhóm mẫu trong `groups.ts` nếu không còn được dùng (`champa-sau-1471`, `nam-bo`, `dong-bang-bac-bo`).

Run: `yarn validate:history && yarn test` → Expected: PASS.

- [ ] **Step 3: Script xuất bảng duyệt**

`scripts/history-review.ts`:
```ts
import { readFileSync, writeFileSync } from 'node:fs';
import { GROUPS, POLITY_BY_ID, SNAPSHOTS } from '../src/data/history';
import { type CellsTopology, cellsFromTopology } from '../src/modules/HistoryMap/lib/cells';
import { politiesInSnapshot } from '../src/modules/HistoryMap/lib/polities';
import { effectivePolity, lowConfidenceCells, resolveAllSnapshots } from '../src/modules/HistoryMap/lib/resolve';

const topo = JSON.parse(readFileSync('public/data/cells.topo.json', 'utf8')) as CellsTopology;
const cells = cellsFromTopology(topo);
const owners = resolveAllSnapshots(SNAPSHOTS, cells, GROUPS);
const lines = ['# Bảng duyệt nội dung lịch sử', '', `Sinh tự động — ${SNAPSHOTS.length} mốc. Đánh dấu [x] khi đã duyệt.`, ''];
SNAPSHOTS.forEach((s, i) => {
  lines.push(`## [ ] ${s.yearLabel} — ${s.title}  \`?y=${s.id}\``, '', s.summary, '');
  for (const { id, area } of politiesInSnapshot(owners[i], cells)) {
    const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, id);
    lines.push(`- **${p.name}** (${p.flagKind}) — ~${Math.round(area / 1000)} nghìn km²`);
  }
  if (lowConfidenceCells(s, cells, GROUPS).size) lines.push('- ≈ có vùng ranh giới ước đoán');
  lines.push('', `Nguồn: ${s.sources.map((x) => x.title).join('; ')}`, '');
});
writeFileSync('docs/history-review.md', lines.join('\n'));
console.log('✓ docs/history-review.md');
```
Thêm `"history:review": "tsx scripts/history-review.ts"` vào `package.json`. Run: `yarn history:review` → Expected: file có 59 mục.

- [ ] **Step 4: Commit**

```bash
yarn lint && yarn test && yarn e2e
git add -A
git commit -m "chore(history): drop sample data and generate content review sheet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

## Phase P4 — Hoàn thiện

### Task 11: Hiệu năng, kẽ hở hình học, build và tài liệu

**Files:**
- Modify: `src/modules/HistoryMap/scene/Scene.tsx` (bảng đo fps khi có `?perf`), `README.md`
- Có thể sửa: `scripts/geo/build-cells.ts` (tham số đơn giản hóa), `Lights.tsx` (shadow map), tùy kết quả đo

- [ ] **Step 1: Bảng đo fps khi debug**

Trong `Scene.tsx`, thêm `import { Stats } from '@react-three/drei';`, tính `const perf = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('perf');` rồi render `{perf && <Stats />}` trong `<Canvas>`.

- [ ] **Step 2: Đo**

- **Desktop:** `yarn build && yarn start`, mở `/?perf=1&y=1757` và bấm ▶ cho chạy hết một vòng. Ghi lại fps thấp nhất khi đổi mốc và khi xoay camera. **Yêu cầu ≥ 55 fps.**
- **Mobile:** dùng Chrome DevTools MCP (`emulate` CPU throttling 4x, viewport 375×812) hoặc `resize_window` preset mobile trong Browser pane. Ghi lại fps. **Yêu cầu ≥ 30 fps.**
- **Tải trang:** đo thời gian từ lúc mở trang tới `data-status="ready"` trên desktop (Performance trace). **Mục tiêu < 3 giây** trên kết nối nhanh.

- [ ] **Step 3: Tối ưu nếu chưa đạt (theo thứ tự, dừng khi đạt)**

1. Mobile: `shadow-mapSize` 1024, `dpr` [1, 1.25].
2. Giảm đơn giản hóa ở Task 2 xuống `5%` rồi `4%`, chạy lại `yarn geo:build`, sau đó `yarn validate:history`.
3. `CellStateStore.tick`: bỏ qua vòng lặp ghi `data` khi không có ô nào đang animate. Kiểm tra lại test `cellState` vẫn PASS.
4. `Flags`: cờ có `cellCount < 3` thì bỏ nhãn `<Html>`.

Mỗi lần tối ưu: chạy `yarn test && yarn e2e`, đo lại, rồi commit riêng.

- [ ] **Step 4: Kiểm tra kẽ hở giữa các ô**

Xem cận cảnh các vùng biên giới quốc gia (VN–Lào, VN–Campuchia, VN–Trung Quốc), nơi dữ liệu đến từ các bộ khác nhau. Nếu thấy khe sáng hoặc tối giữa hai ô cùng chủ:
- Tăng tham số `snap` trong lệnh mapshaper thành `snap snap-interval=0.002`, rồi dựng lại.
- Hoặc hạ `Sea` xuống `position-y={-0.8}` để khe nhìn xuống biển tối, bớt lộ.

- [ ] **Step 5: README**

Thêm vào đầu `README.md` một mục "Bản đồ lịch sử 3D":
- Chạy `yarn dev`.
- Pipeline dữ liệu: `yarn geo:fetch && yarn geo:build`.
- Kiểm tra dữ liệu: `yarn validate:history`.
- Duyệt nội dung: `yarn history:review`.
- Test: `yarn test`, `yarn e2e`.
- Tham số URL `?y=<id>`, `?perf`.
- Hướng dẫn thêm một mốc mới: sửa file thời kỳ, chạy validate.

- [ ] **Step 6: Xác minh toàn bộ**

Run tuần tự, tất cả phải PASS:
```bash
yarn lint
yarn test
yarn validate:history
yarn build
yarn e2e
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "perf(map): tune rendering budget and document the history map

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 12: Review nhánh và người dùng duyệt nội dung

- [ ] **Step 1:** Dùng skill `superpowers:requesting-code-review` (agent `engineering-code-reviewer`) để review toàn nhánh `feat/history-map` so với `main`. Sửa mọi lỗi mức nghiêm trọng hoặc quan trọng, mỗi lần sửa một commit riêng.
- [ ] **Step 2:** Đưa `docs/history-review.md` cho người dùng duyệt từng mốc. Ghi lại các yêu cầu sửa nội dung, sửa trong file thời kỳ tương ứng, chạy `yarn validate:history && yarn history:review`, rồi commit.
- [ ] **Step 3:** Dùng skill `superpowers:finishing-a-development-branch` để chốt nhánh (merge hoặc PR, tùy người dùng chọn).

---

## Thay đổi thiết kế giữa chừng (2026-09-27): cờ phủ lãnh thổ

Người dùng yêu cầu **hiện lá cờ trên nền lãnh thổ thay vì cắm cột**, chọn **phủ kín giữ tỉ lệ (cover)** và **giữ nhãn tên nhỏ**. Spec mục 4 đã cập nhật. Task 8R dưới đây thay thế phần cột/cờ vải/đĩa biểu tượng của Task 8. Giữ nguyên `centroid.ts`, `flagsReconcile.ts`, và các helper nhãn `labelSprite.ts`, `labelOverlap.ts` (từ Task 8 fix round 2). Task 9 vẫn dùng `polityAnchors` như cũ.

### Task 8R: Cờ phủ lãnh thổ bằng atlas trong shader, nhãn tên nhỏ

**Files:**
- Create: `src/modules/HistoryMap/lib/flagCover.ts`, `src/modules/HistoryMap/lib/flagCover.test.ts`, `src/modules/HistoryMap/lib/flagAtlas.ts` (client-only), `src/modules/HistoryMap/scene/Labels.tsx`
- Modify: `src/modules/HistoryMap/lib/centroid.ts` (+ test: thêm bbox), `src/modules/HistoryMap/lib/cellState.ts` (+ test: owner slots), `src/modules/HistoryMap/scene/Terrain.tsx` (shader), `src/modules/HistoryMap/scene/Scene.tsx` (`<Flags>` → `<Labels>`)
- Delete: `src/modules/HistoryMap/scene/FlagPole.tsx`, `src/modules/HistoryMap/scene/Flags.tsx`, `src/modules/HistoryMap/scene/useFlagTexture.ts` (sprite nhãn chuyển sang `Labels.tsx`)

**Interfaces:**
- Consumes: `polityAnchors`, `reconcileFlags`/`dropFlag`, `labelSpriteScale`, `resolveLabelOverlaps` (Task 8), `CellStateStore` (Task 5), `POLITIES`, `effectivePolity`, `snapshotIndex`, `reducedMotion`.
- Produces (`centroid.ts`): `Anchor` thêm `bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number }` (khung bao của **cụm liền kề lớn nhất**).
- Produces (`flagCover.ts`, thuần):
  - `coverRect(bbox, aspect): { cx: number; cz: number; w: number; h: number }` (tọa độ world). `bw = px(maxLon) - px(minLon)`, `bh = pz(minLat) - pz(maxLat)`, `h = max(bh, bw / aspect)`, `w = h * aspect`, tâm ở tâm bbox.
  - `atlasLayout(count, cols = 8, slotW = 256, slotH = 171, pad = 4): { width; height; rect(i): { u0; v0; u1; v1 } }`: uv đã trừ lề `pad` và tính theo `flipY` (hàng 0 ở trên cùng ảnh ⇒ v gần 1).
  - `polityParamsData(polityIds: string[], anchors: Map<string, Anchor>, aspects: number[], prev?: Float32Array): Float32Array`: RGBA float, rộng P, cao 2. Hàng 0 là rect atlas `(u0, v0, u1, v1)`, hàng 1 là cover `(cx, cz, w, h)`. Chính thể vắng mặt ở mốc này thì giữ giá trị `prev` (để ô đang mờ dần của chủ cũ vẫn đúng chỗ).
- Produces (`cellState.ts`): `CellStateStore.setOwnerSlots(slots: Float32Array, opts?: { animate?: boolean; delays?: Float32Array }): void` và `readonly ownerData: Float32Array` (RGBA mỗi ô: `fromSlot, toSlot, blend 0..1, 0`; slot = chỉ số trong `POLITIES`, `-1` = null). `tick()` cập nhật `blend` với cùng `ease`, `TRANSITION_S` và delay.
- Produces (`flagAtlas.ts`): `loadFlagAtlas(polities: Polity[]): Promise<{ texture: THREE.CanvasTexture; aspects: number[] }>`. Vẽ từng cờ (SVG/PNG) vào ô 256×171, co giãn khít ô. `aspects[i]` = tỉ lệ gốc w/h của ảnh. Ảnh lỗi thì tô ô bằng `polity.color` và aspect = 1.5. `texture.colorSpace = SRGBColorSpace`, bật mipmap, `anisotropy = 8`.

- [ ] **Step 1: Test thuần (thất bại)**

`src/modules/HistoryMap/lib/flagCover.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { atlasLayout, coverRect, polityParamsData } from './flagCover';
import { px, pz } from './projection';

describe('coverRect', () => {
  it('lãnh thổ cao hẹp: chiều cao cờ = chiều cao lãnh thổ, rộng theo tỉ lệ, tâm ở tâm bbox', () => {
    const r = coverRect({ minLon: 105, maxLon: 106, minLat: 10, maxLat: 20 }, 1.5);
    const bh = pz(10) - pz(20);
    expect(r.h).toBeCloseTo(bh);
    expect(r.w).toBeCloseTo(bh * 1.5);
    expect(r.cx).toBeCloseTo((px(105) + px(106)) / 2);
    expect(r.cz).toBeCloseTo((pz(10) + pz(20)) / 2);
  });
  it('lãnh thổ rộng dẹt: chiều rộng cờ phủ hết chiều rộng', () => {
    const r = coverRect({ minLon: 100, maxLon: 110, minLat: 15, maxLat: 16 }, 1.5);
    expect(r.w).toBeCloseTo(px(110) - px(100));
    expect(r.h).toBeCloseTo(r.w / 1.5);
  });
});

describe('atlasLayout', () => {
  it('đủ ô, uv trong [0,1], hàng 0 ở trên (v cao), có lề', () => {
    const a = atlasLayout(10, 8);
    expect(a.width).toBe(8 * 256);
    expect(a.height).toBe(2 * 171);
    const r0 = a.rect(0);
    const r8 = a.rect(8);
    expect(r0.v1).toBeGreaterThan(r8.v1);
    expect(r0.u0).toBeCloseTo(4 / a.width);
    expect(r0.u1).toBeCloseTo((256 - 4) / a.width);
    for (const r of [r0, r8]) for (const v of [r.u0, r.u1, r.v0, r.v1]) expect(v).toBeGreaterThanOrEqual(0);
  });
});

describe('polityParamsData', () => {
  const anchor = { cellIndex: 0, lon: 105.5, lat: 15, area: 1, cellCount: 1, bbox: { minLon: 105, maxLon: 106, minLat: 10, maxLat: 20 } };
  it('ghi rect atlas ở hàng 0 và cover ở hàng 1; chính thể vắng giữ giá trị cũ', () => {
    const d1 = polityParamsData(['a', 'b'], new Map([['a', anchor], ['b', anchor]]), [1.5, 1.5]);
    expect(d1.length).toBe(2 * 2 * 4);
    const bRow1 = d1.slice((2 + 1) * 4, (2 + 1) * 4 + 4);
    const d2 = polityParamsData(['a', 'b'], new Map([['a', anchor]]), [1.5, 1.5], d1);
    expect([...d2.slice((2 + 1) * 4, (2 + 1) * 4 + 4)]).toEqual([...bRow1]);
  });
});
```
Thêm vào `cellState.test.ts`:
```ts
describe('CellStateStore owner slots', () => {
  it('không animate: from = to = slot mới, blend = 1', () => {
    const s = new CellStateStore(2);
    s.setOwnerSlots(new Float32Array([3, -1]));
    s.tick(0);
    expect([...s.ownerData.slice(0, 8)]).toEqual([3, 3, 1, 0, -1, -1, 1, 0]);
  });
  it('animate: from = slot cũ, to = slot mới, blend đi từ 0 → 1 (tôn trọng delay)', () => {
    const s = new CellStateStore(1);
    s.setOwnerSlots(new Float32Array([2]));
    s.tick(0);
    s.setOwnerSlots(new Float32Array([5]), { animate: true, delays: new Float32Array([0.2]) });
    s.tick(0.1);
    expect(s.ownerData[0]).toBe(2);
    expect(s.ownerData[1]).toBe(5);
    expect(s.ownerData[2]).toBe(0);
    s.tick(TRANSITION_S / 2 + 0.1);
    expect(s.ownerData[2]).toBeGreaterThan(0);
    expect(s.ownerData[2]).toBeLessThan(1);
    s.tick(TRANSITION_S);
    expect(s.ownerData[2]).toBe(1);
  });
  it('slot không đổi thì không chạy blend', () => {
    const s = new CellStateStore(1);
    s.setOwnerSlots(new Float32Array([4]));
    s.tick(0);
    s.setOwnerSlots(new Float32Array([4]), { animate: true });
    s.tick(0.1);
    expect(s.ownerData[2]).toBe(1);
  });
});
```
Thêm vào `flags.test.ts` (centroid): trong test "neo vào cụm liền kề có diện tích lớn nhất", assert `x?.bbox` đúng bằng lon/lat của ô 2 (`minLon = maxLon = CELLS[2].lon`, tương tự cho lat).

Run: `yarn test src/modules/HistoryMap/lib` → Expected: FAIL (module/method chưa có).

- [ ] **Step 2: Cài đặt `flagCover.ts`, `bbox` trong `centroid.ts`, `setOwnerSlots` trong `cellState.ts`**

`src/modules/HistoryMap/lib/flagCover.ts`:
```ts
import type { Anchor } from './centroid';
import { px, pz } from './projection';

export type Bbox = Anchor['bbox'];

export function coverRect(bbox: Bbox, aspect: number): { cx: number; cz: number; w: number; h: number } {
  const x0 = px(bbox.minLon);
  const x1 = px(bbox.maxLon);
  const z0 = pz(bbox.maxLat); // bắc = z nhỏ
  const z1 = pz(bbox.minLat);
  const bw = Math.max(1e-3, x1 - x0);
  const bh = Math.max(1e-3, z1 - z0);
  const h = Math.max(bh, bw / aspect);
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: h * aspect, h };
}

export function atlasLayout(count: number, cols = 8, slotW = 256, slotH = 171, pad = 4) {
  const rows = Math.max(1, Math.ceil(count / cols));
  const width = cols * slotW;
  const height = rows * slotH;
  return {
    width,
    height,
    slotW,
    slotH,
    cols,
    rect(i: number): { u0: number; v0: number; u1: number; v1: number } {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        u0: (c * slotW + pad) / width,
        u1: ((c + 1) * slotW - pad) / width,
        v1: 1 - (r * slotH + pad) / height,
        v0: 1 - ((r + 1) * slotH - pad) / height
      };
    }
  };
}

export function polityParamsData(
  polityIds: string[],
  anchors: Map<string, Anchor>,
  aspects: number[],
  prev?: Float32Array
): Float32Array {
  const P = polityIds.length;
  const out = prev ? Float32Array.from(prev) : new Float32Array(P * 2 * 4);
  const layout = atlasLayout(P);
  polityIds.forEach((id, i) => {
    const r = layout.rect(i);
    out.set([r.u0, r.v0, r.u1, r.v1], i * 4);
    const a = anchors.get(id);
    if (!a) return; // vắng mặt: giữ giá trị cũ
    const c = coverRect(a.bbox, aspects[i] ?? 1.5);
    out.set([c.cx, c.cz, c.w, c.h], (P + i) * 4);
  });
  return out;
}
```
`centroid.ts`: trong vòng lặp chọn ô neo của cụm lớn nhất, tính thêm `bbox` từ lon/lat các ô trong `comp` và gán vào `Anchor`.

`cellState.ts`: thêm các mảng `slotFrom`, `slotTo`, `slotElapsed`, `slotDelay` (Float32Array theo số ô, `slotElapsed` khởi tạo `+Infinity`) và `ownerData = new Float32Array(width * height * 4)`.
- `setOwnerSlots(slots, opts)`: với mỗi ô, nếu `opts.animate` và slot mới khác `slotTo` thì `slotFrom = slotTo`, `slotElapsed = 0`, `slotDelay = delays?.[i] ?? 0`. Ngược lại thì `slotFrom = slotTo = slot mới` và `slotElapsed = Infinity`. Luôn gán `slotTo = slot mới` và đánh dấu dirty.
- Trong `tick`: cộng `dt` vào `slotElapsed` giống màu, rồi ghi `ownerData[i*4..] = [slotFrom, slotTo, blend, 0]` với `blend = ease(clamp((elapsed - delay) / TRANSITION_S))` (Infinity ⇒ 1), và giữ `active = true` khi còn ô đang blend.

Run: `yarn test src/modules/HistoryMap/lib` → Expected: PASS (bao gồm mọi test cũ).

- [ ] **Step 3: `flagAtlas.ts`**

```ts
'use client';

import type { Polity } from '@/data/history/types';
import * as THREE from 'three';
import { atlasLayout } from './flagCover';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

export async function loadFlagAtlas(polities: Polity[]): Promise<{ texture: THREE.CanvasTexture; aspects: number[] }> {
  const layout = atlasLayout(polities.length);
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const aspects = await Promise.all(
    polities.map(async (p, i) => {
      const x = (i % layout.cols) * layout.slotW;
      const y = Math.floor(i / layout.cols) * layout.slotH;
      try {
        const img = await loadImage(p.flag);
        g.drawImage(img, x, y, layout.slotW, layout.slotH);
        return (img.naturalWidth || 3) / (img.naturalHeight || 2);
      } catch {
        g.fillStyle = p.color;
        g.fillRect(x, y, layout.slotW, layout.slotH);
        return 1.5;
      }
    })
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { texture, aspects };
}
```
Chỉ số slot của chính thể = chỉ số trong mảng `POLITIES`. Override cờ theo triều đại (`polityOverrides.flag`) **không** vào atlas. Cờ trên đất luôn là cờ gốc của `Polity`, còn thẻ thông tin vẫn hiện cờ override. Ghi rõ giới hạn này trong report. Task C1 sẽ tách các triều đại cần cờ khác nhau thành id riêng nếu cần.

- [ ] **Step 4: Shader trong `Terrain.tsx`**

Thêm uniforms: `uCellOwner` (DataTexture float RGBA từ `store.ownerData`, cùng kích thước `uCellTexSize`), `uPolity` (DataTexture float RGBA, rộng P, cao 2, từ `polityParamsData`), `uPolityCount`, `uFlagAtlas` (CanvasTexture, hoặc texture 1×1 trắng khi chưa tải), `uAtlasReady` (0/1), `uNullColor` (linear của `#6b6358`).

Vertex (bổ sung sau phần hiện có):
```glsl
varying vec4 vOwner;   // from, to, blend
varying vec2 vWorldXZ;
varying float vTop;
...
vOwner = texture2D(uCellOwner, cuv);
vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;
vTop = (aWallRole < 0.5 && normal.y > 0.5) ? 1.0 : 0.0;
```
Fragment:
```glsl
uniform sampler2D uPolity; uniform float uPolityCount; uniform sampler2D uFlagAtlas;
uniform float uAtlasReady; uniform vec3 uNullColor;
varying vec4 vOwner; varying vec2 vWorldXZ; varying float vTop;
vec3 flagColor(float slot) {
  if (slot < -0.5) return uNullColor;
  float u = (slot + 0.5) / uPolityCount;
  vec4 rect = texture2D(uPolity, vec2(u, 0.25));
  vec4 cov = texture2D(uPolity, vec2(u, 0.75));
  vec2 fuv = vec2((vWorldXZ.x - cov.x) / cov.z + 0.5, 0.5 + (cov.y - vWorldXZ.y) / cov.w);
  fuv = clamp(fuv, 0.0, 1.0);
  return texture2D(uFlagAtlas, mix(rect.xy, rect.zw, fuv)).rgb;
}
```
Thay dòng `diffuseColor` đang có bằng:
```glsl
vec3 wallCol = vCellColor * mix(1.0, 0.55, vSide);
vec3 topCol = mix(flagColor(vOwner.x), flagColor(vOwner.y), vOwner.z);
vec3 base = (vTop > 0.5 && uAtlasReady > 0.5) ? topCol : wallCol;
vec4 diffuseColor = vec4( base * (1.0 + vLift * 0.3), opacity );
```
Tất cả DataTexture dùng `NearestFilter`. `uPolity` đọc tại `v = 0.25` / `0.75` vì cao 2 texel.

Luồng dữ liệu trong `Terrain`:
- `slotOf = new Map(POLITIES.map((p, i) => [p.id, i]))`.
- Trong `useSignalEffect` hiện có: ngoài `setColors`, gọi `store.setOwnerSlots(Float32Array.from(owners, (o) => (o === null ? -1 : slotOf.get(o) ?? -1)), { animate, delays })`.
- Cập nhật `uPolity` bằng `polityParamsData(POLITIES.map(p => p.id), polityAnchors(data.cells, data.neighbors, owners), aspects, prevParams)`.
- `useFrame`: nếu `store.tick()` thì đánh dấu `needsUpdate` cho **cả hai** DataTexture ô.
- Tải atlas một lần: `useEffect(() => { loadFlagAtlas(POLITIES).then(...) }, [])`. Khi xong thì gán uniform, `uAtlasReady = 1`, và dispose khi unmount.
- Dispose mọi DataTexture mới khi unmount (giống pattern đang có).
- `reducedMotion` ⇒ `animate = false` (sẵn có).

- [ ] **Step 5: `Labels.tsx` thay cho `Flags.tsx`/`FlagPole.tsx`**

Chuyển phần nhãn sprite của `FlagPole.tsx` (canvas texture, `useFontsReady`, `labelSpriteScale`, `sizeAttenuation={false}`, `depthTest={false}`, `renderOrder`) sang component `Label` đặt tại `(px(anchor.lon), DEPTH + 0.05, pz(anchor.lat))`, sprite `center` ở giữa. Giữ vòng đời enter/stay/exit bằng `reconcileFlags` (opacity 0 → 1 và 1 → 0, không scale), và luật ẩn chồng nhau bằng `resolveLabelOverlaps` (ưu tiên theo `anchor.area`). Xóa `FlagPole.tsx`, `Flags.tsx`, `useFlagTexture.ts`. Trong `Scene.tsx` thay `<Flags data={data} />` bằng `<Labels data={data} />`.

- [ ] **Step 6: E2E và kiểm tra bằng mắt**

- E2E hiện có phải PASS, đặc biệt test `cờ tải lỗi không làm hỏng cảnh`: atlas phải rơi về màu trơn.
- Chụp Playwright ở `/?y=tcn700`, `/?y=1471`, `/?y=2025` (sau ~3 giây) → `task-8r-*.png` trong workspace, rồi Read ảnh. Kỳ vọng:
  - Mỗi lãnh thổ phủ lá cờ/biểu tượng của mình, cờ không méo, tâm cờ ở giữa cụm lãnh thổ chính.
  - Không lộ ranh giới huyện.
  - Tường bên là màu chủ đạo, tối hơn.
  - Nhãn tên cao khoảng 22px, không chồng nhau.
- Chụp thêm một ảnh **trong lúc** chuyển mốc (khoảng 0,4 giây sau khi nhấn →) để thấy cờ cũ chuyển dần sang cờ mới.
- Vì dữ liệu mẫu dùng chung `_sample.svg` cho mọi chính thể, **tạm thời** (không commit) đổi `flag` của 2–3 chính thể mẫu sang các SVG khác nhau để thấy rõ từng cờ. Có thể tự vẽ SVG màu vào thư mục tạm trong workspace rồi phục vụ qua `public/` tạm thời, nhớ gỡ trước khi commit.

- [ ] **Step 7: Commit**

```bash
npx tsc --noEmit && yarn test && yarn lint:fix
git add -A
git commit -m "feat(map): drape polity flags over territories via shader atlas; small name labels

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
