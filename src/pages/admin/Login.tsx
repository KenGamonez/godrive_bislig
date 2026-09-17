import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BUSINESS } from '../../data/business';
import { useAppStore } from '../../store/AppStore';
import { VehicleArt, BrandLogo } from '../../components/site';

export function AdminLoginPage() {
  const { login } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('owner@godrive-bislig.local');
  const [password, setPassword] = useState('demo-owner');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/admin');
  };

  return (
    <div className="login-wrap">
      <div className="login-brand">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }} aria-label="GoDrive — home">
          <BrandLogo onDark />
        </Link>
        <div>
          <span className="eyebrow on-dark">Bislig · Owner access</span>
          <h1 className="mt-16" style={{ fontSize: 'clamp(30px, 4vw, 48px)', textTransform: 'uppercase' }}>
            Run the business from one screen.
          </h1>
          <p className="mt-16" style={{ color: '#c3cfe3', maxWidth: 440 }}>
            Bookings, fleet, customers, availability, and reports — the full
            GoDrive operation in a single console.
          </p>
          <div style={{ marginTop: 32, maxWidth: 420 }}><VehicleArt silhouette="mpv" tone="dark" title="GoDrive MPV" /></div>
        </div>
        <p style={{ fontSize: 13, color: '#8fa3c8' }}>© 2026 {BUSINESS.name}</p>
      </div>
      <div className="login-form-col">
        <form className="login-card" onSubmit={submit}>
          <span className="eyebrow">Owner sign in</span>
          <h2 className="h-sub">Welcome back.</h2>
          <div className="note-box warn">
            <b>Local demo sign-in.</b> Authentication is mocked in this frontend
            build — any credentials continue. Do not treat this as secure.
          </div>
          <div className="field">
            <label htmlFor="a-email">Email</label>
            <input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="a-pass">Password</label>
            <input id="a-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-block" type="submit">Sign In (Demo)</button>
          <Link to="/" className="btn btn-outline-danger btn-block">← Back to website</Link>
        </form>
      </div>
    </div>
  );
}
