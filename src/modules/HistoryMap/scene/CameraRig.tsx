'use client';

import { useSignalEffect } from '@preact/signals-react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import type React from 'react';
import { useEffect, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SNAPSHOTS } from '@/data/history';
import { cameraTarget, HOME_TARGET, homeDistance, homePose, type Pose } from '../lib/cameraPose';
import { polityAnchors } from '../lib/centroid';
import type { MapData } from '../lib/loadMapData';
import { playing, reducedMotion, selectedPolity, snapshotIndex } from '../state/store';

export { HOME_POS, HOME_TARGET } from '../lib/cameraPose';

export default function CameraRig({ data }: { data: MapData }): React.ReactElement {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const aspect = size.width / size.height;
  const tl = useRef<gsap.core.Timeline | null>(null);
  const wasSelected = useRef(false);
  const lastAnchorKey = useRef<string | null>(null);

  useEffect(
    () => () => {
      tl.current?.kill();
    },
    []
  );

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

  // Đang tự chạy thì bay tới focus của mốc (nếu có) — chính thể đang chọn thắng, không bay đè lên
  useSignalEffect(() => {
    if (selectedPolity.value) return;
    const snap = SNAPSHOTS[snapshotIndex.value];
    const target = cameraTarget({
      selected: null,
      anchors: undefined,
      snapshot: snap,
      playing: playing.value
    });
    if (target) fly(target.pose);
  });

  // Chọn chính thể thì bay theo neo của nó — kể cả khi đổi mốc bằng tay (prev/next/phím) trong
  // lúc đang chọn, vì lãnh thổ có thể dời/đổi kích thước; chỉ bay khi neo thực sự đổi chỗ. Bỏ
  // chọn thì về toàn cảnh.
  useSignalEffect(() => {
    const id = selectedPolity.value;
    const i = snapshotIndex.value;
    if (id) {
      const anchors = polityAnchors(data.cells, data.neighbors, data.owners[i]);
      const target = cameraTarget({ selected: id, anchors, snapshot: undefined, playing: false });
      if (target && target.key !== lastAnchorKey.current) {
        fly(target.pose);
        lastAnchorKey.current = target.key;
        wasSelected.current = true;
      }
    } else if (wasSelected.current) {
      wasSelected.current = false;
      lastAnchorKey.current = null;
      fly(homePose(aspect));
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={40}
      // Màn dọc hẹp lùi camera home xa hơn (xem homePose) — trần phải theo kịp, không thì
      // OrbitControls tự kẹp lại gần hơn tư thế home mong muốn.
      maxDistance={Math.max(260, Math.ceil(homeDistance(aspect)) + 40)}
      minPolarAngle={0.12}
      maxPolarAngle={1.25}
      target={HOME_TARGET}
      onStart={() => tl.current?.kill()}
    />
  );
}
