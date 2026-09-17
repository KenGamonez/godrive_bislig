/**
 * GoDrive chat domain — isolated from booking/fleet logic.
 *
 * FUTURE SUPABASE CUTOVER (not yet connected — no backend exists for this
 * app today). These shapes map 1:1 to the intended tables:
 *
 *   chat_conversations(id uuid pk, visitor_token_hash text, visitor_name text,
 *     booking_id text null, status text, created_at, updated_at,
 *     last_read_visitor_at, last_read_owner_at)
 *   chat_messages(id uuid pk, conversation_id uuid fk, sender text
 *     check (sender in ('visitor','owner')), body text, created_at)
 *
 * Intended RLS (to enforce on cutover):
 * - visitors (anon) may SELECT/INSERT only rows whose conversation carries
 *   their own token (via a signed per-conversation access key); never
 *   list conversations, never read other visitors' threads;
 * - owner (authenticated admin) may SELECT/INSERT/UPDATE all threads;
 * - Realtime publications mirror the same row filters.
 *
 * Until then the repository below persists to this browser only, using the
 * same access rules in code (see chatStore.ts).
 */

export type ChatSender = 'visitor' | 'owner';

export type ConversationStatus = 'open' | 'closed';

export interface Conversation {
  id: string;
  /** Random bearer token identifying the visitor's browser. Never displayed. */
  visitorToken: string;
  visitorName: string;
  /** Optional link to a real local booking reference (never invented). */
  bookingId: string | null;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  lastReadVisitorAt: string;
  lastReadOwnerAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatSender;
  body: string;
  createdAt: string;
}

export type ChatActor = { role: 'owner' } | { role: 'visitor'; token: string };
