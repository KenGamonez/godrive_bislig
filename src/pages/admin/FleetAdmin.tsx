import { useState } from 'react';
import type { MaintenanceStatus, Vehicle, VehicleAvailability } from '../../types';
import { VEHICLES } from '../../data/business';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

interface VehicleEdits {
  capacity: string;
  year: string;
  startingRatePerDay: string;
  blurb: string;
}

function editsFor(v: Vehicle): VehicleEdits {
  return {
    capacity: v.capacity ?? '',
    year: v.year ? String(v.year) : '',
    startingRatePerDay: String(v.startingRatePerDay),
    blurb: v.blurb,
  };
}

export function FleetAdminPage() {
  const { vehicleStatus, setVehicleStatus, maintenance, setMaintenance } = useAppStore();
  const [localEdits, setLocalEdits] = useState<Record<string, VehicleEdits>>(() => {
    try {
      return JSON.parse(localStorage.getItem('godrive.vehicle-edits.v1') ?? '{}') as Record<string, VehicleEdits>;
    } catch {
      return {};
    }
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Vehicle | null>(null);

  const merged = (v: Vehicle): Vehicle => {
    const e = localEdits[v.id];
    if (!e) return v;
    const yearNum = parseInt(e.year, 10);
    const rateNum = parseInt(e.startingRatePerDay, 10);
    return {
      ...v,
      capacity: e.capacity.trim() ? e.capacity.trim() : undefined,
      year: Number.isFinite(yearNum) && e.year.trim() ? yearNum : undefined,
      startingRatePerDay: Number.isFinite(rateNum) && rateNum > 0 ? rateNum : v.startingRatePerDay,
      blurb: e.blurb.trim() ? e.blurb.trim() : v.blurb,
    };
  };

  const saveEdits = (id: string, edits: VehicleEdits) => {
    const next = { ...localEdits, [id]: edits };
    setLocalEdits(next);
    try {
      localStorage.setItem('godrive.vehicle-edits.v1', JSON.stringify(next));
    } catch { /* best-effort */ }
    setEditing(null);
  };

  return (
    <>
      <span className="demo-tag">Demo fleet — availability, maintenance, and edits live in local state only.</span>
      <div className="panel">
        <div className="table-wrap">
          <table className="tbl" style={{ minWidth: 860 }}>
            <thead>
              <tr><th>Vehicle</th><th>Type</th><th>Trans.</th><th>Capacity</th><th>Year</th><th>Availability</th><th>Maintenance</th><th>Self-drive rate</th><th></th></tr>
            </thead>
            <tbody>
              {VEHICLES.map((raw) => {
                const v = merged(raw);
                return (
                  <tr key={v.id}>
                    <td><b>{v.name}</b></td>
                    <td>{v.bodyType}</td>
                    <td>{v.transmission}</td>
                    <td>{v.capacity ?? '—'}</td>
                    <td>{v.year ?? '—'}</td>
                    <td>
                      <select
                        value={vehicleStatus[v.id] ?? 'Available'}
                        onChange={(e) => setVehicleStatus(v.id, e.target.value as VehicleAvailability)}
                        aria-label={`${v.name} availability`}
                        style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '8px 10px' }}
                      >
                        <option>Available</option>
                        <option>Reserved</option>
                        <option>Unavailable</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={maintenance[v.id] ?? 'Good'}
                        onChange={(e) => setMaintenance(v.id, e.target.value as MaintenanceStatus)}
                        aria-label={`${v.name} maintenance`}
                        style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '8px 10px' }}
                      >
                        <option>Good</option>
                        <option>Scheduled</option>
                        <option>In Shop</option>
                      </select>
                    </td>
                    <td><b>{formatPeso(v.startingRatePerDay)}</b><span className="small"> /day</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewing(v)}>View</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(v.id)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{viewing.name}</h3>
              <button className="modal-x" onClick={() => setViewing(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatusBadge status={vehicleStatus[viewing.id] ?? 'Available'} />
                <StatusBadge status={maintenance[viewing.id] ?? 'Good'} />
              </div>
              <div className="mt-16">
                <div className="kv"><span>Type</span><b>{viewing.bodyType}</b></div>
                <div className="kv"><span>Transmission</span><b>{viewing.transmission}</b></div>
                <div className="kv"><span>Capacity</span><b>{viewing.capacity ?? 'Not specified'}</b></div>
                <div className="kv"><span>Year</span><b>{viewing.year ?? 'Not specified'}</b></div>
                <div className="kv"><span>Self-drive from</span><b>{formatPeso(viewing.startingRatePerDay)} / day</b></div>
              </div>
              <p className="small mt-16">{viewing.blurb}</p>
            </div>
          </div>
        </div>
      )}

      {editing && (() => {
        const raw = VEHICLES.find((v) => v.id === editing)!;
        const current = localEdits[editing] ?? editsFor(raw);
        const update = (patch: Partial<VehicleEdits>) =>
          setLocalEdits((prev) => ({ ...prev, [editing]: { ...current, ...patch } }));
        return (
          <div className="modal-backdrop" onClick={() => setEditing(null)} role="dialog" aria-modal="true">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>Edit — {raw.name}</h3>
                <button className="modal-x" onClick={() => setEditing(null)} aria-label="Close">×</button>
              </div>
              <div className="modal-body">
                <div className="note-box">Local demo edit. Changes persist in this browser only — no backend call.</div>
                <div className="form-grid two mt-24">
                  <div className="field">
                    <label htmlFor="f-cap">Capacity</label>
                    <input id="f-cap" value={current.capacity} onChange={(e) => update({ capacity: e.target.value })} placeholder="e.g. 4 + 1 driver" />
                  </div>
                  <div className="field">
                    <label htmlFor="f-year">Year</label>
                    <input id="f-year" value={current.year} onChange={(e) => update({ year: e.target.value })} placeholder="e.g. 2025" inputMode="numeric" />
                  </div>
                </div>
                <div className="form-grid mt-16">
                  <div className="field">
                    <label htmlFor="f-rate">Self-drive starting rate (₱/day)</label>
                    <input id="f-rate" value={current.startingRatePerDay} onChange={(e) => update({ startingRatePerDay: e.target.value })} inputMode="numeric" />
                  </div>
                  <div className="field">
                    <label htmlFor="f-blurb">Description</label>
                    <textarea id="f-blurb" value={current.blurb} onChange={(e) => update({ blurb: e.target.value })} />
                  </div>
                </div>
                <div className="action-row">
                  <button className="btn btn-primary" onClick={() => saveEdits(editing, { ...current })}>Save (local)</button>
                  <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
