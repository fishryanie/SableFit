# SableFit

Mobile-first workout planner PWA built with Next.js 16, React 19, MongoDB, Firebase Phone Auth, `next-intl`, and Web Push.

## Included in this project

- Public SEO pages: `/`, `/plans`, `/exercises`, `/install`
- Protected app: `/app/today`, `/app/sessions`, `/app/plans`, `/app/library`, `/app/inbox`, `/app/settings`
- Firebase phone OTP -> secure HTTP-only app session
- Mongo models for users, sessions, push subscriptions, exercise library, workout sessions, workout plans, occurrences, logs, notifications
- DB-first seed pipeline importing local raw data from `fitate` and `kinis`, then normalizing into Mongo collections with refs, aliases, and seed state tracking
- Generated brand pack, PWA icons, app screenshots, and 185 anatomy exercise media bundles via `npm run art`
- Exercise media is organized as `public/workout/exercise/<slug>/phase-01.webp`, `phase-02.webp`, and `motion-slow.gif`, then synced to Cloudinary at `sablefit/workout/exercise/<slug>/...`
- PWA install prompt, service worker, push notification handler, OG image, apple icon, sitemap, robots

## Local setup

1. Copy `.env.example` to `.env.local`
2. Fill in:
   - `MONGODB_URI`
   - `MONGODB_DB=workout_mobile`
   - Firebase Admin + Firebase Web env vars
   - Web Push VAPID keys if you want reminder push to work
3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Useful commands

```bash
npm run lint
npm run build
npm run art
npm run seed
npm run seed -- --force
```

## Notes

- System data auto-seeds on first access if the workout catalog is empty.
- Phone OTP requires Firebase Phone Auth to be enabled for your project.
- Web Push requires:
  - `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`
  - `WEB_PUSH_PRIVATE_KEY`
  - `WEB_PUSH_SUBJECT`
- Reminder cron route is `GET /api/cron/reminders` and can be protected with `Authorization: Bearer $CRON_SECRET`
- Local AI UI audit lives at `/app/review/ui-audit` and requires `OPENAI_API_KEY`
