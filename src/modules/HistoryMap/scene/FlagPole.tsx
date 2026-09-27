'use client';

import { useFrame } from '@react-three/fiber';
import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Polity } from '@/data/history/types';
import type { FlagEntry } from '../lib/flagsReconcile';
import { DEPTH, px, pz } from '../lib/projection';
import { reducedMotion } from '../state/store';
import { useFlagTexture } from './useFlagTexture';

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

function buildLabelTexture(text: string): THREE.CanvasTexture {
  const scale = 4;
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

const LABEL_H = 1.3;

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
}

export default function FlagPole({ entry, polity, onGone }: Props): React.ReactElement {
  const group = useRef<THREE.Group>(null);
  const scale = useRef(entry.state === 'enter' ? 0 : 1);
  const still = useMemo(() => reducedMotion(), []);
  const tex = useFlagTexture(polity.flag);
  const { mat, uniforms } = useMemo(clothMaterial, []);
  const cloth = useMemo(() => new THREE.PlaneGeometry(W, H, 20, 12), []);
  const symbol = polity.flagKind === 'symbol';
  const badge = entry.anchor.cellCount < 3;
  const baseScale = badge ? 0.55 : 1;
  const labelTex = useMemo(() => buildLabelTexture(polity.name), [polity.name]);
  const labelAspect = labelTex.image.width / labelTex.image.height;

  const gone = useRef(false);

  useEffect(() => {
    mat.map = tex;
    mat.color.set(tex ? '#ffffff' : polity.color);
    mat.needsUpdate = true;
  }, [mat, tex, polity.color]);

  useEffect(() => () => labelTex.dispose(), [labelTex]);

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
      <sprite position={[0, -0.2, 0]} scale={[LABEL_H * labelAspect, LABEL_H, 1]}>
        <spriteMaterial map={labelTex} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}
