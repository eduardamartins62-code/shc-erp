"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'invite' | 'recovery' | 'unknown'>('unknown');

    // Supabase puts the token in the URL hash — detect the type
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('type=invite')) setMode('invite');
        else if (hash.includes('type=recovery')) setMode('recovery');
        // Supabase JS v2 auto-parses the hash and sets the session
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
