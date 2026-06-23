# NBL Shop

Multi-tenant ecommerce SaaS built with Next.js, Supabase and Stripe Connect.

## Local setup

1. Copy `.env.example` to `.env.local` and configure every value.
2. Apply the SQL migrations in `supabase/migrations`.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000`.

## Official plans

- Basic: $10 monthly or $100 yearly, 500 products, no NBL Shop sales commission.
- Pro: $30 monthly or $250 yearly, unlimited products, no NBL Shop sales commission.

Customers pay only their monthly or yearly plan. NBL Shop does not charge a commission on sales; Stripe applies only its standard payment processing fees.

The billing status never disables dashboard access, storefronts or checkout.

## Shipping

Checkout charges simple shipping tiers: $7 for subtotals up to $49.99, $9 for $50-$99.99, and $15 for $100+. Orders can be exported as CSV for Pirate Ship import; NBL Shop does not use private or unofficial Pirate Ship APIs.

## Transactional emails

NBL Shop can send basic transactional emails through Resend. Configure `RESEND_API_KEY`, `EMAIL_FROM`, and optionally `EMAIL_REPLY_TO`. If `RESEND_API_KEY` is missing, email delivery is skipped safely and checkout/dashboard flows continue working.

Current email triggers:

- Store invitation.
- Order received.
- New order notification for the store owner.
- Order shipped with tracking.
- Subscription created.
- Subscription renewed.
- Payment failed.

## Production

Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS deployment URL without a trailing slash. Configure the same URL in Supabase Auth and use it for every Stripe return, Checkout and webhook endpoint.

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) before launch.
