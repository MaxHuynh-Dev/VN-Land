'use client';

import { useSignalEffect } from '@preact/signals-react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type React from 'react';
import { useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SNAPSHOTS } from '@/data/history';
import { distanceForArea, focusPose, type Pose } from '../lib/cameraPose';
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
      .to(
        camera.position,
        {
          x: pose.position[0],
          y: pose.position[1],
          z: pose.position[2],
          duration: 1.6,
          ease: 'power2.inOut'
        },
        0
      )
      .to(
        c.target,
        {
          x: pose.target[0],
          y: pose.target[1],
          z: pose.target[2],
          duration: 1.6,
          ease: 'power2.inOut'
        },
        0
      );
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
      const a = polityAnchors(data.cells, data.neighbors, data.owners[snapshotIndex.peek()]).get(
        id
      );
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
