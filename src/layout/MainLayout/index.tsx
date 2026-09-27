import GridDebug from '@Components/GridDebug';
import type React from 'react';
import type { PropsWithChildren } from 'react';

export default function MainLayout({ children }: PropsWithChildren): React.ReactElement {
  return (
    <>
      {children}
      <GridDebug />
    </>
  );
}
