import { Link } from 'react-router-dom';
import { VEHICLES } from '../../data/business';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong, formatPeso } from '../../utils/booking';

export function DashboardPage() {
  const { bookings, vehicleStatus, updateBookingStatus } = useAppStore();

  const pending = bookings.filter((b) => b.status === 'Pending');
  const upcoming = bookings.filter((b) => b.status === 'Confirmed');
  const active = bookings.filter((b) => b.status === 'Ongoing');
  const completed = bookings.filter((b) => b.status === 'Completed');
  const available = VEHICLES.filter((v) => (vehicleStatus[v.id] ?? 'Available') === 'Available').length;
  const revenue = completed.reduce((s, b) => s + (b.estimatedAmount ?? 0), 0);
  const selfDrive = bookings.filter((b) => b.rentalType === 'self-drive').length;
  const withDriver = bookings.filter((b) => b.rentalType === 'with-driver').length;

  const stats: Array<[string, string, string]> = [
    ['Pending bookings', String(pending.length), 'Awaiting review'],
    ['Upcoming rentals', String(upcoming.length), 'Confirmed, not started'],
    ['Active rentals', String(active.length), 'Currently ongoing'],
    ['Available vehicles', `${available} / ${VEHICLES.length}`, 'Fleet readiness'],
    ['Completed rentals', String(completed.length), 'All time (demo)'],
    ['Revenue (demo)', formatPeso(revenue), 'Completed self-drive only'],
    ['Self-drive bookings', String(selfDrive), 'All statuses'],
    ['With-driver bookings', String(withDriver), 'All statuses'],
  ];

  return (
    <>
      <span className="demo-tag">All figures below are demo / mock data stored locally in this browser.</span>
      <div className="stat-grid">
        {stats.map(([label, value, sub]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{sub}</small>
          </div>
        ))}
      </div>

      <div className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Pending review ({pending.length})</h3>
            <Link to="/admin/bookings" className="btn btn-ghost btn-sm">All bookings →</Link>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Ref</th><th>Customer</th><th>Vehicle</th><th>Pickup</th><th></th></tr></thead>
              <tbody>
                {pending.length === 0 && (
                  <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>No pending requests. The queue is clear.</td></tr>
                )}
                {pending.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td><b>{b.reference}</b></td>
                    <td>{b.fullName}</td>
                    <td>{VEHICLES.find((v) => v.id === b.vehicleId)?.name ?? b.vehicleId}</td>
                    <td>{formatDateLong(b.pickupDate)}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => updateBookingStatus(b.id, 'Confirmed')}>Confirm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>Fleet snapshot</h3><Link to="/admin/fleet" className="btn btn-ghost btn-sm">Manage →</Link></div>
          <div style={{ padding: '8px 28px 24px', display: 'grid', gap: 14 }}>
            {VEHICLES.map((v) => (
              <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
                <div>
                  <b style={{ fontSize: 14.5 }}>{v.name}</b>
                  <div className="small">{v.bodyType} · {v.transmission}</div>
                </div>
                <StatusBadge status={vehicleStatus[v.id] ?? 'Available'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
