import { useMemo, useRef, useState } from 'react';
import type { ContactMessageStatus } from '../../types';
import { StatusBadge } from '../../components/site';
import { useAppStore } from '../../store/AppStore';
import { formatDateLong } from '../../utils/booking';

const FILTERS: Array<ContactMessageStatus | 'All' | 'Unread'> = ['All', 'Unread', 'read', 'replied', 'archived'];

function badgeFor(status: ContactMessageStatus): string {
  if (status === 'unread') return 'Pending';
  if (status === 'read') return 'Ongoing';
  if (status === 'replied') return 'Completed';
  return 'Cancelled';
}

export function MessagesPage() {
  const { messages, setMessageStatus, cloud } = useAppStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = [...messages].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (filter === 'All') return list;
    if (filter === 'Unread') return list.filter((m) => m.status === 'unread');
    return list.filter((m) => m.status === filter);
  }, [messages, filter]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const detailRef = useRef<HTMLDivElement>(null);

  const select = (id: string) => {
    setSelectedId(id);
    if (window.innerWidth < 720) {
      window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  };

  const act = async (id: string, s: ContactMessageStatus) => {
    setActionError(null);
    const err = await setMessageStatus(id, s);
    if (err) setActionError(`Could not update message (${err}). Try again.`);
  };

  return (
    <>
      <span className="demo-tag">
        {cloud
          ? `${messages.filter((m) => m.status === 'unread').length} unread message${messages.filter((m) => m.status === 'unread').length === 1 ? '' : 's'}.`
          : 'Owner inbox needs the backend connection — messages sent on this device appear once connected.'}
      </span>
      {actionError && <p className="field-error" role="alert">{actionError}</p>}
      <div className="chip-row">
        {FILTERS.map((f) => (
          <button key={f} className={`chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'All' ? 'All' : f === 'Unread' ? 'Unread' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="detail-grid">
        <div className="admin-cards" role="list" aria-label="Messages">
          {filtered.length === 0 && (
            <p className="mybooking-empty">No messages in this view.</p>
          )}
          {filtered.map((m) => (
            <article
              key={m.id}
              role="listitem"
              className={`acard${m.status === 'unread' ? ' acard-unread' : ''}`}
              onClick={() => select(m.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="acard-top">
                <b>{m.name}</b>
                <StatusBadge status={badgeFor(m.status)} />
              </div>
              <div className="acard-sub"><b style={{ color: 'var(--ink)' }}>{m.subject}</b></div>
              <div className="acard-sub">{m.message.length > 90 ? `${m.message.slice(0, 90)}…` : m.message}</div>
              <div className="acard-foot">
                <span className="small">{m.phone} · {formatDateLong(m.createdAt.slice(0, 10))}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="panel admin-table">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Sender</th><th>Subject</th><th>Message</th><th>Received</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ color: 'var(--muted)' }}>No messages in this view.</td></tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.id} className="clickable" onClick={() => select(m.id)}>
                    <td><b>{m.name}</b><div className="small">{m.phone}</div></td>
                    <td>{m.subject}</td>
                    <td className="small">{m.message.length > 72 ? `${m.message.slice(0, 72)}…` : m.message}</td>
                    <td className="small">{formatDateLong(m.createdAt.slice(0, 10))}</td>
                    <td><StatusBadge status={badgeFor(m.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div ref={detailRef} className="panel panel-pad" style={{ alignSelf: 'start' }}>
          {!selected ? (
            <>
              <h3 className="h-sub">Message detail</h3>
              <p className="small mt-16">Select a message to read it and update its status.</p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <h3 className="h-sub">{selected.subject}</h3>
                <StatusBadge status={badgeFor(selected.status)} />
              </div>
              <div className="mt-16">
                <div className="kv"><span>From</span><b>{selected.name}</b></div>
                <div className="kv"><span>Mobile</span><b>{selected.phone}</b></div>
                {selected.email && <div className="kv"><span>Email</span><b>{selected.email}</b></div>}
                <div className="kv"><span>Received</span><b>{formatDateLong(selected.createdAt.slice(0, 10))}</b></div>
              </div>
              <p className="mt-16" style={{ fontSize: 15, lineHeight: 1.7 }}>{selected.message}</p>
              <div className="action-row">
                <a className="btn btn-primary btn-sm" href={`tel:+63${selected.phone.replace(/^0/, '').replace(/[^0-9]/g, '')}`}>
                  Call {selected.phone}
                </a>
                {selected.status === 'unread' && (
                  <button className="btn btn-outline btn-sm" onClick={() => void act(selected.id, 'read')}>Mark read</button>
                )}
                {selected.status !== 'replied' && (
                  <button className="btn btn-outline btn-sm" onClick={() => void act(selected.id, 'replied')}>Mark replied</button>
                )}
                {selected.status !== 'archived' && (
                  <button className="btn btn-outline-danger btn-sm" onClick={() => void act(selected.id, 'archived')}>Archive</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
