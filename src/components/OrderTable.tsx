"use client";

import React, { useState } from 'react';
import type { Order } from '../types';
import StatusBadge from './StatusBadge';
import TagChip from './ui/TagChip';
import { Eye, Clock, Printer, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from './ui/DataTable';
import { SlideOverPanel } from './ui/SlideOverPanel';
import { BulkActionBar } from './ui/BulkActionBar';
import CancelOrderModal from './orders/CancelOrderModal';
import PrintPackingSlipModal from './orders/PrintPackingSlipModal';

interface OrderTableProps {
    orders: Order[];
    loading?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, loading }) => {
    const navigate = useRouter();
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const columns: Column<Order>[] = [
        {
            key: 'id',
            label: 'Order ID',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
        },
        {
            key: 'orderDate',
            label: 'Date',
            type: 'date-range',
            filterable: true,
            render: (val) => new Date(val).toLocaleString()
        },
        { key: 'customerName', label: 'Customer', type: 'text', filterable: true },
        {
            key: 'channel',
            label: 'Channel',
            type: 'select',
            filterable: true,
            options: Array.from(new Set(orders.map(o => o.channel))),
            render: (val) => (
                <span style={{
                    backgroundColor: 'var(--color-bg-light)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                }}>
                    {val}
                </span>
            )
        },
        {
            key: 'fulfillmentStatus',
            label: 'Fulfillment Status',
            type: 'select',
            filterable: true,
            options: ['New', 'Allocated', 'Picking', 'Packed', 'Shipped'],
            render: (val) => <StatusBadge status={val} type="fulfillment" />
        },
        {
            key: 'paymentStatus',
            label: 'Payment Status',
            type: 'select',
            filterable: true,
            options: ['Paid', 'Pending', 'Failed'],
            render: (val) => <StatusBadge status={val} type="payment" />
        },
        {
            key: 'total',
            label: 'Total',
            type: 'number-range',
            filterable: true,
            render: (val) => <span style={{ fontWeight: 600 }}>${Number(val).toFixed(2)}</span>
        },
        {
            key: 'tags',
            label: 'Tags',
            type: 'text',
            filterable: false,
            render: (_: any, order: Order) => (
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {(order.tags ?? []).map(t => <TagChip key={t.id} tag={t} />)}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Clock className="animate-spin" size={24} style={{ margin: '0 auto', marginBottom: '1rem', color: 'var(--color-primary-dark)' }} />
                Loading orders...
            </div>
        );
    }

    return (
        <div>
            <BulkActionBar
                selectedCount={selectedKeys.size}
                module="orders"
                onClearSelection={() => setSelectedKeys(new Set())}
            />
            <DataTable
                data={orders}
                columns={columns}
                onRowClick={setDetailOrder}
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <SlideOverPanel
                isOpen={!!detailOrder}
                onClose={() => setDetailOrder(null)}
                title="Order Details"
                actions={
                    <>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                                if (detailOrder) {
                                    setShowPrintModal(true);
                                }
                            }}
                        >
                            <Printer size={14} /> Print Slip
                        </button>
                        {detailOrder?.fulfillmentStatus !== 'Cancelled' && detailOrder?.fulfillmentStatus !== 'Shipped' && (
                            <button
                                className="btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-shc-red)' }}
                                onClick={() => {
                                    if (detailOrder) {
                                        setShowCancelModal(true);
                                    }
                                }}
                            >
                                <XCircle size={14} /> Cancel
                            </button>
                        )}
                    </>
                }
            >
                {detailOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{detailOrder.id}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <StatusBadge status={detailOrder.fulfillmentStatus} type="fulfillment" />
                                    <StatusBadge status={detailOrder.paymentStatus} type="payment" />
                                </div>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                Placed on {new Date(detailOrder.orderDate).toLocaleString()}
                            </p>
                        </div>

                        <div className="card">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Customer</p>
                                    <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>{detailOrder.customerName}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Channel</p>
                                    <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>{detailOrder.channel}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Total Amount</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-primary-dark)' }}>${detailOrder.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => navigate.push(`/orders/${detailOrder.id}`)}
                            >
                                <Eye size={18} /> View Full Order Workflow
                            </button>
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            <CancelOrderModal
                order={detailOrder}
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
            />

            <PrintPackingSlipModal
                order={detailOrder}
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
            />
        </div>
    );
};

export default OrderTable;
