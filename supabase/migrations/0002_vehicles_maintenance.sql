-- Reference copy of applied migration "godrive_vehicles_maintenance".
alter table public.vehicles
  add column maintenance text not null default 'Good'
  check (maintenance in ('Good', 'Scheduled', 'In Shop'));
