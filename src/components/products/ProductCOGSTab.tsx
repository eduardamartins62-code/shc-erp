import React, { useState } from 'react';
import type { Product, COGSHistoryLog, InventoryLocation } from '../../types/products';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import LogCostChangeModal from './LogCostChangeModal';

interface ProductCOGSTabProps {
    product: Product;
    cogsHistory: COGSHistoryLog[];
    locations: InventoryLocation[];
    onLogCostChange: (newCost: number, notes: string) => void;
}

export const ProductCOGSTab: React.FC<ProductCOGSTabProps> = ({
    product,
    cogsHistory,
    locations,
    onLogCostChange
}) => {
    const [isCostModalOpen, setIsCostModalOpen] = useState(false);

    const historyForProduct = cogsHistory.filter(c => c.sku === product.sku)
        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

    const currentCost = product.costOfGoods || 0;
    const previousCost = historyForProduct.length > 0 ? historyForProduct[0].previousCost : currentCost;

    // Calculate differences
    const costChange = currentCost - previousCost;
    const costChangePercent = previousCost > 0 ? (costChange / previousCost) * 100 : 0;

    // Find first recorded cost
    const firstRecordedLog = historyForProduct.length > 0 ? historyForProduct[historyForProduct.length - 1] : null;
    const firstRecordedCost = firstRecordedLog ? firstRecordedLog.previousCost : currentCost;
    const firstRecordedDate = firstRecordedLog ? new Date(firstRecordedLog.changedAt).toLocaleDateString() : '—';

    // Group locations by lot
    let totalQty = 0;
    let totalComputedCogs = 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* SUMMARY BAR */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '3rem' }}>
                    <div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Current Cost</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                            ${currentCost.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Previous Cost</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            ${previousCost.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Latest Change</div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: costChange > 0 ? 'var(--color-shc-red)' : costChange < 0 ? 'var(--color-status-active)' : 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '0.25rem'
                        }}>
                            {costChange > 0 && <ArrowUpRight size={18} style={{ marginRight: '4px' }} />}
                            {costChange < 0 && <ArrowDownRight size={18} style={{ marginRight: '4px' }} />}
                            {costChange === 0 && <span style={{ marginRight: '4px' }}>=</span>}
                            ${Math.abs(costChange).toFixed(2)} ({Math.abs(costChangePercent).toFixed(1)}%)
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '3rem' }}>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>First Recorded Cost</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-primary-dark)', marginTop: '0.25rem' }}>
                            ${firstRecordedCost.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>on {firstRecordedDate}</span>
                        </div>
                    </div>
                </div>

                <button className="btn-primary" onClick={() => setIsCostModalOpen(true)}>
                    <Plus size={16} />
                    Log Cost Change
                </button>
            </div>

            {/* COGS HISTORY TABLE */}
            <div className="card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: 0 }}>COGS History</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date / Time</th>
                                <th style={{ textAlign: 'right' }}>Previous Cost</th>
                                <th style={{ textAlign: 'right' }}>New Cost</th>
                                <th style={{ textAlign: 'right' }}>Change ($)</th>
                                <th style={{ textAlign: 'right' }}>Change (%)</th>
                                <th>Changed By</th>
                                <th>Notes / Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyForProduct.map(log => {
                                const diff = log.newCost - log.previousCost;
                                const diffPct = log.previousCost > 0 ? (diff / log.previousCost) * 100 : 0;
                                const isIncrease = diff > 0;
                                const isDecrease = diff < 0;

                                return (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: 500 }}>
                                            {new Date(log.changedAt).toLocaleDateString()} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>{new Date(log.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>${log.previousCost.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary-dark)' }}>${log.newCost.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 500, color: isIncrease ? 'var(--color-shc-red)' : isDecrease ? 'var(--color-status-active)' : 'inherit' }}>
                                            {isIncrease ? '+' : ''}{diff.toFixed(2)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 500, color: isIncrease ? 'var(--color-shc-red)' : isDecrease ? 'var(--color-status-active)' : 'inherit' }}>
                                            {isIncrease ? '+' : ''}{diffPct.toFixed(1)}%
                                        </td>
                                        <td>{log.changedBy}</td>
                                        <td style={{ color: 'var(--color-text-muted)' }}>{log.notes || '—'}</td>
                                    </tr>
                                );
                            })}
                            {historyForProduct.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                        No cost history recorded for this product yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* COGS BY LOT SUB-SECTION */}
            <div className="card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: 0 }}>Total COGS by Lot & Quantity</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Lot Number</th>
                                <th>Location / Bin</th>
                                <th style={{ textAlign: 'right' }}>Quantity On Hand</th>
                                <th style={{ textAlign: 'right' }}>Unit Cost at Receive</th>
                                <th style={{ textAlign: 'right' }}>Total COGS (Received)</th>
                                <th style={{ textAlign: 'right' }}>Current Unit Cost</th>
                                <th style={{ textAlign: 'right' }}>Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.filter(l => l.qtyOnHand > 0).map(loc => {
                                const rowQty = loc.qtyOnHand;
                                const receiveCost = loc.lotReceiveCost || currentCost;
                                const rowCogsRec = rowQty * receiveCost;
                                const rowCogsCur = rowQty * currentCost;
                                const variance = rowCogsCur - rowCogsRec;

                                totalQty += rowQty;
                                totalComputedCogs += rowCogsRec;

                                return (
                                    <tr key={loc.id}>
                                        <td>
                                            {loc.lotNumber ? <span className="badge" style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-border)' }}>{loc.lotNumber}</span> : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No Lot</span>}
                                        </td>
                                        <td>{loc.warehouseName} {loc.locationCode ? `(${loc.locationCode})` : ''}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 500 }}>{rowQty.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>${receiveCost.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary-dark)' }}>${rowCogsRec.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>${currentCost.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 500, color: variance > 0 ? 'var(--color-status-active)' : variance < 0 ? 'var(--color-shc-red)' : 'inherit' }}>
                                            {variance > 0 ? '+' : ''}{variance === 0 ? '0.00' : variance.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}

                            {locations.length > 0 && (
                                <tr style={{ backgroundColor: 'var(--color-bg-light)', fontWeight: 600 }}>
                                    <td colSpan={2} style={{ textAlign: 'right' }}>GRAND TOTAL</td>
                                    <td style={{ textAlign: 'right' }}>{totalQty.toLocaleString()}</td>
                                    <td></td>
                                    <td style={{ textAlign: 'right', color: 'var(--color-primary-dark)', fontSize: '1.1em' }}>${totalComputedCogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            )}
                            {locations.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                        No active inventory for this product.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <LogCostChangeModal
                isOpen={isCostModalOpen}
                onClose={() => setIsCostModalOpen(false)}
                currentCost={currentCost}
                onSave={onLogCostChange}
            />
        </div>
    );
};
