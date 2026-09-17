import { Link, useSearchParams } from 'react-router-dom';
import { FinalCta, Reveal } from '../../components/site';
import { MyBookingLookup } from '../../components/booking';

export function BookingsPage() {
  const [params] = useSearchParams();
  const initial = params.get('ref') ?? params.get('q') ?? '';
  return (
    <>
      <section className="page-hero slim">
        <div className="container page-hero-inner">
          <span className="eyebrow">Bookings — No account needed</span>
          <h1 className="h-section">My booking.</h1>
          <p className="lede">Reference, vehicle, dates, status — looked up on this device in seconds.</p>
        </div>
      </section>
      <section className="section section-tight">
        <div className="container" style={{ maxWidth: 760 }}>
          <Reveal>
            <MyBookingLookup initial={initial} />
          </Reveal>
          <Reveal delay={0.06}>
            <div className="mt-32" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/book" className="btn btn-primary">
                New booking <span className="arr" aria-hidden="true">→</span>
              </Link>
              <Link to="/fleet" className="btn btn-outline">Browse cars</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCta
        eyebrow="Bookings"
        title="Can't find your reference?"
        copy="References live in this browser's local demo data — or call GoDrive and confirm directly."
        primaryLabel="Contact GoDrive"
        primaryTo="/contact"
        secondaryLabel="Book Again"
        secondaryTo="/book"
      />
    </>
  );
}
