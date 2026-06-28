# SpotCheck — Project Handoff

> **Last updated:** June 28, 2026  
> **Author:** Kumar Vaibhav  
> **Repo:** https://github.com/kuvaibhav/Spot-Check  
> **Live URL:** Not yet publicly available — Vercel project has not been configured (see [Deployment Status](#deployment-status))

---

## Table of Contents

1. [What Is SpotCheck](#what-is-spotcheck)
2. [Tech Stack](#tech-stack)
3. [Running Locally](#running-locally)
4. [Project Structure](#project-structure)
5. [What's Implemented](#whats-implemented)
6. [What's Not Working / Missing](#whats-not-working--missing)
7. [Cloudflare R2 Migration Plan](#cloudflare-r2-migration-plan)
8. [Deployment Status (Vercel)](#deployment-status)
9. [Environment Variables Reference](#environment-variables-reference)

---

## What Is SpotCheck

SpotCheck is a personal, single-author review journal for food and places. It is a deliberate alternative to Yelp / Google Reviews — no crowd-sourced noise, just honest firsthand takes. Reviews are written in a password-protected admin panel and displayed publicly on the site.

Two content pillars:
- **The Bites** — food: restaurants, cafés, bars, bakeries, street food, etc.
- **The Vibes** — spaces: travel, nightlife, other experiences

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Storage (current) | In-memory — `src/data/sample-reviews.json` (no persistence) |
| Storage (target) | Cloudflare R2 (S3-compatible, free tier) |
| Image upload | Presigned URL flow (client uploads directly to storage) |
| Auth | HTTP-only cookie, compared against `ADMIN_PASSWORD` env var |
| Hosting | Vercel (configured in code, **not yet deployed**) |
| Package manager | npm |

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/kuvaibhav/Spot-Check.git
cd Spot-Check
npm install
cp .env.example .env.local   # edit values as needed
npm run dev
```

The dev server starts at **http://localhost:3000** by default.

> **Current session note:** During the June 28 2026 session, multiple `npm run dev` instances were started without fully killing prior ones. Ports 3000, 3001, and 3002 were occupied, so the server ended up on **http://localhost:3003**. If you see a 404 on 3000, check which port the server actually bound to in the terminal output.

### Common Port Conflict Issue

Next.js dev server binds to port 3000 by default. If you run `npm run dev` multiple times (or kill and restart quickly), stale Node processes may still hold 3000, 3001, 3002, etc. The server will keep incrementing ports and you will get unexpected 404s by hitting the wrong port.

**Fix — kill all stale Next.js processes before restarting:**

```bash
pkill -9 -f "next"
# wait a second, then:
npm run dev
```

Or specify a port explicitly to avoid the issue entirely:

```bash
PORT=4000 npm run dev
```

The server will then always bind to http://localhost:4000 regardless of stale processes.

### Admin Panel

Navigate to `http://localhost:3000/admin`. Default password is `changeme` (set by `ADMIN_PASSWORD` in `.env.local`). **Change this before any public deployment.**

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home — server component, fetches all reviews
│   ├── HomeClient.tsx            # Client component — search, filter, sort UI
│   ├── layout.tsx                # Root layout (metadata, body styles)
│   ├── globals.css               # Tailwind base + custom font declarations
│   ├── about/page.tsx            # About page
│   ├── categories/page.tsx       # Category browse page
│   ├── reviews/[id]/page.tsx     # Individual review detail
│   ├── admin/page.tsx            # Password-protected admin panel
│   └── api/
│       ├── auth/route.ts         # POST login / GET check / DELETE logout
│       ├── reviews/route.ts      # GET all / POST create / DELETE by id
│       ├── upload/route.ts       # POST — generates presigned upload URL
│       └── import/route.ts       # POST — bulk import from Google Takeout GeoJSON
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ReviewCard.tsx            # Card shown on home/category pages
│   ├── CategoryFilter.tsx        # Category pill-bar filter
│   ├── SearchBar.tsx
│   └── StarRating.tsx
├── lib/
│   ├── types.ts                  # Review, ReviewsData, Category, GoogleTakeout types
│   ├── reviews.ts                # USE_S3 gate — routes reads/writes to S3 or local JSON
│   ├── s3.ts                     # AWS SDK S3 client (will be pointed at R2)
│   └── import-google.ts          # Google Takeout GeoJSON → Review[] parser
└── data/
    └── sample-reviews.json       # 6 seed reviews (SF spots) — used when S3 is not configured
```

---

## What's Implemented

### Pages

| Route | Description |
|---|---|
| `/` | Home feed — all reviews with search, category filter, and sort (date / rating / name) |
| `/reviews/[id]` | Full review detail — rating, text, tags, price range, address, would-return |
| `/categories` | Browse reviews by category |
| `/about` | About page |
| `/admin` | Password-protected panel — create, manage, and import reviews |

### API Routes

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth` | `POST` `GET` `DELETE` | Login, session check, logout. Sets an `sc_admin` HTTP-only cookie (24h TTL). |
| `/api/reviews` | `GET` `POST` `DELETE` | Full review CRUD. DELETE takes `?id=<uuid>` query param. |
| `/api/upload` | `POST` | Returns a presigned URL so the browser can upload an image directly to storage. |
| `/api/import` | `POST` | Accepts a Google Takeout GeoJSON body, parses it, and bulk-writes to storage. |

### Data Model

Every review (`Review` type in `src/lib/types.ts`) carries:

- `id` (UUID), `placeName`, `address`, `category`, `rating` (1–5)
- `reviewText`, `visitDate`, `createdAt`, `updatedAt`
- `images` (array of storage URLs), `coordinates` (lat/lng)
- `source` (`"manual"` | `"google"` | `"yelp"`)
- `tags` (string array), `priceRange` (1–4, i.e. `$` to `$$$$`)
- `wouldReturn` (boolean), `googleMapsUrl`

### Categories

`restaurant` | `cafe` | `bar` | `dessert` | `fast-food` | `fine-dining` | `street-food` | `bakery` | `travel` | `nightlife` | `other`

### Auth

- Simple password check against `ADMIN_PASSWORD` env var
- Stores session as an `httpOnly`, `sameSite: strict` cookie (`sc_admin=authenticated`)
- Cookie is `secure: true` in production automatically
- **No rate limiting, no lockout** — this is intentionally minimal for a personal site

### Google Takeout Import

`src/lib/import-google.ts` parses the actual GeoJSON format exported by Google Maps Takeout:

- Reads `five_star_rating_published`, `review_text_published`, `location.name`, `location.address`, `google_maps_url`, `questions` (sub-ratings)
- Auto-categorizes based on keyword matching on the place name + review text
- Sets `wouldReturn: true` if rating ≥ 4
- Filters out entries with no rating published

### Storage Gate

`src/lib/reviews.ts` contains a `USE_S3` boolean:

```ts
const USE_S3 = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_ACCESS_KEY_ID !== "your-access-key-id"
);
```

When `USE_S3` is `false` (default locally), all reads come from `sample-reviews.json` and writes are silently dropped (no persistence). When `USE_S3` is `true`, reads and writes go through `src/lib/s3.ts`.

### Seed Data

`src/data/sample-reviews.json` contains 6 hand-written San Francisco reviews (Flour + Water, Tartine, Bi-Rite, El Farolito, Philz, Nopa) used as the local fallback.

---

## What's Not Working / Missing

### Critical (blocks real usage)

| Issue | Details |
|---|---|
| **No persistent storage** | `USE_S3` is `false` because `.env.local` still has placeholder credentials. Any review created via the admin panel is lost on the next server restart. All reads return the 6 seed reviews. |
| **Vercel not deployed** | The README references `kv-spotcheck.vercel.app` but no Vercel project has been connected. The site is not publicly accessible. |
| **Default admin password** | `.env.local` has `ADMIN_PASSWORD=changeme`. Must be changed before any public deployment. |

### Nice-to-Have (not blocking)

| Missing Feature | Notes |
|---|---|
| Image upload UI in admin | The `api/upload` presigned URL route exists but there is no file input wired up in the admin panel UI |
| Edit review | Only create and delete are implemented; no update/edit flow |
| Review pagination | Home page loads all reviews at once — fine for now, will need pagination beyond ~50 reviews |
| Map view | Coordinates are stored on every review but never visualized |
| Google Maps URL display | `googleMapsUrl` is stored but not rendered on the detail page |
| `priceRange` display | Stored on the review model but not rendered in `ReviewCard` or the detail page |
| No `api/reviews/[id]` PATCH | The `DELETE` is on the collection route via `?id=` — a RESTful PATCH endpoint for editing is missing |
| Port conflicts locally | Running `npm run dev` multiple times leaves stale processes (see [Running Locally](#running-locally)) |

---

## Cloudflare R2 Migration Plan

### Why R2

- **Free tier:** 10 GB storage, 1 million Class A operations/month, 10 million Class B operations/month — more than sufficient for a personal site indefinitely
- **No egress fees:** Unlike AWS S3, Cloudflare does not charge for data transfer out, which matters for image serving
- **S3-compatible API:** The existing `src/lib/s3.ts` code works with zero logic changes — only configuration changes are needed

### What Needs to Change (3 files only)

#### 1. `src/lib/s3.ts` — add the R2 endpoint

```ts
const s3Client = new S3Client({
  region: "auto",                                // R2 uses "auto"
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});
```

Also update `uploadImageToS3` to return the public R2 URL instead of the AWS URL format:

```ts
return `https://${process.env.R2_PUBLIC_DOMAIN}/images/${key}`;
```

#### 2. `.env.local` — replace AWS vars with R2 vars

```bash
# Remove these:
# AWS_REGION=us-west-2
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# S3_BUCKET_NAME=spot-check-reviews

# Add these:
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=spot-check
R2_PUBLIC_DOMAIN=pub-xxxx.r2.dev    # or your custom domain once set up

# Update the USE_S3 gate check in reviews.ts to key off R2_ACCESS_KEY_ID
```

#### 3. `next.config.js` — allow R2 image domains

```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    { protocol: "https", hostname: "*.r2.dev" },
    // keep the amazonaws pattern during transition if needed
  ],
},
```

#### Also update `src/lib/reviews.ts` — update the `USE_S3` gate

```ts
const USE_S3 = !!(
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_ID !== "your-r2-access-key"
);
```

### Step-by-Step Setup

1. Create a free Cloudflare account at https://cloudflare.com
2. Go to **R2 Object Storage** → **Create bucket** → name it `spot-check`
3. Under **R2 → Manage R2 API tokens** → create a token with **Object Read & Write** on the `spot-check` bucket
4. Copy the **Account ID**, **Access Key ID**, and **Secret Access Key**
5. Enable **Public access** on the bucket to get a `pub-xxxx.r2.dev` domain for image serving (or connect a custom domain)
6. Update `.env.local` with the values above
7. Apply the 3 code changes above
8. Restart the dev server — `USE_S3` will now be `true` and all reads/writes will go to R2

---

## Deployment Status

### Current State

The site is **not publicly accessible**. The README mentions `kv-spotcheck.vercel.app` as the intended URL but a Vercel project has never been connected to this repository.

### Steps to Deploy on Vercel

1. Go to https://vercel.com and sign in (or create a free account)
2. Click **Add New Project** → **Import Git Repository** → select `kuvaibhav/Spot-Check`
3. Framework preset: **Next.js** (auto-detected)
4. Add the following **Environment Variables** in the Vercel dashboard (under Project Settings → Environment Variables):

| Variable | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | `spot-check` |
| `R2_PUBLIC_DOMAIN` | Your R2 public domain (e.g. `pub-xxxx.r2.dev`) |
| `ADMIN_PASSWORD` | A strong password of your choice |
| `NEXT_PUBLIC_BASE_URL` | `https://kv-spotcheck.vercel.app` (or your custom domain) |

5. Click **Deploy** — Vercel will build and deploy automatically
6. Every push to `main` will trigger a new deployment

### Custom Domain (optional)

In Vercel → Project → Domains, add a custom domain and follow the DNS instructions.

---

## Environment Variables Reference

Full reference for `.env.local`:

```bash
# --- Cloudflare R2 (replace placeholder AWS vars with these) ---
CLOUDFLARE_ACCOUNT_ID=           # Found in Cloudflare dashboard → right sidebar
R2_ACCESS_KEY_ID=                # From R2 API token creation
R2_SECRET_ACCESS_KEY=            # From R2 API token creation
R2_BUCKET_NAME=spot-check        # The bucket name you created
R2_PUBLIC_DOMAIN=                # pub-xxxx.r2.dev or custom domain

# --- Admin ---
ADMIN_PASSWORD=changeme          # CHANGE THIS before any public deployment

# --- App ---
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # Change to production URL when deployed
```

> The `.env.local` file is gitignored and never committed. The `.env.example` file in the repo shows the required keys with placeholder values and should be kept up to date when variables are added or removed.
