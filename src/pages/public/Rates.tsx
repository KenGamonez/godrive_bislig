import { Link } from 'react-router-dom';
import { FinalCta, Reveal, SectionHead } from '../../components/site';
import { RateExplorer } from '../../components/booking';

export function RatesPage() {
  return (
    <>
      <section className="page-hero slim">
        <div className="container page-hero-inner">
          <span className="eyebrow">Rates — Transparent</span>
          <h1 className="h-section">What it costs.</h1>
          <p className="lede">Two tabs, every published rate. With-driver units are confirmed with GoDrive — never assumed.</p>
          <span className="ghost-num" aria-hidden="true">₱</span>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container" style={{ maxWidth: 860 }}>
          <Reveal>
            <SectionHead
              eyebrow="Rate explorer"
              title="Pick a way to travel."
              lede="Tap a zone to start a booking with it pre-selected."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <RateExplorer />
          </Reveal>
          <div className="mt-32" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/book" className="btn btn-primary">
              Book a Vehicle <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link to="/contact" className="btn btn-outline">Ask About Rates</Link>
          </div>
        </div>
      </section>
      <FinalCta
        eyebrow="Rates"
        title="Know your destination?"
        copy="Pick your zone during booking and the estimate is calculated for you."
        secondaryLabel="Contact GoDrive"
        secondaryTo="/contact"
      />
    </>
  );
}
