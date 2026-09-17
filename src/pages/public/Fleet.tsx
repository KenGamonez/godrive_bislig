import { Link } from 'react-router-dom';
import { VEHICLES } from '../../data/business';
import { FinalCta, Reveal, SectionHead } from '../../components/site';
import { LineupRow, VehicleModal, useVehicleModal } from '../../components/fleet';

export function FleetPage() {
  const modal = useVehicleModal();
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Fleet — 04 units</span>
          <h1 className="h-section">Vehicles kept<br />to a standard.</h1>
          <p className="lede">Clean, well-maintained units for self-drive and with-driver rental. Only specifications provided by GoDrive are listed.</p>
          <span className="ghost-num" aria-hidden="true">04</span>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="The lineup"
              title="Choose your unit."
              lede="Open any vehicle for full details, or proceed directly to booking."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="lineup">
              {VEHICLES.map((v, i) => (
                <LineupRow
                  key={v.id}
                  vehicle={v}
                  index={String(i + 1).padStart(2, '0')}
                  flip={i % 2 === 1}
                  onView={modal.open}
                />
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
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
        eyebrow="Fleet"
        title="Found your match?"
        copy="Tell GoDrive your dates and destination — availability is confirmed directly."
        secondaryLabel="View Rates"
        secondaryTo="/rates"
      />
      <VehicleModal vehicle={modal.selected} onClose={modal.close} />
    </>
  );
}
