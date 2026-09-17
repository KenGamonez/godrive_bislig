import { Link } from 'react-router-dom';
import { VEHICLES } from '../../data/business';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong, formatPeso, todayISO } from '../../utils/booking';

export function DashboardPage() {
  const { bookings, vehicleStatus, updateBookingStatus } = useAppStore();
  const today = todayISO();

  const pending = bookings.filter((b) => b.status === 'Pending');
  const confirmed = bookings.filter((b) => b.status === 'Confirmed');
  const active = bookings.filter((b) => b.status === 'Ongoing');
  const completed = bookings.filter((b) => b.status === 'Completed');
  const available = VEHICLES.filter((v) => (vehicleStatus[v.id] ?? 'Available') === 'Available').length;
  const onRental = VEHICLES.length - available;
  const revenue = completed.reduce((s, b) => s + (b.estimatedAmount ?? 0), 0);
  const todayPickups = bookings.filter((b) => b.pickupDate === today && (b.status === 'Pending' || b.status === 'Confirmed'));
  const todayReturns = bookings.filter((b) => b.returnDate === today && b.status === 'Ongoing');

  const todayStats: Array<[string, string, string]> = [
    ['Bookings', String(bookings.length), 'All statuses · local demo'],
    ['Available vehicles', `${available} / ${VEHICLES.length}`, 'Ready now'],
    ['Vehicles on rental', String(onRental), 'Reserved / in use'],
    ['Pending requests', String(pending.length), 'Need a decision'],
  ];

  return (
    <>
      <span className="demo-tag">All figures below are demo / mock data stored locally in this browser.</span>

      <section className="admin-today">
        <div className="admin-today-head">
          <div>
            <span className="eyebrow">Today</span>
            <h2 className="h-sub mt-16">{formatDateLong(today)}</h2>
          </div>
          <Link to="/admin/availability" className="btn btn-outline btn-sm">Availability board →</Link>
        </div>
        <div className="stat-grid">
          {todayStats.map(([label, value, sub]) => (
            <div className="stat" key={label}>
              <span>{label}</span>
              <b>{value}</b>
              <small>{sub}</small>
            </div>
          ))}
        </div>
        <div className="today-moves">
          <div className="today-move">
            <span>Pickups today</span>
            <b>{todayPickups.length === 0 ? 'None scheduled' : todayPickups.map((b) => b.reference).join(' · ')}</b>
          </div>
          <div className="today-move">
            <span>Returns today</span>
            <b>{todayReturns.length === 0 ? 'None scheduled' : todayReturns.map((b) => b.reference).join(' · ')}</b>
          </div>
          <div className="today-move">
            <span>Revenue (completed self-drive)</span>
            <b>{formatPeso(revenue)}</b>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Needs attention ({pending.length + active.length})</h3>
          <Link to="/admin/bookings" className="btn btn-ghost btn-sm">All bookings →</Link>
        </div>
        {pending.length === 0 && active.length === 0 ? (
          <p style={{ padding: '20px 28px', color: 'var(--muted)' }}>Nothing urgent. The queue is clear.</p>
        ) : (
          <ul className="attention-list">
            {pending.slice(0, 4).map((b) => (
              <li key={b.id} className="attention-row">
                <span className="attention-main">
                  <b>{b.reference}</b>
                  <small>{b.fullName} · {VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId} · {formatDateLong(b.pickupDate)}</small>
                </span>
                <span className="attention-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => updateBookingStatus(b.id, 'Confirmed')}>Confirm</button>
                  <Link to="/admin/bookings" className="btn btn-outline btn-sm">Review</Link>
                </span>
              </li>
            ))}
            {active.slice(0, 3).map((b) => (
              <li key={b.id} className="attention-row">
                <span className="attention-main">
                  <b>{b.reference}</b>
                  <small>Ongoing · {VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId} · returns {formatDateLong(b.returnDate)}</small>
                </span>
                <span className="attention-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => updateBookingStatus(b.id, 'Completed')}>Complete</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <div className="panel-head"><h3>Fleet status</h3><Link to="/admin/fleet" className="btn btn-ghost btn-sm">Manage →</Link></div>
        <div style={{ padding: '8px 28px 24px', display: 'grid', gap: 0 }}>
          {VEHICLES.map((v) => {
            const st = vehicleStatus[v.id] ?? 'Available';
            const linked = bookings.find((b) => b.vehicleId === v.id && (b.status === 'Ongoing' || b.status === 'Confirmed'));
            return (
              <div key={v.id} className="fleet-status-row">
                <div>
                  <b style={{ fontSize: 14.5 }}>{v.name}</b>
                  <div className="small">{v.bodyType} · {v.transmission}{linked ? ` · ${linked.reference}` : ''}</div>
                </div>
                <StatusBadge status={st} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel panel-pad admin-mini">
        <div>
          <span className="eyebrow">Pipeline</span>
          <p className="mt-16">
            <b>{confirmed.length}</b> confirmed · <b>{active.length}</b> ongoing · <b>{completed.length}</b> completed
          </p>
        </div>
        <Link to="/admin/reports" className="btn btn-outline btn-sm">Reports →</Link>
      </section>
    </>
  );
}
