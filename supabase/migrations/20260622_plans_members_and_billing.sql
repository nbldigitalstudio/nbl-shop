-- Official plans are Basic and Pro. Billing status never controls store access.
alter table public.stores
add column if not exists plan text not null default 'basic',
add column if not exists billing_status text not null default 'unpaid',
add column if not exists billing_grace_until timestamptz;

update public.stores set plan = 'basic' where plan not in ('basic', 'pro');

alter table public.stores drop constraint if exists stores_plan_check;
alter table public.stores add constraint stores_plan_check check (plan in ('basic', 'pro'));

alter table public.subscriptions alter column plan drop default;
alter table public.subscriptions alter column plan type text
using (case when plan::text = 'pro' then 'pro' else 'basic' end);
alter table public.subscriptions
add column if not exists store_id uuid references public.stores(id) on delete cascade,
add column if not exists billing_interval text not null default 'month';
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check check (plan in ('basic', 'pro'));
alter table public.subscriptions drop constraint if exists subscriptions_billing_interval_check;
alter table public.subscriptions add constraint subscriptions_billing_interval_check check (billing_interval in ('month', 'year'));

create table if not exists public.store_invitations (
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

create table if not exists public.billing_codes (
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

create table if not exists public.billing_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  billing_code_id uuid not null references public.billing_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  grace_until timestamptz,
  redeemed_at timestamptz not null default now(),
  unique (billing_code_id, store_id)
);

insert into public.store_members (store_id, user_id, role)
select id, owner_id, 'owner'::store_role from public.stores
on conflict (store_id, user_id) do update set role = 'owner';

create or replace function public.user_has_store_access(target_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.stores s where s.id = target_store_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.store_members sm where sm.store_id = target_store_id and sm.user_id = auth.uid()
  );
$$;

create or replace function public.user_can_manage_store(target_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.stores s where s.id = target_store_id and s.owner_id = auth.uid()
  ) or exists (
    select 1 from public.store_members sm
    where sm.store_id = target_store_id and sm.user_id = auth.uid() and sm.role in ('owner', 'admin')
  );
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
declare
  accepted_count integer;
  current_email text;
begin
  select lower(email) into current_email from auth.users where id = auth.uid();
  if current_email is null then return 0; end if;

  insert into public.store_members (store_id, user_id, role)
  select invitation.store_id, auth.uid(), invitation.role
  from public.store_invitations invitation
  where lower(invitation.email) = current_email and invitation.status = 'pending'
  on conflict (store_id, user_id) do update set role = excluded.role;

  update public.store_invitations
  set status = 'accepted', accepted_at = now()
  where lower(email) = current_email and status = 'pending';
  get diagnostics accepted_count = row_count;
  return accepted_count;
end;
$$;

grant execute on function public.accept_my_store_invitations() to authenticated;

create index if not exists store_invitations_email_idx on public.store_invitations (lower(email), status);
create index if not exists subscriptions_store_id_idx on public.subscriptions (store_id, created_at desc);
create index if not exists billing_code_redemptions_store_idx on public.billing_code_redemptions (store_id);

alter table public.store_invitations enable row level security;
alter table public.billing_codes enable row level security;
alter table public.billing_code_redemptions enable row level security;

drop policy if exists "Store teammates can read profiles" on public.profiles;
create policy "Store teammates can read profiles" on public.profiles for select
using (id = auth.uid() or public.shares_store_with_user(id));

drop policy if exists "Owners can update their stores" on public.stores;
drop policy if exists "Owners can delete their stores" on public.stores;
drop policy if exists "Store managers can update stores" on public.stores;
drop policy if exists "Store owners can delete stores" on public.stores;
create policy "Store managers can update stores" on public.stores for update
using (public.user_can_manage_store(id)) with check (public.user_can_manage_store(id));
create policy "Store owners can delete stores" on public.stores for delete
using (owner_id = auth.uid());

drop policy if exists "Store members can read memberships" on public.store_members;
drop policy if exists "Owners can manage memberships" on public.store_members;
drop policy if exists "Assigned users can read memberships" on public.store_members;
drop policy if exists "Store managers can manage memberships" on public.store_members;
create policy "Assigned users can read memberships" on public.store_members for select
using (user_id = auth.uid() or public.user_can_manage_store(store_id));
create policy "Store managers can manage memberships" on public.store_members for all
using (public.user_can_manage_store(store_id)) with check (public.user_can_manage_store(store_id));

drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Owners can manage products" on public.products;
drop policy if exists "Public and members can read products" on public.products;
drop policy if exists "Store managers can manage products" on public.products;
create policy "Public and members can read products" on public.products for select
using (active = true or public.user_has_store_access(store_id));
create policy "Store managers can manage products" on public.products for all
using (public.user_can_manage_store(store_id)) with check (public.user_can_manage_store(store_id));

drop policy if exists "Owners can read orders" on public.orders;
drop policy if exists "Owners can read order items" on public.order_items;
drop policy if exists "Assigned users can read orders" on public.orders;
drop policy if exists "Assigned users can read order items" on public.order_items;
create policy "Assigned users can read orders" on public.orders for select
using (public.user_has_store_access(store_id));
create policy "Assigned users can read order items" on public.order_items for select
using (exists (select 1 from public.orders o where o.id = order_id and public.user_has_store_access(o.store_id)));

drop policy if exists "Store managers can manage invitations" on public.store_invitations;
create policy "Store managers can manage invitations" on public.store_invitations for all
using (public.user_can_manage_store(store_id)) with check (public.user_can_manage_store(store_id));
drop policy if exists "Users can read redeemed billing codes" on public.billing_code_redemptions;
create policy "Users can read redeemed billing codes" on public.billing_code_redemptions for select
using (user_id = auth.uid() or public.user_can_manage_store(store_id));

drop policy if exists "Users can read their subscriptions" on public.subscriptions;
drop policy if exists "Users can read store subscriptions" on public.subscriptions;
create policy "Users can read store subscriptions" on public.subscriptions for select
using (user_id = auth.uid() or (store_id is not null and public.user_has_store_access(store_id)));
