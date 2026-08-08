This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Inviting new members

New members self-signup at `/join`, gated by a single shared passcode (set via the `TRIP_JOIN_PASSCODE` env var - see `.env.example`). This page is intentionally not linked anywhere in the app UI (no nav bar or login page link), so share the URL and passcode directly with people you're inviting, e.g.:

```
https://winter-reunion.vercel.app/join
```

At join they enter first name + last initial, email, mobile, and a password they choose. The app tries to email and text those login details once (password is never stored in readable form afterward):

- **Email:** set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (and `NEXT_PUBLIC_SITE_URL`)
- **SMS (Twilio):**
  1. Sign up at https://www.twilio.com/try-twilio
  2. Console → copy **Account SID** + **Auth Token**
  3. Get a phone number (Messaging capable) → copy it as `+1...`
  4. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` in `.env.local` **and** Vercel → Redeploy
  5. On a **trial** account: verify your personal phone under Phone Numbers → Verified Caller IDs (or you’ll get blocked)
  6. Dashboard → **Send test text to me** (needs your phone on your profile)

If those aren't configured yet, join still works — they screenshot email + password on the success screen (or ask Key to reset it later).

### Supabase auth redirect (fixes dead "Confirm" links)

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://winter-reunion.vercel.app`
- **Redirect URLs** (add all):
  - `https://winter-reunion.vercel.app/auth/callback`
  - `https://winter-reunion.vercel.app/login`
  - `https://winter-reunion.vercel.app/**`
  - `http://localhost:3000/auth/callback` (for local)

Optional but simplest for a private trip: **Authentication → Providers → Email → Confirm email = OFF**, so people go straight in after join with no Confirm step.

## Database migrations

After pulling schema changes, run new SQL files in `supabase/migrations/` in the Supabase SQL editor (in filename order) if they aren't applied yet:

- `20260808000002_announcement_link_url.sql` — optional links on announcements
- `20260808000003_talk_posts.sql` — Talk board (posts + replies)
- `20260808000004_activity_cards_link.sql` — activity cards: link preview fields + members can propose
- `20260808000005_cabin_cards_voting.sql` — cabin cards: Yes/No votes, link preview, members can propose

## Resetting a member's password

If someone gets locked out, the primary admin (role `admin`, not `co-admin`) can set a new password for them at `/admin/members` - there's no way to view an existing password since it's never stored anywhere in readable form, but a new one can be set directly and passed along.

This requires `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard > Project Settings > API) to be set - see `.env.example`. Keep this out of version control and never expose it with a `NEXT_PUBLIC_` prefix; it bypasses Row Level Security entirely.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
