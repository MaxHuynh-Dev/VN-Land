'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { COPY } from './copy';
import { loadMapData, type MapData } from './lib/loadMapData';
import { hasWebGL } from './lib/webgl';
import Scene from './scene/Scene';
import { playing } from './state/store';
import { useTimelineControls } from './state/useTimelineControls';
import LoadError from './ui/LoadError';
import Masthead from './ui/Masthead';
import NoWebGLFallback from './ui/NoWebGLFallback';
import Timeline from './ui/Timeline';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'nowebgl' }
  | { status: 'ready'; data: MapData };

export default function HistoryMap(): React.ReactElement {
  useTimelineControls();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: attempt chỉ để buộc effect chạy lại khi bấm "Thử lại", không dùng trong thân effect.
  useEffect(() => {
    if (!hasWebGL()) {
      setState({ status: 'nowebgl' });
      return;
    }
    const ac = new AbortController();
    setState({ status: 'loading' });
    loadMapData(ac.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setState({ status: 'error' });
      });
    return () => ac.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return (
    <main
      data-testid="history-map-root"
      data-status={state.status}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).tagName === 'CANVAS') playing.value = false;
      }}
      className="fixed inset-0 overflow-hidden bg-[#0a1420] text-[#e8dcc2]"
    >
      {state.status === 'ready' && <Scene data={state.data} />}
      {state.status === 'ready' && <Timeline />}
      {state.status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-80">
          {COPY.loading}
        </div>
      )}
      {state.status === 'error' && <LoadError onRetry={retry} />}
      {state.status === 'nowebgl' && <NoWebGLFallback />}
      {state.status !== 'nowebgl' && <Masthead />}
    </main>
  );
}
