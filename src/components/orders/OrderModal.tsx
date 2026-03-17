"use client";

import React, { useState, useEffect } from 'react';
import type { Order, OrderItem } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { useTags } from '../../context/TagsContext';
import StatusBadge from '../StatusBadge';
import TagChip from '../ui/TagChip';
import TagMultiSelect from '../ui/TagMultiSelect';
import { DataTable, type Column } from '../ui/DataTable';
import { SkuLink } from '../ui/SkuLink';
import CancelOrderModal from './CancelOrderModal';
import PrintPackingSlipModal from './PrintPackingSlipModal';
import QuickAddProductModal from './QuickAddProductModal';
import {
    X, ChevronLeft, ChevronRight,
    MapPin, Package, CheckCircle, Clock,
    AlertTriangle, Tag, Printer, XCircle, PlusCircle
} from 'lucide-react';

interface OrderModalProps {
    order: Order | null;
    orders: Order[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (newIndex: number) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
    order, orders, currentIndex, onClose, onNavigate
}) => {
    const { allocateOrderInventory, updateOrderStatus, fetchOrders } = useOrders();
    const { assignTagToOrder, removeTagFromOrder } = useTags();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [quickAddSku, setQuickAddSku] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!order) return;

        const handleKey = (e: KeyboardEvent) => {
            if (showCancelModal || showPrintModal || quickAddSku) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
            if (e.key === 'ArrowRight' && currentIndex < orders.length - 1) onNavigate(currentIndex + 1);
        };

        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = 'unset';
        };
    }, [order, currentIndex, orders.length, showCancelModal, showPrintModal, quickAddSku, onClose, onNavigate]);

    if (!order) return null;

    const handleAction = async (fn: () => Promise<void>) => {
        setActionLoading(true);
        try {
            await fn();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        await removeTagFromOrder(order.id, tagId);
        await fetchOrders();
    };

    const itemColumns: Column<OrderItem>[] = [
        {
            key: 'sku', label: 'SKU', type: 'text', filterable: false,
            render: (val, item) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.mappingStatus === 'Unmapped' ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                            {val as string}
                        </span>
                    ) : (
                        <SkuLink sku={val as string} />
                    )}
                    {item.mappingStatus === 'Unmapped' && (
                        <button
                            title="This SKU is not in the system — click to add it"
                            onClick={() => setQuickAddSku(val as string)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                background: 'none', border: '1px solid var(--color-shc-red)',
                                color: 'var(--color-shc-red)', borderRadius: '4px',
                                padding: '0.1rem 0.4rem', fontSize: '0.7rem', fontWeight: 600,
                                cursor: 'pointer', whiteSpace: 'nowrap'
                            }}
                        >
                            <PlusCircle size={11} /> Add
                        </button>
                    )}
                </div>
            )
        },
        {
            key: 'quantity', label: 'Qty', type: 'number-range', filterable: false,
            render: (val) => <span style={{ textAlign: 'right', display: 'block' }}>{val}</span>
        },
        {
            key: 'price', label: 'Price', type: 'number-range', filterable: false,
            render: (val) => <span style={{ textAlign: 'right', display: 'block' }}>${Number(val).toFixed(2)}</span>
        },
        {
            key: 'total', label: 'Total', type: 'number-range', filterable: false,
            render: (_, item) => <span style={{ textAlign: 'right', fontWeight: 600, display: 'block' }}>${(item.quantity * item.price).toFixed(2)}</span>
        },
        {
            key: 'allocatedWarehouseId', label: 'Allocation', type: 'text', filterable: false,
            render: (val, item) => val ? (
                <span style={{ fontSize: '0.875rem' }}>
                    {val}<br />
                    <span style={{ color: 'var(--color-text-muted)' }}>Lot: {item.allocatedLotNumber}</span>
                </span>
            ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Pending</span>
        },
        {
            key: 'pickStatus', label: 'Status', type: 'select', options: ['Pending', 'Picked'], filterable: false,
            render: (val) => (
                <span style={{
                    fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                    backgroundColor: val === 'Picked' ? '#dcfce7' : '#f1f5f9',
                    color: val === 'Picked' ? '#166534' : '#475569', fontWeight: 600
                }}>{val}</span>
            )
        }
    ];

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < orders.length - 1;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(18, 18, 18, 0.7)',
                    zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Modal panel */}
                <div style={{
                    backgroundColor: 'var(--color-bg-light)',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '1200px',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                    overflow: 'hidden'
                }}>
                    {/* ── Header ── */}
                    <div style={{
                        backgroundColor: 'var(--color-primary-dark)',
                        color: 'white',
                        padding: '0.875rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexShrink: 0
                    }}>
                        {/* Prev / Next */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button
                                onClick={() => onNavigate(currentIndex - 1)}
                                disabled={!hasPrev}
                                title="Previous order (←)"
                                style={{
                                    background: 'none', border: '1px solid rgba(255,255,255,0.25)',
                                    color: 'white', borderRadius: '6px', padding: '0.25rem 0.4rem',
                                    cursor: hasPrev ? 'pointer' : 'not-allowed',
                                    opacity: hasPrev ? 1 : 0.35, display: 'flex', alignItems: 'center'
                                }}
                            >
                                <ChevronLeft size={17} />
                            </button>
                            <button
                                onClick={() => onNavigate(currentIndex + 1)}
                                disabled={!hasNext}
                                title="Next order (→)"
                                style={{
                                    background: 'none', border: '1px solid rgba(255,255,255,0.25)',
                                    color: 'white', borderRadius: '6px', padding: '0.25rem 0.4rem',
                                    cursor: hasNext ? 'pointer' : 'not-allowed',
                                    opacity: hasNext ? 1 : 0.35, display: 'flex', alignItems: 'center'
                                }}
                            >
                                <ChevronRight size={17} />
                            </button>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>
                            {currentIndex + 1} / {orders.length}
                        </span>

                        {/* Title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Order {order.id}
                                <span style={{ marginLeft: '0.6rem', fontWeight: 400, fontSize: '0.85rem', opacity: 0.6 }}>
                                    {order.channel}{order.storeName ? ` · ${order.storeName}` : ''} · {new Date(order.orderDate).toLocaleDateString()}
                                </span>
                            </h2>
                        </div>

                        {/* Status badges */}
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                            <StatusBadge status={order.fulfillmentStatus} type="fulfillment" size="md" />
                            <StatusBadge status={order.paymentStatus} type="payment" size="md" />
                        </div>

                        {/* Header actions */}
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                            <button
                                onClick={() => setShowPrintModal(true)}
                                style={{
                                    background: 'none', border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white', borderRadius: '6px', padding: '0.35rem 0.65rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem'
                                }}
                            >
                                <Printer size={14} /> Print
                            </button>
                            {!['Cancelled', 'Shipped'].includes(order.fulfillmentStatus) && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    style={{
                                        background: 'none', border: '1px solid rgba(193,39,45,0.55)',
                                        color: '#ffaaaa', borderRadius: '6px', padding: '0.35rem 0.65rem',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem'
                                    }}
                                >
                                    <XCircle size={14} /> Cancel
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)',
                                    cursor: 'pointer', padding: '0.25rem', display: 'flex', borderRadius: '4px'
                                }}
                            >
                                <X size={21} />
                            </button>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.25rem',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '1.25rem',
                        alignItems: 'start'
                    }}>
                        {/* ── Left Column ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Unmapped SKU warning */}
                            {order.items.some(i => i.mappingStatus === 'Unmapped') && (
                                <div style={{
                                    backgroundColor: 'var(--color-bg-warning)',
                                    border: '1px solid var(--color-status-reserved)',
                                    color: '#92400e', padding: '0.875rem 1rem',
                                    borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.875rem'
                                }}>
                                    <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.875rem' }}>Unregistered SKUs Found</h4>
                                        <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem' }}>
                                            The following items are not in your product catalog. Click <strong>Add</strong> next to each SKU to register it before fulfilling.
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {order.items.filter(i => i.mappingStatus === 'Unmapped').map(i => (
                                                <button
                                                    key={i.sku}
                                                    onClick={() => setQuickAddSku(i.sku)}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                        backgroundColor: '#fff', border: '1px solid #d97706',
                                                        color: '#92400e', borderRadius: '5px',
                                                        padding: '0.2rem 0.6rem', fontSize: '0.78rem',
                                                        fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace'
                                                    }}
                                                >
                                                    <PlusCircle size={12} /> {i.sku}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Workflow Actions */}
                            <div className="card" style={{ backgroundColor: '#fafafa' }}>
                                <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Workflow Actions
                                </h3>

                                {order.fulfillmentStatus === 'Cancelled' ? (
                                    <div style={{
                                        backgroundColor: 'var(--color-bg-danger)', padding: '0.875rem', borderRadius: '6px',
                                        border: '1px solid var(--color-status-expired)', color: 'var(--color-shc-red)'
                                    }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                                            <CheckCircle size={15} /> Order Cancelled
                                        </div>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            <strong>By:</strong> {order.canceledBy || 'System'} &nbsp;|&nbsp;
                                            <strong>Date:</strong> {order.canceledAt ? new Date(order.canceledAt).toLocaleString() : 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                            <strong>Reason:</strong> {order.cancellationReason || 'No reason provided'}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {order.fulfillmentStatus === 'New' && (
                                            <button
                                                className="btn-primary"
                                                disabled={actionLoading}
                                                onClick={() => handleAction(() => allocateOrderInventory(order.id, 'System Admin'))}
                                            >
                                                <MapPin size={15} /> Allocate Inventory
                                            </button>
                                        )}
                                        {order.fulfillmentStatus === 'Allocated' && (
                                            <>
                                                <button
                                                    className="btn-primary"
                                                    disabled={actionLoading}
                                                    onClick={() => handleAction(() => updateOrderStatus(order.id, 'Picking', 'Warehouse Staff', 'Started picking process'))}
                                                >
                                                    <Package size={15} /> Start Picking
                                                </button>
                                                <button className="btn-secondary" disabled={actionLoading}>Print Pick List</button>
                                            </>
                                        )}
                                        {order.fulfillmentStatus === 'Picking' && (
                                            <>
                                                <button
                                                    className="btn-primary"
                                                    disabled={actionLoading}
                                                    onClick={() => handleAction(() => updateOrderStatus(order.id, 'Packed', 'Warehouse Staff', 'Order packed and ready for shipping'))}
                                                >
                                                    <CheckCircle size={15} /> Mark as Packed
                                                </button>
                                                <button className="btn-secondary" disabled={actionLoading}>Print Pick List</button>
                                            </>
                                        )}
                                        {order.fulfillmentStatus === 'Packed' && (
                                            <>
                                                <button
                                                    className="btn-primary"
                                                    disabled={actionLoading}
                                                    onClick={() => handleAction(() => updateOrderStatus(order.id, 'Shipped', 'Shipping Dept', 'Handed over to carrier'))}
                                                >
                                                    Ship Order
                                                </button>
                                                <button className="btn-secondary" disabled={actionLoading} onClick={() => setShowPrintModal(true)}>
                                                    Print Packing Slip
                                                </button>
                                            </>
                                        )}
                                        {order.fulfillmentStatus === 'Shipped' && (
                                            <button className="btn-secondary" onClick={() => setShowPrintModal(true)}>
                                                Print Packing Slip
                                            </button>
                                        )}
                                        {!['Shipped', 'Cancelled'].includes(order.fulfillmentStatus) && (
                                            <button
                                                className="btn-secondary"
                                                style={{ color: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)' }}
                                                disabled={actionLoading}
                                                onClick={() => setShowCancelModal(true)}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="card">
                                <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Order Items
                                </h3>
                                <DataTable columns={itemColumns} data={order.items} />
                            </div>
                        </div>

                        {/* ── Right Column ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Customer Details */}
                            <div className="card">
                                <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Customer Details
                                </h3>
                                <p style={{ margin: '0 0 0.2rem 0', fontWeight: 600, fontSize: '0.95rem' }}>{order.customerName}</p>
                                <p style={{ margin: '0 0 0.875rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{order.customerEmail}</p>
                                <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>SHIPPING ADDRESS</p>
                                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>{order.shippingAddress}</p>
                            </div>

                            {/* Tags */}
                            <div className="card">
                                <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <Tag size={14} /> Tags
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem', minHeight: '1.5rem' }}>
                                    {(order.tags ?? []).map(tag => (
                                        <TagChip key={tag.id} tag={tag} onRemove={() => handleRemoveTag(tag.id)} size="md" />
                                    ))}
                                    {(order.tags ?? []).length === 0 && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No tags assigned</span>
                                    )}
                                </div>
                                <TagMultiSelect
                                    selectedTagIds={(order.tags ?? []).map(t => t.id)}
                                    onChange={async (newIds) => {
                                        const currentIds = (order.tags ?? []).map(t => t.id);
                                        const added = newIds.filter(id => !currentIds.includes(id));
                                        for (const tagId of added) {
                                            await assignTagToOrder(order.id, tagId);
                                        }
                                        await fetchOrders();
                                    }}
                                />
                            </div>

                            {/* Financial Summary */}
                            <div className="card">
                                <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Financial Summary
                                </h3>
                                {[
                                    ['Subtotal', order.subtotal],
                                    ['Tax', order.tax],
                                    ['Fees', order.fees],
                                ].map(([label, val]) => (
                                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{label as string}</span>
                                        <span>${(val as number).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.4rem', borderTop: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1rem' }}>
                                    <span>Total</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="card">
                                <h3 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <Clock size={14} /> Order Timeline
                                </h3>
                                <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                                    <div style={{ position: 'absolute', left: '5px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--color-border)' }} />
                                    {order.timeline.map((event, index) => (
                                        <div key={event.id} style={{ position: 'relative', marginBottom: index === order.timeline.length - 1 ? 0 : '1.25rem' }}>
                                            <div style={{
                                                position: 'absolute', left: '-1.25rem', top: '4px',
                                                width: '10px', height: '10px', borderRadius: '50%',
                                                backgroundColor: index === order.timeline.length - 1 ? 'var(--color-shc-red)' : 'var(--color-border)',
                                                border: '2px solid white'
                                            }} />
                                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{event.action}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                                {new Date(event.timestamp).toLocaleString()} · {event.performedBy}
                                            </div>
                                            {event.notes && (
                                                <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', backgroundColor: '#f8fafc', padding: '0.4rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                                    {event.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CancelOrderModal
                order={order}
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
            />
            <PrintPackingSlipModal
                order={order}
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
            />
            {quickAddSku && (
                <QuickAddProductModal
                    sku={quickAddSku}
                    onClose={() => setQuickAddSku(null)}
                    onAdded={async () => {
                        setQuickAddSku(null);
                        await fetchOrders();
                    }}
                />
            )}
        </>
    );
};

export default OrderModal;
