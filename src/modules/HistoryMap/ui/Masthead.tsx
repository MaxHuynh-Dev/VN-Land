import type React from 'react';
import { COPY } from '../copy';

export default function Masthead(): React.ReactElement {
  return (
    <header className="pointer-events-none absolute top-6 left-6 text-[#e8dcc2] drop-shadow-lg md:top-10 md:left-10">
      <p className="text-xs uppercase tracking-[0.3em] opacity-70">{COPY.eyebrow}</p>
      {/* leading 1.25: chữ in hoa tiếng Việt có dấu chồng trên (Ệ, Ố) và dấu nặng dưới chân —
          line-height 1 mặc định của text-6xl làm dấu nặng chạm vào dòng phụ đề. */}
      <h1 className="font-extrabold text-4xl leading-[1.25] tracking-wider md:text-6xl md:leading-[1.25]">
        {COPY.title}
      </h1>
      <p className="mt-1 text-sm italic opacity-80 md:text-base">{COPY.subtitle}</p>
    </header>
  );
}
