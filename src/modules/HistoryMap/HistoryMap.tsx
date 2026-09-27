'use client';

import { useSignalEffect } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import type { ThreeEvent } from '@react-three/fiber';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { COPY } from './copy';
import { CellStateStore } from './lib/cellState';
import { loadMapData, type MapData } from './lib/loadMapData';
import { ownerMask } from './lib/polities';
import { hasWebGL } from './lib/webgl';
import Scene from './scene/Scene';
import {
  hoveredPolity,
  playing,
  pointerPos,
  reducedMotion,
  selectedPolity,
  snapshotIndex
} from './state/store';
import { useTimelineControls } from './state/useTimelineControls';
import CellTooltip from './ui/CellTooltip';
import InfoCard from './ui/InfoCard';
import LoadError from './ui/LoadError';
import Masthead from './ui/Masthead';
import NoWebGLFallback from './ui/NoWebGLFallback';
import PolityDetail from './ui/PolityDetail';
import Timeline from './ui/Timeline';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'nowebgl' }
  | { status: 'ready'; data: MapData };

function ReadyView({ data }: { data: MapData }): React.ReactElement {
  useSignals();
  const store = useMemo(() => new CellStateStore(data.cells.length), [data]);

  // làm nổi cả lãnh thổ đang hover; tính lại khi đổi mốc
  useSignalEffect(() => {
    const owners = data.owners[snapshotIndex.value];
    const id = hoveredPolity.value ?? selectedPolity.value;
    store.setLiftMask(reducedMotion() ? null : ownerMask(owners, id));
  });

  // đổi mốc mà chính thể đang chọn không còn tồn tại thì bỏ chọn
  useSignalEffect(() => {
    const owners = data.owners[snapshotIndex.value];
    const sel = selectedPolity.peek();
    if (sel && !owners.includes(sel)) selectedPolity.value = null;
  });

  // Esc bỏ chọn
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') selectedPolity.value = null;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onHoverCell = useCallback(
    (cell: number | null, e: ThreeEvent<PointerEvent>) => {
      const id = cell === null ? null : data.owners[snapshotIndex.peek()][cell];
      if (hoveredPolity.peek() !== id) hoveredPolity.value = id;
      pointerPos.value = id ? { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY } : null;
    },
    [data]
  );
  const onClickCell = useCallback(
    (cell: number) => {
      selectedPolity.value = data.owners[snapshotIndex.peek()][cell];
    },
    [data]
  );
  const onMissed = useCallback(() => {
    selectedPolity.value = null;
  }, []);

  return (
    <>
      <Scene
        data={data}
        store={store}
        onHoverCell={onHoverCell}
        onClickCell={onClickCell}
        onMissed={onMissed}
      />
      <CellTooltip />
      <aside className="absolute top-24 right-4 bottom-40 w-[340px] overflow-y-auto rounded-xl bg-[#0a1420]/80 p-5 shadow-2xl backdrop-blur md:top-8 md:right-8">
        {selectedPolity.value ? (
          <PolityDetail id={selectedPolity.value} />
        ) : (
          <InfoCard data={data} />
        )}
      </aside>
      <Timeline />
    </>
  );
}

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
      {state.status === 'ready' && <ReadyView data={state.data} />}
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
