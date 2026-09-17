import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BUSINESS } from '../data/business';

/* ============================================================
   Vehicle illustration — refined local SVG artwork.
   Front of vehicle faces right. No external imagery.
   ============================================================ */

function Wheel({ cx, cy, dark }: { cx: number; cy: number; dark: boolean }) {
  const tire = dark ? '#060f24' : '#16191d';
  const rim = dark ? '#c9d6ea' : '#9fb2cc';
  const spoke = dark ? '#7e93b5' : '#5b6f8c';
  return (
    <g>
      <circle cx={cx} cy={cy} r={37} fill={tire} />
      <circle cx={cx} cy={cy} r={37} fill="none" stroke={dark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)'} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={20} fill={rim} />
      {[0, 72, 144, 216, 288].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={cx}
            y1={cy}
            x2={cx + 19 * Math.cos(r)}
            y2={cy + 19 * Math.sin(r)}
            stroke={spoke}
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={6} fill={tire} />
      <circle cx={cx} cy={cy} r={6} fill="none" stroke={rim} strokeWidth={1.5} />
    </g>
  );
}

function LampCluster({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={flip ? `translate(${x},${y}) scale(-1,1) translate(${-x},${-y})` : undefined}>
      <path d={`M${x} ${y} L${x + 30} ${y + 2} L${x + 26} ${y + 12} L${x} ${y + 12} Z`} fill="#e8eef7" opacity={0.95} />
      <rect x={x + 2} y={y + 14} width={22} height={5} rx={2.5} fill="#E8B93E" />
    </g>
  );
}

export function VehicleArt({
  silhouette,
  tone = 'light',
  title,
}: {
  silhouette: 'mpv' | 'sedan';
  tone?: 'light' | 'dark';
  title: string;
}) {
  const dark = tone === 'dark';
  const body = dark ? '#E9EFF8' : '#0A2148';
  const bodyShade = dark ? '#B9C9E4' : '#12305E';
  const glass = dark ? '#0A2148' : '#A9C0E2';
  const cut = dark ? '#8fa3c8' : '#5B7AB5';
  const isMpv = silhouette === 'mpv';
  const w1 = isMpv ? 178 : 170;
  const w2 = isMpv ? 476 : 474;
  const wy = isMpv ? 228 : 222;

  return (
    <svg
      className="vehicle-art"
      viewBox="0 0 640 320"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx={325} cy={272} rx={252} ry={14} fill={dark ? 'rgba(0,0,0,0.35)' : 'rgba(10,33,72,0.14)'} />
      {/* wheel arches */}
      <circle cx={w1} cy={wy} r={44} fill={dark ? '#0d2a5c' : '#d3dae3'} />
      <circle cx={w2} cy={wy} r={44} fill={dark ? '#0d2a5c' : '#d3dae3'} />
      {isMpv ? (
        <g>
          <path
            d="M70 248 L78 196 Q80 182 94 180 L148 174 L196 172 L262 108 Q270 100 284 100 L448 100 Q462 100 470 110 L524 172 L560 178 Q576 180 576 196 L576 238 Q576 248 566 248 L70 248 Z"
            fill={body}
          />
          <path
            d="M70 248 L78 196 Q80 182 94 180 L148 174 L196 172 L262 108 Q270 100 284 100 L300 100 L234 172 L196 174 L148 180 L94 186 Q82 188 80 200 L74 248 Z"
            fill={bodyShade}
            opacity={0.55}
          />
          {/* greenhouse */}
          <path d="M276 112 L232 168 L292 168 L332 112 Z" fill={glass} />
          <path d="M344 112 L304 168 L392 168 L392 112 Z" fill={glass} />
          <path d="M404 112 L404 168 L456 168 L428 112 Z" fill={glass} />
          <path d="M214 182 L252 182 L226 226 L192 226 Z" fill={glass} opacity={0.9} />
          {/* pillars */}
          <path d="M292 112 L304 112 L304 168 L292 168 Z" fill={body} />
          <path d="M392 112 L404 112 L404 168 L392 168 Z" fill={body} />
          {/* beltline + doors */}
          <rect x={70} y={228} width={506} height={4} fill={cut} opacity={0.6} />
          <line x1={300} y1={180} x2={300} y2={228} stroke={cut} strokeWidth={1.5} opacity={0.7} />
          <line x1={410} y1={178} x2={410} y2={228} stroke={cut} strokeWidth={1.5} opacity={0.7} />
          <rect x={318} y={196} width={26} height={6} rx={3} fill={cut} opacity={0.9} />
          <rect x={424} y={194} width={26} height={6} rx={3} fill={cut} opacity={0.9} />
          {/* skirt */}
          <rect x={228} y={244} width={196} height={7} rx={3.5} fill={dark ? '#060f24' : '#16191d'} opacity={0.85} />
          <LampCluster x={540} y={196} />
          <rect x={70} y={206} width={10} height={16} rx={2} fill={cut} opacity={0.8} />
        </g>
      ) : (
        <g>
          <path
            d="M62 242 L86 198 Q92 188 106 186 L192 180 L258 122 Q268 114 282 114 L404 114 Q418 114 428 122 L490 180 L556 186 Q572 188 572 202 L572 232 Q572 242 562 242 L62 242 Z"
            fill={body}
          />
          <path
            d="M62 242 L86 198 Q92 188 106 186 L192 180 L258 122 Q268 114 282 114 L298 114 L232 180 L192 182 L106 188 Q94 190 88 200 L66 242 Z"
            fill={bodyShade}
            opacity={0.55}
          />
          {/* greenhouse */}
          <path d="M272 126 L226 176 L294 176 L328 126 Z" fill={glass} />
          <path d="M340 126 L306 176 L388 176 L388 126 Z" fill={glass} />
          <path d="M400 126 L400 176 L448 176 L420 126 Z" fill={glass} />
          {/* pillars */}
          <path d="M294 126 L306 126 L306 176 L294 176 Z" fill={body} />
          <path d="M388 126 L400 126 L400 176 L388 176 Z" fill={body} />
          {/* beltline + doors */}
          <rect x={62} y={222} width={510} height={4} fill={cut} opacity={0.6} />
          <line x1={300} y1={184} x2={300} y2={222} stroke={cut} strokeWidth={1.5} opacity={0.7} />
          <line x1={398} y1={182} x2={398} y2={222} stroke={cut} strokeWidth={1.5} opacity={0.7} />
          <rect x={316} y={198} width={24} height={6} rx={3} fill={cut} opacity={0.9} />
          <rect x={412} y={196} width={24} height={6} rx={3} fill={cut} opacity={0.9} />
          {/* skirt */}
          <rect x={222} y={238} width={198} height={7} rx={3.5} fill={dark ? '#060f24' : '#16191d'} opacity={0.85} />
          <LampCluster x={536} y={198} />
          <rect x={64} y={208} width={10} height={15} rx={2} fill={cut} opacity={0.8} />
        </g>
      )}
      <Wheel cx={w1} cy={wy} dark={dark} />
      <Wheel cx={w2} cy={wy} dark={dark} />
    </svg>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Available' ? 'badge-available'
    : status === 'Reserved' ? 'badge-reserved'
    : status === 'Unavailable' ? 'badge-unavailable'
    : status === 'Pending' ? 'badge-pending'
    : status === 'Confirmed' ? 'badge-confirmed'
    : status === 'Ongoing' ? 'badge-ongoing'
    : status === 'Completed' ? 'badge-completed'
    : status === 'Cancelled' ? 'badge-cancelled'
    : status === 'Good' ? 'badge-good'
    : status === 'Scheduled' ? 'badge-scheduled'
    : status === 'In Shop' ? 'badge-inshop'
    : 'badge-neutral';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  index,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  index?: string;
  dark?: boolean;
}) {
  return (
    <div className={`split-head ${dark ? 'on-dark' : ''}`}>
      <div>
        <span className={`eyebrow${dark ? ' on-dark' : ''}`}>{eyebrow}</span>
        <h2 className="h-section mt-16">{title}</h2>
      </div>
      <div>
        {index && <div className="index">{index}</div>}
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
    </div>
  );
}

/** Restrained scroll reveal with optional stagger delay (seconds). */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style = { '--d': `${delay}s` } as CSSProperties;
  return (
    <div ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Smooth single-open accordion. */
export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: Array<{ q: string; a: string }>;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="faq-list">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div className={`faq-item${isOpen ? ' open' : ''}`} key={f.q}>
            <button
              className="faq-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span>{f.q}</span>
              <span className="mark" aria-hidden="true">+</span>
            </button>
            <div className="faq-a-wrap">
              <div className="faq-a-inner">
                <p className="faq-a">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const NAV = [
  { to: '/fleet', label: 'Fleet', n: '01' },
  { to: '/rental-options', label: 'Rental Options', n: '02' },
  { to: '/rates', label: 'Rates', n: '03' },
  { to: '/how-it-works', label: 'How It Works', n: '04' },
  { to: '/faq', label: 'FAQ', n: '05' },
  { to: '/contact', label: 'Contact', n: '06' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open ]);

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="container site-header-inner">
          <Link to="/" className="brand" aria-label="GoDrive — home">
            <span className="brand-mark" aria-hidden="true">G</span>
            <span className="brand-text">
              <strong>GoDrive</strong>
              <small>CAR RENTAL · BISLIG</small>
            </span>
          </Link>
          <nav className="nav-desktop" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/book" className="btn btn-primary btn-sm header-cta">
              Book Now <span className="arr" aria-hidden="true">→</span>
            </Link>
          </nav>
          <button
            className={`burger${open ? ' open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <i /> <i /> <i />
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="mm-link">
              <small>{n.n}</small> {n.label}
            </Link>
          ))}
          <div className="mm-foot">
            <Link to="/book" className="btn btn-light btn-block">
              Book a Vehicle <span className="arr" aria-hidden="true">→</span>
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span>{BUSINESS.pickup}</span>
              <a href={BUSINESS.phoneHref} style={{ color: '#fff', fontWeight: 700 }}>{BUSINESS.phone}</a>
            </div>
          </div>
        </nav>
      )}
      {!open && location.pathname !== '/book' && (
        <div className="mobile-book">
          <Link to="/book" className="btn btn-primary btn-block">Book a Vehicle</Link>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
            <span className="brand-mark" style={{ background: '#fff', color: '#0A2148' }}>G</span>
            <span className="brand-text">
              <strong style={{ color: '#fff' }}>GoDrive</strong>
              <small style={{ color: '#8fa3c8' }}>CAR RENTAL · BISLIG</small>
            </span>
          </Link>
          <p style={{ fontSize: 14.5, maxWidth: 400, marginTop: 18, lineHeight: 1.7 }}>{BUSINESS.description}</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul className="footer-links">
            <li><Link to="/fleet">Fleet</Link></li>
            <li><Link to="/rental-options">Rental Options</Link></li>
            <li><Link to="/rates">Rates</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/book">Book Now</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Direct line</h4>
          <span style={{ fontSize: 13 }}>{BUSINESS.contactPerson}</span>
          <b><a href={BUSINESS.phoneHref} style={{ color: '#fff' }}>{BUSINESS.phone}</a></b>
          <ul className="footer-links" style={{ marginTop: 14 }}>
            <li><a href={BUSINESS.facebookUrl} target="_blank" rel="noreferrer">Facebook Page →</a></li>
          </ul>
        </div>
        <div>
          <h4>Pickup</h4>
          <p style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{BUSINESS.pickup}</p>
          <p className="mt-16" style={{ fontSize: 13.5 }}>{BUSINESS.tagline}</p>
          <Link to="/book" className="btn btn-outline-light btn-sm mt-24">
            Book a Vehicle <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="container" aria-hidden="true">
        <div className="footer-word">GoDrive</div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 {BUSINESS.name}. All rights reserved.</span>
          <span>Pickup: {BUSINESS.pickup}</span>
        </div>
      </div>
    </footer>
  );
}

/** Single strategic closing CTA — one per page, copy varies. */
export function FinalCta({
  eyebrow = 'Reservations',
  title = 'Your vehicle is waiting.',
  copy = 'Submit a booking request and GoDrive will confirm availability directly.',
  primaryLabel = 'Book a Vehicle',
  primaryTo = '/book',
  secondaryLabel = 'Explore Fleet',
  secondaryTo = '/fleet',
}: {
  eyebrow?: string;
  title?: string;
  copy?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}) {
  return (
    <section className="final">
      <div className="container final-grid">
        <Reveal>
          <span className="eyebrow on-dark">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{copy}</p>
          <div className="final-meta">
            <span>Pickup · <strong>{BUSINESS.pickup}</strong></span>
            <span>Direct · <strong>{BUSINESS.phone}</strong></span>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="final-actions">
            <Link to={primaryTo} className="btn btn-accent btn-block">
              {primaryLabel} <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link to={secondaryTo} className="btn btn-outline-light btn-block">{secondaryLabel}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
