import { Link } from 'react-router-dom';
import { FinalCta, Reveal } from '../../components/site';

const STEPS = [
  ['01', 'Choose your vehicle', 'Browse the lineup — Xpander and Avanza MPVs for groups, Dzire sedans for efficient travel. Open any vehicle for transmission, capacity, and availability.'],
  ['02', 'Choose your rental type', 'Self-drive if you hold a valid license and proof of income; with-driver if you prefer a professional GoDrive driver to handle the trip.'],
  ['03', 'Submit your booking request', 'Pick your dates, tell GoDrive your destination, and leave your contact details. The guided booking flow takes only a few minutes.'],
  ['04', 'GoDrive reviews availability', 'Every request is checked against the fleet schedule. GoDrive responds directly — currently by phone at 09260621287.'],
  ['05', 'Confirm your rental', 'Once confirmed, pickup is arranged at Boardwalk Gym, Bislig. Arrive with your requirements ready and drive out.'],
];

export function HowItWorksPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">How it works — 05 steps</span>
          <h1 className="h-section">From browsing<br />to driving.</h1>
          <p className="lede">A simple sequential process. No accounts, no queues — submit a request and GoDrive confirms availability directly.</p>
          <span className="ghost-num" aria-hidden="true">05</span>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="rail">
            {STEPS.map(([n, b, p], i) => (
              <Reveal key={n} delay={i * 0.04}>
                <div className="rail-item">
                  <span className="rail-num">{n}</span>
                  <h3>{b}</h3>
                  <div><p>{p}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-48" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/book" className="btn btn-primary">
              Start Booking <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link to="/faq" className="btn btn-outline">Read FAQ</Link>
          </div>
        </div>
      </section>
      <FinalCta
        eyebrow="How it works"
        title="Simple enough? Begin."
        copy="The guided booking flow walks you through each step — nothing to prepare in advance."
        secondaryLabel="Explore Fleet"
        secondaryTo="/fleet"
      />
    </>
  );
}
