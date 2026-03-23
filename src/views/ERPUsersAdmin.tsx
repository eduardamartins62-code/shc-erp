"use client";

import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SlideOverPanel } from '../components/ui/SlideOverPanel';
import {
    Plus, Edit2, ShieldCheck, Shield, UserMinus, KeyRound,
    Check, X, Loader2, Mail,
} from 'lucide-react';
import type { User, UserPermissions, PermissionModuleKey, PermissionLevel, AppAccess, ERPAppKey } from '../types';
import {
    DEFAULT_PERMISSIONS, DEFAULT_APP_ACCESS,
    PERMISSION_MODULES, ERP_APPS,
} from '../types/settings';

// ─── Constants ───────────────────────────────────────────────────────────────

const PERMISSION_GROUPS: { group: string; modules: PermissionModuleKey[] }[] = [
    {
        group: 'Operations',
        modules: ['dashboard', 'products', 'inventory', 'locations', 'orders', 'receiving'],
    },
    {
        group: 'Administration',
        modules: ['dataManagement', 'settingsUsers', 'settingsWarehouses', 'settingsChannels', 'settingsPreferences'],
    },
];

const LEVELS: { value: PermissionLevel; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'view', label: 'View' },
    { value: 'edit', label: 'View & Edit' },
    { value: 'admin', label: 'Admin' },
];

const LEVEL_STYLE: Record<PermissionLevel, { bg: string; color: string }> = {
    none: { bg: '#f3f4f6', color: '#6b7280' },
    view: { bg: '#dbeafe', color: '#1d4ed8' },
    edit: { bg: '#dcfce7', color: '#166534' },
    admin: { bg: '#fee2e2', color: '#991b1b' },
};

const APP_COLORS: Record<ERPAppKey, string> = {
    wms: '#C1272D',
    crm: '#2563eb',
    accounting: '#059669',
    hr: '#7c3aed',
    analytics: '#d97706',
    purchasing: '#0891b2',
    sales: '#16a34a',
    dropshipping: '#ea580c',
    globallogistics: '#0e7490',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function PermissionBadge({ level }: { level: PermissionLevel }) {
    const s = LEVEL_STYLE[level];
    const labels: Record<PermissionLevel, string> = { none: 'None', view: 'View', edit: 'View & Edit', admin: 'Admin' };
    return (
        <span style={{
            display: 'inline-block', padding: '0.125rem 0.5rem',
            borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
            backgroundColor: s.bg, color: s.color,
        }}>
            {labels[level]}
        </span>
    );
}

function AppAccessGrid({
    appAccess,
    onChange,
    readOnly,
}: {
    appAccess: AppAccess;
    onChange?: (app: ERPAppKey, val: boolean) => void;
    readOnly?: boolean;
}) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {(Object.entries(ERP_APPS) as [ERPAppKey, string][]).map(([key, label]) => {
                const active = appAccess[key];
                const color = APP_COLORS[key];
                return (
                    <div
                        key={key}
                        onClick={() => !readOnly && onChange?.(key, !active)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 0.75rem', borderRadius: '8px',
                            border: `1px solid ${active ? color : 'var(--color-border)'}`,
                            backgroundColor: active ? `${color}10` : '#f9fafb',
                            cursor: readOnly ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            backgroundColor: active ? color : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {active
                                ? <Check size={11} color="white" strokeWidth={3} />
                                : <X size={11} color="#9ca3af" strokeWidth={2.5} />
                            }
                        </div>
                        <span style={{
                            fontSize: '0.775rem', fontWeight: 500,
                            color: active ? color : 'var(--color-text-muted)',
                            lineHeight: 1.2,
                        }}>
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function WMSPermissionTable({
    permissions,
    onChange,
    readOnly,
}: {
    permissions: UserPermissions;
    onChange?: (mod: PermissionModuleKey, level: PermissionLevel) => void;
    readOnly?: boolean;
}) {
    return (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', fontSize: '0.8rem' }}>
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr repeat(4, 72px)',
                backgroundColor: '#f9fafb', borderBottom: '1px solid var(--color-border)',
                padding: '0.5rem 0.75rem',
            }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Module</span>
                {LEVELS.map(l => (
                    <span key={l.value} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        {l.label}
                    </span>
                ))}
            </div>
            {PERMISSION_GROUPS.map((group, gi) => (
                <div key={group.group}>
                    <div style={{
                        padding: '0.3rem 0.75rem', backgroundColor: '#f3f4f6',
                        borderBottom: '1px solid var(--color-border)',
                        borderTop: gi > 0 ? '1px solid var(--color-border)' : undefined,
                        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
                        textTransform: 'uppercase', color: 'var(--color-text-muted)',
                    }}>
                        {group.group}
                    </div>
                    {group.modules.map((mod, mi) => {
                        const current = permissions[mod];
                        return (
                            <div key={mod} style={{
                                display: 'grid', gridTemplateColumns: '1fr repeat(4, 72px)',
                                padding: '0.4rem 0.75rem', alignItems: 'center',
                                borderBottom: mi < group.modules.length - 1 ? '1px solid #f3f4f6' : undefined,
                                backgroundColor: 'white',
                            }}>
                                <span style={{ color: 'var(--color-text-primary)', fontSize: '0.78rem' }}>
                                    {PERMISSION_MODULES[mod]}
                                </span>
                                {LEVELS.map(l => (
                                    <div key={l.value} style={{ display: 'flex', justifyContent: 'center' }}>
                                        {readOnly ? (
                                            <span style={{
                                                width: 13, height: 13, borderRadius: '50%',
                                                border: `2px solid ${current === l.value ? LEVEL_STYLE[l.value].color : '#d1d5db'}`,
                                                backgroundColor: current === l.value ? LEVEL_STYLE[l.value].color : 'transparent',
                                                display: 'inline-block',
                                            }} />
                                        ) : (
                                            <input
                                                type="radio"
                                                name={`perm-${mod}`}
                                                value={l.value}
                                                checked={current === l.value}
                                                onChange={() => onChange?.(mod, l.value)}
                                                style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--color-shc-red)' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ERPUsersAdmin() {
    const { users, warehouses, addUser, updateUser } = useSettings();
    const { currentUser } = useAuth();

    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        isAccountAdmin: false,
        isActive: true,
        allowedWarehouses: [] as string[],
        appAccess: { ...DEFAULT_APP_ACCESS } as AppAccess,
        permissions: { ...DEFAULT_PERMISSIONS } as UserPermissions,
    });

    function openModal(user?: User) {
        setSaveError('');
        setInviteStatus('idle');
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                isAccountAdmin: user.isAccountAdmin,
                isActive: user.isActive,
                allowedWarehouses: user.allowedWarehouses || [],
                appAccess: { ...DEFAULT_APP_ACCESS, ...user.appAccess },
                permissions: { ...DEFAULT_PERMISSIONS, ...user.permissions },
            });
        } else {
            setEditingUser(null);
            setFormData({
                fullName: '', email: '',
                isAccountAdmin: false, isActive: true,
                allowedWarehouses: [],
                appAccess: { ...DEFAULT_APP_ACCESS },
                permissions: { ...DEFAULT_PERMISSIONS },
            });
        }
        setIsModalOpen(true);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaveError('');
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                allowedWarehouses: formData.allowedWarehouses.includes('ALL') || formData.allowedWarehouses.length === 0
                    ? null : formData.allowedWarehouses,
            };
            if (editingUser) {
                await updateUser(editingUser.id, dataToSave);
                if (detailUser?.id === editingUser.id) setDetailUser({ ...editingUser, ...dataToSave } as User);
                setIsModalOpen(false);
            } else {
                // 1. Insert into users table
                await addUser({ ...dataToSave, createdBy: currentUser?.fullName || 'System', updatedBy: currentUser?.fullName || 'System' });

                // 2. Send invite email via server-side API (creates Supabase Auth account)
                setInviteStatus('sending');
                const res = await fetch('/api/admin/invite-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        name: formData.fullName,
                        redirectTo: `${window.location.origin}/reset-password`,
                    }),
                });
                const json = await res.json();
                if (!res.ok && !json.alreadyExists) {
                    setInviteStatus('error');
                    setSaveError(`User created but invite email failed: ${json.error}. They can still be manually invited later.`);
                    // Don't close modal so user can see the error
                    setSaving(false);
                    return;
                }
                setInviteStatus('sent');
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error(err);
            setSaveError('Error saving user. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleResetPassword(email: string) {
        setResetStatus('sending');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
            setResetStatus('error');
            setTimeout(() => setResetStatus('idle'), 3000);
        } else {
            setResetStatus('sent');
            setTimeout(() => setResetStatus('idle'), 4000);
        }
    }

    return (
        <div>
            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        Users & Permissions
                    </h1>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Manage who has access to each application and what they can do inside them.
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    style={{
                        backgroundColor: 'var(--color-shc-red)', color: 'white',
                        border: 'none', padding: '0.5rem 1rem', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer', fontWeight: 500, flexShrink: 0,
                    }}
                >
                    <Plus size={18} /> Add User
                </button>
            </div>

            {/* User cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map(user => (
                    <UserRow
                        key={user.id}
                        user={user}
                        onEdit={() => openModal(user)}
                        onSelect={() => setDetailUser(user)}
                    />
                ))}
            </div>

            {/* ── Detail Panel ── */}
            <SlideOverPanel
                isOpen={!!detailUser}
                onClose={() => setDetailUser(null)}
                title="User Profile"
                actions={
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => detailUser && openModal(detailUser)}>
                            <Edit2 size={14} /> Edit
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: '120px', justifyContent: 'center' }}
                            disabled={resetStatus === 'sending'}
                            onClick={() => detailUser && handleResetPassword(detailUser.email)}
                        >
                            {resetStatus === 'sending' ? (
                                <><Loader2 size={13} className="animate-spin" /> Sending…</>
                            ) : resetStatus === 'sent' ? (
                                <><Check size={13} style={{ color: '#16a34a' }} /> Email sent!</>
                            ) : resetStatus === 'error' ? (
                                <><X size={13} style={{ color: '#dc2626' }} /> Failed</>
                            ) : (
                                <><KeyRound size={14} /> Reset Password</>
                            )}
                        </button>
                    </>
                }
            >
                {detailUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Header */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{detailUser.fullName}</h3>
                                <span style={{
                                    padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                    backgroundColor: detailUser.isActive ? '#dcfce7' : '#f3f4f6',
                                    color: detailUser.isActive ? '#166534' : '#4b5563',
                                }}>
                                    {detailUser.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{detailUser.email}</p>
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: detailUser.isAccountAdmin ? 'var(--color-shc-red)' : 'var(--color-text-muted)' }}>
                                {detailUser.isAccountAdmin ? <><ShieldCheck size={14} /> Super Admin — full access to all apps</> : <><Shield size={14} /> Custom permissions</>}
                            </div>
                        </div>

                        {/* App Access */}
                        <div>
                            <p style={{ margin: '0 0 0.625rem', fontWeight: 600, fontSize: '0.875rem' }}>Application Access</p>
                            {detailUser.isAccountAdmin ? (
                                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', fontSize: '0.8rem', color: '#92400e' }}>
                                    Super Admin has access to all applications.
                                </div>
                            ) : (
                                <AppAccessGrid appAccess={{ ...DEFAULT_APP_ACCESS, ...detailUser.appAccess }} readOnly />
                            )}
                        </div>

                        {/* WMS permissions */}
                        {!detailUser.isAccountAdmin && (
                            <div>
                                <p style={{ margin: '0 0 0.625rem', fontWeight: 600, fontSize: '0.875rem' }}>WMS Module Permissions</p>
                                <WMSPermissionTable
                                    permissions={{ ...DEFAULT_PERMISSIONS, ...detailUser.permissions }}
                                    readOnly
                                />
                            </div>
                        )}

                        {/* Activate / deactivate */}
                        <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                            {detailUser.isActive ? (
                                <button className="btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', color: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)' }}
                                    onClick={async () => {
                                        if (confirm(`Deactivate ${detailUser.fullName}?`)) {
                                            await updateUser(detailUser.id, { isActive: false });
                                            setDetailUser(prev => prev ? { ...prev, isActive: false } : null);
                                        }
                                    }}>
                                    <UserMinus size={16} /> Deactivate User
                                </button>
                            ) : (
                                <button className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                    onClick={async () => {
                                        await updateUser(detailUser.id, { isActive: true });
                                        setDetailUser(prev => prev ? { ...prev, isActive: true } : null);
                                    }}>
                                    Activate User
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            {/* ── Add / Edit Modal ── */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                    zIndex: 1000, overflowY: 'auto', padding: '2rem 1rem',
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '10px',
                        padding: '2rem', width: '720px', maxWidth: '95vw',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem', color: 'var(--color-primary-dark)' }}>
                            {editingUser ? 'Edit User' : 'Add User'}
                        </h3>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Basic info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>Full Name *</label>
                                    <input type="text" required value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>Email *</label>
                                    <input type="email" required value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                    <input type="checkbox" checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: 15, height: 15, accentColor: 'var(--color-shc-red)' }}
                                    />
                                    Active
                                </label>
                            </div>

                            {/* Super Admin toggle */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.875rem 1rem', borderRadius: '8px',
                                backgroundColor: formData.isAccountAdmin ? '#fff7ed' : '#f9fafb',
                                border: `1px solid ${formData.isAccountAdmin ? '#fed7aa' : 'var(--color-border)'}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={18} color={formData.isAccountAdmin ? '#c2410c' : 'var(--color-text-muted)'} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: formData.isAccountAdmin ? '#c2410c' : 'var(--color-text-primary)' }}>
                                            Super Admin
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            Full access to all apps and all modules. Overrides all settings below.
                                        </p>
                                    </div>
                                </div>
                                <input type="checkbox" checked={formData.isAccountAdmin}
                                    onChange={e => setFormData({ ...formData, isAccountAdmin: e.target.checked })}
                                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-shc-red)' }}
                                />
                            </div>

                            {!formData.isAccountAdmin && (
                                <>
                                    {/* App access */}
                                    <div>
                                        <p style={{ margin: '0 0 0.625rem', fontWeight: 600, fontSize: '0.875rem' }}>Application Access</p>
                                        <AppAccessGrid
                                            appAccess={formData.appAccess}
                                            onChange={(app, val) => setFormData(prev => ({ ...prev, appAccess: { ...prev.appAccess, [app]: val } }))}
                                        />
                                    </div>

                                    {/* WMS module permissions — only show if WMS access is enabled */}
                                    {formData.appAccess.wms && (
                                        <div>
                                            <p style={{ margin: '0 0 0.625rem', fontWeight: 600, fontSize: '0.875rem' }}>WMS Module Permissions</p>
                                            <WMSPermissionTable
                                                permissions={formData.permissions}
                                                onChange={(mod, level) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [mod]: level } }))}
                                            />
                                        </div>
                                    )}

                                    {/* Warehouse access */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                            Allowed Warehouses <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(WMS)</span>
                                        </label>
                                        <select multiple
                                            value={formData.allowedWarehouses.length === 0 ? ['ALL'] : formData.allowedWarehouses}
                                            onChange={e => {
                                                const vals = Array.from(e.target.selectedOptions, o => o.value);
                                                setFormData({ ...formData, allowedWarehouses: vals.includes('ALL') ? [] : vals.filter(v => v !== 'ALL') });
                                            }}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', minHeight: '72px' }}
                                        >
                                            <option value="ALL">— All Warehouses —</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.warehouseName} ({w.warehouseCode})</option>
                                            ))}
                                        </select>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>Hold Cmd/Ctrl to select multiple.</p>
                                    </div>
                                </>
                            )}

                            {/* Error message */}
                            {saveError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.625rem 0.875rem', color: '#dc2626', fontSize: '0.8rem' }}>
                                    {saveError}
                                </div>
                            )}

                            {/* Invite info banner — new users only */}
                            {!editingUser && (
                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.625rem 0.875rem', fontSize: '0.8rem', color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <Mail size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                    <span>An invite email will be sent to this address so they can set their password and sign in.</span>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '0.5rem 1.25rem', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    style={{ padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-shc-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {saving
                                        ? <><Loader2 size={15} className="animate-spin" />{inviteStatus === 'sending' ? 'Sending invite…' : 'Saving…'}</>
                                        : editingUser ? 'Save Changes' : 'Create & Send Invite'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── User Row Card ────────────────────────────────────────────────────────────

function UserRow({ user, onEdit, onSelect }: { user: User; onEdit: () => void; onSelect: () => void }) {
    const grantedApps = user.isAccountAdmin
        ? Object.keys(ERP_APPS) as ERPAppKey[]
        : (Object.entries(user.appAccess || {}) as [ERPAppKey, boolean][]).filter(([, v]) => v).map(([k]) => k);

    return (
        <div
            onClick={onSelect}
            style={{
                backgroundColor: 'white', border: '1px solid var(--color-border)',
                borderRadius: '10px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                cursor: 'pointer', transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
            {/* Avatar */}
            <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                backgroundColor: user.isAccountAdmin ? 'var(--color-shc-red)' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: user.isAccountAdmin ? 'white' : '#6b7280',
                fontSize: '0.8rem', fontWeight: 700,
            }}>
                {user.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{user.fullName}</span>
                    {user.isAccountAdmin && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-shc-red)', backgroundColor: '#fff1f2', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                            <ShieldCheck size={11} /> Super Admin
                        </span>
                    )}
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '999px',
                        backgroundColor: user.isActive ? '#dcfce7' : '#f3f4f6',
                        color: user.isActive ? '#166534' : '#4b5563',
                    }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.1rem' }}>{user.email}</div>
            </div>

            {/* App access chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'flex-end', maxWidth: 320 }}>
                {user.isAccountAdmin ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>All apps</span>
                ) : grantedApps.length === 0 ? (
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic' }}>No app access</span>
                ) : (
                    grantedApps.map(app => (
                        <span key={app} style={{
                            fontSize: '0.7rem', fontWeight: 600,
                            padding: '0.15rem 0.5rem', borderRadius: '999px',
                            backgroundColor: `${APP_COLORS[app]}18`,
                            color: APP_COLORS[app],
                        }}>
                            {ERP_APPS[app]}
                        </span>
                    ))
                )}
            </div>

            {/* Edit button */}
            <button
                onClick={e => { e.stopPropagation(); onEdit(); }}
                style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', flexShrink: 0 }}
            >
                <Edit2 size={13} /> Edit
            </button>
        </div>
    );
}
