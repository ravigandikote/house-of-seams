# Shopify Setup — House of Seams Pattern Shop

One-time setup for the headless commerce backend. The site runs in
**commerce demo mode** (placeholder products, disabled checkout) until
these steps are done and the env vars are set — nothing breaks without
them, so do this at your own pace.

The custom-design / atelier / consultation pipeline stays entirely on
Supabase. Shopify only ever handles **purchasable products** (sewing
patterns now; selected jewellery/ready-made later).

---

## 1. Create the store

1. Go to <https://www.shopify.com/in> → Start free trial.
   - Store name suggestion: `house-of-seams` (the domain becomes
     `house-of-seams.myshopify.com` — that exact value is an env var later).
   - Country: **India**. Currency: **INR**.
2. Pick the cheapest plan when the trial nags — **Shopify Basic** is
   enough (headless storefront + digital products need nothing higher).
3. Settings → General: fill the business address (needed for Markets
   and GST invoices later).

## 2. Custom app + Storefront API token

1. Admin → **Settings → Apps and sales channels → Develop apps**
   → *Allow custom app development* → **Create an app**, name it
   `House of Seams Website`.
2. **Configuration → Storefront API** → enable these scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts` *(cart + checkout)*
   - `unauthenticated_read_checkouts`
3. **Install app**, then open **API credentials** and copy the
   **Storefront API access token** (starts with `shpat_`-style public
   token; it is safe to expose to the browser — that is its purpose).
   We do NOT need an Admin API token for anything built so far.

## 3. Digital downloads delivery

1. Admin → Apps → search the App Store for **“Shopify Digital Downloads”**
   (free, by Shopify) → Install.
   - Alternative if you outgrow it: “Sky Pilot” or “Filemonk” (paid,
     nicer emails + streaming limits). Start with the free one.
2. For every pattern product you create later: open the product → the
   Digital Downloads app section → attach the PDF file(s) (A4 + A0
   versions can be one ZIP or separate variants — one ZIP is simplest).
3. In the app's settings, set fulfilment to **automatic** so the
   download email goes out the moment payment lands.
4. The order-confirmation email template can carry a link to our
   printing/assembly guide — add `https://<site>/patterns/thank-you`
   there once Phase S2 ships that page.

## 4. Markets: India (INR) + United States (USD)

1. Admin → **Settings → Markets**.
   - **India** should already exist as the primary market (INR).
   - **Add market → United States**, currency **USD**.
2. Pricing: in each product you can either let Shopify auto-convert or
   (recommended for patterns) set **fixed prices per market** — e.g.
   ₹499 in India and $12 in the US — via the product's *Manage pricing
   for markets* link. Round USD prices to clean numbers; auto-converted
   ₹499 → $6.07 looks accidental.
3. Digital products need no shipping setup. When physical products join
   later (Phase S3), configure US shipping rates in Markets → United
   States → Shipping at that point, not now.
4. Payments: **Settings → Payments** — activate Razorpay (India cards +
   UPI) and/or Shopify Payments availability as offered for your
   account; PayPal is worth enabling for US buyers.

## 5. Environment variables

Local (`house-of-seams/.env.local`) — add:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=house-of-seams.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<Storefront API access token from step 2>
```

Vercel (Project → Settings → Environment Variables) — add the same two
for Production (and Preview if you use it), then redeploy.

Notes:
- Both are `NEXT_PUBLIC_` on purpose: the Storefront API token is a
  public, rate-limited, read+cart-scoped token designed for browsers.
  There is **no** private Shopify secret in this integration.
- Until these are set (or while they contain the word `placeholder`),
  the site shows demo pattern products and a disabled checkout — safe
  to deploy at any time.

## 6. Product handles (IMPORTANT)

Our site matches Shopify products to their presentation profiles by the
product **handle** (the URL slug, editable at the bottom of the product
page in Shopify admin). Create each product with the exact handle below
— title and price are yours to choose; the handle is the contract. A
profile whose handle has no Shopify product yet simply shows as
“coming soon” on the site, so add them in any order, one at a time.

| Handle (must match exactly) | Pattern |
|---|---|
| `princess-cut-blouse-pattern` | Princess Cut Blouse |
| `single-katori-blouse-pattern` | Single Katori Blouse |
| `double-katori-blouse-pattern` | Double Katori Blouse |
| `three-dart-blouse-pattern` | Three Dart Blouse |
| `four-dart-blouse-pattern` | Four Dart Blouse |
| `choli-cut-blouse-pattern` | Choli Cut Blouse |
| `deep-round-back-blouse-pattern` | Deep Round Back Blouse |
| `boat-neck-blouse-pattern` | Boat Neck Blouse |
| `high-neck-blouse-pattern` | High Neck Blouse |
| `backless-tie-blouse-pattern` | Backless Tie Blouse |
| `sleeve-block-pack-pattern` | Sleeve Block Pack (6 styles) |
| `a-line-6-kali-lehenga-pattern` | 6-Kali A-Line Lehenga |
| `kalidar-lehenga-8-pattern` | 8-Kali Lehenga |
| `kalidar-lehenga-12-pattern` | 12-Kali Lehenga |
| `umbrella-lehenga-pattern` | Umbrella Cut Lehenga |
| `mermaid-lehenga-pattern` | Mermaid Lehenga |
| `sharara-pattern` | Sharara Pair |
| `straight-kurti-pattern` | Straight Kurti |
| `a-line-kurti-pattern` | A-Line Kurti |
| `flared-kurti-pattern` | Flared Kurti |
| `anarkali-kalidar-kurti-pattern` | Anarkali Kalidar |
| `salwar-pattern` | Classic Salwar |
| `churidar-pattern` | Churidar |
| `palazzo-pattern` | Palazzo |
| `patiala-pattern` | Patiala Salwar |
| `straight-pant-pattern` | Straight Pant |
| `pattu-pavadai-pattern` | Pattu Pavadai (Kids) |
| `kids-choli-pattern` | Kids Choli |
| `bodice-block-pattern` | Personal Bodice Block |
| `petticoat-pattern` | Saree Petticoat |

## 7. Quick sanity test (after steps 1–5)

Tell Ravi/Claude the store is live — we then run: product fetch in INR
and USD, a cart round-trip, and a checkout redirect. Nothing else needs
to change on the site.
