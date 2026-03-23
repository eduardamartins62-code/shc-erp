"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Warehouse, LayoutGrid, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!currentUser || !currentUser.isAccountAdmin)) {
            router.replace(currentUser ? '/' : '/login');
        }
    }, [loading, currentUser, router]);

    if (loading || !currentUser || !currentUser.isAccountAdmin) return null;

    const initials = currentUser.fullName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-light)' }}>
            {/* Topbar */}
            <header style={{
                backgroundColor: 'var(--color-sidebar-bg)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.5rem',
                gap: '1rem',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: '7px',
                        backgroundColor: 'var(--color-shc-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Warehouse size={16} color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                        SHC ERP
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 0.25rem' }}>/</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}>
                        Users & Permissions
                    </span>
                </div>

                {/* Nav */}
                <Link href="/" style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 500,
                    textDecoration: 'none', padding: '0.3rem 0.75rem',
                    borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)',
                }}>
                    <LayoutGrid size={14} />
                    ERP Home
                </Link>

                {/* User + logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{currentUser.fullName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>{currentUser.email}</div>
                    </div>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        backgroundColor: 'var(--color-shc-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 700,
                    }}>
                        {initials}
                    </div>
                    <button onClick={signOut} title="Sign out" style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.5)', padding: '4px',
                        display: 'flex', alignItems: 'center', borderRadius: '4px',
                    }}>
                        <LogOut size={17} />
                    </button>
                </div>
            </header>

            {/* Page content */}
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(1.5rem, 3vw, 2.5rem) 1.5rem' }}>
                {children}
            </main>
        </div>
    );
}
