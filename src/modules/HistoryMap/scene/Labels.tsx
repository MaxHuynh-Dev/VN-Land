'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { OWNER_TRANSITION_S } from '../lib/cellState';
import { polityAnchors } from '../lib/centroid';
import { dropFlag, type FlagEntry, reconcileFlags } from '../lib/flagsReconcile';
import { type LabelRect, resolveLabelOverlaps } from '../lib/labelOverlap';
import { LABEL_TARGET_PX, labelSpriteScale } from '../lib/labelSprite';
import type { MapData } from '../lib/loadMapData';
import { DEPTH, px, pz } from '../lib/projection';
import { effectivePolity } from '../lib/resolve';
import { reducedMotion, snapshotIndex } from '../state/store';

/** Chiều cao đặt nhãn: ngay trên mặt trên lãnh thổ (y = DEPTH lúc nghỉ). */
const LABEL_Y = DEPTH + 0.05;

/**
 * Hệ số tắt dần cho độ mờ nhãn (Task E2): kéo dài nhịp mờ vào/ra cho khớp với thời lượng
 * chuyển chủ của ô (`OWNER_TRANSITION_S`, Task E1) — hệ số tắt dần đạt ~95% mục tiêu sau ~3
 * hằng số thời gian, nên đặt hằng số thời gian = OWNER_TRANSITION_S / 3.
 */
const LABEL_FADE_RATE = 3 / OWNER_TRANSITION_S;

// Nhãn tên chính thể vẽ bằng canvas 2D thành texture cho <sprite>, KHÔNG dùng <Html> của
// drei: <Html> tự tạo một ReactDOM root con và unmount đồng bộ trong cleanup — dưới React 19
// + @react-three/fiber v9, unmount lặp lại theo vòng đời nhãn (enter/exit) ném
// `NotFoundError: Failed to execute 'removeChild'` không bắt được và vỡ cả cảnh (xem
// task-8-report.md). Sprite của three.js tự quay mặt về camera.
function labelFontFamily(): string {
  if (typeof document === 'undefined') return 'sans-serif';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-be-vietnam').trim();
  return v ? `${v}, sans-serif` : 'sans-serif';
}

// Vẽ theo devicePixelRatio thật (kẹp 2–4): chữ sắc trên màn hình DPR cao, không phí bộ nhớ
// texture trên màn hình DPR thấp.
function labelCanvasScale(): number {
  if (typeof window === 'undefined') return 2;
  return Math.min(4, Math.max(2, window.devicePixelRatio || 1));
}

/**
 * Đợi font Be Vietnam Pro (subset `vietnamese`) tải xong: canvas là ảnh tĩnh, vẽ trước khi
 * font tải xong sẽ kẹt ở font dự phòng. Trả `true` ngay nếu `document.fonts` đã 'loaded'.
 */
function useFontsReady(): boolean {
  const [ready, setReady] = useState(
    () => typeof document !== 'undefined' && document.fonts?.status === 'loaded'
  );
  useEffect(() => {
    if (ready || typeof document === 'undefined' || !document.fonts) return;
    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}

function buildLabelTexture(text: string): THREE.CanvasTexture {
  const scale = labelCanvasScale();
  const fontPx = 28 * scale;
  const paddingX = 18 * scale;
  const paddingY = 10 * scale;
  const font = `600 ${fontPx}px ${labelFontFamily()}`;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + paddingX * 2;
  const height = fontPx + paddingY * 2;
  canvas.width = width;
  canvas.height = height;
  // Set canvas.width/height xóa toàn bộ trạng thái context — phải gán lại font.
  ctx.font = font;
  const r = height / 2;
  ctx.fillStyle = 'rgba(10, 20, 32, 0.7)';
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(width, 0, width, height, r);
  ctx.arcTo(width, height, 0, height, r);
  ctx.arcTo(0, height, 0, 0, r);
  ctx.arcTo(0, 0, width, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4e3c1';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height / 2 + fontPx * 0.04);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface LabelProps {
  entry: FlagEntry;
  name: string;
  onGone: (id: string) => void;
  /** Đăng ký/huỷ đăng ký sprite với `Labels` để tính chồng lấn màn hình mỗi khung hình. */
  registerLabel: (id: string, sprite: THREE.Sprite | null) => void;
}

/**
 * Nhãn tên nhỏ ở điểm neo lãnh thổ: cao ~LABEL_TARGET_PX px trên màn hình bất kể khoảng cách
 * camera (`sizeAttenuation={false}` + `labelSpriteScale`), luôn nổi trên địa hình
 * (`depthTest={false}` + renderOrder). Vào/ra bằng độ mờ 0 → 1 / 1 → 0 (không scale).
 */
function Label({ entry, name, onGone, registerLabel }: LabelProps): React.ReactElement {
  const sprite = useRef<THREE.Sprite>(null);
  const mat = useRef<THREE.SpriteMaterial>(null);
  const opacity = useRef(entry.state === 'enter' ? 0 : 1);
  const gone = useRef(false);
  const still = useMemo(() => reducedMotion(), []);
  const { size, camera } = useThree();
  const proj5 = (camera as THREE.PerspectiveCamera).projectionMatrix.elements[5];
  const fontsReady = useFontsReady();
  // fontsReady không dùng trong hàm nhưng cố ý đưa vào deps: vẽ lại texture một lần khi font
  // thật tải xong.
  // biome-ignore lint/correctness/useExhaustiveDependencies: xem chú thích trên.
  const labelTex = useMemo(() => buildLabelTexture(name), [name, fontsReady]);
  const labelAspect = labelTex.image.width / labelTex.image.height;
  const labelScale = useMemo(
    () => labelSpriteScale(labelAspect, LABEL_TARGET_PX, proj5, size.height),
    [labelAspect, proj5, size.height]
  );

  useEffect(() => () => labelTex.dispose(), [labelTex]);

  useEffect(() => {
    if (!sprite.current) return;
    registerLabel(entry.id, sprite.current);
    return () => registerLabel(entry.id, null);
  }, [entry.id, registerLabel]);

  useFrame((_, dt) => {
    const s = sprite.current;
    const m = mat.current;
    if (!s || !m) return;
    const tx = px(entry.anchor.lon);
    const tz = pz(entry.anchor.lat);
    const k = still ? 1 : Math.min(1, dt * 4);
    s.position.x += (tx - s.position.x) * k;
    s.position.z += (tz - s.position.z) * k;
    const target = entry.state === 'exit' ? 0 : 1;
    opacity.current += (target - opacity.current) * (still ? 1 : Math.min(1, dt * LABEL_FADE_RATE));
    m.opacity = opacity.current;
    if (entry.state === 'exit' && opacity.current < 0.02 && !gone.current) {
      gone.current = true;
      onGone(entry.id);
    }
    if (entry.state !== 'exit') gone.current = false;
  });

  return (
    <sprite
      ref={sprite}
      position={[px(entry.anchor.lon), LABEL_Y, pz(entry.anchor.lat)]}
      center={[0.5, 0.5]}
      scale={labelScale}
      renderOrder={1}
    >
      <spriteMaterial
        ref={mat}
        map={labelTex}
        transparent
        opacity={opacity.current}
        depthWrite={false}
        depthTest={false}
        sizeAttenuation={false}
      />
    </sprite>
  );
}

// Vector tạm dùng chung để chiếu điểm neo ra màn hình mỗi khung hình (không cấp phát lại).
const scratch = new THREE.Vector3();

/** Nhãn tên của mọi chính thể ở mốc hiện tại; ẩn nhãn của lãnh thổ nhỏ hơn khi chồng nhau. */
export default function Labels({ data }: { data: MapData }): React.ReactElement {
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

  const sprites = useRef(new Map<string, THREE.Sprite>());
  const registerLabel = useCallback((id: string, s: THREE.Sprite | null) => {
    if (s) sprites.current.set(id, s);
    else sprites.current.delete(id);
  }, []);
  // Pool LabelRect tái sử dụng giữa các khung hình.
  const rectPool = useRef<LabelRect[]>([]);
  const rects = useRef<LabelRect[]>([]);

  // Mỗi khung hình: chiếu tâm nhãn ra màn hình, dựng hình chữ nhật đúng kích thước hiển thị
  // (LABEL_TARGET_PX × tỉ lệ khung của sprite, tâm ở điểm neo), rồi để `resolveLabelOverlaps`
  // quyết định nhãn nào bị lãnh thổ lớn hơn che thì ẩn. Nhãn đang biến mất (exit) không tham
  // gia — nó sắp mờ hẳn, không nên che nhãn mới.
  useFrame(({ camera, size }) => {
    const list = rects.current;
    list.length = 0;
    for (const e of entries) {
      if (e.state === 'exit') continue;
      const s = sprites.current.get(e.id);
      if (!s) continue;
      scratch.copy(s.position).project(camera);
      const h = LABEL_TARGET_PX;
      const w = s.scale.y > 0 ? (h * s.scale.x) / s.scale.y : h;
      let r = rectPool.current[list.length];
      if (!r) {
        r = { id: '', x: 0, y: 0, w: 0, h: 0, priority: 0 };
        rectPool.current.push(r);
      }
      r.id = e.id;
      r.x = (scratch.x * 0.5 + 0.5) * size.width - w / 2;
      r.y = (1 - (scratch.y * 0.5 + 0.5)) * size.height - h / 2;
      r.w = w;
      r.h = h;
      r.priority = e.anchor.area;
      list.push(r);
    }
    const hidden = resolveLabelOverlaps(list);
    for (const [id, s] of sprites.current) s.visible = !hidden.has(id);
  });

  return (
    <>
      {entries.map((e) => (
        <Label
          key={e.id}
          entry={e}
          name={effectivePolity(POLITY_BY_ID, SNAPSHOTS, i, e.id).name}
          onGone={onGone}
          registerLabel={registerLabel}
        />
      ))}
    </>
  );
}
