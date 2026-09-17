import { Link } from 'react-router-dom';
import type { Vehicle } from '../../types';
import { BUSINESS, VEHICLES } from '../../data/business';
import { vehicleMeta, vehicleSlug } from '../../data/fleet';
import {
  Accordion,
  FinalCta,
  Reveal,
  SectionHead,
} from '../../components/site';
import { RateExplorer } from '../../components/booking';
import { VehicleCarousel, VehiclePhoto, useVehiclePhotos } from '../../components/showroom';
import { VehicleModal, useVehicleModal } from '../../components/fleet';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

const PREVIEW_FAQS = [
  {
    q: 'What vehicles are available?',
    a: 'Mitsubishi Xpander AT (7-seater MPV), Toyota Avanza AT (7-seater MPV), Suzuki Dzire MT (sedan), and Suzuki Dzire AT 2025 (sedan, 4 + 1 driver). Availability is confirmed per request.',
  },
  {
    q: 'Self-drive or with-driver?',
    a: 'Self-drive: you take the wheel (license + proof of income required). With-driver: a GoDrive driver handles the trip.',
  },
  {
    q: 'How does booking work?',
    a: 'Pick a car, choose rental type, set dates and destination, submit your request. GoDrive confirms availability directly — 09260621287.',
  },
];

function FleetIndex() {
  const { vehicleStatus } = useAppStore();
  return (
    <div className="fleet-index">
      {VEHICLES.map((v, i) => (
        <FleetIndexRow key={v.id} index={i} vehicleId={v.id} status={vehicleStatus[v.id] ?? 'Available'} />
      ))}
    </div>
  );
}

function FleetIndexRow({ index, vehicleId, status }: { index: number; vehicleId: string; status: string }) {
  const v = VEHICLES.find((x) => x.id === vehicleId) as Vehicle;
  const { photos } = useVehiclePhotos(v.id);
  return (
    <Link to={`/fleet/${vehicleSlug(v)}`} className="fleet-index-row">
      <span className="fi-num">{String(index + 1).padStart(2, '0')}</span>
      <span className="fi-thumb">
        <VehiclePhoto vehicle={v} src={photos[0]} tone="light" />
      </span>
      <span className="fi-name">
        <b>{v.name}</b>
        <small>{v.bodyType} · {v.transmission}</small>
      </span>
      <span className="fi-rate">{formatPeso(v.startingRatePerDay)}<small>/day</small></span>
      <span className={`fi-dot s-${status}`} title={status} aria-label={status} />
      <span className="fi-go" aria-hidden="true">→</span>
    </Link>
  );
}

export function HomePage() {
  const modal = useVehicleModal();
  const { settings, bookings } = useAppStore();
  const latest = bookings[0];

  return (
    <>
      {/* ============ DASHBOARD HERO ============ */}
      <section className="dash">
        <div className="wrap dash-inner">
          <div className="dash-top rise">
            <span className="dash-brand">GoDrive</span>
            <span className="dash-loc">Car Rental · Bislig</span>
            <span className="dash-live"><i /> Fleet ready</span>
          </div>
          <h1 className="dash-title rise" style={{ ['--d' as never]: '0.06s' }}>
            Book a car.
          </h1>
          <p className="dash-sub rise" style={{ ['--d' as never]: '0.1s' }}>
            Four kept-ready vehicles · from {formatPeso(1500)} / day · {BUSINESS.pickup}
          </p>
          <div className="rise" style={{ ['--d' as never]: '0.14s' }}>
            <VehicleCarousel onInspect={modal.open} />
          </div>
          <div className="dash-strip rise" style={{ ['--d' as never]: '0.18s' }}>
            <div><b>Self-drive</b><span>You take the wheel</span></div>
            <div><b>With-driver</b><span>We handle the drive</span></div>
            <div><b>{BUSINESS.phone}</b><span>Direct confirmation</span></div>
          </div>
        </div>
      </section>

      {/* ============ RENTAL TYPE ============ */}
      <section className="section section-tight">
        <div className="container dash-duo">
          <Reveal>
            <Link to="/book?type=self" className="dash-choice">
              <span className="dash-choice-n">01</span>
              <b>Self-drive</b>
              <small>You take the wheel.</small>
              <span className="dash-choice-go">Start →</span>
            </Link>
          </Reveal>
          <Reveal delay={0.06}>
            <Link to="/book?type=with" className="dash-choice dark">
              <span className="dash-choice-n">02</span>
              <b>With-driver</b>
              <small>We handle the drive.</small>
              <span className="dash-choice-go">Start →</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ FLEET INDEX ============ */}
      <section className="section section-tight">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="The fleet"
              index="01 / Cars"
              title="Four vehicles. One choice."
              lede="Tap any unit for photography, specs and booking."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <FleetIndex />
          </Reveal>
        </div>
      </section>

      {/* ============ RATES EXPLORER ============ */}
      <section className="section section-soft section-tight">
        <div className="container dash-rates">
          <Reveal>
            <SectionHead
              eyebrow="Rates"
              index="02 / Price"
              title="Priced by destination."
              lede="Two tabs. Every published rate. Nothing else to read."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <RateExplorer compact />
            <Link to="/rates" className="btn btn-outline mt-24">Full rate details →</Link>
          </Reveal>
        </div>
      </section>

      {/* ============ MY BOOKING TEASER ============ */}
      <section className="section section-tight">
        <div className="container">
          <Reveal>
            <div className="dash-booking-teaser">
              <div>
                <span className="eyebrow">My booking</span>
                <h2 className="h-sub mt-16">Have a reference?</h2>
                <p className="small mt-16">
                  {latest
                    ? `Latest on this device: ${latest.reference} · ${latest.status}. Look up any reference or mobile number.`
                    : 'Look up your request by reference or mobile number — no account needed.'}
                </p>
              </div>
              <Link to="/bookings" className="btn btn-primary">Find my booking <span className="arr" aria-hidden="true">→</span></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ REQUIREMENTS (compact) ============ */}
      <section className="section band-navy section-tight">
        <div className="container" style={{ maxWidth: 900 }}>
          <Reveal>
            <SectionHead
              eyebrow="Self-drive requirements"
              index="03 / Standard"
              title="Two documents."
              lede="They establish your ability to answer for rental liabilities in case of an untoward incident."
              dark
            />
          </Reveal>
          <Reveal delay={0.05}>
            <Accordion
              items={[
                { q: 'Valid driver\u2019s license', a: 'Confirms you are legally permitted to operate the vehicle and ties the rental to an accountable driver.' },
                { q: 'Proof of income', a: 'Demonstrates capacity to answer for rental liabilities — protecting both you and the vehicle entrusted to you.' },
              ]}
              defaultOpen={null}
            />
            <p className="disclaimer mt-24" style={{ borderColor: 'rgba(255,255,255,0.16)', color: '#8fa3c8' }}>
              With-driver rentals do not require these documents — your GoDrive driver carries responsibility for the vehicle.
              With-driver bands: {settings.withDriverRates.map((r) => `${r.label} — ${formatPeso(r.amount)}`).join(' · ')}.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ PREVIEW ============ */}
      <section className="section section-tight">
        <div className="container" style={{ maxWidth: 900 }}>
          <Reveal>
            <SectionHead eyebrow="Questions" index="04 / FAQ" title="Good to know." />
          </Reveal>
          <Reveal delay={0.05}>
            <Accordion items={PREVIEW_FAQS} defaultOpen={0} />
            <div className="mt-24" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/faq" className="btn btn-outline btn-sm">All FAQs</Link>
              <Link to={`/fleet/${vehicleSlug(VEHICLES[0])}`} className="btn btn-ghost btn-sm">
                Inspect the {vehicleMeta(VEHICLES[0].id)?.tag ?? 'flagship'} →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCta
        eyebrow="Reservations"
        title="Your vehicle is waiting."
        copy="Submit a booking request in minutes. GoDrive reviews availability and confirms directly."
      />
      <VehicleModal vehicle={modal.selected} onClose={modal.close} />
    </>
  );
}
