import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Edit2, KeyRound, UserMinus, ShieldCheck, Shield } from 'lucide-react';
import type { User, UserPermissions, PermissionModuleKey, PermissionLevel } from '../../types';
import { DEFAULT_PERMISSIONS, PERMISSION_MODULES } from '../../types/settings';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { SlideOverPanel } from '../../components/ui/SlideOverPanel';

// ─── Permission config ──────────────────────────────────────────────────────

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

// ─── Sub-components ─────────────────────────────────────────────────────────

function PermissionBadge({ level }: { level: PermissionLevel }) {
    const s = LEVEL_STYLE[level];
    const labels: Record<PermissionLevel, string> = { none: 'None', view: 'View', edit: 'View & Edit', admin: 'Admin' };
    return (
        <span style={{
            display: 'inline-block',
            padding: '0.125rem 0.5rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 600,
            backgroundColor: s.bg,
            color: s.color,
        }}>
            {labels[level]}
        </span>
    );
}

function PermissionTable({
    permissions,
    onChange,
    readOnly = false,
}: {
    permissions: UserPermissions;
    onChange?: (module: PermissionModuleKey, level: PermissionLevel) => void;
    readOnly?: boolean;
}) {
    return (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr repeat(4, 80px)',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid var(--color-border)',
                padding: '0.5rem 0.75rem',
                gap: '0',
            }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Module</span>
                {LEVELS.map(l => (
                    <span key={l.value} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        {l.label}
                    </span>
                ))}
            </div>

            {PERMISSION_GROUPS.map((group, gi) => (
                <div key={group.group}>
                    <div style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: '#f3f4f6',
                        borderBottom: '1px solid var(--color-border)',
                        borderTop: gi > 0 ? '1px solid var(--color-border)' : undefined,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'var(--color-text-muted)',
                    }}>
                        {group.group}
                    </div>
                    {group.modules.map((mod, mi) => {
                        const current = permissions[mod];
                        return (
                            <div key={mod} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr repeat(4, 80px)',
                                padding: '0.5rem 0.75rem',
                                alignItems: 'center',
                                gap: '0',
                                borderBottom: mi < group.modules.length - 1 ? '1px solid #f3f4f6' : undefined,
                                backgroundColor: 'white',
                            }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
                                    {PERMISSION_MODULES[mod]}
                                </span>
                                {LEVELS.map(l => (
                                    <div key={l.value} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {readOnly ? (
                                            <span style={{
                                                width: 14, height: 14, borderRadius: '50%',
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
                                                style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--color-shc-red)' }}
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

export const UsersSection: React.FC = () => {
    const { users, warehouses, addUser, updateUser } = useSettings();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [detailUser, setDetailUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        isAccountAdmin: false,
        isActive: true,
        allowedWarehouses: [] as string[],
        permissions: { ...DEFAULT_PERMISSIONS } as UserPermissions,
    });

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                isAccountAdmin: user.isAccountAdmin,
                isActive: user.isActive,
                allowedWarehouses: user.allowedWarehouses || [],
                permissions: { ...DEFAULT_PERMISSIONS, ...user.permissions },
            });
        } else {
            setEditingUser(null);
            setFormData({
                fullName: '',
                email: '',
                isAccountAdmin: false,
                isActive: true,
                allowedWarehouses: [],
                permissions: { ...DEFAULT_PERMISSIONS },
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                allowedWarehouses: formData.allowedWarehouses.includes('ALL')
                    ? null
                    : formData.allowedWarehouses.length === 0 ? null : formData.allowedWarehouses,
            };
            if (editingUser) {
                await updateUser(editingUser.id, dataToSave);
                if (detailUser?.id === editingUser.id) {
                    setDetailUser({ ...editingUser, ...dataToSave } as User);
                }
            } else {
                await addUser({ ...dataToSave, createdBy: 'System Admin', updatedBy: 'System Admin' });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Error saving user.');
        }
    };

    const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Array.from(e.target.selectedOptions, o => o.value);
        if (value.includes('ALL')) {
            setFormData({ ...formData, allowedWarehouses: ['ALL'] });
        } else {
            setFormData({ ...formData, allowedWarehouses: value.filter(v => v !== 'ALL') });
        }
    };

    const setPermission = (module: PermissionModuleKey, level: PermissionLevel) => {
        setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [module]: level } }));
    };

    // ── Columns ──────────────────────────────────────────────────────────────

    const columns: Column<User>[] = [
        {
            key: 'fullName',
            label: 'Name',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
        },
        {
            key: 'email',
            label: 'Email',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ color: 'var(--color-text-muted)' }}>{val}</span>,
        },
        {
            key: 'isAccountAdmin',
            label: 'Access Type',
            type: 'select',
            filterable: true,
            options: ['Account Admin', 'Custom'],
            render: (_, user) =>
                user.isAccountAdmin ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: 'var(--color-shc-red)', fontSize: '0.8rem' }}>
                        <ShieldCheck size={14} /> Account Admin
                    </span>
                ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        <Shield size={14} /> Custom
                    </span>
                ),
        },
        {
            key: 'allowedWarehouses',
            label: 'Warehouses',
            type: 'text',
            filterable: false,
            render: (_, user) => (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {!user.allowedWarehouses || user.allowedWarehouses.length === 0 ? 'All' : user.allowedWarehouses.join(', ')}
                </span>
            ),
        },
        {
            key: 'isActive',
            label: 'Status',
            type: 'select',
            filterable: true,
            options: ['Active', 'Inactive'],
            render: (val) => (
                <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: val ? '#dcfce7' : '#f3f4f6',
                    color: val ? '#166534' : '#4b5563',
                }}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>Users</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Manage system users and their per-module access permissions.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        backgroundColor: 'var(--color-shc-red)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                    }}
                >
                    <Plus size={18} /> Add User
                </button>
            </div>

            <DataTable columns={columns} data={users} onRowClick={setDetailUser} />

            {/* ── Detail Panel ── */}
            <SlideOverPanel
                isOpen={!!detailUser}
                onClose={() => setDetailUser(null)}
                title="User Profile"
                actions={
                    <>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => detailUser && handleOpenModal(detailUser)}
                        >
                            <Edit2 size={14} /> Edit User
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => detailUser && alert(`Password reset link sent to ${detailUser.email}`)}
                        >
                            <KeyRound size={14} /> Reset Password
                        </button>
                    </>
                }
            >
                {detailUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Header */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{detailUser.fullName}</h3>
                                <span style={{
                                    display: 'inline-block', padding: '0.25rem 0.75rem',
                                    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                    backgroundColor: detailUser.isActive ? '#dcfce7' : '#f3f4f6',
                                    color: detailUser.isActive ? '#166534' : '#4b5563',
                                }}>
                                    {detailUser.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                {detailUser.email}
                            </p>
                        </div>

                        {/* Info card */}
                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Access Type</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: detailUser.isAccountAdmin ? 'var(--color-shc-red)' : 'inherit' }}>
                                        {detailUser.isAccountAdmin
                                            ? <><ShieldCheck size={15} /> Account Admin</>
                                            : <><Shield size={15} /> Custom Permissions</>}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Warehouse Access</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {!detailUser.allowedWarehouses || detailUser.allowedWarehouses.length === 0
                                            ? 'All Warehouses'
                                            : detailUser.allowedWarehouses.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div>
                            <p style={{ margin: '0 0 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Module Permissions</p>
                            {detailUser.isAccountAdmin ? (
                                <div style={{
                                    padding: '1rem', borderRadius: '8px',
                                    backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    fontSize: '0.875rem', color: '#92400e',
                                }}>
                                    <ShieldCheck size={16} />
                                    Account Admin — has full admin access to all modules.
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.8rem' }}>
                                    {PERMISSION_GROUPS.map(group => (
                                        <div key={group.group} style={{ marginBottom: '0.75rem' }}>
                                            <p style={{ margin: '0 0 0.4rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                                                {group.group}
                                            </p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                {group.modules.map(mod => (
                                                    <div key={mod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0' }}>
                                                        <span style={{ color: 'var(--color-text-primary)' }}>{PERMISSION_MODULES[mod]}</span>
                                                        <PermissionBadge level={detailUser.permissions?.[mod] ?? 'none'} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                            {detailUser.isActive ? (
                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', color: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)' }}
                                    onClick={async () => {
                                        if (confirm(`Deactivate user ${detailUser.fullName}?`)) {
                                            await updateUser(detailUser.id, { isActive: false });
                                            setDetailUser(prev => prev ? { ...prev, isActive: false } : null);
                                        }
                                    }}
                                >
                                    <UserMinus size={18} /> Deactivate User
                                </button>
                            ) : (
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                    onClick={async () => {
                                        await updateUser(detailUser.id, { isActive: true });
                                        setDetailUser(prev => prev ? { ...prev, isActive: true } : null);
                                    }}
                                >
                                    Activate User
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            {/* ── Add/Edit Modal ── */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                    zIndex: 1000, overflowY: 'auto', padding: '2rem 1rem',
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '10px',
                        padding: '2rem', width: '680px', maxWidth: '95vw',
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
                                    <input
                                        type="text" required
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>Email *</label>
                                    <input
                                        type="email" required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            {/* Warehouse access */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>Allowed Warehouses</label>
                                <select
                                    multiple
                                    value={formData.allowedWarehouses.length === 0 ? ['ALL'] : formData.allowedWarehouses}
                                    onChange={handleWarehouseChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', minHeight: '80px' }}
                                >
                                    <option value="ALL">— All Warehouses —</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.warehouseName} ({w.warehouseCode})</option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>Hold Cmd/Ctrl to select multiple.</p>
                            </div>

                            {/* Account Admin toggle */}
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
                                            Account Admin
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            Grants full admin access to all modules. Overrides the permissions below.
                                        </p>
                                    </div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isAccountAdmin}
                                        onChange={e => setFormData({ ...formData, isAccountAdmin: e.target.checked })}
                                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-shc-red)' }}
                                    />
                                </label>
                            </div>

                            {/* Per-module permissions */}
                            {!formData.isAccountAdmin && (
                                <div>
                                    <p style={{ margin: '0 0 0.75rem', fontWeight: 600, fontSize: '0.875rem' }}>Module Permissions</p>
                                    <PermissionTable
                                        permissions={formData.permissions}
                                        onChange={setPermission}
                                    />
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        backgroundColor: '#e5e7eb', color: '#374151',
                                        border: 'none', borderRadius: '6px',
                                        fontWeight: 500, cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        backgroundColor: 'var(--color-shc-red)', color: 'white',
                                        border: 'none', borderRadius: '6px',
                                        fontWeight: 500, cursor: 'pointer',
                                    }}
                                >
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
