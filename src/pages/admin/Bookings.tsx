import { useMemo, useState } from 'react';
import type { BookingStatus } from '../../types';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong, formatPeso } from '../../utils/booking';

const STATUSES: Array<BookingStatus | 'All'> = ['All', 'Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

export function BookingsPage() {
  const { bookings, updateBookingStatus, vehicleName, cloud, payments, addPayment } = useAppStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BookingStatus | 'All'>('All');
  const [type, setType] = useState<'all' | 'self-drive' | 'with-driver'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'GCash' | 'Bank Transfer' | 'Other'>('Cash');
  const [payDate, setPayDate] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== 'All' && b.status !== status) return false;
      if (type !== 'all' && b.rentalType !== type) return false;
      if (!q) return true;
      const v = vehicleName(b.vehicleId);
      return [b.reference, b.fullName, b.mobile, b.destination, v].join(' ').toLowerCase().includes(q);
    });
  }, [bookings, query, status, type, vehicleName]);

  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  const action = async (id: string, s: BookingStatus) => {
    setActionError(null);
    const err = await updateBookingStatus(id, s);
    if (err) setActionError(`Could not update booking (${err}). Try again.`);
  };

  const recordPay = async () => {
    if (!selected) return;
    setPayError(null);
    const amount = parseInt(payAmount.replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPayError('Enter a payment amount above ₱0.');
      return;
    }
    setPaying(true);
    const err = await addPayment({
      bookingId: selected.id,
      amount,
      method: payMethod,
      paidAt: /^\d{4}-\d{2}-\d{2}$/.test(payDate) ? payDate : new Date().toISOString().slice(0, 10),
      note: payNote.trim(),
    });
    setPaying(false);
    if (err) {
      setPayError(`Could not record payment (${err}).`);
      return;
    }
    setPayAmount('');
    setPayNote('');
    setPayDate('');
  };

  const selectedPayments = selected ? payments.filter((p) => p.bookingId === selected.id) : [];
  const selectedCollected = selectedPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <span className="demo-tag">
        {cloud ? `${bookings.length} booking${bookings.length === 1 ? '' : 's'} in the live database.` : 'Demo bookings — status changes apply to local state only.'}
      </span>
      {actionError && <p className="field-error" role="alert">{actionError}</p>}
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
                    <button className="btn btn-primary btn-sm" onClick={() => void action(selected.id, 'Confirmed')}>Confirm</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => void action(selected.id, 'Cancelled')}>Cancel</button>
                  </>
                )}
                {selected.status === 'Confirmed' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => void action(selected.id, 'Ongoing')}>Mark Ongoing</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => void action(selected.id, 'Cancelled')}>Cancel</button>
                  </>
                )}
                {selected.status === 'Ongoing' && (
                  <button className="btn btn-primary btn-sm" onClick={() => void action(selected.id, 'Completed')}>Complete</button>
                )}
                {(selected.status === 'Cancelled' || selected.status === 'Completed') && (
                  <button className="btn btn-outline btn-sm" onClick={() => void action(selected.id, 'Pending')}>Reopen as Pending</button>
                )}
              </div>
              <h4 className="mt-24" style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Payments · {formatPeso(selectedCollected)} collected
              </h4>
              <div className="mt-16" style={{ display: 'grid', gap: 10 }}>
                {selectedPayments.length === 0 && <p className="small">No payments recorded yet.</p>}
                {selectedPayments.map((p) => (
                  <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div>
                      <b style={{ fontSize: 13.5 }}>{formatPeso(p.amount)}</b>
                      <div className="small">{p.method} · {p.paidAt}{p.note ? ` · ${p.note}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-grid two mt-16">
                <div className="field">
                  <label htmlFor="pay-amount">Amount (₱)</label>
                  <input id="pay-amount" inputMode="numeric" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 2500" />
                </div>
                <div className="field">
                  <label htmlFor="pay-method">Method</label>
                  <select id="pay-method" value={payMethod} onChange={(e) => setPayMethod(e.target.value as typeof payMethod)}>
                    <option>Cash</option>
                    <option>GCash</option>
                    <option>Bank Transfer</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-grid two mt-16">
                <div className="field">
                  <label htmlFor="pay-date">Date <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(default today)</span></label>
                  <input id="pay-date" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="pay-note">Note <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input id="pay-note" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="e.g. Down payment" maxLength={140} />
                </div>
              </div>
              {payError && <p className="field-error mt-16" role="alert">{payError}</p>}
              <div className="action-row">
                <button className="btn btn-primary btn-sm" onClick={() => void recordPay()} disabled={paying}>
                  {paying ? 'Recording…' : 'Record Payment'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
