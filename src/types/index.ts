/**
 * GoDrive Bislig — Frontend domain contracts.
 *
 * These types are the single source of truth for the UI today and are
 * deliberately shaped so a future Supabase/backend layer can replace the
 * mock repository (see src/data/) without redesigning any component.
 *
 * Future mapping sketch (no backend code in this build):
 *   vehicles        -> public.vehicles table
 *   bookings        -> public.bookings table
 *   customers       -> public.customers table
 *   businessSettings-> public.business_settings (single row)
 */

export type RentalType = 'self-drive' | 'with-driver';

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled';

export type VehicleAvailability = 'Available' | 'Reserved' | 'Unavailable';

export type MaintenanceStatus = 'Good' | 'Scheduled' | 'In Shop';

export type SelfDriveZone =
  | 'bislig-city'
  | '2nd-district'
  | '1st-district-caraga'
  | 'outside-caraga';

export type WithDriverZone = 'within-caraga-davao' | 'outside-caraga-davao';

export interface Vehicle {
  id: string;
  name: string;
  /** e.g. "7-Seater MPV", "Sedan" — only values provided by the business. */
  bodyType: string;
  transmission: 'Automatic' | 'Manual';
  /** Free-form capacity text only when provided by the business. */
  capacity?: string;
  /** Only when provided by the business. */
  year?: number;
  /** Design key for the local SVG illustration: 'mpv' | 'sedan'. */
  silhouette: 'mpv' | 'sedan';
  /** Self-drive starting rate per day in PHP (lowest zone). */
  startingRatePerDay: number;
  seats: string;
  blurb: string;
}

export interface SelfDriveRate {
  zone: SelfDriveZone;
  label: string;
  shortLabel: string;
  amountPerDay: number;
}

export interface WithDriverRate {
  zone: WithDriverZone;
  label: string;
  amount: number;
  /**
   * The business has NOT specified whether this is per day / per trip /
   * another unit. Displayed exactly as configured and editable in Settings
   * so a future backend can own the value.
   */
  unitNote: string;
}

export interface BookingDraft {
  vehicleId: string;
  rentalType: RentalType;
  pickupDate: string; // yyyy-mm-dd
  returnDate: string; // yyyy-mm-dd
  destination: string;
  selfDriveZone: SelfDriveZone;
  withDriverZone: WithDriverZone;
  fullName: string;
  mobile: string;
  email: string;
  notes: string;
}

export interface Booking extends BookingDraft {
  id: string;
  reference: string;
  status: BookingStatus;
  rentalDays: number;
  /** Self-drive only. Null for with-driver (rate unit unknown). */
  estimatedAmount: number | null;
  createdAt: string; // ISO
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  notes: string;
  bookingIds: string[];
}

export interface AvailabilityOverride {
  vehicleId: string;
  date: string; // yyyy-mm-dd
  status: VehicleAvailability;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  contactPerson: string;
  phone: string;
  pickup: string;
  facebook: string;
  facebookUrl: string;
  /** Configurable copy for the with-driver rate unit (backend-owned later). */
  withDriverRateUnitNote: string;
  driverExpenseNote: string;
  selfDriveRates: SelfDriveRate[];
  withDriverRates: WithDriverRate[];
  bookingNotice: string;
}

export interface AdminSession {
  loggedIn: boolean;
  name: string;
}
