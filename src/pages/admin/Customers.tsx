import { useMemo, useState } from 'react';
import { VEHICLES } from '../../data/business';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong } from '../../utils/booking';

export function CustomersPage() {
  const { customers, bookings, updateCustomerNotes } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.mobile, c.email ?? ''].join(' ').toLowerCase().includes(q),
    );
  }, [customers, query]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;
  const selectedBookings = selected
    ? bookings.filter((b) => selected.bookingIds.includes(b.id))
    : [];
  const completedCount = selectedBookings.filter((b) => b.status === 'Completed').length;

  const openCustomer = (id: string, notes: string) => {
    setSelectedId(id);
    setDraftNotes(notes);
  };

  return (
    <>
      <span className="demo-tag">Demo customers — derived from bookings, stored locally.</span>
      <div className="toolbar">
        <input type="search" placeholder="Search name, mobile, email…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search customers" />
      </div>
      <div className="detail-grid">
        <div className="panel">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Mobile</th><th>Bookings</th><th>Completed</th></tr></thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>No customers match.</td></tr>
                )}
                {filtered.map((c) => {
                  const hist = bookings.filter((b) => c.bookingIds.includes(b.id));
                  return (
                    <tr key={c.id} className="clickable" onClick={() => openCustomer(c.id, c.notes)}>
                      <td><b>{c.name}</b><div className="small">{c.email ?? 'No email'}</div></td>
                      <td>{c.mobile}</td>
                      <td>{hist.length}</td>
                      <td>{hist.filter((b) => b.status === 'Completed').length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel panel-pad" style={{ alignSelf: 'start' }}>
          {!selected ? (
            <>
              <h3 className="h-sub">Customer detail</h3>
              <p className="small mt-16">Select a customer to see booking history and notes.</p>
            </>
          ) : (
            <>
              <h3 className="h-sub">{selected.name}</h3>
              <div className="mt-16">
                <div className="kv"><span>Mobile</span><b>{selected.mobile}</b></div>
                <div className="kv"><span>Email</span><b>{selected.email ?? '—'}</b></div>
                <div className="kv"><span>Total bookings</span><b>{selectedBookings.length}</b></div>
                <div className="kv"><span>Completed</span><b>{completedCount}</b></div>
              </div>
              <h4 className="mt-24" style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Booking history</h4>
              <div className="mt-16" style={{ display: 'grid', gap: 10 }}>
                {selectedBookings.length === 0 && <p className="small">No bookings yet.</p>}
                {selectedBookings.map((b) => (
                  <div key={b.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <div>
                      <b style={{ fontSize: 13.5 }}>{b.reference}</b>
                      <div className="small">{VEHICLES.find((v) => v.id === b.vehicleId)?.name} · {formatDateLong(b.pickupDate)}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
              <h4 className="mt-24" style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Notes</h4>
              <div className="field mt-16">
                <label htmlFor="c-notes">Owner notes (local only)</label>
                <textarea id="c-notes" value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} placeholder="Add a note about this customer…" />
              </div>
              <div className="action-row">
                <button className="btn btn-primary btn-sm" onClick={() => updateCustomerNotes(selected.id, draftNotes)}>Save Notes</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
