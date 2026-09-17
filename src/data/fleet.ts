import type { Vehicle } from '../types';
import { VEHICLES } from './business';

/**
 * Fleet presentation metadata — frontend only.
 * Real photographs live under public/cars/<photoDir>/, copied from the
 * business-provided assets. Each vehicle's list contains ONLY its own
 * photographs, ordered with the best exterior first. Photos are never
 * mixed between vehicles.
 */
export interface VehiclePhotoEntry {
  src: string;
  label: string;
}

export interface FleetMeta {
  slug: string;
  photoDir: string;
  tag: string;
  headline: string;
  highlights: string[];
  photos: VehiclePhotoEntry[];
}

export const FLEET_META: Record<string, FleetMeta> = {
  'xpander-at': {
    slug: 'xpander',
    photoDir: 'mitsubishi-xpander',
    tag: 'GLS Flagship MPV',
    headline: 'Room for seven. Composure for every road.',
    highlights: ['7-Seater MPV', 'Automatic', '7 passengers + 1 driver'],
    photos: [
      { src: '/cars/mitsubishi-xpander/exterior.jpg', label: 'Exterior' },
      { src: '/cars/mitsubishi-xpander/front-seats.jpg', label: 'Front seats' },
      { src: '/cars/mitsubishi-xpander/rear-cabin.jpg', label: 'Rear cabin' },
      { src: '/cars/mitsubishi-xpander/console.jpg', label: 'Console' },
    ],
  },
  'avanza-at': {
    slug: 'avanza',
    photoDir: 'toyota-avanza',
    tag: 'Dependable MPV',
    headline: 'Practical comfort for group travel.',
    highlights: ['7-Seater MPV', 'Automatic', '7 passengers + 1 driver'],
    photos: [
      { src: '/cars/toyota-avanza/exterior.jpg', label: 'Exterior' },
      { src: '/cars/toyota-avanza/front.jpg', label: 'Front' },
      { src: '/cars/toyota-avanza/cockpit.jpg', label: 'Cockpit' },
      { src: '/cars/toyota-avanza/front-cabin.jpg', label: 'Front cabin' },
      { src: '/cars/toyota-avanza/second-row.jpg', label: 'Second row' },
      { src: '/cars/toyota-avanza/third-row.jpg', label: 'Third row' },
      { src: '/cars/toyota-avanza/cargo.jpg', label: 'Cargo' },
    ],
  },
  'dzire-mt': {
    slug: 'dzire-mt',
    photoDir: 'suzuki-dzire-mt',
    tag: 'Efficient Sedan',
    headline: 'Straightforward economy for local trips.',
    highlights: ['Sedan', 'Manual', '4 passengers + 1 driver'],
    photos: [
      { src: '/cars/suzuki-dzire-mt/exterior.jpg', label: 'Exterior' },
      { src: '/cars/suzuki-dzire-mt/front-seats.jpg', label: 'Front seats' },
      { src: '/cars/suzuki-dzire-mt/back-seats.jpg', label: 'Back seats' },
      { src: '/cars/suzuki-dzire-mt/dashboard.jpg', label: 'Dashboard' },
    ],
  },
  'dzire-at-2025': {
    slug: 'dzire-at',
    photoDir: 'suzuki-dzire-at',
    tag: '2024 Sedan · AT',
    headline: 'Composed, easy driving for city and province.',
    highlights: ['Sedan', 'Automatic', '4 passengers + 1 driver'],
    photos: [
      { src: '/cars/suzuki-dzire-at/exterior.jpg', label: 'Exterior' },
      { src: '/cars/suzuki-dzire-at/front.jpg', label: 'Front' },
      { src: '/cars/suzuki-dzire-at/rear.jpg', label: 'Rear' },
      { src: '/cars/suzuki-dzire-at/cockpit.jpg', label: 'Cockpit' },
      { src: '/cars/suzuki-dzire-at/driver-seat.jpg', label: 'Driver seat' },
      { src: '/cars/suzuki-dzire-at/rear-console.jpg', label: 'Rear console' },
    ],
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

/** Minimum self-drive daily rate across the whole fleet. */
export function fleetStartingRate(): number {
  return Math.min(...VEHICLES.map((v) => v.startingRatePerDay));
}
