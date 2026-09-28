import type React from 'react';
import { useState } from 'react';
import type { Polity } from '@/data/history/types';

export default function FlagThumb({
  polity,
  className = 'h-6 w-9'
}: {
  polity: Polity;
  className?: string;
}): React.ReactElement {
  // Theo dõi chính URL đã lỗi (thay vì một cờ boolean) để khi `polity.flag` đổi sang một URL
  // khác — ví dụ chính thể đổi cờ giữa các mốc qua polityOverrides — component vẫn thử tải lại
  // thay vì tiếp tục hiện màu trơn của lần lỗi trước.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const broken = failedUrl === polity.flag;
  if (broken)
    return (
      <span
        className={`${className} inline-block rounded-sm`}
        style={{ background: polity.color }}
      />
    );
  return (
    // biome-ignore lint/performance/noImgElement: SVG cờ nhỏ, không cần next/image
    <img
      key={polity.flag}
      src={polity.flag}
      alt=""
      className={`${className} rounded-sm object-cover shadow`}
      onError={() => setFailedUrl(polity.flag)}
    />
  );
}
