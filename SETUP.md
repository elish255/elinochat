# ElinoChat setup

## 1. Database
Open Supabase SQL Editor and run `supabase/schema.sql`. All tables use the `elinochat_` prefix so existing shared tables are not changed.

## 2. Environment variables
Set the values from `.env.example` in the deployment environment. In particular:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIMIPAY_SECRET_KEY`
- `ELINOCHAT_PAYMENT_AMOUNT_TZS` (change the example amount to your real activation price)
- `ELINOCHAT_ADMIN_EMAIL` (optional)

Never put the service-role key or payment secret in a `VITE_` variable.

## 3. Admin
Create the admin's normal Supabase Auth user. Then either set `ELINOCHAT_ADMIN_EMAIL` to that email or insert the user's Auth UUID into `elinochat_admins` using the SQL comment at the bottom of `supabase/schema.sql`.

Open `/admin` to manage users.

## 4. Payment flow
Register -> Payment -> enter Tanzania mobile-money number -> `LIPA SASA` -> mobile USSD push -> customer enters PIN/Siri on their phone -> the app checks the order status -> when the provider reports `SUCCESS`, the profile is changed to `active` automatically.

The payment provider's brand/API name is intentionally not shown anywhere in the user-facing UI.

## 5. User controls
Admin can activate, deactivate, ban, unban (activate), send a notification to one user, or broadcast a notification to all users. Users see notifications in `/dashboard`.

## 6. Chat
Only active accounts can enter `/chat/:name`. Each foreigner has its own conversation pool and the reply engine uses the latest message plus conversation turn, so it does not simply repeat the same message every time. Chat history is retained locally per browser/profile.
