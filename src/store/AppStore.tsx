import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AdminSession,
  AvailabilityOverride,
  Booking,
  BookingPayment,
  BookingStatus,
  BusinessSettings,
  ContactMessage,
  ContactMessageStatus,
  Customer,
  MaintenanceStatus,
  NewBookingPayment,
  NewContactMessage,
  NewVehicleInput,
  Vehicle,
  VehicleAvailability,
  VehicleRate,
} from '../types';
import { DEFAULT_SETTINGS, VEHICLES } from '../data/business';
import {
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  VEHICLE_MAINTENANCE,
  VEHICLE_STATUS,
  demoAvailabilityBoard,
} from '../data/mock';
import { nextDaysISO } from '../utils/booking';
import {
  bookingFromRow,
  createVehicleRecord,
  getSupabase,
  isCloudEnabled,
  messageFromRow,
  paymentFromRow,
  recordPayment,
  rpcCreateBooking,
  rpcLookupBooking,
  settingsFromRow,
  submitContactMessage,
  vehicleFromRow,
} from '../lib/supabase';

interface AppStoreValue {
  settings: BusinessSettings;
  updateSettings: (patch: Partial<BusinessSettings>) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<string | null>;
  /** Submit a booking to the backend (or local demo when offline). */
  submitBooking: (input: {
    vehicleId: string;
    rentalType: Booking['rentalType'];
    pickupDate: string;
    returnDate: string;
    destination: string;
    selfDriveZone: Booking['selfDriveZone'];
    withDriverZone: Booking['withDriverZone'];
    fullName: string;
    mobile: string;
    email: string;
    notes: string;
    reference: string;
    rentalDays: number;
    estimatedAmount: number | null;
  }) => Promise<{ booking?: Booking; error?: string }>;
  /** Exact-match lookup (remote when online, device cache otherwise). */
  lookupBooking: (
    reference: string,
    identifier: string,
  ) => Promise<{ booking?: Booking & { vehicleName?: string }; error?: string }>;
  vehicleStatus: Record<string, VehicleAvailability>;
  setVehicleStatus: (vehicleId: string, status: VehicleAvailability) => void;
  /** Per-vehicle self-drive rates (owner-editable override, else canonical). */
  vehicleRates: (vehicleId: string) => VehicleRate[];
  setVehicleRates: (vehicleId: string, rates: VehicleRate[]) => void;
  maintenance: Record<string, MaintenanceStatus>;
  setMaintenance: (vehicleId: string, status: MaintenanceStatus) => void;
  overrides: AvailabilityOverride[];
  setOverride: (vehicleId: string, date: string, status: VehicleAvailability) => void;
  clearOverride: (vehicleId: string, date: string) => void;
  boardDates: string[];
  shiftBoard: (days: number) => void;
  customers: Customer[];
  upsertCustomerFromBooking: (b: Booking) => void;
  updateCustomerNotes: (mobile: string, notes: string) => Promise<string | null>;
  session: AdminSession;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  /** Canonical fleet: remote catalog when online, built-in otherwise. */
  fleet: Vehicle[];
  /** Fleet excluding inactive units (public views). */
  activeFleet: Vehicle[];
  vehicleName: (id: string) => string;
  fleetStartingRate: () => number;
  /* ---------- backend slices ---------- */
  cloud: boolean;
  syncError: string | null;
  messages: ContactMessage[];
  unreadMessages: number;
  submitContact: (input: NewContactMessage) => Promise<{ error?: string }>;
  setMessageStatus: (id: string, status: ContactMessageStatus) => Promise<string | null>;
  payments: BookingPayment[];
  addPayment: (input: NewBookingPayment) => Promise<string | null>;
  addVehicle: (input: NewVehicleInput) => Promise<string | null>;
  updateVehicle: (id: string, patch: VehiclePatch) => Promise<string | null>;
  deleteVehicle: (id: string) => Promise<string | null>;
  refreshAll: () => Promise<void>;
}

export interface VehiclePatch {
  capacity?: string;
  year?: number;
  startingRatePerDay?: number;
  blurb?: string;
  name?: string;
  bodyType?: string;
  transmission?: 'Automatic' | 'Manual';
  seats?: string;
  status?: VehicleAvailability;
  photoUrl?: string;
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

function useDebouncedPush(fn: () => void, deps: unknown[], delay = 900): void {
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => fn(), delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const LIVE_STATUSES: VehicleAvailability[] = ['Available', 'Reserved', 'Unavailable', 'Inactive'];

const BOOKINGS_KEY = isCloudEnabled() ? 'godrive.bookings.cloud.v1' : 'godrive.bookings.v1';

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const cloud = isCloudEnabled();
  const [settings, setSettings] = useState<BusinessSettings>(() =>
    readJSON('godrive.settings.v1', DEFAULT_SETTINGS),
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    readJSON(BOOKINGS_KEY, cloud ? [] : INITIAL_BOOKINGS),
  );
  const [remoteFleet, setRemoteFleet] = useState<Vehicle[] | null>(null);
  const [vehicleStatus, setVehicleStatusState] = useState<Record<string, VehicleAvailability>>(() =>
    readJSON('godrive.fleet-status.v1', VEHICLE_STATUS),
  );
  const [maintenance, setMaintenanceState] = useState<Record<string, MaintenanceStatus>>(() =>
    readJSON('godrive.maintenance.v1', VEHICLE_MAINTENANCE),
  );
  const [boardOffset, setBoardOffset] = useState(0);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>(() =>
    readJSON('godrive.overrides.v1', cloud ? [] : demoAvailabilityBoard(nextDaysISO(7))),
  );
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>(() =>
    readJSON('godrive.customer-notes.v1', {}),
  );
  const [rateOverrides, setRateOverrides] = useState<Record<string, VehicleRate[]>>(() =>
    readJSON('godrive.vehicle-rates.v1', {}),
  );
  const [mockSession, setMockSession] = useState<AdminSession>(() =>
    readJSON('godrive.session.v1', { loggedIn: false, name: 'GoDrive Owner' }),
  );
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  const session: AdminSession = cloud
    ? { loggedIn: authEmail !== null, name: authEmail ?? 'GoDrive Owner' }
    : mockSession;

  const fleet: Vehicle[] = remoteFleet ?? VEHICLES;
  const activeFleet = useMemo(
    () => fleet.filter((v) => (v as Vehicle & { status?: string }).status !== 'Inactive'),
    [fleet],
  );

  /* ---------- local persistence (unchanged behavior) ---------- */
  useEffect(() => writeJSON('godrive.settings.v1', settings), [settings]);
  useEffect(() => writeJSON(BOOKINGS_KEY, bookings), [bookings]);
  useEffect(() => writeJSON('godrive.fleet-status.v1', vehicleStatus), [vehicleStatus]);
  useEffect(() => writeJSON('godrive.maintenance.v1', maintenance), [maintenance]);
  useEffect(() => writeJSON('godrive.overrides.v1', overrides), [overrides]);
  useEffect(() => writeJSON('godrive.customer-notes.v1', customerNotes), [customerNotes]);
  useEffect(() => writeJSON('godrive.vehicle-rates.v1', rateOverrides), [rateOverrides]);
  useEffect(() => {
    if (!cloud) writeJSON('godrive.session.v1', mockSession);
  }, [mockSession, cloud]);

  /* ---------- auth session ---------- */
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setAuthEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      setAuthEmail(s?.user?.email ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  /* ---------- backend boot + refresh ---------- */
  const refreshAll = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    setSyncError(null);
    try {
      const [{ data: settingsRow }, { data: vehicleRows }] = await Promise.all([
        sb.from('business_settings').select('*').eq('id', 1).maybeSingle(),
        sb.from('vehicles').select('*').order('starting_rate_per_day', { ascending: true }),
      ]);
      if (settingsRow) {
        setSettings((prev) => settingsFromRow(settingsRow, prev));
      }
      if (vehicleRows) {
        const mapped = (vehicleRows as Parameters<typeof vehicleFromRow>[0][]).map(vehicleFromRow);
        setRemoteFleet(mapped);
        setVehicleStatusState((prev) => {
          const next = { ...prev };
          for (const v of mapped) {
            const raw = (v as Vehicle & { status?: string }).status;
            next[v.id] = raw === 'Available' || raw === 'Reserved' || raw === 'Unavailable'
              ? raw
              : 'Unavailable';
          }
          return next;
        });
        setMaintenanceState((prev) => {
          const next = { ...prev };
          for (const m of vehicleRows as { id: string; maintenance: string }[]) {
            next[m.id] = m.maintenance === 'Good' || m.maintenance === 'Scheduled' || m.maintenance === 'In Shop'
              ? m.maintenance
              : 'Good';
          }
          return next;
        });
        setRateOverrides((prev) => {
          const next = { ...prev };
          for (const v of mapped) {
            if (Array.isArray(v.rates) && v.rates.length > 0) next[v.id] = v.rates;
          }
          return next;
        });
      }
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        const [bRes, pRes, mRes, oRes] = await Promise.all([
          sb.from('bookings').select('*').order('created_at', { ascending: false }).limit(500),
          sb.from('booking_payments').select('*').order('paid_at', { ascending: false }).limit(500),
          sb.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200),
          sb.from('availability_overrides').select('*'),
        ]);
        if (bRes.error) throw bRes.error;
        setBookings((bRes.data ?? []).map(bookingFromRow));
        if (!pRes.error) setPayments((pRes.data ?? []).map(paymentFromRow));
        if (!mRes.error) setMessages((mRes.data ?? []).map(messageFromRow));
        if (!oRes.error) {
          setOverrides(
            (oRes.data ?? []).map((o: { vehicle_id: string; day: string; status: string }) => ({
              vehicleId: o.vehicle_id,
              date: o.day,
              status: (['Available', 'Reserved', 'Unavailable'] as VehicleAvailability[]).includes(
                o.status as VehicleAvailability,
              )
                ? (o.status as VehicleAvailability)
                : 'Available',
            })),
          );
        }
      }
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Could not reach the GoDrive database.');
    }
  }, []);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll, authEmail]);

  /* ---------- debounced ambient writes (owner tools) ---------- */
  useDebouncedPush(
    () => {
      const sb = getSupabase();
      if (!sb || !authEmail) return;
      void sb
        .from('business_settings')
        .update({
          business_name: settings.businessName,
          tagline: settings.tagline,
          contact_person: settings.contactPerson,
          phone: settings.phone,
          pickup: settings.pickup,
          facebook: settings.facebook,
          facebook_url: settings.facebookUrl,
          with_driver_rate_unit_note: settings.withDriverRateUnitNote,
          driver_expense_note: settings.driverExpenseNote,
          with_driver_rates: settings.withDriverRates,
          booking_notice: settings.bookingNotice,
        })
        .eq('id', 1)
        .then(({ error }) => {
          if (error) setSyncError(error.message);
        });
    },
    [settings, authEmail, cloud],
  );

  useDebouncedPush(
    () => {
      const sb = getSupabase();
      if (!sb || !authEmail) return;
      const jobs = Object.entries(rateOverrides).map(([id, rates]) =>
        sb.from('vehicles').update({ rates }).eq('id', id),
      );
      void Promise.all(jobs).then((results) => {
        const err = results.find((r) => r.error)?.error;
        if (err) setSyncError(err.message);
      });
    },
    [rateOverrides, authEmail, cloud],
  );

  useDebouncedPush(
    () => {
      const sb = getSupabase();
      if (!sb || !authEmail) return;
      const statusJobs = Object.entries(vehicleStatus)
        .filter(([s]) => (LIVE_STATUSES as string[]).includes(s as string))
        .map(([id, status]) => sb.from('vehicles').update({ status }).eq('id', id));
      const maintJobs = Object.entries(maintenance).map(([id, m]) =>
        sb.from('vehicles').update({ maintenance: m }).eq('id', id),
      );
      void Promise.all([...statusJobs, ...maintJobs]).then((results) => {
        const err = results.find((r) => r.error)?.error;
        if (err) setSyncError(err.message);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehicleStatus, maintenance, authEmail, cloud, fleet.length],
  );

  useDebouncedPush(
    () => {
      const sb = getSupabase();
      if (!sb || !authEmail) return;
      void (async () => {
        const { error: delError } = await sb.from('availability_overrides').delete().neq('day', '0001-01-01');
        if (delError) {
          setSyncError(delError.message);
          return;
        }
        if (overrides.length === 0) return;
        const { error } = await sb.from('availability_overrides').insert(
          overrides.map((o) => ({ vehicle_id: o.vehicleId, day: o.date, status: o.status })),
        );
        if (error) setSyncError(error.message);
      })();
    },
    [overrides, authEmail, cloud],
  );

  /* ---------- methods ---------- */
  const updateSettings = useCallback((patch: Partial<BusinessSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const addBooking = useCallback((b: Booking) => {
    setBookings((prev) => (prev.some((x) => x.id === b.id) ? prev : [b, ...prev]));
  }, []);

  const submitBooking: AppStoreValue['submitBooking'] = useCallback(
    async (input) => {
      if (!cloud || !getSupabase()) {
        // Local demo mode (no backend configured): keep previous behavior.
        const booking: Booking = {
          ...input,
          id: `b-${Date.now()}`,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
        setBookings((prev) => [booking, ...prev]);
        return { booking };
      }
      const res = await rpcCreateBooking(input);
      if (res.error || !res.booking) return { error: res.error ?? 'Booking failed.' };
      setBookings((prev) =>
        prev.some((x) => x.id === res.booking!.id) ? prev : [res.booking!, ...prev],
      );
      return { booking: res.booking };
    },
    [cloud],
  );

  const lookupBooking: AppStoreValue['lookupBooking'] = useCallback(
    async (reference, identifier) => {
      const res = await rpcLookupBooking(reference, identifier);
      if (res.error) return { error: res.error };
      return res.booking ? { booking: res.booking } : {};
    },
    [],
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus): Promise<string | null> => {
      const sb = getSupabase();
      if (sb && authEmail) {
        const { error } = await sb.from('bookings').update({ status }).eq('id', id);
        if (error) return error.message;
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      return null;
    },
    [authEmail],
  );

  const setVehicleStatus = useCallback((vehicleId: string, status: VehicleAvailability) => {
    setVehicleStatusState((prev) => ({ ...prev, [vehicleId]: status }));
  }, []);

  const vehicleRates = useCallback(
    (vehicleId: string): VehicleRate[] => {
      const override = rateOverrides[vehicleId];
      if (Array.isArray(override) && override.length > 0) return override;
      return fleet.find((v) => v.id === vehicleId)?.rates ?? [];
    },
    [rateOverrides, fleet],
  );

  const setVehicleRates = useCallback((vehicleId: string, rates: VehicleRate[]) => {
    setRateOverrides((prev) => ({ ...prev, [vehicleId]: rates }));
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

  const boardDates = useMemo(() => {
    const days = nextDaysISO(7 + Math.max(0, boardOffset));
    return days.slice(Math.max(0, boardOffset));
  }, [boardOffset]);

  const shiftBoard = useCallback((days: number) => {
    setBoardOffset((o) => Math.max(0, o + days));
  }, []);

  const customers: Customer[] = useMemo(() => {
    const byKey = new Map<string, Customer>();
    if (!cloud) {
      for (const c of INITIAL_CUSTOMERS) {
        byKey.set(c.mobile, {
          ...c,
          notes: customerNotes[c.id] ?? c.notes,
          bookingIds: [...c.bookingIds],
        });
      }
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
  }, [bookings, customerNotes, cloud]);

  const upsertCustomerFromBooking = useCallback((_b: Booking) => {
    // Server RPC upserts the customer; local list derives from bookings.
  }, []);

  const updateCustomerNotes = useCallback(
    async (mobile: string, notes: string): Promise<string | null> => {
      const sb = getSupabase();
      if (sb && authEmail) {
        const { error } = await sb.from('customers').update({ notes }).eq('mobile', mobile);
        if (error) return error.message;
      }
      setCustomerNotes((prev) => {
        const next = { ...prev };
        const keys = Object.keys(next).filter(
          (k) => k === mobile || k === `c-${mobile}`,
        );
        if (keys.length === 0) next[`c-${mobile}`] = notes;
        else for (const k of keys) next[k] = notes;
        return next;
      });
      return null;
    },
    [authEmail],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const sb = getSupabase();
      if (!sb) {
        // Local demo mode keeps the previous mock behavior.
        setMockSession({ loggedIn: true, name: 'GoDrive Owner' });
        return null;
      }
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return error.message;
      setSyncError(null);
      return null;
    },
    [],
  );

  const logout = useCallback(() => {
    const sb = getSupabase();
    if (sb) void sb.auth.signOut();
    setMockSession({ loggedIn: false, name: 'GoDrive Owner' });
    setAuthEmail(null);
    setMessages([]);
    setPayments([]);
  }, []);

  const submitContact = useCallback(async (input: NewContactMessage) => {
    return submitContactMessage(input);
  }, []);

  const setMessageStatus = useCallback(
    async (id: string, status: ContactMessageStatus): Promise<string | null> => {
      const sb = getSupabase();
      if (sb && authEmail) {
        const { error } = await sb.from('contact_messages').update({ status }).eq('id', id);
        if (error) return error.message;
      }
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
      return null;
    },
    [authEmail],
  );

  const addPayment = useCallback(
    async (input: NewBookingPayment): Promise<string | null> => {
      const res = await recordPayment(input);
      if (res.error || !res.payment) return res.error ?? 'Could not record payment.';
      setPayments((prev) => [res.payment!, ...prev]);
      return null;
    },
    [],
  );

  const addVehicle = useCallback(
    async (input: NewVehicleInput): Promise<string | null> => {
      const res = await createVehicleRecord(input);
      if (res.error) return res.error;
      await refreshAll();
      return null;
    },
    [refreshAll],
  );

  const updateVehicle = useCallback(
    async (id: string, patch: VehiclePatch): Promise<string | null> => {
      const sb = getSupabase();
      if (!sb || !authEmail) return 'Backend is not connected or you are signed out.';
      const row: Record<string, unknown> = {};
      if (patch.capacity !== undefined) row.capacity = patch.capacity?.trim() ? patch.capacity.trim() : null;
      if (patch.year !== undefined) row.year = patch.year ?? null;
      if (patch.startingRatePerDay !== undefined) row.starting_rate_per_day = patch.startingRatePerDay;
      if (patch.blurb !== undefined) row.blurb = patch.blurb;
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.bodyType !== undefined) row.body_type = patch.bodyType;
      if (patch.transmission !== undefined) row.transmission = patch.transmission;
      if (patch.seats !== undefined) row.seats = patch.seats;
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl?.trim() ? patch.photoUrl.trim() : null;
      const { error } = await sb.from('vehicles').update(row).eq('id', id);
      if (error) return error.message;
      await refreshAll();
      return null;
    },
    [authEmail, refreshAll],
  );

  const deleteVehicle = useCallback(
    async (id: string): Promise<string | null> => {
      const sb = getSupabase();
      if (!sb || !authEmail) return 'Backend is not connected or you are signed out.';
      const { count, error: countError } = await sb
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('vehicle_id', id);
      if (countError) return countError.message;
      if ((count ?? 0) > 0) {
        return 'This vehicle has booking history and cannot be deleted. Set it to Inactive instead.';
      }
      const { error } = await sb.from('vehicles').delete().eq('id', id);
      if (error) return error.message;
      await refreshAll();
      return null;
    },
    [authEmail, refreshAll],
  );

  const vehicleName = useCallback(
    (id: string): string => fleet.find((v) => v.id === id)?.name ?? id,
    [fleet],
  );

  const fleetStartingRate = useCallback((): number => {
    const actives = activeFleet;
    if (actives.length === 0) return 0;
    return Math.min(...actives.map((v) => v.startingRatePerDay));
  }, [activeFleet]);

  const unreadMessages = useMemo(
    () => messages.filter((m) => m.status === 'unread').length,
    [messages],
  );

  const value: AppStoreValue = {
    settings,
    updateSettings,
    bookings,
    addBooking,
    updateBookingStatus,
    submitBooking,
    lookupBooking,
    vehicleStatus,
    setVehicleStatus,
    vehicleRates,
    setVehicleRates,
    maintenance,
    setMaintenance,
    overrides,
    setOverride,
    clearOverride,
    boardDates,
    shiftBoard,
    customers,
    upsertCustomerFromBooking,
    updateCustomerNotes,
    session,
    login,
    logout,
    fleet,
    activeFleet,
    vehicleName,
    fleetStartingRate,
    cloud,
    syncError,
    messages,
    unreadMessages,
    submitContact,
    setMessageStatus,
    payments,
    addPayment,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refreshAll,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
