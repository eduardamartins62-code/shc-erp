"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrders } from '../context/OrderContext';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Package, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DataTable, type Column } from '../components/ui/DataTable';
import { SkuLink } from '../components/ui/SkuLink';
import type { OrderItem } from '../types';
import CancelOrderModal from '../components/orders/CancelOrderModal';
import PrintPackingSlipModal from '../components/orders/PrintPackingSlipModal';
import { useState } from 'react';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useRouter();
    const { orders, allocateOrderInventory, updateOrderStatus, loading } = useOrders();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const order = orders.find(o => o.id === id);

    // Simple loading or not-found state
    if (loading) {
        return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Order...</div>;
    }

    if (!order) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h2>Order Not Found</h2>
                <button className="btn-secondary" onClick={() => navigate.push('/orders')}>
                    <ArrowLeft size={16} /> Back to Orders
                </button>
            </div>
        );
    }

    const handleAllocate = async () => {
        try {
            await allocateOrderInventory(order.id, 'System Admin');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to allocate inventory');
        }
    };

    const handlePick = async () => {
        try {
            await updateOrderStatus(order.id, 'Picking', 'Warehouse Staff', 'Started picking process');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to pick order');
        }
    };

    const handlePack = async () => {
        try {
            await updateOrderStatus(order.id, 'Packed', 'Warehouse Staff', 'Order packed and ready for shipping');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to pack order');
        }
    };

    const handleShip = async () => {
        try {
            await updateOrderStatus(order.id, 'Shipped', 'Shipping Dept', 'Handed over to carrier');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to ship order');
        }
    };

    const itemColumns: Column<OrderItem>[] = [
        { key: 'sku', label: 'SKU', type: 'text', filterable: true, render: (val, item) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SkuLink sku={val as string} />
                {item.mappingStatus === 'Unmapped' && (
                    <span title="Unmapped SKU" style={{ display: 'flex' }}>
                        <AlertTriangle size={14} color="var(--color-shc-red)" />
                    </span>
                )}
            </div>
        ) },
        { key: 'quantity', label: 'Qty', type: 'number-range', filterable: true, render: (val) => <span style={{ textAlign: 'right', display: 'block' }}>{val}</span> },
        {
            key: 'price',
            label: 'Price',
            type: 'number-range',
            filterable: true,
            render: (val) => <span style={{ textAlign: 'right', display: 'block' }}>${Number(val).toFixed(2)}</span>
        },
        {
            key: 'total', // using a virtual key to show total
            label: 'Total',
            type: 'number-range',
            filterable: false,
            render: (_, item) => <span style={{ textAlign: 'right', fontWeight: 600, display: 'block' }}>${(item.quantity * item.price).toFixed(2)}</span>
        },
        {
            key: 'allocatedWarehouseId',
            label: 'Allocation',
            type: 'text',
            filterable: true,
            render: (val, item) => val ? (
                <span style={{ fontSize: '0.875rem' }}>
                    {val} <br />
                    <span style={{ color: 'var(--color-text-muted)' }}>Lot: {item.allocatedLotNumber}</span>
                </span>
            ) : (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Pending</span>
            )
        },
        {
            key: 'pickStatus',
            label: 'Status',
            type: 'select',
            options: ['Pending', 'Picked'],
            filterable: true,
            render: (val) => (
                <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: val === 'Picked' ? '#dcfce7' : '#f1f5f9',
                    color: val === 'Picked' ? '#166534' : '#475569',
                    fontWeight: 600
                }}>
                    {val}
                </span>
            )
        }
    ];

    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Header Navigation */}
            <button
                className="btn-secondary"
                style={{ marginBottom: '1.5rem', border: 'none', background: 'transparent', padding: 0 }}
                onClick={() => navigate.push('/orders')}
            >
                <ArrowLeft size={18} /> Back to Orders
            </button>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: 'var(--color-primary-dark)' }}>
                        Order {order.id}
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                        <span>Channel: <strong>{order.channel}</strong></span>
                        {order.storeName && (
                            <>
                                <span>•</span>
                                <span>Store: <strong>{order.storeName}</strong></span>
                            </>
                        )}
                        <span>•</span>
                        <span>Date: {new Date(order.orderDate).toLocaleString()}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <StatusBadge status={order.fulfillmentStatus} type="fulfillment" size="md" />
                    <StatusBadge status={order.paymentStatus} type="payment" size="md" />
                </div>
            </div>

            <div className="grid-2" style={{ gap: '2rem', marginBottom: '2rem', gridTemplateColumns: '2fr 1fr' }}>
                {/* Left Column: Flow & Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Unmapped SKU Warning */}
                    {order.items.some(i => i.mappingStatus === 'Unmapped') && (
                        <div style={{
                            backgroundColor: 'var(--color-bg-warning)',
                            border: '1px solid var(--color-status-reserved)',
                            color: '#92400e',
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Unmapped SKUs Detected</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Some items in this order do not match any known SKU in your inventory. Please create or map these SKUs before attempting to fulfill this order.</p>
                            </div>
                        </div>
                    )}

                    {/* Action Panel */}
                    <div className="card" style={{ backgroundColor: '#fafafa' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>Workflow Actions</h3>
                        
                        {order.fulfillmentStatus === 'Cancelled' ? (
                            <div style={{ backgroundColor: 'var(--color-bg-danger)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--color-status-expired)', color: 'var(--color-shc-red)' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle size={16} /> Order Cancelled
                                </div>
                                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    <strong>Cancelled By:</strong> {order.canceledBy || 'System'}
                                </div>
                                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                    <strong>Date:</strong> {order.canceledAt ? new Date(order.canceledAt).toLocaleString() : 'Unknown'}
                                </div>
                                <div style={{ fontSize: '0.875rem' }}>
                                    <strong>Reason:</strong> {order.cancellationReason || 'No reason provided'}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {order.fulfillmentStatus === 'New' && (
                                    <button className="btn-primary" onClick={handleAllocate}>
                                        <MapPin size={16} /> Allocate Inventory
                                    </button>
                                )}
                                {order.fulfillmentStatus === 'Allocated' && (
                                    <button className="btn-primary" onClick={handlePick}>
                                        <Package size={16} /> Start Picking
                                    </button>
                                )}
                                {order.fulfillmentStatus === 'Picking' && (
                                    <button className="btn-primary" onClick={handlePack}>
                                        <CheckCircle size={16} /> Mark as Packed
                                    </button>
                                )}
                                {order.fulfillmentStatus === 'Packed' && (
                                    <button className="btn-primary" onClick={handleShip}>
                                        Ship Order
                                    </button>
                                )}

                                {/* Generic actions available depending on status */}
                                {['Allocated', 'Picking'].includes(order.fulfillmentStatus) && (
                                    <button className="btn-secondary">
                                        Print Pick List
                                    </button>
                                )}
                                {['Packed', 'Shipped'].includes(order.fulfillmentStatus) && (
                                    <button className="btn-secondary" onClick={() => setShowPrintModal(true)}>
                                        Print Packing Slip
                                    </button>
                                )}
                                {order.fulfillmentStatus !== 'Shipped' && (
                                    <button className="btn-secondary" style={{ color: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)' }} onClick={() => setShowCancelModal(true)}>
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="card">
                        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>Order Items</h2>
                        <DataTable
                            columns={itemColumns}
                            data={order.items}
                        />
                    </div>
                </div>

                {/* Right Column: Details & Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Customer Info */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                            Customer Details
                        </h3>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>{order.customerName}</p>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{order.customerEmail}</p>

                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Shipping Address</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
                            {order.shippingAddress}
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                            Financial Summary
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Tax</span>
                            <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Fees</span>
                            <span>${order.fees.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.125rem' }}>
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} /> Order Timeline
                        </h3>
                        <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                            {/* Vertical Line */}
                            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--color-border)' }}></div>

                            {order.timeline.map((event, index) => (
                                <div key={event.id} style={{ position: 'relative', marginBottom: index === order.timeline.length - 1 ? 0 : '1.5rem' }}>
                                    {/* Timeline Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-1.5rem',
                                        top: '4px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: index === order.timeline.length - 1 ? 'var(--color-shc-red)' : 'var(--color-border)',
                                        border: '2px solid white'
                                    }}></div>

                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{event.action}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(event.timestamp).toLocaleString()} • {event.performedBy}
                                    </div>
                                    {event.notes && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                            {event.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
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
        </div>
    );
};

export default OrderDetails;
