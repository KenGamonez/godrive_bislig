import { Link } from 'react-router-dom';
import { FinalCta, Reveal, SectionHead } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

export function RentalOptionsPage() {
  const { settings } = useAppStore();
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Rental options — 02 ways</span>
          <h1 className="h-section">Two ways<br />to travel.</h1>
          <p className="lede">Self-drive for independence. With-driver for ease. The same maintained fleet backs both.</p>
          <span className="ghost-num" aria-hidden="true">02</span>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="duet">
              <div className="duet-col navy">
                <span className="duet-num" aria-hidden="true">01</span>
                <span className="tag">Self-drive</span>
                <h3 className="mt-16" style={{ color: '#fff' }}>You take the wheel.</h3>
                <p className="mt-16" style={{ color: '#c3cfe3', position: 'relative' }}>
                  Take the wheel for local trips, business, family travel, and adventures — on your own schedule.
                </p>
                <ul className="duet-list">
                  <li><span>You drive</span><b>The vehicle is entrusted to you</b></li>
                  <li><span>License</span><b>Valid license required</b></li>
                  <li><span>Income proof</span><b>Required</b></li>
                  {settings.selfDriveRates.map((r) => (
                    <li key={r.zone}><span>{r.shortLabel}</span><b>{formatPeso(r.amountPerDay)} / day</b></li>
                  ))}
                </ul>
                <Link to="/book" className="btn btn-accent">
                  Book Self-Drive <span className="arr" aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="duet-col">
                <span className="duet-num" aria-hidden="true">02</span>
                <span className="tag">With-driver</span>
                <h3 className="mt-16">We handle the drive.</h3>
                <p className="mt-16" style={{ color: 'var(--muted)', position: 'relative' }}>
                  Ride as a passenger while a GoDrive driver takes responsibility for the vehicle and the route.
                </p>
                <ul className="duet-list">
                  <li><span>Driver</span><b>Professional GoDrive driver</b></li>
                  <li><span>Documents</span><b>None required of you</b></li>
                  <li><span>Within Caraga / Davao City</span><b>{formatPeso(settings.withDriverRates[0]?.amount ?? 1000)}</b></li>
                  <li><span>Outside Caraga / Davao City</span><b>{formatPeso(settings.withDriverRates[1]?.amount ?? 1500)}</b></li>
                  <li><span>Meals &amp; lodging</span><b>{settings.driverExpenseNote}</b></li>
                </ul>
                <p className="mt-24" style={{ borderLeft: '2px solid #8a5f00', paddingLeft: 16, fontSize: 14, lineHeight: 1.65, position: 'relative' }}>{settings.withDriverRateUnitNote}</p>
                <Link to="/book" className="btn btn-outline">
                  Book With Driver <span className="arr" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="mt-56">
            <Reveal>
              <SectionHead
                eyebrow="Requirements"
                title="Why two documents?"
                lede="GoDrive asks for them before releasing a vehicle for self-drive — they establish your ability to take responsibility for rental liabilities in case of an untoward incident."
              />
            </Reveal>
            <Reveal delay={0.06}>
              <div className="req-ledger">
                <div className="req-cell">
                  <span className="n">REQ — 01</span>
                  <h3>Valid driver&apos;s license</h3>
                  <p>Confirms you are legally permitted to operate the vehicle class you are renting, and ties the rental to an accountable driver.</p>
                </div>
                <div className="req-cell">
                  <span className="n">REQ — 02</span>
                  <h3>Proof of income</h3>
                  <p>Demonstrates financial capacity to answer for rental liabilities — damage, loss, or other obligations — should an untoward incident occur.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <FinalCta
        eyebrow="Rental options"
        title="Decided how you'll travel?"
        copy="Start your booking request — vehicle, dates, and destination in minutes."
        secondaryLabel="View Rates"
        secondaryTo="/rates"
      />
    </>
  );
}
