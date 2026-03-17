"use client";

import React, { useState, useMemo } from 'react';
import type { Order } from '../types';
import StatusBadge from './StatusBadge';
import TagChip from './ui/TagChip';
import { Clock } from 'lucide-react';
import { DataTable, type Column } from './ui/DataTable';
import { BulkActionBar } from './ui/BulkActionBar';
import OrderModal from './orders/OrderModal';
import OrderFilterBar, { applyOrderFilters, EMPTY_FILTERS, type OrderFilters } from './orders/OrderFilterBar';
import BulkPicklistModal from './orders/BulkPicklistModal';
import { useTags } from '../context/TagsContext';
import { useOrders } from '../context/OrderContext';
import { tagsApi } from '../services/tagsApi';

interface OrderTableProps {
    orders: Order[];
    loading?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, loading }) => {
    const { tags } = useTags();
    const { fetchOrders } = useOrders();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS);
    const [showPicklist, setShowPicklist] = useState(false);

    const filteredOrders = useMemo(() => applyOrderFilters(orders, filters), [orders, filters]);

    const handleFilterChange = (f: OrderFilters) => {
        setFilters(f);
        setSelectedKeys(new Set());
    };

    const handleBulkAddTag = async (tagId: string) => {
        const ids = Array.from(selectedKeys);
        await Promise.all(ids.map(orderId => tagsApi.assignTagToOrder(orderId, tagId)));
        await fetchOrders();
    };

    const handleBulkRemoveTag = async (tagId: string) => {
        const ids = Array.from(selectedKeys);
        await Promise.all(ids.map(orderId => tagsApi.removeTagFromOrder(orderId, tagId)));
        await fetchOrders();
    };

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
            label: 'Store',
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
            label: 'Fulfillment',
            type: 'select',
            filterable: true,
            options: ['New', 'Allocated', 'Picking', 'Packed', 'Shipped'],
            render: (val) => <StatusBadge status={val} type="fulfillment" />
        },
        {
            key: 'paymentStatus',
            label: 'Payment',
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

    const isFiltered = filters.tagIds.length > 0 || filters.channels.length > 0 ||
        filters.statuses.length > 0 || !!filters.dateFrom || !!filters.dateTo;

    return (
        <div>
            {/* ShipStation-style filter bar */}
            <OrderFilterBar
                orders={orders}
                tags={tags}
                filters={filters}
                onChange={handleFilterChange}
            />

            {/* Results count when filters active */}
            {isFiltered && (
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>
            )}

            {/* Bulk action bar (visible when rows selected) */}
            <BulkActionBar
                selectedCount={selectedKeys.size}
                module="orders"
                onClearSelection={() => setSelectedKeys(new Set())}
                availableTags={tags}
                onBulkAddTag={handleBulkAddTag}
                onBulkRemoveTag={handleBulkRemoveTag}
                onBulkPickPack={() => setShowPicklist(true)}
            />

            <DataTable
                data={filteredOrders}
                columns={columns}
                onRowClick={(order) => {
                    const idx = filteredOrders.findIndex(o => o.id === order.id);
                    setSelectedIndex(idx >= 0 ? idx : null);
                }}
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <OrderModal
                order={selectedIndex !== null ? filteredOrders[selectedIndex] : null}
                orders={filteredOrders}
                currentIndex={selectedIndex ?? 0}
                onClose={() => setSelectedIndex(null)}
                onNavigate={(newIdx) => setSelectedIndex(newIdx)}
            />

            {showPicklist && (
                <BulkPicklistModal
                    orders={filteredOrders.filter(o => selectedKeys.has(o.id))}
                    onClose={() => setShowPicklist(false)}
                    onComplete={async () => {
                        setShowPicklist(false);
                        setSelectedKeys(new Set());
                        await fetchOrders();
                    }}
                />
            )}
        </div>
    );
};

export default OrderTable;
