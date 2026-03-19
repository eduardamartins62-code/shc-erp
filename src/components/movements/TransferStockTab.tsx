import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useProducts } from '../../context/ProductContext';
import { useLocations } from '../../context/LocationContext';
import { useSettings } from '../../context/SettingsContext';
import LocationInput from '../locations/LocationInput';
import SkuSearch from '../ui/SkuSearch';
import { ArrowLeftRight } from 'lucide-react';
import type { TransferFormData } from '../../types';

const today = new Date().toISOString().split('T')[0];

const TransferStockTab: React.FC = () => {
    const { transferStock, inventory } = useInventory();
    const { products } = useProducts();
    const { warehouses } = useSettings();

    const [sku, setSku] = useState('');
    const [fromWarehouseId, setFromWarehouseId] = useState('');
    const [fromLocationCode, setFromLocationCode] = useState('');
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [toLocationCode, setToLocationCode] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [transferDate, setTransferDate] = useState(today);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Validate that the selected From location actually has stock for this SKU
    const fromLocationHasStock = useMemo(() => {
        if (!sku || !fromWarehouseId || !fromLocationCode) return true; // no location selected yet, allow
        return inventory.some(
            i => i.id === sku &&
                i.warehouseId === fromWarehouseId &&
                i.locationCode === fromLocationCode &&
                (i.quantityOnHand - i.quantityReserved) > 0
        );
    }, [sku, fromWarehouseId, fromLocationCode, inventory]);

    // Warehouses that have available stock for the selected SKU
    const availableWarehouses = useMemo(() => {
        if (!sku) return warehouses.filter(w => w.isActive);
        const wIds = Array.from(new Set(
            inventory
                .filter(i => i.id === sku && (i.quantityOnHand - i.quantityReserved) > 0)
                .map(i => i.warehouseId)
        ));
        return warehouses.filter(w => w.isActive && wIds.includes(w.id));
    }, [sku, inventory, warehouses]);

    // Available qty in the selected source (filtered by lot if picked)
    const availableQty = useMemo(() => {
        if (!sku || !fromWarehouseId) return 0;
        return inventory
            .filter(i =>
                i.id === sku && i.warehouseId === fromWarehouseId &&
                (!fromLocationCode || i.locationCode === fromLocationCode) &&
                (!lotNumber || i.lotNumber === lotNumber)
            )
            .reduce((sum, i) => sum + (i.quantityOnHand - i.quantityReserved), 0);
    }, [sku, fromWarehouseId, fromLocationCode, lotNumber, inventory]);

    // Lots at the selected source warehouse+location
    const availableLots = useMemo(() => {
        if (!sku || !fromWarehouseId) return [];
        return inventory.filter(i =>
            i.id === sku && i.warehouseId === fromWarehouseId &&
            (!fromLocationCode || i.locationCode === fromLocationCode) &&
            i.lotNumber && (i.quantityOnHand - i.quantityReserved) > 0
        ).map(i => ({ lot: i.lotNumber, qty: i.quantityOnHand - i.quantityReserved }));
    }, [sku, fromWarehouseId, fromLocationCode, inventory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!reason.trim()) { setError('Notes are required for all transfers.'); return; }
        if (fromWarehouseId === toWarehouseId && fromLocationCode === toLocationCode) {
            setError('Source and destination cannot be identical.'); return;
        }
        if (fromLocationCode && !fromLocationHasStock) {
            setError(`No stock for ${sku} at location ${fromLocationCode}. Choose a location that has inventory.`); return;
        }
        if (!sku || !fromWarehouseId || !toWarehouseId || !quantity || quantity <= 0) {
            setError('Please fill in all required fields.'); return;
        }
        if (Number(quantity) > availableQty) {
            setError(`Insufficient stock. Available: ${availableQty}, Requested: ${quantity}`); return;
        }
        try {
            setIsSubmitting(true);
            const data: TransferFormData = {
                sku,
                fromWarehouseId,
                fromLocationCode: fromLocationCode || undefined,
                toWarehouseId,
                toLocationCode: toLocationCode || undefined,
                quantity: Number(quantity),
                lotNumber: lotNumber || undefined,
                reason,
                performedBy: 'System Admin',
            };
            await transferStock(data);
            setSuccess('Inventory transferred successfully.');
            setSku(''); setFromWarehouseId(''); setFromLocationCode('');
            setToWarehouseId(''); setToLocationCode('');
            setLotNumber(''); setQuantity(''); setReason(''); setTransferDate(today);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to transfer stock');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.625rem 0.75rem', borderRadius: '6px',
        border: '1px solid var(--color-border)', fontSize: '0.875rem', width: '100%',
        backgroundColor: 'var(--color-white)',
    };
    const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };
    const labelStyle: React.CSSProperties = { fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' };
    const boxStyle: React.CSSProperties = {
        backgroundColor: '#f9fafb', padding: '1.25rem',
        borderRadius: '8px', border: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            {error && <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            {success && <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* From / To boxes side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1rem', alignItems: 'start' }}>

                    {/* FROM box — also contains SKU */}
                    <div style={boxStyle}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>From</h3>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Product SKU <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                            <SkuSearch
                                products={products}
                                value={sku}
                                onChange={val => { setSku(val); setFromWarehouseId(''); setFromLocationCode(''); setLotNumber(''); }}
                                placeholder="Search SKU…"
                                required
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                            <select
                                value={fromWarehouseId}
                                onChange={e => { setFromWarehouseId(e.target.value); setFromLocationCode(''); setLotNumber(''); }}
                                required style={{ ...inputStyle }}
                            >
                                <option value="">Select warehouse…</option>
                                {availableWarehouses.map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                                ))}
                            </select>
                            {sku && availableWarehouses.length === 0 && (
                                <small style={{ color: '#b45309', fontSize: '0.75rem' }}>No warehouses have available stock for this SKU.</small>
                            )}
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Location / Bin</label>
                            <LocationInput
                                warehouseId={fromWarehouseId}
                                value={fromLocationCode}
                                onChange={val => { setFromLocationCode(val); setLotNumber(''); }}
                                disabled={!fromWarehouseId}
                                skuFilter={sku || undefined}
                            />
                            {fromLocationCode && !fromLocationHasStock && (
                                <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                                    No stock for {sku} at this location.
                                </small>
                            )}
                        </div>

                        {/* Lot selector — shows if lots exist */}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>
                                Lot Number {availableLots.length > 0 ? '— select to target specific lot' : '(Optional)'}
                            </label>
                            {availableLots.length > 0 ? (
                                <select
                                    value={lotNumber}
                                    onChange={e => setLotNumber(e.target.value)}
                                    style={{ ...inputStyle }}
                                >
                                    <option value="">All lots (FEFO order)</option>
                                    {availableLots.map(l => (
                                        <option key={l.lot} value={l.lot}>{l.lot} — {l.qty} avail.</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text" value={lotNumber}
                                    onChange={e => setLotNumber(e.target.value)}
                                    placeholder="Optional…" style={inputStyle}
                                />
                            )}
                        </div>

                        {/* Available qty indicator */}
                        {fromWarehouseId && (
                            <div style={{
                                padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
                                backgroundColor: availableQty > 0 ? '#ecfdf5' : '#fef2f2',
                                color: availableQty > 0 ? '#047857' : '#b91c1c',
                            }}>
                                Available: {availableQty} units
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '3.5rem' }}>
                        <div style={{
                            backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%',
                            border: '1px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            color: '#3b82f6',
                        }}>
                            <ArrowLeftRight size={22} />
                        </div>
                    </div>

                    {/* TO box */}
                    <div style={boxStyle}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>To</h3>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                            <select
                                value={toWarehouseId}
                                onChange={e => { setToWarehouseId(e.target.value); setToLocationCode(''); }}
                                required style={{ ...inputStyle }}
                            >
                                <option value="">Select warehouse…</option>
                                {warehouses.filter(w => w.isActive).map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                                ))}
                            </select>
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Location / Bin</label>
                            <LocationInput
                                warehouseId={toWarehouseId}
                                value={toLocationCode}
                                onChange={val => setToLocationCode(val)}
                                disabled={!toWarehouseId}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Transfer Date</label>
                            <input
                                type="date" value={transferDate}
                                onChange={e => setTransferDate(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Quantity <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                            <input
                                type="number" min="1" max={availableQty || undefined}
                                value={quantity}
                                onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')}
                                required placeholder="Amount…"
                                style={{
                                    ...inputStyle,
                                    border: (quantity !== '' && Number(quantity) > availableQty) ? '1px solid #ef4444' : '1px solid var(--color-border)',
                                }}
                            />
                            {quantity !== '' && Number(quantity) > availableQty && fromWarehouseId && (
                                <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>Exceeds available ({availableQty})</small>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>
                        Notes / Reason <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>Required</span>
                    </label>
                    <textarea
                        value={reason} onChange={e => setReason(e.target.value)}
                        required rows={2}
                        placeholder="Reference PO number, transfer ticket, reason for move…"
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting || !reason.trim() || !sku || !fromWarehouseId || !toWarehouseId || !quantity || Number(quantity) > availableQty}
                        style={{
                            padding: '0.625rem 1.5rem', backgroundColor: '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            opacity: (isSubmitting || !reason.trim()) ? 0.7 : 1,
                        }}
                    >
                        <ArrowLeftRight size={16} />
                        {isSubmitting ? 'Transferring…' : 'Transfer Stock'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSku(''); setFromWarehouseId(''); setFromLocationCode('');
                            setToWarehouseId(''); setToLocationCode('');
                            setLotNumber(''); setQuantity(''); setReason('');
                            setTransferDate(today); setError(''); setSuccess('');
                        }}
                        style={{
                            padding: '0.625rem 1.25rem', backgroundColor: 'transparent',
                            color: 'var(--color-text-dark)', border: '1px solid var(--color-border)',
                            borderRadius: '6px', fontWeight: 500, cursor: 'pointer',
                        }}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferStockTab;
