create extension if not exists "pgcrypto";

create type order_status as enum ('pending', 'paid', 'fulfilled', 'refunded');
create type subscription_plan as enum ('basic', 'pro');
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
  category text,
  owner_name text,
  owner_email text,
  owner_phone text,
  stripe_account_id text unique,
  stripe_charges_enabled boolean not null default false,
  stripe_payouts_enabled boolean not null default false,
  stripe_details_submitted boolean not null default false,
  plan text not null default 'basic' check (plan in ('basic', 'pro')),
  billing_status text not null default 'unpaid',
  billing_grace_until timestamptz,
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  theme_settings jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  contact_info jsonb not null default '{}'::jsonb,
  categories text[] not null default '{}'::text[],
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
  payment_status text not null default 'unpaid',
  shipping_name text,
  shipping_address text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text,
  shipping_status text not null default 'pending',
  tracking_number text,
  shipping_carrier text,
  shipping_service text,
  shipping_label_url text,
  shipped_at timestamptz,
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
  store_id uuid references public.stores(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('basic', 'pro')),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_invitations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  email text not null,
  role store_role not null default 'staff',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (store_id, email)
);

create table public.billing_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('grace', 'loyalty')),
  stripe_promotion_code_id text,
  percent_off numeric(5,2),
  grace_days integer not null default 15 check (grace_days between 1 and 90),
  active boolean not null default true,
  expires_at timestamptz,
  max_redemptions integer,
  redemption_count integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.billing_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  billing_code_id uuid not null references public.billing_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  grace_until timestamptz,
  redeemed_at timestamptz not null default now(),
  unique (billing_code_id, store_id)
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

create or replace function public.user_has_store_access(target_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stores where id = target_store_id and owner_id = auth.uid())
  or exists (select 1 from public.store_members where store_id = target_store_id and user_id = auth.uid());
$$;

create or replace function public.user_can_manage_store(target_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stores where id = target_store_id and owner_id = auth.uid())
  or exists (select 1 from public.store_members where store_id = target_store_id and user_id = auth.uid() and role in ('owner', 'admin'));
$$;

create or replace function public.shares_store_with_user(target_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.store_members mine
    join public.store_members theirs on theirs.store_id = mine.store_id
    where mine.user_id = auth.uid() and theirs.user_id = target_user_id
  );
$$;

create or replace function public.accept_my_store_invitations()
returns integer language plpgsql security definer set search_path = public as $$
declare accepted_count integer; current_email text;
begin
  select lower(email) into current_email from auth.users where id = auth.uid();
  if current_email is null then return 0; end if;
  insert into public.store_members (store_id, user_id, role)
  select store_id, auth.uid(), role from public.store_invitations
  where lower(email) = current_email and status = 'pending'
  on conflict (store_id, user_id) do update set role = excluded.role;
  update public.store_invitations set status = 'accepted', accepted_at = now()
  where lower(email) = current_email and status = 'pending';
  get diagnostics accepted_count = row_count;
  return accepted_count;
end;
$$;

grant execute on function public.accept_my_store_invitations() to authenticated;

create index stores_owner_id_idx on public.stores(owner_id);
create index stores_slug_idx on public.stores(slug);
create index stores_owner_email_idx on public.stores(lower(owner_email));
create index store_members_user_id_idx on public.store_members(user_id);
create index store_members_store_id_idx on public.store_members(store_id);
create index products_store_id_idx on public.products(store_id);
create index products_active_stock_idx on public.products(store_id, active, stock);
create index orders_store_id_created_at_idx on public.orders(store_id, created_at desc);
create index orders_shipping_carrier_idx on public.orders(store_id, shipping_carrier, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_store_id_idx on public.subscriptions(store_id, created_at desc);
create index store_invitations_email_idx on public.store_invitations(lower(email), status);
create index billing_code_redemptions_store_idx on public.billing_code_redemptions(store_id);

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.store_invitations enable row level security;
alter table public.billing_codes enable row level security;
alter table public.billing_code_redemptions enable row level security;

create policy "Users can read their profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Store teammates can read profiles"
on public.profiles for select
using (id = auth.uid() or public.shares_store_with_user(id));

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

create policy "Store managers can update stores"
on public.stores for update
using (public.user_can_manage_store(id))
with check (public.user_can_manage_store(id));

create policy "Store owners can delete stores"
on public.stores for delete
using (auth.uid() = owner_id);

create policy "Assigned users can read memberships"
on public.store_members for select
using (user_id = auth.uid() or public.user_can_manage_store(store_id));

create policy "Store managers can manage memberships"
on public.store_members for all
using (public.user_can_manage_store(store_id))
with check (public.user_can_manage_store(store_id));

create policy "Public and members can read products"
on public.products for select
using (active = true or public.user_has_store_access(store_id));

create policy "Store managers can manage products"
on public.products for all
using (public.user_can_manage_store(store_id))
with check (public.user_can_manage_store(store_id));

create policy "Assigned users can read orders"
on public.orders for select
using (public.user_has_store_access(store_id));

create policy "Assigned users can read order items"
on public.order_items for select
using (exists (
  select 1 from public.orders where orders.id = order_items.order_id
  and public.user_has_store_access(orders.store_id)
));

create policy "Users can read store subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id or (store_id is not null and public.user_has_store_access(store_id)));

create policy "Store managers can manage invitations"
on public.store_invitations for all
using (public.user_can_manage_store(store_id))
with check (public.user_can_manage_store(store_id));

create policy "Users can read redeemed billing codes"
on public.billing_code_redemptions for select
using (user_id = auth.uid() or public.user_can_manage_store(store_id));

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
