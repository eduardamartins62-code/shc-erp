"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Order } from '../types';
import StatusBadge from './StatusBadge';
import TagChip from './ui/TagChip';
import { Clock, Trash2 } from 'lucide-react';
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
    const { fetchOrders, deleteOrders } = useOrders();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS);
    const [showPicklist, setShowPicklist] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const handleConfirmDelete = useCallback(async () => {
        const ids = Array.from(selectedKeys);
        setDeleting(true);
        try {
            await deleteOrders(ids);
            setSelectedKeys(new Set());
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    }, [selectedKeys, deleteOrders]);

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

    // Only show the full-page spinner on the very first load (no orders yet).
    // For subsequent refreshes, keep the existing table visible to avoid flicker.
    if (loading && orders.length === 0) {
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
                onClearSelection={() => { setSelectedKeys(new Set()); setConfirmDelete(false); }}
                availableTags={tags}
                onBulkAddTag={handleBulkAddTag}
                onBulkRemoveTag={handleBulkRemoveTag}
                onBulkPickPack={() => setShowPicklist(true)}
                onBulkDelete={() => setConfirmDelete(true)}
            />

            {/* Delete confirmation banner */}
            {confirmDelete && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    marginBottom: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Trash2 size={16} color="var(--color-shc-red)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-shc-red)' }}>
                            Permanently delete {selectedKeys.size} order{selectedKeys.size !== 1 ? 's' : ''}? This cannot be undone.
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => setConfirmDelete(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-primary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', backgroundColor: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)' }}
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting…' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            )}

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
