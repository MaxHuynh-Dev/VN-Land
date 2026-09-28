'use client';

import { Bvh } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import type React from 'react';
import { homePose } from '../lib/cameraPose';
import type { CellStateStore } from '../lib/cellState';
import type { MapData } from '../lib/loadMapData';
import Borders from './Borders';
import CameraRig from './CameraRig';
import Labels from './Labels';
import Lights from './Lights';
import Sea from './Sea';
import Terrain from './Terrain';

export default function Scene({
  data,
  store,
  onHoverCell,
  onClickCell,
  onMissed,
  children
}: {
  data: MapData;
  store: CellStateStore;
  onHoverCell?: (cell: number | null, e: ThreeEvent<PointerEvent>) => void;
  onClickCell?: (cell: number) => void;
  onMissed?: () => void;
  children?: React.ReactNode;
}): React.ReactElement {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const aspect = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 16 / 10;
  return (
    <Canvas
      shadows={!mobile}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: 40, position: homePose(aspect).position, near: 1, far: 1200 }}
      gl={{ antialias: true, toneMappingExposure: 1.25 }}
      onPointerMissed={onMissed}
    >
      <color attach="background" args={['#0a1420']} />
      <fogExp2 attach="fog" args={['#0a1420', 0.0022]} />
      <Lights shadows={!mobile} />
      <Sea />
      <Bvh firstHitOnly>
        <Terrain data={data} store={store} onHoverCell={onHoverCell} onClickCell={onClickCell} />
      </Bvh>
      <Borders data={data} />
      <Labels data={data} />
      <CameraRig data={data} />
      {children}
    </Canvas>
  );
}
