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
      arr[i + 2] =
        Math.sin(base[i] * 0.05 + t * 0.6) * 0.25 + Math.cos(base[i + 1] * 0.06 + t * 0.4) * 0.2;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return (
    <mesh geometry={geo} rotation-x={-Math.PI / 2} position-y={-0.55} receiveShadow>
      <meshStandardMaterial color="#123048" roughness={0.6} metalness={0.2} />
    </mesh>
  );
}
