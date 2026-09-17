import { MONTHLY_TREND } from '../../data/mock';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

export function ReportsPage() {
  const { bookings } = useAppStore();
  const completed = bookings.filter((b) => b.status === 'Completed');
  const revenue = completed.reduce((s, b) => s + (b.estimatedAmount ?? 0), 0);
  const selfDrive = bookings.filter((b) => b.rentalType === 'self-drive').length;
  const withDriver = bookings.filter((b) => b.rentalType === 'with-driver').length;
  const total = Math.max(bookings.length, 1);
  const selfPct = Math.round((selfDrive / total) * 100);
  const maxTrend = Math.max(...MONTHLY_TREND.map((m) => m.bookings), 1);

  return (
    <>
      <span className="demo-tag">Demo reports — illustrative mock figures, not real GoDrive financial records.</span>
      <div className="stat-grid">
        <div className="stat"><span>Total bookings</span><b>{bookings.length}</b><small>All statuses (demo)</small></div>
        <div className="stat"><span>Completed rentals</span><b>{completed.length}</b><small>Finished trips (demo)</small></div>
        <div className="stat"><span>Revenue (demo)</span><b>{formatPeso(revenue)}</b><small>Completed self-drive estimates</small></div>
        <div className="stat"><span>Completion rate</span><b>{Math.round((completed.length / total) * 100)}%</b><small>Completed ÷ total</small></div>
      </div>

      <div className="detail-grid">
        <div className="panel panel-pad">
          <h3 className="h-sub">Monthly booking trend</h3>
          <p className="small mt-16">Bookings and revenue per month (demo data).</p>
          <div className="bar-list mt-24">
            {MONTHLY_TREND.map((m) => (
              <div key={m.month}>
                <div className="bar-row">
                  <b>{m.month}</b>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.round((m.bookings / maxTrend) * 100)}%` }} />
                  </div>
                  <span style={{ textAlign: 'right' }}><b>{m.bookings}</b> bkgs</span>
                </div>
                <div className="small" style={{ margin: '4px 0 6px 56px' }}>{formatPeso(m.revenue)} revenue (demo)</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-pad" style={{ alignSelf: 'start' }}>
          <h3 className="h-sub">Self-drive vs with-driver</h3>
          <p className="small mt-16">Share of all demo bookings.</p>
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
          <div className="kv"><span>Total bookings</span><b>{bookings.length}</b></div>
          <div className="kv"><span>Completed</span><b>{completed.length}</b></div>
          <div className="kv"><span>Cancelled</span><b>{bookings.filter((b) => b.status === 'Cancelled').length}</b></div>
          <div className="kv"><span>Revenue base</span><b>Self-drive estimates only — with-driver totals need a confirmed rate unit</b></div>
        </div>
      </div>
    </>
  );
}
