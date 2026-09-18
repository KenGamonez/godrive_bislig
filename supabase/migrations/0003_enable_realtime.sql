-- Reference copy of applied migration "godrive_enable_realtime".
-- Minimal Realtime enablement for availability sync.
-- RLS still governs every event: anonymous sockets receive only rows
-- covered by anon SELECT policies (vehicles, business_settings).
-- No policy or schema change here.
alter publication supabase_realtime add table
  public.vehicles,
  public.bookings,
  public.booking_payments,
  public.contact_messages,
  public.availability_overrides,
  public.business_settings;
