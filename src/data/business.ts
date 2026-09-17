import type { BusinessSettings, Vehicle } from '../types';

/** Canonical business facts. Single source — no invented specs. */
export const BUSINESS = {
  name: 'GoDrive Car Rental and Services – Bislig',
  shortName: 'GoDrive Bislig',
  tagline: 'Your Ride. Your Journey. Your Drive.',
  contactPerson: 'Iris Mae Pimentel',
  phone: '09260621287',
  phoneHref: 'tel:+639260621287',
  pickup: 'Boardwalk Gym, Bislig',
  facebookLabel: 'GoDrive – Bislig on Facebook',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61579023301527',
  description:
    'GoDrive Car Rental Services – Bislig is a reliable and affordable car rental service offering clean, well-maintained vehicles for self-drive and with-driver rentals. We provide convenient and hassle-free transportation for local trips, business, family travels, and adventures around Bislig and beyond.',
} as const;

export const VEHICLES: Vehicle[] = [
  {
    id: 'xpander-at',
    name: 'Mitsubishi Xpander AT',
    bodyType: '7-Seater MPV',
    transmission: 'Automatic',
    silhouette: 'mpv',
    startingRatePerDay: 1500,
    seats: '7 seats',
    blurb:
      'Spacious 7-seater MPV with automatic transmission. A confident choice for family travels, business trips, and longer journeys around Bislig and beyond.',
  },
  {
    id: 'avanza-at',
    name: 'Toyota Avanza AT',
    bodyType: '7-Seater MPV',
    transmission: 'Automatic',
    silhouette: 'mpv',
    startingRatePerDay: 1500,
    seats: '7 seats',
    blurb:
      'Dependable 7-seater MPV with automatic transmission. Practical, comfortable, and well-suited to group travel and everyday itineraries.',
  },
  {
    id: 'dzire-mt',
    name: 'Suzuki Dzire MT',
    bodyType: 'Sedan',
    transmission: 'Manual',
    silhouette: 'sedan',
    startingRatePerDay: 1500,
    seats: 'Sedan',
    blurb:
      'Efficient sedan with manual transmission. A straightforward, economical option for local trips and business travel within the area.',
  },
  {
    id: 'dzire-at-2025',
    name: 'Suzuki Dzire AT',
    bodyType: 'Sedan',
    transmission: 'Automatic',
    capacity: '4 + 1 driver',
    year: 2025,
    silhouette: 'sedan',
    startingRatePerDay: 1500,
    seats: '4 + 1 driver',
    blurb:
      '2025 sedan with automatic transmission, rated for 4 passengers plus driver. A composed, easy-to-drive option for city and provincial routes.',
  },
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: BUSINESS.name,
  tagline: BUSINESS.tagline,
  contactPerson: BUSINESS.contactPerson,
  phone: BUSINESS.phone,
  pickup: BUSINESS.pickup,
  facebook: BUSINESS.facebookLabel,
  facebookUrl: BUSINESS.facebookUrl,
  withDriverRateUnitNote:
    'Rate unit to be confirmed with GoDrive (per day / per trip). Configurable here for future backend integration.',
  driverExpenseNote:
    'Driver meal and lodging may be additional when applicable.',
  selfDriveRates: [
    { zone: 'bislig-city', label: 'Within Bislig City', shortLabel: 'Bislig City', amountPerDay: 1500 },
    { zone: '2nd-district', label: 'Within 2nd District, Surigao del Sur', shortLabel: '2nd District, SurSur', amountPerDay: 1800 },
    { zone: '1st-district-caraga', label: 'Within 1st District, Surigao del Sur / Caraga', shortLabel: '1st District / Caraga', amountPerDay: 2000 },
    { zone: 'outside-caraga', label: 'Outside Caraga', shortLabel: 'Outside Caraga', amountPerDay: 2500 },
  ],
  withDriverRates: [
    { zone: 'within-caraga-davao', label: 'Within Caraga / Davao City', amount: 1000, unitNote: 'Rate as listed. Unit subject to confirmation.' },
    { zone: 'outside-caraga-davao', label: 'Outside Caraga / Davao City', amount: 1500, unitNote: 'Rate as listed. Unit subject to confirmation.' },
  ],
  bookingNotice:
    'Booking requests are reviewed by GoDrive for vehicle availability. A request is confirmed only after GoDrive responds.',
};
