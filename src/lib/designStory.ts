import { createAdminClient } from '@/lib/supabase/admin';
import { toCamelCase } from '@/lib/caseTransform';
import { CustomDesignRequest, RequestStatusEvent } from '@/types/customDesignRequest';

// SERVER-ONLY data access for the Design Story page. Reads go through the
// service-role client: RLS on custom_design_requests/request_status_events
// stays closed to the public, and the unguessable atelier_token IS the
// page's authorisation. Never import this from a client component.

export interface DesignStory {
    request: CustomDesignRequest;
    events: RequestStatusEvent[];
}

export type DesignStoryResult =
    | { kind: 'demo' }
    | { kind: 'not_found' }
    | { kind: 'found'; story: DesignStory };

export async function getDesignStoryByToken(token: string): Promise<DesignStoryResult> {
    // Tokens are hex from gen_random_bytes — reject anything else outright.
    if (!/^[0-9a-f]{16,64}$/.test(token)) return { kind: 'not_found' };

    const admin = createAdminClient();
    if (!admin) return { kind: 'demo' };

    const { data: request, error } = await admin
        .from('custom_design_requests')
        .select('*')
        .eq('atelier_token', token)
        .maybeSingle();
    if (error || !request) return { kind: 'not_found' };

    const { data: events } = await admin
        .from('request_status_events')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });

    return {
        kind: 'found',
        story: {
            request: toCamelCase(request) as CustomDesignRequest,
            events: toCamelCase(events || []) as RequestStatusEvent[],
        },
    };
}
