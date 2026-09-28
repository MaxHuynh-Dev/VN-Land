import type React from 'react';
import type { Source } from '@/data/history/types';
import { COPY } from '../copy';

export default function SourceList({ sources }: { sources: Source[] }): React.ReactElement {
  return (
    <div className="mt-4 border-white/10 border-t pt-3 text-xs opacity-75">
      <p className="mb-1 font-semibold uppercase tracking-wider">{COPY.sources}</p>
      <ul className="space-y-1">
        {sources.map((s) => (
          <li key={`${s.title}-${s.url ?? ''}`}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/30 hover:decoration-white"
              >
                {s.title}
              </a>
            ) : (
              s.title
            )}
            {s.author && ` — ${s.author}`}
            {s.note && <span className="opacity-70"> ({s.note})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
