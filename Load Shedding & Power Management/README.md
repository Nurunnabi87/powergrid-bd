# PowerGrid BD — Frontend ⚡

> The web app for **PowerGrid BD**, a load-shedding and power-outage
> management system for an electricity distribution utility. Customers see
> their area's load-shedding schedule, report outages and pay bills;
> technicians work their dispatched jobs; the control room manages the
> network, schedules, dispatch, billing and analytics.

Built with **Next.js 16 (App Router)** on top of the
[PowerGrid BD API](https://github.com/Nurunnabi87/powergrid-bd-backend).

## 🔗 Links

| | |
|---|---|
| **Live app** | _add your Vercel URL_ |
| **Live API** | https://powergrid-bd-backend.vercel.app |
| **API docs** | https://powergrid-bd-backend.vercel.app/api/docs |
| **Backend repo** | https://github.com/Nurunnabi87/powergrid-bd-backend |

## 🔑 Demo accounts

The login page has **one-click demo buttons** for all three roles.

| Role | Email | Password | Lands on |
|---|---|---|---|
| Admin | `admin@powergrid.bd` | `Admin@1234` | `/admin` |
| Customer | `customer1@powergrid.bd` | `Customer@1234` | `/dashboard` |
| Technician | `tech1@powergrid.bd` | `Tech@1234` | `/technician` |

**Test payments**

| Method | Details |
|---|---|
| Card (Stripe test mode) | `4242 4242 4242 4242`, any future expiry, any CVC |
| bKash sandbox | wallet `01770618575`, OTP `123456`, PIN `12121` |

## 🛠️ Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript (strict, no `any`) |
| Styling & UI | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, next-themes (light/dark) |
| Server state | TanStack Query v5 — server prefetch + `HydrationBoundary` |
| Client state | Zustand (session, UI shell) |
| Forms | React Hook Form + Zod 4 (rules mirror the API's validators) |
| Tables | TanStack Table (server-paginated, URL-driven) |
| Charts | Recharts via shadcn `chart`, colour-blind-validated palette, table view on every chart |
| Auth | Custom JWT in httpOnly cookies, verified with `jose` in `proxy.ts` |
| Payments | Stripe Checkout (test mode) and bKash, both verified server-side |
| Notifications | Sonner toasts + in-app notification centre |

## 🏗️ Architecture

```
Browser ──► Next.js (Vercel) ──────────────► PowerGrid BD API (Express)
            ├─ proxy.ts           route-level RBAC, silent token refresh
            ├─ Server Components  fetch with the httpOnly token, prefetch queries
            ├─ Server Actions     login / demo login / register / logout
            └─ /api/proxy/*       BFF for client components (TanStack Query)
```

- **Tokens never reach JavaScript.** The API's JWTs are stored in
  `httpOnly`, `sameSite=lax` cookies by server actions. Client components call
  `/api/proxy/*`, which attaches the Bearer token server-side, allowlists API
  paths, and refreshes an expired token once before retrying.
- **Three layers of role enforcement.**
  1. `proxy.ts` (Next 16's replacement for `middleware.ts`) verifies the JWT
     and redirects anyone on another role's URL.
  2. Each role layout calls `requireRole()` on the server.
  3. The API re-checks the role on every request.

  Navigation and actions render per role (`config/navigation.ts`, and the
  state-machine-aware action menus).
- **Server Components by default.** Pages fetch on the server; `"use client"`
  is used only for interactive pieces (tables, forms, dialogs, charts). List
  pages prefetch the exact page the URL asks for, and the client table picks
  it up from the cache with no second request. Later filter changes are
  fetched client-side and cached by TanStack Query.
- **URL is the state.** Every search, filter, sort, tab and page number lives
  in the query string (`useUrlState`), so any view can be bookmarked or shared.
- **Public pages are static.** Home, about, services, FAQ and contact are
  prerendered with ISR (live stats revalidate every two minutes). The navbar
  learns the session from `/api/auth/me` so pages stay cacheable.
- **Times are Bangladesh time.** All formatting is pinned to `Asia/Dhaka`,
  and schedule inputs convert to the UTC ISO strings the API expects.

### Pages (35)

| Area | Routes |
|---|---|
| Public | `/`, `/schedule`, `/services`, `/about`, `/faq`, `/contact` |
| Auth | `/login` (one-click demo), `/register` |
| Customer | `/dashboard`, `/dashboard/schedule`, `/dashboard/outages`, `/dashboard/outages/new` (3-step wizard), `/dashboard/outages/[id]`, `/dashboard/bills`, `/dashboard/payments`, `/dashboard/notifications`, `/dashboard/profile` |
| Technician | `/technician`, `/technician/jobs/[id]`, `/technician/performance`, `/technician/profile`, `/technician/notifications` |
| Admin | `/admin`, `/admin/outages`, `/admin/outages/[id]`, `/admin/schedules`, `/admin/schedules/generate` (4-step wizard), `/admin/network`, `/admin/users`, `/admin/billing`, `/admin/reports`, `/admin/notifications` |
| Payment | `/payment/success`, `/payment/cancel`, `/payment/failed` |
| Utility | `not-found.tsx`, `error.tsx` (root + per area), `global-error.tsx` |

Every data page has a tailored `loading.tsx` skeleton. Every list has an empty
state. API failures surface as toasts or inline error panels with retry.

### Payment flow

1. **Bills → Pay** — choose Card (Stripe) or bKash; the API creates a
   checkout session and the browser goes to the hosted payment page.
2. The gateway returns to `/payment/success`, `/payment/cancel` or
   `/payment/failed`.
3. **Success** calls `POST /payments/:id/verify`. The API reads the session
   back from the gateway and settles the bill only if it is really paid with
   the right amount. The redirect alone is never trusted, and verification is
   idempotent.
4. **Cancel** calls `POST /payments/:id/cancel`, which expires the Stripe
   session and frees the bill. If the payer actually completed payment in
   another tab, the payment is settled instead.

## 📂 Project structure

```
app/
  (public)/        marketing pages + public schedule (ISR)
  (auth)/          login, register
  admin/ dashboard/ technician/   role areas (layout guards + error/loading)
  payment/         gateway return pages
  api/proxy/       BFF route handler      api/auth/  logout + session probe
components/
  ui/              shadcn/ui primitives
  shared/          DataTable, StatCard, StatusBadge, EmptyState, filters, pagination…
  charts/          ChartCard (chart ⇄ table), TrendChart, BarChart
  forms/           FormField, Stepper, ImageUpload, PasswordInput
  outages/ billing/ admin/ technician/ …   feature components
hooks/             useUrlState, useDebounce, useApiMutation, useSession
lib/
  api/             server + client fetchers, ApiError
  auth/            tokens, roles, session, server actions, refresh
  validations/     Zod schemas mirroring the API
  query/           query keys + URL → API param readers
stores/            Zustand stores
types/             API envelope + domain types
proxy.ts           route-level access control
```

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `API_BASE_URL` | API base, e.g. `http://localhost:5000/api/v1` (server-only) |
| `JWT_ACCESS_SECRET` | Must equal the API's `JWT_ACCESS_SECRET` (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this app (metadata, sitemap) |
| `DEMO_*_EMAIL` / `DEMO_*_PASSWORD` | Accounts used by the one-click demo buttons (server-only) |

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`.

> **Windows note:** `npm run dev` uses webpack. On this machine Turbopack's
> dev cache hit `EPERM` rename errors in `.next`, likely from file locking.
> `npm run dev:turbo` is kept for other environments. Production builds use
> Turbopack normally. As in the backend, `.npmrc` sets `script-shell=bash`
> because the folder name contains `&`.

## ☁️ Deployment (Vercel)

1. Import the repo into Vercel (framework preset: Next.js).
2. Set the environment variables above. `API_BASE_URL` is
   `https://powergrid-bd-backend.vercel.app/api/v1`, and `JWT_ACCESS_SECRET`
   must be the same value as the backend's.
3. On the **backend** project, set `FRONTEND_URL` to this app's URL, add it to
   `CORS_ORIGINS`, and set `STRIPE_SECRET_KEY` (test key) so card payments
   and the Stripe redirects work.
