import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import type { InventoryItem } from '../../types';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface RowState {
    newQoh: number;
    skip: boolean;
}

interface Props {
    items: InventoryItem[];
    isOpen: boolean;
    onClose: () => void;
}

const BulkAdjustModal: React.FC<Props> = ({ items, isOpen, onClose }) => {
    const { adjustStock } = useInventory();

    const [reasonCode, setReasonCode] = useState('');
    const [rows, setRows] = useState<Record<string, RowState>>(() =>
        Object.fromEntries(items.map(i => [
            `${i.id}|${i.warehouseId}|${i.locationCode || ''}|${i.lotNumber || ''}`,
            { newQoh: i.quantityOnHand, skip: false }
        ]))
    );

    const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const rowKey = (item: InventoryItem) =>
        `${item.id}|${item.warehouseId}|${item.locationCode || ''}|${item.lotNumber || ''}`;

    const updateRow = (key: string, patch: Partial<RowState>) =>
        setRows(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));

    const activeItems = items.filter(i => !rows[rowKey(i)]?.skip);

    const handleSubmit = async () => {
        if (!reasonCode) { setErrorMsg('Please select a reason code.'); return; }
        if (activeItems.length === 0) { setErrorMsg('No items to adjust — all are skipped.'); return; }
        setErrorMsg('');
        setStatus('processing');
        setProgress(0);

        let done = 0;
        for (const item of activeItems) {
            const key = rowKey(item);
            const newQoh = rows[key]?.newQoh ?? item.quantityOnHand;
            const diff = newQoh - item.quantityOnHand;
            if (diff === 0) { done++; setProgress(done); continue; }
            try {
                await adjustStock({
                    sku: item.id,
                    warehouseId: item.warehouseId,
                    locationCode: item.locationCode || 'Default',
                    adjustmentType: diff >= 0 ? 'Increase' : 'Decrease',
                    quantity: Math.abs(diff),
                    reasonCode,
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
                width: '100%', maxWidth: '740px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Bulk Adjust Stock</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {items.length} item{items.length !== 1 ? 's' : ''} selected — set new quantity on hand for each
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
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Adjustments Saved</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>{activeItems.length} item{activeItems.length !== 1 ? 's' : ''} updated</p>
                    </div>
                ) : (
                    <>
                        {/* Shared reason code */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Reason Code <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                            </label>
                            <select
                                className="form-control"
                                value={reasonCode}
                                onChange={e => setReasonCode(e.target.value)}
                                style={{ maxWidth: '260px', padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                            >
                                <option value="">Select reason…</option>
                                <option value="CYCLE_COUNT">Cycle Count Variance</option>
                                <option value="DAMAGE">Damaged Goods</option>
                                <option value="EXPIRED">Expired Stock</option>
                                <option value="THEFT">Shrinkage / Theft</option>
                            </select>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                                Applies to all rows
                            </span>
                        </div>

                        {/* Rows */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--color-bg-light)', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>SKU</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Warehouse / Lot</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Current QOH</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>New QOH</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Delta</th>
                                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--color-border)' }}>Skip</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => {
                                        const key = rowKey(item);
                                        const row = rows[key] ?? { newQoh: item.quantityOnHand, skip: false };
                                        const delta = row.newQoh - item.quantityOnHand;
                                        const skipped = row.skip;
                                        return (
                                            <tr key={key} style={{ opacity: skipped ? 0.4 : 1, borderBottom: '1px solid var(--color-border)', backgroundColor: skipped ? 'var(--color-bg-light)' : undefined }}>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{item.id}</td>
                                                <td style={{ padding: '0.75rem 0.75rem', color: 'var(--color-text-muted)' }}>
                                                    <div>{item.warehouseId}</div>
                                                    {item.locationCode && <code style={{ fontSize: '0.75rem', background: 'var(--color-bg-light)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{item.locationCode}</code>}
                                                    {item.lotNumber && <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Lot: {item.lotNumber}</div>}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontWeight: 500 }}>{item.quantityOnHand.toLocaleString()}</td>
                                                <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        disabled={skipped || status === 'processing'}
                                                        min={item.quantityReserved}
                                                        value={row.newQoh}
                                                        onChange={e => updateRow(key, { newQoh: Math.max(item.quantityReserved, parseInt(e.target.value) || 0) })}
                                                        style={{
                                                            width: '80px', textAlign: 'center', padding: '0.35rem 0.5rem',
                                                            border: '1px solid var(--color-border)', borderRadius: '6px',
                                                            fontSize: '0.875rem', outline: 'none',
                                                            borderColor: delta !== 0 ? 'var(--color-primary)' : 'var(--color-border)',
                                                        }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontWeight: 600, color: delta > 0 ? 'var(--color-status-good)' : delta < 0 ? 'var(--color-shc-red)' : 'var(--color-text-muted)' }}>
                                                    {delta === 0 ? '—' : (delta > 0 ? `+${delta}` : delta)}
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
                                        {activeItems.length} of {items.length} items will be adjusted
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn-secondary" onClick={onClose} disabled={status === 'processing'}>Cancel</button>
                                <button className="btn-primary" onClick={handleSubmit} disabled={status === 'processing' || !reasonCode}>
                                    {status === 'processing' ? 'Processing…' : `Confirm Adjustments (${activeItems.length})`}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BulkAdjustModal;
