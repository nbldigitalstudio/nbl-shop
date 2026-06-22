alter table public.orders
add column if not exists payment_status text not null default 'unpaid',
add column if not exists shipping_name text,
add column if not exists shipping_address text,
add column if not exists shipping_city text,
add column if not exists shipping_state text,
add column if not exists shipping_zip text,
add column if not exists shipping_country text,
add column if not exists shipping_status text not null default 'pending',
add column if not exists tracking_number text;

create index if not exists orders_shipping_status_idx
on public.orders (store_id, shipping_status, created_at desc);
