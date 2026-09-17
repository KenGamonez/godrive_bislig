import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AdminSession,
  AvailabilityOverride,
  Booking,
  BookingStatus,
  BusinessSettings,
  Customer,
  MaintenanceStatus,
  VehicleAvailability,
} from '../types';
import { DEFAULT_SETTINGS } from '../data/business';
import {
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  VEHICLE_MAINTENANCE,
  VEHICLE_STATUS,
  demoAvailabilityBoard,
} from '../data/mock';
import { nextDaysISO } from '../utils/booking';

interface AppStoreValue {
  settings: BusinessSettings;
  updateSettings: (patch: Partial<BusinessSettings>) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  vehicleStatus: Record<string, VehicleAvailability>;
  setVehicleStatus: (vehicleId: string, status: VehicleAvailability) => void;
  maintenance: Record<string, MaintenanceStatus>;
  setMaintenance: (vehicleId: string, status: MaintenanceStatus) => void;
  overrides: AvailabilityOverride[];
  setOverride: (vehicleId: string, date: string, status: VehicleAvailability) => void;
  clearOverride: (vehicleId: string, date: string) => void;
  boardDates: string[];
  customers: Customer[];
  upsertCustomerFromBooking: (b: Booking) => void;
  updateCustomerNotes: (id: string, notes: string) => void;
  session: AdminSession;
  login: () => void;
  logout: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* local-only persistence is best-effort */
  }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(() =>
    readJSON('godrive.settings.v1', DEFAULT_SETTINGS),
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    readJSON('godrive.bookings.v1', INITIAL_BOOKINGS),
  );
  const [vehicleStatus, setVehicleStatusState] = useState<Record<string, VehicleAvailability>>(() =>
    readJSON('godrive.fleet-status.v1', VEHICLE_STATUS),
  );
  const [maintenance, setMaintenanceState] = useState<Record<string, MaintenanceStatus>>(() =>
    readJSON('godrive.maintenance.v1', VEHICLE_MAINTENANCE),
  );
  const [boardDates] = useState<string[]>(() => nextDaysISO(7));
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>(() =>
    readJSON('godrive.overrides.v1', demoAvailabilityBoard(nextDaysISO(7))),
  );
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>(() =>
    readJSON('godrive.customer-notes.v1', {}),
  );
  const [session, setSession] = useState<AdminSession>(() =>
    readJSON('godrive.session.v1', { loggedIn: false, name: 'GoDrive Owner' }),
  );

  useEffect(() => writeJSON('godrive.settings.v1', settings), [settings]);
  useEffect(() => writeJSON('godrive.bookings.v1', bookings), [bookings]);
  useEffect(() => writeJSON('godrive.fleet-status.v1', vehicleStatus), [vehicleStatus]);
  useEffect(() => writeJSON('godrive.maintenance.v1', maintenance), [maintenance]);
  useEffect(() => writeJSON('godrive.overrides.v1', overrides), [overrides]);
  useEffect(() => writeJSON('godrive.customer-notes.v1', customerNotes), [customerNotes]);
  useEffect(() => writeJSON('godrive.session.v1', session), [session]);

  const updateSettings = useCallback((patch: Partial<BusinessSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings((prev) => [b, ...prev]);
  }, []);

  const updateBookingStatus = useCallback((id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const setVehicleStatus = useCallback((vehicleId: string, status: VehicleAvailability) => {
    setVehicleStatusState((prev) => ({ ...prev, [vehicleId]: status }));
  }, []);

  const setMaintenance = useCallback((vehicleId: string, status: MaintenanceStatus) => {
    setMaintenanceState((prev) => ({ ...prev, [vehicleId]: status }));
  }, []);

  const setOverride = useCallback((vehicleId: string, date: string, status: VehicleAvailability) => {
    setOverrides((prev) => {
      const rest = prev.filter((o) => !(o.vehicleId === vehicleId && o.date === date));
      return [...rest, { vehicleId, date, status }];
    });
  }, []);

  const clearOverride = useCallback((vehicleId: string, date: string) => {
    setOverrides((prev) => prev.filter((o) => !(o.vehicleId === vehicleId && o.date === date)));
  }, []);

  const customers: Customer[] = useMemo(() => {
    const byKey = new Map<string, Customer>();
    for (const c of INITIAL_CUSTOMERS) {
      byKey.set(c.mobile, {
        ...c,
        notes: customerNotes[c.id] ?? c.notes,
        bookingIds: [...c.bookingIds],
      });
    }
    for (const b of bookings) {
      const key = b.mobile;
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.bookingIds.includes(b.id)) existing.bookingIds.push(b.id);
        if (!existing.email && b.email) existing.email = b.email;
      } else {
        byKey.set(key, {
          id: `c-${key}`,
          name: b.fullName,
          mobile: b.mobile,
          email: b.email || undefined,
          notes: customerNotes[`c-${key}`] ?? '',
          bookingIds: [b.id],
        });
      }
    }
    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings, customerNotes]);

  const upsertCustomerFromBooking = useCallback((_b: Booking) => {
    // Customers are derived from bookings + seed list; nothing else to do locally.
  }, []);

  const updateCustomerNotes = useCallback((id: string, notes: string) => {
    setCustomerNotes((prev) => ({ ...prev, [id]: notes }));
  }, []);

  const login = useCallback(() => setSession({ loggedIn: true, name: 'GoDrive Owner' }), []);
  const logout = useCallback(() => setSession({ loggedIn: false, name: 'GoDrive Owner' }), []);

  const value: AppStoreValue = {
    settings,
    updateSettings,
    bookings,
    addBooking,
    updateBookingStatus,
    vehicleStatus,
    setVehicleStatus,
    maintenance,
    setMaintenance,
    overrides,
    setOverride,
    clearOverride,
    boardDates,
    customers,
    upsertCustomerFromBooking,
    updateCustomerNotes,
    session,
    login,
    logout,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
