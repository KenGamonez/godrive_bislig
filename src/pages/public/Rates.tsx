import { Link } from 'react-router-dom';
import { FinalCta, Reveal, SectionHead } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

export function RatesPage() {
  const { settings } = useAppStore();
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">Rates — Transparent</span>
          <h1 className="h-section">Priced by<br />destination.</h1>
          <p className="lede">Self-drive rates are daily and zone-based. With-driver rates are listed exactly as provided — the rate unit is confirmed with GoDrive.</p>
          <span className="ghost-num" aria-hidden="true">₱</span>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHead
              eyebrow="Self-drive"
              title="Daily rates."
              lede="Your estimate is calculated automatically during booking — days × zone rate."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="ledger">
              {settings.selfDriveRates.map((r, i) => (
                <div className="ledger-row" key={r.zone}>
                  <span className="ledger-zone">Zone {String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="ledger-name">{r.shortLabel}</div>
                    <div className="ledger-sub">{r.label} · Self-drive</div>
                  </div>
                  <div className="ledger-price">{formatPeso(r.amountPerDay)}<small>Per day</small></div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="wd-panel">
              <div>
                <span className="eyebrow on-dark">With-driver</span>
                <h3 className="mt-16">Driver-included rates.</h3>
                <p className="mt-16" style={{ color: '#a9bcdf' }}>
                  A professional GoDrive driver handles the trip. {settings.driverExpenseNote}
                </p>
                <div className="note-box warn mt-24" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {settings.withDriverRateUnitNote}
                </div>
              </div>
              <div>
                {settings.withDriverRates.map((r) => (
                  <div className="wd-row" key={r.zone}>
                    <div>
                      <b style={{ fontSize: 16 }}>{r.label}</b>
                      <div style={{ color: '#8fa3c8', fontSize: 13, marginTop: 4 }}>{r.unitNote}</div>
                    </div>
                    <b>{formatPeso(r.amount)}</b>
                  </div>
                ))}
                <p className="mt-24" style={{ color: '#8fa3c8', fontSize: 13.5 }}>
                  GoDrive has not published taxes, deposits, fuel policies, mileage limits, insurance terms, or penalties. Anything beyond the rates above is confirmed directly before your rental.
                </p>
              </div>
            </div>
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
