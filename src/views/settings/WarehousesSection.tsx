import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Search, Edit2 } from 'lucide-react';
import type { Warehouse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

export const WarehousesSection: React.FC = () => {
    const { currentUser } = useAuth();
    const { can } = usePermissions(currentUser);
    const canEdit = can('settingsWarehouses', 'edit');
    const { warehouses, addWarehouse, updateWarehouse } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        warehouseName: '',
        warehouseCode: '',
        description: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
        timeZone: 'America/New_York',
        isActive: true,
        isDefault: false
    });

    const filteredWarehouses = warehouses.filter(w => {
        const matchesSearch = w.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' && w.isActive) ||
            (statusFilter === 'Inactive' && !w.isActive);
        return matchesSearch && matchesStatus;
    });

    const handleOpenModal = (warehouse?: Warehouse) => {
        if (warehouse) {
            setEditingWarehouse(warehouse);
            setFormData({
                warehouseName: warehouse.warehouseName,
                warehouseCode: warehouse.warehouseCode,
                description: warehouse.description || '',
                addressLine1: warehouse.addressLine1 || '',
                addressLine2: warehouse.addressLine2 || '',
                city: warehouse.city,
                state: warehouse.state,
                postalCode: warehouse.postalCode,
                country: warehouse.country,
                timeZone: warehouse.timeZone,
                isActive: warehouse.isActive,
                isDefault: warehouse.isDefault
            });
        } else {
            setEditingWarehouse(null);
            setFormData({
                warehouseName: '',
                warehouseCode: '',
                description: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'USA',
                timeZone: 'America/New_York',
                isActive: true,
                isDefault: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingWarehouse) {
                await updateWarehouse(editingWarehouse.id, formData);
            } else {
                await addWarehouse({ ...formData, createdBy: 'System Admin', updatedBy: 'System Admin' });
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error saving warehouse.");
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>Warehouses</h3>
                {canEdit && (
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
                    Add Warehouse
                </button>
                )}
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-main)',
                        backgroundColor: '#f9fafb'
                    }}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-primary-dark)', color: 'white' }}>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderTopLeftRadius: '6px' }}>Name</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Code</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Location</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Time Zone</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Default</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 500, borderTopRightRadius: '6px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWarehouses.map((w) => (
                            <tr key={w.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{w.warehouseName}</td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{w.warehouseCode}</td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                                    {w.city}, {w.state} {w.country}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{w.timeZone}</td>
                                <td style={{ padding: '1rem' }}>
                                    {w.isDefault && (
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                            Default
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: w.isActive ? '#dcfce7' : '#f3f4f6',
                                        color: w.isActive ? '#166534' : '#4b5563'
                                    }}>
                                        {w.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {canEdit && (
                                    <button
                                        onClick={() => handleOpenModal(w)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-shc-red)' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredWarehouses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No warehouses found.
                    </div>
                )}
            </div>

            {/* Warehouse Modal */}
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
                        width: '700px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-primary-dark)' }}>
                            {editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* General Info Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Warehouse Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.warehouseName}
                                        onChange={e => setFormData({ ...formData, warehouseName: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Location Code *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. WH-EAST"
                                        value={formData.warehouseCode}
                                        onChange={e => setFormData({ ...formData, warehouseCode: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                />
                            </div>

                            {/* Address Area */}
                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>Address Details</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Address Line 1</label>
                                        <input
                                            type="text"
                                            value={formData.addressLine1}
                                            onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>City *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>State / Province *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Postal Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.postalCode}
                                            onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Country *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.country}
                                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Time Zone</label>
                                    <select
                                        value={formData.timeZone}
                                        onChange={e => setFormData({ ...formData, timeZone: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                    >
                                        <option value="America/New_York">Eastern Time (US & Canada)</option>
                                        <option value="America/Chicago">Central Time (US & Canada)</option>
                                        <option value="America/Denver">Mountain Time (US & Canada)</option>
                                        <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                        <option value="Europe/London">London</option>
                                        <option value="Europe/Paris">Central Europe</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Active Warehouse</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                        />
                                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Make Default (Unsets other defaults)</span>
                                    </label>
                                </div>
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
                                    {editingWarehouse ? 'Save Warehouse' : 'Create Warehouse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
