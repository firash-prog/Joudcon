# JOUDCON — Live Deployment Runbook
**Target:** joudcon-cms (Next.js + Supabase) → Vercel, then DNS cutover for joudcon.com
**Time:** ~15 min hands-on + E2E testing
**Golden rule:** NEVER commit `.env.local` or paste the service-role key anywhere public.

---

## PHASE 0 — Supabase backend (5 min)

1. Create project at [supabase.com](https://supabase.com) → New project. Region: `Frankfurt` or `Mumbai` (nearest to KSA). Set a strong DB password (save it in a password manager).
2. Open **SQL Editor** → run these three files **in order** (paste whole file, Run):
   1. `supabase/schema.sql` — tables, RLS, triggers
   2. `supabase/storage.sql` — buckets + policies
   3. `supabase/seed.sql` — real Joudcon content
   ✅ Verify: Table Editor shows `projects` with 2 Aramco rows; Storage shows `media`, `branding`, `lead-attachments` buckets.
3. **Authentication → Sign In / Providers**: temporarily disable "Confirm email" (enables instant admin login; re-enable later if you want).
4. **Authentication → Add User** → create your login (email + strong password) → copy the user's UUID from the Users table.
5. SQL Editor → run (with your UUID):
   ```sql
   insert into public.profiles (id, full_name, role)
   values ('YOUR-USER-UUID', 'Admin', 'super_admin');
   ```
6. **Settings → API**: copy `Project URL`, `anon public` key, `service_role` key (the service key is server-only — treat like a root password).

## PHASE 1 — Local build check (3 min, catches compile issues before deploy)

```bash
cd joudcon-cms
npm install
cp .env.example .env.local   # fill in the 3 values from Phase 0 step 6
npm run build
npm run dev                  # smoke test: http://localhost:3000 → /en, /ar, /admin
```
If `npm run build` errors: paste the error output to your developer/agent. Known benign notes:
- `next-env.d.ts` is auto-generated — not an error if reported missing before first dev run.
- First load of `/admin` redirects to login — expected.

## PHASE 2 — Deploy to Vercel (5 min)

**Recommended (GitHub route):**
1. Push this folder to a private GitHub repo:
   ```bash
   git init && git add -A && git commit -m "Joudcon CMS v1"
   git remote add origin git@github.com:YOURORG/joudcon-cms.git && git push -u origin main
   ```
2. [vercel.com](https://vercel.com) → Add New → Project → import the repo → framework auto-detected (Next.js).
3. **Environment Variables** — add exactly these three:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Phase 0 step 6 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Phase 0 step 6 |
   | `SUPABASE_SERVICE_ROLE_KEY` | Phase 0 step 6 (server-only) |
4. Deploy. ✅ Verify the build log ends with `✓ Compiled successfully` and `✓ Generating static pages`.

**CLI alternative:** `npm i -g vercel && vercel --prod` (answers prompts; add env vars in dashboard after).

## PHASE 3 — Smoke test on the preview URL

1. Open `https://<your-app>.vercel.app` → should redirect to `/en` (or `/ar` on Arabic browsers).
2. Check `/en` renders hero + services + both Aramco projects; `/ar` renders RTL Arabic.
3. Open `/admin` → sign in with the Phase 0 user → upload **Primary logo** in Branding → Save.
4. Hard-refresh `/en` (or wait 60s) → new logo in header. **If this works, the entire CMS↔website chain is live.**

## PHASE 4 — Full E2E acceptance

Run every script in **`TESTING.md`** and check off each line. Do not cut DNS before all pass.

## PHASE 5 — DNS cutover for joudcon.com (only after Phase 4 is green)

1. Supabase → Authentication → URL Configuration → set **Site URL** to `https://joudcon.com`.
2. Vercel → Settings → Domains → add `joudcon.com` + `www.joudcon.com`.
3. At your DNS registrar:
   - `A` record `@` → `76.76.21.21` (Vercel anycast)
   - `CNAME` `www` → `cname.vercel-dns.com`
   Lower TTL to 300s an hour before switching; keep the old host running as instant rollback until DNS propagates.
4. Verify: `https://joudcon.com/en`, `https://joudcon.com/sitemap.xml`, `https://joudcon.com/robots.txt`.

## PHASE 6 — Go-live hardening (same day)

- [ ] **Rotate the old admin panel password** (the temporary shared one) and decommission the old `…kimi.page` admin — it is now obsolete.
- [ ] Create one Supabase Auth user **per person** (no sharing); assign roles via `profiles` table (`super_admin` / `admin` / `editor` / `media_manager`).
- [ ] Re-enable "Confirm email" if you want verification on new users.
- [ ] Enable backups: Supabase Pro PITR, or schedule a nightly `pg_dump` cron to off-site storage.
- [ ] Verify statistics in Admin → Statistics before toggling **Show on website** (currently hidden — by design).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Build fails: `supabaseUrl is required` | Env var missing/misnamed in Vercel | Re-check the 3 names in Phase 2 step 3 (no typos, no quotes) |
| `/admin` loops back to login | Cookies blocked or URL mismatch | Use the canonical Vercel URL; check Supabase Auth → URL Configuration |
| Upload fails 401 | Session expired | Sign out/in; check `profiles` row exists with a role |
| Upload fails 400/403 storage | Policy mismatch | Re-run `storage.sql`; confirm bucket names are exactly `media`, `branding`, `lead-attachments` |
| Media deletes blocked with count | Usage guard working as designed | Detach from project/service first, or confirm the force-delete prompt |
| Arabic text shows boxes | Font lacks Arabic glyphs | System fonts cover Arabic; if self-hosting fonts later, add a proper Arabic face |
| Changes not visible on site | ISR cache | Wait 60s and hard-refresh; check the item is `published`/`is_visible` |
