import { DEFAULT_METADATA } from '@Constants/metadata';
import HistoryMap from '@Modules/HistoryMap';
import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  title: 'Việt Nam — Mở mang bờ cõi',
  description: 'Bản đồ 3D lịch sử lãnh thổ Việt Nam từ thời đồ đá đến nay.'
};

export default function Home(): React.ReactElement {
  return <HistoryMap />;
}
