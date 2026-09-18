import type { VehicleAvailability } from '../../types';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong } from '../../utils/booking';

const ORDER: VehicleAvailability[] = ['Available', 'Reserved', 'Unavailable'];
const LIVE_BOOKING = ['Pending', 'Confirmed', 'Ongoing'];

export function AvailabilityPage() {
  const { boardDates, shiftBoard, overrides, setOverride, clearOverride, vehicleStatus, fleet, bookings, cloud } = useAppStore();

  const covering = (vehicleId: string, date: string) =>
    bookings.find(
      (b) =>
        b.vehicleId === vehicleId &&
        LIVE_BOOKING.includes(b.status) &&
        b.pickupDate <= date &&
        b.returnDate >= date,
    ) ?? null;

  const statusFor = (vehicleId: string, date: string): { value: VehicleAvailability; overridden: boolean } => {
    const o = overrides.find((x) => x.vehicleId === vehicleId && x.date === date);
    if (o) return { value: o.status, overridden: true };
    if (covering(vehicleId, date)) return { value: 'Reserved', overridden: false };
    return { value: vehicleStatus[vehicleId] ?? 'Available', overridden: false };
  };

  const cycle = (vehicleId: string, date: string) => {
    const current = statusFor(vehicleId, date).value;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setOverride(vehicleId, date, next);
  };

  return (
    <>
      <span className="demo-tag">
        {cloud
          ? 'Rental calendar — bookings overlay live records; cell edits save day-blocks.'
          : 'Demo availability board — click any cell to cycle status. Changes are local only.'}
      </span>
      <div className="cal-agenda" aria-label="Bookings by day">
        {boardDates.map((d) => {
          const items: Array<{ key: string; title: string; sub: string; status: string }> = [];
          for (const v of fleet) {
            const o = overrides.find((x) => x.vehicleId === v.id && x.date === d);
            if (o) {
              items.push({ key: `${v.id}-${d}`, title: v.name, sub: `Blocked · ${o.status}`, status: o.status });
              continue;
            }
            const b = covering(v.id, d);
            if (b) {
              items.push({
                key: `${v.id}-${d}`,
                title: v.name,
                sub: `${b.reference} · ${b.fullName} · ${formatDateLong(b.pickupDate)} → ${formatDateLong(b.returnDate)}`,
                status: b.status,
              });
            }
          }
          return (
            <section key={d} className="cal-day" aria-label={formatDateLong(d)}>
              <div className="cal-day-head">
                <span>{formatDateLong(d)}</span>
                <small>{items.length === 0 ? 'All clear' : `${items.length} item${items.length === 1 ? '' : 's'}`}</small>
              </div>
              {items.length === 0 ? (
                <p className="cal-empty">No bookings or blocks — fleet default applies.</p>
              ) : (
                items.map((it) => (
                  <div key={it.key} className="cal-item">
                    <b>{it.title}</b>
                    <small>{it.sub} · {it.status}</small>
                  </div>
                ))
              )}
            </section>
          );
        })}
      </div>
      <div className="panel cal-board">
        <div className="panel-head">
          <h3>Rental calendar · 7 days</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => shiftBoard(-7)}>← Prev week</button>
            <button className="btn btn-ghost btn-sm" onClick={() => shiftBoard(7)}>Next week →</button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { for (const o of [...overrides]) clearOverride(o.vehicleId, o.date); }}
            >
              Reset overrides
            </button>
          </div>
        </div>
        <div style={{ padding: 20, overflowX: 'auto' }}>
          <div className="board">
            <div className="board-row">
              <div className="board-cell head name">Vehicle</div>
              {boardDates.map((d) => (
                <div className="board-cell head" key={d}>{formatDateLong(d)}</div>
              ))}
            </div>
            {fleet.map((v) => (
              <div className="board-row" key={v.id}>
                <div className="board-cell name">{v.name}</div>
                {boardDates.map((d) => {
                  const { value, overridden } = statusFor(v.id, d);
                  const booked = !overridden ? covering(v.id, d) : null;
                  return (
                    <div className="board-cell" key={d}>
                      <button className={`cell-btn s-${value}`} onClick={() => cycle(v.id, d)} title={`${v.name} on ${d}: ${value}. Click to change.`}>
                        {value}
                        <small>{overridden ? 'edited' : booked ? booked.reference : 'fleet default'}</small>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="note-box">
        Cells start from each vehicle&apos;s fleet availability{cloud ? ', overlaid with live booking periods' : ''}. Clicking a cell records a date-specific override{cloud ? ' saved to the database' : ' stored locally in this browser'}.
      </div>
    </>
  );
}
