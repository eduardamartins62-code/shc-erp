import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useProducts } from '../../context/ProductContext';
import { useLocations } from '../../context/LocationContext';
import { useSettings } from '../../context/SettingsContext';
import LocationSelect from '../locations/LocationSelect';
import { ArrowLeftRight } from 'lucide-react';
import type { TransferFormData } from '../../types';

const TransferStockTab: React.FC = () => {
    const { transferStock, inventory } = useInventory();
    const { products } = useProducts();
    const { locations } = useLocations();
    const { warehouses } = useSettings();

    const [sku, setSku] = useState('');
    const [fromWarehouseId, setFromWarehouseId] = useState('');
    const [fromLocationCode, setFromLocationCode] = useState('');
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [toLocationCode, setToLocationCode] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [reason, setReason] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Warehouses where this SKU has available stock
    const availableWarehouses = useMemo(() => {
        if (!sku) return warehouses.filter(w => w.isActive);
        const warehouseIdsWithStock = Array.from(new Set(
            inventory
                .filter(i => i.id === sku && (i.quantityOnHand - i.quantityReserved) > 0)
                .map(i => i.warehouseId)
        ));
        return warehouses.filter(w => w.isActive && warehouseIdsWithStock.includes(w.id));
    }, [sku, inventory, warehouses]);

    // Available quantity in the selected source warehouse (filtered by lot if provided)
    const availableQty = useMemo(() => {
        if (!sku || !fromWarehouseId) return 0;
        const items = inventory.filter(i =>
            i.id === sku &&
            i.warehouseId === fromWarehouseId &&
            (!lotNumber || i.lotNumber === lotNumber)
        );
        return items.reduce((sum, i) => sum + (i.quantityOnHand - i.quantityReserved), 0);
    }, [sku, fromWarehouseId, lotNumber, inventory]);

    // Lots available in the selected source warehouse
    const availableLots = useMemo(() => {
        if (!sku || !fromWarehouseId) return [];
        return inventory
            .filter(i => i.id === sku && i.warehouseId === fromWarehouseId && i.lotNumber && (i.quantityOnHand - i.quantityReserved) > 0)
            .map(i => ({ lot: i.lotNumber!, qty: i.quantityOnHand - i.quantityReserved }));
    }, [sku, fromWarehouseId, inventory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!reason.trim()) {
            setError('Notes are required for all transfers.');
            return;
        }

        if (fromWarehouseId === toWarehouseId && fromLocationCode === toLocationCode) {
            setError('Source and destination cannot be identical.');
            return;
        }

        if (!sku || !fromWarehouseId || !toWarehouseId || !quantity || quantity <= 0) {
            setError('Please fill in all required fields with valid quantities.');
            return;
        }

        if (Number(quantity) > availableQty) {
            setError(`Insufficient stock. Available: ${availableQty}, Requested: ${quantity}`);
            return;
        }

        try {
            setIsSubmitting(true);
            const data: TransferFormData = {
                sku,
                fromWarehouseId,
                fromLocationCode: fromLocationCode || 'Default',
                toWarehouseId,
                toLocationCode: toLocationCode || 'Default',
                quantity: Number(quantity),
                lotNumber: lotNumber || undefined,
                reason,
                performedBy: 'System Admin'
            };

            await transferStock(data);
            setSuccess('Inventory transferred successfully.');

            setSku('');
            setFromWarehouseId('');
            setFromLocationCode('');
            setToWarehouseId('');
            setToLocationCode('');
            setLotNumber('');
            setQuantity('');
            setReason('');

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to transfer stock');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Transfer Stock</h2>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                    Move inventory between warehouses or between locations within the same warehouse.
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

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>

                {/* SKU — full width */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                        Product SKU <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                    </label>
                    <select
                        value={sku}
                        onChange={(e) => { setSku(e.target.value); setFromWarehouseId(''); setFromLocationCode(''); setLotNumber(''); }}
                        required
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                    >
                        <option value="">Select a product…</option>
                        {products.map(p => (
                            <option key={p.id} value={p.sku}>{p.sku} — {p.name}</option>
                        ))}
                    </select>
                </div>

                {/* FROM column */}
                <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>From Location</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        </label>
                        <select
                            value={fromWarehouseId}
                            onChange={(e) => { setFromWarehouseId(e.target.value); setFromLocationCode(''); setLotNumber(''); }}
                            required
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>Location / Bin</label>
                        <LocationSelect
                            warehouseId={fromWarehouseId}
                            value={fromLocationCode}
                            onChange={(e) => setFromLocationCode(e.target.value)}
                            disabled={!fromWarehouseId}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Lot Number {availableLots.length > 0 ? '(select to target specific lot)' : '(Optional)'}
                        </label>
                        {availableLots.length > 0 ? (
                            <select
                                value={lotNumber}
                                onChange={(e) => setLotNumber(e.target.value)}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                            >
                                <option value="">All lots (FEFO order)</option>
                                {availableLots.map(l => (
                                    <option key={l.lot} value={l.lot}>{l.lot} — {l.qty} avail.</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={lotNumber}
                                onChange={(e) => setLotNumber(e.target.value)}
                                placeholder="Optional…"
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                            />
                        )}
                    </div>

                    {fromWarehouseId && (
                        <div style={{ padding: '0.75rem', backgroundColor: availableQty > 0 ? '#ecfdf5' : '#fef2f2', borderRadius: '6px', fontSize: '0.875rem', color: availableQty > 0 ? '#047857' : '#b91c1c', fontWeight: 600 }}>
                            Available to transfer: {availableQty} units
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', paddingTop: '3rem' }}>
                    <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', color: '#3b82f6' }}>
                        <ArrowLeftRight size={24} />
                    </div>
                </div>

                {/* TO column */}
                <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>To Location</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        </label>
                        <select
                            value={toWarehouseId}
                            onChange={(e) => { setToWarehouseId(e.target.value); setToLocationCode(''); }}
                            required
                            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                        >
                            <option value="">Select warehouse…</option>
                            {warehouses.filter(w => w.isActive).map(wh => (
                                <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>Location / Bin</label>
                        <LocationSelect
                            warehouseId={toWarehouseId}
                            value={toLocationCode}
                            onChange={(e) => setToLocationCode(e.target.value)}
                            disabled={!toWarehouseId}
                        />
                        {toWarehouseId && locations.filter(l => l.warehouseId === toWarehouseId).length === 0 && (
                            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                No locations found. Create them in Settings › Locations.
                            </small>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                            Quantity to Transfer <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={availableQty || undefined}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                            required
                            placeholder="Amount…"
                            style={{
                                padding: '0.75rem', borderRadius: '6px',
                                border: (quantity !== '' && Number(quantity) > availableQty) ? '1px solid #ef4444' : '1px solid var(--color-border)',
                                fontSize: '0.875rem'
                            }}
                        />
                        {quantity !== '' && Number(quantity) > availableQty && fromWarehouseId && (
                            <small style={{ color: '#ef4444', fontSize: '0.75rem' }}>Exceeds available quantity ({availableQty})</small>
                        )}
                    </div>
                </div>

                {/* Notes — mandatory */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                        Notes / Reason <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>Required for all transfers</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={2}
                        placeholder="Reference PO number, transfer ticket, reason for move…"
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', resize: 'vertical' }}
                    />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting || !reason.trim() || !sku || !fromWarehouseId || !toWarehouseId || !quantity || Number(quantity) > availableQty}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: (isSubmitting || !reason.trim()) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: (isSubmitting || !reason.trim()) ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeftRight size={18} />
                        {isSubmitting ? 'Transferring…' : 'Transfer Stock'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSku(''); setFromWarehouseId(''); setFromLocationCode('');
                            setToWarehouseId(''); setToLocationCode('');
                            setLotNumber(''); setQuantity(''); setReason('');
                            setError(''); setSuccess('');
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
                        Clear Form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferStockTab;
