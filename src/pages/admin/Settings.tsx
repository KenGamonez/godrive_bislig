import { useState } from 'react';
import { useAppStore } from '../../store/AppStore';

export function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <>
      <span className="demo-tag">Demo settings — edits update local state only. A future backend will own these values.</span>
      {saved && <div className="note-box">Settings updated locally in this browser.</div>}

      <div className="panel panel-pad">
        <h3 className="h-sub">Business information</h3>
        <div className="form-grid two mt-24">
          <div className="field">
            <label htmlFor="s-name">Business name</label>
            <input id="s-name" value={settings.businessName} onChange={(e) => updateSettings({ businessName: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="s-tag">Tagline</label>
            <input id="s-tag" value={settings.tagline} onChange={(e) => updateSettings({ tagline: e.target.value })} />
          </div>
        </div>
        <div className="form-grid two mt-16">
          <div className="field">
            <label htmlFor="s-contact">Contact person</label>
            <input id="s-contact" value={settings.contactPerson} onChange={(e) => updateSettings({ contactPerson: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="s-phone">Mobile</label>
            <input id="s-phone" value={settings.phone} onChange={(e) => updateSettings({ phone: e.target.value })} />
          </div>
        </div>
        <div className="form-grid two mt-16">
          <div className="field">
            <label htmlFor="s-pickup">Pickup / service area</label>
            <input id="s-pickup" value={settings.pickup} onChange={(e) => updateSettings({ pickup: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="s-fb">Facebook URL</label>
            <input id="s-fb" value={settings.facebookUrl} onChange={(e) => updateSettings({ facebookUrl: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="panel panel-pad">
        <h3 className="h-sub">Self-drive rates (₱ / day)</h3>
        <p className="small mt-16">Zone rates feed the public Rates page and the booking estimator.</p>
        <div className="form-grid two mt-24">
          {settings.selfDriveRates.map((r, i) => (
            <div className="field" key={r.zone}>
              <label htmlFor={`sd-${r.zone}`}>{r.label}</label>
              <input
                id={`sd-${r.zone}`} inputMode="numeric" value={r.amountPerDay}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                  const next = settings.selfDriveRates.map((x, j) =>
                    j === i ? { ...x, amountPerDay: Number.isFinite(v) ? v : 0 } : x,
                  );
                  updateSettings({ selfDriveRates: next });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="panel panel-pad">
        <h3 className="h-sub">With-driver rates</h3>
        <p className="small mt-16">Amounts are displayed exactly as entered. The unit stays configurable until the backend owns it.</p>
        <div className="form-grid two mt-24">
          {settings.withDriverRates.map((r, i) => (
            <div className="field" key={r.zone}>
              <label htmlFor={`wd-${r.zone}`}>{r.label} (₱)</label>
              <input
                id={`wd-${r.zone}`} inputMode="numeric" value={r.amount}
                onChange={(e) => {
                  const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                  const next = settings.withDriverRates.map((x, j) =>
                    j === i ? { ...x, amount: Number.isFinite(v) ? v : 0 } : x,
                  );
                  updateSettings({ withDriverRates: next });
                }}
              />
            </div>
          ))}
        </div>
        <div className="field mt-16">
          <label htmlFor="s-unit">With-driver rate unit note</label>
          <textarea id="s-unit" value={settings.withDriverRateUnitNote} onChange={(e) => updateSettings({ withDriverRateUnitNote: e.target.value })} />
        </div>
        <div className="field mt-16">
          <label htmlFor="s-driver">Driver expense note</label>
          <input id="s-driver" value={settings.driverExpenseNote} onChange={(e) => updateSettings({ driverExpenseNote: e.target.value })} />
        </div>
      </div>

      <div className="panel panel-pad">
        <h3 className="h-sub">Booking settings</h3>
        <div className="field mt-24">
          <label htmlFor="s-notice">Booking confirmation notice</label>
          <textarea id="s-notice" value={settings.bookingNotice} onChange={(e) => updateSettings({ bookingNotice: e.target.value })} />
        </div>
        <div className="action-row">
          <button className="btn btn-primary" onClick={save}>Save Settings (local)</button>
        </div>
      </div>
    </>
  );
}
