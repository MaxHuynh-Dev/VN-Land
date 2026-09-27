import { px, pz } from './projection';

export interface Pose {
  position: [number, number, number];
  target: [number, number, number];
}

const POLAR = 0.75; // rad tính từ phương thẳng đứng

export function focusPose(lon: number, lat: number, distance: number): Pose {
  const tx = px(lon);
  const tz = pz(lat);
  return {
    target: [tx, 0, tz],
    position: [tx, Math.cos(POLAR) * distance, tz + Math.sin(POLAR) * distance]
  };
}

export function distanceForArea(areaKm2: number): number {
  return Math.max(50, Math.min(180, Math.sqrt(areaKm2) / 4));
}
