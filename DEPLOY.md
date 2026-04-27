# Steward — Deployment Runbook

## Overview

| Service  | Platform | Trigger                   | What it serves               |
|----------|----------|---------------------------|------------------------------|
| API      | Railway  | Auto on `git push main`   | `apps/api` — NestJS REST API |
| Web      | Vercel   | Auto on `git push main`   | `apps/web` — Next.js 14 SPA  |
| Database | Neon     | **Manual** — run sync CLI | PostgreSQL (shared multi-tenant) |

---

## Standard Deployment (code changes only)

```bash
# 1. Typecheck both apps — catch errors before pushing
cd apps/web && npx tsc --noEmit -p tsconfig.json && cd ../..
cd apps/api && npx tsc --noEmit -p tsconfig.json && cd ../..

# 2. Test build locally (optional but recommended for web changes)
cd apps/web && npm run build && cd ../..

# 3. Commit and push — triggers Vercel + Railway automatically
git add -A
git commit -m "type(scope): description"
git push origin main
```

After pushing:
- **Vercel** builds `apps/web` automatically (1–2 min). Visit https://steward-liart.vercel.app to confirm.
- **Railway** builds and restarts `apps/api` automatically (2–3 min). Visit https://stewardapi-production.up.railway.app/health to confirm.

---

## When to Run a Schema Sync (database migrations)

Run a schema sync **any time you add, rename, or remove a TypeORM entity column or table**.

Signs you need a sync:
- Added a new `@Entity()` class
- Added, renamed, or changed a `@Column()` on an existing entity
- Added a new `@Index()` or `@Unique()` constraint

```bash
# 1. Build the API first (sync reads compiled JS, not TypeScript)
cd apps/api && npm run build

# 2. Run the sync against Neon production
npx typeorm schema:sync -d dist/config/data-source.js

# 3. Confirm output ends with:
#    Schema synchronization finished successfully.
# If it lists ALTER TABLE / CREATE TABLE statements, those were applied.
# If only COMMIT appears, the schema was already up to date.
```

> **Note:** `data-source.ts` is at `apps/api/src/config/data-source.ts`.
> TypeORM CLI requires a single default export — don't add named exports to that file.

---

## Manual Railway Redeploy

Railway auto-deploys on every push to `main`. Only use a manual redeploy if:
- You changed an **environment variable** in Railway and need the API to pick it up without a code change
- A deployment is stuck or you want to force a restart

```bash
cd /path/to/steward
railway deployment redeploy
# Confirm the prompt with: y
```

Then verify:
```bash
railway deployment list | head -3
# Latest should show: SUCCESS
```

---

## Verify All Deployments

Run this after any deployment to confirm all three platforms are current:

```bash
# GitHub — confirm nothing is uncommitted
git status
git log --oneline -3

# Railway — confirm latest is SUCCESS
railway deployment list | head -3

# Vercel — confirm latest is Ready
vercel ls steward | head -6

# Database — confirm schema is up to date (no changes needed)
cd apps/api && npx typeorm schema:sync -d dist/config/data-source.js 2>&1 | grep -E "finished|COMMIT|error"
```

Expected healthy output:
```
nothing to commit, working tree clean
SUCCESS | <recent timestamp>
● Ready   Production
Schema synchronization finished successfully.
```

---

## Environment Variables

### Railway (API)
Set via `railway variables --set "KEY=value"` or in the Railway dashboard.

| Variable         | Purpose                                          |
|------------------|--------------------------------------------------|
| `DATABASE_URL`   | Neon PostgreSQL connection string                |
| `JWT_SECRET`     | Signs advisor + portal JWT tokens                |
| `ENCRYPTION_KEY` | 64-char hex key for encrypting sensitive fields  |
| `NODE_ENV`       | Must be `production` (disables TypeORM sync)     |
| `OPENAI_API_KEY` | AI screening (Christian values)                  |

### Vercel (Web)
Set in the Vercel dashboard under Project → Settings → Environment Variables.

| Variable                | Purpose                                    |
|-------------------------|--------------------------------------------|
| `NEXT_PUBLIC_API_URL`   | Full URL of Railway API (no trailing slash) |
| `NEXTAUTH_SECRET`       | Next-Auth session secret                   |

> After adding a Vercel env var, trigger a redeploy from the Vercel dashboard or by pushing an empty commit.

---

## Known Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| Vercel build fails with `useSearchParams() should be wrapped in a suspense boundary` | A page uses `useSearchParams()` outside `<Suspense>` | Wrap the component that calls `useSearchParams` in `<Suspense fallback={...}>` from the default export |
| Railway deploys but API returns 503 | Health check at `/health` failing — usually a bad env var or DB connection | Check Railway logs; verify `DATABASE_URL` is set |
| Schema sync fails with `column does not exist` | Entity has a column that was renamed without a migration | Run sync — it will ALTER the table. If data loss is a concern, write a manual SQL migration first |
| TypeORM `DataTypeNotSupportedError` on union type columns | TypeORM infers `Object` type for literal union columns | Add `{ type: 'varchar', length: N }` to the `@Column()` decorator |

---

## Monorepo Build Commands Reference

| What | Command | Run from |
|------|---------|----------|
| Dev (all services) | `npm run dev` | Workspace root |
| Build API | `cd apps/api && npm run build` | Root or `apps/api` |
| Build Web | `cd apps/web && npm run build` | Root or `apps/web` |
| Typecheck API | `cd apps/api && npx tsc --noEmit -p tsconfig.json` | Root |
| Typecheck Web | `cd apps/web && npx tsc --noEmit -p tsconfig.json` | Root |
| Run API tests | `cd apps/api && npx jest` | Root |
| Schema sync | `cd apps/api && npx typeorm schema:sync -d dist/config/data-source.js` | Root |
