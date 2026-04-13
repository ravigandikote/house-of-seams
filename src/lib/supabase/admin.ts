import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured =
  supabaseUrl &&
  serviceRoleKey &&
  !supabaseUrl.includes('placeholder');

export function createAdminClient() {
  if (!isConfigured) {
    return null;
  }

  return createClient(
    supabaseUrl!,
    serviceRoleKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
