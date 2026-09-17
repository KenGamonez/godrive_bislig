import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Booking, BookingDraft } from '../../types';
import { VEHICLES } from '../../data/business';
import { StatusBadge, VehicleArt } from '../../components/site';
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

const STEPS = ['Vehicle', 'Rental type', 'Dates', 'Destination', 'Your details', 'Review'];

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

export function BookPage() {
  const { settings, vehicleStatus, addBooking, upsertCustomerFromBooking } = useAppStore();
  const [params] = useSearchParams();
  const preselected = params.get('vehicle') ?? '';

  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(() => {
    const typeParam = (params.get('type') ?? '').toLowerCase();
    const pickupParam = params.get('pickup') ?? '';
    const returnParam = params.get('return') ?? '';
    const dateOk = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);
    return {
      ...EMPTY,
      vehicleId: VEHICLES.some((v) => v.id === preselected) ? preselected : '',
      rentalType: typeParam === 'with' || typeParam === 'with-driver' ? 'with-driver' : 'self-drive',
      pickupDate: dateOk(pickupParam) ? pickupParam : '',
      returnDate: dateOk(returnParam) ? returnParam : '',
    };
  });

  const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const vehicle = VEHICLES.find((v) => v.id === draft.vehicleId);
  const { days, amount } = useMemo(() => estimateSelfDrive(draft), [draft]);
  const today = todayISO();

  const zoneLabel =
    draft.rentalType === 'self-drive'
      ? (settings.selfDriveRates.find((r) => r.zone === draft.selfDriveZone)?.label ?? '')
      : (settings.withDriverRates.find((r) => r.zone === draft.withDriverZone)?.label ?? '');

  /** Per-step validation; error strings keyed by field. */
  const errors: Record<string, string> = useMemo(() => {
    const e: Record<string, string> = {};
    if (step === 0 && !draft.vehicleId) e.vehicle = 'Select a vehicle to continue.';
    if (step === 2) {
      if (!draft.pickupDate) e.pickup = 'Choose a pickup date.';
      else if (draft.pickupDate < today) e.pickup = 'Pickup date cannot be in the past.';
      if (!draft.returnDate) e.return = 'Choose a return date.';
      else if (draft.returnDate < draft.pickupDate) e.return = 'Return date cannot be before pickup date.';
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
              {done.estimatedAmount !== null && (
                <div className="success-row"><span>Estimate</span><b>{formatPeso(done.estimatedAmount)} (self-drive)</b></div>
              )}
              {done.estimatedAmount === null && (
                <div className="success-row"><span>Driver rate</span><b>To be confirmed with GoDrive</b></div>
              )}
            </div>
          </div>
          <div className="mt-24" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/fleet" className="btn btn-outline">Browse Fleet</Link>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </section>
    );
  }

  const showErr = (k: string) => tried && errors[k];

  return (
    <section className="section">
      <div className="container">
        <div className="book-head">
          <div className="kick"><span>Reservation — No account needed</span><span>Step {step + 1} / {STEPS.length}</span></div>
          <h1 className="h-section">Request your vehicle.</h1>
          <p className="lede mt-16">Move backward at any time — nothing you entered is lost. GoDrive confirms every request personally.</p>
        </div>

        <div className="psteps" aria-label="Booking progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`pstep${i < step ? ' done' : ''}${i === step ? ' now' : ''}`}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span className="t">{s}</span>
            </div>
          ))}
        </div>
        <p className="book-step-label">Now — {STEPS[step]}</p>

        <div className="book-layout mt-24">
          <div className="panel panel-pad">
            {step === 0 && (
              <div>
                <h2 className="h-sub">Select vehicle</h2>
                <p className="small mt-16">Step 1 of your request. Availability shown is a local demo.</p>
                <div className="option-cards mt-24">
                  {VEHICLES.map((v) => {
                    const st = vehicleStatus[v.id] ?? 'Available';
                    const selected = draft.vehicleId === v.id;
                    return (
                      <button
                        key={v.id}
                        className={`option-card${selected ? ' selected' : ''}`}
                        onClick={() => set('vehicleId', v.id)}
                        aria-pressed={selected}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                          <b>{v.name}</b>
                          <StatusBadge status={st} />
                        </div>
                        <div style={{ margin: '10px 0' }}><VehicleArt silhouette={v.silhouette} title={v.name} /></div>
                        <p>{v.bodyType} · {v.transmission}{v.capacity ? ` · ${v.capacity}` : ''}{v.year ? ` · ${v.year}` : ''}</p>
                        <p style={{ color: 'var(--navy-800)', fontWeight: 700 }}>From {formatPeso(v.startingRatePerDay)} / day self-drive</p>
                      </button>
                    );
                  })}
                </div>
                {showErr('vehicle') && <p className="field-error mt-16">{errors.vehicle}</p>}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="h-sub">Select rental type</h2>
                <p className="small mt-16">Step 2 of your request.</p>
                <div className="option-cards two mt-24">
                  <button
                    className={`option-card${draft.rentalType === 'self-drive' ? ' selected' : ''}`}
                    onClick={() => set('rentalType', 'self-drive')}
                    aria-pressed={draft.rentalType === 'self-drive'}
                  >
                    <b>Self-drive</b>
                    <p>You drive. Valid license + proof of income required. Daily zone rates.</p>
                  </button>
                  <button
                    className={`option-card${draft.rentalType === 'with-driver' ? ' selected' : ''}`}
                    onClick={() => set('rentalType', 'with-driver')}
                    aria-pressed={draft.rentalType === 'with-driver'}
                  >
                    <b>With driver</b>
                    <p>A professional GoDrive driver handles the trip. Destination-based rate.</p>
                  </button>
                </div>
                {draft.rentalType === 'self-drive' ? (
                  <div className="note-box mt-24">
                    Self-drive requires a <b>valid driver&apos;s license</b> and <b>proof of income</b> — they establish your ability
                    to answer for rental liabilities in case of an untoward incident.
                  </div>
                ) : (
                  <div className="note-box warn mt-24">{settings.withDriverRateUnitNote} {settings.driverExpenseNote}</div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="h-sub">Pickup &amp; return dates</h2>
                <p className="small mt-16">Steps 3–4 of your request. Same-day pickup and return counts as 1 day.</p>
                <div className="form-grid two mt-24">
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
                {days > 0 && (
                  <div className="note-box mt-24">
                    <b>{days} day{days === 1 ? '' : 's'}</b> · {formatDateLong(draft.pickupDate)} → {formatDateLong(draft.returnDate)}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="h-sub">Destination / area</h2>
                <p className="small mt-16">Step 5 of your request. Your zone determines the rate.</p>
                <div className="form-grid mt-24">
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
                      <select id="zone" value={draft.selfDriveZone} onChange={(e) => set('selfDriveZone', e.target.value as BookingDraft['selfDriveZone'])}>
                        {settings.selfDriveRates.map((r) => (
                          <option key={r.zone} value={r.zone}>{r.label} — {formatPeso(r.amountPerDay)}/day</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="field">
                      <label htmlFor="wzone">Destination band</label>
                      <select id="wzone" value={draft.withDriverZone} onChange={(e) => set('withDriverZone', e.target.value as BookingDraft['withDriverZone'])}>
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
              <div>
                <h2 className="h-sub">Your details</h2>
                <p className="small mt-16">Steps 6–7 of your request. GoDrive uses these to confirm availability.</p>
                <div className="form-grid two mt-24">
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
                    <label htmlFor="notes">Notes / special requests <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <textarea id="notes" placeholder="Early pickup, extra luggage space, with-driver overnight…" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="h-sub">Review booking</h2>
                <p className="small mt-16">Steps 8–9. Check everything, then submit your request.</p>
                <div className="mt-24">
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

            <div className="book-nav">
              {step > 0 ? (
                <button className="btn btn-outline" onClick={goBack}>Back</button>
              ) : <span />}
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={goNext}>Continue <span className="arr" aria-hidden="true">→</span></button>
              ) : (
                <button className="btn btn-primary" onClick={submit}>Submit Request <span className="arr" aria-hidden="true">→</span></button>
              )}
            </div>
          </div>

          <aside className="summary" aria-label="Booking summary">
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
                    <b>{amount !== null && days > 0 ? formatPeso(amount) : '—'}</b>
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
      </div>
    </section>
  );
}
