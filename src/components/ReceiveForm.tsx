"use client";

import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';
import { X, CheckCircle, MapPin } from 'lucide-react';
import type { WarehouseLocation } from '../types/locations';

interface Props {
    onClose: () => void;
}

const ReceiveForm: React.FC<Props> = ({ onClose }) => {
    const { receiveStock, loading, error } = useInventory();
    const { warehouses } = useSettings();

    const defaultWarehouse = warehouses.find(w => w.isDefault) || warehouses[0];

    const [formData, setFormData] = useState({
        sku: '',
        warehouseId: defaultWarehouse?.id || '',
        locationCode: '',
        quantity: 1,
        lotNumber: '',
        expirationDate: '',
    });

    const [locations, setLocations] = useState<WarehouseLocation[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Load locations whenever warehouse changes
    useEffect(() => {
        if (!formData.warehouseId) {
            setLocations([]);
            return;
        }
        setLocationsLoading(true);
        setFormData(prev => ({ ...prev, locationCode: '' }));

        supabase
            .from('locations')
            .select('*')
            .eq('warehouse_id', formData.warehouseId)
            .eq('is_active', true)
            .order('location_code', { ascending: true })
            .then(({ data, error: locErr }) => {
                if (!locErr && data) {
                    setLocations(data.map(l => ({
                        id: l.id,
                        warehouseId: l.warehouse_id,
                        warehouseCode: l.warehouse_code || '',
                        locationCode: l.location_code,
                        displayName: l.display_name || l.location_code,
                        type: l.type,
                        description: l.description,
                        aisle: l.aisle,
                        section: l.section,
                        shelf: l.shelf,
                        bin: l.bin,
                        barcodeValue: l.barcode_value || l.location_code,
                        isActive: l.is_active,
                        createdAt: l.created_at,
                        updatedAt: l.updated_at,
                    })));
                } else {
                    setLocations([]);
                }
                setLocationsLoading(false);
            });
    }, [formData.warehouseId]);

    // Default warehouse on load
    useEffect(() => {
        if (warehouses.length > 0 && !formData.warehouseId) {
            const dw = warehouses.find(w => w.isDefault) || warehouses[0];
            setFormData(prev => ({ ...prev, warehouseId: dw.id }));
        }
    }, [warehouses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await receiveStock({
                ...formData,
                performedBy: 'System Admin'
            });
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch {
            // Error surfaced via context
        }
    };

    const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);

    if (success) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={64} color="var(--color-status-good)" style={{ margin: '0 auto 1rem' }} />
                    <h3>Stock Received Successfully!</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <h2>Receive Stock</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {error && (
                            <div style={{
                                color: 'var(--color-shc-red)',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(193,39,45,0.08)',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* SKU */}
                        <div className="form-group">
                            <label className="form-label">SKU *</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="e.g. MRI021-90"
                                autoFocus
                            />
                        </div>

                        {/* Warehouse + Location in a row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Warehouse *</label>
                                <select
                                    className="form-control"
                                    required
                                    value={formData.warehouseId}
                                    onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(wh => (
                                        <option key={wh.id} value={wh.id}>
                                            {wh.warehouseName} ({wh.warehouseCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <MapPin size={13} />
                                    Location *
                                </label>
                                <select
                                    className="form-control"
                                    required
                                    value={formData.locationCode}
                                    onChange={e => setFormData({ ...formData, locationCode: e.target.value })}
                                    disabled={!formData.warehouseId || locationsLoading}
                                >
                                    <option value="">
                                        {locationsLoading
                                            ? 'Loading…'
                                            : !formData.warehouseId
                                                ? 'Select warehouse first'
                                                : locations.length === 0
                                                    ? 'No locations found'
                                                    : 'Select Location'}
                                    </option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.locationCode}>
                                            {loc.displayName || loc.locationCode}
                                            {loc.type ? ` · ${loc.type}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {formData.warehouseId && locations.length === 0 && !locationsLoading && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
                                        No active locations in {selectedWarehouse?.warehouseName}. Add them in Settings → Locations.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Qty + Lot */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Quantity *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Lot Number *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={formData.lotNumber}
                                    onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                                    placeholder="e.g. L-2024-X1"
                                />
                            </div>
                        </div>

                        {/* Expiration Date */}
                        <div className="form-group">
                            <label className="form-label">Expiration Date *</label>
                            <input
                                type="date"
                                className="form-control"
                                required
                                value={formData.expirationDate}
                                onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading || !formData.locationCode}>
                            {loading ? 'Processing…' : 'Receive Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiveForm;
