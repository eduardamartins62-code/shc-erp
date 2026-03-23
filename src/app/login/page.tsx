"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Warehouse, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { signIn } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn(email, password);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.replace('/');
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '14px',
                        backgroundColor: 'var(--color-sidebar-bg)',
                        marginBottom: '1rem',
                    }}>
                        <Warehouse size={28} color="var(--color-shc-red)" />
                    </div>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        SHC ERP
                    </h1>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Sign in to your account
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    padding: '2rem',
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {error && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#991b1b',
                                fontSize: '0.875rem',
                            }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.15s',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'var(--color-shc-red)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 2.5rem 0.625rem 0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={e => (e.target.style.borderColor = 'var(--color-shc-red)')}
                                    onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.625rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                backgroundColor: loading ? '#e5e7eb' : 'var(--color-shc-red)',
                                color: loading ? 'var(--color-text-muted)' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.15s',
                                marginTop: '0.25rem',
                            }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Don't have access? Contact your system administrator.
                </p>
            </div>
        </div>
    );
}
