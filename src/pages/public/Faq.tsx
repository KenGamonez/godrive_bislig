import { Link } from 'react-router-dom';
import { BUSINESS } from '../../data/business';
import { Accordion, FinalCta, Reveal } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

export function FaqPage() {
  const { settings } = useAppStore();
  const faqs = [
    {
      q: 'What vehicles are available?',
      a: `GoDrive operates four vehicles: Mitsubishi Xpander AT (7-seater MPV, automatic), Toyota Avanza AT (7-seater MPV, automatic), Suzuki Dzire MT (sedan, manual), and Suzuki Dzire AT 2025 (sedan, automatic, 4 + 1 driver). Availability varies by date.`,
    },
    {
      q: 'What rental options do you offer?',
      a: 'Self-drive — you drive the vehicle yourself. With-driver — a professional GoDrive driver handles the trip while you ride as a passenger.',
    },
    {
      q: 'What are the self-drive rates?',
      a: `Within Bislig City — ${formatPeso(1500)}/day. Within 2nd District, Surigao del Sur — ${formatPeso(1800)}/day. Within 1st District, Surigao del Sur / Caraga — ${formatPeso(2000)}/day. Outside Caraga — ${formatPeso(2500)}/day.`,
    },
    {
      q: 'What are the with-driver rates?',
      a: `Within Caraga / Davao City — ${formatPeso(settings.withDriverRates[0]?.amount ?? 1000)}. Outside Caraga / Davao City — ${formatPeso(settings.withDriverRates[1]?.amount ?? 1500)}. ${settings.withDriverRateUnitNote} ${settings.driverExpenseNote}`,
    },
    {
      q: 'What are the requirements for self-drive?',
      a: 'A valid driver\u2019s license and proof of income. These help establish your ability to take responsibility for rental liabilities in case of an untoward incident.',
    },
    {
      q: 'Where is pickup?',
      a: `Pickup and service area is ${BUSINESS.pickup}. Exact pickup arrangements are confirmed with GoDrive after your booking request.`,
    },
    {
      q: 'Can I rent with a driver?',
      a: `Yes. With-driver rentals include a professional GoDrive driver. ${settings.driverExpenseNote} No license or income documents are required of the customer for with-driver trips.`,
    },
    {
      q: 'How does booking work?',
      a: `Choose a vehicle, select self-drive or with-driver, enter your dates, destination, and contact details, then submit. GoDrive reviews availability and confirms directly — currently at ${BUSINESS.phone}. ${settings.bookingNotice}`,
    },
  ];
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">FAQ — 08 answers</span>
          <h1 className="h-section">Answers,<br />plainly stated.</h1>
          <p className="lede">Only confirmed GoDrive information. Anything else is answered directly at {BUSINESS.phone}.</p>
          <span className="ghost-num" aria-hidden="true">?</span>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <Reveal>
            <Accordion items={faqs} defaultOpen={0} />
          </Reveal>
          <div className="mt-32" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/book" className="btn btn-primary">
              Book a Vehicle <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link to="/contact" className="btn btn-outline">Contact GoDrive</Link>
          </div>
        </div>
      </section>
      <FinalCta
        eyebrow="Still curious?"
        title="Ask GoDrive directly."
        copy={`Every question answered personally — call ${BUSINESS.phone} or send a booking request.`}
        secondaryLabel="Contact"
        secondaryTo="/contact"
      />
    </>
  );
}
