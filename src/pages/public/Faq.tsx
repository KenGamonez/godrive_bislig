import { Link } from 'react-router-dom';
import { Accordion, FinalCta, Reveal } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatPeso } from '../../utils/booking';

export function FaqPage() {
  const { settings } = useAppStore();
  const faqs = [
    {
      q: 'What vehicles are available?',
      a: 'GoDrive operates four vehicles: Mitsubishi Xpander GLS 2025 (7-seater MPV, automatic, 7 passengers + 1 driver), Toyota Avanza 2026 (7-seater MPV, automatic, 7 passengers + 1 driver), Suzuki Dzire MT 2024 (sedan, manual, 4 passengers + 1 driver), and Suzuki Dzire AT 2024 (sedan, automatic, 4 passengers + 1 driver). Availability varies by date.',
    },
    {
      q: 'What rental options do you offer?',
      a: 'Self-drive — you drive the vehicle yourself. With-driver — a professional GoDrive driver handles the trip while you ride as a passenger.',
    },
    {
      q: 'What are the self-drive rates?',
      a: `Suzuki Dzire AT and MT — Within Bislig City ${formatPeso(1300)}/day · 2nd District, Surigao del Sur ${formatPeso(1500)}/day · 1st District, SDS / Caraga ${formatPeso(1800)}/day · Outside Caraga ${formatPeso(2000)}/day. Mitsubishi Xpander GLS and Toyota Avanza — Within Bislig City ${formatPeso(2300)}/day · 2nd District, Surigao del Sur ${formatPeso(2500)}/day · 1st District, SDS / Caraga / Davao City ${formatPeso(2800)}/day · Outside Caraga / Davao City ${formatPeso(3500)}/day.`,
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
      a: `Pickup and service area is ${settings.pickup}. Exact pickup arrangements are confirmed with GoDrive after your booking request.`,
    },
    {
      q: 'Can I rent with a driver?',
      a: `Yes. With-driver rentals include a professional GoDrive driver. ${settings.driverExpenseNote} No license or income documents are required of the customer for with-driver trips.`,
    },
    {
      q: 'How does booking work?',
      a: `Choose a vehicle, select self-drive or with-driver, enter your dates, destination, and contact details, then submit. GoDrive reviews availability and confirms directly — currently at ${settings.phone}. ${settings.bookingNotice}`,
    },
  ];
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow">FAQ — 08 answers</span>
          <h1 className="h-section">Answers,<br />plainly stated.</h1>
          <p className="lede">Only confirmed GoDrive information. Anything else is answered directly at {settings.phone}.</p>
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
        copy={`Every question answered personally — call ${settings.phone} or send a booking request.`}
        secondaryLabel="Contact"
        secondaryTo="/contact"
      />
    </>
  );
}
