import { useEffect, useSyncExternalStore } from 'react';
import type { ChatActor, ChatMessage, Conversation } from './chatTypes';

/**
 * Local chat repository. Same-browser persistence mirroring the rest of the
 * app (bookings, settings). Access rules enforced in code, mirroring the
 * intended Supabase RLS:
 * - a visitor actor may only touch the single conversation carrying its token;
 * - the owner actor (only ever constructed behind the /admin session gate)
 *   may list and reply to all threads.
 */

const STORE_KEY = 'godrive.chat.v1';
const TOKEN_KEY = 'godrive.chat.token.v1';

interface ChatState {
  conversations: Conversation[];
  messages: ChatMessage[];
}

function emptyState(): ChatState {
  return { conversations: [], messages: [] };
}

function readState(): ChatState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ChatState>;
    if (!Array.isArray(parsed.conversations) || !Array.isArray(parsed.messages)) {
      return emptyState();
    }
    return { conversations: parsed.conversations, messages: parsed.messages };
  } catch {
    return emptyState();
  }
}

function writeState(state: ChatState): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* best-effort */
  }
}

function uid(prefix: string): string {
  const buf = new Uint32Array(4);
  crypto.getRandomValues(buf);
  return `${prefix}-${Date.now().toString(36)}-${Array.from(buf, (n) => n.toString(36)).join('').slice(0, 8)}`;
}

/** This browser's visitor bearer token (created lazily, never leaves it). */
export function getVisitorToken(): string {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const buf = new Uint32Array(4);
      crypto.getRandomValues(buf);
      token = `vt-${Array.from(buf, (n) => n.toString(36)).join('')}`;
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return 'vt-memory';
  }
}

/* ---------- pub/sub (in-tab) + cross-tab sync ---------- */

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * useSyncExternalStore requires a CACHED snapshot: returning a fresh object
 * on every call makes React re-render in an infinite loop (blank page).
 * The cache refreshes only when the stored payload actually changes.
 */
let cachedState: ChatState | null = null;
let cachedJson = '';

function snapshot(): ChatState {
  if (!cachedState) {
    cachedState = readState();
    try {
      cachedJson = JSON.stringify(cachedState);
    } catch {
      cachedJson = '';
    }
  }
  return cachedState;
}

function emit(): void {
  const fresh = readState();
  let json = '';
  try {
    json = JSON.stringify(fresh);
  } catch {
    return;
  }
  if (json === cachedJson && cachedState) return;
  cachedJson = json;
  cachedState = fresh;
  for (const l of listeners) l();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY) emit();
  });
}

function mutate(fn: (s: ChatState) => ChatState): ChatState {
  const next = fn(snapshot());
  cachedState = next;
  try {
    cachedJson = JSON.stringify(next);
  } catch {
    cachedJson = '';
  }
  writeState(next);
  for (const l of listeners) l();
  return next;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useChatState(): ChatState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Lightweight polling fallback (no Realtime backend in this build). */
export function useChatPoll(active: boolean, intervalMs = 2500): void {
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => emit(), intervalMs);
    return () => window.clearInterval(t);
  }, [active, intervalMs]);
}

/* ---------- access-controlled repository ---------- */

function canRead(actor: ChatActor, c: Conversation): boolean {
  if (actor.role === 'owner') return true;
  return c.visitorToken === actor.token;
}

export function getOwnConversation(token: string): Conversation | null {
  const s = readState();
  return s.conversations.find((c) => c.visitorToken === token) ?? null;
}

export function getConversation(actor: ChatActor, id: string): Conversation | null {
  const s = readState();
  const c = s.conversations.find((x) => x.id === id) ?? null;
  if (!c || !canRead(actor, c)) return null;
  return c;
}

export function listConversations(actor: ChatActor): Conversation[] {
  if (actor.role !== 'owner') return [];
  return [...readState().conversations].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function messagesFor(actor: ChatActor, conversationId: string): ChatMessage[] {
  const c = getConversation(actor, conversationId);
  if (!c) return [];
  return readState()
    .messages.filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
}

export function startConversation(token: string, visitorName: string, bookingId: string | null): Conversation {
  const now = new Date().toISOString();
  let created: Conversation | null = null;
  mutate((s) => {
    const existing = s.conversations.find((c) => c.visitorToken === token);
    if (existing) {
      created = existing;
      return s;
    }
    created = {
      id: uid('conv'),
      visitorToken: token,
      visitorName: visitorName.trim().slice(0, 60),
      bookingId,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      lastReadVisitorAt: now,
      lastReadOwnerAt: '1970-01-01T00:00:00.000Z',
    };
    return { ...s, conversations: [created, ...s.conversations] };
  });
  if (!created) throw new Error('Unable to start conversation');
  return created;
}

export function sendMessage(actor: ChatActor, conversationId: string, body: string): ChatMessage | null {
  const text = body.trim().slice(0, 1000);
  if (!text) return null;
  const now = new Date().toISOString();
  let saved: ChatMessage | null = null;
  mutate((s) => {
    const c = s.conversations.find((x) => x.id === conversationId);
    if (!c || !canRead(actor, c) || c.status !== 'open') return s;
    saved = {
      id: uid('msg'),
      conversationId,
      sender: actor.role,
      body: text,
      createdAt: now,
    };
    return {
      conversations: s.conversations.map((x) =>
        x.id === conversationId ? { ...x, updatedAt: now } : x,
      ),
      messages: [...s.messages, saved],
    };
  });
  return saved;
}

export function markRead(actor: ChatActor, conversationId: string): void {
  const now = new Date().toISOString();
  mutate((s) => {
    const c = s.conversations.find((x) => x.id === conversationId);
    if (!c || !canRead(actor, c)) return s;
    return {
      ...s,
      conversations: s.conversations.map((x) =>
        x.id === conversationId
          ? {
              ...x,
              lastReadVisitorAt: actor.role === 'visitor' ? now : x.lastReadVisitorAt,
              lastReadOwnerAt: actor.role === 'owner' ? now : x.lastReadOwnerAt,
            }
          : x,
      ),
    };
  });
}

export function unreadFor(actor: ChatActor, c: Conversation): number {
  const cutoff = actor.role === 'owner' ? c.lastReadOwnerAt : c.lastReadVisitorAt;
  const other = actor.role === 'owner' ? 'visitor' : 'owner';
  return readState().messages.filter(
    (m) => m.conversationId === c.id && m.sender === other && m.createdAt > cutoff,
  ).length;
}

export function totalUnread(actor: ChatActor): number {
  if (actor.role !== 'owner') return 0;
  return listConversations(actor).reduce((n, c) => n + unreadFor(actor, c), 0);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}
