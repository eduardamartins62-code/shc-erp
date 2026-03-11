import React, { useState } from 'react';
import { format } from 'date-fns';

import { Printer, RefreshCcw, FileText, AlertTriangle } from 'lucide-react';
import type { InventoryMovement } from '../../types';
import { DataTable, type Column } from '../ui/DataTable';
import { SlideOverPanel } from '../ui/SlideOverPanel';
import { BulkActionBar } from '../ui/BulkActionBar';
import { SkuLink } from '../ui/SkuLink';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';

interface MovementHistoryTabProps {
    movements: InventoryMovement[];
}

const MovementHistoryTab: React.FC<MovementHistoryTabProps> = ({ movements }) => {
    const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [showReverseConfirm, setShowReverseConfirm] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const { reverseMovement } = useInventory();
    const { showToast } = useToast();

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'RECEIVE': return '#10b981';
            case 'TRANSFER': return '#3b82f6';
            case 'ADJUST': return '#ef4444';
            default: return 'var(--color-text-muted)';
        }
    };

    const getTypeBgColor = (type: string) => {
        switch (type) {
            case 'RECEIVE': return '#ecfdf5';
            case 'TRANSFER': return '#eff6ff';
            case 'ADJUST': return '#fef2f2';
            default: return 'var(--color-bg-light)';
        }
    };

    const handlePrintAudit = () => {
        if (!selectedMovement) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            showToast('Unable to open print window. Please allow popups.', 'error');
            return;
        }

        const isReversed = (selectedMovement as any).isReversed;
        const reversalId = (selectedMovement as any).reversalId;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Record - ${selectedMovement.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 2rem; color: #1F2937; }
                    h1 { font-size: 1.5rem; border-bottom: 2px solid #C1272D; padding-bottom: 0.5rem; }
                    h2 { font-size: 1rem; color: #374151; margin-top: 1.5rem; border-bottom: 1px solid #E5E7EB; padding-bottom: 0.25rem; }
                    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
                    .grid { display: grid; grid-template-columns: 140px 1fr; gap: 0.4rem; font-size: 0.875rem; margin-top: 0.75rem; }
                    .label { color: #6B7280; font-weight: 500; }
                    .logo { color: #C1272D; font-weight: 800; font-size: 1.25rem; margin-bottom: 1.5rem; }
                    .footer { margin-top: 3rem; font-size: 0.75rem; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 1rem; }
                    @media print { body { padding: 1rem; } }
                </style>
            </head>
            <body>
                <div class="logo">SHC Inventory — Audit Record</div>
                <h1>Movement ID: ${selectedMovement.id}</h1>
                <div style="margin-top:0.5rem">
                    <span class="badge" style="background:${getTypeBgColor(selectedMovement.movementType)};color:${getTypeColor(selectedMovement.movementType)}">${selectedMovement.movementType}</span>
                    ${isReversed ? '<span class="badge" style="background:#fef9c3;color:#92400e;margin-left:0.5rem">REVERSED</span>' : ''}
                </div>
                <h2>Transaction Details</h2>
                <div class="grid">
                    <span class="label">Date / Time</span><span>${format(new Date(selectedMovement.createdAt), 'MMMM dd, yyyy — HH:mm:ss')}</span>
                    <span class="label">SKU</span><span>${selectedMovement.sku}</span>
                    <span class="label">Quantity</span><span style="font-weight:700;color:${selectedMovement.quantity >= 0 ? '#10b981' : '#ef4444'}">${selectedMovement.quantity > 0 ? '+' : ''}${selectedMovement.quantity}</span>
                    <span class="label">Performed By</span><span>${selectedMovement.createdBy}</span>
                    <span class="label">Reason / Notes</span><span>${selectedMovement.reason || '—'}</span>
                    ${selectedMovement.lotNumber ? `<span class="label">Lot Number</span><span>${selectedMovement.lotNumber}</span>` : ''}
                </div>
                <h2>Routing</h2>
                <div class="grid">
                    ${selectedMovement.warehouseFromId ? `<span class="label">From Warehouse</span><span>${selectedMovement.warehouseFromId}</span>` : ''}
                    ${selectedMovement.locationFromId ? `<span class="label">From Location</span><span>${selectedMovement.locationFromId}</span>` : ''}
                    ${selectedMovement.warehouseToId ? `<span class="label">To Warehouse</span><span>${selectedMovement.warehouseToId}</span>` : ''}
                    ${selectedMovement.locationToId ? `<span class="label">To Location</span><span>${selectedMovement.locationToId}</span>` : ''}
                </div>
                ${selectedMovement.referenceId ? `
                <h2>References</h2>
                <div class="grid">
                    <span class="label">Reference Type</span><span>${selectedMovement.referenceType || '—'}</span>
                    <span class="label">Reference ID</span><span>${selectedMovement.referenceId}</span>
                </div>` : ''}
                ${isReversed && reversalId ? `<p style="margin-top:1rem;color:#92400e;font-size:0.8rem">This movement was reversed. Reversal ID: ${reversalId}</p>` : ''}
                <div class="footer">
                    Printed on ${new Date().toLocaleString()} · SHC Inventory ERP · Official Audit Record
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    const handleReverse = async () => {
        if (!selectedMovement) return;
        try {
            setIsReversing(true);
            await reverseMovement(selectedMovement.id);
            showToast(`Movement reversed successfully`, 'success');
            setSelectedMovement(null);
            setShowReverseConfirm(false);
        } catch (err: any) {
            showToast(err.message || 'Failed to reverse movement', 'error');
        } finally {
            setIsReversing(false);
        }
    };

    const columns: Column<InventoryMovement>[] = [
        {
            key: 'createdAt',
            label: 'Date/Time',
            type: 'date-range',
            filterable: true,
            render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{format(new Date(val), 'MMM dd, yyyy HH:mm')}</span>
        },
        {
            key: 'movementType',
            label: 'Type',
            type: 'select',
            filterable: true,
            options: ['RECEIVE', 'TRANSFER', 'ADJUST'],
            render: (val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: getTypeBgColor(val),
                        color: getTypeColor(val),
                        fontWeight: 500,
                        fontSize: '0.75rem'
                    }}>
                        {val}
                    </span>
                    {(row as any).isReversed && (
                        <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: '#fef9c3', color: '#92400e', fontSize: '0.7rem', fontWeight: 600 }}>
                            REVERSED
                        </span>
                    )}
                </div>
            )
        },
        { key: 'sku', label: 'SKU', type: 'text', filterable: true, render: (val) => <SkuLink sku={val as string} /> },
        {
            key: 'warehouseRoute',
            label: 'Warehouse Route',
            type: 'text',
            filterable: true,
            render: (_, m) => {
                if (m.movementType === 'TRANSFER') return <span>{m.warehouseFromId} &rarr; {m.warehouseToId}</span>;
                if (m.movementType === 'ADJUST') return <span>{m.warehouseFromId}</span>;
                return <span>&rarr; {m.warehouseToId}</span>;
            }
        },
        {
            key: 'locationRoute',
            label: 'Location / Bin Route',
            type: 'text',
            filterable: true,
            render: (_, m) => {
                if (m.movementType === 'TRANSFER') return <span>{m.locationFromId || 'Default'} &rarr; {m.locationToId || 'Default'}</span>;
                if (m.movementType === 'ADJUST') return <span>{m.locationFromId || 'Default'}</span>;
                return <span>&rarr; {m.locationToId || 'Default'}</span>;
            }
        },
        {
            key: 'quantity',
            label: 'Qty',
            type: 'number-range',
            filterable: true,
            render: (val) => (
                <span style={{ fontWeight: 600, color: val > 0 ? '#10b981' : val < 0 ? '#ef4444' : 'inherit' }}>
                    {val > 0 ? `+${val}` : val}
                </span>
            )
        },
        {
            key: 'reason',
            label: 'Reason',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{val || '—'}</span>
        },
        { key: 'createdBy', label: 'User', type: 'text', filterable: true }
    ];

    const isAlreadyReversed = selectedMovement && (selectedMovement as any).isReversed;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Movement History</h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                        Audit log of all inventory changes across all locations.
                    </p>
                </div>
            </div>

            <BulkActionBar
                selectedCount={selectedKeys.size}
                module="movements"
                onClearSelection={() => setSelectedKeys(new Set())}
            />
            <DataTable
                columns={columns}
                data={movements}
                onRowClick={setSelectedMovement}
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <SlideOverPanel
                isOpen={!!selectedMovement}
                onClose={() => { setSelectedMovement(null); setShowReverseConfirm(false); }}
                title="Movement Detail"
                actions={
                    <>
                        {selectedMovement && selectedMovement.referenceId && (
                            <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                <FileText size={14} /> View Reference
                            </button>
                        )}
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', opacity: isAlreadyReversed ? 0.5 : 1 }}
                            onClick={() => !isAlreadyReversed && setShowReverseConfirm(v => !v)}
                            disabled={!!isAlreadyReversed}
                            title={isAlreadyReversed ? 'Already reversed' : 'Reverse this movement'}
                        >
                            <RefreshCcw size={14} /> Reverse
                        </button>
                    </>
                }
            >
                {selectedMovement && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Header Details */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Movement ID: {selectedMovement.id.slice(0, 8)}…</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: getTypeBgColor(selectedMovement.movementType),
                                        color: getTypeColor(selectedMovement.movementType),
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}>
                                        {selectedMovement.movementType}
                                    </span>
                                    {isAlreadyReversed && (
                                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#fef9c3', color: '#92400e', fontWeight: 600, fontSize: '0.7rem' }}>
                                            REVERSED
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {format(new Date(selectedMovement.createdAt), 'MMMM dd, yyyy - HH:mm:ss')}
                            </p>
                        </div>

                        {/* Reverse Confirmation */}
                        {showReverseConfirm && (
                            <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#92400e' }}>
                                    <AlertTriangle size={18} />
                                    <strong>Confirm Reversal</strong>
                                </div>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#78350f' }}>
                                    This will create a counter-movement to undo this transaction and adjust inventory accordingly. This action cannot be undone.
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ fontSize: '0.875rem' }}
                                        onClick={() => setShowReverseConfirm(false)}
                                        disabled={isReversing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReverse}
                                        disabled={isReversing}
                                        style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                                    >
                                        {isReversing ? 'Reversing…' : 'Confirm Reverse'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Impact Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div className="card" style={{ padding: '1rem' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>SKU Affected</p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}><SkuLink sku={selectedMovement.sku} onClick={() => setSelectedMovement(null)} /></p>
                            </div>
                            <div className="card" style={{ padding: '1rem' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Quantity Impact</p>
                                <p style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: selectedMovement.quantity > 0 ? '#10b981' : selectedMovement.quantity < 0 ? '#ef4444' : 'inherit'
                                }}>
                                    {selectedMovement.quantity > 0 ? `+${selectedMovement.quantity}` : selectedMovement.quantity}
                                </p>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Routing Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                {(selectedMovement.movementType === 'TRANSFER' || selectedMovement.movementType === 'ADJUST') && (
                                    <>
                                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>From Warehouse</span>
                                        <span>{selectedMovement.warehouseFromId}</span>
                                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>From Location</span>
                                        <span>{selectedMovement.locationFromId || 'Default'}</span>
                                    </>
                                )}

                                {(selectedMovement.movementType === 'TRANSFER' || selectedMovement.movementType === 'RECEIVE') && (
                                    <>
                                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>To Warehouse</span>
                                        <span>{selectedMovement.warehouseToId}</span>
                                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>To Location</span>
                                        <span>{selectedMovement.locationToId || 'Default'}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Audit Trail */}
                        <div>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Audit Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Performed By</span>
                                <span>{selectedMovement.createdBy}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Reason</span>
                                <span>{selectedMovement.reason || 'No reason provided'}</span>

                                {selectedMovement.referenceId && (
                                    <>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Related Reference</span>
                                        <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}>
                                            {selectedMovement.referenceType}: {selectedMovement.referenceId}
                                        </span>
                                    </>
                                )}

                                {(selectedMovement as any).reversalId && (
                                    <>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Reversal ID</span>
                                        <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.8rem' }}>{(selectedMovement as any).reversalId}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '2rem' }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={handlePrintAudit}
                            >
                                <Printer size={16} /> Print Audit Record
                            </button>
                        </div>
                    </div>
                )}
            </SlideOverPanel>
        </div>
    );
};

export default MovementHistoryTab;
