import '@Styles/global.css';

import { beVietnam } from '@Constants/fonts';
import { DEFAULT_METADATA } from '@Constants/metadata';
import MainLayout from '@Layout/MainLayout';
import { uiHelper } from '@Utils/uiHelper';
import type { Metadata } from 'next';
import Script from 'next/script';
import type React from 'react';

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="vi">
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for scroll restoration control
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration = 'manual'`
          }}
        />
        {uiHelper.isDevelopment() && (
          <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        )}
      </head>
      <body className={`${beVietnam.variable} font-[family-name:var(--font-be-vietnam)]`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
