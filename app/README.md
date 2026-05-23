# uxcourse — web app

The marketing + product surface for the on-demand UX × AI course generator.

This is a **separate app** from the Vite/React site at the repo root. The root
app stays as it is; everything here lives under `/home/user/uxcourse/app/`.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- shadcn/ui-style primitives (hand-rolled, in `src/components/ui/`)
- Server actions for form submission and the (stubbed) Stripe call
- File-based JSON store at `data/generations.json` (swap for Postgres later)

## Run

```bash
cd app
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

Default mode is `MOCK=true` — Stripe and the course generator are stubbed and
work with no keys. See `.env.example` for the (currently empty) live-mode vars.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing — value prop, how-it-works, pricing |
| `/start` | Profile form |
| `/checkout` | Stubbed Stripe checkout (mock mode only) |
| `/generating/[id]` | Status screen, polls `/api/generations/[id]` |
| `/course/[id]` | Course reader with TOC, citations, download |
| `/admin` | Hidden, unauthenticated list of recent generations |
| `/api/generations/[id]` | Status JSON |
| `/api/generations/[id]/download?format=md` | Markdown download |

## How it talks to the rest of the repo

- **`/dataset/`** — public-domain source list (articles, podcasts, talks, etc).
  The web app doesn't read this directly; the generator does.
- **`/pipeline/`** — the actual course generation engine (built by a parallel
  agent). This app calls it via `src/lib/courseGenerator.ts`, which currently
  returns a mocked `Course`. The TODO at the top of that file shows exactly
  where to swap in `generateCourse(profile, dataset)` from the pipeline package.
- **`src/lib/types.ts`** — shared `Course`, `Lesson`, `Citation`, `LearnerProfile`
  types. **Keep in sync with `pipeline/types.ts`** when that file lands. The
  long-term plan is to extract this into a shared package.

## What's mocked vs real

| Concern | Mock (default) | Real |
| --- | --- | --- |
| Payment | `/checkout` page with a "Pay $100 (mock)" button | Stripe Checkout — see `STRIPE_INTEGRATION.md` |
| Course generation | Returns a deterministic sample `Course` after ~6s delay with progress callbacks | Real pipeline at `/pipeline/` |
| Storage | JSON file at `data/generations.json` | Swap `src/lib/storage.ts` for Postgres / Supabase |
| Email | Not wired | Plug a provider behind a new `src/lib/email.ts` adapter |

Toggle with `MOCK=false` in `.env.local` once the real adapters are in.

## Design tone

Editorial, confident, mobile-first. Inter for body, Source Serif 4 for display
headings. One accent color (warm orange, `--accent`) used sparingly. Closer to
Stripe Press / Linear marketing than a chat-AI product.

## Conventions

- Server components by default; client islands marked `"use client"` (`status-view.tsx`, `course-actions.tsx`, the radix-based form primitives).
- All external services behind adapters in `src/lib/`. None call out to the
  network in default `MOCK=true` mode.
- Persistence interactions go through `src/lib/storage.ts` — never read/write
  `data/generations.json` directly from a page.

## Open follow-ups

- Real auth on `/admin` (currently a hidden route — fine for MVP, not for prod).
- Email delivery of the finished course (Resend? Postmark?).
- Background job runner for `generateCourse` so requests don't depend on a
  single Node process staying alive (Inngest / Trigger.dev / Vercel Queues).
- Server-rendered PDF instead of browser print (e.g. `@react-pdf/renderer` or
  a headless-Chrome service).
