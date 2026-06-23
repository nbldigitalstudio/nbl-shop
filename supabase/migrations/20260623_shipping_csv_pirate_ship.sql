alter table public.orders
add column if not exists subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
add column if not exists shipping_amount_cents integer not null default 0 check (shipping_amount_cents >= 0);

update public.orders
set subtotal_cents = amount_total_cents
where subtotal_cents = 0
  and amount_total_cents > 0;

create index if not exists orders_shipping_status_created_at_idx
on public.orders (store_id, shipping_status, created_at desc);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  provider text not null default 'pirate_ship_csv',
  status text not null default 'pending',
  carrier text,
  service text,
  tracking_number text,
  label_url text,
  label_pdf_url text,
  rate_cents integer not null default 0 check (rate_cents >= 0),
  currency text not null default 'usd',
  shipped_at timestamptz,
  cancelled_at timestamptz,
  raw_provider_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipment_packages (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  weight_oz numeric not null default 8 check (weight_oz > 0),
  length numeric not null default 8 check (length > 0),
  width numeric not null default 6 check (width > 0),
  height numeric not null default 2 check (height > 0),
  package_type text not null default 'box',
  created_at timestamptz not null default now()
);

create index if not exists shipments_order_id_idx
on public.shipments (order_id);

create index if not exists shipments_store_id_status_idx
on public.shipments (store_id, status, created_at desc);

create index if not exists shipment_packages_shipment_id_idx
on public.shipment_packages (shipment_id);

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at before update on public.shipments
for each row execute function public.set_updated_at();

alter table public.shipments enable row level security;
alter table public.shipment_packages enable row level security;

drop policy if exists "Assigned users can read shipments" on public.shipments;
create policy "Assigned users can read shipments"
on public.shipments for select
using (public.user_has_store_access(store_id));

drop policy if exists "Assigned users can read shipment packages" on public.shipment_packages;
create policy "Assigned users can read shipment packages"
on public.shipment_packages for select
using (
  exists (
    select 1
    from public.shipments
    where shipments.id = shipment_packages.shipment_id
      and public.user_has_store_access(shipments.store_id)
  )
);
