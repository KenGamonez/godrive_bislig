import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BUSINESS, VEHICLES } from '../../data/business';
import {
  Accordion,
  FinalCta,
  Reveal,
  SectionHead,
  VehicleArt,
} from '../../components/site';
import { LineupRow, VehicleModal, useVehicleModal } from '../../components/fleet';
import { useAppStore } from '../../store/AppStore';
import { formatPeso, todayISO } from '../../utils/booking';

/* Reservation beginning — vehicle, rental type, dates → /book prefill. */
function BookingEntry() {
  const navigate = useNavigate();
  const [vehicleId, setVehicleId] = useState(VEHICLES[0]?.id ?? '');
  const [rentalType, setRentalType] = useState<'self-drive' | 'with-driver'>('self-drive');
  const [pickup, setPickup] = useState('');
  const [ret, setRet] = useState('');
  const today = todayISO();

  const begin = () => {
    const q = new URLSearchParams();
    if (vehicleId) q.set('vehicle', vehicleId);
    q.set('type', rentalType === 'with-driver' ? 'with' : 'self');
    if (pickup) q.set('pickup', pickup);
    if (ret) q.set('return', ret);
    navigate(`/book?${q.toString()}`);
  };

  return (
    <div className="bookstart">
      <div className="container">
        <div className="bookstart-panel">
          <div className="bookstart-head">
            <h2>Begin your reservation</h2>
            <span>Step 01 — No account needed</span>
          </div>
          <div className="bookstart-grid">
            <div className="bs-field">
              <label htmlFor="be-vehicle">Vehicle</label>
              <select id="be-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                {VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="bs-field">
              <label id="be-type-label">Rental type</label>
              <div className="seg" role="group" aria-labelledby="be-type-label">
                <button
                  className={rentalType === 'self-drive' ? 'on' : ''}
                  onClick={() => setRentalType('self-drive')}
                  aria-pressed={rentalType === 'self-drive'}
                >
                  Self-drive
                </button>
                <button
                  className={rentalType === 'with-driver' ? 'on' : ''}
                  onClick={() => setRentalType('with-driver')}
                  aria-pressed={rentalType === 'with-driver'}
                >
                  With driver
                </button>
              </div>
            </div>
            <div className="bs-field">
              <label htmlFor="be-pickup">Pickup</label>
              <input id="be-pickup" type="date" min={today} value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </div>
            <div className="bs-field">
              <label htmlFor="be-return">Return</label>
              <input id="be-return" type="date" min={pickup || today} value={ret} onChange={(e) => setRet(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={begin}>
              Continue <span className="arr" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_FAQS = [
  {
    q: 'What vehicles are available?',
    a: 'Mitsubishi Xpander AT (7-seater MPV), Toyota Avanza AT (7-seater MPV), Suzuki Dzire MT (sedan), and Suzuki Dzire AT 2025 (sedan, 4 + 1 driver). Availability varies — submit a booking request and GoDrive will confirm.',
  },
  {
    q: 'What rental options do you offer?',
    a: 'Two options: self-drive, where you drive the vehicle yourself, and with-driver, where a professional GoDrive driver handles the trip.',
  },
  {
    q: 'Where is pickup?',
    a: 'Pickup and service area is Boardwalk Gym, Bislig. Exact pickup arrangements are confirmed with GoDrive after your booking request.',
  },
  {
    q: 'How does booking work?',
    a: 'Choose a vehicle, select self-drive or with-driver, pick your dates and destination, then submit your request. GoDrive reviews availability and confirms your rental directly — currently at 09260621287.',
  },
];

const PROCESS = [
  ['01', 'Choose your vehicle', 'Browse the lineup and pick the unit that fits your trip — MPVs for groups, sedans for efficient travel.'],
  ['02', 'Choose your rental type', 'Self-drive for independence, with-driver for ease.'],
  ['03', 'Submit your request', 'Dates, destination, and contact details — the guided flow takes minutes.'],
  ['04', 'GoDrive reviews availability', 'Every request is checked against the fleet schedule and confirmed directly.'],
  ['05', 'Confirm your rental', 'Pickup is arranged at Boardwalk Gym, Bislig. Arrive ready and drive out.'],
];

export function HomePage() {
  const modal = useVehicleModal();
  const { settings } = useAppStore();

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-kicker rise" style={{ ['--d' as never]: '0s' }}>
            <span>GoDrive · Car rental — Bislig</span>
            <span className="live">Fleet ready</span>
          </div>
          <h1 className="h-display rise" style={{ ['--d' as never]: '0.08s' }}>
            Your ride.<br />
            <span className="dim">Your journey.</span><br />
            Your drive.
          </h1>
          <div className="hero-sub">
            <div className="hero-copy rise" style={{ ['--d' as never]: '0.16s' }}>
              <p className="lede">
                Self-drive and with-driver rentals in Bislig and beyond —
                clean, well-maintained vehicles for business, family, and adventure.
              </p>
              <div className="hero-ctas">
                <Link to="/book" className="btn btn-accent">
                  Book a Vehicle <span className="arr" aria-hidden="true">→</span>
                </Link>
                <Link to="/fleet" className="btn btn-outline-light">Explore Fleet</Link>
              </div>
              <div className="hero-meta">
                <div>Pickup<strong>{BUSINESS.pickup}</strong></div>
                <div>Direct<strong>{BUSINESS.phone}</strong></div>
              </div>
            </div>
            <div className="hero-stage rise" style={{ ['--d' as never]: '0.24s' }}>
              <div className="hero-stage-frame">
                <div className="hero-stage-caption">
                  <span>Xpander AT · 7-Seater MPV</span>
                  <span>Flagship</span>
                </div>
                <VehicleArt silhouette="mpv" tone="dark" title="Mitsubishi Xpander AT" />
              </div>
              <span className="hero-ghost" aria-hidden="true">Drive</span>
            </div>
          </div>
        </div>
        <div className="hero-ticker">
          <div className="wrap hero-ticker-inner">
            <div><b>4 vehicles</b><span>MPVs + Sedans</span></div>
            <div><b>2 options</b><span>Self-drive · With-driver</span></div>
            <div><b>₱1,500 / day</b><span>Self-drive from</span></div>
            <div><b>Bislig &amp; beyond</b><span>Caraga · Davao</span></div>
          </div>
        </div>
      </section>

      <BookingEntry />

      {/* ============ LINEUP ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="The lineup"
              index="01 / Fleet"
              title="Four vehicles. Kept ready."
              lede="An MPV or a sedan for every itinerary — every unit maintained, every rate transparent."
            />
          </Reveal>
        </div>
        <div className="container">
          <Reveal>
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
            <div className="mt-32" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/fleet" className="btn btn-outline">
                Full Fleet <span className="arr" aria-hidden="true">→</span>
              </Link>
              <Link to="/rates" className="btn btn-ghost">View rates →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ DUET ============ */}
      <section className="section section-soft">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Rental options"
              index="02 / Choice"
              title="Take the wheel. Or hand it over."
            />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="duet">
              <div className="duet-col navy">
                <span className="duet-num" aria-hidden="true">01</span>
                <span className="tag">Self-drive</span>
                <h3 className="mt-16" style={{ color: '#fff' }}>You take the wheel.</h3>
                <ul className="duet-list">
                  <li><span>You drive</span><b>Full control of schedule</b></li>
                  <li><span>License</span><b>Valid license required</b></li>
                  <li><span>Income proof</span><b>Required</b></li>
                  <li><span>Rates</span><b>From {formatPeso(1500)} / day</b></li>
                </ul>
                <Link to="/rental-options" className="btn btn-accent">
                  Compare Options <span className="arr" aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="duet-col">
                <span className="duet-num" aria-hidden="true">02</span>
                <span className="tag">With-driver</span>
                <h3 className="mt-16">We handle the drive.</h3>
                <ul className="duet-list">
                  <li><span>Driver</span><b>Professional GoDrive driver</b></li>
                  <li><span>Documents</span><b>None required of you</b></li>
                  <li><span>Within Caraga / Davao</span><b>{formatPeso(settings.withDriverRates[0]?.amount ?? 1000)}</b></li>
                  <li><span>Outside</span><b>{formatPeso(settings.withDriverRates[1]?.amount ?? 1500)}</b></li>
                </ul>
                <Link to="/book" className="btn btn-outline">
                  Request With Driver <span className="arr" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ RATES PREVIEW ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Self-drive rates"
              index="03 / Rates"
              title="Priced by destination."
              lede="Four zones, four daily rates. With-driver rates are confirmed with GoDrive."
            />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="ledger">
              {settings.selfDriveRates.map((r, i) => (
                <div className="ledger-row" key={r.zone}>
                  <span className="ledger-zone">Zone {String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="ledger-name">{r.shortLabel}</div>
                    <div className="ledger-sub">{r.label}</div>
                  </div>
                  <div className="ledger-price">{formatPeso(r.amountPerDay)}<small>Per day</small></div>
                </div>
              ))}
            </div>
            <Link to="/rates" className="btn btn-primary mt-32">
              All Rates <span className="arr" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="section section-soft">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="How it works"
              index="04 / Process"
              title="From browsing to driving."
              lede="No accounts, no queues — submit a request and GoDrive confirms availability directly."
            />
          </Reveal>
          <div className="rail">
            {PROCESS.map(([n, b, p], i) => (
              <Reveal key={n} delay={i * 0.05}>
                <div className="rail-item">
                  <span className="rail-num">{n}</span>
                  <h3>{b}</h3>
                  <div><p>{p}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ REQUIREMENTS ============ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Self-drive requirements"
              index="05 / Standard"
              title="Two documents. One standard of care."
              lede="These requirements help establish your ability to take responsibility for rental liabilities in case of an untoward incident."
            />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="req-ledger">
              <div className="req-cell">
                <span className="n">REQ — 01</span>
                <h3>Valid driver&apos;s license</h3>
                <p>Confirms you are legally permitted to operate the vehicle, and ties the rental to an accountable driver.</p>
              </div>
              <div className="req-cell">
                <span className="n">REQ — 02</span>
                <h3>Proof of income</h3>
                <p>Demonstrates capacity to answer for rental liabilities — protecting both you and the vehicle entrusted to you.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ PREVIEW ============ */}
      <section className="section section-soft">
        <div className="container" style={{ maxWidth: 900 }}>
          <Reveal>
            <SectionHead eyebrow="Questions" index="06 / FAQ" title="Good to know." />
          </Reveal>
          <Reveal delay={0.06}>
            <Accordion items={PREVIEW_FAQS} defaultOpen={0} />
            <Link to="/faq" className="btn btn-outline mt-32">
              All FAQs <span className="arr" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <FinalCta
        eyebrow="Reservations"
        title="Your vehicle is waiting."
        copy="Submit a booking request in minutes. GoDrive reviews availability and confirms your rental directly."
      />
      <VehicleModal vehicle={modal.selected} onClose={modal.close} />
    </>
  );
}
