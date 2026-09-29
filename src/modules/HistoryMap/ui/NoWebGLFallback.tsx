import type React from 'react';
import { SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';

export default function NoWebGLFallback(): React.ReactElement {
  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto p-6 text-[#e8dcc2] md:p-12">
      <p className="mb-6 max-w-2xl opacity-80">{COPY.noWebGL}</p>
      <ol className="max-w-2xl space-y-4">
        {SNAPSHOTS.map((s) => (
          <li key={s.id}>
            <p className="text-sm opacity-60">{s.yearLabel}</p>
            <h2 className="font-semibold text-lg">{s.title}</h2>
            <p className="opacity-85">{s.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
