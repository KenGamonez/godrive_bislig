import { useMemo, useState } from 'react';
import type { BookingStatus } from '../../types';
import { VEHICLES } from '../../data/business';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong, formatPeso } from '../../utils/booking';

const STATUSES: Array<BookingStatus | 'All'> = ['All', 'Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

export function BookingsPage() {
  const { bookings, updateBookingStatus } = useAppStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BookingStatus | 'All'>('All');
  const [type, setType] = useState<'all' | 'self-drive' | 'with-driver'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== 'All' && b.status !== status) return false;
      if (type !== 'all' && b.rentalType !== type) return false;
      if (!q) return true;
      const v = VEHICLES.find((x) => x.id === b.vehicleId)?.name ?? '';
      return [b.reference, b.fullName, b.mobile, b.destination, v].join(' ').toLowerCase().includes(q);
    });
  }, [bookings, query, status, type]);

  const selected = bookings.find((b) => b.id === selectedId) ?? null;
  const vehicleName = (id: string) => VEHICLES.find((v) => v.id === id)?.name ?? id;

  const action = (id: string, s: BookingStatus) => updateBookingStatus(id, s);

  return (
    <>
      <span className="demo-tag">Demo bookings — status changes apply to local state only.</span>
      <div className="toolbar">
        <input type="search" placeholder="Search reference, customer, destination…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search bookings" />
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Rental type">
          <option value="all">All types</option>
          <option value="self-drive">Self-drive</option>
          <option value="with-driver">With driver</option>
        </select>
      </div>
      <div className="chip-row">
        {STATUSES.map((s) => (
          <button key={s} className={`chip${status === s ? ' active' : ''}`} onClick={() => setStatus(s)}>{s}</button>
        ))}
      </div>

      <div className="detail-grid">
        <div className="panel">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Reference</th><th>Customer</th><th>Vehicle</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ color: 'var(--muted)' }}>No bookings match this filter.</td></tr>
                )}
                {filtered.map((b) => (
                  <tr key={b.id} className="clickable" onClick={() => setSelectedId(b.id)}>
                    <td><b>{b.reference}</b></td>
                    <td>{b.fullName}<div className="small">{b.mobile}</div></td>
                    <td>{vehicleName(b.vehicleId)}</td>
                    <td>{b.rentalType === 'self-drive' ? 'Self-drive' : 'With driver'}</td>
                    <td className="small">{formatDateLong(b.pickupDate)} → {formatDateLong(b.returnDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel panel-pad" style={{ alignSelf: 'start' }}>
          {!selected ? (
            <>
              <h3 className="h-sub">Booking detail</h3>
              <p className="small mt-16">Select a booking from the list to review details and update its status.</p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <h3 className="h-sub">{selected.reference}</h3>
                <StatusBadge status={selected.status} />
              </div>
              <div className="mt-16">
                <div className="kv"><span>Customer</span><b>{selected.fullName}</b></div>
                <div className="kv"><span>Mobile</span><b>{selected.mobile}</b></div>
                {selected.email && <div className="kv"><span>Email</span><b>{selected.email}</b></div>}
                <div className="kv"><span>Vehicle</span><b>{vehicleName(selected.vehicleId)}</b></div>
                <div className="kv"><span>Type</span><b>{selected.rentalType === 'self-drive' ? 'Self-drive' : 'With driver'}</b></div>
                <div className="kv"><span>Pickup</span><b>{formatDateLong(selected.pickupDate)}</b></div>
                <div className="kv"><span>Return</span><b>{formatDateLong(selected.returnDate)} · {selected.rentalDays}d</b></div>
                <div className="kv"><span>Destination</span><b>{selected.destination}</b></div>
                <div className="kv"><span>Estimate</span><b>{selected.estimatedAmount !== null ? formatPeso(selected.estimatedAmount) : 'To be confirmed (with-driver)'}</b></div>
                {selected.notes && <div className="kv"><span>Notes</span><b>{selected.notes}</b></div>}
              </div>
              <div className="action-row">
                {selected.status === 'Pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => action(selected.id, 'Confirmed')}>Confirm</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => action(selected.id, 'Cancelled')}>Cancel</button>
                  </>
                )}
                {selected.status === 'Confirmed' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => action(selected.id, 'Ongoing')}>Mark Ongoing</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => action(selected.id, 'Cancelled')}>Cancel</button>
                  </>
                )}
                {selected.status === 'Ongoing' && (
                  <button className="btn btn-primary btn-sm" onClick={() => action(selected.id, 'Completed')}>Complete</button>
                )}
                {(selected.status === 'Cancelled' || selected.status === 'Completed') && (
                  <button className="btn btn-outline btn-sm" onClick={() => action(selected.id, 'Pending')}>Reopen as Pending</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
