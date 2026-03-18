import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useLocations } from '../../context/LocationContext';
import { useSettings } from '../../context/SettingsContext';
import type { InventoryItem } from '../../types';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface RowState {
    qty: number;
    skip: boolean;
}

interface Props {
    items: InventoryItem[];
    isOpen: boolean;
    onClose: () => void;
}

const BulkMoveModal: React.FC<Props> = ({ items, isOpen, onClose }) => {
    const { transferStock } = useInventory();
    const { locations } = useLocations();
    const { warehouses } = useSettings();

    // Shared destination
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [toLocationCode, setToLocationCode] = useState('');
    const [notes, setNotes] = useState('');

    // Per-row quantity state — default to full available
    const [rows, setRows] = useState<Record<string, RowState>>(() =>
        Object.fromEntries(items.map(i => {
            const key = `${i.id}|${i.warehouseId}|${i.locationCode || ''}|${i.lotNumber || ''}`;
            const available = Math.max(0, i.quantityOnHand - i.quantityReserved);
            return [key, { qty: available, skip: false }];
        }))
    );

    const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    const rowKey = (item: InventoryItem) =>
        `${item.id}|${item.warehouseId}|${item.locationCode || ''}|${item.lotNumber || ''}`;

    const updateRow = (key: string, patch: Partial<RowState>) =>
        setRows(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));

    const destLocations = useMemo(() =>
        locations.filter(l => l.warehouseId === toWarehouseId && l.isActive),
        [locations, toWarehouseId]
    );

    const activeItems = items.filter(i => !rows[rowKey(i)]?.skip);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!toWarehouseId) { setErrorMsg('Please select a destination warehouse.'); return; }
        if (!notes.trim()) { setErrorMsg('Notes are required for all transfers.'); return; }
        if (activeItems.length === 0) { setErrorMsg('No items to move — all are skipped.'); return; }
        setErrorMsg('');
        setStatus('processing');
        setProgress(0);

        let done = 0;
        for (const item of activeItems) {
            const key = rowKey(item);
            const row = rows[key];
            const qty = row?.qty ?? 0;
            if (qty <= 0) { done++; setProgress(done); continue; }
            // Skip if source and dest are the same
            if (item.warehouseId === toWarehouseId && (item.locationCode || '') === toLocationCode) {
                done++; setProgress(done); continue;
            }
            try {
                await transferStock({
                    sku: item.id,
                    fromWarehouseId: item.warehouseId,
                    toWarehouseId,
                    fromLocationCode: item.locationCode || '',
                    toLocationCode,
                    quantity: qty,
                    reason: notes,
                    performedBy: 'System Admin',
                });
            } catch {
                // continue on error so remaining items still process
            }
            done++;
            setProgress(done);
        }
        setStatus('done');
        setTimeout(() => onClose(), 1800);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(20,20,20,0.55)',
            zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--color-white)', borderRadius: '12px',
                width: '100%', maxWidth: '780px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Bulk Move Stock</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {items.length} item{items.length !== 1 ? 's' : ''} selected — choose a shared destination and quantity per item
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <X size={20} color="var(--color-text-muted)" />
                    </button>
                </div>

                {/* Done state */}
                {status === 'done' ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
                        <CheckCircle size={56} color="var(--color-status-good)" />
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Transfer Complete</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>{activeItems.length} item{activeItems.length !== 1 ? 's' : ''} moved to {warehouses.find(w => w.id === toWarehouseId)?.warehouseName || toWarehouseId}</p>
                    </div>
                ) : (
                    <>
                        {/* Shared destination */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'var(--color-bg-light)' }}>
                            <div style={{ flex: '1 1 180px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                    Destination Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                                </label>
                                <select
                                    className="form-control"
                                    value={toWarehouseId}
                                    onChange={e => { setToWarehouseId(e.target.value); setToLocationCode(''); }}
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                                >
                                    <option value="">Select warehouse…</option>
                                    {warehouses.filter(w => w.isActive).map(wh => (
                                        <option key={wh.id} value={wh.id}>{wh.warehouseName}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: '1 1 160px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                    Destination Location <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
                                </label>
                                <select
                                    className="form-control"
                                    value={toLocationCode}
                                    onChange={e => setToLocationCode(e.target.value)}
                                    disabled={!toWarehouseId}
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                                >
                                    <option value="">Auto / Default</option>
                                    {destLocations.map(loc => (
                                        <option key={loc.id} value={loc.locationCode}>{loc.locationCode}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: '2 1 240px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                                    Notes / Reason <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Reference PO, transfer ticket, or reason…"
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                                />
                            </div>
                        </div>

                        {/* Rows */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--color-bg-light)', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>SKU</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>From</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Available</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Qty to Move</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Skip</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => {
                                        const key = rowKey(item);
                                        const row = rows[key] ?? { qty: Math.max(0, item.quantityOnHand - item.quantityReserved), skip: false };
                                        const available = Math.max(0, item.quantityOnHand - item.quantityReserved);
                                        const skipped = row.skip;
                                        const isSameDest = toWarehouseId && item.warehouseId === toWarehouseId && (item.locationCode || '') === toLocationCode;
                                        return (
                                            <tr key={key} style={{ opacity: skipped ? 0.4 : 1, borderBottom: '1px solid var(--color-border)', backgroundColor: skipped || isSameDest ? 'var(--color-bg-light)' : undefined }}>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                                                    {item.id}
                                                    {isSameDest && !skipped && (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '2px' }}>same as destination</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.75rem', color: 'var(--color-text-muted)' }}>
                                                    <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{item.warehouseId}</div>
                                                    {item.locationCode && <code style={{ fontSize: '0.75rem', background: 'var(--color-bg-light)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{item.locationCode}</code>}
                                                    {item.lotNumber && <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Lot: {item.lotNumber}</div>}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontWeight: 500 }}>
                                                    {available.toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        disabled={skipped || status === 'processing'}
                                                        min={1}
                                                        max={available}
                                                        value={row.qty}
                                                        onChange={e => {
                                                            const v = Math.min(available, Math.max(1, parseInt(e.target.value) || 1));
                                                            updateRow(key, { qty: v });
                                                        }}
                                                        style={{
                                                            width: '80px', textAlign: 'center', padding: '0.35rem 0.5rem',
                                                            border: '1px solid var(--color-border)', borderRadius: '6px',
                                                            fontSize: '0.875rem', outline: 'none',
                                                        }}
                                                    />
                                                    {!skipped && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>max {available}</div>}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={skipped}
                                                        disabled={status === 'processing'}
                                                        onChange={e => updateRow(key, { skip: e.target.checked })}
                                                        title="Skip this item"
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: '0 0 12px 12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {errorMsg && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-shc-red)', fontSize: '0.8rem' }}>
                                        <AlertCircle size={14} /> {errorMsg}
                                    </div>
                                )}
                                {status === 'processing' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                        <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                        Processing {progress} of {activeItems.length}…
                                    </div>
                                )}
                                {status === 'idle' && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {activeItems.length} of {items.length} items will be moved
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn-secondary" onClick={onClose} disabled={status === 'processing'}>Cancel</button>
                                <button
                                    className="btn-primary"
                                    onClick={handleSubmit}
                                    disabled={status === 'processing' || !toWarehouseId || !notes.trim()}
                                >
                                    {status === 'processing' ? 'Processing…' : `Move Stock (${activeItems.length} item${activeItems.length !== 1 ? 's' : ''})`}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BulkMoveModal;
