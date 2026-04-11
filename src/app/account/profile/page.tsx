"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import type { Profile } from '@/types/account';

export default function ProfilePage() {
    const { user } = useAuthContext();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const supabase = createClient();

    useEffect(() => {
        if (!user) return;
        supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (data) setProfile(toCamelCase(data) as Profile);
                setLoading(false);
            });
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !user) return;
        setSaving(true);
        setMessage('');
        const updates = toSnakeCase({
            fullName: profile.fullName,
            phone: profile.phone,
        }) as Record<string, unknown>;
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        setSaving(false);
        setMessage(error ? error.message : 'Profile updated successfully!');
    };

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;

    return (
        <div>
            <h2 className="font-heading text-xl font-semibold mb-6">Profile Information</h2>
            {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSave} className="space-y-4 max-w-md">
                <Input label="Email" type="email" value={profile?.email || ''} disabled />
                <Input
                    label="Full Name"
                    type="text"
                    value={profile?.fullName || ''}
                    onChange={(e) => setProfile((p) => p ? { ...p, fullName: e.target.value } : p)}
                />
                <Input
                    label="Phone"
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile((p) => p ? { ...p, phone: e.target.value } : p)}
                />
                {profile?.avatarUrl && (
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1">Avatar</label>
                        <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full" />
                    </div>
                )}
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </div>
    );
}
