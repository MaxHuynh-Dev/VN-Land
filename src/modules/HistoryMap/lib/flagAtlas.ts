'use client';

import * as THREE from 'three';
import type { Polity } from '@/data/history/types';
import { atlasLayout } from './flagCover';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

/**
 * Vẽ cờ (SVG/PNG) của mọi chính thể vào một atlas canvas — ô thứ i là cờ của `polities[i]`
 * (slot = chỉ số trong `POLITIES`), co giãn khít ô 256×171 theo `atlasLayout`. `aspects[i]` là
 * tỉ lệ gốc w/h của ảnh, để shader phủ cờ không méo. Ảnh lỗi: tô ô bằng `polity.color`,
 * aspect = 1.5 — lãnh thổ đó hiện màu trơn, không hỏng cả cảnh.
 *
 * Giới hạn: override cờ theo triều đại (`polityOverrides.flag`) KHÔNG vào atlas — cờ trên đất
 * luôn là cờ gốc của `Polity`; thẻ thông tin vẫn hiện cờ override.
 */
export async function loadFlagAtlas(
  polities: Polity[]
): Promise<{ texture: THREE.CanvasTexture; aspects: number[] }> {
  const layout = atlasLayout(polities.length);
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const g = canvas.getContext('2d') as CanvasRenderingContext2D;
  const aspects = await Promise.all(
    polities.map(async (p, i) => {
      const x = (i % layout.cols) * layout.slotW;
      const y = Math.floor(i / layout.cols) * layout.slotH;
      try {
        const img = await loadImage(p.flag);
        g.drawImage(img, x, y, layout.slotW, layout.slotH);
        return (img.naturalWidth || 3) / (img.naturalHeight || 2);
      } catch {
        g.fillStyle = p.color;
        g.fillRect(x, y, layout.slotW, layout.slotH);
        return 1.5;
      }
    })
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { texture, aspects };
}
