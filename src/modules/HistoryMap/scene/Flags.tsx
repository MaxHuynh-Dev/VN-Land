'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { polityAnchors } from '../lib/centroid';
import { dropFlag, type FlagEntry, reconcileFlags } from '../lib/flagsReconcile';
import { type LabelRect, resolveLabelOverlaps } from '../lib/labelOverlap';
import { LABEL_TARGET_PX } from '../lib/labelSprite';
import type { MapData } from '../lib/loadMapData';
import { effectivePolity } from '../lib/resolve';
import { snapshotIndex } from '../state/store';
import FlagPole, { type FlagLabelRefs } from './FlagPole';

// Vector tạm dùng để chiếu vị trí neo nhãn ra không gian màn hình mỗi khung
// hình — một instance dùng chung (module scope), tránh cấp phát lại liên tục
// trong vòng lặp render.
const scratch = new THREE.Vector3();

export default function Flags({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const i = snapshotIndex.value;
  // biome-ignore lint/correctness/useExhaustiveDependencies: i được dùng trong data.owners[i], cần liệt kê để tính lại khi đổi mốc.
  const anchors = useMemo(
    () => polityAnchors(data.cells, data.neighbors, data.owners[i]),
    [data, i]
  );
  const [entries, setEntries] = useState<FlagEntry[]>([]);
  useEffect(() => setEntries((prev) => reconcileFlags(prev, anchors)), [anchors]);
  const onGone = useCallback((id: string) => setEntries((prev) => dropFlag(prev, id)), []);

  const labelRefs = useRef(new Map<string, FlagLabelRefs>());
  const registerLabel = useCallback((id: string, refs: FlagLabelRefs | null) => {
    if (refs) labelRefs.current.set(id, refs);
    else labelRefs.current.delete(id);
  }, []);

  // Mỗi khung hình: chiếu điểm neo nhãn (chân cột — đúng vị trí sprite đang
  // treo vào, xem center=[0.5,1] trong FlagPole.tsx) của từng cờ đang mount ra
  // toạ độ màn hình, dựng hình chữ nhật xấp xỉ kích thước hiển thị hiện tại
  // (LABEL_TARGET_PX × scale hiện tại của group — bao gồm cả hiệu ứng
  // hiện/biến mất — và tỉ lệ khung hình đọc thẳng từ sprite.scale.x/y, không
  // cần lưu riêng vì sprite.scale đã được FlagPole tính đúng theo aspect texture
  // ở scale=1), rồi nhờ `resolveLabelOverlaps` (lib thuần, có unit test riêng)
  // quyết định nhãn nào bị lãnh thổ lớn hơn che khuất thì ẩn chữ đi (cờ vẫn
  // hiện bình thường) — Fix round 2, finding 1: tránh "Lan Xang" đè "Đại Việt".
  useFrame(({ camera, size }) => {
    const rects: LabelRect[] = [];
    for (const e of entries) {
      const refs = labelRefs.current.get(e.id);
      if (!refs) continue;
      const { group, sprite } = refs;
      scratch.copy(group.position).project(camera);
      const screenX = (scratch.x * 0.5 + 0.5) * size.width;
      const screenY = (1 - (scratch.y * 0.5 + 0.5)) * size.height;
      const h = LABEL_TARGET_PX * group.scale.x;
      const aspect = sprite.scale.y > 0 ? sprite.scale.x / sprite.scale.y : 1;
      const w = h * aspect;
      rects.push({ id: e.id, x: screenX - w / 2, y: screenY, w, h, priority: e.anchor.area });
    }
    const hidden = resolveLabelOverlaps(rects);
    for (const r of rects) {
      const refs = labelRefs.current.get(r.id);
      if (refs) refs.sprite.visible = !hidden.has(r.id);
    }
  });

  return (
    <>
      {entries.map((e) => (
        <FlagPole
          key={e.id}
          entry={e}
          polity={effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, e.id)}
          onGone={onGone}
          registerLabel={registerLabel}
        />
      ))}
    </>
  );
}
