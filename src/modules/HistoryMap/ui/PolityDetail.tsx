'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { POLITY_BY_ID, SNAPSHOTS } from '@/data/history';
import { COPY } from '../copy';
import { effectivePolity } from '../lib/resolve';
import { selectedPolity, snapshotIndex } from '../state/store';
import FlagThumb from './FlagThumb';
import SourceList from './SourceList';

export default function PolityDetail({ id }: { id: string }): React.ReactElement {
  useSignals();
  const p = effectivePolity(POLITY_BY_ID, SNAPSHOTS, snapshotIndex.value, id);
  return (
    <div data-testid="polity-detail" aria-live="polite">
      <button
        type="button"
        onClick={() => {
          selectedPolity.value = null;
        }}
        className="mb-3 flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
      >
        <ArrowLeft size={14} /> {COPY.back}
      </button>
      <FlagThumb polity={p} className="h-20 w-32" />
      <p className="mt-3 text-[11px] uppercase tracking-wider opacity-60">
        {COPY.flagKind[p.flagKind]}
      </p>
      <h2 className="font-bold text-xl">{p.name}</h2>
      {p.altNames?.length ? <p className="text-xs opacity-60">{p.altNames.join(' · ')}</p> : null}
      <dl className="mt-3 space-y-1 text-sm">
        <div>
          <dt className="inline opacity-60">{COPY.period}: </dt>
          <dd className="inline">{p.period}</dd>
        </div>
        {p.capital && (
          <div>
            <dt className="inline opacity-60">{COPY.capital}: </dt>
            <dd className="inline">{p.capital}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 font-semibold text-xs uppercase tracking-wider opacity-60">
        {COPY.flagNote}
      </p>
      <p className="text-sm leading-relaxed opacity-85">{p.flagNote}</p>
      {p.flagCredit && (
        <p className="mt-1 text-[11px] opacity-60">
          <a
            href={p.flagCredit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {p.flagCredit.author ?? 'Wikimedia Commons'}
          </a>{' '}
          · {p.flagCredit.license}
        </p>
      )}
      <SourceList sources={p.sources} />
    </div>
  );
}
