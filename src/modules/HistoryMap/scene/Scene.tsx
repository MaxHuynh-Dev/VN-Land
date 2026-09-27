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

export default function Scene({
  data,
  children
}: {
  data: MapData;
  children?: React.ReactNode;
}): React.ReactElement {
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
