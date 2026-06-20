
# Production Authentication System for AXYS

This is a large build. Here is the scoped plan before I start writing code.

## Backend foundation

Enable **Lovable Cloud** (managed Supabase). Auth, sessions, tokens, refresh-token rotation, HttpOnly cookies, password hashing (bcrypt), CSRF, and rate-limit primitives are handled by Supabase Auth — we do not re-implement those. We layer the app-level rules on top.

Tables (with RLS + GRANTs):
- `profiles` — full_name, created_at, FK auth.users (auto-created via trigger)
- `user_roles` — separate roles table (`admin` | `user`) using the `has_role` SECURITY DEFINER pattern
- `login_attempts` — email, ip, success, attempted_at (for rate limit + lockout)
- `security_events` — user_id, event_type, ip, user_agent, created_at
- `password_reset_requests` — email, ip, requested_at (rate limit + cooldown)

Server functions (`createServerFn`, RLS-scoped) :
- `signUp` — zod validation, strong password rules, normalize email, create user, send verification via Resend, log event
- `signIn` — check lockout (5 failed/15min → temporary lock with exponential backoff), generic errors, log attempt + event
- `requestPasswordReset` — rate-limited (3/hour/email, 10/hour/ip), generic response, sends Resend email with token link
- `resendVerification` — rate-limited (1/min, 5/hour)
- `adminListUsers`, `adminDisableUser`, `adminForceLogout`, `adminResetPassword` — gated by `has_role(admin)`
- `createOrder` — requires `requireSupabaseAuth` + verified email check; replaces current localStorage-only flow

## Email (Resend)

Use Resend connector for: verification email, password reset email, security alerts (new device login). I'll guide you to link Resend when we get there.

## Frontend pages

New routes:
- `/auth` — combined Sign In / Create Account (tabs), password strength meter, show/hide toggle, "Remember me", "Forgot password?" link
- `/auth/verify` — handles email verification callback + resend
- `/auth/forgot` — request reset
- `/auth/reset` — set new password (token from email)
- `/_authenticated/account` — security settings: change password, active sessions, sign out all devices, security event log

Premium styling matches existing AXYS aesthetic (Bebas Neue / Oswald / Montserrat, black & white, editorial).

## Checkout gating

- `src/routes/checkout.tsx` becomes `src/routes/_authenticated/checkout.tsx` — managed `_authenticated/route.tsx` gate redirects unauthenticated users to `/auth?redirect=/checkout?...`
- After sign-in, redirect-back preserves the cart selection (product/color/size/qty in search params)
- Server-side: `createOrder` server fn re-checks `requireSupabaseAuth` + email verified before persisting the order. Frontend checks are never trusted alone.
- Verified-email check blocks order creation with a clear "Please verify your email" CTA

## Security implementation notes (the parts that matter)

| Concern | Implementation |
|---|---|
| Password hashing | Supabase Auth (bcrypt) — never stored plaintext |
| Refresh token rotation | Supabase Auth default (rotates on every refresh, reuse detection) |
| HttpOnly cookies | Supabase session storage configured server-side; tokens not exposed to JS where avoidable |
| CSRF | Same-origin server functions + SameSite cookies |
| Brute force | App-level `login_attempts` table + 5/15min lockout + exponential delay |
| Reset abuse | `password_reset_requests` rate limit, generic responses |
| Email enumeration | All auth responses return the same generic message |
| Session expiration | Supabase JWT short-lived (1h) + refresh rotation |
| Logout all devices | `supabase.auth.admin.signOut(userId, 'global')` via admin server fn |
| Input validation | Zod everywhere, server-side re-validation |
| XSS | React escaping + no `dangerouslySetInnerHTML` |
| SQL injection | Parameterized Supabase queries only |

## What I need from you before building

1. **Resend** — I'll need you to link the Resend connector when I get to the email step. Or use Lovable's built-in email infrastructure (zero config, recommended). Which do you prefer?
2. **Admin user** — after Cloud is enabled and you sign up, tell me your email so I seed your admin role.

## Out of scope (flag if you want them)

- 2FA / TOTP / WebAuthn
- Magic-link / OAuth (Google/Apple) — can add later, just say the word
- IP geolocation alerts ("login from new country")

If this plan looks right, approve and I'll start by enabling Lovable Cloud and building the schema + auth pages in the first pass, then wire checkout gating + Resend in the second.
