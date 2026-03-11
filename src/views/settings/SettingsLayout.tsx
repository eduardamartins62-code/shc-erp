"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Warehouse, Link as LinkIcon, Settings as SettingsIcon, Globe } from 'lucide-react';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
    const pathname = usePathname() || '';

    const getLinkStyle = (isActive: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '6px',
        textDecoration: 'none',
        color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
        backgroundColor: isActive ? '#F5F6F7' : 'transparent',
        transition: 'all 0.2s',
        fontWeight: isActive ? 600 : 500
    });

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-primary-dark)', margin: '0 0 0.5rem 0' }}>
                    Settings
                </h2>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                    Manage users, warehouses, and system configuration.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Left side Navigation */}
                <div style={{
                    width: '250px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    flexShrink: 0
                }}>
                    <Link
                        href="/settings/users"
                        className={`nav-link ${pathname.startsWith('/settings/users') ? 'active' : ''}`}
                        style={getLinkStyle(pathname.startsWith('/settings/users'))}
                    >
                        <Users size={18} />
                        Users
                    </Link>

                    <Link
                        href="/settings/warehouses"
                        className={`nav-link ${pathname.startsWith('/settings/warehouses') ? 'active' : ''}`}
                        style={getLinkStyle(pathname.startsWith('/settings/warehouses'))}
                    >
                        <Warehouse size={18} />
                        Warehouses
                    </Link>

                    <Link
                        href="/settings/locations"
                        className={`nav-link ${pathname.startsWith('/settings/locations') ? 'active' : ''}`}
                        style={getLinkStyle(pathname.startsWith('/settings/locations'))}
                    >
                        <LinkIcon size={18} />
                        Locations
                    </Link>

                    <Link
                        href="/settings/channels"
                        className={`nav-link ${pathname.startsWith('/settings/channels') ? 'active' : ''}`}
                        style={getLinkStyle(pathname.startsWith('/settings/channels'))}
                    >
                        <Globe size={18} />
                        Channels & Integrations
                    </Link>

                    <Link
                        href="/settings/preferences"
                        className={`nav-link ${pathname.startsWith('/settings/preferences') ? 'active' : ''}`}
                        style={getLinkStyle(pathname.startsWith('/settings/preferences'))}
                    >
                        <SettingsIcon size={18} />
                        System Preferences
                    </Link>
                </div>

                {/* Right side Content Area */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
