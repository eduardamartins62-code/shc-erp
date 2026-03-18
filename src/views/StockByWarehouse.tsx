import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { useProducts } from '../context/ProductContext';
import InventoryTable from '../components/InventoryTable';
import { MapPin, Search, X, AlertTriangle } from 'lucide-react';

const StockByWarehouse: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { inventory } = useInventory();
    const { warehouses, selectedWarehouseId, setSelectedWarehouseId } = useSettings();
    const { products } = useProducts();

    const [searchQuery, setSearchQuery] = useState('');

    // Read ?filter=lowstock from URL
    const filterParam = searchParams.get('filter');
    const isLowStockFilter = filterParam === 'lowstock';

    // Filter inventory based on selected warehouse + search query + low stock flag
    const filteredInventory = useMemo(() => {
        let items = selectedWarehouseId
            ? inventory.filter(item => item.warehouseId === selectedWarehouseId)
            : inventory;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            items = items.filter(item => {
                const product = products.find(p => p.sku === item.id);
                return (
                    item.id.toLowerCase().includes(q) ||                            // SKU
                    (product?.name?.toLowerCase().includes(q)) ||                   // Description / Name
                    (product?.upc?.toLowerCase().includes(q)) ||                    // UPC
                    item.warehouseId.toLowerCase().includes(q) ||                   // Location / Warehouse ID
                    (item.lotNumber?.toLowerCase().includes(q))                     // Lot Number
                );
            });
        }

        if (isLowStockFilter) {
            items = items.filter(item => {
                const product = products.find(p => p.sku === item.id);
                const threshold = product?.reorderPoint ?? 50;
                const qtyAvailable = Math.max(0, item.quantityOnHand - item.quantityReserved);
                return qtyAvailable < threshold;
            });
        }

        return items;
    }, [inventory, selectedWarehouseId, searchQuery, products, isLowStockFilter]);

    const targetWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

    // Warehouse specific metrics
    const totalItems = filteredInventory.length;
    const totalValue = filteredInventory.reduce((sum, item) => sum + item.quantityOnHand, 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Inventory Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Stock by Warehouse
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Manage and view inventory segregated by physical location.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-white)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                    <MapPin size={20} color="var(--color-shc-red)" />
                    <select
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--color-primary-dark)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer'
                        }}
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    >
                        <option value="">All Warehouses</option>
                        {warehouses.map(wh => (
                            <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                        ))}
                        {warehouses.length === 0 && <option value="">No Warehouses Found</option>}
                    </select>
                </div>
            </div>

            {/* Low Stock Filter Banner */}
            {isLowStockFilter && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', marginBottom: '1rem',
                    backgroundColor: '#fffbeb', border: '1px solid #f59e0b',
                    borderRadius: '8px', fontSize: '0.875rem', color: '#92400e'
                }}>
                    <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>
                        <strong>Low Stock Filter Active</strong> — showing items below their reorder point.
                    </span>
                    <button
                        onClick={() => router.push('/warehouses')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            background: 'none', border: '1px solid #f59e0b', borderRadius: '6px',
                            padding: '0.25rem 0.5rem', cursor: 'pointer',
                            fontSize: '0.75rem', color: '#92400e', fontWeight: 600
                        }}
                    >
                        <X size={12} /> Clear Filter
                    </button>
                </div>
            )}

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <Search
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
                <input
                    type="text"
                    placeholder="Search by SKU, description, UPC, lot number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: searchQuery ? '2.5rem' : '0.75rem',
                        paddingTop: '0.625rem',
                        paddingBottom: '0.625rem',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-white)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-dark)',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 0
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Unique Items at {targetWarehouse?.warehouseName || 'Warehouse'}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{totalItems}</div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Quantity on Hand</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{totalValue.toLocaleString()}</div>
                </div>
            </div>

            <div className="card">
                <InventoryTable data={filteredInventory} />
            </div>
        </div>
    );
};

export default StockByWarehouse;
