import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { VEHICLES } from '../../data/business';
import { vehicleBySlug, vehicleMeta, vehicleSlug } from '../../data/fleet';
import { Accordion, FinalCta, Reveal } from '../../components/site';
import { RentalTypeExplainer } from '../../components/booking';
import { VehicleGallery, VehiclePhoto, useVehiclePhotos } from '../../components/showroom';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';
import type { RentalType } from '../../types';

export function VehicleDetailPage() {
  const { slug = '' } = useParams();
  const vehicle = vehicleBySlug(slug);
  const { vehicleStatus, settings } = useAppStore();
  const [rental, setRental] = useState<RentalType>('self-drive');

  if (!vehicle) return <Navigate to="/fleet" replace />;

  const meta = vehicleMeta(vehicle.id);
  const status = vehicleStatus[vehicle.id] ?? 'Available';
  const bookTo =
    rental === 'self-drive' ? `/book?vehicle=${vehicle.id}&type=self` : `/book?vehicle=${vehicle.id}&type=with`;

  return (
    <>
      <section className="vpage">
        <div className="container vpage-crumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span>
          <Link to="/fleet">Cars</Link> <span aria-hidden="true">/</span>
          <b>{vehicle.name}</b>
        </div>
        <div className="container vpage-grid">
          <Reveal>
            <VehicleGallery vehicle={vehicle} />
          </Reveal>
          <div className="vpage-info">
            <div className="vpage-eyebrow">
              <span>{meta?.tag ?? vehicle.bodyType}</span>
              <span className={`badge badge-${status.toLowerCase()}`}>● {status}</span>
            </div>
            <h1 className="vpage-name">{vehicle.name}</h1>
            <p className="vpage-spec">
              {vehicle.bodyType} · {vehicle.transmission}
              {vehicle.capacity ? ` · ${vehicle.capacity}` : ''}
              {vehicle.year ? ` · ${vehicle.year}` : ''}
            </p>
            {meta && <p className="vpage-headline">{meta.headline}</p>}
            <p className="vpage-rate">
              <b>{formatPeso(vehicle.startingRatePerDay)}</b> / day
              <span>self-drive from · Bislig City</span>
            </p>
            <RentalTypeExplainer value={rental} onChange={setRental} />
            <div className="vpage-actions">
              <Link to={bookTo} className="btn btn-primary btn-block">
                Book this car <span className="arr" aria-hidden="true">→</span>
              </Link>
              <a className="btn btn-outline btn-block" href="tel:+639260621287">Call GoDrive</a>
            </div>
            <div className="vpage-facts">
              <div><span>Category</span><b>{vehicle.bodyType}</b></div>
              <div><span>Transmission</span><b>{vehicle.transmission}</b></div>
              <div><span>Capacity</span><b>{vehicle.capacity ?? 'Confirm with GoDrive'}</b></div>
              <div><span>Availability</span><b>{status}</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container" style={{ maxWidth: 900 }}>
          <Reveal>
            <Accordion
              defaultOpen={0}
              items={[
                {
                  q: 'Rental areas & rates',
                  a: `Self-drive: ${settings.selfDriveRates.map((r) => `${r.shortLabel} ${formatPeso(r.amountPerDay)}/day`).join(' · ')}. With-driver: ${settings.withDriverRates.map((r) => `${r.label} ${formatPeso(r.amount)}`).join(' · ')}. ${settings.withDriverRateUnitNote}`,
                },
                {
                  q: 'Requirements',
                  a: 'Self-drive: valid driver\u2019s license + proof of income. With-driver: no documents required of you.',
                },
                {
                  q: 'Vehicle details',
                  a: `${vehicle.name} — ${vehicle.bodyType}, ${vehicle.transmission}${vehicle.capacity ? `, ${vehicle.capacity}` : ''}${vehicle.year ? `, ${vehicle.year}` : ''}. ${vehicle.blurb} Only specifications provided by GoDrive are listed.`,
                },
              ]}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="vpage-next">
              <span>Next in fleet</span>
              <NextVehicle currentId={vehicle.id} />
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCta
        eyebrow={vehicle.name}
        title="Book this car."
        copy="Choose your rental type and dates — GoDrive confirms availability directly."
        primaryTo={bookTo}
      />
    </>
  );
}

function NextVehicle({ currentId }: { currentId: string }) {
  const i = VEHICLES.findIndex((v) => v.id === currentId);
  const next = VEHICLES[(i + 1) % VEHICLES.length];
  const { photos } = useVehiclePhotos(next.id);
  return (
    <Link to={`/fleet/${vehicleSlug(next)}`} className="vpage-next-card">
      <span className="fi-thumb sm">
        <VehiclePhoto vehicle={next} src={photos[0]} tone="light" />
      </span>
      <span>
        <b>{next.name}</b>
        <small>{next.bodyType} · {next.transmission} · {formatPeso(next.startingRatePerDay)}/day →</small>
      </span>
    </Link>
  );
}
