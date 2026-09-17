import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SiteHeader, SiteFooter } from '../components/site';
import { useAppStore } from '../store/AppStore';

export function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/fleet', label: 'Fleet' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/availability', label: 'Availability' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/settings', label: 'Settings' },
];

export function AdminLayout() {
  const { session, logout, bookings } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pending = bookings.filter((b) => b.status === 'Pending').length;

  if (!session.loggedIn && location.pathname !== '/admin/login') {
    return (
      <div className="admin-main">
        <div className="container" style={{ padding: '80px 24px', maxWidth: 560 }}>
          <div className="panel panel-pad">
            <span className="eyebrow">Owner access</span>
            <h2 className="h-sub mt-16">Sign in required</h2>
            <p className="small mt-16">The management dashboard is a local demo in this frontend build. Continue to the mock owner sign-in.</p>
            <Link to="/admin/login" className="btn btn-primary mt-24">Go to Owner Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!session.loggedIn) return <Outlet />;

  const title =
    ADMIN_NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ??
    'Manage';

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side-inner">
          <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
            <span className="brand-mark" style={{ background: '#fff', color: '#0A2148' }}>G</span>
            <span className="brand-text">
              <strong>GoDrive</strong>
              <small>OWNER CONSOLE</small>
            </span>
          </Link>
          <span className="demo-tag mt-16" style={{ background: 'transparent', color: '#8fa3c8', borderColor: 'rgba(255,255,255,0.2)' }}>
            Demo data — local only
          </span>
          <nav className="admin-nav" aria-label="Admin">
            {ADMIN_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span>{n.label}</span>
                {n.to === '/admin/bookings' && pending > 0 && <span className="admin-count">{pending}</span>}
              </NavLink>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', display: 'grid', gap: 10 }}>
            <Link to="/" style={{ color: '#8fa3c8', fontSize: 13.5, textDecoration: 'none' }}>← View public website</Link>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => { logout(); navigate('/admin/login'); }}
            >
              Sign Out (mock)
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <div className="admin-top-inner">
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.16em', color: '#5c6672' }}>GODRIVE OWNER CONSOLE</div>
              <h1>{title}</h1>
            </div>
            <span className="demo-tag" style={{ marginLeft: 'auto' }}>Demo data — local only</span>
          </div>
        </div>
        <nav className="admin-mobile-nav" aria-label="Admin mobile">
          {ADMIN_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}{n.to === '/admin/bookings' && pending > 0 ? ` (${pending})` : ''}
            </NavLink>
          ))}
        </nav>
        <div className="admin-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
