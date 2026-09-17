import type { Vehicle } from '../types';
import { VEHICLES } from './business';

/**
 * Fleet presentation metadata — frontend only.
 * Real photographs (if ever added) live under public/cars/<photoDir>/.
 * When a folder is empty or a file fails to load, the UI falls back to
 * a refined VehicleArt placeholder. Photos are never mixed between vehicles.
 */
export interface FleetMeta {
  slug: string;
  photoDir: string;
  tag: string;
  headline: string;
  highlights: string[];
}

export const FLEET_META: Record<string, FleetMeta> = {
  'xpander-at': {
    slug: 'xpander',
    photoDir: 'Mitsubishi-Xpander',
    tag: 'Flagship MPV',
    headline: 'Room for seven. Composure for every road.',
    highlights: ['7-seater MPV', 'Automatic', 'Family + long journeys'],
  },
  'avanza-at': {
    slug: 'avanza',
    photoDir: 'Toyota-Avanza',
    tag: 'Dependable MPV',
    headline: 'Practical comfort for group travel.',
    highlights: ['7-seater MPV', 'Automatic', 'Everyday itineraries'],
  },
  'dzire-mt': {
    slug: 'dzire-mt',
    photoDir: 'Suzuki-Dzire-MT',
    tag: 'Efficient Sedan',
    headline: 'Straightforward economy for local trips.',
    highlights: ['Sedan', 'Manual', 'Business + local travel'],
  },
  'dzire-at-2025': {
    slug: 'dzire-at',
    photoDir: 'Suzuki-Dzire-AT',
    tag: '2025 Sedan · AT',
    headline: 'Composed, easy driving for city and province.',
    highlights: ['Sedan', 'Automatic', '4 + 1 driver'],
  },
};

export function vehicleSlug(v: Vehicle): string {
  return FLEET_META[v.id]?.slug ?? v.id;
}

export function vehicleBySlug(slug: string): Vehicle | undefined {
  const entry = Object.entries(FLEET_META).find(([, m]) => m.slug === slug);
  if (!entry) return VEHICLES.find((v) => v.id === slug);
  return VEHICLES.find((v) => v.id === entry[0]);
}

export function vehicleMeta(id: string): FleetMeta | undefined {
  return FLEET_META[id];
}

/** Candidate photo file names probed inside public/cars/<dir>/. */
function candidatesFor(dir: string): string[] {
  const stems = ['1', '2', '3', '4', '5', '6', 'front', 'side', 'rear', 'interior', 'main'];
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  const out: string[] = [];
  for (const s of stems.slice(0, 6)) out.push(`/cars/${dir}/${s}.jpg`);
  for (const s of stems) {
    for (const e of exts) {
      const p = `/cars/${dir}/${s}.${e}`;
      if (!out.includes(p)) out.push(p);
    }
  }
  return out.slice(0, 24);
}

function probe(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const photoCache = new Map<string, string[]>();
const probeCache = new Map<string, Promise<string[]>>();

/** Loads only photographs that actually exist — never invents imagery. */
export function fetchVehiclePhotos(photoDir: string): Promise<string[]> {
  const cached = photoCache.get(photoDir);
  if (cached) return Promise.resolve(cached);
  const inflight = probeCache.get(photoDir);
  if (inflight) return inflight;
  const p = (async () => {
    const found: string[] = [];
    for (const c of candidatesFor(photoDir)) {
      // Probe sequentially and stop once we have a solid set or ran out.
      // Sequential keeps 404 noise low when folders are empty.
      const hit = await probe(c);
      if (hit) {
        found.push(hit);
        if (found.length >= 6) break;
      }
      // If the canonical 1.jpg 404s and nothing found after 6 probes, bail early.
      if (found.length === 0 && c.endsWith('6.jpg')) break;
    }
    photoCache.set(photoDir, found);
    return found;
  })();
  probeCache.set(photoDir, p);
  return p;
}
