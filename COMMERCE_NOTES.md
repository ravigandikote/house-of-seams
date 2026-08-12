# Commerce Notes — decisions, deferred work, and one big idea

Technical notes for the Shopify rail (Phases S1–S3). For day-to-day ops
see `PATTERN_PLAYBOOK.md`; for store setup see `SHOPIFY_SETUP.md`.

## What "US-ready" means today

- Prices are region-aware end-to-end: the `hos_region` cookie (footer/
  cart toggle, locale-guessed default) drives Shopify Markets pricing
  via `@inContext` on every query, and `cartBuyerIdentityUpdate`
  re-prices an existing bag on switch. INR shows as ₹499 (rounded,
  en-IN grouping); USD as $12.00.
- Checkout, taxes, and (for physical goods) shipping/duties are all
  Shopify's problem by design — we never estimate them. The
  `CommerceNote` component states this under every commerce CTA.
- `metadataBase` is set from `NEXT_PUBLIC_BASE_URL`, so canonical and
  OG URLs resolve correctly wherever the site is deployed.

## A dedicated /us experience (documented, deliberately not built)

Today one URL serves both regions with cookie-based pricing — correct
and simple, but invisible to search engines (Google sees one page with
INR prices). If US organic traffic becomes a goal, the upgrade path is:

1. Locale-segmented routes (`/us/patterns/...`) or a `us.` subdomain,
   statically rendered per region — the region stops being a cookie and
   becomes part of the URL.
2. `hreflang` pairs between the IN and US versions of each commerce
   page (only meaningful once both have stable URLs).
3. USD-first copy tweaks (spelling, "shipping from India — 7–12 days"
   notes) and a US-priced homepage section.
4. Middleware geo-redirect on first visit (Vercel provides the country
   header) — with a visible override, never a trap.

Effort: roughly a phase of its own; touches routing, the region lib,
and every commerce page's metadata. Not worth it before the shop has
US sales to justify it.

## The long-term differentiator: custom-graded patterns (feasibility)

**The idea**: a premium "Made-to-Measure Pattern" product. The buyer
fills in the same slider measurements the customizer already collects;
Kavya drafts the pattern to those exact numbers and delivers a personal
PDF. No Etsy seller can match this — it fuses the atelier's fitting
knowledge with the pattern shop's reach.

**Data flow (all pieces already exist):**
1. Buyer completes a customizer-style measurement step attached to a
   pattern purchase (the spec/slider system is category-generic today).
2. On Shopify checkout, the order carries a reference to a measurement
   submission — either as cart attributes (Storefront API supports
   custom attributes on cart lines) or by creating a lightweight
   Supabase row (like a custom_design_request with
   category='graded_pattern') whose reference travels in the cart note.
3. The order lands in Shopify; the measurement row lands in our admin —
   linked by the reference, exactly like consultation bookings link to
   design requests today.
4. Kavya drafts the graded PDF (her manual work — hours, priced
   accordingly) and delivers it through the existing **Design Story
   page** for that submission: the atelier journal gains a "your
   pattern is ready" chapter with the file. Muse boards, annotations,
   and the consultation bridge all apply for free.

**Build estimate**: one focused phase — a `graded_pattern` request
category (the pipeline is category-generic), a cart-attribute reference,
an admin file-attach step on the Design Story (small Storage upload,
signed URL delivery), and copy. The hard part is Kavya's drafting
capacity, not the software — which is why it should be priced as
couture, not as a download.
