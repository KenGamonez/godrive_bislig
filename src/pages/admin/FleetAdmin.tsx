import { useState } from 'react';
import type { MaintenanceStatus, NewVehicleInput, Vehicle, VehicleAvailability } from '../../types';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

const ZONES = ['bislig-city', '2nd-district', '1st-district-caraga', 'outside-caraga'] as const;
const ZONE_LABELS: Record<string, string> = {
  'bislig-city': 'Within Bislig City',
  '2nd-district': 'Within 2nd District, SDS',
  '1st-district-caraga': 'Within 1st District, SDS / Caraga',
  'outside-caraga': 'Outside Caraga',
};

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

const EMPTY_NEW: NewVehicleInput = {
  name: '',
  bodyType: 'Sedan',
  transmission: 'Automatic',
  seats: '4 + 1 driver',
  capacity: '',
  year: undefined,
  silhouette: 'sedan',
  blurb: '',
  photoUrl: '',
  status: 'Available',
  rates: ZONES.map((zone) => ({
    zone,
    label: ZONE_LABELS[zone],
    shortLabel: ZONE_LABELS[zone],
    amountPerDay: 0,
  })),
};

export function FleetAdminPage() {
  const {
    fleet,
    vehicleStatus,
    setVehicleStatus,
    maintenance,
    setMaintenance,
    updateVehicle,
    addVehicle,
    deleteVehicle,
    cloud,
    syncError,
  } = useAppStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [draftEdits, setDraftEdits] = useState<VehicleEdits | null>(null);
  const [viewing, setViewing] = useState<Vehicle | null>(null);
  const [adding, setAdding] = useState(false);
  const [draftNew, setDraftNew] = useState<NewVehicleInput>(EMPTY_NEW);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openEdit = (v: Vehicle) => {
    setEditing(v.id);
    setDraftEdits(editsFor(v));
    setError(null);
  };

  const saveEdits = async () => {
    if (!editing || !draftEdits) return;
    setBusy(true);
    setError(null);
    const yearNum = parseInt(draftEdits.year, 10);
    const rateNum = parseInt(draftEdits.startingRatePerDay, 10);
    const err = await updateVehicle(editing, {
      capacity: draftEdits.capacity.trim() ? draftEdits.capacity.trim() : undefined,
      year: Number.isFinite(yearNum) && draftEdits.year.trim() ? yearNum : undefined,
      startingRatePerDay: Number.isFinite(rateNum) && rateNum > 0 ? rateNum : undefined,
      blurb: draftEdits.blurb.trim(),
    });
    setBusy(false);
    if (err) {
      setError(`Could not save vehicle (${err}).`);
      return;
    }
    setEditing(null);
    setDraftEdits(null);
  };

  const saveNew = async () => {
    setBusy(true);
    setError(null);
    if (draftNew.name.trim().length < 3) {
      setError('Enter the vehicle name (e.g. Toyota Wigo AT).');
      setBusy(false);
      return;
    }
    if (draftNew.rates.some((r) => !(r.amountPerDay > 0))) {
      setError('Enter a rate above ₱0 for every destination zone.');
      setBusy(false);
      return;
    }
    const err = await addVehicle({
      ...draftNew,
      name: draftNew.name.trim(),
      bodyType: draftNew.bodyType.trim() || 'Sedan',
      seats: draftNew.seats.trim() || '4 + 1 driver',
      capacity: draftNew.capacity?.trim() || undefined,
      blurb: draftNew.blurb.trim(),
      photoUrl: draftNew.photoUrl?.trim() || undefined,
    });
    setBusy(false);
    if (err) {
      setError(`Could not add vehicle (${err}). Try a different name if the ID is taken.`);
      return;
    }
    setAdding(false);
    setDraftNew(EMPTY_NEW);
  };

  const removeVehicle = async (v: Vehicle) => {
    if (!window.confirm(`Remove ${v.name} from the fleet? Bookings history is preserved by blocking this when needed.`)) return;
    setBusy(true);
    setError(null);
    const err = await deleteVehicle(v.id);
    setBusy(false);
    if (err) setError(err);
  };

  const editingVehicle = editing ? fleet.find((v) => v.id === editing) ?? null : null;

  return (
    <>
      <span className="demo-tag">
        {cloud ? `${fleet.length} unit${fleet.length === 1 ? '' : 's'} in the live fleet.` : 'Demo fleet — availability, maintenance, and edits live in local state only.'}
      </span>
      {syncError && <p className="field-error" role="alert">Sync issue: {syncError}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="toolbar">
        <span className="small">Availability and maintenance save automatically.</span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { setAdding(true); setError(null); }}>
          Add Vehicle +
        </button>
      </div>
      <div className="admin-cards" role="list" aria-label="Vehicles">
        {fleet.map((v) => (
          <article key={v.id} className="acard" role="listitem">
            <div className="acard-top">
              <b>{v.name}</b>
              <StatusBadge status={vehicleStatus[v.id] ?? 'Available'} />
            </div>
            <div className="acard-sub">{v.bodyType} · {v.transmission} · <b style={{ color: 'var(--ink)' }}>{formatPeso(v.startingRatePerDay)}/day</b></div>
            <div className="field">
              <label htmlFor={`m-av-${v.id}`}>Availability</label>
              <select
                id={`m-av-${v.id}`}
                value={vehicleStatus[v.id] ?? 'Available'}
                onChange={(e) => setVehicleStatus(v.id, e.target.value as VehicleAvailability)}
              >
                <option>Available</option>
                <option>Reserved</option>
                <option>Unavailable</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor={`m-mn-${v.id}`}>Maintenance</label>
              <select
                id={`m-mn-${v.id}`}
                value={maintenance[v.id] ?? 'Good'}
                onChange={(e) => setMaintenance(v.id, e.target.value as MaintenanceStatus)}
              >
                <option>Good</option>
                <option>Scheduled</option>
                <option>In Shop</option>
              </select>
            </div>
            <div className="acard-foot" style={{ borderTop: 0, paddingTop: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewing(v)}>View</button>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => void removeVehicle(v)}>Remove</button>
            </div>
          </article>
        ))}
      </div>
      <div className="panel admin-table">
        <div className="table-wrap">
          <table className="tbl" style={{ minWidth: 860 }}>
            <thead>
              <tr><th>Vehicle</th><th>Type</th><th>Trans.</th><th>Capacity</th><th>Year</th><th>Availability</th><th>Maintenance</th><th>Self-drive rate</th><th></th></tr>
            </thead>
            <tbody>
              {fleet.map((v) => (
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
                      <option>Inactive</option>
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
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => void removeVehicle(v)}>Remove</button>
                  </td>
                </tr>
              ))}
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

      {editingVehicle && draftEdits && (
        <div className="modal-backdrop" onClick={() => setEditing(null)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit — {editingVehicle.name}</h3>
              <button className="modal-x" onClick={() => setEditing(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid two mt-24">
                <div className="field">
                  <label htmlFor="f-cap">Capacity</label>
                  <input id="f-cap" value={draftEdits.capacity} onChange={(e) => setDraftEdits({ ...draftEdits, capacity: e.target.value })} placeholder="e.g. 4 + 1 driver" />
                </div>
                <div className="field">
                  <label htmlFor="f-year">Year</label>
                  <input id="f-year" value={draftEdits.year} onChange={(e) => setDraftEdits({ ...draftEdits, year: e.target.value })} placeholder="e.g. 2025" inputMode="numeric" />
                </div>
              </div>
              <div className="form-grid mt-16">
                <div className="field">
                  <label htmlFor="f-rate">Self-drive starting rate (₱/day)</label>
                  <input id="f-rate" value={draftEdits.startingRatePerDay} onChange={(e) => setDraftEdits({ ...draftEdits, startingRatePerDay: e.target.value })} inputMode="numeric" />
                </div>
                <div className="field">
                  <label htmlFor="f-blurb">Description</label>
                  <textarea id="f-blurb" value={draftEdits.blurb} onChange={(e) => setDraftEdits({ ...draftEdits, blurb: e.target.value })} />
                </div>
              </div>
              <div className="action-row">
                <button className="btn btn-primary" onClick={() => void saveEdits()} disabled={busy}>
                  {busy ? 'Saving…' : 'Save Vehicle'}
                </button>
                <button className="btn btn-outline-danger" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adding && (
        <div className="modal-backdrop" onClick={() => setAdding(false)} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Add vehicle</h3>
              <button className="modal-x" onClick={() => setAdding(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid two">
                <div className="field">
                  <label htmlFor="n-name">Vehicle name</label>
                  <input id="n-name" value={draftNew.name} onChange={(e) => setDraftNew({ ...draftNew, name: e.target.value })} placeholder="e.g. Toyota Wigo AT" />
                </div>
                <div className="field">
                  <label htmlFor="n-body">Body type</label>
                  <input id="n-body" value={draftNew.bodyType} onChange={(e) => setDraftNew({ ...draftNew, bodyType: e.target.value })} placeholder="e.g. Sedan" />
                </div>
              </div>
              <div className="form-grid two mt-16">
                <div className="field">
                  <label htmlFor="n-trans">Transmission</label>
                  <select id="n-trans" value={draftNew.transmission} onChange={(e) => setDraftNew({ ...draftNew, transmission: e.target.value as 'Automatic' | 'Manual' })}>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="n-seats">Seats</label>
                  <input id="n-seats" value={draftNew.seats} onChange={(e) => setDraftNew({ ...draftNew, seats: e.target.value })} placeholder="e.g. 4 + 1 driver" />
                </div>
              </div>
              <div className="form-grid two mt-16">
                <div className="field">
                  <label htmlFor="n-cap">Capacity (optional)</label>
                  <input id="n-cap" value={draftNew.capacity ?? ''} onChange={(e) => setDraftNew({ ...draftNew, capacity: e.target.value })} placeholder="e.g. 4 passengers + 1 driver" />
                </div>
                <div className="field">
                  <label htmlFor="n-year">Year (optional)</label>
                  <input
                    id="n-year" inputMode="numeric" value={draftNew.year ?? ''}
                    onChange={(e) => {
                      const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                      setDraftNew({ ...draftNew, year: Number.isFinite(n) ? n : undefined });
                    }}
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>
              <div className="field mt-16">
                <label htmlFor="n-blurb">Description</label>
                <textarea id="n-blurb" value={draftNew.blurb} onChange={(e) => setDraftNew({ ...draftNew, blurb: e.target.value })} placeholder="Short, factual description shown on the Cars page." />
              </div>
              <div className="field mt-16">
                <label htmlFor="n-photo">Photo URL (optional)</label>
                <input id="n-photo" value={draftNew.photoUrl ?? ''} onChange={(e) => setDraftNew({ ...draftNew, photoUrl: e.target.value })} placeholder="https://…" inputMode="url" />
              </div>
              <h4 className="mt-24" style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Self-drive rates (₱ / day)</h4>
              <div className="form-grid two mt-16">
                {draftNew.rates.map((r, i) => (
                  <div className="field" key={r.zone}>
                    <label htmlFor={`n-rate-${r.zone}`}>{r.label}</label>
                    <input
                      id={`n-rate-${r.zone}`} inputMode="numeric"
                      value={r.amountPerDay === 0 ? '' : r.amountPerDay}
                      onChange={(e) => {
                        const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        const next = draftNew.rates.map((x, j) =>
                          j === i ? { ...x, amountPerDay: Number.isFinite(n) ? n : 0 } : x,
                        );
                        setDraftNew({ ...draftNew, rates: next });
                      }}
                      placeholder="₱ / day"
                    />
                  </div>
                ))}
              </div>
              <div className="action-row">
                <button className="btn btn-primary" onClick={() => void saveNew()} disabled={busy}>
                  {busy ? 'Adding…' : 'Add Vehicle'}
                </button>
                <button className="btn btn-outline-danger" onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
