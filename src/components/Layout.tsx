"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Package,
    Warehouse,
    LayoutDashboard,
    Map as MapIcon,
    ShoppingCart,
    Activity,
    MapPin,
    Settings as SettingsIcon,
    AlertTriangle,
    ArrowDownToLine,
    ArrowLeftRight,
    ChevronLeft,
    ChevronRight,
    Menu,
} from 'lucide-react';

interface NavItem {
    to: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/products', icon: Package, label: 'Product Catalog' },
    { to: '/warehouses', icon: MapIcon, label: 'Stock by Warehouse' },
    { to: '/movements', icon: Activity, label: 'Movements' },
    { to: '/receiving', icon: ArrowDownToLine, label: 'Receiving' },
    { to: '/locations', icon: MapPin, label: 'Locations' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/data-management', icon: ArrowLeftRight, label: 'Imports & Exports' },
    { to: '/expiration', icon: AlertTriangle, label: 'Expiration Dashboard' },
];

const BOTTOM_NAV: NavItem[] = [
    { to: '/settings/users', icon: SettingsIcon, label: 'Settings' },
];

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return sessionStorage.getItem('sidebar-collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const [mobileOpen, setMobileOpen] = useState(false);

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

                    {/* Logo */}
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

                    {/* Main navigation links */}
                    <div className="sidebar-nav">
                        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => {
                            const isActive = end ? pathname === to : pathname.startsWith(to);
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
                    </div>
                </div>
            </nav>

            {/* ── Main content area ── */}
            <main className="main-content">
                <div className="main-inner">

                    {/* Topbar */}
                    <header className="card topbar-card">
                        {/* Mobile hamburger — shown via CSS only on mobile */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="topbar-location">
                            <span className="topbar-label">Location</span>
                            <div className="topbar-value">All Warehouses</div>
                        </div>

                        <div className="topbar-user">
                            <div className="user-avatar">SA</div>
                            <div className="user-info">
                                <div className="user-name">System Admin</div>
                                <div className="user-email">admin@shc.com</div>
                            </div>
                        </div>
                    </header>

                    {/* Page content rendered by Next.js */}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
