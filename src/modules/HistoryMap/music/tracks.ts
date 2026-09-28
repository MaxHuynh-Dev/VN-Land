export interface Track {
  title: string;
  author: string;
  license: string;
  sourceUrl: string;
  src: string;
}

/** Nhạc nền dàn nhạc (CC BY 3.0), phát luân phiên và lặp lại. Ghi công trong hộp "Nguồn & ghi công". */
export const TRACKS: Track[] = [
  {
    title: 'Five Armies',
    author: 'Kevin MacLeod (incompetech.com)',
    license: 'CC BY 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Five_Armies_(ISRC_USUAN1100875).mp3',
    src: '/audio/five-armies.mp3'
  },
  {
    title: 'Heroic Age',
    author: 'Kevin MacLeod (incompetech.com)',
    license: 'CC BY 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Heroic_Age_(ISRC_USUAN1100848).mp3',
    src: '/audio/heroic-age.mp3'
  }
];
