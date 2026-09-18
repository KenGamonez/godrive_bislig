import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SiteHeader, SiteFooter, BrandLogo } from '../components/site';
import { FloatingDock } from '../chat/FloatingDock';
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
      <FloatingDock />
    </>
  );
}

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/availability', label: 'Calendar' },
  { to: '/admin/fleet', label: 'Vehicles' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/settings', label: 'Settings' },
];

export function AdminLayout() {
  const { session, logout, bookings, unreadMessages, cloud } = useAppStore();
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
            <p className="small mt-16">The management dashboard is restricted to the GoDrive owner account. Continue to the owner sign-in.</p>
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
          <Link to="/" className="brand" style={{ textDecoration: 'none' }} aria-label="GoDrive — home">
            <BrandLogo onDark />
          </Link>
          <span className="demo-tag mt-16" style={{ background: cloud ? 'rgba(61,220,132,0.12)' : 'transparent', color: cloud ? '#7ee2a8' : '#8fa3c8', borderColor: 'rgba(255,255,255,0.2)' }}>
            {cloud ? 'Live database connected' : 'Demo data — local only'}
          </span>
          <nav className="admin-nav" aria-label="Admin">
            {ADMIN_NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span>{n.label}</span>
                {n.to === '/admin/bookings' && pending > 0 && <span className="admin-count">{pending}</span>}
                {n.to === '/admin/messages' && unreadMessages > 0 && <span className="admin-count">{unreadMessages}</span>}
              </NavLink>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', display: 'grid', gap: 10 }}>
            <Link to="/" style={{ color: '#8fa3c8', fontSize: 13.5, textDecoration: 'none' }}>← View public website</Link>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => { logout(); navigate('/admin/login'); }}
            >
              Sign Out
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
            <span className="demo-tag" style={{ marginLeft: 'auto' }}>{cloud ? 'Live database' : 'Demo data — local only'}</span>
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
