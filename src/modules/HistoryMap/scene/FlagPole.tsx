'use client';

import { useFrame, useThree } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Polity } from '@/data/history/types';
import type { FlagEntry } from '../lib/flagsReconcile';
import { LABEL_TARGET_PX, labelSpriteScale } from '../lib/labelSprite';
import { DEPTH, px, pz } from '../lib/projection';
import { reducedMotion } from '../state/store';
import { useFlagTexture } from './useFlagTexture';

/** Tham chiếu group/sprite của một FlagPole, dùng để `Flags.tsx` chiếu vị trí
 * nhãn ra màn hình và giải quyết chồng lấn mỗi khung hình — xem `registerLabel`. */
export interface FlagLabelRefs {
  group: THREE.Group;
  sprite: THREE.Sprite;
}

const W = 6;
const H = 4;
const POLE = 9;

// Nhãn tên chính thể vẽ bằng canvas 2D thành texture cho <sprite>, KHÔNG dùng <Html>
// của drei: <Html> tự tạo một ReactDOM root con và unmount đồng bộ trong cleanup
// của nó — dưới React 19 + @react-three/fiber v9 (reconciler chạy trong vòng lặp
// commit của React), unmount lặp lại theo vòng đời cờ (enter/exit) khiến
// `target.removeChild(el)` rồi `root.unmount()` xung đột, ném
// `NotFoundError: Failed to execute 'removeChild'` không bắt được — vỡ cả cảnh dù
// không liên quan gì đến lỗi tải texture cờ. Tái hiện ổn định kể cả khi ảnh cờ tải
// thành công; xem task-8-report.md mục "Sai khác so với bản đặc tả". Sprite của
// three.js tự quay mặt về camera, không cần logic billboard riêng.
function labelFontFamily(): string {
  if (typeof document === 'undefined') return 'sans-serif';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-be-vietnam').trim();
  return v ? `${v}, sans-serif` : 'sans-serif';
}

// round 1 fix: vẽ theo devicePixelRatio thật của màn hình (kẹp 2–4) thay vì hệ
// số cố định — nét chữ sắc trên màn hình DPR cao, không phí bộ nhớ texture trên
// màn hình DPR thấp.
function labelCanvasScale(): number {
  if (typeof window === 'undefined') return 2;
  return Math.min(4, Math.max(2, window.devicePixelRatio || 1));
}

/**
 * Đợi font Be Vietnam Pro (subset `vietnamese`) tải xong rồi mới coi là "sẵn
 * sàng" — round 1 fix: nếu vẽ nhãn lên canvas trước khi font tải xong, trình
 * duyệt thay bằng font dự phòng và canvas KHÔNG tự vẽ lại khi font thật tải
 * xong sau đó (khác với DOM text, canvas là ảnh tĩnh). Trả `true` ngay nếu
 * `document.fonts` đã ở trạng thái 'loaded' (font đã sẵn có, ví dụ cache).
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

// Kích thước nhãn: sizeAttenuation=false trên spriteMaterial bên dưới giữ
// nhãn ở kích thước KHÔNG ĐỔI trên màn hình bất kể khoảng cách camera (Fix
// round 1, finding 1). `scale` của sprite được tính bằng `labelSpriteScale`
// (lib/labelSprite.ts, có unit test riêng) từ chiều cao đích `LABEL_TARGET_PX`
// (đơn vị CSS px) + `camera.projectionMatrix.elements[5]` + chiều cao viewport
// hiện tại (`useThree().size.height`, phản ứng khi resize) — suy ra trực tiếp
// từ công thức phối cảnh của three.js thay vì canh bằng mắt như bản Fix round
// 1 trước đó (0.035 world units, ra ~43px thay vì mục tiêu ~22px — xem
// task-8-report.md, "Fix round 2"). Nhãn vẫn nhân thêm với scale của <group>
// cha (hiệu ứng hiện/biến mất và cờ "badge" lãnh thổ nhỏ ở 55%) — có chủ đích:
// cờ càng nhỏ, nhãn càng nhỏ theo.

function clothMaterial(): {
  mat: THREE.MeshStandardMaterial;
  uniforms: { uTime: { value: number } };
} {
  const uniforms = { uTime: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
float w = (position.x + ${(W / 2).toFixed(1)}) / ${W.toFixed(1)};
transformed.z += sin(position.x * 1.1 - uTime * 3.0) * 0.45 * w;
transformed.y += cos(position.x * 0.7 - uTime * 2.2) * 0.12 * w;`
      );
  };
  return { mat, uniforms };
}

interface Props {
  entry: FlagEntry;
  polity: Polity;
  onGone: (id: string) => void;
  /** Đăng ký/huỷ đăng ký group+sprite của nhãn với `Flags.tsx` để nó tính
   * chồng lấn màn hình mỗi khung hình (`null` khi unmount). */
  registerLabel?: (id: string, refs: FlagLabelRefs | null) => void;
}

export default function FlagPole({
  entry,
  polity,
  onGone,
  registerLabel
}: Props): React.ReactElement {
  const group = useRef<THREE.Group>(null);
  const sprite = useRef<THREE.Sprite>(null);
  const scale = useRef(entry.state === 'enter' ? 0 : 1);
  const still = useMemo(() => reducedMotion(), []);
  const tex = useFlagTexture(polity.flag);
  const { size, camera } = useThree();
  const proj5 = (camera as THREE.PerspectiveCamera).projectionMatrix.elements[5];
  const { mat, uniforms } = useMemo(clothMaterial, []);
  const cloth = useMemo(() => new THREE.PlaneGeometry(W, H, 20, 12), []);
  const symbol = polity.flagKind === 'symbol';
  const badge = entry.anchor.cellCount < 3;
  const baseScale = badge ? 0.55 : 1;
  const fontsReady = useFontsReady();
  // fontsReady không dùng trong hàm nhưng cố ý đưa vào deps: bắt useMemo vẽ
  // lại texture một lần khi font Be Vietnam Pro thật tải xong — canvas là ảnh
  // tĩnh, không tự cập nhật khi font đổi như text DOM (round 1 fix, finding 4).
  // biome-ignore lint/correctness/useExhaustiveDependencies: xem chú thích trên.
  const labelTex = useMemo(() => buildLabelTexture(polity.name), [polity.name, fontsReady]);
  const labelAspect = labelTex.image.width / labelTex.image.height;
  const labelScale = useMemo(
    () => labelSpriteScale(labelAspect, LABEL_TARGET_PX, proj5, size.height),
    [labelAspect, proj5, size.height]
  );

  const gone = useRef(false);

  // Đăng ký refs group/sprite của nhãn này với Flags.tsx (nếu có) để nó chiếu
  // vị trí ra màn hình và ẩn bớt nhãn chồng lấn mỗi khung hình (Fix round 2).
  // Chạy một lần khi mount/unmount: group.current/sprite.current là ref ổn
  // định suốt vòng đời component, không đổi giữa các lần render.
  useEffect(() => {
    if (!registerLabel || !group.current || !sprite.current) return;
    registerLabel(entry.id, { group: group.current, sprite: sprite.current });
    return () => registerLabel(entry.id, null);
  }, [entry.id, registerLabel]);

  useEffect(() => {
    mat.map = tex;
    mat.color.set(tex ? '#ffffff' : polity.color);
    mat.needsUpdate = true;
  }, [mat, tex, polity.color]);

  useEffect(() => () => labelTex.dispose(), [labelTex]);

  // round 1 fix (finding 3): `mat`/`cloth` được tạo một lần bằng useMemo([])
  // ngoài JSX khai báo — R3F chỉ tự dispose vật thể three.js mà chính nó tạo ra
  // từ JSX (`<meshStandardMaterial>`,...), không tự dispose vật thể tạo thủ
  // công rồi truyền vào qua prop `material`/`geometry`. Phải tự dispose khi
  // unmount.
  useEffect(
    () => () => {
      mat.dispose();
      cloth.dispose();
    },
    [mat, cloth]
  );

  useFrame(({ camera, clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const tx = px(entry.anchor.lon);
    const tz = pz(entry.anchor.lat);
    const k = still ? 1 : Math.min(1, dt * 4);
    g.position.x += (tx - g.position.x) * k;
    g.position.z += (tz - g.position.z) * k;
    const target = entry.state === 'exit' ? 0 : 1;
    scale.current += (target - scale.current) * (still ? 1 : Math.min(1, dt * 5));
    g.scale.setScalar(Math.max(0.0001, scale.current * baseScale));
    if (entry.state === 'exit' && scale.current < 0.02 && !gone.current) {
      gone.current = true;
      onGone(entry.id);
    }
    if (entry.state !== 'exit') gone.current = false;
    g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    if (!still) uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group ref={group} position={[px(entry.anchor.lon), DEPTH, pz(entry.anchor.lat)]}>
      <mesh position={[0, (symbol ? 3 : POLE) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, symbol ? 3 : POLE, 8]} />
        <meshStandardMaterial color="#d9c9a3" metalness={0.4} roughness={0.5} />
      </mesh>
      {symbol ? (
        <mesh position={[0, 3 + 2.4, 0]} castShadow>
          <circleGeometry args={[2.4, 48]} />
          <meshStandardMaterial
            map={tex}
            color={tex ? '#ffffff' : polity.color}
            side={THREE.DoubleSide}
            roughness={0.7}
          />
        </mesh>
      ) : (
        <mesh
          geometry={cloth}
          material={mat}
          position={[W / 2 + 0.1, POLE - H / 2, 0]}
          castShadow
        />
      )}
      {/* renderOrder + depthTest=false: nhãn luôn hiện rõ phía trên cờ vải/cột
          (giống hành vi overlay không bị che khuất của <Html> trước đây — xem
          "Sai khác so với bản đặc tả" trong task-8-report.md), không bị vách
          địa hình hay cờ đang phần phật che khuất một phần. center=[0.5,1] +
          position ở gốc group (mặt đất, chân cột): nhãn treo hẳn XUỐNG DƯỚI từ
          điểm neo, không đè lên cờ/đĩa biểu tượng phía trên (Fix round 2). */}
      <sprite
        ref={sprite}
        position={[0, 0, 0]}
        center={[0.5, 1]}
        scale={labelScale}
        renderOrder={1}
      >
        <spriteMaterial
          map={labelTex}
          transparent
          depthWrite={false}
          depthTest={false}
          sizeAttenuation={false}
        />
      </sprite>
    </group>
  );
}
