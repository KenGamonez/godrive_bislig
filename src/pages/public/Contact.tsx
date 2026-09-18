import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FinalCta, Reveal } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { telHref } from '../../utils/booking';

const SUBJECTS = [
  'General inquiry',
  'Booking question',
  'Availability',
  'Rates',
  'With-driver trip',
  'Feedback',
];

export function ContactPage() {
  const { submitContact, settings } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const errors: Record<string, string> = {};
  if (name.trim().length < 2) errors.name = 'Enter your name.';
  if (!/^09\d{9}$/.test(phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Enter a valid 11-digit mobile number (e.g. 09XXXXXXXXX).';
  }
  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address or leave it blank.';
  }
  if (message.trim().length < 10) errors.message = 'Write a short message (at least 10 characters).';

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length > 0 || sending) return;
    setSending(true);
    setSendError(null);
    const res = await submitContact({
      name: name.trim(),
      phone: phone.replace(/[\s-]/g, ''),
      email: email.trim() || undefined,
      subject,
      message: message.trim(),
    });
    setSending(false);
    if (res.error) {
      setSendError(res.error === 'Backend is not connected.'
        ? 'Messaging is unavailable right now — please call GoDrive directly instead.'
        : `Could not send your message (${res.error}). Try again or call GoDrive directly.`);
      return;
    }
    setSent(true);
  };

  const showErr = (k: string) => tried && errors[k];

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
                <h2 className="mt-16">{settings.contactPerson}</h2>
                <p className="small mt-16">{settings.businessName}</p>
              </div>
              <div className="biz-rows">
                <div className="biz-row">
                  <span>Mobile</span>
                  <a className="value" href={telHref(settings.phone)}>{settings.phone}</a>
                </div>
                <div className="biz-row">
                  <span>Pickup / Service area</span>
                  <b>{settings.pickup}</b>
                </div>
                <div className="biz-row">
                  <span>Facebook</span>
                  <a className="value" href={settings.facebookUrl} target="_blank" rel="noreferrer">GoDrive – Bislig Page →</a>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="panel panel-pad mt-32">
              <span className="eyebrow">Send a message</span>
              <h2 className="h-sub mt-16">GoDrive replies directly.</h2>
              {sent ? (
                <div className="mt-24">
                  <p><b>Message received — thank you, {name.trim().split(' ')[0]}.</b></p>
                  <p className="small mt-16">GoDrive reads every message personally and will get back to you on your mobile number.</p>
                  <div className="mt-24" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link to="/book" className="btn btn-primary">Book online <span className="arr" aria-hidden="true">→</span></Link>
                    <a className="btn btn-outline" href={telHref(settings.phone)}>Call {settings.phone}</a>
                  </div>
                </div>
              ) : (
                <form className="form-grid mt-24" onSubmit={send}>
                  <div className="form-grid two">
                    <div className="field">
                      <label htmlFor="c-name">Your name</label>
                      <input id="c-name" type="text" placeholder="e.g. Juan D. Cruz" value={name} onChange={(e) => setName(e.target.value)} className={showErr('name') ? 'invalid' : ''} maxLength={120} />
                      {showErr('name') && <span className="field-error">{errors.name}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="c-phone">Mobile number</label>
                      <input id="c-phone" type="tel" placeholder="09XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className={showErr('phone') ? 'invalid' : ''} />
                      {showErr('phone') && <span className="field-error">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-grid two">
                    <div className="field">
                      <label htmlFor="c-email">Email <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                      <input id="c-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={showErr('email') ? 'invalid' : ''} />
                      {showErr('email') && <span className="field-error">{errors.email}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="c-subject">Subject</label>
                      <select id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="c-message">Message</label>
                    <textarea id="c-message" placeholder="Hi! Is the Xpander available this weekend?" value={message} onChange={(e) => setMessage(e.target.value)} className={showErr('message') ? 'invalid' : ''} maxLength={2000} />
                    {showErr('message') && <span className="field-error">{errors.message}</span>}
                  </div>
                  {sendError && <p className="field-error" role="alert">{sendError}</p>}
                  <div>
                    <button className="btn btn-primary" type="submit" disabled={sending}>
                      {sending ? 'Sending…' : <>Send Message <span className="arr" aria-hidden="true">→</span></>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-32" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href={telHref(settings.phone)}>
                Call {settings.phone} <span className="arr" aria-hidden="true">→</span>
              </a>
              <a className="btn btn-outline" href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook Page</a>
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
