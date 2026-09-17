import { Link } from 'react-router-dom';
import type { Vehicle } from '../../types';
import { VEHICLES } from '../../data/business';
import { vehicleMeta, vehicleSlug } from '../../data/fleet';
import { FinalCta, Reveal, SectionHead } from '../../components/site';
import { VehicleModal, useVehicleModal } from '../../components/fleet';
import { VehiclePhoto, useVehiclePhotos } from '../../components/showroom';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

export function FleetPage() {
  const modal = useVehicleModal();
  const { vehicleStatus } = useAppStore();
  return (
    <>
      <section className="page-hero slim">
        <div className="container page-hero-inner">
          <span className="eyebrow">Cars — 04 units</span>
          <h1 className="h-section">Choose your car.</h1>
          <p className="lede">One tap opens photography, specs and booking. Only specifications provided by GoDrive are listed.</p>
          <span className="ghost-num" aria-hidden="true">04</span>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="The lineup"
              title="Every unit. At a glance."
              lede="Availability shown is a local demo — GoDrive confirms every request."
            />
          </Reveal>
          <div className="cars-grid">
            {VEHICLES.map((v, i) => (
              <CarCard
                key={v.id}
                index={i}
                vehicleId={v.id}
                status={vehicleStatus[v.id] ?? 'Available'}
                onQuickView={() => modal.open(v)}
              />
            ))}
          </div>
          <Reveal delay={0.05}>
            <p className="disclaimer mt-32">
              <strong>Availability changes daily.</strong> If your preferred vehicle is reserved, submit a request anyway — GoDrive will advise on the nearest available unit or date.
            </p>
            <div className="mt-24" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/book" className="btn btn-primary">
                Book a Vehicle <span className="arr" aria-hidden="true">→</span>
              </Link>
              <Link to="/rates" className="btn btn-outline">View Rates</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCta
        eyebrow="Cars"
        title="Found your match?"
        copy="Tell GoDrive your dates and destination — availability is confirmed directly."
        secondaryLabel="View Rates"
        secondaryTo="/rates"
      />
      <VehicleModal vehicle={modal.selected} onClose={modal.close} />
    </>
  );
}

function CarCard({
  index,
  vehicleId,
  status,
  onQuickView,
}: {
  index: number;
  vehicleId: string;
  status: string;
  onQuickView: () => void;
}) {
  const v = VEHICLES.find((x) => x.id === vehicleId) as Vehicle;
  const { photos } = useVehiclePhotos(v.id);
  return (
    <Reveal delay={(index % 2) * 0.05}>
      <article className="car-card">
        <Link to={`/fleet/${vehicleSlug(v)}`} className="car-media" aria-label={`View ${v.name}`}>
          <VehiclePhoto vehicle={v} src={photos[0]} tone="dark" />
          <span className="car-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        </Link>
        <div className="car-body">
          <div className="car-top">
            <span className="car-tag">{vehicleMeta(v.id)?.tag ?? v.bodyType}</span>
            <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
          </div>
          <h3 className="car-name">{v.name}</h3>
          <p className="car-spec">{v.bodyType} · {v.transmission}{v.capacity ? ` · ${v.capacity}` : ''}</p>
          <div className="car-foot">
            <span className="car-rate">{formatPeso(v.startingRatePerDay)}<small>/day</small></span>
            <span className="car-ctas">
              <button className="btn btn-outline btn-sm" onClick={onQuickView}>Details</button>
              <Link to={`/fleet/${vehicleSlug(v)}`} className="btn btn-primary btn-sm">View Car →</Link>
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
