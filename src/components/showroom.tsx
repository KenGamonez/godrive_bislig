import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RentalType, Vehicle } from '../types';
import { VEHICLES } from '../data/business';
import { fetchVehiclePhotos, vehicleMeta, vehicleSlug } from '../data/fleet';
import { StatusBadge, VehicleArt } from './site';
import { formatPeso } from '../utils/booking';
import { useAppStore } from '../store/AppStore';

/* ============================================================
   VehiclePhoto — real photography when present, refined
   placeholder otherwise. Never mixes photos between vehicles.
   ============================================================ */

export function useVehiclePhotos(vehicleId: string): { photos: string[]; checked: boolean } {
  const [photos, setPhotos] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    let live = true;
    setPhotos([]);
    setChecked(false);
    const dir = vehicleMeta(vehicleId)?.photoDir;
    if (!dir) {
      setChecked(true);
      return;
    }
    fetchVehiclePhotos(dir).then((found) => {
      if (!live) return;
      setPhotos(found);
      setChecked(true);
    });
    return () => {
      live = false;
    };
  }, [vehicleId]);
  return { photos, checked };
}

export function VehiclePhoto({
  vehicle,
  src,
  tone = 'dark',
  className = '',
}: {
  vehicle: Vehicle;
  src?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={vehicle.name}
        className={`photo-img ${className}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={`photo-placeholder tone-${tone} ${className}`} role="img" aria-label={vehicle.name}>
      <VehicleArt silhouette={vehicle.silhouette} tone={tone} title={vehicle.name} />
      <span className="photo-placeholder-tag">{vehicle.bodyType} · {vehicle.transmission}</span>
    </div>
  );
}

/* ============================================================
   VehicleGallery — dominant photograph + controlled secondary
   images. Desktop thumbs, mobile swipe + counter.
   ============================================================ */

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const { photos } = useVehiclePhotos(vehicle.id);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = photos.length > 0 ? photos.length : 1;

  useEffect(() => setIndex(0), [vehicle.id, photos.length]);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const current = photos.length > 0 ? photos[index] : undefined;

  return (
    <div className="gallery">
      <div
        className="gallery-stage"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx < -40) go(1);
          else if (dx > 40) go(-1);
          touchX.current = null;
        }}
      >
        <div key={`${vehicle.id}-${index}`} className="gallery-frame">
          <VehiclePhoto vehicle={vehicle} src={current} tone="dark" />
        </div>
        <span className="gallery-ghost" aria-hidden="true">
          {vehicle.silhouette === 'mpv' ? 'MPV' : 'SDN'}
        </span>
        {count > 1 && (
          <>
            <button className="gallery-arrow prev" onClick={() => go(-1)} aria-label="Previous photo">←</button>
            <button className="gallery-arrow next" onClick={() => go(1)} aria-label="Next photo">→</button>
            <span className="gallery-count">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
          </>
        )}
        {count === 1 && <span className="gallery-count">01 / 01</span>}
      </div>
      {count > 1 && (
        <div className="gallery-thumbs" role="tablist" aria-label="Vehicle photos">
          {photos.map((p, i) => (
            <button
              key={p}
              role="tab"
              aria-selected={i === index}
              className={`gallery-thumb${i === index ? ' on' : ''}`}
              onClick={() => setIndex(i)}
            >
              <img src={p} alt="" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   VehicleSummary — compact identity block reused on cards,
   carousel and booking review.
   ============================================================ */

export function VehicleSummary({ vehicle, compact = false }: { vehicle: Vehicle; compact?: boolean }) {
  const { vehicleStatus } = useAppStore();
  const status = vehicleStatus[vehicle.id] ?? 'Available';
  return (
    <div className={`vsummary${compact ? ' compact' : ''}`}>
      <div className="vsummary-top">
        <span className="vsummary-tag">{vehicleMeta(vehicle.id)?.tag ?? vehicle.bodyType}</span>
        <StatusBadge status={status} />
      </div>
      <h3 className="vsummary-name">{vehicle.name}</h3>
      <p className="vsummary-spec">
        {vehicle.bodyType} · {vehicle.transmission}
        {vehicle.capacity ? ` · ${vehicle.capacity}` : ''}
        {vehicle.year ? ` · ${vehicle.year}` : ''}
      </p>
      <p className="vsummary-price">
        <b>{formatPeso(vehicle.startingRatePerDay)}</b> / day <span>self-drive from</span>
      </p>
    </div>
  );
}

/* ============================================================
   RentalTypeSelector — compact premium SELF-DRIVE | WITH-DRIVER
   ============================================================ */

export function RentalTypeSelector({
  value,
  onChange,
  idPrefix = 'rt',
}: {
  value: RentalType;
  onChange: (v: RentalType) => void;
  idPrefix?: string;
}) {
  return (
    <div className="rental-selector" role="group" aria-label="Rental type">
      <button
        id={`${idPrefix}-self`}
        className={`rental-opt${value === 'self-drive' ? ' on' : ''}`}
        onClick={() => onChange('self-drive')}
        aria-pressed={value === 'self-drive'}
      >
        <b>Self-drive</b>
        <span>You take the wheel.</span>
      </button>
      <button
        id={`${idPrefix}-with`}
        className={`rental-opt${value === 'with-driver' ? ' on' : ''}`}
        onClick={() => onChange('with-driver')}
        aria-pressed={value === 'with-driver'}
      >
        <b>With-driver</b>
        <span>We handle the drive.</span>
      </button>
    </div>
  );
}

/* ============================================================
   VehicleCarousel — ONE primary vehicle at a time.
   Desktop cinematic stage · mobile swipe · position indicator.
   ============================================================ */

export function VehicleCarousel({
  onInspect,
}: {
  onInspect?: (v: Vehicle) => void;
}) {
  const { vehicleStatus } = useAppStore();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<'left' | 'right' | null>(null);
  const touchX = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const total = VEHICLES.length;
  const vehicle = VEHICLES[index];
  const { photos } = useVehiclePhotos(vehicle.id);
  const heroPhoto = photos[0];
  const status = vehicleStatus[vehicle.id] ?? 'Available';

  const go = useCallback(
    (dir: 1 | -1) => {
      setLeaving(dir === 1 ? 'left' : 'right');
      window.setTimeout(() => {
        setIndex((i) => (i + dir + total) % total);
        setLeaving(null);
      }, 140);
    },
    [total],
  );

  const jump = useCallback(
    (i: number) => {
      if (i === index) return;
      setLeaving(i > index ? 'left' : 'right');
      window.setTimeout(() => {
        setIndex(i);
        setLeaving(null);
      }, 140);
    },
    [index],
  );

  // Gentle auto-rotation, paused on hover/focus; disabled for reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer.current = window.setTimeout(() => go(1), 7000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [index, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const slug = vehicleSlug(vehicle);

  return (
    <div
      className="showroom"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -48) go(1);
        else if (dx > 48) go(-1);
        touchX.current = null;
      }}
    >
      <div className={`showroom-stage${leaving ? ` exit-${leaving}` : ''}`} key={vehicle.id}>
        <div className="showroom-media">
          <span className="showroom-index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <VehiclePhoto vehicle={vehicle} src={heroPhoto} tone="dark" className="showroom-photo" />
          <span className="showroom-ghost" aria-hidden="true">
            {(vehicleMeta(vehicle.id)?.tag ?? vehicle.bodyType).split(' ')[0].toUpperCase()}
          </span>
        </div>
        <div className="showroom-body">
          <div className="showroom-eyebrow">
            <span>{vehicleMeta(vehicle.id)?.tag ?? vehicle.bodyType}</span>
            <StatusBadge status={status} />
          </div>
          <h3 className="showroom-name">{vehicle.name}</h3>
          <p className="showroom-meta">
            {vehicle.bodyType} · {vehicle.transmission}
            {vehicle.capacity ? ` · ${vehicle.capacity}` : ''}
          </p>
          <p className="showroom-rate">
            <b>{formatPeso(vehicle.startingRatePerDay)}</b> / day
            <span>self-drive from · Bislig City</span>
          </p>
          <div className="showroom-actions">
            <Link to={`/book?vehicle=${vehicle.id}`} className="btn btn-accent">
              Book Now <span className="arr" aria-hidden="true">→</span>
            </Link>
            {onInspect ? (
              <button className="btn btn-outline-light" onClick={() => onInspect(vehicle)}>
                View Car
              </button>
            ) : (
              <Link to={`/fleet/${slug}`} className="btn btn-outline-light">
                View Car
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="showroom-bar">
        <div className="showroom-ctrls">
          <button onClick={() => go(-1)} aria-label="Previous vehicle">←</button>
          <button onClick={() => go(1)} aria-label="Next vehicle">→</button>
        </div>
        <div className="showroom-dots" role="tablist" aria-label="Vehicles">
          {VEHICLES.map((v, i) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={i === index}
              aria-label={v.name}
              className={`showroom-dot${i === index ? ' on' : ''}`}
              onClick={() => jump(i)}
            />
          ))}
        </div>
        <span className="showroom-pos">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
