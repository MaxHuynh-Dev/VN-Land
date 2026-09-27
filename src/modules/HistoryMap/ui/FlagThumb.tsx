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
  const [broken, setBroken] = useState(false);
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
      src={polity.flag}
      alt=""
      className={`${className} rounded-sm object-cover shadow`}
      onError={() => setBroken(true)}
    />
  );
}
