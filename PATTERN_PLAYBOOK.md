# Pattern Playbook — for Kavya

How to run the Pattern Shop day-to-day. One pattern takes about 15
minutes end-to-end once the files are ready. (Store setup itself is in
`SHOPIFY_SETUP.md` — this playbook assumes that's done.)

## Add a new pattern, end-to-end

**1. In Shopify admin — the product (price + files)**
1. Products → Add product. Title as you want customers to see it.
2. Scroll to the bottom → **edit the URL handle** to the agreed handle
   (see the table in `SHOPIFY_SETUP.md` §6, or invent a new kebab-case
   one for a brand-new pattern — you'll type the same handle on our site
   in step 2).
3. Price: set the INR price, then *Manage pricing for markets* → set a
   clean USD price for the United States (₹499 / $12 style).
4. Untick “This is a physical product” (no shipping).
5. In the **Digital Downloads** app section on the product page, attach
   the pattern ZIP (A4 + A0 + instructions in one ZIP is simplest).
6. Set the product to **Active**.

**2. On our site — the presentation profile**
1. Admin → **Patterns** → Add Pattern (or edit an existing “coming
   soon” one — most of the standard catalog is already there waiting).
2. Type the **same handle** — this is the only thing that must match
   exactly. Everything else (difficulty, sizes, fabric notes, what's
   included, the sketch style) is presentation you control here, with a
   live drawing on the right.
3. Save. The pattern goes from “Coming soon” to purchasable on
   `/patterns` within a minute — no deploy needed.

**3. Verify (one minute)**
- Open `/patterns` → the card shows a price (₹ in India; use the
  currency toggle in the footer to check $).
- Open the pattern page → Add to Bag → Continue to Secure Checkout →
  you should land on the Shopify checkout. Don't complete the payment —
  or do once with a 100%-off discount code to test the download email.

## Refunds & re-delivery

- **Customer didn't get the file**: Shopify admin → Orders → open the
  order → the Digital Downloads section shows the delivery status; use
  **Resend download email**. (Also ask them to check spam.)
- **Refund**: Orders → open the order → Refund. Digital sales are
  usually final — a short shop policy saying “refunds for duplicate or
  mistaken purchases within 48h” is kind and safe. The Digital Downloads
  app disables the download link on full refund.
- **Wrong file uploaded**: fix the attachment on the product, then
  resend the download email from each affected order.

## Prices & sales

- Change prices any time in Shopify — the site shows them live, no
  deploy needed.
- Shopify discount codes work at checkout automatically (make one code
  per festival sale; the site needs nothing).

## Jewellery & ready-made pieces (same shop, one at a time)

Any existing product on the site can become purchasable:
1. Create it in Shopify (physical product this time — set weight and a
   shipping profile; India + US market prices).
2. Our Admin → Products → edit the piece → fill **Shopify handle**.
3. Its page now shows the live price + Add to Bag; leaving the handle
   empty keeps the current enquiry behaviour. Remove the handle to go
   back — nothing else changes.

## The one rule

**The handle is the contract.** Same handle in Shopify and in our
admin = live and purchasable. Typo = “coming soon” (patterns) or
enquiry-style (products) — never an error, but do double-check spelling.
