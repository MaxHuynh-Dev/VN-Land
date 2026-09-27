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
