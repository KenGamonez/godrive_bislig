import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Booking,
  BookingPayment,
  BookingStatus,
  BusinessSettings,
  ContactMessage,
  ContactMessageStatus,
  NewBookingPayment,
  NewContactMessage,
  NewVehicleInput,
  Vehicle,
  VehicleAvailability,
  VehicleRate,
} from '../types';

/* ============================================================
   Supabase connection + row mapping.
   Public anon key only — never a service-role secret.
   When env vars are absent the app runs fully local (demo data).
   ============================================================ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export function isCloudEnabled(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isCloudEnabled()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL as string, SUPABASE_KEY as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

/* ---------- row shapes (snake_case over the wire) ---------- */

interface VehicleRow {
  id: string;
  name: string;
  body_type: string;
  transmission: string;
  capacity: string | null;
  year: number | null;
  seats: string;
  blurb: string;
  silhouette: string;
  starting_rate_per_day: number;
  status: string;
  maintenance: string;
  photo_url: string | null;
  rates: VehicleRate[];
}

interface BookingRow {
  id: string;
  reference: string;
  customer_id: string | null;
  vehicle_id: string;
  rental_type: string;
  pickup_date: string;
  return_date: string;
  destination: string;
  self_drive_zone: string | null;
  with_driver_zone: string | null;
  full_name: string;
  mobile: string;
  email: string | null;
  notes: string;
  rental_days: number;
  estimated_amount: number | null;
  status: string;
  created_at: string;
}

interface CustomerRow {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  notes: string;
}

interface MessageRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface PaymentRow {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  paid_at: string;
  note: string;
  created_at: string;
}

interface SettingsRow {
  business_name: string;
  tagline: string;
  contact_person: string;
  phone: string;
  pickup: string;
  facebook: string;
  facebook_url: string;
  with_driver_rate_unit_note: string;
  driver_expense_note: string;
  with_driver_rates: BusinessSettings['withDriverRates'];
  booking_notice: string;
}

/* ---------- mappers ---------- */

function asAvailability(v: string): VehicleAvailability {
  return v === 'Available' || v === 'Reserved' || v === 'Unavailable' || v === 'Inactive'
    ? v
    : 'Available';
}

export function vehicleFromRow(r: VehicleRow): Vehicle & { status: VehicleAvailability; photoUrl?: string } {
  return {
    id: r.id,
    name: r.name,
    bodyType: r.body_type,
    transmission: r.transmission === 'Manual' ? 'Manual' : 'Automatic',
    capacity: r.capacity ?? undefined,
    year: r.year ?? undefined,
    silhouette: r.silhouette === 'mpv' ? 'mpv' : 'sedan',
    startingRatePerDay: r.starting_rate_per_day,
    seats: r.seats,
    blurb: r.blurb,
    rates: Array.isArray(r.rates) ? r.rates : [],
    status: asAvailability(r.status),
    photoUrl: r.photo_url ?? undefined,
  };
}

export function bookingFromRow(r: BookingRow): Booking {
  return {
    id: r.id,
    reference: r.reference,
    vehicleId: r.vehicle_id,
    rentalType: r.rental_type === 'with-driver' ? 'with-driver' : 'self-drive',
    pickupDate: r.pickup_date,
    returnDate: r.return_date,
    destination: r.destination,
    selfDriveZone: (r.self_drive_zone ?? 'bislig-city') as Booking['selfDriveZone'],
    withDriverZone: (r.with_driver_zone ?? 'within-caraga-davao') as Booking['withDriverZone'],
    fullName: r.full_name,
    mobile: r.mobile,
    email: r.email ?? '',
    notes: r.notes ?? '',
    rentalDays: r.rental_days,
    estimatedAmount: r.estimated_amount === null ? null : Number(r.estimated_amount),
    status: r.status as BookingStatus,
    createdAt: r.created_at,
  };
}

export function customerFromRow(r: CustomerRow): { id: string; name: string; mobile: string; email?: string; notes: string } {
  return {
    id: r.id,
    name: r.name,
    mobile: r.mobile,
    email: r.email ?? undefined,
    notes: r.notes ?? '',
  };
}

export function messageFromRow(r: MessageRow): ContactMessage {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email ?? undefined,
    subject: r.subject,
    message: r.message,
    status: r.status as ContactMessageStatus,
    createdAt: r.created_at,
  };
}

export function paymentFromRow(r: PaymentRow): BookingPayment {
  return {
    id: r.id,
    bookingId: r.booking_id,
    amount: Number(r.amount),
    method: r.method as BookingPayment['method'],
    paidAt: r.paid_at,
    note: r.note ?? '',
    createdAt: r.created_at,
  };
}

export function settingsFromRow(r: SettingsRow, fallback: BusinessSettings): BusinessSettings {
  return {
    businessName: r.business_name || fallback.businessName,
    tagline: r.tagline ?? fallback.tagline,
    contactPerson: r.contact_person ?? fallback.contactPerson,
    phone: r.phone || fallback.phone,
    pickup: r.pickup || fallback.pickup,
    facebook: r.facebook ?? fallback.facebook,
    facebookUrl: r.facebook_url || fallback.facebookUrl,
    withDriverRateUnitNote: r.with_driver_rate_unit_note ?? fallback.withDriverRateUnitNote,
    driverExpenseNote: r.driver_expense_note ?? fallback.driverExpenseNote,
    withDriverRates: Array.isArray(r.with_driver_rates) && r.with_driver_rates.length > 0
      ? r.with_driver_rates
      : fallback.withDriverRates,
    bookingNotice: r.booking_notice ?? fallback.bookingNotice,
  };
}

/* ---------- RPC wrappers ---------- */

export async function rpcCreateBooking(input: {
  vehicleId: string;
  rentalType: string;
  pickupDate: string;
  returnDate: string;
  destination: string;
  selfDriveZone: string;
  withDriverZone: string;
  fullName: string;
  mobile: string;
  email: string;
  notes: string;
  reference: string;
}): Promise<{ booking?: Booking; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Backend is not connected.' };
  const { data, error } = await sb.rpc('create_booking', {
    payload: {
      vehicle_id: input.vehicleId,
      rental_type: input.rentalType,
      pickup_date: input.pickupDate,
      return_date: input.returnDate,
      destination: input.destination,
      self_drive_zone: input.selfDriveZone,
      with_driver_zone: input.withDriverZone,
      full_name: input.fullName,
      mobile: input.mobile,
      email: input.email,
      notes: input.notes,
      reference: input.reference,
    },
  });
  if (error) return { error: error.message };
  if (!data) return { error: 'Empty response from booking service.' };
  try {
    return { booking: bookingFromRow(data as BookingRow) };
  } catch {
    return { error: 'Could not read the saved booking.' };
  }
}

export async function rpcLookupBooking(
  reference: string,
  identifier: string,
): Promise<{ booking?: Booking & { vehicleName?: string }; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Backend is not connected.' };
  const { data, error } = await sb.rpc('get_booking_by_reference', {
    p_reference: reference,
    p_identifier: identifier,
  });
  if (error) return { error: error.message };
  if (!data) return {};
  const row = data as BookingRow & { vehicle_name?: string };
  const booking = bookingFromRow(row);
  return { booking: { ...booking, vehicleName: row.vehicle_name } };
}

export async function submitContactMessage(
  input: NewContactMessage,
): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Backend is not connected.' };
  const { error } = await sb.from('contact_messages').insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    subject: input.subject,
    message: input.message.trim(),
    status: 'unread',
  });
  return error ? { error: error.message } : {};
}

export async function recordPayment(
  input: NewBookingPayment,
): Promise<{ payment?: BookingPayment; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Backend is not connected.' };
  const { data, error } = await sb
    .from('booking_payments')
    .insert({
      booking_id: input.bookingId,
      amount: input.amount,
      method: input.method,
      paid_at: input.paidAt,
      note: input.note ?? '',
    })
    .select()
    .single();
  if (error) return { error: error.message };
  return { payment: paymentFromRow(data as PaymentRow) };
}

export async function createVehicleRecord(
  input: NewVehicleInput,
): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Backend is not connected.' };
  const id = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || `vehicle-${Date.now()}`;
  const starting = Math.min(...input.rates.map((r) => r.amountPerDay));
  const { error } = await sb.from('vehicles').insert({
    id,
    name: input.name.trim(),
    body_type: input.bodyType.trim(),
    transmission: input.transmission,
    seats: input.seats.trim(),
    capacity: input.capacity?.trim() || null,
    year: input.year ?? null,
    silhouette: input.silhouette,
    blurb: input.blurb.trim(),
    photo_url: input.photoUrl?.trim() || null,
    starting_rate_per_day: starting,
    status: input.status,
    maintenance: 'Good',
    rates: input.rates,
  });
  return error ? { error: error.message } : {};
}
