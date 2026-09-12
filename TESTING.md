# JOUDCON — E2E Acceptance Test Scripts
Run in order on the deployed preview URL. Every step states its **Pass criteria**.
Sign in to `/admin` first. Keep the public site open in a second tab.

---

## A. CMS → Website synchronization (the critical chain)
1. Admin → **Services** → open "Conference Management" → change Short Description (EN) to `TEST-SYNC-EN` → Save → **Publish** (if not live).
2. **Pass:** `/en/services/conference-management` shows `TEST-SYNC-EN` within 60 s (hard refresh). Repeat for AR text on `/ar/...`.
3. Revert the text. **Pass:** reverts on site.

## B. Media pipeline (device upload → library → usage)
1. Admin → **Media Library** → Upload a JPG from your device.
2. **Pass:** real progress bar reaches 100%; thumbnail appears; filename, size, dimensions shown; persists after browser refresh.
3. Open the file → Edit → set ALT EN + ALT AR → Save. **Pass:** values persist after reload.
4. Copy URL → open in new tab. **Pass:** image loads.

## C. Project CRUD + featured control
1. Admin → **Projects** → Add: name EN `E2E Test Project`, client `Test Client`, year 2026, summary, one gallery image (MediaPicker), **Featured ON** → Publish.
2. **Pass:** appears on `/en` homepage "Featured projects" section within 60 s.
3. Toggle it **Unpublished**. **Pass:** disappears from homepage; `/en/projects/e2e-test-project` returns 404.
4. Delete it → confirm. **Pass:** gone from admin list; dashboard count decremented.

## D. Branding (global logo management)
1. Admin → **Branding** → Upload **Primary logo** (PNG from device) → Save.
2. **Pass:** `/en` header shows the new logo within 60 s; favicon updates (hard refresh).
3. Upload **Dark logo** → check it renders on a charcoal context (footer). **Pass:** correct variant used.
4. Remove footer logo → Save. **Pass:** footer falls back to primary.

## E. Home sections editor
1. Admin → **Home Sections** → Hero → change Headline EN to `E2E HEADLINE` → Save section.
2. **Pass:** `/en` hero shows it within 60 s. Change AR headline → check `/ar`.
3. About → **+ Add milestone** (year 2027, EN+AR title) → Save. **Pass:** new card renders on homepage.
4. Remove the milestone; revert hero. **Pass:** site reverts.

## F. Workshop page
1. Admin → **Workshop** → edit Description EN → Save. **Pass:** `/en/workshop` updates within 60 s. Check `/ar/workshop` RTL.

## G. Leads pipeline
1. Public `/en` → contact form: submit name/email/message **+ attach a small PDF**.
2. **Pass:** green success message with the OK text.
3. Admin → **Enquiries** → new lead appears at top with **New** badge → open it → attachment downloads.
4. Add internal note → set status **In Progress**. **Pass:** note persists after reload; status badge updates in list.
5. **Export CSV** → file downloads, contains the lead. Mark **Completed**.

## H. Delete safety (usage guard)
1. In Media Library, locate the image used as a project featured image → Delete.
2. **Pass:** blocked with a dialog stating it is used in N places; choosing cancel changes nothing. (Force-delete only via explicit confirm.)

## I. Statistics (currently hidden by design)
1. Admin → **Statistics** → set "Years Experience" = 15, **Show ON** → Save.
2. **Pass:** counter band appears on `/en` homepage. Toggle OFF → band disappears.

## J. Responsive + RTL + languages
At each width (Chrome DevTools device toolbar): 375, 768, 1280, 1440 —
- [ ] No horizontal overflow on `/en`, `/ar`, `/admin`
- [ ] Admin tables usable at 375 (cards/wrapping, drawer nav)
- [ ] Arabic pages are fully RTL (mirrored nav, correct alignment)
- [ ] Language toggle EN ⇄ AR works from the header

## K. Persistence & hygiene
- [ ] Refresh browser after every admin save → data intact
- [ ] Sign out → `/admin` redirects to login; back button doesn't reveal data
- [ ] Browser console on `/en`: zero red errors
- [ ] `/sitemap.xml` lists EN+AR pages; `/robots.txt` blocks /admin
- [ ] Non-existent page shows branded 404 (not a stack trace)

---
**Sign-off:** all boxes checked → proceed to DNS cutover (DEPLOY.md Phase 5).
Any failure → fix, re-run that script, do not cut DNS.
