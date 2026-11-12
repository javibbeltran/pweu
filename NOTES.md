# PWEU Portal – working notes

Repo is **public**: never commit real prices, customer lists, keys or internal notes.

## Layout
- `portal/` – the real portals (static HTML/JS/CSS, no framework). Live: https://javibbeltran.github.io/pweu/portal/
  - `portal/sales/` Sales Portal (login). Code: `portal/portal-lite.js`, `portal/portal-lite.css`, `portal/shared.js` (i18n strings, settings, prefs).
  - `portal/forms/` New contract form + New customer form (embedded in the Sales Portal with `?embed`; `?preview` = standalone demo mode).
  - `portal/data/` species and extra data.
- `salesportal/` – open demo (no login, sample data). Generated, do not edit by hand:
  `python3 tools/build-demo/build.py demo`  (regenerate after any portal change, then commit).
- `tools/build-demo/` – demo generator (stubs Supabase, inlines the forms). `links` mode needs a local `links.json` (not committed).
- `supabase/migrations/` – SQL. `20261109_catalogue_settings.sql` is NOT applied yet.

## Backend
Supabase project `pweu-portal`, id `idbammhbxqpkggpldwvr`. Tables: `app_users`, `section_access`, `options`, `form_config`, `form_submissions`, `user_prefs`, `docs`, `sections`, `spaces`.
Users: Javi (admin), Amanda (viewer), Yomi (editor) on section `pweu-sales`.
Login = magic link; Supabase default email limit is too low ("email rate limit exceeded") -> needs custom SMTP.

## Known behaviour
- Orders/quotes created in the Sales Portal are saved in the browser only (localStorage), not in the database yet.
- New Order: Save (Draft) / Send quote (opens mail, marks Quote sent) / Submit.
- Species sheet: full screen falls back to a presentation mode on iPhone; Send uses the share sheet when available.

## Pending
- Images: pick best per application, real photo per species, AI-generated ones labelled "Illustrative", WebP in 3 sizes, store outside this public repo (Supabase Storage / SharePoint), table with species / application / type / credit / approved.
- Login: own SMTP (Resend/Brevo), 6-digit code, later Microsoft SSO and 2FA for admins.
- Own domain, company-owned Supabase/GitHub accounts, backups, private hosting.
- Save orders to the database; real form submit (mail + Acadon); Acadon API (server side, never keys in the page).
- Unified "New order" flow (quote vs contract, "convert to contract"); customer search with related items.
- Translate new strings (nl/es/de/fr/pt-BR/it); align invented option codes with Acadon (PWH-BRAZIL, EXTERNAL-SUPPLIER, CAD-15-PRE).
- Top menu has 10 tabs and overflows on small widths (3D Showroom hidden): shorten names or group the forms.
