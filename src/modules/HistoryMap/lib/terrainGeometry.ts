import type { MultiPolygon, Polygon, Position } from 'geojson';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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
    const f = feature(topo, g) as unknown as {
      geometry: Polygon | MultiPolygon | null;
    };
    if (!f.geometry) return;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const rings of polys) {
      const shape = polygonToShape(rings);
      if (!shape) continue;
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH,
        bevelEnabled: false,
        curveSegments: 1
      });
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
