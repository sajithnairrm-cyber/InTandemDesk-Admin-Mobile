# InTandemDesk-Admin-Mobile

Admin/Owner portal for **InTandem Build** — mobile-first, for smartphones and
tablets.

This repository is standalone. Nothing in it imports from, builds against, or
requires the web repository at runtime.

> **Development only.** Hosting, deployment, CI/CD and domain configuration are
> deliberately not set up yet. See [Deferred](#deferred).

---

## Run it

**Develop from the web repo.** Its `npm run dev` starts this app too, on
:8081, and keeps `src/shared/` here in step automatically. That is the
intended workflow.

To run this repo on its own:

```bash
npm run dev
```

<http://localhost:8081> — then use your browser's device toolbar at 375 × 812,
or better, open it on a real phone over Wi-Fi (the web repo's `dev` prints the
address).

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
│   └── itd-admin-auth.js   auth gate + local dev bypass
└── app/         ← this app only
    ├── index.html          mobile shell
    ├── itd-mobile.css      shell overrides — loaded after itd-core.css
    └── itd-mobile-nav.js   bottom bar + sheets
docs/            build output — COMMITTED, served by GitHub Pages
documentation/   architecture, roles spec, firestore.rules
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

`src/shared/` (11 files) is duplicated in `InTandemDesk-Admin-Web`. **Two copies in two
repositories will drift** — it already happened twice in one day with
`itd-admin-auth.js`, which is why that file now lives in `shared/` rather
than `app/`.

The web repo's `npm run dev` mirrors its `src/shared/` here on every
save. Edit shared code **there**, not here — anything you change in this repo's
`src/shared/` is overwritten on the next sync.

If you must edit shared code from this repo, stop the watcher first and use
`npm run sync:push` to send it the other way.

Manual commands, if the watcher is not running:

```bash
npm run check:shared     # do the two repos agree?
npm run sync:push        # this repo wins
npm run sync:pull        # the other repo wins
```

Both repositories must be cloned as siblings:

```
some-folder/
├── InTandemDesk-Admin-Web/
└── InTandemDesk-Admin-Mobile/
```

`src/app/` is never synced — that is where the two portals are meant to differ:

| | `src/app/` holds |
|---|---|
| Web | `index.html` |
| Mobile | `index.html`, `itd-mobile.css`, `itd-mobile-nav.js` |

**Committing is still manual.** Files staying in sync does not commit them —
if the mobile repo is never pushed, GitHub Pages keeps serving the old build.
`npm run ship "message"` in the web repo commits and pushes both together.

## Committing

Both repos are already on GitHub. From the **web** repo:

```bash
npm run ship "what changed"
```

That builds both, then commits and pushes both with the same message —
skipping either if it has nothing to commit. Use plain `git` if you'd rather
handle them separately.

`docs/` **is committed** — GitHub Pages serves the app from it. `npm run build`
regenerates it; never edit it by hand.

Repo: <https://github.com/sajithnairrm-cyber/InTandemDesk-Admin-Mobile>

---

## Deferred

Not configured, by design:

- Firebase Hosting · deployment · CI/CD · custom domains · production builds
- **No PWA or offline support** — no manifest, no service worker. It is a
  mobile-shaped web app, not an installable one. The obvious next step for
  site use.
- No native gestures — no swipe-back, no pull-to-refresh.
