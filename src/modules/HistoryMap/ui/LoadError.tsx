import type React from 'react';
import { COPY } from '../copy';

export default function LoadError({ onRetry }: { onRetry: () => void }): React.ReactElement {
  return (
    <div
      role="alert"
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#e8dcc2]"
    >
      <p>{COPY.loadError}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-[#e8dcc2]/40 px-5 py-2 hover:bg-white/10"
      >
        {COPY.retry}
      </button>
    </div>
  );
}
