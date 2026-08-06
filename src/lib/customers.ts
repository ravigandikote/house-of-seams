import { SupabaseClient } from '@supabase/supabase-js';
import { CustomerSource } from '../types/customer';

interface CustomerInput {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    source: CustomerSource;
    userId?: string | null;
}

// Upserts a customer record from any touchpoint (booking, custom design
// request, newsletter). Dedupes by email first, then phone. Best-effort:
// never throws — capturing the customer must not break the action that
// captured them. Requires the service-role client (customers has no
// public RLS policies).

export async function upsertCustomer(admin: SupabaseClient, input: CustomerInput): Promise<void> {
  try {
    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone?.trim() || null;
    const name = input.name?.trim() || null;
    if (!email && !phone) return;

    let existingId: string | null = null;
    if (email) {
      const { data } = await admin.from('customers').select('id, name, phone').ilike('email', email).limit(1).maybeSingle();
      if (data) {
        existingId = data.id;
        // Fill gaps without overwriting what we already know.
        const patch: Record<string, unknown> = {};
        if (!data.name && name) patch.name = name;
        if (!data.phone && phone) patch.phone = phone;
        if (input.userId) patch.user_id = input.userId;
        if (Object.keys(patch).length > 0) await admin.from('customers').update(patch).eq('id', data.id);
      }
    }
    if (!existingId && !email && phone) {
      const { data } = await admin.from('customers').select('id, name').eq('phone', phone).limit(1).maybeSingle();
      if (data) {
        existingId = data.id;
        if (!data.name && name) await admin.from('customers').update({ name }).eq('id', data.id);
      }
    }

    if (!existingId) {
      await admin.from('customers').insert({
        name,
        email,
        phone,
        source: input.source,
        user_id: input.userId ?? null,
      });
    }
  } catch {
    // best-effort by design
  }
}
