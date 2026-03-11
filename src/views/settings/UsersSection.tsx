import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Edit2, KeyRound, UserMinus, ShieldAlert } from 'lucide-react';
import type { User, UserRole } from '../../types';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { SlideOverPanel } from '../../components/ui/SlideOverPanel';

export const UsersSection: React.FC = () => {
    const { users, warehouses, addUser, updateUser } = useSettings();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [detailUser, setDetailUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'Operator' as UserRole,
        isActive: true,
        allowedWarehouses: [] as string[]
    });

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                allowedWarehouses: user.allowedWarehouses || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                fullName: '',
                email: '',
                role: 'Operator',
                isActive: true,
                allowedWarehouses: []
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
                    : formData.allowedWarehouses
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
            alert("Error saving user.");
        }
    };

    const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        if (value.includes('ALL')) {
            setFormData({ ...formData, allowedWarehouses: ['ALL'] });
        } else {
            const filtered = value.filter(v => v !== 'ALL');
            setFormData({ ...formData, allowedWarehouses: filtered });
        }
    };

    const columns: Column<User>[] = [
        {
            key: 'fullName',
            label: 'Name',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
        },
        {
            key: 'email',
            label: 'Email',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ color: 'var(--color-text-muted)' }}>{val}</span>
        },
        {
            key: 'role',
            label: 'Role',
            type: 'select',
            filterable: true,
            options: ['Admin', 'Manager', 'Operator', 'ReadOnly']
        },
        {
            key: 'allowedWarehouses',
            label: 'Allowed Warehouses',
            type: 'text',
            filterable: false,
            render: (_, user) => (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {!user.allowedWarehouses || user.allowedWarehouses.length === 0 ? 'All' : user.allowedWarehouses.join(', ')}
                </span>
            )
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
                    color: val ? '#166534' : '#4b5563'
                }}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];



    return (
        <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>Users</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Manage system users and access permissions.
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
                        fontWeight: 500
                    }}
                >
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                onRowClick={setDetailUser}
            />

            <SlideOverPanel
                isOpen={!!detailUser}
                onClose={() => setDetailUser(null)}
                title="User Profile"
                actions={
                    <>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                                if (detailUser) {
                                    handleOpenModal(detailUser);
                                }
                            }}
                        >
                            <Edit2 size={14} /> Edit User
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                                if (detailUser) {
                                    alert(`Password reset link sent to ${detailUser.email}`);
                                }
                            }}
                        >
                            <KeyRound size={14} /> Reset Password
                        </button>
                    </>
                }
            >
                {detailUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{detailUser.fullName}</h3>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    backgroundColor: detailUser.isActive ? '#dcfce7' : '#f3f4f6',
                                    color: detailUser.isActive ? '#166534' : '#4b5563'
                                }}>
                                    {detailUser.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                {detailUser.email}
                            </p>
                        </div>

                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Role</p>
                                    <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {detailUser.role === 'Admin' && <ShieldAlert size={16} color="var(--color-shc-red)" />}
                                        {detailUser.role}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Warehouse Access</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {!detailUser.allowedWarehouses || detailUser.allowedWarehouses.length === 0 ? 'All Warehouses' : detailUser.allowedWarehouses.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>

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

            {/* User Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '2rem',
                        width: '500px',
                        maxWidth: '90vw',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-primary-dark)' }}>
                            {editingUser ? 'Edit User' : 'Add User'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Operator">Operator</option>
                                        <option value="ReadOnly">Read Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                    Allowed Warehouses
                                </label>
                                <select
                                    multiple
                                    value={formData.allowedWarehouses.length === 0 ? ['ALL'] : formData.allowedWarehouses}
                                    onChange={handleWarehouseChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', minHeight: '100px' }}
                                >
                                    <option value="ALL">-- All Warehouses --</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.warehouseName} ({w.warehouseCode})</option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>Hold Cmd/Ctrl to select multiple.</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#e5e7eb',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'var(--color-shc-red)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingUser ? 'Save User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
