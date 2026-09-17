import type {
  AvailabilityOverride,
  Booking,
  Customer,
  MaintenanceStatus,
  VehicleAvailability,
} from '../types';

/**
 * Mock repository — local demo data only.
 * A future Supabase layer should expose the same shapes
 * (listBookings, getBooking, updateBookingStatus, listVehicles …)
 * so components keep working unchanged.
 */

export const VEHICLE_STATUS: Record<string, VehicleAvailability> = {
  'xpander-at': 'Available',
  'avanza-at': 'Available',
  'dzire-mt': 'Reserved',
  'dzire-at-2025': 'Available',
};

export const VEHICLE_MAINTENANCE: Record<string, MaintenanceStatus> = {
  'xpander-at': 'Good',
  'avanza-at': 'Good',
  'dzire-mt': 'Scheduled',
  'dzire-at-2025': 'Good',
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1001',
    reference: 'GD-7K2P4Q',
    vehicleId: 'xpander-at',
    rentalType: 'self-drive',
    pickupDate: '2026-09-22',
    returnDate: '2026-09-24',
    destination: 'Hinatuan — Enchanted River day trip',
    selfDriveZone: '2nd-district',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Marlon D. Reyes',
    mobile: '09171234567',
    email: 'marlon.reyes@example.com',
    notes: 'Early pickup if possible.',
    status: 'Pending',
    rentalDays: 3,
    estimatedAmount: 5400,
    createdAt: '2026-09-15T08:20:00.000Z',
  },
  {
    id: 'b-1002',
    reference: 'GD-3M8T2W',
    vehicleId: 'dzire-at-2025',
    rentalType: 'with-driver',
    pickupDate: '2026-09-19',
    returnDate: '2026-09-20',
    destination: 'Davao City — business meeting',
    selfDriveZone: 'outside-caraga',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Aileen C. Santos',
    mobile: '09281234567',
    email: '',
    notes: 'With driver. One overnight stay.',
    status: 'Confirmed',
    rentalDays: 2,
    estimatedAmount: null,
    createdAt: '2026-09-12T06:10:00.000Z',
  },
  {
    id: 'b-1003',
    reference: 'GD-9Q4L6X',
    vehicleId: 'avanza-at',
    rentalType: 'self-drive',
    pickupDate: '2026-09-17',
    returnDate: '2026-09-19',
    destination: 'Bislig City — family use',
    selfDriveZone: 'bislig-city',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Ramon J. Villanueva',
    mobile: '09351234567',
    email: 'ramon.v@example.com',
    notes: '',
    status: 'Ongoing',
    rentalDays: 3,
    estimatedAmount: 4500,
    createdAt: '2026-09-10T03:44:00.000Z',
  },
  {
    id: 'b-1004',
    reference: 'GD-2B6N8Z',
    vehicleId: 'dzire-mt',
    rentalType: 'self-drive',
    pickupDate: '2026-09-08',
    returnDate: '2026-09-10',
    destination: 'Barobo / Lianga route',
    selfDriveZone: '2nd-district',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Katrina M. Uy',
    mobile: '09451234567',
    email: '',
    notes: 'Returned with full tank.',
    status: 'Completed',
    rentalDays: 3,
    estimatedAmount: 5400,
    createdAt: '2026-09-05T09:02:00.000Z',
  },
  {
    id: 'b-1005',
    reference: 'GD-5D3F7H',
    vehicleId: 'xpander-at',
    rentalType: 'with-driver',
    pickupDate: '2026-09-26',
    returnDate: '2026-09-28',
    destination: 'Surigao City — family event',
    selfDriveZone: '1st-district-caraga',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Joel P. Garcia',
    mobile: '09501234567',
    email: 'joel.garcia@example.com',
    notes: 'Needs extra luggage space.',
    status: 'Pending',
    rentalDays: 3,
    estimatedAmount: null,
    createdAt: '2026-09-16T11:30:00.000Z',
  },
  {
    id: 'b-1006',
    reference: 'GD-8C1V5N',
    vehicleId: 'avanza-at',
    rentalType: 'self-drive',
    pickupDate: '2026-09-02',
    returnDate: '2026-09-04',
    destination: 'Bislig City — business',
    selfDriveZone: 'bislig-city',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Marlon D. Reyes',
    mobile: '09171234567',
    email: 'marlon.reyes@example.com',
    notes: '',
    status: 'Completed',
    rentalDays: 3,
    estimatedAmount: 4500,
    createdAt: '2026-08-30T07:15:00.000Z',
  },
  {
    id: 'b-1007',
    reference: 'GD-4J9K2D',
    vehicleId: 'dzire-mt',
    rentalType: 'self-drive',
    pickupDate: '2026-09-25',
    returnDate: '2026-09-25',
    destination: 'Mangagoy rounds',
    selfDriveZone: 'bislig-city',
    withDriverZone: 'within-caraga-davao',
    fullName: 'Rhea T. Bautista',
    mobile: '09671234567',
    email: '',
    notes: 'Cancelled by customer — schedule conflict.',
    status: 'Cancelled',
    rentalDays: 1,
    estimatedAmount: 1500,
    createdAt: '2026-09-14T02:00:00.000Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-01',
    name: 'Marlon D. Reyes',
    mobile: '09171234567',
    email: 'marlon.reyes@example.com',
    notes: 'Repeat customer. Returns units clean and on time.',
    bookingIds: ['b-1001', 'b-1006'],
  },
  {
    id: 'c-02',
    name: 'Aileen C. Santos',
    mobile: '09281234567',
    notes: 'Prefers with-driver for out-of-town trips.',
    bookingIds: ['b-1002'],
  },
  {
    id: 'c-03',
    name: 'Ramon J. Villanueva',
    mobile: '09351234567',
    email: 'ramon.v@example.com',
    notes: 'First-time renter. Valid license verified (demo note).',
    bookingIds: ['b-1003'],
  },
  {
    id: 'c-04',
    name: 'Katrina M. Uy',
    mobile: '09451234567',
    notes: 'Completed one rental without issues.',
    bookingIds: ['b-1004'],
  },
  {
    id: 'c-05',
    name: 'Joel P. Garcia',
    mobile: '09501234567',
    email: 'joel.garcia@example.com',
    notes: 'Family event booking — 7-seater requested.',
    bookingIds: ['b-1005'],
  },
  {
    id: 'c-06',
    name: 'Rhea T. Bautista',
    mobile: '09671234567',
    notes: 'Cancelled once due to schedule conflict.',
    bookingIds: ['b-1007'],
  },
];

/** A small demo availability board for the next days (mock only). */
export function demoAvailabilityBoard(dates: string[]): AvailabilityOverride[] {
  const out: AvailabilityOverride[] = [];
  const push = (vehicleId: string, date: string, status: VehicleAvailability) =>
    out.push({ vehicleId, date, status });
  if (dates[2]) push('dzire-mt', dates[2], 'Reserved');
  if (dates[3]) push('dzire-mt', dates[3], 'Reserved');
  if (dates[1]) push('avanza-at', dates[1], 'Reserved');
  if (dates[4]) push('xpander-at', dates[4], 'Reserved');
  return out;
}

export const MONTHLY_TREND = [
  { month: 'Apr', bookings: 9, revenue: 38200 },
  { month: 'May', bookings: 12, revenue: 51400 },
  { month: 'Jun', bookings: 11, revenue: 47800 },
  { month: 'Jul', bookings: 15, revenue: 64900 },
  { month: 'Aug', bookings: 18, revenue: 78600 },
  { month: 'Sep', bookings: 7, revenue: 29900 },
];
