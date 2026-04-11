# House of Seams — Technical Architecture

## 1. Project Overview

**House of Seams** is a fashion and jewellery e-commerce website built for a boutique that specializes in custom blouses, bridal couture, luxury embroidered pieces, and curated jewellery.

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.0.0 |
| UI | React | 18.0.0 |
| Language | TypeScript | ^4.0.0 |
| Database & Auth | Supabase (`@supabase/supabase-js` + `@supabase/ssr`) | ^2.103.0 / ^0.5.2 |
| Payments | Razorpay | ^2.0.0 |
| State Management | Zustand | ^4.5.7 |
| CSS | Tailwind CSS | ^3.0.0 |
| Forms | react-hook-form | ^7.0.0 |
| Node.js | (via nvm) | 18.x required |

---

## 2. Directory Structure

```
house-of-seams/
├── docs/                    # Documentation (this file + admin guide)
├── public/images/           # Static images (products, categories, gallery, uploads)
├── supabase/
│   ├── migrations/          # SQL schema migration (run in Supabase SQL Editor)
│   └── seed.sql             # Sample data INSERT statements
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── (public pages)   # /, /products, /collections, /gallery, /blog, etc.
│   │   ├── account/         # User account pages (profile, orders, addresses, wishlist)
│   │   ├── admin/           # Admin panel pages (dashboard, CRUD for all entities)
│   │   ├── api/
│   │   │   ├── admin/       # Admin CRUD API routes (7 resources + upload + media)
│   │   │   └── payment/     # Razorpay create-order and verify routes
│   │   ├── auth/callback/   # OAuth callback handler
│   │   ├── checkout/        # Checkout and success pages
│   │   └── login/           # Login/signup page
│   ├── components/
│   │   ├── admin/           # Admin-specific components (sidebar, table, modal, etc.)
│   │   ├── blog/            # Blog card and post components
│   │   ├── cart/            # Cart and checkout components
│   │   ├── collections/     # Category grid and cards
│   │   ├── gallery/         # Gallery grid
│   │   ├── home/            # Hero, FeaturedProducts, Categories, InstagramFeed
│   │   ├── layout/          # Header and Footer
│   │   ├── products/        # Product grid and cards
│   │   ├── providers/       # AuthProvider (React Context)
│   │   ├── testimonials/    # Testimonial cards
│   │   └── ui/              # Reusable UI primitives (Button, Input, Modal, etc.)
│   ├── hooks/               # Custom React hooks (useAuth, useCart, useRazorpay, useAdminCrud)
│   ├── lib/
│   │   ├── supabase/        # Supabase client instances (client, server, admin, middleware)
│   │   └── caseTransform.ts # snake_case <-> camelCase converter
│   ├── services/            # Data-access service layer (adminApiService, blogService, etc.)
│   ├── store/               # Zustand stores (cart, wishlist, UI)
│   ├── styles/              # globals.css, theme.ts
│   ├── types/               # TypeScript interfaces for all entities
│   ├── utils/               # Helpers, formatters, validators, SEO utilities
│   └── data/                # Static JSON fallback data (legacy, replaced by Supabase)
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind customization
└── middleware.ts             # Edge middleware (auth + pathname header)
```

---

## 3. Environment Variables

### Required (`.env.local`)

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service-role key (bypasses RLS) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client + Server | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Server only | Razorpay secret (HMAC, order creation) |
| `NEXT_PUBLIC_BASE_URL` | Client | Site base URL (e.g., `http://localhost:3000`) |

### Optional (in `.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Direct Postgres connection |
| `NEXT_PUBLIC_CLOUDINARY_URL` | Cloudinary image hosting |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps on contact page |
| `NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN` | Instagram feed integration |

---

## 4. Supabase Client Setup

Three clients exist for different execution contexts:

### Browser Client (`src/lib/supabase/client.ts`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Reads `NEXT_PUBLIC_*` env vars
- **Used by:** Client components, hooks (`useAuth`, `useGallery`), `blogService.ts`

### Server Client (`src/lib/supabase/server.ts`)
- Uses `createServerClient` from `@supabase/ssr`
- Manages cookies via `next/headers` for session handling
- **Used by:** Server components (public pages), auth callback, `create-order` API route

### Admin Client (`src/lib/supabase/admin.ts`)
- Uses `createClient` directly from `@supabase/supabase-js`
- Uses `SUPABASE_SERVICE_ROLE_KEY` — **bypasses all RLS policies**
- `autoRefreshToken: false`, `persistSession: false`
- **Used by:** All `/api/admin/*` routes, payment verify route

### Middleware Helper (`src/lib/supabase/middleware.ts`)
- `updateSession(request)` — refreshes auth tokens on every request
- Called from `src/middleware.ts`

---

## 5. Database Schema

**Migration file:** `supabase/migrations/001_initial_schema.sql`
**Seed data:** `supabase/seed.sql`

### Tables (13 total)

#### Content Tables (public read, admin write via service role)

| Table | Primary Key | Key Columns | Notes |
|-------|-------------|-------------|-------|
| `products` | UUID | name, slug (UNIQUE), description, category, price (NUMERIC 10,2), image, image_url, is_featured | Indexed on category, slug, is_featured |
| `categories` | UUID | name, description, image, image_url | |
| `gallery` | UUID | url, alt, category | Indexed on category |
| `blog_posts` | UUID | title, slug (UNIQUE), content, author, published_date, tags (TEXT[]), excerpt, image_url | Indexed on slug, published_date |
| `testimonials` | UUID | name, quote, role, rating (1-5 CHECK), date, image_url | |
| `faqs` | UUID | question, answer, sort_order | Indexed on sort_order |
| `pricing` | UUID | service, price_range, description | |

#### User Tables

| Table | Primary Key | Key Columns | Notes |
|-------|-------------|-------------|-------|
| `profiles` | UUID (FK -> auth.users) | full_name, email, phone, avatar_url | 1:1 with auth.users, auto-created by trigger |
| `addresses` | UUID | user_id (FK), label, full_name, phone, address_line1/2, city, state, pincode, is_default | |
| `wishlists` | UUID | user_id (FK), product_id (FK), UNIQUE(user_id, product_id) | |

#### Order Tables

| Table | Primary Key | Key Columns | Notes |
|-------|-------------|-------------|-------|
| `orders` | UUID | user_id (FK), order_number (UNIQUE, auto-generated HOS-YYYYMMDD-NNNN), status, total_amount, currency, shipping_address (JSONB), razorpay_order_id, razorpay_payment_id, payment_status | Uses `order_number_seq` sequence |
| `order_items` | UUID | order_id (FK CASCADE), product_id (FK SET NULL), product_name, product_image, quantity, unit_price, total_price | |
| `bookings` | UUID | customer_name, email, phone, date, time, service, notes, status, user_id (FK SET NULL) | |

### Triggers

| Trigger | Table | Function | Purpose |
|---------|-------|----------|---------|
| `on_auth_user_created` | auth.users | `handle_new_user()` | Auto-creates profile with name, email, avatar from Google metadata |
| `set_order_number` | orders | `generate_order_number()` | Generates `HOS-YYYYMMDD-NNNN` format order numbers |
| `update_*_updated_at` (x11) | All mutable tables | `update_updated_at()` | Sets `updated_at = NOW()` on every UPDATE |

### Row Level Security (RLS)

All 13 tables have RLS enabled.

- **Content tables:** Public `SELECT` for everyone. No public writes (admin uses service-role client which bypasses RLS).
- **profiles:** Users can SELECT and UPDATE own row.
- **addresses:** Full CRUD on own rows.
- **wishlists:** SELECT, INSERT, DELETE on own rows.
- **orders:** SELECT and INSERT on own rows. Updates done via service-role (payment verification).
- **order_items:** SELECT and INSERT gated by subquery checking parent order ownership.
- **bookings:** Public INSERT. SELECT limited to own bookings.

---

## 6. Authentication Flow

### Supported Methods
1. **Google OAuth** — primary, via `signInWithOAuth({ provider: 'google' })`
2. **Email/Password** — via `signInWithPassword()` and `signUp()`

### Flow

```
User clicks "Sign in with Google"
  → Redirected to Google consent screen
  → Google redirects to /auth/callback?code=...
  → src/app/auth/callback/route.ts exchanges code for session
  → Supabase sets auth cookies
  → handle_new_user() trigger auto-creates profile row
  → User redirected to / (or ?next= URL)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | Client-side hook: session management, auth methods |
| `src/components/providers/AuthProvider.tsx` | React Context wrapping useAuth for the entire app |
| `src/app/auth/callback/route.ts` | Server-side OAuth code exchange |
| `src/app/login/page.tsx` | Login/signup page with Google + email forms |
| `src/middleware.ts` | Session refresh + route protection |

### Protected Routes

Middleware redirects unauthenticated users to `/login?next={path}` for:
- `/account/*`
- `/checkout`

**Note:** `/admin` routes are NOT currently protected by auth middleware. Admin protection should be added before production deployment.

---

## 7. Payment Flow (Razorpay)

### End-to-End Flow

```
1. User fills checkout → selects shipping address → clicks "Pay"
2. Client POST /api/payment/create-order
   → Server authenticates user (Supabase server client)
   → Verifies product prices server-side (admin client)
   → Creates Razorpay order via REST API (amount in paise)
   → Inserts pending order + order_items in DB
   → Returns { orderId, razorpayOrderId, amount, currency }
3. Client opens Razorpay checkout modal (useRazorpay hook)
4. User completes payment in Razorpay widget
5. Razorpay handler POST /api/payment/verify
   → Computes HMAC-SHA256 of "order_id|payment_id" with secret
   → Compares with razorpay_signature
   → Updates order: paid/confirmed or failed/cancelled
6. Client redirects to /checkout/success?orderId=...
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/payment/create-order/route.ts` | Creates Razorpay order + DB order |
| `src/app/api/payment/verify/route.ts` | HMAC signature verification |
| `src/hooks/useRazorpay.ts` | Lazy-loads Razorpay SDK, opens modal |
| `src/components/cart/CheckoutForm.tsx` | Checkout UI with address selection |
| `src/app/checkout/success/page.tsx` | Order confirmation page |

---

## 8. Admin Panel Architecture

### API Route Pattern

All admin CRUD goes through REST API routes:

```
GET    /api/admin/{resource}       → List all (ordered by created_at DESC)
POST   /api/admin/{resource}       → Create new
PUT    /api/admin/{resource}/{id}  → Update by UUID
DELETE /api/admin/{resource}/{id}  → Delete by UUID
```

Resources: `products`, `categories`, `gallery`, `blog`, `testimonials`, `faqs`, `pricing`

Plus: `POST /api/admin/upload` (image upload), `GET/DELETE /api/admin/media` (media management)

All routes use `createAdminClient()` (service-role, bypasses RLS) and the `toCamelCase`/`toSnakeCase` transform layer.

### Frontend Data Flow

```
Admin Page
  → useAdminCrud<Type>("resource") hook
    → adminApiService.fetchItems/createItem/updateItem/deleteItem
      → fetch("/api/admin/{resource}")
        → Supabase admin client query
```

### Component Library

| Component | File | Purpose |
|-----------|------|---------|
| AdminSidebar | `src/components/admin/AdminSidebar.tsx` | Navigation (10 items, responsive) |
| AdminTopBar | `src/components/admin/AdminTopBar.tsx` | Top bar with hamburger + "View Site" |
| AdminTable | `src/components/admin/AdminTable.tsx` | Generic data table with Edit/Delete |
| AdminFormModal | `src/components/admin/AdminFormModal.tsx` | Modal form for create/edit |
| AdminPageHeader | `src/components/admin/AdminPageHeader.tsx` | Title + action button |
| DeleteConfirmDialog | `src/components/admin/DeleteConfirmDialog.tsx` | Deletion confirmation |
| ImageUploader | `src/components/admin/ImageUploader.tsx` | Image upload with preview |
| Toast | `src/components/admin/Toast.tsx` | Notification system |

---

## 9. Public Pages — Data Fetching

Public pages are **async server components** that fetch directly from Supabase using the server client:

```typescript
// Example: src/app/products/page.tsx
const ProductsPage = async () => {
    const supabase = createClient();  // server client
    const { data } = await supabase.from('products').select('*');
    const products = toCamelCase(data || []) as any[];
    return <ProductGrid products={products} />;
};
```

The home page fetches both products and categories in parallel via `Promise.all` and passes them as props to child components.

### Case Transform Layer (`src/lib/caseTransform.ts`)

Bridges the gap between DB (`snake_case`) and TypeScript (`camelCase`):
- `toCamelCase(obj)` — used when **reading** from Supabase
- `toSnakeCase(obj)` — used when **writing** to Supabase

Both recursively transform all object keys in nested structures.

---

## 10. State Management (Zustand)

| Store | File | Persisted | Key State |
|-------|------|-----------|-----------|
| Cart | `src/store/cartStore.ts` | Yes (localStorage: `hos-cart`) | cartItems, addToCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice |
| Wishlist | `src/store/wishlistStore.ts` | Yes (localStorage: `hos-wishlist`) | wishlist, addToWishlist, removeFromWishlist, isInWishlist |
| UI | `src/store/uiStore.ts` | No (in-memory) | isLoading, isModalOpen |

Cart and Wishlist use Zustand's `persist` middleware for localStorage persistence.

---

## 11. Styling

### Tailwind Custom Tokens (`tailwind.config.ts`)

**Colors:**

| Token | Light | Default | Dark |
|-------|-------|---------|------|
| `dusty-rose` | `#F0D4DA` | `#D6A6B1` | `#B87A88` |
| `sage-green` | `#D4E3D1` | `#B7C9B5` | `#8FA88D` |
| `cream` | — | `#FDF8F5` | — |
| `charcoal` | — | `#2D2D2D` | — |
| `warm-gray` | — | `#6B6B6B` | — |

**Fonts:**
- Headings: Playfair Display (`font-heading`)
- Body: Inter (`font-body`)

**Custom Animations:** `fade-in-up`, `fade-in`, `slide-in-left`, `scale-in`

---

## 12. Admin vs Public Separation

The admin and public sites share one Next.js app but are separated by:

1. **Middleware** — sets `x-pathname` header on every request
2. **Root Layout** (`src/app/layout.tsx`) — checks pathname: admin routes render without Header/Footer, public routes include them
3. **Admin Layout** (`src/app/admin/layout.tsx`) — provides its own shell (sidebar, top bar, toast)
4. **AuthProvider** wraps both admin and public sections

---

## 13. Deployment Checklist

1. **Create Supabase project** at supabase.com
2. **Run migration** — paste `supabase/migrations/001_initial_schema.sql` into SQL Editor
3. **Run seed data** — paste `supabase/seed.sql` into SQL Editor
4. **Enable Google Auth** — Supabase Dashboard > Authentication > Providers > Google > add OAuth credentials
5. **Create Razorpay account** — get test/live Key ID + Key Secret
6. **Set environment variables** — update `.env.local` (or hosting provider env) with real values
7. **Protect admin routes** — add authentication check for `/admin/*` (middleware or layout-level)
8. **Upgrade Node.js** — Supabase JS v2 recommends Node 20+
9. **Deploy** — Vercel (recommended for Next.js), Netlify, or any Node.js host
10. **Configure domain** — set `NEXT_PUBLIC_BASE_URL` to production URL
11. **Update Razorpay mode** — switch from test to live keys
12. **Update Google OAuth redirect** — add production callback URL in Google Cloud Console
