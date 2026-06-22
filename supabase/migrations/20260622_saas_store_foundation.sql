-- Founder-led store creation, future theme builder and shipping provider fields.
alter table public.stores
add column if not exists category text,
add column if not exists owner_name text,
add column if not exists owner_email text,
add column if not exists owner_phone text,
add column if not exists billing_interval text not null default 'month',
add column if not exists theme_settings jsonb not null default '{}'::jsonb,
add column if not exists social_links jsonb not null default '{}'::jsonb,
add column if not exists contact_info jsonb not null default '{}'::jsonb,
add column if not exists categories text[] not null default '{}'::text[];

alter table public.stores drop constraint if exists stores_billing_interval_check;
alter table public.stores add constraint stores_billing_interval_check
check (billing_interval in ('month', 'year'));

alter table public.orders
add column if not exists shipping_carrier text,
add column if not exists shipping_service text,
add column if not exists shipping_label_url text,
add column if not exists shipped_at timestamptz;

create index if not exists stores_owner_email_idx on public.stores (lower(owner_email));
create index if not exists orders_shipping_carrier_idx on public.orders (store_id, shipping_carrier, created_at desc);
