import { useMemo, useState } from 'react';
import { StatusBadge } from '../components/site';
import type { ChatActor } from './chatTypes';
import {
  listConversations,
  markRead,
  messagesFor,
  sendMessage,
  timeAgo,
  totalUnread,
  unreadFor,
  useChatPoll,
  useChatState,
} from './chatStore';

const OWNER: ChatActor = { role: 'owner' };

/** Compact owner inbox. Rendered only behind the /admin session gate. */
export function OwnerMessages() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useChatState();
  useChatPoll(true, 3000);

  const conversations = listConversations(OWNER);
  const unread = totalUnread(OWNER);
  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );
  const thread = active ? messagesFor(OWNER, active.id) : [];

  const open = (id: string) => {
    setActiveId(id);
    setDraft('');
    markRead(OWNER, id);
  };

  const reply = () => {
    if (!active || !draft.trim()) return;
    sendMessage(OWNER, active.id, draft);
    setDraft('');
    markRead(OWNER, active.id);
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Messages {unread > 0 && <span className="admin-count">{unread}</span>}</h3>
        {active && (
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveId(null)}>← All threads</button>
        )}
      </div>

      {!active && (
        conversations.length === 0 ? (
          <p style={{ padding: '20px 28px', color: 'var(--muted)' }}>
            No customer conversations yet. New chats from the website appear here.
          </p>
        ) : (
          <ul className="attention-list">
            {conversations.map((c) => {
              const latest = messagesFor(OWNER, c.id)[0];
              const n = unreadFor(OWNER, c);
              return (
                <li key={c.id}>
                  <button className="omsg-row" onClick={() => open(c.id)}>
                    <span className="attention-main">
                      <b>
                        {c.visitorName || 'Visitor'}
                        {n > 0 && <span className="admin-count" style={{ marginLeft: 8 }}>{n}</span>}
                      </b>
                      <small>
                        {latest ? latest.body.slice(0, 80) : 'No messages yet.'}
                        {' · '}{timeAgo(c.updatedAt)}
                        {c.bookingId ? ' · booking linked' : ''}
                      </small>
                    </span>
                    <span className="attention-actions" style={{ alignItems: 'center' }}>
                      <StatusBadge status={c.status === 'open' ? 'Ongoing' : 'Completed'} />
                      <span aria-hidden="true">→</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      )}

      {active && (
        <div style={{ padding: '20px 28px 24px', display: 'grid', gap: 14 }}>
          <div>
            <b style={{ fontSize: 15 }}>
              {active.visitorName || 'Visitor'}
              {active.bookingId && (
                <span className="small"> · booking {linkedRef(active.bookingId)}</span>
              )}
            </b>
            <div className="small">Started {timeAgo(active.createdAt)}</div>
          </div>
          <div className="chatthread owner">
            {thread.length === 0 && (
              <p className="small" style={{ textAlign: 'center' }}>No messages yet.</p>
            )}
            {[...thread].reverse().map((m) => (
              <div key={m.id} className={`chatmsg ${m.sender === 'owner' ? 'me' : 'them'}`}>
                <p>{m.body}</p>
                <small>{m.sender === 'owner' ? 'You' : active.visitorName || 'Visitor'} · {timeAgo(m.createdAt)}</small>
              </div>
            ))}
          </div>
          <form
            className="chatinput"
            onSubmit={(e) => {
              e.preventDefault();
              reply();
            }}
          >
            <input
              type="text"
              placeholder="Reply as GoDrive…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              aria-label="Reply to customer"
            />
            <button className="btn btn-primary btn-sm" type="submit" disabled={!draft.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function linkedRef(bookingId: string): string {
  try {
    const raw = localStorage.getItem('godrive.bookings.v1');
    if (!raw) return bookingId;
    const list = JSON.parse(raw) as Array<{ id?: string; reference?: string }>;
    const found = Array.isArray(list) ? list.find((b) => b.id === bookingId) : undefined;
    return found?.reference ?? 'linked';
  } catch {
    return 'linked';
  }
}
