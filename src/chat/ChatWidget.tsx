import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../store/AppStore';
import type { Conversation } from './chatTypes';
import {
  getOwnConversation,
  getVisitorToken,
  markRead,
  messagesFor,
  sendMessage,
  startConversation,
  timeAgo,
  unreadFor,
  useChatPoll,
  useChatState,
} from './chatStore';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [ref, setRef] = useState('');
  const [draft, setDraft] = useState('');
  const [badRef, setBadRef] = useState(false);
  const { bookings } = useAppStore();

  const token = useMemo(() => getVisitorToken(), []);
  const actor = useMemo(() => ({ role: 'visitor' as const, token }), [token]);

  useChatState();
  useChatPoll(open, 2500);

  const conv: Conversation | null = getOwnConversation(token);
  const messages = conv ? messagesFor(actor, conv.id) : [];
  const unread = conv ? unreadFor(actor, conv) : 0;

  useEffect(() => {
    if (open && conv && unread > 0) markRead(actor, conv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conv?.id, unread > 0]);

  const begin = () => {
    const cleanRef = ref.trim().toUpperCase();
    const match = cleanRef
      ? bookings.find((b) => b.reference.toUpperCase() === cleanRef)
      : undefined;
    setBadRef(cleanRef.length > 0 && !match);
    const thread = startConversation(token, name.trim() || 'Visitor', match ? match.id : null);
    if (draft.trim()) {
      sendMessage(actor, thread.id, draft);
      setDraft('');
    }
  };

  const send = () => {
    if (!conv || !draft.trim()) return;
    sendMessage(actor, conv.id, draft);
    setDraft('');
  };

  return (
    <div className="chatdock">
      {open && (
        <div className="chatpanel" role="dialog" aria-label="Chat with GoDrive">
          <div className="chatpanel-head">
            <div>
              <b>Chat with GoDrive</b>
              <small>Bislig · replies here, no account needed</small>
            </div>
            <button className="modal-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          {!conv ? (
            <div className="chatpanel-body">
              <p className="small">Say hello — the owner replies in this same window.</p>
              <div className="field mt-16">
                <label htmlFor="chat-name">Your name</label>
                <input
                  id="chat-name"
                  type="text"
                  placeholder="e.g. Juan D. Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="field mt-16">
                <label htmlFor="chat-ref">Booking reference <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input
                  id="chat-ref"
                  type="text"
                  placeholder="e.g. GD-XXXXXX"
                  value={ref}
                  onChange={(e) => {
                    setRef(e.target.value);
                    setBadRef(false);
                  }}
                />
                {badRef && (
                  <span className="field-error">No booking with that reference on this device — message still sent.</span>
                )}
              </div>
              <div className="field mt-16">
                <label htmlFor="chat-first">Message</label>
                <textarea
                  id="chat-first"
                  placeholder="Hi! Is the Xpander available this weekend?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={1000}
                />
              </div>
              <button className="btn btn-primary btn-block mt-16" onClick={begin} disabled={!draft.trim()}>
                Start chat <span className="arr" aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <>
              <div className="chatthread">
                {messages.length === 0 && (
                  <p className="small" style={{ textAlign: 'center' }}>No messages yet.</p>
                )}
                {[...messages].reverse().map((m) => (
                  <div key={m.id} className={`chatmsg ${m.sender === 'visitor' ? 'me' : 'them'}`}>
                    <p>{m.body}</p>
                    <small>{m.sender === 'owner' ? 'GoDrive' : 'You'} · {timeAgo(m.createdAt)}</small>
                  </div>
                ))}
              </div>
              <form
                className="chatinput"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={1000}
                  aria-label="Type a message"
                />
                <button className="btn btn-primary btn-sm" type="submit" disabled={!draft.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
      <button
        className="chatfab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 5h16v10H9.5L4 19V5z"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <path
            d="M8 9h8M8 12h5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </svg>
        {!open && unread > 0 && <i className="chatping" aria-label={`${unread} new replies`} />}
      </button>
    </div>
  );
}
