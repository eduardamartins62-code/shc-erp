"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Order } from '../../types';
import { useProducts } from '../../context/ProductContext';
import { ordersApi } from '../../services/ordersApi';
import {
    X, ScanLine, CheckCircle2, Package, Layers,
    AlertTriangle, ArrowRight, ChevronRight, Barcode
} from 'lucide-react';

interface BulkPicklistModalProps {
    orders: Order[];
    onClose: () => void;
    onComplete: () => void; // called after all orders are marked Packed
}

interface PicklistEntry {
    sku: string;
    name: string;
    upc?: string;
    totalQty: number;
    pickedQty: number;
    orderBreakdown: { orderId: string; qty: number }[];
}

type Step = 'pick' | 'confirm' | 'done';

const BulkPicklistModal: React.FC<BulkPicklistModalProps> = ({ orders, onClose, onComplete }) => {
    const { products } = useProducts();
    const scanInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<Step>('pick');
    const [scanValue, setScanValue] = useState('');
    const [scanFeedback, setScanFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [entries, setEntries] = useState<PicklistEntry[]>([]);

    // Build consolidated picklist from all orders
    useEffect(() => {
        const map = new Map<string, PicklistEntry>();
        for (const order of orders) {
            for (const item of order.items) {
                if (item.mappingStatus === 'Unmapped') continue; // skip unmapped
                const existing = map.get(item.sku);
                const product = products.find(p => p.sku === item.sku);
                if (existing) {
                    existing.totalQty += item.quantity;
                    existing.orderBreakdown.push({ orderId: order.id, qty: item.quantity });
                } else {
                    map.set(item.sku, {
                        sku: item.sku,
                        name: product?.name || item.sku,
                        upc: product?.upc,
                        totalQty: item.quantity,
                        pickedQty: 0,
                        orderBreakdown: [{ orderId: order.id, qty: item.quantity }]
                    });
                }
            }
        }
        setEntries(Array.from(map.values()));
    }, [orders, products]);

    const totalItems = entries.reduce((s, e) => s + e.totalQty, 0);
    const totalPicked = entries.reduce((s, e) => s + e.pickedQty, 0);
    const allPicked = totalItems > 0 && totalPicked >= totalItems;
    const progressPct = totalItems > 0 ? Math.round((totalPicked / totalItems) * 100) : 0;

    // Focus scan input on mount and when step is 'pick'
    useEffect(() => {
        if (step === 'pick') scanInputRef.current?.focus();
    }, [step]);

    // Handle ESC key
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'done') onClose(); };
        window.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', h); document.body.style.overflow = 'unset'; };
    }, [step, onClose]);

    const showFeedback = (type: 'success' | 'error', msg: string) => {
        setScanFeedback({ type, msg });
        setTimeout(() => setScanFeedback(null), 2000);
    };

    const handleScan = (value: string) => {
        const v = value.trim();
        if (!v) return;
        setScanValue('');

        // Match by UPC first, then by SKU
        const idx = entries.findIndex(e => e.upc === v || e.sku === v);
        if (idx === -1) {
            showFeedback('error', `No match for "${v}"`);
            return;
        }
        const entry = entries[idx];
        if (entry.pickedQty >= entry.totalQty) {
            showFeedback('error', `${entry.sku} — already fully picked`);
            return;
        }
        setEntries(prev => prev.map((e, i) => i === idx ? { ...e, pickedQty: e.pickedQty + 1 } : e));
        showFeedback('success', `✓ ${entry.sku} — ${entry.pickedQty + 1} / ${entry.totalQty}`);
    };

    const markAllPicked = () => {
        setEntries(prev => prev.map(e => ({ ...e, pickedQty: e.totalQty })));
    };

    const handleConfirmPack = async () => {
        setSaving(true);
        try {
            // First mark orders as Picking if they're New/Allocated
            const toPickIds = orders
                .filter(o => ['New', 'Allocated'].includes(o.fulfillmentStatus))
                .map(o => o.id);
            if (toPickIds.length > 0) {
                await ordersApi.bulkUpdateOrderStatus(toPickIds, 'Picking', 'Warehouse Staff');
            }
            // Mark all selected orders as Packed
            await ordersApi.bulkUpdateOrderStatus(orders.map(o => o.id), 'Packed', 'Warehouse Staff');
            setStep('done');
            setTimeout(() => { onComplete(); }, 1200);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to update orders');
        } finally {
            setSaving(false);
        }
    };

    const orderIds = orders.map(o => o.id);

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(18, 18, 18, 0.75)',
                zIndex: 1100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={(e) => { if (e.target === e.currentTarget && step !== 'done') onClose(); }}
        >
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                width: '100%', maxWidth: '860px',
                maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden'
            }}>
                {/* ── Header ── */}
                <div style={{
                    backgroundColor: 'var(--color-primary-dark)', color: '#fff',
                    padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0
                }}>
                    <Package size={20} />
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                            Bulk Pick &amp; Pack — {orders.length} Order{orders.length !== 1 ? 's' : ''}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.65 }}>
                            {orderIds.slice(0, 4).join(', ')}{orderIds.length > 4 ? ` +${orderIds.length - 4} more` : ''}
                        </p>
                    </div>
                    {/* Step indicators */}
                    {(['pick', 'confirm', 'done'] as Step[]).map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                backgroundColor: step === s ? 'var(--color-shc-red)' : (
                                    ['pick', 'confirm', 'done'].indexOf(step) > i ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'
                                ),
                                color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>{i + 1}</div>
                            <span style={{ fontSize: '0.72rem', opacity: step === s ? 1 : 0.5, textTransform: 'capitalize' }}>{s}</span>
                            {i < 2 && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
                        </div>
                    ))}
                    {step !== 'done' && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* ── Progress bar ── */}
                <div style={{ height: '4px', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                    <div style={{
                        height: '100%', width: `${progressPct}%`,
                        backgroundColor: allPicked ? '#16a34a' : 'var(--color-shc-red)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                {/* ── Body ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

                    {step === 'done' && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#166534' }}>
                            <CheckCircle2 size={52} style={{ marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>All orders marked as Packed!</h3>
                            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Refreshing orders list…</p>
                        </div>
                    )}

                    {step === 'pick' && (
                        <>
                            {/* Scan input */}
                            <div style={{
                                display: 'flex', gap: '0.75rem', alignItems: 'center',
                                padding: '0.875rem 1rem', backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '1rem'
                            }}>
                                <ScanLine size={20} color="#0369a1" style={{ flexShrink: 0 }} />
                                <input
                                    ref={scanInputRef}
                                    type="text"
                                    placeholder="Scan UPC or enter SKU and press Enter…"
                                    value={scanValue}
                                    onChange={e => setScanValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { handleScan(scanValue); } }}
                                    style={{
                                        flex: 1, border: 'none', background: 'none',
                                        fontSize: '0.95rem', outline: 'none', color: 'var(--color-primary-dark)',
                                        fontFamily: 'monospace'
                                    }}
                                    autoComplete="off"
                                />
                                <span style={{ fontSize: '0.75rem', color: '#0369a1', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                    {totalPicked} / {totalItems} picked
                                </span>
                            </div>

                            {/* Scan feedback toast */}
                            {scanFeedback && (
                                <div style={{
                                    padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '0.75rem',
                                    backgroundColor: scanFeedback.type === 'success' ? '#dcfce7' : '#fef2f2',
                                    color: scanFeedback.type === 'success' ? '#166534' : '#b91c1c',
                                    fontSize: '0.83rem', fontWeight: 600, border: `1px solid ${scanFeedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                                }}>
                                    {scanFeedback.msg}
                                </div>
                            )}

                            {/* Picklist table */}
                            <div className="table-container">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--color-primary-dark)', color: '#fff' }}>
                                            {['SKU', 'Product', 'UPC', 'Orders', 'Needed', 'Picked', 'Status'].map(h => (
                                                <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry, i) => {
                                            const done = entry.pickedQty >= entry.totalQty;
                                            return (
                                                <tr key={entry.sku} style={{
                                                    backgroundColor: done ? '#f0fdf4' : (i % 2 === 0 ? '#fff' : '#fafafa'),
                                                    borderBottom: '1px solid var(--color-border)'
                                                }}>
                                                    <td style={{ padding: '0.65rem 0.875rem', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                                                        {entry.sku}
                                                    </td>
                                                    <td style={{ padding: '0.65rem 0.875rem', fontSize: '0.85rem' }}>{entry.name}</td>
                                                    <td style={{ padding: '0.65rem 0.875rem' }}>
                                                        {entry.upc ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <Barcode size={14} color="var(--color-text-muted)" />
                                                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{entry.upc}</span>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No UPC</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.65rem 0.875rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        {entry.orderBreakdown.map(b => `${b.orderId} (×${b.qty})`).join(', ')}
                                                    </td>
                                                    <td style={{ padding: '0.65rem 0.875rem', fontWeight: 700, textAlign: 'center' }}>{entry.totalQty}</td>
                                                    <td style={{ padding: '0.65rem 0.875rem', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => setEntries(prev => prev.map((e, j) => j === i && e.pickedQty > 0 ? { ...e, pickedQty: e.pickedQty - 1 } : e))}
                                                                style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                                                            >−</button>
                                                            <span style={{ fontWeight: 700, minWidth: '1.5rem', textAlign: 'center', color: done ? '#16a34a' : 'var(--color-primary-dark)' }}>{entry.pickedQty}</span>
                                                            <button
                                                                onClick={() => setEntries(prev => prev.map((e, j) => j === i && e.pickedQty < e.totalQty ? { ...e, pickedQty: e.pickedQty + 1 } : e))}
                                                                style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-shc-red)' }}
                                                            >+</button>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.65rem 0.875rem' }}>
                                                        {done ? (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '10px', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                <CheckCircle2 size={12} /> Picked
                                                            </span>
                                                        ) : (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '10px', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {entries.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                                    <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                                                    No registered items found in selected orders.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {step === 'confirm' && (
                        <div>
                            <div style={{
                                backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                                borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.25rem',
                                display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534'
                            }}>
                                <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pick complete — {totalPicked} of {totalItems} items picked</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                        Confirm to mark all {orders.length} orders as <strong>Packed</strong>.
                                    </div>
                                </div>
                            </div>

                            <div className="table-container">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--color-primary-dark)', color: '#fff' }}>
                                            {['Order ID', 'Customer', 'Items', 'Total', 'Action'].map(h => (
                                                <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, i) => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                <td style={{ padding: '0.65rem 0.875rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.id}</td>
                                                <td style={{ padding: '0.65rem 0.875rem', fontSize: '0.875rem' }}>{order.customerName}</td>
                                                <td style={{ padding: '0.65rem 0.875rem', fontSize: '0.875rem' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                                                <td style={{ padding: '0.65rem 0.875rem', fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                                <td style={{ padding: '0.65rem 0.875rem' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '10px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        <Layers size={11} /> → Packed
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                {step !== 'done' && (
                    <div style={{
                        flexShrink: 0, padding: '1rem 1.25rem',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backgroundColor: '#fafafa'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {step === 'pick' && `${progressPct}% picked · ${totalItems - totalPicked} remaining`}
                            {step === 'confirm' && `${orders.length} orders will be marked Packed`}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn-secondary" onClick={onClose}>Cancel</button>
                            {step === 'pick' && (
                                <>
                                    {!allPicked && (
                                        <button
                                            className="btn-secondary"
                                            onClick={markAllPicked}
                                            style={{ color: '#0369a1', borderColor: '#0369a1' }}
                                        >
                                            Mark All Picked
                                        </button>
                                    )}
                                    <button
                                        className="btn-primary"
                                        onClick={() => setStep('confirm')}
                                        disabled={totalPicked === 0}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        Review &amp; Pack <ArrowRight size={15} />
                                    </button>
                                </>
                            )}
                            {step === 'confirm' && (
                                <button
                                    className="btn-primary"
                                    onClick={handleConfirmPack}
                                    disabled={saving}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                                >
                                    <CheckCircle2 size={15} />
                                    {saving ? 'Saving…' : `Confirm Pack (${orders.length} orders)`}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkPicklistModal;
