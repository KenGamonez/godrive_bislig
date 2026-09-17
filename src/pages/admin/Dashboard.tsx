import { Link } from 'react-router-dom';
import { VEHICLES } from '../../data/business';
import { StatusBadge } from '../../components/site';
import { OwnerMessages } from '../../chat/OwnerMessages';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong, formatPeso, todayISO } from '../../utils/booking';

type FleetDisplay = 'Available' | 'Reserved' | 'Rented' | 'Unavailable';

function displayStatus(manual: string, hasOngoing: boolean): FleetDisplay {
  if (manual === 'Unavailable') return 'Unavailable';
  if (hasOngoing) return 'Rented';
  if (manual === 'Reserved') return 'Reserved';
  return 'Available';
}

const DISPLAY_BADGE: Record<FleetDisplay, string> = {
  Available: 'Available',
  Reserved: 'Reserved',
  Rented: 'Ongoing',
  Unavailable: 'Unavailable',
};

export function DashboardPage() {
  const {
    bookings,
    vehicleStatus,
    setVehicleStatus,
    maintenance,
    updateBookingStatus,
  } = useAppStore();
  const today = todayISO();

  const pending = bookings.filter((b) => b.status === 'Pending');
  const ongoingByVehicle = new Map(
    bookings.filter((b) => b.status === 'Ongoing').map((b) => [b.vehicleId, b]),
  );

  const fleet = VEHICLES.map((v) => {
    const manual = vehicleStatus[v.id] ?? 'Available';
    const ongoing = ongoingByVehicle.get(v.id);
    return { vehicle: v, manual, ongoing, display: displayStatus(manual, !!ongoing) };
  });

  const todayPickups = bookings.filter(
    (b) => b.pickupDate === today && (b.status === 'Pending' || b.status === 'Confirmed'),
  );
  const todayReturns = bookings.filter(
    (b) => b.returnDate === today && b.status === 'Ongoing',
  );
  const fleetEvents = fleet.filter(
    (f) => f.display === 'Unavailable' || (maintenance[f.vehicle.id] ?? 'Good') === 'In Shop',
  );

  const attentionCount = pending.length + todayPickups.length + todayReturns.length + fleetEvents.length;

  const recent = [...bookings]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  const now = new Date();
  const monthBookings = bookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthCompleted = monthBookings.filter((b) => b.status === 'Completed');
  const revenue = monthCompleted.reduce((s, b) => s + (b.estimatedAmount ?? 0), 0);

  return (
    <>
      <span className="demo-tag">All figures below are demo / mock data stored locally in this browser.</span>

      {/* ============ 1. FLEET STATUS ============ */}
      <section className="panel">
        <div className="panel-head">
          <h3>Fleet status</h3>
          <Link to="/admin/fleet" className="btn btn-ghost btn-sm">Manage →</Link>
        </div>
        <div style={{ padding: '8px 28px 24px', display: 'grid', gap: 0 }}>
          {fleet.map(({ vehicle: v, ongoing, display }) => (
            <div key={v.id} className="fleet-status-row">
              <div>
                <b style={{ fontSize: 14.5 }}>{v.name}</b>
                <div className="small">
                  {v.bodyType} · {v.transmission}
                  {ongoing ? ` · ${ongoing.reference} (${ongoing.fullName})` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <StatusBadge status={DISPLAY_BADGE[display]} />
                {!ongoing && (
                  <button
                    className={`btn btn-sm ${display === 'Unavailable' ? 'btn-primary' : 'btn-outline-danger'}`}
                    onClick={() =>
                      setVehicleStatus(v.id, display === 'Unavailable' ? 'Available' : 'Unavailable')
                    }
                  >
                    {display === 'Unavailable' ? 'Mark available' : 'Mark unavailable'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 2. BOOKINGS ============ */}
      <section className="panel">
        <div className="panel-head">
          <h3>Recent bookings</h3>
          <Link to="/admin/bookings" className="btn btn-ghost btn-sm">All bookings →</Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ padding: '20px 28px', color: 'var(--muted)' }}>No bookings yet.</p>
        ) : (
          <ul className="attention-list">
            {recent.map((b) => (
              <li key={b.id} className="attention-row">
                <span className="attention-main">
                  <b>{b.reference}</b>
                  <small>
                    {b.fullName} · {VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId}
                    {' · '}{formatDateLong(b.pickupDate)} → {formatDateLong(b.returnDate)}
                  </small>
                </span>
                <span className="attention-actions" style={{ alignItems: 'center' }}>
                  <StatusBadge status={b.status} />
                  <Link to="/admin/bookings" className="btn btn-outline btn-sm">View</Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ============ 3. TODAY / NEEDS ATTENTION ============ */}
      <section className="panel">
        <div className="panel-head">
          <h3>Today · {formatDateLong(today)}</h3>
          <span className="demo-tag">Needs attention ({attentionCount})</span>
        </div>
        {attentionCount === 0 ? (
          <p style={{ padding: '20px 28px', color: 'var(--muted)' }}>All caught up.</p>
        ) : (
          <ul className="attention-list">
            {pending.map((b) => (
              <li key={b.id} className="attention-row">
                <span className="attention-main">
                  <b>{b.reference} — pending review</b>
                  <small>{b.fullName} · {VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId} · pickup {formatDateLong(b.pickupDate)}</small>
                </span>
                <span className="attention-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => updateBookingStatus(b.id, 'Confirmed')}>Confirm</button>
                  <Link to="/admin/bookings" className="btn btn-outline btn-sm">Review</Link>
                </span>
              </li>
            ))}
            {todayPickups.map((b) => (
              <li key={`p-${b.id}`} className="attention-row">
                <span className="attention-main">
                  <b>{b.reference} — pickup today</b>
                  <small>{b.fullName} · {VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId}</small>
                </span>
                <span className="attention-actions" style={{ alignItems: 'center' }}>
                  <StatusBadge status={b.status} />
                </span>
              </li>
            ))}
            {todayReturns.map((b) => (
              <li key={`r-${b.id}`} className="attention-row">
                <span className="attention-main">
                  <b>{b.reference} — return today</b>
                  <small>{b.fullName} · {VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId}</small>
                </span>
                <span className="attention-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => updateBookingStatus(b.id, 'Completed')}>Complete</button>
                </span>
              </li>
            ))}
            {fleetEvents.map(({ vehicle: v, display }) => (
              <li key={`f-${v.id}`} className="attention-row">
                <span className="attention-main">
                  <b>{v.name} — {display === 'Unavailable' ? 'marked unavailable' : 'in shop'}</b>
                  <small>Fleet status change · check before confirming new requests</small>
                </span>
                <span className="attention-actions">
                  <Link to="/admin/fleet" className="btn btn-outline btn-sm">Fleet</Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ============ 4. WEBSITE ============ */}
      <section className="panel panel-pad">
        <span className="eyebrow">Website</span>
        <h3 className="h-sub mt-16">Traffic</h3>
        <p className="mybooking-empty mt-24">
          Analytics not connected. Visitor, page-view, vehicle-view, and Book Now click
          data will appear here once an analytics provider is connected. No estimates are shown.
        </p>
      </section>

      {/* ============ 5. BUSINESS SUMMARY ============ */}
      <section className="panel">
        <div className="panel-head">
          <h3>Business · this month</h3>
          <Link to="/admin/reports" className="btn btn-ghost btn-sm">Reports →</Link>
        </div>
        <div className="stat-grid" style={{ padding: '20px 28px 24px' }}>
          <div className="stat">
            <span>Bookings</span>
            <b>{monthBookings.length}</b>
            <small>Created this month</small>
          </div>
          <div className="stat">
            <span>Completed</span>
            <b>{monthCompleted.length}</b>
            <small>Rentals finished</small>
          </div>
          <div className="stat">
            <span>Revenue</span>
            <b>{formatPeso(revenue)}</b>
            <small>Local estimates only — payments not connected</small>
          </div>
        </div>
      </section>

      {/* ============ 6. NOTIFICATIONS ============ */}
      <section className="panel">
        <div className="panel-head"><h3>Notifications</h3></div>
        {attentionCount === 0 ? (
          <p style={{ padding: '20px 28px', color: 'var(--muted)' }}>All caught up.</p>
        ) : (
          <ul className="attention-list">
            {pending.slice(0, 3).map((b) => (
              <li key={`n-${b.id}`} className="attention-row">
                <span className="attention-main">
                  <b>New booking request</b>
                  <small>{b.reference} · {b.fullName} · {formatDateLong(b.pickupDate)}</small>
                </span>
                <span className="attention-actions" style={{ alignItems: 'center' }}>
                  <StatusBadge status="Pending" />
                </span>
              </li>
            ))}
            {fleetEvents.slice(0, 3).map(({ vehicle: v, display }) => (
              <li key={`n-f-${v.id}`} className="attention-row">
                <span className="attention-main">
                  <b>Fleet event</b>
                  <small>{v.name} · {display === 'Unavailable' ? 'marked unavailable' : 'in shop'}</small>
                </span>
                <span className="attention-actions" style={{ alignItems: 'center' }}>
                  <StatusBadge status={display === 'Unavailable' ? 'Unavailable' : 'In Shop'} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* ============ 7. MESSAGES ============ */}
      <OwnerMessages />
    </>
  );
}
