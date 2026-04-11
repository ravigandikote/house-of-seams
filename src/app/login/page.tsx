"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const LoginPage = () => {
    const { signInWithGoogle, signInWithEmail, signUp, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';
    const authError = searchParams.get('error');

    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(authError === 'auth_failed' ? 'Authentication failed. Please try again.' : '');
    const [message, setMessage] = useState('');

    const handleGoogleSignIn = async () => {
        setError('');
        const { error } = await signInWithGoogle();
        if (error) setError(error.message);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (mode === 'login') {
            const { error } = await signInWithEmail(email, password);
            if (error) {
                setError(error.message);
            } else {
                router.push(next);
            }
        } else {
            const { data, error } = await signUp(email, password, fullName);
            if (error) {
                setError(error.message);
            } else if (data.user && !data.session) {
                setMessage('Check your email for a confirmation link.');
            } else {
                router.push(next);
            }
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="font-heading text-3xl font-bold text-charcoal">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="mt-2 text-warm-gray">
                        {mode === 'login' ? 'Sign in to your account' : 'Join House of Seams'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-charcoal font-medium hover:border-dusty-rose hover:bg-gray-50 transition-all duration-200"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-cream text-warm-gray">or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    )}
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <p className="text-center text-sm text-warm-gray">
                    {mode === 'login' ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <button onClick={() => { setMode('signup'); setError(''); }} className="text-dusty-rose hover:underline font-medium">
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => { setMode('login'); setError(''); }} className="text-dusty-rose hover:underline font-medium">
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
