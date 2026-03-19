import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useProducts } from '../../context/ProductContext';
import { useLocations } from '../../context/LocationContext';
import { useSettings } from '../../context/SettingsContext';
import LocationInput from '../locations/LocationInput';
import SkuSearch from '../ui/SkuSearch';
import { FileText } from 'lucide-react';
import type { AdjustmentFormData } from '../../types';

interface Props {
    defaultMode: 'Add' | 'Remove';
    onModeChange: (mode: 'Add' | 'Remove') => void;
}

const AdjustStockTab: React.FC<Props> = ({ defaultMode, onModeChange }) => {
    const { adjustStock, inventory } = useInventory();
    const { products } = useProducts();
    const { warehouses } = useSettings();

    const [sku, setSku] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [locationCode, setLocationCode] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [reasonCode, setReasonCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Sync adjustment type from parent (page-level buttons)
    const adjustmentType = defaultMode;

    // Derived product info
    const selectedProduct = useMemo(() => products.find(p => p.sku === sku), [products, sku]);
    const isLotTracked = selectedProduct?.lotTracked ?? false;

    // For Remove: lots available at the selected warehouse+location
    const lotsAtLocation = useMemo(() => {
        if (!sku || !warehouseId) return [];
        return inventory.filter(i =>
            i.id === sku &&
            i.warehouseId === warehouseId &&
            (!locationCode || i.locationCode === locationCode) &&
            (i.quantityOnHand - i.quantityReserved) > 0 &&
            i.lotNumber
        ).map(i => ({
            lot: i.lotNumber,
            qty: i.quantityOnHand - i.quantityReserved,
            expDate: i.expirationDate,
        }));
    }, [sku, warehouseId, locationCode, inventory]);

    // Available qty for the current selection
    const availableQty = useMemo(() => {
        if (!sku || !warehouseId) return 0;
        return inventory
            .filter(i =>
                i.id === sku &&
                i.warehouseId === warehouseId &&
                (!locationCode || i.locationCode === locationCode) &&
                (!lotNumber || i.lotNumber === lotNumber)
            )
            .reduce((sum, i) => sum + (i.quantityOnHand - i.quantityReserved), 0);
    }, [sku, warehouseId, locationCode, lotNumber, inventory]);

    // Reset lot when sku/warehouse/location changes
    useEffect(() => { setLotNumber(''); setExpirationDate(''); }, [sku, warehouseId, locationCode]);
    // Reset location when sku/warehouse changes
    useEffect(() => { setLocationCode(''); }, [sku, warehouseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!sku || !warehouseId || !quantity || quantity <= 0) {
            setError('Please fill in all required fields with valid quantities.');
            return;
        }
        if (isLotTracked && adjustmentType === 'Add' && !lotNumber) {
            setError('Lot number is required for lot-tracked products.');
            return;
        }

        try {
            setIsSubmitting(true);
            let finalLotNumber = lotNumber || undefined;
            let finalExpirationDate = expirationDate || undefined;

            if (adjustmentType === 'Remove') {
                const availableItems = inventory.filter(i =>
                    i.id === sku && i.warehouseId === warehouseId &&
                    (!locationCode || i.locationCode === locationCode)
                );
                if (finalLotNumber) {
                    const item = availableItems.find(i => i.lotNumber === finalLotNumber);
                    if (!item || (item.quantityOnHand - item.quantityReserved) < Number(quantity)) {
                        throw new Error(`Insufficient available stock for lot ${finalLotNumber}. Available: ${item ? item.quantityOnHand - item.quantityReserved : 0}`);
                    }
                } else if (availableItems.length > 0) {
                    const sorted = [...availableItems].sort((a, b) =>
                        new Date(a.expirationDate || '9999-12-31').getTime() - new Date(b.expirationDate || '9999-12-31').getTime()
                    );
                    const oldest = sorted[0];
                    if ((oldest.quantityOnHand - oldest.quantityReserved) < Number(quantity)) {
                        throw new Error(`Insufficient stock in earliest lot (${oldest.lotNumber || 'Default'}). Available: ${oldest.quantityOnHand - oldest.quantityReserved}`);
                    }
                    finalLotNumber = oldest.lotNumber || undefined;
                    finalExpirationDate = oldest.expirationDate || undefined;
                } else {
                    throw new Error('No stock available to remove at the selected location.');
                }
            }

            const data: AdjustmentFormData = {
                sku,
                warehouseId,
                locationCode: locationCode || undefined,
                adjustmentType: adjustmentType === 'Add' ? 'Increase' : 'Decrease',
                quantity: Number(quantity),
                lotNumber: finalLotNumber,
                expirationDate: finalExpirationDate,
                reasonCode,
                performedBy: 'System Admin',
            };

            await adjustStock(data);
            setSuccess('Inventory adjustment applied successfully.');
            setSku(''); setWarehouseId(''); setLocationCode('');
            setLotNumber(''); setExpirationDate(''); setQuantity(''); setReasonCode('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to adjust stock');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.625rem 0.75rem', borderRadius: '6px',
        border: '1px solid var(--color-border)', fontSize: '0.875rem', width: '100%',
    };
    const labelStyle: React.CSSProperties = { fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' };
    const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };

    return (
        <div style={{ maxWidth: '720px' }}>

            {/* Add / Remove toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    type="button"
                    onClick={() => onModeChange('Add')}
                    style={{
                        flex: 1, padding: '0.625rem',
                        borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        border: adjustmentType === 'Add' ? '2px solid #10b981' : '2px solid var(--color-border)',
                        backgroundColor: adjustmentType === 'Add' ? '#ecfdf5' : 'var(--color-white)',
                        color: adjustmentType === 'Add' ? '#047857' : 'var(--color-text-muted)',
                        transition: 'all 0.15s',
                    }}
                >+ Add Stock</button>
                <button
                    type="button"
                    onClick={() => onModeChange('Remove')}
                    style={{
                        flex: 1, padding: '0.625rem',
                        borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        border: adjustmentType === 'Remove' ? '2px solid var(--color-shc-red)' : '2px solid var(--color-border)',
                        backgroundColor: adjustmentType === 'Remove' ? '#fff1f2' : 'var(--color-white)',
                        color: adjustmentType === 'Remove' ? 'var(--color-shc-red)' : 'var(--color-text-muted)',
                        transition: 'all 0.15s',
                    }}
                >− Remove Stock</button>
            </div>

            {error && <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            {success && <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                {/* SKU */}
                <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Product SKU <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                    <SkuSearch
                        products={products}
                        value={sku}
                        onChange={val => { setSku(val); setWarehouseId(''); setLocationCode(''); setLotNumber(''); }}
                        placeholder="Search by SKU or product name…"
                        required
                    />
                </div>

                {/* Warehouse */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                    <select
                        value={warehouseId}
                        onChange={e => { setWarehouseId(e.target.value); setLocationCode(''); setLotNumber(''); }}
                        required
                        style={{ ...inputStyle }}
                    >
                        <option value="">Select warehouse…</option>
                        {warehouses.filter(w => w.isActive).map(wh => (
                            <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                        ))}
                    </select>
                </div>

                {/* Location — for Remove, only suggests locations that have the SKU */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Location / Bin</label>
                    <LocationInput
                        warehouseId={warehouseId}
                        value={locationCode}
                        onChange={val => setLocationCode(val)}
                        disabled={!warehouseId}
                        skuFilter={adjustmentType === 'Remove' && sku ? sku : undefined}
                    />
                </div>

                {/* Lot / Expiration */}
                {adjustmentType === 'Remove' && lotsAtLocation.length > 0 ? (
                    /* Remove + lots exist → show dropdown of lots at this location */
                    <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Lot Number</label>
                        <select
                            value={lotNumber}
                            onChange={e => {
                                setLotNumber(e.target.value);
                                const lot = lotsAtLocation.find(l => l.lot === e.target.value);
                                setExpirationDate(lot?.expDate || '');
                            }}
                            style={{ ...inputStyle }}
                        >
                            <option value="">Auto (FEFO — earliest expiring lot)</option>
                            {lotsAtLocation.map(l => (
                                <option key={l.lot} value={l.lot}>
                                    {l.lot} — {l.qty} available{l.expDate ? ` — exp ${l.expDate}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (isLotTracked || adjustmentType === 'Add') && (
                    /* Add → show editable lot + exp fields (required if lot-tracked) */
                    <>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                Lot Number {isLotTracked && adjustmentType === 'Add' && <span style={{ color: 'var(--color-shc-red)' }}>*</span>}
                            </label>
                            <input
                                type="text"
                                value={lotNumber}
                                onChange={e => setLotNumber(e.target.value)}
                                required={isLotTracked && adjustmentType === 'Add'}
                                placeholder={isLotTracked ? 'Required' : 'Optional'}
                                style={inputStyle}
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                Expiration Date {isLotTracked && adjustmentType === 'Add' && <span style={{ color: 'var(--color-shc-red)' }}>*</span>}
                            </label>
                            <input
                                type="date"
                                value={expirationDate}
                                onChange={e => setExpirationDate(e.target.value)}
                                required={isLotTracked && adjustmentType === 'Add'}
                                style={inputStyle}
                            />
                        </div>
                    </>
                )}

                {/* Available qty indicator (Remove mode) */}
                {adjustmentType === 'Remove' && warehouseId && sku && (
                    <div style={{
                        gridColumn: '1 / -1',
                        padding: '0.625rem 0.875rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
                        backgroundColor: availableQty > 0 ? '#ecfdf5' : '#fef2f2',
                        color: availableQty > 0 ? '#047857' : '#b91c1c',
                    }}>
                        Available to remove: {availableQty} units{locationCode ? ` at ${locationCode}` : ''}
                    </div>
                )}

                {/* Quantity */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Quantity <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                    <input
                        type="number" min="1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')}
                        required placeholder="Amount…"
                        style={{
                            ...inputStyle,
                            border: adjustmentType === 'Remove' && quantity !== '' && Number(quantity) > availableQty
                                ? '1px solid #ef4444' : '1px solid var(--color-border)',
                        }}
                    />
                    {adjustmentType === 'Remove' && quantity !== '' && Number(quantity) > availableQty && (
                        <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>Exceeds available ({availableQty})</small>
                    )}
                </div>

                {/* Reason */}
                <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Reason / Notes <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                    <textarea
                        value={reasonCode}
                        onChange={e => setReasonCode(e.target.value)}
                        required rows={2}
                        placeholder="Describe why this adjustment is being made…"
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>

                {/* Actions */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '0.625rem 1.5rem',
                            backgroundColor: adjustmentType === 'Add' ? '#10b981' : 'var(--color-shc-red)',
                            color: 'white', border: 'none', borderRadius: '6px',
                            fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1,
                        }}
                    >
                        <FileText size={16} />
                        {isSubmitting ? 'Applying…' : `Apply ${adjustmentType}`}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSku(''); setWarehouseId(''); setLocationCode('');
                            setLotNumber(''); setExpirationDate(''); setQuantity(''); setReasonCode('');
                            setError(''); setSuccess('');
                        }}
                        style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: 'transparent', color: 'var(--color-text-dark)',
                            border: '1px solid var(--color-border)', borderRadius: '6px',
                            fontWeight: 500, cursor: 'pointer',
                        }}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdjustStockTab;
