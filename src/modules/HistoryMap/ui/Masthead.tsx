import type React from 'react';
import { COPY } from '../copy';

export default function Masthead(): React.ReactElement {
  return (
    <header className="pointer-events-none absolute top-6 left-6 text-[#e8dcc2] drop-shadow-lg md:top-10 md:left-10">
      <p className="text-xs uppercase tracking-[0.3em] opacity-70">{COPY.eyebrow}</p>
      <h1 className="font-extrabold text-4xl tracking-wider md:text-6xl">{COPY.title}</h1>
      <p className="text-sm italic opacity-80 md:text-base">{COPY.subtitle}</p>
    </header>
  );
}
