# LunchVote

Ranked-choice (instant-runoff) lunch decisions for your team. Built with Next.js 15, Turso, Drizzle ORM, Auth.js v5, and Tailwind CSS.

## Local Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values (see comments in `.env.example`).

### 3. Set up Turso

1. Install the Turso CLI: https://docs.turso.tech/installation
2. Sign up / log in: `turso auth login`
3. Create a database: `turso db create lunch-vote`
4. Get credentials:
   ```bash
   turso db show lunch-vote --url    # → TURSO_DATABASE_URL
   turso db tokens create lunch-vote # → TURSO_AUTH_TOKEN
   ```
5. Add to `.env.local`.

### 4. Set up Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the client ID and secret to `.env.local` as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
5. Set `ALLOWED_EMAIL_DOMAIN` to your Google Workspace domain (e.g. `example.com`)

### 5. Run migrations

```bash
pnpm db:generate   # generate migration files from schema
pnpm db:migrate    # apply migrations to Turso
```

### 6. Seed sample data

```bash
pnpm db:seed
```

This inserts 8 sample places (the Rome team's favorites from the design mockup).

### 7. Start dev server

```bash
pnpm dev
```

Open http://localhost:3000.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TURSO_DATABASE_URL` | ✅ | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | ✅ | Turso auth token |
| `AUTH_SECRET` | ✅ | NextAuth secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth client secret |
| `AUTH_URL` | ✅ | App URL (e.g. `https://lunchvote.example.com`) |
| `ALLOWED_EMAIL_DOMAIN` | ✅ | Only this Google Workspace domain can sign in |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin email addresses |
| `CRON_SECRET` | ✅ | Bearer token for Vercel cron routes |
| `OFFICE_TIMEZONE` | optional | IANA timezone, default `Europe/Rome` |
| `POLL_OPEN_TIME` | optional | `HH:MM` poll opens, default `11:30` |
| `POLL_CLOSE_TIME` | optional | `HH:MM` poll closes, default `12:30` |
| `CURRENCY` | optional | Currency code, default `EUR` |
| `SLACK_ENABLED` | optional | Set `true` to enable Slack notifications |
| `SLACK_WEBHOOK_URL` | optional | Slack incoming webhook URL |

---

## Cron jobs

Two Vercel cron jobs manage the poll lifecycle:

| Job | Path | Default schedule |
|---|---|---|
| Open poll | `/api/cron/open` | 09:30 UTC weekdays |
| Close poll + tabulate | `/api/cron/close` | 10:30 UTC weekdays |

Adjust schedules in `vercel.json`. Both endpoints are secured with `Authorization: Bearer <CRON_SECRET>`.

---

## Deploy to Vercel

```bash
vercel deploy
```

Add all environment variables in the Vercel project settings. Vercel will automatically pick up the cron jobs from `vercel.json`.

---

## Enabling Slack notifications

Set `SLACK_ENABLED=true` and `SLACK_WEBHOOK_URL=<your-webhook-url>` in your environment. No code changes needed — the integration is already wired and gated behind this flag.

---

## IRV algorithm

The voting system uses Instant-Runoff Voting (IRV):

1. Count each ballot's top-ranked still-standing candidate.
2. If any candidate has a majority, they win.
3. Otherwise eliminate the candidate with the fewest votes.
4. **Tie-break**: among tied candidates, the most-recently-visited is eliminated (so the least-recently-visited survives). A never-visited place counts as the oldest.
5. Repeat until a winner emerges.

This logic lives in `src/lib/irv.ts` and is covered by 20 unit tests in `src/lib/irv.test.ts`.

---

## License

GNU General Public License
