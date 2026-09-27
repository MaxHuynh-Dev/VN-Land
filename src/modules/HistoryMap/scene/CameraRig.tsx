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
