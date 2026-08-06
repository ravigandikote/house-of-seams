-- House of Seams: Muse Board (inspiration uploads on custom requests)
-- Run this in Supabase SQL Editor AFTER 005_design_story.sql.
--
-- Storage setup (already done via the storage admin API — kept here for
-- the record / disaster recovery):
--   * bucket `media`        public,  5MB limit, jpeg/png/webp/gif — admin
--     media library; served via public URLs
--   * bucket `muse-boards`  private, 5MB limit, jpeg/png/webp — client
--     inspiration images; served ONLY via service-role signed URLs
--   * NO storage.objects policies on purpose: all writes go through
--     service-role server routes, so anonymous storage access stays
--     default-deny.

-- {imagePaths: string[] (object keys in muse-boards), occasionNote: string|null}
ALTER TABLE custom_design_requests
  ADD COLUMN IF NOT EXISTS muse_board JSONB;
