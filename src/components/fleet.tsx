import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';
import { StatusBadge, VehicleArt } from './site';
import { formatPeso } from '../utils/booking';
import { useAppStore } from '../store/AppStore';

/* Editorial lineup row — alternating media/info composition. */
export function LineupRow({
  vehicle,
  index,
  flip = false,
  onView,
}: {
  vehicle: Vehicle;
  index: string;
  flip?: boolean;
  onView: (v: Vehicle) => void;
}) {
  const { vehicleStatus } = useAppStore();
  const status = vehicleStatus[vehicle.id] ?? 'Available';
  return (
    <article className={`lineup-row${flip ? ' flip' : ''}`}>
      <div className="lineup-media">
        <span className="lineup-index" aria-hidden="true">{index}</span>
        <VehicleArt
          silhouette={vehicle.silhouette}
          tone={flip ? 'dark' : 'light'}
          title={vehicle.name}
        />
      </div>
      <div className="lineup-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <span className="eyebrow">{index} — Lineup</span>
          <StatusBadge status={status} />
        </div>
        <h3 className="lineup-name">
          <small>{vehicle.bodyType}</small>
          {vehicle.name}
        </h3>
        <div className="lineup-spec">
          <span>{vehicle.transmission}</span>
          {vehicle.capacity && <span>{vehicle.capacity}</span>}
          {vehicle.year && <span>{vehicle.year}</span>}
        </div>
        <div className="lineup-foot">
          <div className="lineup-rate">
            <b>{formatPeso(vehicle.startingRatePerDay)}</b>
            <span>/ day · self-drive from</span>
          </div>
          <div className="lineup-actions">
            <button className="btn btn-outline btn-sm" onClick={() => onView(vehicle)}>Details</button>
            <Link to={`/book?vehicle=${vehicle.id}`} className="btn btn-primary btn-sm">
              Book Vehicle <span className="arr" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function VehicleModal({ vehicle, onClose }: { vehicle: Vehicle | null; onClose: () => void }) {
  const { vehicleStatus } = useAppStore();

  useEffect(() => {
    if (!vehicle) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [vehicle, onClose]);

  if (!vehicle) return null;
  const status = vehicleStatus[vehicle.id] ?? 'Available';

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={vehicle.name}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{vehicle.name}</h3>
          <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-stage">
          <VehicleArt silhouette={vehicle.silhouette} tone="dark" title={vehicle.name} />
          <span className="ghost" aria-hidden="true">{vehicle.silhouette === 'mpv' ? 'MPV' : 'SDN'}</span>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={status} />
            <span className="badge badge-neutral">{vehicle.bodyType}</span>
            <span className="badge badge-neutral">{vehicle.transmission}</span>
          </div>
          <p className="mt-16" style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.7 }}>{vehicle.blurb}</p>
          <div className="mt-24">
            <div className="kv"><span>Vehicle type</span><b>{vehicle.bodyType}</b></div>
            <div className="kv"><span>Transmission</span><b>{vehicle.transmission}</b></div>
            <div className="kv"><span>Capacity</span><b>{vehicle.capacity ?? 'Contact GoDrive to confirm'}</b></div>
            <div className="kv"><span>Year</span><b>{vehicle.year ?? 'Contact GoDrive to confirm'}</b></div>
            <div className="kv"><span>Self-drive from</span><b>{formatPeso(vehicle.startingRatePerDay)} / day (Bislig City)</b></div>
          </div>
          <p className="small mt-16">Only specifications provided by GoDrive are listed. All other details are confirmed directly with GoDrive before rental.</p>
          <div className="action-row">
            <Link to={`/book?vehicle=${vehicle.id}`} className="btn btn-primary">
              Book This Vehicle <span className="arr" aria-hidden="true">→</span>
            </Link>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useVehicleModal() {
  const [selected, setSelected] = useState<Vehicle | null>(null);
  return { selected, open: setSelected, close: () => setSelected(null) };
}
