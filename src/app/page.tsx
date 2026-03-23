"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
    Warehouse,
    LogOut,
    ChevronRight,
    Clock,
    Users,
} from 'lucide-react';

interface AppTile {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    available: boolean;
    color: string;
}

const APP_TILES: AppTile[] = [
    {
        id: 'wms',
        name: 'WMS',
        description: 'Warehouse Management — inventory, orders, receiving, locations, and fulfillment operations.',
        icon: <Warehouse size={32} />,
        href: '/wms',
        available: true,
        color: '#C1272D',
    },
    {
        id: 'crm',
        name: 'CRM',
        description: 'Customer Relationship Management — contacts, deals, and sales pipeline.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#2563eb',
    },
    {
        id: 'accounting',
        name: 'Accounting',
        description: 'Financial management — invoices, expenses, P&L, and reporting.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#059669',
    },
    {
        id: 'hr',
        name: 'HR',
        description: 'Human Resources — employees, payroll, time tracking, and onboarding.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#7c3aed',
    },
    {
        id: 'analytics',
        name: 'Analytics',
        description: 'Business intelligence — cross-module reporting, KPIs, and dashboards.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#d97706',
    },
    {
        id: 'purchasing',
        name: 'Purchasing',
        description: 'Procurement — purchase orders, vendors, and supplier management.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#0891b2',
    },
    {
        id: 'sales',
        name: 'Sales',
        description: 'Sales management — quotes, orders, commissions, and customer pricing.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#16a34a',
    },
    {
        id: 'dropshipping',
        name: 'Dropshipping',
        description: 'Dropship operations — supplier routing, auto-POs, and vendor fulfillment tracking.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12H19" />
                <path d="M12 5l7 7-7 7" />
                <circle cx="5" cy="12" r="2" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#ea580c',
    },
    {
        id: 'globallogistics',
        name: 'Global Logistics',
        description: 'Shipping & logistics — carrier management, rate shopping, tracking, and label generation.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        href: '#',
        available: false,
        color: '#0e7490',
    },
];

export default function ERPHome() {
    const { currentUser, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !currentUser) {
            router.replace('/login');
        }
    }, [loading, currentUser, router]);

    if (loading || !currentUser) return null;

    const initials = currentUser.fullName
        .split(' ')
        .map((w: string) => w[0])
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
                </div>

                {/* Admin link — account admins only */}
                {currentUser.isAccountAdmin && (
                    <Link href="/admin/users" style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 500,
                        textDecoration: 'none', padding: '0.3rem 0.75rem',
                        borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    >
                        <Users size={14} />
                        Users & Permissions
                    </Link>
                )}

                {/* User + logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                    <button
                        onClick={signOut}
                        title="Sign out"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.5)', padding: '4px',
                            display: 'flex', alignItems: 'center',
                            borderRadius: '4px',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >
                        <LogOut size={17} />
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem' }}>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        Welcome back, {currentUser.fullName.split(' ')[0]}
                    </h1>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                        Select an application to get started.
                    </p>
                </div>

                {/* App grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.25rem',
                }}>
                    {APP_TILES.map(app => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
            </main>
        </div>
    );
}

function AppCard({ app }: { app: AppTile }) {
    const router = useRouter();

    function handleClick() {
        if (!app.available) return;
        router.push(app.href);
    }

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: app.available ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s, transform 0.15s',
                position: 'relative',
                overflow: 'hidden',
                opacity: app.available ? 1 : 0.6,
            }}
            onMouseEnter={e => {
                if (!app.available) return;
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
            }}
        >
            {/* Coming soon badge */}
            {!app.available && (
                <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    backgroundColor: '#f3f4f6', borderRadius: '999px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.7rem', fontWeight: 600, color: '#6b7280',
                }}>
                    <Clock size={11} /> Coming soon
                </div>
            )}

            {/* Icon */}
            <div style={{
                width: 56, height: 56, borderRadius: '12px',
                backgroundColor: `${app.color}15`,
                color: app.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
            }}>
                {app.icon}
            </div>

            {/* Text */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                    <h3 style={{ margin: '0 0 0.375rem', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        {app.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        {app.description}
                    </p>
                </div>
                {app.available && (
                    <ChevronRight size={18} style={{ flexShrink: 0, color: 'var(--color-text-muted)', marginTop: '0.125rem' }} />
                )}
            </div>
        </div>
    );
}
