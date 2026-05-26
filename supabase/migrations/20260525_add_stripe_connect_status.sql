alter table public.stores
add column if not exists stripe_payouts_enabled boolean not null default false,
add column if not exists stripe_details_submitted boolean not null default false;
