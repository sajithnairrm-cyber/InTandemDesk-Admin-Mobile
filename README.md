# InTandemDesk-Admin-Mobile

Admin/Owner portal for **InTandem Build** — mobile-first, for smartphones and
tablets.

This repository is standalone. Nothing in it imports from, builds against, or
requires the web repository at runtime.

> **Development only.** Hosting, deployment, CI/CD and domain configuration are
> deliberately not set up yet. See [Deferred](#deferred).

---

## Run it

Needs Node 18+. No dependencies to install.

```bash
npm run dev
```

<http://localhost:8081> — then open your browser's device toolbar and pick a
phone (375 × 812) to see it as intended.

On localhost the app **opens straight away** — no Google sign-in — with an
amber banner above the bottom bar saying so. See [Authentication](#authentication).

Other commands:

```bash
npm run build     # src/ → public/
npm run serve     # serve public/ without rebuilding
```

---

## What differs from the web portal

**Only the shell.** Every view — dashboard, ledger, budget, staff, settings —
is the same shared code rendering into the same `#page-*` sections. The two
portals cannot show different data or different business logic, because there
is only one copy of it.

| | Web | Mobile |
|---|---|---|
| Navigation | Fixed sidebar | Bottom bar (5 slots) + "More" sheet |
| Search | Inline in topbar | Full-width sheet behind a search icon |
| Topbar | Brand, search, stamp, actions | Compact: brand, search, alerts, avatar |
| Content | Rail-offset | Full-bleed, safe-area aware |

Bottom bar: **Home · Projects · Ledger · Team · More**. Everything else —
Schedule, Budget, Payments, Vendors, Reports, News, Settings — is one tap into
the sheet. Settings appears only for Owners.

Routes are identical (`#/ledger` is `#/ledger` in both), so links and bookmarks
work across portals.

---

## Layout

```
src/
├── shared/      ← identical to the web repo (see below)
└── app/         ← this app only
    ├── index.html          mobile shell
    ├── itd-mobile.css      shell overrides — loaded after itd-core.css
    ├── itd-mobile-nav.js   bottom bar + sheets
    └── itd-admin-auth.js   auth gate + local dev bypass
public/          build output — generated, gitignored
docs/            architecture, roles spec, firestore.rules (reference)
```

`itd-mobile.css` overrides **layout chrome only**. Cards, tables, KPIs, charts,
forms and pills are untouched shared CSS — which is why both portals look like
the same product.

Adding a route means one entry in `SECONDARY` in `itd-mobile-nav.js`. Nothing
else changes.

The hidden `<aside class="sidebar">` in `index.html` is intentional: the shared
view modules write count badges into those nodes, and the bottom bar mirrors
them. It keeps the counts working without forking a line of view code.

---

## Authentication

The app is gated: `App.start()` is called only after an Admin/Owner account is
verified. Nothing renders behind the gate.

**On localhost that gate is bypassed** so you can work on the interface without
signing in every reload. The only trigger is `location.hostname`, so a page
served from any real domain can never take that path.

```
http://localhost:8081          → bypassed, banner shown
http://localhost:8081/?auth    → real Google sign-in flow
```

While bypassed, Firestore reads return empty and writes are refused.

---

## The shared-core rule

`src/shared/` is duplicated in `InTandemDesk-Admin-Web`. **Two copies in two
repositories will drift.**

The repositories have no build or runtime dependency on each other. This is an
*optional* maintenance aid, run by hand:

```bash
npm run check:shared     # do the two repos agree?
npm run sync:push        # this repo wins
npm run sync:pull        # the other repo wins
```

It expects the two repos cloned as siblings. If they are not, the command exits
with a message and nothing else is affected. `src/app/` is never synced.

**After editing anything in `src/shared/`: push to the other repo, commit both.**

---

## Pushing to GitHub

```bash
git init
```

```bash
git add . && git commit -m "Initial commit — Admin/Owner mobile portal"
```

```bash
git remote add origin https://github.com/<you>/InTandemDesk-Admin-Mobile.git
```

```bash
git push -u origin main
```

---

## Deferred

Not configured, by design:

- Firebase Hosting · deployment · CI/CD · custom domains · production builds
- **No PWA or offline support** — no manifest, no service worker. It is a
  mobile-shaped web app, not an installable one. The obvious next step for
  site use.
- No native gestures — no swipe-back, no pull-to-refresh.
