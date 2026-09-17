import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Booking, RentalType } from '../types';
import { VEHICLES } from '../data/business';
import { useAppStore } from '../store/AppStore';
import { formatDateLong, formatPeso } from '../utils/booking';
import { RentalTypeSelector } from './showroom';

/* ============================================================
   RateExplorer — compact interactive SELF-DRIVE | WITH-DRIVER.
   Self-drive rates differ per vehicle; pick a unit first.
   ============================================================ */

export function RateExplorer({ compact = false }: { compact?: boolean }) {
  const { settings, vehicleRates } = useAppStore();
  const [tab, setTab] = useState<RentalType>('self-drive');
  const [vehicleId, setVehicleId] = useState(VEHICLES[0]?.id ?? '');
  const vehicle = VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[0];
  const rates = vehicle ? vehicleRates(vehicle.id) : [];
  return (
    <div className={`ratex${compact ? ' compact' : ''}`}>
      <div className="ratex-tabs" role="tablist" aria-label="Rate type">
        <button
          role="tab"
          aria-selected={tab === 'self-drive'}
          className={tab === 'self-drive' ? 'on' : ''}
          onClick={() => setTab('self-drive')}
        >
          Self-drive
        </button>
        <button
          role="tab"
          aria-selected={tab === 'with-driver'}
          className={tab === 'with-driver' ? 'on' : ''}
          onClick={() => setTab('with-driver')}
        >
          With-driver
        </button>
      </div>
      {tab === 'self-drive' ? (
        <div className="ratex-list">
          <div className="ratex-vehicles" role="tablist" aria-label="Vehicles">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={v.id === vehicle?.id}
                className={v.id === vehicle?.id ? 'on' : ''}
                onClick={() => setVehicleId(v.id)}
              >
                <b>{v.name}</b>
                <small>from {formatPeso(v.startingRatePerDay)}/day</small>
              </button>
            ))}
          </div>
          {rates.map((r, i) => (
            <Link key={r.zone} to={`/book?vehicle=${vehicle?.id}&type=self&zone=${r.zone}`} className="ratex-row">
              <span className="ratex-zone">{String(i + 1).padStart(2, '0')}</span>
              <span className="ratex-name">
                <b>{r.shortLabel}</b>
                <small>{r.label}</small>
              </span>
              <span className="ratex-price">
                {formatPeso(r.amountPerDay)}
                <small>per day</small>
              </span>
              <span className="ratex-go" aria-hidden="true">→</span>
            </Link>
          ))}
          <p className="ratex-note">Estimate = days × zone rate. Calculated automatically during booking.</p>
        </div>
      ) : (
        <div className="ratex-list">
          {settings.withDriverRates.map((r) => (
            <Link key={r.zone} to="/book?type=with" className="ratex-row">
              <span className="ratex-name">
                <b>{r.label}</b>
                <small>{r.unitNote}</small>
              </span>
              <span className="ratex-price">
                {formatPeso(r.amount)}
                <small>as listed</small>
              </span>
              <span className="ratex-go" aria-hidden="true">→</span>
            </Link>
          ))}
          <p className="ratex-note">{settings.withDriverRateUnitNote} {settings.driverExpenseNote}</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MyBookingLookup — compact booking status (no fake accounts).
   Searches local mock bookings by reference or mobile number.
   ============================================================ */

function matchesQuery(b: Booking, q: string): boolean {
  const needle = q.trim().toLowerCase().replace(/[\s-]/g, '');
  if (!needle) return false;
  const ref = b.reference.toLowerCase().replace(/[\s-]/g, '');
  const mobile = b.mobile.replace(/[\s-]/g, '');
  return ref.includes(needle) || mobile.includes(needle) || b.fullName.toLowerCase().includes(q.trim().toLowerCase());
}

export function MyBookingLookup({ initial = '' }: { initial?: string }) {
  const { bookings } = useAppStore();
  const [query, setQuery] = useState(initial);
  const [searched, setSearched] = useState(initial.trim().length > 0);

  const results = useMemo(() => {
    if (!searched) return [];
    return bookings.filter((b) => matchesQuery(b, query)).slice(0, 5);
  }, [bookings, query, searched]);

  return (
    <div className="mybooking">
      <form
        className="mybooking-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSearched(true);
        }}
      >
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="mb-q">Booking reference or mobile number</label>
          <input
            id="mb-q"
            type="text"
            placeholder="e.g. GD-7K2P4Q or 09171234567"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearched(false);
            }}
            autoComplete="off"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Find <span className="arr" aria-hidden="true">→</span>
        </button>
      </form>
      {searched && (
        <div className="mybooking-results">
          {results.length === 0 ? (
            <p className="mybooking-empty">
              No booking found for “{query.trim()}” on this device. References are stored locally in this browser only —
              check the exact reference from your confirmation, or call GoDrive directly.
            </p>
          ) : (
            results.map((b) => {
              const v = VEHICLES.find((x) => x.id === b.vehicleId);
              return (
                <article key={b.id} className="mybooking-card">
                  <div className="mybooking-top">
                    <b className="mybooking-ref">{b.reference}</b>
                    <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className="mybooking-grid">
                    <div><span>Vehicle</span><b>{v?.name ?? b.vehicleId}</b></div>
                    <div><span>Pickup</span><b>{formatDateLong(b.pickupDate)}</b></div>
                    <div><span>Return</span><b>{formatDateLong(b.returnDate)} · {b.rentalDays}d</b></div>
                    <div>
                      <span>Total</span>
                      <b>{b.estimatedAmount !== null ? formatPeso(b.estimatedAmount) : 'To be confirmed'}</b>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
      {!searched && (
        <p className="hint">Your reference looks like <b>GD-XXXXXX</b> and was shown after you submitted a request.</p>
      )}
    </div>
  );
}

/* ============================================================
   Compact rental-type explainer used inside booking + options.
   Only reveals relevant info after selection.
   ============================================================ */

export function RentalTypeExplainer({
  value,
  onChange,
}: {
  value: RentalType;
  onChange: (v: RentalType) => void;
}) {
  const { settings } = useAppStore();
  const amounts = VEHICLES.flatMap((v) => v.rates.map((r) => r.amountPerDay));
  const lo = Math.min(...amounts);
  const hi = Math.max(...amounts);
  return (
    <div>
      <RentalTypeSelector value={value} onChange={onChange} />
      {value === 'self-drive' ? (
        <div className="note-box mt-16">
          Self-drive requires a <b>valid driver&apos;s license</b> and <b>proof of income</b>.
          Rates run {formatPeso(lo)}–{formatPeso(hi)} / day by vehicle and zone.
        </div>
      ) : (
        <div className="note-box warn mt-16">
          {settings.withDriverRateUnitNote} {settings.driverExpenseNote}
        </div>
      )}
    </div>
  );
}
