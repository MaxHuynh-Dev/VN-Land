export const LON0 = 107.5;
export const LAT0 = 16.5;
export const SCALE = 6;
export const DEPTH = 1.2;
const KLON = Math.cos((LAT0 * Math.PI) / 180);

export const px = (lon: number): number => (lon - LON0) * KLON * SCALE;
export const pz = (lat: number): number => -(lat - LAT0) * SCALE;
export const unprojectX = (x: number): number => x / (KLON * SCALE) + LON0;
export const unprojectZ = (z: number): number => -z / SCALE + LAT0;
