import { Link } from 'react-router-dom';
import { BUSINESS, VEHICLES } from '../../data/business';
import { fleetStartingRate } from '../../data/fleet';
import { VehicleCarousel } from '../../components/showroom';
import { VehicleModal, useVehicleModal } from '../../components/fleet';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

/**
 * Homepage — compact reservation app, not a marketing page.
 * Carousel is the product. Everything else is one line + one action.
 */
export function HomePage() {
  const modal = useVehicleModal();
  const { settings, bookings } = useAppStore();
  const latest = bookings[0];
  const wd = settings.withDriverRates;

  return (
    <>
      <section className="dash">
        <div className="wrap dash-inner">
          <div className="dash-top rise">
            <span className="dash-brand">GoDrive</span>
            <span className="dash-loc">Car Rental · Bislig</span>
            <span className="dash-live"><i /> Fleet ready</span>
          </div>

          <div className="dash-head rise" style={{ ['--d' as never]: '0.06s' }}>
            <div>
              <h1 className="dash-title">Book a car.</h1>
              <p className="dash-sub">
                {VEHICLES.length} vehicles · from {formatPeso(fleetStartingRate())} / day · {BUSINESS.pickup}
              </p>
            </div>
            <div className="dash-head-side">
              <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
              <span>Direct confirmation</span>
            </div>
          </div>

          <div className="rise" style={{ ['--d' as never]: '0.12s' }}>
            <VehicleCarousel onInspect={modal.open} />
          </div>

          <div className="hrental rise" style={{ ['--d' as never]: '0.16s' }}>
            <Link to="/book?type=self">
              <b>Self-drive</b>
              <small>You take the wheel.</small>
            </Link>
            <Link to="/book?type=with">
              <b>With-driver</b>
              <small>We handle the drive.</small>
            </Link>
          </div>
        </div>
      </section>

      <section className="hrows">
        <div className="container">
          <Link to="/rates" className="hrow">
            <span className="hrow-label">Rates</span>
            <span className="hrow-main">
              Self-drive from {formatPeso(fleetStartingRate())} / day
              <small>
                Dzire {formatPeso(1300)}–{formatPeso(2000)} · Xpander &amp; Avanza {formatPeso(2300)}–{formatPeso(3500)} · With-driver {wd.map((r) => formatPeso(r.amount)).join(' · ')}
              </small>
            </span>
            <span className="hrow-go" aria-hidden="true">→</span>
          </Link>
          <Link to="/bookings" className="hrow">
            <span className="hrow-label">My booking</span>
            <span className="hrow-main">
              {latest ? `${latest.reference} · ${latest.status}` : 'Have a reference?'}
              <small>{latest ? 'Look up status on this device.' : 'No account needed.'}</small>
            </span>
            <span className="hrow-go" aria-hidden="true">→</span>
          </Link>
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

      <VehicleModal vehicle={modal.selected} onClose={modal.close} />
    </>
  );
}
