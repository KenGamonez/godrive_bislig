import { Link } from 'react-router-dom';
import { BUSINESS } from '../../data/business';
import { FinalCta, Reveal } from '../../components/site';

export function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Contact — Direct</span>
          <h1 className="h-section">Talk to GoDrive<br />directly.</h1>
          <p className="lede">Every booking request is confirmed personally. One call reaches the person who manages your rental.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 920 }}>
          <Reveal>
            <div className="biz-card">
              <div className="biz-head">
                <span className="eyebrow">Your contact</span>
                <h2 className="mt-16">{BUSINESS.contactPerson}</h2>
                <p className="small mt-16">{BUSINESS.name}</p>
              </div>
              <div className="biz-rows">
                <div className="biz-row">
                  <span>Mobile</span>
                  <a className="value" href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
                </div>
                <div className="biz-row">
                  <span>Pickup / Service area</span>
                  <b>{BUSINESS.pickup}</b>
                </div>
                <div className="biz-row">
                  <span>Facebook</span>
                  <a className="value" href={BUSINESS.facebookUrl} target="_blank" rel="noreferrer">GoDrive – Bislig Page →</a>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-32" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href={BUSINESS.phoneHref}>
                Call {BUSINESS.phone} <span className="arr" aria-hidden="true">→</span>
              </a>
              <a className="btn btn-outline" href={BUSINESS.facebookUrl} target="_blank" rel="noreferrer">Facebook Page</a>
              <Link to="/book" className="btn btn-ghost">Book online →</Link>
            </div>
            <p className="small mt-24">For same-day or next-day rentals, direct contact is fastest. For planned trips, the online booking request keeps everything organised.</p>
          </Reveal>
        </div>
      </section>
      <FinalCta
        eyebrow="Contact"
        title="Ready when you are."
        copy="Submit a booking request online, or call GoDrive now — both reach the same person."
        secondaryLabel="Explore Fleet"
        secondaryTo="/fleet"
      />
    </>
  );
}
