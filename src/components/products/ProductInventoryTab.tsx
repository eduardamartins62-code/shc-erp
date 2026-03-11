"use client";

import React, { useState } from 'react';
import type { Product, InventoryLocation, InventoryMovement } from '../../types/products';
import BulkActionBar from '../ui/BulkActionBar';
import { ArrowUp, ArrowDown, X, ArrowLeftRight, Save } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { useLocations } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import type { TransferFormData } from '../../types';

interface ProductInventoryTabProps {
    product: Product;
    sortedLocations: InventoryLocation[];
    movements: InventoryMovement[];
    navigate: any;
}

type SortField = 'warehouseName' | 'locationCode' | 'lotNumber' | 'expirationDate' | 'qtyOnHand' | 'qtyReserved' | 'qtyAvailable' | 'cogsValue';
type SortOrder = 'asc' | 'desc';

interface TransferModalState {
    open: boolean;
    loc: InventoryLocation | null;
}

export const ProductInventoryTab: React.FC<ProductInventoryTabProps> = ({
    product,
    sortedLocations,
    movements,
    navigate
}) => {
    const [selectedLocs, setSelectedLocs] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<SortField>('warehouseName');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [transferModal, setTransferModal] = useState<TransferModalState>({ open: false, loc: null });

    // Transfer form state
    const [toWarehouseId, setToWarehouseId] = useState('');
    const [toLocationCode, setToLocationCode] = useState('');
    const [transferQty, setTransferQty] = useState<number | ''>('');
    const [transferNotes, setTransferNotes] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferError, setTransferError] = useState('');

    const { transferStock } = useInventory();
    const { warehouses } = useSettings();
    const { locations } = useLocations();
    const { showToast } = useToast();

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedLocs(new Set(sortedLocations.map(l => l.id)));
        else setSelectedLocs(new Set());
    };

    const handleSelectRow = (id: string) => {
        const newSet = new Set(selectedLocs);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedLocs(newSet);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortOrder('asc'); }
    };

    const sortedData = [...sortedLocations].sort((a, b) => {
        let valA: any = a[field2Prop(sortField)];
        let valB: any = b[field2Prop(sortField)];
        if (sortField === 'cogsValue') {
            valA = (a.lotReceiveCost || product.costOfGoods || 0) * a.qtyOnHand;
            valB = (b.lotReceiveCost || product.costOfGoods || 0) * b.qtyOnHand;
        }
        if (valA == null) valA = '';
        if (valB == null) valB = '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    function field2Prop(f: SortField): keyof InventoryLocation {
        return f as keyof InventoryLocation;
    }

    const sortIcon = (f: SortField) => {
        if (sortField !== f) return null;
        return sortOrder === 'asc' ? <ArrowUp size={14} style={{ marginLeft: '4px' }} /> : <ArrowDown size={14} style={{ marginLeft: '4px' }} />;
    };

    const openTransfer = (loc: InventoryLocation) => {
        setTransferModal({ open: true, loc });
        setToWarehouseId('');
        setToLocationCode('');
        setTransferQty('');
        setTransferNotes('');
        setTransferError('');
    };

    const closeTransfer = () => {
        setTransferModal({ open: false, loc: null });
        setIsTransferring(false);
        setTransferError('');
    };

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferModal.loc) return;
        if (!transferNotes.trim()) { setTransferError('Notes are required for all transfers.'); return; }
        if (!toWarehouseId) { setTransferError('Please select a destination warehouse.'); return; }
        if (!transferQty || Number(transferQty) <= 0) { setTransferError('Please enter a valid quantity.'); return; }
        if (Number(transferQty) > transferModal.loc.qtyAvailable) {
            setTransferError(`Cannot transfer more than available (${transferModal.loc.qtyAvailable}).`);
            return;
        }

        const loc = transferModal.loc;
        const data: TransferFormData = {
            sku: product.sku,
            fromWarehouseId: loc.warehouseName,
            fromLocationCode: loc.locationCode || 'Default',
            toWarehouseId,
            toLocationCode: toLocationCode || 'Default',
            quantity: Number(transferQty),
            lotNumber: loc.lotNumber || undefined,
            reason: transferNotes,
            performedBy: 'System Admin'
        };

        try {
            setIsTransferring(true);
            await transferStock(data);
            showToast(`Transferred ${transferQty} units from ${loc.warehouseName} successfully`, 'success');
            closeTransfer();
        } catch (err: any) {
            setTransferError(err.message || 'Transfer failed');
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {selectedLocs.size > 0 && (
                <BulkActionBar
                    selectedCount={selectedLocs.size}
                    module="inventory"
                    onClearSelection={() => setSelectedLocs(new Set())}
                />
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Inventory by Location & Lot</h2>
                    {/* Top-level buttons removed — actions are per line item */}
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLocs.size === sortedLocations.length && sortedLocations.length > 0}
                                        onChange={handleSelectAll}
                                        className="checkbox"
                                    />
                                </th>
                                <th onClick={() => handleSort('warehouseName')} style={{ cursor: 'pointer' }}>Warehouse {sortIcon('warehouseName')}</th>
                                <th onClick={() => handleSort('locationCode')} style={{ cursor: 'pointer' }}>Location / Bin {sortIcon('locationCode')}</th>
                                <th onClick={() => handleSort('lotNumber')} style={{ cursor: 'pointer' }}>Lot Number {sortIcon('lotNumber')}</th>
                                <th onClick={() => handleSort('expirationDate')} style={{ cursor: 'pointer' }}>Expiration {sortIcon('expirationDate')}</th>
                                <th onClick={() => handleSort('qtyOnHand')} style={{ cursor: 'pointer', textAlign: 'right' }}>QOH {sortIcon('qtyOnHand')}</th>
                                <th onClick={() => handleSort('qtyReserved')} style={{ cursor: 'pointer', textAlign: 'right' }}>Reserved {sortIcon('qtyReserved')}</th>
                                <th onClick={() => handleSort('qtyAvailable')} style={{ cursor: 'pointer', textAlign: 'right' }}>Avail {sortIcon('qtyAvailable')}</th>
                                <th onClick={() => handleSort('cogsValue')} style={{ cursor: 'pointer', textAlign: 'right' }}>COGS Value {sortIcon('cogsValue')}</th>
                                <th>Last Movement</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((loc) => {
                                const locMovements = movements.filter(m =>
                                    m.productId === product.id &&
                                    ((m.warehouseToId === loc.warehouseName && m.locationToId === loc.locationCode) ||
                                        (m.warehouseFromId === loc.warehouseName && m.locationFromId === loc.locationCode)) &&
                                    m.lotNumber === loc.lotNumber
                                );
                                const lastMovement = [...locMovements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                                let expBadge = null;
                                let expColor = 'inherit';
                                if (loc.expirationDate) {
                                    const expDate = new Date(loc.expirationDate);
                                    const today = new Date();
                                    const d30 = new Date(); d30.setDate(d30.getDate() + 30);
                                    const d60 = new Date(); d60.setDate(d60.getDate() + 60);
                                    if (expDate < today) {
                                        expBadge = <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>Expired</span>;
                                        expColor = 'var(--color-shc-red)';
                                    } else if (expDate <= d30) {
                                        expBadge = <span className="badge badge-amber" style={{ marginLeft: '0.5rem' }}>&lt; 30d</span>;
                                        expColor = 'var(--color-status-reserved)';
                                    } else if (expDate > d60) {
                                        expColor = 'var(--color-status-good)';
                                    }
                                }

                                const rowCogsValue = (loc.lotReceiveCost || product.costOfGoods || 0) * loc.qtyOnHand;

                                return (
                                    <tr key={loc.id} className={selectedLocs.has(loc.id) ? 'selected-row' : ''}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedLocs.has(loc.id)}
                                                onChange={() => handleSelectRow(loc.id)}
                                                className="checkbox"
                                            />
                                        </td>
                                        <td style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{loc.warehouseName}</td>
                                        <td>{loc.locationCode || '—'}</td>
                                        <td>{loc.lotNumber ? <span className="badge" style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-border)' }}>{loc.lotNumber}</span> : '—'}</td>
                                        <td style={{ color: expColor, fontWeight: expColor !== 'inherit' ? 500 : 400 }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {loc.expirationDate ? new Date(loc.expirationDate).toISOString().split('T')[0] : '—'}
                                                {expBadge}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 500 }}>{loc.qtyOnHand.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-status-reserved)' }}>{loc.qtyReserved.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-status-good)' }}>{loc.qtyAvailable.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--color-primary-dark)' }}>
                                            ${rowCogsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            {lastMovement ? (
                                                <div>
                                                    <div style={{ fontSize: '0.875rem' }}>{new Date(lastMovement.createdAt).toLocaleDateString()}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lastMovement.movementType}</div>
                                                </div>
                                            ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => navigate.push('/movements')}
                                                >
                                                    Adjust
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                    onClick={() => openTransfer(loc)}
                                                >
                                                    <ArrowLeftRight size={12} /> Transfer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedData.length === 0 && (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                        No inventory records found for this product.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INLINE TRANSFER MODAL */}
            {transferModal.open && transferModal.loc && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(30,30,30,0.45)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '520px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
                                <ArrowLeftRight size={18} /> Transfer Inventory
                            </h2>
                            <button onClick={closeTransfer} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleTransferSubmit}>
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Source summary */}
                                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>From: {transferModal.loc.warehouseName}</div>
                                    <div style={{ color: 'var(--color-text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <span>Location: {transferModal.loc.locationCode || 'Default'}</span>
                                        {transferModal.loc.lotNumber && <span>Lot: {transferModal.loc.lotNumber}</span>}
                                        <span>Available: <strong style={{ color: '#047857' }}>{transferModal.loc.qtyAvailable}</strong></span>
                                    </div>
                                </div>

                                {transferError && (
                                    <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.875rem' }}>
                                        {transferError}
                                    </div>
                                )}

                                {/* Destination warehouse */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        To Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                                    </label>
                                    <select
                                        value={toWarehouseId}
                                        onChange={e => { setToWarehouseId(e.target.value); setToLocationCode(''); }}
                                        required
                                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', backgroundColor: 'var(--color-white)' }}
                                    >
                                        <option value="">Select destination warehouse…</option>
                                        {warehouses.filter(w => w.isActive).map(wh => (
                                            <option key={wh.id} value={wh.id}>
                                                {wh.warehouseName}{wh.warehouseName === transferModal.loc!.warehouseName ? ' (same — pick different bin)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Destination location */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>To Location / Bin</label>
                                    <select
                                        value={toLocationCode}
                                        onChange={e => setToLocationCode(e.target.value)}
                                        disabled={!toWarehouseId}
                                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', backgroundColor: toWarehouseId ? 'var(--color-white)' : 'var(--color-bg-light)' }}
                                    >
                                        <option value="">Default location</option>
                                        {locations.filter(l => l.warehouseId === toWarehouseId && l.isActive).map(loc => (
                                            <option key={loc.id} value={loc.locationCode}>{loc.locationCode} — {loc.displayName}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        Quantity <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                                            Max: {transferModal.loc.qtyAvailable}
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={transferModal.loc.qtyAvailable}
                                        value={transferQty}
                                        onChange={e => setTransferQty(e.target.value ? Number(e.target.value) : '')}
                                        required
                                        placeholder="Amount…"
                                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                                    />
                                </div>

                                {/* Notes — required */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        Notes <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>Required</span>
                                    </label>
                                    <textarea
                                        value={transferNotes}
                                        onChange={e => setTransferNotes(e.target.value)}
                                        required
                                        rows={2}
                                        placeholder="Reason for transfer, reference number…"
                                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--color-bg-light)' }}>
                                <button type="button" className="btn-secondary" onClick={closeTransfer} disabled={isTransferring}>Cancel</button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isTransferring || !transferNotes.trim() || !toWarehouseId || !transferQty}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Save size={16} />
                                    {isTransferring ? 'Transferring…' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
