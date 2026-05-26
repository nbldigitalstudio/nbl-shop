create extension if not exists "pgcrypto";

create type order_status as enum ('pending', 'paid', 'fulfilled', 'refunded');
create type subscription_plan as enum ('starter', 'business', 'pro');
create type store_role as enum ('owner', 'admin', 'staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  banner_url text,
  theme_color text not null default '#18a986',
  description text,
  stripe_account_id text unique,
  stripe_charges_enabled boolean not null default false,
  stripe_payouts_enabled boolean not null default false,
  stripe_details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stores_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint stores_theme_color_format check (theme_color ~ '^#[0-9A-Fa-f]{6}$')
);

create table public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role store_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 50),
  image_url text,
  description text,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  stripe_checkout_session_id text unique,
  customer_email text,
  amount_total_cents integer not null default 0 check (amount_total_cents >= 0),
  application_fee_cents integer not null default 0 check (application_fee_cents >= 0),
  status order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan subscription_plan not null,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stores_set_updated_at before update on public.stores
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function public.decrement_product_stock(product_id_input uuid, quantity_input integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set stock = greatest(stock - quantity_input, 0)
  where id = product_id_input;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.store_members (store_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (store_id, user_id) do update set role = 'owner';

  return new;
end;
$$;

create trigger stores_create_owner_membership
after insert on public.stores
for each row execute function public.create_owner_membership();

create index stores_owner_id_idx on public.stores(owner_id);
create index stores_slug_idx on public.stores(slug);
create index store_members_user_id_idx on public.store_members(user_id);
create index store_members_store_id_idx on public.store_members(store_id);
create index products_store_id_idx on public.products(store_id);
create index products_active_stock_idx on public.products(store_id, active, stock);
create index orders_store_id_created_at_idx on public.orders(store_id, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users can read their profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can read published stores"
on public.stores for select
using (true);

create policy "Users can create their own stores"
on public.stores for insert
with check (auth.uid() = owner_id);

create policy "Owners can update their stores"
on public.stores for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners can delete their stores"
on public.stores for delete
using (auth.uid() = owner_id);

create policy "Store members can read memberships"
on public.store_members for select
using (user_id = auth.uid() or exists (
  select 1
  from public.stores
  where stores.id = store_members.store_id
  and stores.owner_id = auth.uid()
));

create policy "Owners can manage memberships"
on public.store_members for all
using (exists (
  select 1
  from public.stores
  where stores.id = store_members.store_id
  and stores.owner_id = auth.uid()
))
with check (exists (
  select 1
  from public.stores
  where stores.id = store_members.store_id
  and stores.owner_id = auth.uid()
));

create policy "Public can read active products"
on public.products for select
using (active = true or exists (
  select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()
));

create policy "Owners can manage products"
on public.products for all
using (exists (
  select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()
))
with check (exists (
  select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()
));

create policy "Owners can read orders"
on public.orders for select
using (exists (
  select 1 from public.stores where stores.id = orders.store_id and stores.owner_id = auth.uid()
));

create policy "Owners can read order items"
on public.order_items for select
using (exists (
  select 1
  from public.orders
  join public.stores on stores.id = orders.store_id
  where orders.id = order_items.order_id
  and stores.owner_id = auth.uid()
));

create policy "Users can read their subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload store assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'store-assets');

create policy "Public can view store assets"
on storage.objects for select
using (bucket_id = 'store-assets');
