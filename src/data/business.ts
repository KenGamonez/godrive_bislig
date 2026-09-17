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
    name: 'Mitsubishi Xpander GLS',
    bodyType: '7-Seater MPV',
    transmission: 'Automatic',
    capacity: '7 passengers + 1 driver',
    year: 2025,
    silhouette: 'mpv',
    startingRatePerDay: 2300,
    seats: '7 + 1 driver',
    blurb:
      '2025 Mitsubishi Xpander GLS, 7-seater MPV with automatic transmission. A confident choice for family travels, business trips, and longer journeys around Bislig and beyond.',
    rates: [
      { zone: 'bislig-city', label: 'Within Bislig City', shortLabel: 'Bislig City', amountPerDay: 2300 },
      { zone: '2nd-district', label: 'Within 2nd District, Surigao del Sur', shortLabel: '2nd District, SDS', amountPerDay: 2500 },
      { zone: '1st-district-caraga', label: 'Within 1st District, SDS / Caraga / Davao City', shortLabel: '1st District / Caraga / Davao', amountPerDay: 2800 },
      { zone: 'outside-caraga', label: 'Outside Caraga / Davao City', shortLabel: 'Outside Caraga / Davao', amountPerDay: 3500 },
    ],
  },
  {
    id: 'avanza-at',
    name: 'Toyota Avanza',
    bodyType: '7-Seater MPV',
    transmission: 'Automatic',
    capacity: '7 passengers + 1 driver',
    year: 2026,
    silhouette: 'mpv',
    startingRatePerDay: 2300,
    seats: '7 + 1 driver',
    blurb:
      '2026 Toyota Avanza, 7-seater MPV with automatic transmission. Practical, comfortable, and well-suited to group travel and everyday itineraries.',
    rates: [
      { zone: 'bislig-city', label: 'Within Bislig City', shortLabel: 'Bislig City', amountPerDay: 2300 },
      { zone: '2nd-district', label: 'Within 2nd District, Surigao del Sur', shortLabel: '2nd District, SDS', amountPerDay: 2500 },
      { zone: '1st-district-caraga', label: 'Within 1st District, SDS / Caraga / Davao City', shortLabel: '1st District / Caraga / Davao', amountPerDay: 2800 },
      { zone: 'outside-caraga', label: 'Outside Caraga / Davao City', shortLabel: 'Outside Caraga / Davao', amountPerDay: 3500 },
    ],
  },
  {
    id: 'dzire-mt',
    name: 'Suzuki Dzire MT',
    bodyType: 'Sedan',
    transmission: 'Manual',
    capacity: '4 passengers + 1 driver',
    year: 2024,
    silhouette: 'sedan',
    startingRatePerDay: 1300,
    seats: '4 + 1 driver',
    blurb:
      '2024 Suzuki Dzire sedan with manual transmission. A straightforward, economical option for local trips and business travel within the area.',
    rates: [
      { zone: 'bislig-city', label: 'Within Bislig City', shortLabel: 'Bislig City', amountPerDay: 1300 },
      { zone: '2nd-district', label: 'Within 2nd District, Surigao del Sur', shortLabel: '2nd District, SDS', amountPerDay: 1500 },
      { zone: '1st-district-caraga', label: 'Within 1st District, SDS / Caraga', shortLabel: '1st District / Caraga', amountPerDay: 1800 },
      { zone: 'outside-caraga', label: 'Outside Caraga', shortLabel: 'Outside Caraga', amountPerDay: 2000 },
    ],
  },
  {
    id: 'dzire-at-2025',
    name: 'Suzuki Dzire AT',
    bodyType: 'Sedan',
    transmission: 'Automatic',
    capacity: '4 passengers + 1 driver',
    year: 2024,
    silhouette: 'sedan',
    startingRatePerDay: 1300,
    seats: '4 + 1 driver',
    blurb:
      '2024 Suzuki Dzire sedan with automatic transmission, rated for 4 passengers plus driver. A composed, easy-to-drive option for city and provincial routes.',
    rates: [
      { zone: 'bislig-city', label: 'Within Bislig City', shortLabel: 'Bislig City', amountPerDay: 1300 },
      { zone: '2nd-district', label: 'Within 2nd District, Surigao del Sur', shortLabel: '2nd District, SDS', amountPerDay: 1500 },
      { zone: '1st-district-caraga', label: 'Within 1st District, SDS / Caraga', shortLabel: '1st District / Caraga', amountPerDay: 1800 },
      { zone: 'outside-caraga', label: 'Outside Caraga', shortLabel: 'Outside Caraga', amountPerDay: 2000 },
    ],
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
  withDriverRates: [
    { zone: 'within-caraga-davao', label: 'Within Caraga / Davao City', amount: 1000, unitNote: 'Rate as listed. Unit subject to confirmation.' },
    { zone: 'outside-caraga-davao', label: 'Outside Caraga / Davao City', amount: 1500, unitNote: 'Rate as listed. Unit subject to confirmation.' },
  ],
  bookingNotice:
    'Booking requests are reviewed by GoDrive for vehicle availability. A request is confirmed only after GoDrive responds.',
};
