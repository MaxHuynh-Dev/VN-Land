'use client';

import dynamic from 'next/dynamic';

const HistoryMap = dynamic(() => import('./HistoryMap'), {
  ssr: false,
  loading: () => (
    <main
      data-testid="history-map-root"
      data-status="loading"
      className="fixed inset-0 bg-[#0a1420]"
    />
  )
});

export default HistoryMap;
