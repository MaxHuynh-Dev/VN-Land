import * as THREE from 'three';
import type { CellMeta } from './cells';

export const TRANSITION_S = 0.8;
export const LIFT_MAX = 0.8;
export const NULL_COLOR = '#6b6358';
const HOVER_LIFT = 0.5; // tỉ lệ của LIFT_MAX
const PULSE_LIFT = 0.6;

const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class CellStateStore {
  readonly count: number;
  readonly width: number;
  readonly height: number;
  readonly data: Float32Array;
  private from: Float32Array;
  private to: Float32Array;
  private elapsed: Float32Array;
  private delay: Float32Array;
  private changed: Uint8Array;
  private lift: Float32Array;
  private liftTarget: Float32Array;
  private animating = false;
  private dirty = true;

  constructor(count: number) {
    this.count = count;
    this.width = 2 ** Math.ceil(Math.log2(Math.ceil(Math.sqrt(Math.max(1, count)))));
    this.height = Math.ceil(count / this.width);
    this.data = new Float32Array(this.width * this.height * 4);
    this.from = new Float32Array(count * 3);
    this.to = new Float32Array(count * 3);
    this.elapsed = new Float32Array(count).fill(Number.POSITIVE_INFINITY);
    this.delay = new Float32Array(count);
    this.changed = new Uint8Array(count);
    this.lift = new Float32Array(count);
    this.liftTarget = new Float32Array(count);
  }

  private currentColor(i: number, k: number): number {
    const t = ease(Math.min(1, Math.max(0, (this.elapsed[i] - this.delay[i]) / TRANSITION_S)));
    return this.from[i * 3 + k] + (this.to[i * 3 + k] - this.from[i * 3 + k]) * t;
  }

  setColors(rgb: Float32Array, opts: { animate?: boolean; delays?: Float32Array } = {}): void {
    for (let i = 0; i < this.count; i++) {
      const cur = [0, 1, 2].map((k) => this.currentColor(i, k));
      const same = cur.every((v, k) => Math.abs(v - rgb[i * 3 + k]) < 1e-4);
      for (let k = 0; k < 3; k++) {
        this.from[i * 3 + k] = opts.animate ? cur[k] : rgb[i * 3 + k];
        this.to[i * 3 + k] = rgb[i * 3 + k];
      }
      this.changed[i] = opts.animate && !same ? 1 : 0;
      this.delay[i] = opts.animate ? (opts.delays?.[i] ?? 0) : 0;
      this.elapsed[i] = opts.animate && !same ? 0 : Number.POSITIVE_INFINITY;
    }
    this.animating = !!opts.animate;
    this.dirty = true;
  }

  setLiftMask(mask: Uint8Array | null): void {
    for (let i = 0; i < this.count; i++) this.liftTarget[i] = mask?.[i] ? HOVER_LIFT : 0;
    this.dirty = true;
  }

  isAnimating(): boolean {
    return this.animating;
  }

  tick(dt: number): boolean {
    let active = false;
    let liftMoving = false;
    const k = Math.min(1, dt * 10);
    for (let i = 0; i < this.count; i++) {
      if (this.elapsed[i] !== Number.POSITIVE_INFINITY) {
        this.elapsed[i] += dt;
        if (this.elapsed[i] - this.delay[i] >= TRANSITION_S)
          this.elapsed[i] = Number.POSITIVE_INFINITY;
        else active = true;
      }
      const d = this.liftTarget[i] - this.lift[i];
      if (Math.abs(d) > 1e-4) {
        this.lift[i] = Math.abs(d) < 1e-3 ? this.liftTarget[i] : this.lift[i] + d * k;
        liftMoving = true;
      }
    }
    if (!active && !liftMoving && !this.dirty && !this.animating) return false;
    for (let i = 0; i < this.count; i++) {
      for (let c = 0; c < 3; c++) this.data[i * 4 + c] = this.currentColor(i, c);
      let pulse = 0;
      if (this.changed[i] && this.elapsed[i] !== Number.POSITIVE_INFINITY) {
        const p = Math.min(1, Math.max(0, (this.elapsed[i] - this.delay[i]) / TRANSITION_S));
        pulse = Math.sin(Math.PI * p) * PULSE_LIFT;
      }
      this.data[i * 4 + 3] = Math.min(1, pulse + this.lift[i]);
    }
    this.animating = active;
    this.dirty = false;
    return true;
  }
}

export function ownerColors(
  owners: (string | null)[],
  colorOf: (id: string) => string
): Float32Array {
  const out = new Float32Array(owners.length * 3);
  const cache = new Map<string, THREE.Color>();
  owners.forEach((o, i) => {
    const hex = o === null ? NULL_COLOR : colorOf(o);
    let c = cache.get(hex);
    if (!c) {
      c = new THREE.Color(hex);
      cache.set(hex, c);
    }
    out[i * 3] = c.r;
    out[i * 3 + 1] = c.g;
    out[i * 3 + 2] = c.b;
  });
  return out;
}

export function spreadDelays(
  cells: CellMeta[],
  prev: (string | null)[],
  next: (string | null)[]
): Float32Array {
  const out = new Float32Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    if (prev[i] === next[i] || next[i] === null) continue;
    let best = Number.POSITIVE_INFINITY;
    for (let j = 0; j < cells.length; j++) {
      if (prev[j] !== next[i]) continue;
      const d = Math.hypot(cells[i].lon - cells[j].lon, cells[i].lat - cells[j].lat);
      if (d < best) best = d;
    }
    out[i] = best === Number.POSITIVE_INFINITY ? 0 : Math.min(1.2, best * 0.12);
  }
  return out;
}
