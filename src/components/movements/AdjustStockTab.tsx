import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useProducts } from '../../context/ProductContext';
import { useLocations } from '../../context/LocationContext';
import { useSettings } from '../../context/SettingsContext';
import LocationSelect from '../locations/LocationSelect';
import { FileText } from 'lucide-react';
import type { AdjustmentFormData } from '../../types';

const AdjustStockTab: React.FC = () => {
    const { adjustStock, inventory } = useInventory();
    const { products } = useProducts();
    const { locations } = useLocations();
    const { warehouses } = useSettings();

    const [sku, setSku] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [locationCode, setLocationCode] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'Add' | 'Remove'>('Add');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [reasonCode, setReasonCode] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!sku || !warehouseId || !quantity || quantity <= 0) {
            setError('Please fill in all required fields with valid quantities.');
            return;
        }

        try {
            setIsSubmitting(true);

            let finalLotNumber = lotNumber || undefined;
            let finalExpirationDate = expirationDate || undefined;

            if (adjustmentType === 'Remove') {
                const availableItems = inventory.filter(i =>
                    i.id === sku &&
                    i.warehouseId === warehouseId
                );

                if (finalLotNumber) {
                    const item = availableItems.find(i => i.lotNumber === finalLotNumber);
                    if (!item || (item.quantityOnHand - item.quantityReserved) < Number(quantity)) {
                        throw new Error(`Insufficient available stock for this specific lot. Needed: ${quantity}`);
                    }
                } else if (availableItems.length > 0) {
                    // FEFO: Sort by expiration
                    const sortedItems = [...availableItems].sort((a, b) => new Date(a.expirationDate || '9999-12-31').getTime() - new Date(b.expirationDate || '9999-12-31').getTime());
                    const oldestLot = sortedItems[0];
                    if ((oldestLot.quantityOnHand - oldestLot.quantityReserved) < Number(quantity)) {
                        throw new Error(`Insufficient available stock in the earliest expiring lot (${oldestLot.lotNumber || 'Default'}). Required: ${quantity}, Available: ${oldestLot.quantityOnHand - oldestLot.quantityReserved}.`);
                    }
                    finalLotNumber = oldestLot.lotNumber || undefined;
                    finalExpirationDate = oldestLot.expirationDate || undefined;
                } else {
                    throw new Error('No stock available to remove.');
                }
            }

            const data: AdjustmentFormData = {
                sku,
                warehouseId,
                locationCode: locationCode || 'Default',
                adjustmentType: adjustmentType === 'Add' ? 'Increase' : 'Decrease',
                quantity: Number(quantity),
                lotNumber: finalLotNumber,
                expirationDate: finalExpirationDate,
                reasonCode,
                performedBy: 'System Admin' // Hardcoded for prototype
            };

            await adjustStock(data);
            setSuccess('Inventory adjustment applied successfully.');

            // Reset form
            setSku('');
            setWarehouseId('');
            setLocationCode('');
            setLotNumber('');
            setExpirationDate('');
            setQuantity('');
            setReasonCode('');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to adjust stock');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Adjust Inventory</h2>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                    Add or remove units from inventory for a specific location.
                </p>
            </div>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Find SKU Dropdown (Mocking autocomplete with standard select for now) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                        Product SKU <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                    </label>
                    <select
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        required
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                    >
                        <option value="">Select a product...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.sku}>{p.sku} - {p.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                        Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                    </label>
                    <select
                        value={warehouseId}
                        onChange={(e) => setWarehouseId(e.target.value)}
                        required
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                    >
                        <option value="">Select a warehouse...</option>
                        {warehouses.filter(w => w.isActive).map(wh => (
                            <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                        Location / Bin
                    </label>
                    <LocationSelect
                        warehouseId={warehouseId}
                        value={locationCode}
                        onChange={(e) => setLocationCode(e.target.value)}
                        disabled={!warehouseId}
                    />
                    {warehouseId && locations.filter(l => l.warehouseId === warehouseId).length === 0 && (
                        <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            No locations found for this warehouse. Create them in Settings {'>'} Locations.
                        </small>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Lot Number
                        </label>
                        <input
                            type="text"
                            value={lotNumber}
                            onChange={(e) => setLotNumber(e.target.value)}
                            placeholder="Optional"
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Expiration Date
                        </label>
                        <input
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Action <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('Add')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: adjustmentType === 'Add' ? '1px solid #10b981' : '1px solid var(--color-border)',
                                    backgroundColor: adjustmentType === 'Add' ? '#ecfdf5' : 'var(--color-white)',
                                    color: adjustmentType === 'Add' ? '#047857' : 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                + Add Stock
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('Remove')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: adjustmentType === 'Remove' ? '1px solid var(--color-shc-red)' : '1px solid var(--color-border)',
                                    backgroundColor: adjustmentType === 'Remove' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-white)',
                                    color: adjustmentType === 'Remove' ? 'var(--color-shc-red)' : 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                − Remove Stock
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Quantity <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                            required
                            placeholder="Amount..."
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                        Reason / Notes <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                    </label>
                    <textarea
                        value={reasonCode}
                        onChange={(e) => setReasonCode(e.target.value)}
                        required
                        rows={3}
                        placeholder="Provide a short description of why this adjustment is being made..."
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', resize: 'vertical' }}
                    />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--color-shc-red)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        <FileText size={18} />
                        {isSubmitting ? 'Applying...' : 'Apply Adjustment'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSku(''); setWarehouseId(''); setLocationCode('');
                            setLotNumber(''); setExpirationDate(''); setQuantity(''); setReasonCode('');
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-dark)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdjustStockTab;
