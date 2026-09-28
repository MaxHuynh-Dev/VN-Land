'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { ChevronUp } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { COPY } from '../copy';
import type { MapData } from '../lib/loadMapData';
import { selectedPolity } from '../state/store';
import InfoCard from './InfoCard';
import PolityDetail from './PolityDetail';

export default function SidePanel({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const [open, setOpen] = useState(false);
  const desktop = useMediaQuery('(min-width: 768px)');
  const sel = selectedPolity.value;
  const body = sel ? <PolityDetail id={sel} /> : <InfoCard data={data} />;
  // Chỉ render MỘT panel để không trùng data-testid trong DOM
  if (desktop) {
    return (
      <aside className="absolute top-8 right-8 bottom-44 w-[340px] overflow-y-auto rounded-xl bg-[#0a1420]/80 p-5 shadow-2xl backdrop-blur">
        {body}
      </aside>
    );
  }
  return (
    // `bottom` đọc biến CSS `--timeline-h` do Timeline đo thật (ResizeObserver) và phơi ra trên
    // :root — không còn số ma đoán trước, luôn khớp chiều cao thật của thanh thời gian bên dưới.
    // 132px chỉ là giá trị dự phòng cho khung hình đầu tiên, trước khi Timeline kịp đo.
    <section
      data-testid="mobile-sheet"
      className="absolute inset-x-0 z-10"
      style={{ bottom: 'var(--timeline-h, 132px)' }}
    >
      <button
        type="button"
        data-testid="sheet-toggle"
        aria-expanded={open || !!sel}
        onClick={() => setOpen((o) => !o)}
        className="mx-auto flex items-center gap-1 rounded-t-lg bg-[#0a1420]/90 px-4 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]"
      >
        <ChevronUp size={14} className={open || sel ? 'rotate-180' : ''} /> {COPY.sidePanelToggle}
      </button>
      {(open || sel) && (
        <div className="max-h-[45vh] overflow-y-auto bg-[#0a1420]/95 p-4 backdrop-blur">{body}</div>
      )}
    </section>
  );
}
