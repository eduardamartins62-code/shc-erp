"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'invite' | 'recovery' | 'unknown'>('unknown');

    // Session readiness states:
    // 'loading'  — waiting for Supabase to exchange the token / establish a session
    // 'ready'    — session confirmed, user can set their password
    // 'invalid'  — token expired, already used, or link is broken
    const [sessionState, setSessionState] = useState<'loading' | 'ready' | 'invalid'>('loading');

    useEffect(() => {
        let cancelled = false;

        async function init() {
            // ── Step 1: Handle PKCE code flow (?code=xxx in query string) ──
            // Newer Supabase projects use PKCE by default. The invite/recovery
            // email sends a link with ?code= instead of #access_token= .
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get('code');
            const type = searchParams.get('type'); // 'invite' | 'recovery' | null

            if (code) {
                try {
                    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        if (!cancelled) {
                            setError(
                                exchangeError.message.toLowerCase().includes('expired') ||
                                exchangeError.message.toLowerCase().includes('invalid')
                                    ? 'This link has expired or has already been used. Please ask an admin to resend the invitation.'
                                    : exchangeError.message
                            );
                            setSessionState('invalid');
                        }
                        return;
                    }
                    if (!cancelled) {
                        setMode(type === 'recovery' ? 'recovery' : 'invite');
                        setSessionState('ready');
                    }
                    return;
                } catch {
                    if (!cancelled) {
                        setError('Failed to verify the invitation link. Please try again or ask for a new invitation.');
                        setSessionState('invalid');
                    }
                    return;
                }
            }

            // ── Step 2: Handle legacy hash fragment flow (#access_token=...) ──
            // Older Supabase projects and email providers use the hash-based flow.
            const hash = window.location.hash;
            if (hash.includes('access_token')) {
                // detectSessionInUrl:true means the client already parsed the hash;
                // just wait for the session to be confirmed via onAuthStateChange.
                if (hash.includes('type=invite')) setMode('invite');
                else if (hash.includes('type=recovery')) setMode('recovery');

                // The client processes the hash asynchronously — poll for a session
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    if (!cancelled) setSessionState('ready');
                    return;
                }

                // If no session yet, wait for the SIGNED_IN event (max 8 s)
                let resolved = false;
                const timeout = setTimeout(() => {
                    if (!resolved && !cancelled) {
                        setError('Could not establish a session from this link. Please ask for a new invitation or password reset.');
                        setSessionState('invalid');
                    }
                }, 8000);

                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') && session) {
                        resolved = true;
                        clearTimeout(timeout);
                        subscription.unsubscribe();
                        if (!cancelled) setSessionState('ready');
                    }
                });
                return;
            }

            // ── Step 3: No token at all — maybe user navigated here directly ──
            // Check if there's already an active session (e.g., a password reset
            // for a currently-logged-in user, or a re-visit to this page).
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
                if (!cancelled) {
                    setMode('recovery');
                    setSessionState('ready');
                }
                return;
            }

            if (!cancelled) {
                setError('No valid invitation or password-reset link found. Please click the link from your email, or ask an admin to resend it.');
                setSessionState('invalid');
            }
        }

        init();
        return () => { cancelled = true; };
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setDone(true);
        setTimeout(() => router.replace('/'), 2500);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (done) {
        return (
            <div style={pageStyle}>
                <div style={cardStyle}>
                    <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ margin: '0 0 0.5rem', color: '#111827' }}>Password set!</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>Redirecting you to the app…</p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '8px',
                        background: 'var(--color-shc-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: 'white', fontSize: '14px', letterSpacing: '-0.5px'
                    }}>SHC</div>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>SHC ERP</span>
                </div>

                <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.375rem', fontWeight: 700, color: '#111827', textAlign: 'center' }}>
                    {mode === 'invite' ? 'Set your password' : 'Reset your password'}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', margin: '0 0 2rem' }}>
                    {mode === 'invite'
                        ? "You've been invited to SHC ERP. Create a password to activate your account."
                        : 'Enter a new password for your account.'}
                </p>

                {/* Session loading spinner */}
                {sessionState === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 0', color: '#6b7280' }}>
                        <Loader2 size={28} className="animate-spin" color="#C1272D" />
                        <span style={{ fontSize: '0.875rem' }}>Verifying your invitation link…</span>
                    </div>
                )}

                {/* Invalid / expired link */}
                {sessionState === 'invalid' && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                        <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <div>
                            <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#dc2626', fontSize: '0.875rem' }}>Link invalid or expired</p>
                            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.8rem' }}>{error || 'Please ask an admin to resend your invitation.'}</p>
                        </div>
                    </div>
                )}

                {/* Password form — only shown when session is ready */}
                {sessionState === 'ready' && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    required
                                    style={{ ...inputStyle, paddingRight: '2.75rem' }}
                                />
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Confirm Password</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.625rem 0.875rem', color: '#dc2626', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem', borderRadius: '8px', border: 'none',
                                backgroundColor: 'var(--color-shc-red)', color: 'white',
                                fontWeight: 600, fontSize: '0.9375rem', cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
                            }}
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Setting password…</> : 'Set Password & Sign In'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f6f8',
    padding: '1rem',
};

const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.375rem',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#374151',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111827',
};
