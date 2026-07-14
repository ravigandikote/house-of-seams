import { CustomDesignRequest, CustomDesignRequestInput } from '../types/customDesignRequest';

export async function submitCustomDesignRequest(
    input: CustomDesignRequestInput
): Promise<CustomDesignRequest> {
    const res = await fetch('/api/customize/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to submit your request. Please try again.');
    }
    return res.json();
}
