"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import {
    Package,
    Warehouse,
    LayoutDashboard,
    Map as MapIcon,
    ShoppingCart,
    Activity,
    MapPin,
    Settings as SettingsIcon,
    ArrowDownToLine,
    ArrowLeftRight,
    ChevronLeft,
    ChevronRight,
    Menu,
    LogOut,
    LayoutGrid,
} from 'lucide-react';

interface NavItem {
    to: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { to: '/wms', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/wms/products', icon: Package, label: 'Product Catalog' },
    { to: '/wms/warehouses', icon: MapIcon, label: 'Stock by Warehouse' },
    { to: '/wms/movements', icon: Activity, label: 'Adjustments' },
    { to: '/wms/receiving', icon: ArrowDownToLine, label: 'Receiving' },
    { to: '/wms/locations', icon: MapPin, label: 'Locations' },
    { to: '/wms/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/wms/data-management', icon: ArrowLeftRight, label: 'Imports & Exports' },
];

const BOTTOM_NAV: NavItem[] = [
    { to: '/wms/settings/warehouses', icon: SettingsIcon, label: 'Settings' },
];

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { warehouses, selectedWarehouseId, setSelectedWarehouseId } = useSettings();
    const { currentUser, loading, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return sessionStorage.getItem('sidebar-collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const [mobileOpen, setMobileOpen] = useState(false);

    // Redirect to login if not authenticated (skip on /login itself)
    useEffect(() => {
        if (!loading && !currentUser && pathname !== '/login') {
            router.replace('/login');
        }
    }, [loading, currentUser, pathname, router]);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(prev => {
            const next = !prev;
            try {
                sessionStorage.setItem('sidebar-collapsed', String(next));
            } catch { /* ignore */ }
            return next;
        });
    }, []);

    const sidebarClass = [
        'sidebar',
        collapsed ? 'sidebar-collapsed' : '',
        mobileOpen ? 'sidebar-open' : '',
    ]
        .filter(Boolean)
        .join(' ');

    // While checking auth, show a full-screen loader instead of blank
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-light)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading…</div>
            </div>
        );
    }

    if (!currentUser) return null;

    // Build initials for avatar
    const initials = currentUser.fullName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="app-shell">
            {/* Mobile overlay — tap to close drawer */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <nav className={sidebarClass}>
                <div className="sidebar-inner">

                    {/* Logo + ERP Home link */}
                    <div className="sidebar-logo">
                        <Warehouse
                            size={26}
                            color="var(--color-shc-red)"
                            className="sidebar-logo-icon"
                        />
                        <div className="sidebar-logo-text">
                            <div className="sidebar-brand">WMS</div>
                            <div className="sidebar-subtitle">ERP Module</div>
                        </div>
                    </div>

                    {/* ERP Home button */}
                    <Link
                        href="/"
                        className="nav-link"
                        title="ERP Home"
                        style={{
                            margin: '0 0 0.25rem',
                            fontSize: '0.78rem',
                            opacity: 0.75,
                            borderRadius: '6px',
                        }}
                    >
                        <LayoutGrid size={16} style={{ flexShrink: 0 }} />
                        <span className="nav-link-label">ERP Home</span>
                    </Link>

                    <div className="sidebar-divider" />

                    {/* Warehouse selector */}
                    <div className="sidebar-warehouse">
                        <select
                            value={selectedWarehouseId}
                            onChange={e => setSelectedWarehouseId(e.target.value)}
                            className="sidebar-warehouse-select"
                            title="Select warehouse"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.warehouseName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Main navigation links */}
                    <div className="sidebar-nav">
                        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => {
                            const isActive = end ? (pathname === to || pathname === '/wms/') : pathname.startsWith(to);
                            return (
                                <Link
                                    key={to}
                                    href={to}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    title={label}
                                >
                                    <Icon size={20} style={{ flexShrink: 0 }} />
                                    <span className="nav-link-label">{label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom: collapse toggle + settings */}
                    <div className="sidebar-bottom">
                        {/* Collapse/expand toggle — desktop only (hidden via CSS on mobile) */}
                        <button
                            className="sidebar-collapse-btn"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed
                                ? <ChevronRight size={16} style={{ flexShrink: 0 }} />
                                : <ChevronLeft size={16} style={{ flexShrink: 0 }} />
                            }
                            <span className="nav-link-label">Collapse</span>
                        </button>

                        <div className="sidebar-divider" />

                        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => {
                            const isActive = pathname.startsWith(to);
                            return (
                                <Link
                                    key={to}
                                    href={to}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    title={label}
                                >
                                    <Icon size={20} style={{ flexShrink: 0 }} />
                                    <span className="nav-link-label">{label}</span>
                                </Link>
                            );
                        })}

                        <div className="sidebar-divider" />

                        {/* User info + logout */}
                        <div className="sidebar-user" title={currentUser.fullName}>
                            <div className="sidebar-user-avatar">{initials}</div>
                            <div className="sidebar-user-info">
                                <div className="sidebar-user-name">{currentUser.fullName}</div>
                                <div className="sidebar-user-email">{currentUser.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="nav-link"
                            title="Sign out"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', opacity: 0.7 }}
                        >
                            <LogOut size={18} style={{ flexShrink: 0 }} />
                            <span className="nav-link-label">Sign out</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Main content area ── */}
            <main className="main-content">
                <div className="main-inner">

                    {/* Mobile-only hamburger strip — hidden on desktop */}
                    <div className="mobile-topbar">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={18} />
                        </button>
                    </div>

                    {/* Page content rendered by Next.js */}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
