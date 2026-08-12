-- House of Seams: opt-in Shopify checkout for existing physical products
-- Run this in Supabase SQL Editor AFTER 011_pattern_profiles.sql.
--
-- The Supabase products catalog is NOT migrated. Where Kavya sets a
-- shopify_handle on a product (one at a time, from our admin), its page
-- shows the live Shopify price + add-to-bag through the same commerce
-- module the Pattern Shop uses; products without a handle keep the
-- current enquiry-style behaviour exactly as-is. A handle whose Shopify
-- product doesn't exist (yet) also falls back to enquiry — never errors.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shopify_handle TEXT UNIQUE;
