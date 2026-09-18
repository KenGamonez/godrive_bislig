import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

type Range = '30' | '90' | '365' | 'all';

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-PH', { month: 'short' });
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { bookings, payments, vehicleName, cloud } = useAppStore();
  const [range, setRange] = useState<Range>('90');

  const cutoff = range === 'all' ? null : Date.now() - Number(range) * 86400000;
  const scoped = useMemo(
    () => (cutoff === null ? bookings : bookings.filter((b) => new Date(b.createdAt).getTime() >= cutoff)),
    [bookings, cutoff],
  );

  const completed = scoped.filter((b) => b.status === 'Completed');
  const revenue = completed.reduce((s, b) => s + (b.estimatedAmount ?? 0), 0);
  const collected = payments.reduce((s, p) => s + p.amount, 0);
  const selfDrive = scoped.filter((b) => b.rentalType === 'self-drive').length;
  const withDriver = scoped.filter((b) => b.rentalType === 'with-driver').length;
  const total = Math.max(scoped.length, 1);
  const selfPct = Math.round((selfDrive / total) * 100);

  const monthly = useMemo(() => {
    const buckets: Array<{ key: string; label: string; bookings: number; revenue: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({ key, label: monthLabel(d), bookings: 0, revenue: 0 });
    }
    for (const b of scoped) {
      const key = b.createdAt.slice(0, 7);
      const bucket = buckets.find((x) => x.key === key);
      if (!bucket) continue;
      bucket.bookings += 1;
      if (b.status === 'Completed') bucket.revenue += b.estimatedAmount ?? 0;
    }
    return buckets;
  }, [scoped]);
  const maxTrend = Math.max(...monthly.map((m) => m.bookings), 1);

  const exportCsv = () => {
    downloadCsv(`godrive-bookings-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Reference', 'Customer', 'Mobile', 'Vehicle', 'Type', 'Pickup', 'Return', 'Days', 'Estimate', 'Status', 'Created'],
      ...scoped.map((b) => [
        b.reference,
        b.fullName,
        b.mobile,
        vehicleName(b.vehicleId),
        b.rentalType,
        b.pickupDate,
        b.returnDate,
        b.rentalDays,
        b.estimatedAmount ?? '',
        b.status,
        b.createdAt,
      ]),
    ]);
  };

  return (
    <>
      <span className="demo-tag">
        {cloud ? 'Live figures from the GoDrive database.' : 'Demo reports — figures come from local state only.'}
      </span>
      <div className="toolbar">
        <select value={range} onChange={(e) => setRange(e.target.value as Range)} aria-label="Date range">
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
          <option value="all">All time</option>
        </select>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={exportCsv} disabled={scoped.length === 0}>
          Export CSV
        </button>
      </div>
      <div className="stat-grid">
        <div className="stat"><span>Total bookings</span><b>{scoped.length}</b><small>Selected range</small></div>
        <div className="stat"><span>Completed rentals</span><b>{completed.length}</b><small>Finished trips</small></div>
        <div className="stat"><span>Revenue</span><b>{formatPeso(revenue)}</b><small>Completed estimates</small></div>
        <div className="stat"><span>Collected</span><b>{formatPeso(collected)}</b><small>Recorded payments (all time)</small></div>
        <div className="stat"><span>Completion rate</span><b>{Math.round((completed.length / total) * 100)}%</b><small>Completed ÷ total</small></div>
      </div>

      <div className="detail-grid">
        <div className="panel panel-pad">
          <h3 className="h-sub">Monthly booking trend</h3>
          <p className="small mt-16">Bookings and completed revenue per month, from real records.</p>
          <div className="bar-list mt-24">
            {monthly.map((m) => (
              <div key={m.key}>
                <div className="bar-row">
                  <b>{m.label}</b>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.round((m.bookings / maxTrend) * 100)}%` }} />
                  </div>
                  <span style={{ textAlign: 'right' }}><b>{m.bookings}</b> bkgs</span>
                </div>
                <div className="small" style={{ margin: '4px 0 6px 56px' }}>{formatPeso(m.revenue)} completed revenue</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-pad" style={{ alignSelf: 'start' }}>
          <h3 className="h-sub">Self-drive vs with-driver</h3>
          <p className="small mt-16">Share of bookings in the selected range.</p>
          <div className="donut-row mt-24">
            <svg className="donut" viewBox="0 0 120 120" role="img" aria-label={`Self-drive ${selfPct} percent`}>
              <circle cx="60" cy="60" r="48" fill="none" stroke="#EEF1F5" strokeWidth="18" />
              <circle
                cx="60" cy="60" r="48" fill="none" stroke="#0A2148" strokeWidth="18"
                strokeDasharray={`${(selfPct / 100) * 301.6} 301.6`}
                strokeLinecap="round" transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="legend">
              <span><i style={{ background: '#0A2148' }} />Self-drive — {selfDrive} ({selfPct}%)</span>
              <span><i style={{ background: '#5B7AB5' }} />With driver — {withDriver} ({100 - selfPct}%)</span>
            </div>
          </div>
          <hr className="divider" />
          <div className="kv"><span>Total bookings</span><b>{scoped.length}</b></div>
          <div className="kv"><span>Completed</span><b>{completed.length}</b></div>
          <div className="kv"><span>Cancelled</span><b>{scoped.filter((b) => b.status === 'Cancelled').length}</b></div>
          <div className="kv"><span>Revenue base</span><b>Self-drive estimates only — with-driver totals need a confirmed rate unit</b></div>
        </div>
      </div>
    </>
  );
}
