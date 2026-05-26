# NBL Shop

NBL Shop is a multi-tenant SaaS ecommerce platform built with Next.js, Supabase, PostgreSQL, Tailwind, and Stripe Connect.

## What is included

- Store tenants with public URLs at `/store/{slug}`
- Store builder with name, logo upload, banner upload, theme color, and description
- Product create, edit, delete, stock, pricing, images, and active status
- Seller CRUD APIs for `/api/store`, `/api/products`, and `/api/products/{id}`
- Public storefront product grid with Stripe Checkout buy buttons
- Stripe Connect Express onboarding so seller payouts go directly to the seller
- Stripe Connect return, refresh, dashboard login, and account status sync
- Optional platform application fee, configured by `STRIPE_PLATFORM_FEE_PERCENT`
- Subscription checkout for Starter, Business, and Pro plans
- Stripe promotion code entry and validation for subscription checkout
- Founder access role for the configured founder email, with unlimited features and no subscription checkout
- Dashboard analytics, products, orders, revenue, and inventory views
- Supabase PostgreSQL schema with row-level security and storage policies

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase and Stripe keys.
2. Run `supabase/schema.sql` in your Supabase SQL editor.
3. Create Stripe recurring prices for the three plans and add their price IDs to `.env.local`.
4. Configure the Stripe webhook endpoint at `/api/webhooks/stripe`.
   Subscribe to `account.updated`, `checkout.session.completed`, and subscription lifecycle events.
5. For Apple Pay, verify your domain in Stripe. Stripe Checkout will present Apple Pay automatically where supported.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Seller API

- `GET /api/store` returns the authenticated seller's store.
- `PUT /api/store` creates or updates the authenticated seller's store.
- `GET /api/products` lists products for the authenticated seller's store.
- `POST /api/products` creates a product.
- `PUT /api/products/{id}` updates a product in the seller's store.
- `DELETE /api/products/{id}` deletes a product in the seller's store.
- `GET /api/subscriptions?plan=starter&promoCode=CODE` validates a Stripe promotion code or coupon, passes `promotion_code` or `coupon` to subscription Checkout, keeps Starter's 60-day trial, and returns `Invalid promo code` when invalid.

## Founder Access

The founder account is controlled in `lib/access.ts`. The email `your email here` receives unlimited access, bypasses product limits, and is redirected away from paid subscription checkout.
