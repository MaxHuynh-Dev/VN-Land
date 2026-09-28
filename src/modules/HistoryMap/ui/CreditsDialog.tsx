'use client';

import { Info } from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';
import { POLITIES } from '@/data/history';
import { COPY } from '../copy';
import { TRACKS } from '../music/tracks';

export default function CreditsDialog(): React.ReactElement {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      {/* Mobile (<md): nút biểu tượng gọn 40×40, không đè lên chữ tiêu đề nhỏ (eyebrow) của
          Masthead ở các màn hẹp (đã kiểm ở 360px). Desktop dùng nút chữ đầy đủ bên dưới. */}
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={COPY.credits}
        className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#0a1420]/70 opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1] md:hidden"
      >
        <Info size={18} />
      </button>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="absolute bottom-40 left-10 z-10 hidden rounded-full bg-[#0a1420]/70 px-3 py-1 text-xs opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1] md:block"
      >
        {COPY.credits}
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: onClick chỉ để đóng khi nhấp ra ngoài nội
          dung (backdrop) — tiện ích chuột thuần túy, không thay thế đường bàn phím nào. <dialog>
          đã có sẵn Escape để đóng (bàn phím) và nút "Đóng" (form method="dialog") hoạt động bằng
          cả chuột lẫn bàn phím; không có hành vi nào chỉ bấm được bằng chuột. */}
      <dialog
        ref={ref}
        aria-labelledby="credits-dialog-title"
        onClick={(e) => {
          // Nhấp vào vùng ngoài nội dung (backdrop) thì đóng — target là chính <dialog> chỉ khi
          // không nhấp trúng phần tử con nào bên trong.
          if (e.target === e.currentTarget) ref.current?.close();
        }}
        className="m-auto max-h-[80vh] w-[min(640px,92vw)] overflow-y-auto rounded-xl bg-[#0f1c2b] p-6 text-[#e8dcc2] backdrop:bg-black/60"
      >
        <h2 id="credits-dialog-title" className="mb-3 font-bold text-lg">
          {COPY.credits}
        </h2>
        <p className="mb-2 text-sm">
          {COPY.creditsBoundariesLabel}{' '}
          <a
            className="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]"
            href={COPY.creditsBoundariesSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {COPY.creditsBoundariesSourceName}
          </a>{' '}
          {COPY.creditsBoundariesNote}
        </p>
        <p className="mb-2 text-sm">{COPY.creditsMapTechnique}</p>
        <h3 className="mb-2 font-semibold">{COPY.creditsMusicHeading}</h3>
        <ul className="mb-3 space-y-1 text-xs">
          {TRACKS.map((t) => (
            <li key={t.src}>
              <span className="font-semibold">{t.title}</span> — {t.author} ·{' '}
              <a
                className="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]"
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.license}
              </a>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 font-semibold">{COPY.creditsFlagsHeading}</h3>
        <p className="mb-3 text-xs opacity-80">{COPY.creditsFlagsOnLandNote}</p>
        <ul className="space-y-1 text-xs">
          {POLITIES.map((p) => (
            <li key={p.id}>
              <span className="font-semibold">{p.name}</span> — {COPY.flagKind[p.flagKind]}.{' '}
              {p.flagCredit ? (
                <a
                  className="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]"
                  href={p.flagCredit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.flagCredit.author ?? COPY.flagSourceFallback} · {p.flagCredit.license}
                </a>
              ) : (
                COPY.creditsNoCredit
              )}
            </li>
          ))}
        </ul>
        <form method="dialog" className="mt-4 text-right">
          <button
            type="submit"
            className="rounded-full border border-white/30 px-4 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1]"
          >
            {COPY.close}
          </button>
        </form>
      </dialog>
    </>
  );
}
