import type { MultiLineString, MultiPolygon, Polygon, Position } from 'geojson';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { feature, mesh } from 'topojson-client';
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

/**
 * Chỉ giữ lại mặt trên/đáy (|normal.y| > 0.5) của một ExtrudeGeometry đã dựng cho MỘT ô,
 * loại bỏ toàn bộ vách bên quanh chu vi của nó. Ta build vách riêng (xem `buildCoastalWalls`)
 * chỉ cho cạnh nằm trên đường bờ thật, để tránh mỗi cạnh nội bộ giữa hai ô liền kề bị
 * dựng vách hai lần (một lần từ mỗi ô) — nguồn gốc của mạng lưới khe/vệt tối dày đặc
 * theo ranh giới từng ô (huyện) trên toàn bộ khối đất, kể cả trong vùng cùng màu.
 */
function extractCaps(extruded: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos = extruded.getAttribute('position') as THREE.BufferAttribute;
  const triCount = pos.count / 3;
  const out: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    a.fromBufferAttribute(pos, t * 3);
    b.fromBufferAttribute(pos, t * 3 + 1);
    c.fromBufferAttribute(pos, t * 3 + 2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    n.crossVectors(ab, ac);
    const len = n.length();
    if (len < 1e-12) continue; // tam giác suy biến
    if (Math.abs(n.y / len) <= 0.5) continue; // vách bên (normal gần ngang) — bỏ
    out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(out), 3));
  return geo;
}

function edgeKey(p: Position, q: Position): string {
  const r = (v: number) => v.toFixed(7);
  const a = `${r(p[0])},${r(p[1])}`;
  const b = `${r(q[0])},${r(q[1])}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Tập cạnh (theo tọa độ lon/lat) nằm trên đường bờ — biên ngoài của toàn khối đất. */
function coastalEdgeKeys(topo: CellsTopology): Set<string> {
  const coastMesh = mesh(topo, topo.objects.cells, (a, b) => a === b) as MultiLineString;
  const keys = new Set<string>();
  for (const line of coastMesh.coordinates) {
    for (let i = 1; i < line.length; i++) keys.add(edgeKey(line[i - 1], line[i]));
  }
  return keys;
}

/** +1 nếu ring ngược chiều kim đồng hồ (CCW) trong mặt phẳng thế giới (x, z); ngược lại -1. */
function ringOrientation(ring: Position[]): 1 | -1 {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon0, lat0] = ring[i];
    const [lon1, lat1] = ring[i + 1];
    sum += px(lon0) * pz(lat1) - px(lon1) * pz(lat0);
  }
  return sum > 0 ? 1 : -1;
}

/** Dựng vách (quad = 2 tam giác) chỉ cho các cạnh của `rings` nằm trong `keys` (đường bờ). */
function buildCoastalWalls(rings: Position[][], keys: Set<string>): THREE.BufferGeometry | null {
  const out: number[] = [];
  for (const ring of rings) {
    if (ring.length < 4) continue;
    const sign = ringOrientation(ring);
    for (let i = 1; i < ring.length; i++) {
      const p = ring[i - 1];
      const q = ring[i];
      if (!keys.has(edgeKey(p, q))) continue;
      const x0 = px(p[0]);
      const z0 = pz(p[1]);
      const x1 = px(q[0]);
      const z1 = pz(q[1]);
      const A = [x0, 0, z0];
      const B = [x1, 0, z1];
      const C = [x1, DEPTH, z1];
      const D = [x0, DEPTH, z0];
      // Thứ tự đỉnh sao cho normal (quy tắc bàn tay phải) hướng ra ngoài khối đất — suy ra
      // từ chiều quay đo được của ring (xem test "vách đường bờ hướng ra ngoài").
      const tris =
        sign > 0
          ? [
              [A, C, B],
              [A, D, C]
            ]
          : [
              [A, B, C],
              [A, C, D]
            ];
      for (const tri of tris) for (const v of tri) out.push(...v);
    }
  }
  if (out.length === 0) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(out), 3));
  return geo;
}

/**
 * Gắn aCell/aCellB/aWallRole=0 (mặt trên/đáy hoặc vách đường bờ — không đổi hành vi so với
 * trước) lên MỘT phần hình học của một ô, và tính normal nếu chưa có (caps/vách đường bờ
 * không suy biến lúc nghỉ nên computeVertexNormals cho kết quả đúng, phẳng theo từng tam giác).
 */
function tagOwnCellPart(geo: THREE.BufferGeometry, cellIndex: number): THREE.BufferGeometry {
  if (!geo.getAttribute('normal')) geo.computeVertexNormals();
  const n = geo.getAttribute('position').count;
  geo.setAttribute('aCell', new THREE.BufferAttribute(new Float32Array(n).fill(cellIndex), 1));
  geo.setAttribute('aCellB', new THREE.BufferAttribute(new Float32Array(n).fill(cellIndex), 1));
  geo.setAttribute('aWallRole', new THREE.BufferAttribute(new Float32Array(n), 1)); // 0
  return geo;
}

/**
 * Dựng ĐÚNG MỘT vách (quad = 2 tam giác) cho cạnh nội bộ dùng chung giữa `cellA` và `cellB`.
 * Bốn đỉnh đều nằm ở y = DEPTH lúc nghỉ (chiều cao 0 ⇒ vô hình, không thể z-fight với gì cả).
 * Vertex shader (Terrain.tsx, xem `internalWallLift`/`internalWallColorIsA` trong cellState.ts)
 * nâng đỉnh vai trò 1 (mép trên) lên DEPTH + max(liftA,liftB)·uLiftMax và vai trò 2 (mép dưới)
 * lên DEPTH + min(liftA,liftB)·uLiftMax — khi hai bên cùng độ nổi (lúc nghỉ, hoặc khi cả lãnh
 * thổ được nâng đều lúc hover) mép trên/dưới trùng nhau nên vách cao 0; khi lệch nhau, vách
 * trải đúng khoảng hở giữa hai mặt trên, không để hở lỗ xuyên qua địa hình.
 * normal được gán thủ công (không suy ra được từ computeVertexNormals vì hình học suy biến
 * lúc nghỉ) — vật liệu render hai mặt (`THREE.DoubleSide`, xem Terrain.tsx) nên không cần chọn
 * đúng "bên thấp"; three.js tự lật normal hiển thị theo mặt camera đang thấy.
 */
function buildInternalWall(
  p: Position,
  q: Position,
  cellA: number,
  cellB: number
): THREE.BufferGeometry {
  const x0 = px(p[0]);
  const z0 = pz(p[1]);
  const x1 = px(q[0]);
  const z1 = pz(q[1]);
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz) || 1;
  const nx = dz / len;
  const nz = -dx / len;

  const positions: number[] = [];
  const normals: number[] = [];
  const roles: number[] = [];
  const pushVert = (x: number, z: number, role: 1 | 2): void => {
    positions.push(x, DEPTH, z);
    normals.push(nx, 0, nz);
    roles.push(role);
  };
  // Tam giác 1: mép trên (top0, top1), mép dưới (bottom1)
  pushVert(x0, z0, 1);
  pushVert(x1, z1, 1);
  pushVert(x1, z1, 2);
  // Tam giác 2: mép trên (top0), mép dưới (bottom1, bottom0)
  pushVert(x0, z0, 1);
  pushVert(x1, z1, 2);
  pushVert(x0, z0, 2);

  const geo = new THREE.BufferGeometry();
  const n = positions.length / 3;
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
  geo.setAttribute('aCell', new THREE.BufferAttribute(new Float32Array(n).fill(cellA), 1));
  geo.setAttribute('aCellB', new THREE.BufferAttribute(new Float32Array(n).fill(cellB), 1));
  geo.setAttribute('aWallRole', new THREE.BufferAttribute(new Float32Array(roles), 1));
  return geo;
}

export function buildTerrainGeometry(topo: CellsTopology): THREE.BufferGeometry {
  const coastKeys = coastalEdgeKeys(topo);
  const parts: THREE.BufferGeometry[] = [];
  // Cạnh nội bộ được 2 ô "nhìn thấy" khi duyệt qua từng ô; ô đầu tiên chạm cạnh này chỉ ghi
  // nhận (chưa dựng gì), ô thứ hai mới thực sự dựng MỘT vách dùng chung — tránh dựng trùng.
  const pendingInternal = new Map<string, { cellIndex: number; p: Position; q: Position }>();

  topo.objects.cells.geometries.forEach((g, cellIndex) => {
    const f = feature(topo, g) as unknown as {
      geometry: Polygon | MultiPolygon | null;
    };
    if (!f.geometry) return;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const rings of polys) {
      const shape = polygonToShape(rings);
      if (!shape) continue;
      const extruded = new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH,
        bevelEnabled: false,
        curveSegments: 1
      });
      extruded.rotateX(-Math.PI / 2);
      const caps = extractCaps(extruded);
      extruded.dispose();
      parts.push(tagOwnCellPart(caps, cellIndex));

      const coastalWalls = buildCoastalWalls(rings, coastKeys);
      if (coastalWalls) parts.push(tagOwnCellPart(coastalWalls, cellIndex));

      for (const ring of rings) {
        if (ring.length < 4) continue;
        for (let i = 1; i < ring.length; i++) {
          const p = ring[i - 1];
          const q = ring[i];
          const key = edgeKey(p, q);
          if (coastKeys.has(key)) continue; // đã có vách đường bờ, không phải cạnh nội bộ
          const existing = pendingInternal.get(key);
          if (!existing) {
            pendingInternal.set(key, { cellIndex, p, q });
          } else if (existing.cellIndex !== cellIndex) {
            parts.push(buildInternalWall(existing.p, existing.q, existing.cellIndex, cellIndex));
            pendingInternal.delete(key);
          }
        }
      }
    }
  });
  if (parts.length === 0) throw new Error('Không có ô hợp lệ để dựng địa hình');
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error('Không gộp được hình học các ô');
  for (const p of parts) p.dispose();
  return merged;
}

export function cellAtVertex(geometry: THREE.BufferGeometry, vertexIndex: number): number {
  return geometry.getAttribute('aCell').getX(vertexIndex);
}
