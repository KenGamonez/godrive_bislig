import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FinalCta, Reveal } from '../../components/site';
import { VehicleModal, useVehicleModal } from '../../components/fleet';
import { VehiclePhoto, useVehiclePhotos } from '../../components/showroom';
import { vehicleMeta, vehicleSlug } from '../../data/fleet';
import { useAppStore } from '../../store/AppStore';
import { formatPeso, todayISO } from '../../utils/booking';

/**
 * Homepage — commercial car-rental storefront.
 * All content is real: fleet catalog, published rates, booking flow,
 * business facts. No invented claims, prices, or testimonials.
 */

const PROCESS_STEPS = [
  ['01', 'Choose your car', 'Xpander and Avanza MPVs for groups, Dzire sedans for efficient travel.'],
  ['02', 'Pick your rental type', 'Self-drive with a valid license, or with-driver with a GoDrive professional.'],
  ['03', 'Submit your request', 'Pick dates, destination, and contact details in a guided flow.'],
  ['04', 'Get confirmed', 'GoDrive reviews availability and confirms directly by phone.'],
  ['05', 'Pick up and drive', 'Pickup at Boardwalk Gym, Bislig. Arrive ready and drive out.'],
] as const;

function HeroBookingPanel() {
  const { activeFleet } = useAppStore();
  const [vehicleId, setVehicleId] = useState('');
  const [pickup, setPickup] = useState('');
  const [ret, setRet] = useState('');
  const today = todayISO();

  const params = new URLSearchParams();
  if (vehicleId) params.set('vehicle', vehicleId);
  if (pickup) params.set('pickup', pickup);
  if (ret) params.set('return', ret);
  const qs = params.toString();
  const to = qs ? `/book?${qs}` : '/book';

  return (
    <form className="co-book" onSubmit={(e) => e.preventDefault()} aria-label="Start a booking">
      <div className="field">
        <label htmlFor="co-vehicle">Vehicle</label>
        <select id="co-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Any vehicle</option>
          {activeFleet.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="co-pickup">Pickup date</label>
        <input id="co-pickup" type="date" min={today} value={pickup} onChange={(e) => setPickup(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="co-return">Return date</label>
        <input id="co-return" type="date" min={pickup || today} value={ret} onChange={(e) => setRet(e.target.value)} />
      </div>
      <Link to={to} className="btn btn-primary co-book-go">
        Check Availability <span className="arr" aria-hidden="true">→</span>
      </Link>
    </form>
  );
}

function FeaturePhoto({ vehicleId, photoIndex }: { vehicleId: string; photoIndex: number }) {
  const { activeFleet } = useAppStore();
  const v = activeFleet.find((x) => x.id === vehicleId);
  const { photos } = useVehiclePhotos(vehicleId);
  if (!v) return null;
  return (
    <VehiclePhoto
      vehicle={v}
      src={photos[photoIndex]?.src}
      tone="light"
      className="co-feature-photo"
    />
  );
}

function ShowcaseCard({ vehicleId, index }: { vehicleId: string; index: number }) {
  const { activeFleet, vehicleStatus } = useAppStore();
  const v = activeFleet.find((x) => x.id === vehicleId);
  const { photos } = useVehiclePhotos(vehicleId);
  if (!v) return null;
  const status = vehicleStatus[v.id] ?? 'Available';
  return (
    <Reveal delay={(index % 4) * 0.05}>
      <article className="car-card">
        <Link to={`/fleet/${vehicleSlug(v)}`} className="car-media" aria-label={`View ${v.name}`}>
          <VehiclePhoto vehicle={v} src={photos[0]?.src} tone="dark" />
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
              <Link to={`/fleet/${vehicleSlug(v)}`} className="btn btn-outline btn-sm">View</Link>
              <Link to={`/book?vehicle=${v.id}`} className="btn btn-primary btn-sm">Book →</Link>
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function InfoRows() {
  const { activeFleet, settings } = useAppStore();
  const navigate = useNavigate();
  const [ref, setRef] = useState('');

  const modelRanges = activeFleet.map((v) => {
    const amounts = v.rates.map((r) => r.amountPerDay);
    const lo = amounts.length > 0 ? Math.min(...amounts) : v.startingRatePerDay;
    const hi = amounts.length > 0 ? Math.max(...amounts) : v.startingRatePerDay;
    return { name: v.name, lo, hi };
  });
  const wdAmounts = settings.withDriverRates.map((r) => r.amount);
  const wdLo = wdAmounts.length > 0 ? Math.min(...wdAmounts) : 0;
  const wdHi = wdAmounts.length > 0 ? Math.max(...wdAmounts) : 0;
  const fleetLo = modelRanges.length > 0 ? Math.min(...modelRanges.map((m) => m.lo)) : 0;

  return (
    <section className="hrows">
      <div className="container">
        <Link to="/rates" className="hrow">
          <span className="hrow-label">Rates</span>
          <span className="hrow-main">
            Self-drive from {formatPeso(fleetLo)} / day
            <small>
              {modelRanges.map((m) => `${m.name.split(' ').slice(-2).join(' ')} ${formatPeso(m.lo)}–${formatPeso(m.hi)}`).join(' · ')}
              {wdAmounts.length > 0 && ` · With-driver ${formatPeso(wdLo)}–${formatPeso(wdHi)}`}
            </small>
          </span>
          <span className="hrow-go" aria-hidden="true">→</span>
        </Link>
        <div className="hrow hrow-static">
          <span className="hrow-label">My booking</span>
          <span className="hrow-main">
            Track your reservation
            <small>Enter your booking reference to look up status.</small>
            <span className="hrow-lookup">
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. GD-XXXXXX"
                aria-label="Booking reference"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && ref.trim()) navigate(`/bookings?ref=${encodeURIComponent(ref.trim())}`);
                }}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={!ref.trim()}
                onClick={() => ref.trim() && navigate(`/bookings?ref=${encodeURIComponent(ref.trim())}`)}
              >
                Look up →
              </button>
            </span>
          </span>
        </div>
        <Link to="/rental-options" className="hrow">
          <span className="hrow-label">Requirements</span>
          <span className="hrow-main">
            Driver&apos;s license + proof of income
            <small>Self-drive only. With-driver needs none.</small>
          </span>
          <span className="hrow-go" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
  const modal = useVehicleModal();
  const { settings, activeFleet, fleetStartingRate } = useAppStore();
  const hero = activeFleet[0];
  const { photos: heroPhotos } = useVehiclePhotos(hero?.id ?? '');
  const wd = settings.withDriverRates;
  const wdFrom = wd.length > 0 ? Math.min(...wd.map((r) => r.amount)) : 0;

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="co-hero">
        <div className="wrap co-hero-grid">
          <div className="rise">
            <span className="eyebrow">GoDrive Car Rental · Bislig</span>
            <h1 className="co-hero-title mt-16">Book a car.</h1>
            <p className="co-hero-tag mt-12">Car Rental · Bislig</p>
            <p className="co-hero-sub mt-24">
              Clean, well-maintained vehicles for self-drive and with-driver
              rentals — in Bislig and beyond.
            </p>
            <div className="co-hero-ctas mt-32">
              <Link to="/book" className="btn btn-primary">
                Book a Vehicle <span className="arr" aria-hidden="true">→</span>
              </Link>
              <Link to="/fleet" className="btn btn-outline">Explore Fleet</Link>
            </div>
            <dl className="co-hero-facts mt-32">
              <div><dt>Pickup</dt><dd>{settings.pickup}</dd></div>
              <div><dt>Direct line</dt><dd>{settings.phone}</dd></div>
              <div><dt>Self-drive from</dt><dd>{formatPeso(fleetStartingRate())} / day</dd></div>
            </dl>
          </div>
          <div className="rise co-hero-media" style={{ ['--d' as never]: '0.1s' }}>
            {hero && (
              <VehiclePhoto vehicle={hero} src={heroPhotos[0]?.src} tone="dark" className="co-hero-photo" eager />
            )}
            {hero && (
              <div className="co-hero-card">
                <span className="car-tag">{vehicleMeta(hero.id)?.tag ?? hero.bodyType}</span>
                <b>{hero.name}</b>
                <span>{formatPeso(hero.startingRatePerDay)} / day · self-drive from</span>
                <Link to={`/book?vehicle=${hero.id}`} className="btn btn-primary btn-sm btn-block mt-16">
                  Book This Car <span className="arr" aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="wrap">
          <div className="rise" style={{ ['--d' as never]: '0.16s' }}>
            <HeroBookingPanel />
          </div>
        </div>
      </section>

      {/* ---------- FLEET SHOWCASE ---------- */}
      <section className="section co-catalog">
        <div className="container">
          <Reveal>
            <span className="eyebrow">The lineup</span>
            <div className="co-sec-head mt-16">
              <h2 className="h-section">Choose your ride.</h2>
              <Link to="/fleet" className="co-sec-link">View all cars →</Link>
            </div>
          </Reveal>
          <div className="cars-grid mt-32">
            {activeFleet.map((v, i) => (
              <ShowcaseCard key={v.id} vehicleId={v.id} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- RATES / BOOKING / REQUIREMENTS ---------- */}
      <InfoRows />
      {/* ---------- RENTAL OPTIONS FEATURE ---------- */}
      <section className="section co-greenband">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Two ways to travel</span>
            <h2 className="h-section mt-16">Self-drive or with-driver.</h2>
          </Reveal>
          <div className="grid-3 mt-32">
            <Reveal delay={0.05}>
              <article className="co-feature">
                {activeFleet[2] && (
                  <FeaturePhoto vehicleId={activeFleet[2].id} photoIndex={1} />
                )}
                <div className="co-feature-body">
                  <h3>Self-Drive</h3>
                  <p>You take the wheel. Valid driver&apos;s license and proof of income required.</p>
                  <p className="co-feature-rate">from {formatPeso(fleetStartingRate())} / day</p>
                  <Link to="/book?type=self" className="btn btn-primary btn-sm mt-16">
                    Book Self-Drive <span className="arr" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="co-feature">
                {activeFleet[0] && (
                  <FeaturePhoto vehicleId={activeFleet[0].id} photoIndex={1} />
                )}
                <div className="co-feature-body">
                  <h3>With-Driver</h3>
                  <p>A professional GoDrive driver handles the trip. No license documents needed.</p>
                  <p className="co-feature-rate">
                    from {formatPeso(wdFrom)}{wd.length > 0 ? ` · ${wd[0].unitNote}` : ''}
                  </p>
                  <Link to="/book?type=with" className="btn btn-primary btn-sm mt-16">
                    Book With-Driver <span className="arr" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
            <Reveal delay={0.15}>
              <article className="co-feature co-feature-info">
                <div className="co-feature-body">
                  <h3>Good to know</h3>
                  <ul className="check-list">
                    <li>No account needed to request</li>
                    <li>Direct confirmation by phone</li>
                    <li>Pickup: {settings.pickup}</li>
                    <li>{settings.driverExpenseNote}</li>
                  </ul>
                  <Link to="/rental-options" className="btn btn-outline btn-sm mt-16">Requirements →</Link>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section co-process">
        <div className="container">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <div className="co-sec-head mt-16">
              <h2 className="h-section">On the road in five moves.</h2>
              <Link to="/how-it-works" className="co-sec-link">Full process →</Link>
            </div>
          </Reveal>
          <ol className="co-steps mt-32">
            {PROCESS_STEPS.map(([n, b, p], i) => (
              <Reveal key={n} delay={i * 0.04}>
                <li>
                  <span className="co-step-num" aria-hidden="true">{n}</span>
                  <b>{b}</b>
                  <p>{p}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- TRUST (verified business facts only) ---------- */}
      <section className="section co-trustband">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Why GoDrive</span>
            <h2 className="h-section mt-16">Confirmed, direct, local.</h2>
          </Reveal>
          <div className="grid-3 mt-32">
            <Reveal delay={0.05}>
              <div className="co-trust">
                <b>Direct confirmation</b>
                <p>Every request is reviewed and confirmed personally at {settings.phone}.</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="co-trust">
                <b>Known pickup point</b>
                <p>Pickup and service area: {settings.pickup}.</p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="co-trust">
                <b>No account needed</b>
                <p>Request, track with your reference, and message — no sign-up.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCta
        eyebrow="Reservations"
        title="Ready to drive Bislig?"
        copy="Submit a booking request online — GoDrive confirms every vehicle directly."
        primaryLabel="Book a Vehicle"
        primaryTo="/book"
        secondaryLabel="Explore Fleet"
        secondaryTo="/fleet"
      />

      <VehicleModal vehicle={modal.selected} onClose={modal.close} />
    </>
  );
}
