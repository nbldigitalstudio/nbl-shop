# NBL Shop production checklist

Canonical production domain: `https://nbl-shop-app.vercel.app`.

## 1. Vercel environment variables

Add these variables to Production, Preview and Development where appropriate. Production secrets must come from the production Supabase and Stripe projects.

```env
NEXT_PUBLIC_APP_URL=https://nbl-shop-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_MONTHLY_PRICE_ID=price_1TPYzu1T4SMhAt1HGOUDOnBK
STRIPE_BASIC_YEARLY_PRICE_ID=price_1Tj3is1T4SMhAt1HjnFcZEtB
STRIPE_PRO_MONTHLY_PRICE_ID=price_1Tb9PR1T4SMhAt1HKEGWplPL
STRIPE_PRO_YEARLY_PRICE_ID=price_1Tj3l31T4SMhAt1HjP26JWjY
FOUNDER_EMAILS=nbldigitalstudio@gmail.com
RESEND_API_KEY=
EMAIL_FROM="NBL Shop <hello@nblshop.com>"
EMAIL_REPLY_TO=nbldigitalstudio@gmail.com
PIRATE_SHIP_DEFAULT_WEIGHT_OZ=8
PIRATE_SHIP_DEFAULT_LENGTH=8
PIRATE_SHIP_DEFAULT_WIDTH=6
PIRATE_SHIP_DEFAULT_HEIGHT=2
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` as `NEXT_PUBLIC_*` variables.

## 2. Supabase Auth

- Site URL: `https://nbl-shop-app.vercel.app`
- Redirect URL: `https://nbl-shop-app.vercel.app/auth/callback`
- Keep `http://localhost:3000/auth/callback` only for local development.
- Confirm Google OAuth also allows the Supabase callback URL displayed by Supabase.

## 3. Stripe webhook

- Endpoint: `https://nbl-shop-app.vercel.app/api/webhooks/stripe`
- Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel.
- Subscribe to:
  - `account.updated`
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

## 4. Deploy

- Redeploy after adding or changing environment variables.
- Confirm the production deployment uses the intended Git branch.
- Review Vercel Build Logs and Function Logs for errors.
- Confirm no production redirect points to `localhost`.

## 5. Production smoke tests

- Login with magic link.
- Login with Google.
- Open dashboard and assigned stores.
- Create a store with the Founder wizard.
- Complete Stripe Connect onboarding and confirm all three readiness flags.
- Create and manage a product.
- Complete a Checkout payment.
- Confirm the Stripe webhook returns HTTP 200.
- Confirm `orders`, `order_items`, payment status and inventory.
- Open the order in the Orders Dashboard.
- Confirm subtotal, shipping and total are correct.
- Export a Pirate Ship CSV from the order.
- Add manual tracking and mark the order as shipped.
- Open `/store/demo-boutique`.
- Confirm the landing button "Ver tienda demo" opens the demo store.
- If Resend is configured, confirm transactional emails are received.
- Confirm a late billing status displays a notice without blocking access or checkout.

## Deferred

- Delete-store workflow.
