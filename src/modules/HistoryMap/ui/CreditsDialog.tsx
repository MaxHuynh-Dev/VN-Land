'use client';

import type React from 'react';
import { useRef } from 'react';
import { POLITIES } from '@/data/history';
import { COPY } from '../copy';

export default function CreditsDialog(): React.ReactElement {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="absolute top-6 right-6 z-10 rounded-full bg-[#0a1420]/70 px-3 py-1 text-xs opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f4e3c1] md:top-auto md:right-auto md:bottom-40 md:left-10"
      >
        {COPY.credits}
      </button>
      <dialog
        ref={ref}
        className="m-auto max-h-[80vh] w-[min(640px,92vw)] overflow-y-auto rounded-xl bg-[#0f1c2b] p-6 text-[#e8dcc2] backdrop:bg-black/60"
      >
        <h2 className="mb-3 font-bold text-lg">{COPY.credits}</h2>
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
