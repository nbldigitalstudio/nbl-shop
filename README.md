# NBL Shop

Multi-tenant ecommerce SaaS built with Next.js, Supabase and Stripe Connect.

## Local setup

1. Copy `.env.example` to `.env.local` and configure every value.
2. Apply the SQL migrations in `supabase/migrations`.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000`.

## Official plans

- Basic: $10 monthly or $100 yearly, 500 products, 5% application fee.
- Pro: $30 monthly or $250 yearly, unlimited products, 2% application fee.

The billing status never disables dashboard access, storefronts or checkout.

## Production

Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS deployment URL without a trailing slash. Configure the same URL in Supabase Auth and use it for every Stripe return, Checkout and webhook endpoint.

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) before launch.
