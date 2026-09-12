# JOUDCON Website + Admin CMS (Supabase Edition)

Production-ready, bilingual (EN/AR) website + CMS for Joudcon Event Management.
Public site and admin are ONE Next.js app backed by Supabase (Postgres + Auth + Storage + RLS).

## Deploy

1. **Supabase**: create project → SQL Editor → run in order:
   `supabase/schema.sql` → `supabase/seed.sql`
2. **Env**: copy `.env.local` from `.env.example`; fill URL + anon key + service_role key.
3. **Vercel**: import repo, add env vars, deploy. Set site URL in Supabase Auth settings.

## Post-deploy checklist (Definition of Done)

- [ ] Change/rotate all temporary passwords; create per-user accounts (Settings → Users)
- [ ] Upload PRIMARY/DARK/LIGHT logo + favicon in Admin → Branding (device upload, no URLs)
- [ ] Upload media from device; verify usage-guarded delete ("used in N places")
- [ ] Create/edit a service in EN + AR → publish → verify on public site (hard refresh)
- [ ] Same for a project (with gallery) → verify
- [ ] Submit contact form → appears in Admin → Leads; attach file; export CSV
- [ ] Toggle a statistic → verify homepage counter; unpublish a project → verify 404/gone
- [ ] Test /ar RTL layout on 375px and 1440px
- [ ] Confirm console clean, sitemap.xml + robots.txt resolve

## Architecture

- Public reads: anon key + RLS (published rows only). Zero service key in browser.
- Admin writes: Supabase Auth sessions; RLS checks `profiles.role`.
- Leads: server route `/api/leads` (service role, validation + rate limit). Attachments: direct-to-storage with path-scoped RLS.
- Media derivatives: Supabase Image Transformations (`/render/image/...?width=&format=webp`).
- Activity + revision history: DB triggers (zero app code).

## Security notes

- Service-role key exists ONLY in server env (API routes). Never NEXT_PUBLIC_*.
- SVG uploads stored with `text/plain` coercion + served as attachment; render only via <img>.
- Delete is soft/logged; media delete blocked while referenced (force requires admin).
