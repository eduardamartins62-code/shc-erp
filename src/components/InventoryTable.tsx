import React, { useState } from 'react';
import type { InventoryItem } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useProducts } from '../context/ProductContext';
import { Edit2, ArrowRightLeft, Plus, Download, History } from 'lucide-react';
import ReceiveForm from './ReceiveForm';
import AdjustForm from './AdjustForm';
import TransferForm from './TransferForm';
import { DataTable, type Column } from './ui/DataTable';
import { SlideOverPanel } from './ui/SlideOverPanel';
import { BulkActionBar } from './ui/BulkActionBar';
import { SkuLink } from './ui/SkuLink';
import MovementHistorySlideOver from './movements/MovementHistorySlideOver';
import ExportInventoryModal from './inventory/ExportInventoryModal';

interface Props {
    data?: InventoryItem[];
    isDashboard?: boolean;
}

const InventoryTable: React.FC<Props> = ({ data, isDashboard }) => {
    const { inventory } = useInventory();
    const { products } = useProducts();
    const displayData = data || inventory;

    const [activeModal, setActiveModal] = useState<'receive' | 'adjust' | 'transfer' | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [detailItem, setDetailItem] = useState<InventoryItem | null>(null); // For slide-over
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [showHistory, setShowHistory] = useState(false);
    const [showExport, setShowExport] = useState(false);

    const calculateAvailable = (item: InventoryItem) => item.quantityOnHand - item.quantityReserved;

    const hasExpiration = (val: string | null | undefined): boolean => {
        if (!val) return false;
        const d = new Date(val);
        // Treat epoch (1970-01-01) as no expiration — happens when DB stores null as 0
        return !isNaN(d.getTime()) && d.getFullYear() > 1970;
    };

    const getStatusStr = (item: InventoryItem) => {
        const available = calculateAvailable(item);
        const isExpired = hasExpiration(item.expirationDate) && new Date(item.expirationDate) < new Date();
        if (isExpired) return 'Expired';
        if (available < 50) return 'Low Stock';
        if (item.quantityReserved > 0 && available > 50) return 'Reserved';
        return 'Good';
    };

    const getStatusBadge = (status: string) => {
        if (status === 'Expired') return <span className="badge badge-red">Expired</span>;
        if (status === 'Low Stock') return <span className="badge badge-red">Low Stock</span>;
        if (status === 'Reserved') return <span className="badge badge-amber">Reserved</span>;
        return <span className="badge badge-green">Good</span>;
    };

    // Name column mapping based on products list
    const getProductName = (sku: string) => products.find(p => p.sku === sku)?.name || '-';

    let columns: Column<InventoryItem>[] = [
        { key: 'id', label: 'SKU', type: 'text', filterable: true, render: (val) => <SkuLink sku={val as string} /> },
        { key: 'warehouseId', label: 'Warehouse', type: 'text', filterable: true },
        { key: 'locationCode', label: 'Location', type: 'text', filterable: true, render: (val) => val ? <code style={{ background: 'var(--color-bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{val}</code> : <span style={{ color: 'var(--color-text-muted)' }}>—</span> },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            filterable: true,
            options: ['Good', 'Low Stock', 'Reserved', 'Expired'],
            render: (_, row) => getStatusBadge(getStatusStr(row))
        },
        {
            key: 'lotNumber',
            label: 'Lot Number',
            type: 'text',
            filterable: true,
            render: (val) => <code style={{ background: 'var(--color-bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{val}</code>
        },
        { key: 'quantityOnHand', label: 'QOH', type: 'number-range', filterable: true, render: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
        {
            key: 'quantityReserved',
            label: 'Reserved',
            type: 'number-range',
            filterable: true,
            render: (val) => <span style={{ color: 'var(--color-status-reserved)' }}>{val}</span>
        },
        {
            key: 'available',
            label: 'Available',
            type: 'number-range',
            filterable: true,
            render: (_, row) => <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{calculateAvailable(row)}</span>
        },
        {
            key: 'expirationDate',
            label: 'Expiration',
            type: 'date-range',
            filterable: true,
            render: (val) => {
                if (!hasExpiration(val as string)) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
                const isExpired = new Date(val as string) < new Date();
                return <span style={{ color: isExpired ? 'var(--color-shc-red)' : 'inherit' }}>{new Date(val as string).toISOString().split('T')[0]}</span>;
            }
        },
        {
            key: 'lastUpdated',
            label: 'Last Updated',
            type: 'date-range',
            filterable: true,
            render: (val, row) => (
                <div>
                    <div style={{ fontSize: '0.875rem' }}>{new Date(val).toLocaleDateString()}</div>
                    {row.updatedBy && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                            {row.updatedBy}
                        </div>
                    )}
                </div>
            )
        },
    ];

    if (isDashboard) {
        columns = [
            { key: 'id', label: 'SKU', type: 'text', filterable: true, render: (val) => <SkuLink sku={val as string} /> },
            { key: 'name', label: 'Product Name', type: 'text', filterable: false, render: (_, row) => <span style={{ fontWeight: 500 }}>{getProductName(row.id)}</span> },
            { key: 'quantityOnHand', label: 'Total On Hand', type: 'number-range', filterable: true, render: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
            { key: 'available', label: 'Total Available', type: 'number-range', filterable: true, render: (_, row) => <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{calculateAvailable(row)}</span> },
            {
                key: 'cogs', label: 'Total COGS', type: 'number-range', filterable: false,
                render: (_, row) => {
                    const product = products.find(p => p.sku === row.id);
                    const cogsValue = (product?.costOfGoods ?? 0) * row.quantityOnHand;
                    return <span title="Cost of Goods Sold: unit cost × quantity on hand">${cogsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
                }
            },
            { key: 'status', label: 'Status', type: 'select', filterable: true, options: ['Good', 'Low Stock', 'Reserved', 'Expired'], render: (_, row) => getStatusBadge(getStatusStr(row)) }
        ];
    } else {
        // Regular columns
        // (already initialized in the columns let variable)
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Inventory Stock</h2>
                {!isDashboard && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-secondary" onClick={() => setActiveModal('transfer')}>
                            <ArrowRightLeft size={16} />
                            Transfer Stock
                        </button>
                        <button className="btn-primary" onClick={() => setActiveModal('receive')}>
                            <Plus size={16} />
                            Receive Stock
                        </button>
                    </div>
                )}
            </div>

            <BulkActionBar
                selectedCount={selectedKeys.size}
                module="inventory"
                onClearSelection={() => setSelectedKeys(new Set())}
            />
            <DataTable
                columns={columns}
                data={displayData}
                onRowClick={(row) => setDetailItem(row)}
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />
            {isDashboard && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Grand Total COGS (Displayed SKUs):</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        ${displayData.reduce((sum, item) => {
                            const product = products.find(p => p.sku === item.id);
                            return sum + (product?.costOfGoods ?? 0) * item.quantityOnHand;
                        }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            )}

            {/* DETAIL SLIDE-OVER */}
            <SlideOverPanel
                isOpen={!!detailItem}
                onClose={() => setDetailItem(null)}
                title="Inventory Detail"
                actions={
                    <>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                                setSelectedItem(detailItem);
                                setActiveModal('adjust');
                                setDetailItem(null);
                            }}
                        >
                            <Edit2 size={14} /> Adjust Qty
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                                setActiveModal('transfer');
                                setDetailItem(null);
                            }}
                        >
                            <ArrowRightLeft size={14} /> Move Stock
                        </button>
                    </>
                }
            >
                {detailItem && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Header Details */}
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                                <SkuLink sku={detailItem.id} onClick={() => setDetailItem(null)} />
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                {getStatusBadge(getStatusStr(detailItem))}
                                <span style={{ color: 'var(--color-text-muted)' }}>|</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>{detailItem.warehouseId}</span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>QOH</p>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{detailItem.quantityOnHand}</p>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Reserved</p>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-status-reserved)' }}>
                                    {detailItem.quantityReserved}
                                </p>
                            </div>
                            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Available</p>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                                    {calculateAvailable(detailItem)}
                                </p>
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Item Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Lot Number</span>
                                <code>{detailItem.lotNumber}</code>

                                <span style={{ color: 'var(--color-text-muted)' }}>Expiration Date</span>
                                <span>{hasExpiration(detailItem.expirationDate) ? new Date(detailItem.expirationDate).toLocaleDateString() : '—'}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Warehouse</span>
                                <span>{detailItem.warehouseId || '—'}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Location</span>
                                <span>{detailItem.locationCode
                                    ? <code style={{ background: 'var(--color-bg-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{detailItem.locationCode}</code>
                                    : '—'}
                                </span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Last Updated</span>
                                <span>{new Date(detailItem.lastUpdated).toLocaleString()} by {detailItem.updatedBy}</span>
                            </div>
                        </div>

                        {/* Extra Actions */}
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '2rem' }}>
                            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowHistory(true)}>
                                <History size={16} /> View History
                            </button>
                            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowExport(true)}>
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            {/* Modals */}
            {activeModal === 'receive' && (
                <ReceiveForm onClose={() => setActiveModal(null)} />
            )}

            {activeModal === 'adjust' && selectedItem && (
                <AdjustForm
                    item={selectedItem}
                    onClose={() => {
                        setActiveModal(null);
                        setSelectedItem(null);
                    }}
                />
            )}

            {activeModal === 'transfer' && (
                <TransferForm onClose={() => setActiveModal(null)} />
            )}

            <MovementHistorySlideOver
                item={detailItem}
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />

            <ExportInventoryModal
                item={detailItem}
                isOpen={showExport}
                onClose={() => setShowExport(false)}
            />
        </>
    );
};

export default InventoryTable;
