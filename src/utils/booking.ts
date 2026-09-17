import type { BookingDraft, SelfDriveZone, VehicleRate } from '../types';

/** Inclusive rental-day count. Same-day pickup/return = 1 day. */
export function rentalDaysBetween(pickup: string, ret: string): number {
  if (!pickup || !ret) return 0;
  const a = new Date(`${pickup}T00:00:00`);
  const b = new Date(`${ret}T00:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return Number.isFinite(diff) ? diff : 0;
}

/** Per-vehicle zone rate. Each unit is priced by destination zone. */
export function rateForVehicleRate(rates: VehicleRate[], zone: SelfDriveZone): number {
  const found = rates.find((r) => r.zone === zone);
  return found ? found.amountPerDay : 0;
}

/** Self-drive estimate only. With-driver totals are never invented. */
export function estimateSelfDrive(
  draft: BookingDraft,
  rates: VehicleRate[],
): { days: number; amount: number | null } {
  const days = rentalDaysBetween(draft.pickupDate, draft.returnDate);
  if (draft.rentalType !== 'self-drive' || days <= 0) return { days, amount: null };
  return { days, amount: days * rateForVehicleRate(rates, draft.selfDriveZone) };
}

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReference(): string {
  let suffix = '';
  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);
  for (let i = 0; i < 6; i++) suffix += REF_CHARS[buf[i] % REF_CHARS.length];
  return `GD-${suffix}`;
}

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

export function formatDateLong(iso: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function nextDaysISO(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const t = new Date(d);
    t.setDate(d.getDate() + i);
    out.push(
      `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(
        t.getDate(),
      ).padStart(2, '0')}`,
    );
  }
  return out;
}

export function isValidPHMobile(mobile: string): boolean {
  return /^09\d{9}$/.test(mobile.replace(/[\s-]/g, ''));
}

export function isValidEmailOptional(email: string): boolean {
  if (!email.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
