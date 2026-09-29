'use client';

import { Bvh, Stats } from '@react-three/drei';
import { Canvas, type ThreeEvent, useThree } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useState } from 'react';
import { homePose, homeScale } from '../lib/cameraPose';
import type { CellStateStore } from '../lib/cellState';
import type { MapData } from '../lib/loadMapData';
import Borders from './Borders';
import CameraRig from './CameraRig';
import Labels from './Labels';
import Lights from './Lights';
import Sea from './Sea';
import Terrain from './Terrain';

/** Mật độ sương (FogExp2) ở tư thế toàn cảnh gốc (màn ngang ~16:10 — desktop). */
const FOG_DENSITY = 0.0022;

/**
 * `?perf` (bất kỳ giá trị nào, kể cả rỗng) trên URL → bật bảng đo fps của drei để gỡ lỗi hiệu
 * năng. Đọc trong effect (chỉ chạy phía client) nên an toàn khi render phía server.
 */
function usePerfFlag(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).has('perf'));
  }, []);
  return on;
}

/**
 * Sương FogExp2 bám theo khung Canvas hiện tại (cùng nguồn `size` với CameraRig nên xoay màn
 * hình / đổi cỡ cửa sổ cập nhật ngay, không chờ HistoryMap render lại).
 *
 * Màn dọc hẹp (điện thoại) lùi camera toàn cảnh xa hơn tới homeScale lần (xem homePose); với
 * mật độ cố định, FogExp2 ở ~425 đơn vị nuốt ~58% màu lãnh thổ (desktop ở ~177: ~14%) nên cả
 * cảnh tối, mờ. Chia mật độ cho cùng hệ số → lượng sương ở tư thế toàn cảnh như desktop.
 * homeScale = 1 với mọi khung ngang ≥ 16:10 nên desktop không đổi. Mật độ đặt bằng prop (không
 * qua `args`) để đổi giá trị không dựng lại đối tượng sương.
 */
function Fog(): React.ReactElement {
  const aspect = useThree((s) => s.size.width / s.size.height);
  return (
    <fogExp2
      attach="fog"
      args={['#0a1420', FOG_DENSITY]}
      density={FOG_DENSITY / homeScale(aspect)}
    />
  );
}

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
  const perf = usePerfFlag();
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
      <Fog />
      <Lights shadows={!mobile} />
      <Sea />
      <Bvh firstHitOnly>
        <Terrain data={data} store={store} onHoverCell={onHoverCell} onClickCell={onClickCell} />
      </Bvh>
      <Borders data={data} />
      <Labels data={data} />
      <CameraRig data={data} />
      {perf && <Stats />}
      {children}
    </Canvas>
  );
}
