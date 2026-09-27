import { useEffect, useState } from 'react';
import * as THREE from 'three';

/** Trả về texture, hoặc null khi đang tải hay tải lỗi (lúc đó dùng màu trơn). */
export function useFlagTexture(url: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    new THREE.TextureLoader().load(
      url,
      (t) => {
        // URL đã đổi hoặc component đã unmount trước khi ảnh tải xong: texture
        // này sẽ không được gán vào state (không ai giữ tham chiếu để dispose về
        // sau) — dispose ngay tại đây để không rò bộ nhớ GPU (round 1 fix: trước
        // đây `loaded` chỉ được gán ở nhánh `alive` nên khi tải xong SAU cleanup,
        // texture không hề được dispose).
        if (!alive) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        setTex(t);
      },
      undefined,
      () => {
        if (alive) setTex(null);
      }
    );
    return () => {
      alive = false;
    };
  }, [url]);
  // Dispose đúng texture đang thực sự giữ trong state — chạy lại mỗi khi `tex`
  // đổi (url đổi và tải xong bản mới, hoặc chuyển sang null khi lỗi) và khi
  // component unmount. Tách khỏi effect tải ở trên để không dispose nhầm một
  // texture chưa từng được gán vào state (đã tự dispose ở nhánh !alive).
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}
