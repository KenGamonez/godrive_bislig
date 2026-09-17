import type { VehicleAvailability } from '../../types';
import { VEHICLES } from '../../data/business';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong } from '../../utils/booking';

const ORDER: VehicleAvailability[] = ['Available', 'Reserved', 'Unavailable'];

export function AvailabilityPage() {
  const { boardDates, overrides, setOverride, clearOverride, vehicleStatus } = useAppStore();

  const statusFor = (vehicleId: string, date: string): { value: VehicleAvailability; overridden: boolean } => {
    const o = overrides.find((x) => x.vehicleId === vehicleId && x.date === date);
    if (o) return { value: o.status, overridden: true };
    return { value: vehicleStatus[vehicleId] ?? 'Available', overridden: false };
  };

  const cycle = (vehicleId: string, date: string) => {
    const current = statusFor(vehicleId, date).value;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setOverride(vehicleId, date, next);
  };

  return (
    <>
      <span className="demo-tag">Demo availability board — click any cell to cycle status. Changes are local only.</span>
      <div className="panel">
        <div className="panel-head">
          <h3>7-day availability board</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { for (const o of [...overrides]) clearOverride(o.vehicleId, o.date); }}
          >
            Reset overrides
          </button>
        </div>
        <div style={{ padding: 20, overflowX: 'auto' }}>
          <div className="board">
            <div className="board-row">
              <div className="board-cell head name">Vehicle</div>
              {boardDates.map((d) => (
                <div className="board-cell head" key={d}>{formatDateLong(d)}</div>
              ))}
            </div>
            {VEHICLES.map((v) => (
              <div className="board-row" key={v.id}>
                <div className="board-cell name">{v.name}</div>
                {boardDates.map((d) => {
                  const { value, overridden } = statusFor(v.id, d);
                  return (
                    <div className="board-cell" key={d}>
                      <button className={`cell-btn s-${value}`} onClick={() => cycle(v.id, d)} title={`${v.name} on ${d}: ${value}. Click to change.`}>
                        {value}
                        <small>{overridden ? 'edited' : 'fleet default'}</small>
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
        Cells start from each vehicle&apos;s fleet availability. Clicking a cell records a date-specific override stored locally in this browser.
      </div>
    </>
  );
}
