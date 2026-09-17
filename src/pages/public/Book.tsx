import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Booking, BookingDraft, SelfDriveZone, Vehicle, WithDriverZone } from '../../types';
import { VEHICLES } from '../../data/business';
import { vehicleMeta } from '../../data/fleet';
import { StatusBadge } from '../../components/site';
import { RentalTypeExplainer } from '../../components/booking';
import { VehiclePhoto, useVehiclePhotos } from '../../components/showroom';
import { useAppStore } from '../../store/AppStore';
import {
  estimateSelfDrive,
  formatDateLong,
  formatPeso,
  generateReference,
  isValidEmailOptional,
  isValidPHMobile,
  rentalDaysBetween,
  todayISO,
} from '../../utils/booking';

const STEPS = ['Car', 'Rental', 'Dates', 'Destination', 'Details', 'Review'] as const;

const EMPTY: BookingDraft = {
  vehicleId: '',
  rentalType: 'self-drive',
  pickupDate: '',
  returnDate: '',
  destination: '',
  selfDriveZone: 'bislig-city',
  withDriverZone: 'within-caraga-davao',
  fullName: '',
  mobile: '',
  email: '',
  notes: '',
};

function validZone(z: string | null): z is SelfDriveZone {
  return z === 'bislig-city' || z === '2nd-district' || z === '1st-district-caraga' || z === 'outside-caraga';
}

/** CompactBookingFlow — the core reservation product. */
export function BookPage() {
  const { settings, vehicleStatus, vehicleRates, addBooking, upsertCustomerFromBooking } = useAppStore();
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(() => {
    const typeParam = (params.get('type') ?? '').toLowerCase();
    const pickupParam = params.get('pickup') ?? '';
    const returnParam = params.get('return') ?? '';
    const vehicleParam = params.get('vehicle') ?? '';
    const zoneParam = params.get('zone');
    const dateOk = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);
    const withParam = typeParam === 'with' || typeParam === 'with-driver';
    const vehicleOk = VEHICLES.some((v) => v.id === vehicleParam);
    return {
      ...EMPTY,
      vehicleId: vehicleOk ? vehicleParam : '',
      rentalType: withParam ? 'with-driver' : 'self-drive',
      pickupDate: dateOk(pickupParam) ? pickupParam : '',
      returnDate: dateOk(returnParam) ? returnParam : '',
      selfDriveZone: validZone(zoneParam) ? zoneParam : 'bislig-city',
    };
  });

  const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const vehicle = VEHICLES.find((v) => v.id === draft.vehicleId);
  const rates = vehicle ? vehicleRates(vehicle.id) : [];
  const { days, amount } = useMemo(() => estimateSelfDrive(draft, rates), [draft, rates]);
  const today = todayISO();

  const zoneLabel =
    draft.rentalType === 'self-drive'
      ? (rates.find((r) => r.zone === draft.selfDriveZone)?.label ?? '')
      : (settings.withDriverRates.find((r) => r.zone === draft.withDriverZone)?.label ?? '');

  const errors: Record<string, string> = useMemo(() => {
    const e: Record<string, string> = {};
    if (step === 0 && !draft.vehicleId) e.vehicle = 'Select a vehicle to continue.';
    if (step === 2) {
      if (!draft.pickupDate) e.pickup = 'Choose a pickup date.';
      else if (draft.pickupDate < today) e.pickup = 'Pickup date cannot be in the past.';
      if (!draft.returnDate) e.return = 'Choose a return date.';
      else if (draft.pickupDate && draft.returnDate < draft.pickupDate)
        e.return = 'Return date cannot be before pickup date.';
    }
    if (step === 3 && draft.destination.trim().length < 3)
      e.destination = 'Tell GoDrive where you are headed (at least 3 characters).';
    if (step === 4) {
      if (draft.fullName.trim().length < 3) e.name = 'Enter your full name.';
      if (!isValidPHMobile(draft.mobile)) e.mobile = 'Enter a valid 11-digit mobile number (e.g. 09XXXXXXXXX).';
      if (!isValidEmailOptional(draft.email)) e.email = 'Enter a valid email address or leave it blank.';
    }
    return e;
  }, [step, draft, today]);

  const canContinue = Object.keys(errors).length === 0;
  const goNext = () => {
    setTried(true);
    if (!canContinue) return;
    setTried(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setTried(false);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = () => {
    const ref = generateReference();
    const rentalDays = rentalDaysBetween(draft.pickupDate, draft.returnDate);
    const booking: Booking = {
      ...draft,
      destination: draft.destination.trim(),
      fullName: draft.fullName.trim(),
      mobile: draft.mobile.replace(/[\s-]/g, ''),
      email: draft.email.trim(),
      id: `b-${Date.now()}`,
      reference: ref,
      status: 'Pending',
      rentalDays,
      estimatedAmount: draft.rentalType === 'self-drive' ? amount : null,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    upsertCustomerFromBooking(booking);
    setDone(booking);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (done) {
    const v = VEHICLES.find((x) => x.id === done.vehicleId);
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="success-hero">
            <div className="success-top">
              <span className="eyebrow on-dark">Booking request received</span>
              <h2 className="mt-16">Thank you, {done.fullName.split(' ')[0]}.</h2>
              <p className="mt-16" style={{ color: '#c3cfe3', maxWidth: 560 }}>
                GoDrive will review your request and confirm vehicle availability
                directly. This demo stores your request locally in this browser only.
              </p>
              <span className="success-ref">{done.reference}</span>
            </div>
            <div className="success-body">
              <div className="success-row"><span>Vehicle</span><b>{v?.name ?? done.vehicleId}</b></div>
              <div className="success-row"><span>Rental type</span><b>{done.rentalType === 'self-drive' ? 'Self-drive' : 'With driver'}</b></div>
              <div className="success-row"><span>Pickup</span><b>{formatDateLong(done.pickupDate)}</b></div>
              <div className="success-row"><span>Return</span><b>{formatDateLong(done.returnDate)} · {done.rentalDays} day{done.rentalDays === 1 ? '' : 's'}</b></div>
              <div className="success-row"><span>Destination</span><b>{done.destination}</b></div>
              <div className="success-row"><span>Customer</span><b>{done.fullName} · {done.mobile}</b></div>
              {done.estimatedAmount !== null ? (
                <div className="success-row"><span>Estimate</span><b>{formatPeso(done.estimatedAmount)} (self-drive)</b></div>
              ) : (
                <div className="success-row"><span>Driver rate</span><b>To be confirmed with GoDrive</b></div>
              )}
            </div>
          </div>
          <div className="mt-24" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to={`/bookings?ref=${done.reference}`} className="btn btn-outline">Track this booking</Link>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </section>
    );
  }

  const showErr = (k: string) => tried && errors[k];

  return (
    <section className="flow-wrap">
      <div className="container flow-inner">
        <div className="flow-head">
          <div className="flow-kick">
            <span>Reservation · No account needed</span>
            <span>{String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
          </div>
          <h1 className="flow-title">{STEPS[step]}.</h1>
        </div>

        <ol className="flow-steps" aria-label="Booking progress">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                className={`flow-step${i < step ? ' done' : ''}${i === step ? ' now' : ''}`}
                onClick={() => {
                  if (i < step) {
                    setTried(false);
                    setStep(i);
                  }
                }}
                disabled={i > step}
                aria-current={i === step ? 'step' : undefined}
              >
                <i>{String(i + 1).padStart(2, '0')}</i>
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="flow-layout">
          <div className="flow-card" key={step}>
            {step === 0 && (
              <div className="flow-pane">
                <p className="flow-lede">Which car fits your trip?</p>
                <div className="flow-cars">
                  {VEHICLES.map((v) => (
                    <CarPick
                      key={v.id}
                      vehicleId={v.id}
                      selected={draft.vehicleId === v.id}
                      onPick={() => set('vehicleId', v.id)}
                      status={vehicleStatus[v.id] ?? 'Available'}
                    />
                  ))}
                </div>
                {showErr('vehicle') && <p className="field-error mt-16">{errors.vehicle}</p>}
              </div>
            )}

            {step === 1 && (
              <div className="flow-pane">
                <p className="flow-lede">How will you travel?</p>
                <RentalTypeExplainer value={draft.rentalType} onChange={(v) => set('rentalType', v)} />
              </div>
            )}

            {step === 2 && (
              <div className="flow-pane">
                <p className="flow-lede">When do you need the car?</p>
                <div className="form-grid two">
                  <div className="field">
                    <label htmlFor="pickup">Pickup date</label>
                    <input
                      id="pickup" type="date" min={today} value={draft.pickupDate}
                      className={showErr('pickup') ? 'invalid' : ''}
                      onChange={(e) => set('pickupDate', e.target.value)}
                    />
                    {showErr('pickup') && <span className="field-error">{errors.pickup}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="return">Return date</label>
                    <input
                      id="return" type="date" min={draft.pickupDate || today} value={draft.returnDate}
                      className={showErr('return') ? 'invalid' : ''}
                      onChange={(e) => set('returnDate', e.target.value)}
                    />
                    {showErr('return') && <span className="field-error">{errors.return}</span>}
                  </div>
                </div>
                {days > 0 ? (
                  <div className="note-box mt-24">
                    <b>{days} day{days === 1 ? '' : 's'}</b> · {formatDateLong(draft.pickupDate)} → {formatDateLong(draft.returnDate)}
                    <span className="hint" style={{ display: 'block', marginTop: 4 }}>Same-day pickup and return counts as 1 day.</span>
                  </div>
                ) : (
                  <p className="hint mt-24">Same-day pickup and return counts as 1 day.</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flow-pane">
                <p className="flow-lede">Where are you headed?</p>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="dest">Destination details</label>
                    <input
                      id="dest" type="text" placeholder="e.g. Hinatuan — Enchanted River day trip"
                      value={draft.destination} onChange={(e) => set('destination', e.target.value)}
                      className={showErr('destination') ? 'invalid' : ''}
                    />
                    {showErr('destination') && <span className="field-error">{errors.destination}</span>}
                  </div>
                  {draft.rentalType === 'self-drive' ? (
                    <div className="field">
                      <label htmlFor="zone">Rate zone</label>
                      <select
                        id="zone" value={draft.selfDriveZone}
                        onChange={(e) => set('selfDriveZone', e.target.value as SelfDriveZone)}
                      >
                        {rates.map((r) => (
                          <option key={r.zone} value={r.zone}>{r.label} — {formatPeso(r.amountPerDay)}/day</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="field">
                      <label htmlFor="wzone">Destination band</label>
                      <select
                        id="wzone" value={draft.withDriverZone}
                        onChange={(e) => set('withDriverZone', e.target.value as WithDriverZone)}
                      >
                        {settings.withDriverRates.map((r) => (
                          <option key={r.zone} value={r.zone}>{r.label} — {formatPeso(r.amount)}</option>
                        ))}
                      </select>
                      <span className="hint">{settings.withDriverRateUnitNote}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flow-pane">
                <p className="flow-lede">Who is booking?</p>
                <div className="form-grid two">
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input id="name" type="text" placeholder="e.g. Juan D. Cruz" value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} className={showErr('name') ? 'invalid' : ''} />
                    {showErr('name') && <span className="field-error">{errors.name}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="mobile">Mobile number</label>
                    <input id="mobile" type="tel" placeholder="09XXXXXXXXX" value={draft.mobile} onChange={(e) => set('mobile', e.target.value)} className={showErr('mobile') ? 'invalid' : ''} />
                    {showErr('mobile') && <span className="field-error">{errors.mobile}</span>}
                  </div>
                </div>
                <div className="form-grid mt-16" style={{ gap: 18 }}>
                  <div className="field">
                    <label htmlFor="email">Email <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <input id="email" type="email" placeholder="you@example.com" value={draft.email} onChange={(e) => set('email', e.target.value)} className={showErr('email') ? 'invalid' : ''} />
                    {showErr('email') && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="notes">Notes <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <textarea id="notes" placeholder="Early pickup, extra luggage space, overnight…" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flow-pane">
                <p className="flow-lede">Check everything, then submit.</p>
                <div className="flow-review">
                  <div className="kv"><span>Vehicle</span><b>{vehicle?.name ?? '—'}</b></div>
                  <div className="kv"><span>Rental type</span><b>{draft.rentalType === 'self-drive' ? 'Self-drive' : 'With driver'}</b></div>
                  <div className="kv"><span>Pickup</span><b>{formatDateLong(draft.pickupDate)}</b></div>
                  <div className="kv"><span>Return</span><b>{formatDateLong(draft.returnDate)}{days > 0 ? ` · ${days} day${days === 1 ? '' : 's'}` : ''}</b></div>
                  <div className="kv"><span>Destination</span><b>{draft.destination} ({zoneLabel})</b></div>
                  <div className="kv"><span>Customer</span><b>{draft.fullName} · {draft.mobile}{draft.email ? ` · ${draft.email}` : ''}</b></div>
                  {draft.notes.trim() && <div className="kv"><span>Notes</span><b>{draft.notes}</b></div>}
                </div>
                <div className="note-box mt-24">{settings.bookingNotice}</div>
              </div>
            )}

            <div className="flow-nav">
              {step > 0 ? (
                <button className="btn btn-outline-danger" onClick={goBack}>← Back</button>
              ) : <span />}
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={goNext}>Continue <span className="arr" aria-hidden="true">→</span></button>
              ) : (
                <button className="btn btn-primary" onClick={submit}>Submit Request <span className="arr" aria-hidden="true">→</span></button>
              )}
            </div>
          </div>

          <aside className="summary flow-summary" aria-label="Booking summary">
            <div className="summary-head"><span>Your request</span><i aria-hidden="true" /></div>
            <div className="summary-body">
              <div className="summary-row"><span>Vehicle</span><b>{vehicle?.name ?? 'Not selected'}</b></div>
              <div className="summary-row"><span>Rental type</span><b>{draft.rentalType === 'self-drive' ? 'Self-drive' : 'With driver'}</b></div>
              <div className="summary-row"><span>Dates</span><b>{draft.pickupDate && draft.returnDate ? `${days} day${days === 1 ? '' : 's'}` : '—'}</b></div>
              <div className="summary-row"><span>Zone</span><b>{zoneLabel || '—'}</b></div>
              <div className="summary-total">
                {draft.rentalType === 'self-drive' ? (
                  <>
                    <span style={{ color: '#a9bcdf', fontSize: 13 }}>Estimated total</span>
                    <b>{vehicle && amount !== null && days > 0 ? formatPeso(amount) : '—'}</b>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#a9bcdf', fontSize: 13 }}>Driver rate</span>
                    <b style={{ fontSize: 15 }}>To be confirmed</b>
                  </>
                )}
              </div>
              <p style={{ color: '#8fa3c8', fontSize: 12.5 }}>
                {draft.rentalType === 'self-drive'
                  ? 'Estimate only — confirmed by GoDrive before release of the vehicle.'
                  : 'With-driver totals are confirmed with GoDrive; the rate unit is not assumed here.'}
              </p>
            </div>
          </aside>
        </div>

        <div className="flow-sticky">
          <div>
            <b>{vehicle?.name ?? 'Select a vehicle'}</b>
            <small>
              {draft.rentalType === 'self-drive'
                ? (vehicle && amount !== null && days > 0 ? `${formatPeso(amount)} · ${days}d` : 'Estimate appears here')
                : 'Driver rate · to be confirmed'}
            </small>
          </div>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary btn-sm" onClick={goNext}>Continue →</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={submit}>Submit →</button>
          )}
        </div>
      </div>
    </section>
  );
}

function CarPick({
  vehicleId,
  selected,
  onPick,
  status,
}: {
  vehicleId: string;
  selected: boolean;
  onPick: () => void;
  status: string;
}) {
  const v = VEHICLES.find((x) => x.id === vehicleId) as Vehicle;
  const { photos } = useVehiclePhotos(v.id);
  return (
    <button className={`car-pick${selected ? ' selected' : ''}`} onClick={onPick} aria-pressed={selected}>
      <span className="car-pick-media">
        <VehiclePhoto vehicle={v} src={photos[0]?.src} tone="light" />
      </span>
      <span className="car-pick-info">
        <span className="car-pick-top"><b>{v.name}</b><StatusBadge status={status} /></span>
        <small>{vehicleMeta(v.id)?.tag ?? v.bodyType} · {v.transmission}</small>
        <small className="car-pick-link">From {formatPeso(v.startingRatePerDay)} / day · full details on the Cars page →</small>
      </span>
      <span className="car-pick-check" aria-hidden="true">{selected ? '●' : '○'}</span>
    </button>
  );
}
