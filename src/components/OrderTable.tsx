"use client";

import React, { useState } from 'react';
import type { Order } from '../types';
import StatusBadge from './StatusBadge';
import TagChip from './ui/TagChip';
import { Clock } from 'lucide-react';
import { DataTable, type Column } from './ui/DataTable';
import { BulkActionBar } from './ui/BulkActionBar';
import OrderModal from './orders/OrderModal';

interface OrderTableProps {
    orders: Order[];
    loading?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, loading }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

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
                onRowClick={(order) => {
                    const idx = orders.findIndex(o => o.id === order.id);
                    setSelectedIndex(idx >= 0 ? idx : null);
                }}
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <OrderModal
                order={selectedIndex !== null ? orders[selectedIndex] : null}
                orders={orders}
                currentIndex={selectedIndex ?? 0}
                onClose={() => setSelectedIndex(null)}
                onNavigate={(newIdx) => setSelectedIndex(newIdx)}
            />
        </div>
    );
};

export default OrderTable;
