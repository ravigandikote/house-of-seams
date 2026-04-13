"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const supabase = createClient();

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(!supabase ? false : true);

    useEffect(() => {
        if (!supabase) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = useCallback(async () => {
        if (!supabase) return { data: null, error: new Error('Supabase not configured') };
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        setLoading(false);
        return { data, error };
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        if (!supabase) return { data: null, error: new Error('Supabase not configured') };
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setUser(data.user);
        setSession(data.session);
        setLoading(false);
        return { data, error };
    }, []);

    const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
        if (!supabase) return { data: null, error: new Error('Supabase not configured') };
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        setLoading(false);
        return { data, error };
    }, []);

    const signOut = useCallback(async () => {
        if (!supabase) return { error: new Error('Supabase not configured') };
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
        return { error };
    }, []);

    return { user, session, loading, signInWithGoogle, signInWithEmail, signUp, signOut };
};

export { useAuth };
export default useAuth;
