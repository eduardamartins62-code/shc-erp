"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { Plus, Download, Edit2, Box, ShoppingCart, Share2, XCircle, Search } from 'lucide-react';
import { DataTable, type Column } from '../components/ui/DataTable';
import { SlideOverPanel } from '../components/ui/SlideOverPanel';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { SkuLink } from '../components/ui/SkuLink';
import type { Product } from '../types';

const typeLabel = (type: string): string => {
    if (type === 'simple') return 'Main';
    if (type === 'bundle') return 'Bundle';
    if (type === 'kit') return 'Kit';
    return type.charAt(0).toUpperCase() + type.slice(1);
};

const ProductCatalog: React.FC = () => {
    const { products, calculateSimpleInventory, calculateBundleInventory, updateProduct } = useProducts();
    const { inventory } = useInventory();
    const { selectedWarehouseId } = useSettings();
    const navigate = useRouter();

    // Real inventory from Supabase, keyed by SKU, filtered by selected warehouse
    const realInventoryBySku = useMemo(() => {
        const filtered = selectedWarehouseId
            ? inventory.filter(i => i.warehouseId === selectedWarehouseId)
            : inventory;
        const map = new Map<string, { qtyOnHand: number; qtyReserved: number; qtyAvailable: number }>();
        filtered.forEach(item => {
            const prev = map.get(item.id) || { qtyOnHand: 0, qtyReserved: 0, qtyAvailable: 0 };
            map.set(item.id, {
                qtyOnHand: prev.qtyOnHand + item.quantityOnHand,
                qtyReserved: prev.qtyReserved + item.quantityReserved,
                qtyAvailable: prev.qtyAvailable + (item.quantityOnHand - item.quantityReserved),
            });
        });
        return map;
    }, [inventory, selectedWarehouseId]);

    const getProductQty = (sku: string, productId: string, type: string): number => {
        if (realInventoryBySku.size > 0) {
            return realInventoryBySku.get(sku)?.qtyAvailable ?? 0;
        }
        // fallback to mock data when no real inventory loaded yet
        return (type === 'simple' || type === 'kit')
            ? calculateSimpleInventory(productId).qtyAvailable
            : calculateBundleInventory(productId);
    };

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'simple' | 'bundle' | 'kit'>('all');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Unique categories for the dropdown
    const categoryOptions = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
        return cats.sort();
    }, [products]);

    const getStatusBadge = (status: string, inventoryData?: { qtyAvailable: number }, reorderPoint?: number) => {
        if (typeof reorderPoint === 'number' && inventoryData && inventoryData.qtyAvailable <= reorderPoint) {
            return (
                <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-status-low)' }}></span>
                    Low Stock
                </span>
            );
        }
        if (status === 'Active') {
            return (
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-status-good)' }}></span>
                    {status}
                </span>
            );
        }
        if (status === 'Inactive') {
            return (
                <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-muted)' }}></span>
                    {status}
                </span>
            );
        }
        return <span className="badge badge-red">{status}</span>;
    };

    const columns: Column<Product>[] = [
        { key: 'sku', label: 'SKU', type: 'text', filterable: false, render: (val) => <SkuLink sku={val as string} /> },
        {
            key: 'name',
            label: 'Name',
            type: 'text',
            filterable: false,
            render: (val) => <span style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{val}</span>
        },
        {
            key: 'type',
            label: 'Type',
            type: 'select',
            filterable: false,
            options: ['simple', 'bundle', 'kit'],
            render: (val) => (
                <span style={{
                    display: 'inline-flex',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: val === 'simple' ? '#eff6ff' : val === 'bundle' ? '#f0fdf4' : '#faf5ff',
                    color: val === 'simple' ? '#1d4ed8' : val === 'bundle' ? '#15803d' : '#7e22ce',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                }}>
                    {typeLabel(val as string)}
                </span>
            )
        },
        { key: 'brand', label: 'Brand', type: 'text', filterable: false, render: (val) => val || '—' },
        { key: 'category', label: 'Category', type: 'text', filterable: false, render: (val) => val || '—' },
        {
            key: '_inventory',
            label: selectedWarehouseId ? 'Warehouse Stock' : 'Total Inventory',
            type: 'number-range',
            filterable: false,
            render: (val: any, row: Product) => {
                const totalInventory = val as number ?? 0;
                const isLowStock = typeof row.reorderPoint === 'number' && totalInventory <= row.reorderPoint;
                return (
                    <span style={{ fontWeight: 600, color: isLowStock ? 'var(--color-status-low)' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {totalInventory.toLocaleString()}
                        {isLowStock && <span style={{ color: 'var(--color-status-low)', fontSize: '0.8rem' }} title="Low Stock">⚠</span>}
                    </span>
                );
            }
        },
        {
            key: 'reorderPoint',
            label: 'Reorder PT',
            type: 'number',
            filterable: false,
            render: (val) => val === undefined || val === null ? '—' : val
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            filterable: false,
            options: ['Active', 'Inactive', 'Discontinued'],
            render: (val, row: Product) => {
                const qty = getProductQty(row.sku, row.id, row.type);
                return getStatusBadge(val as string, { qtyAvailable: qty }, row.reorderPoint);
            }
        }
    ];

    // Counts per type
    const mainCount = products.filter(p => p.type === 'simple').length;
    const bundleCount = products.filter(p => p.type === 'bundle').length;
    const kitCount = products.filter(p => (p.type as string) === 'kit').length;

    // Filtering: search + tab + status + category + in-stock
    const filteredProducts = products.filter(p => {
        // 1. Search across SKU, name, brand
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matches =
                p.sku.toLowerCase().includes(q) ||
                p.name.toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q);
            if (!matches) return false;
        }

        // 2. Tab (type) filter
        if (activeTab !== 'all') {
            if (p.type !== activeTab) return false;
        }

        // 3. Status filter
        if (statusFilter !== 'All') {
            if (statusFilter === 'Low Stock') {
                const total = getProductQty(p.sku, p.id, p.type);
                if (typeof p.reorderPoint !== 'number' || total > p.reorderPoint) return false;
            } else if (p.status.toLowerCase() !== statusFilter.toLowerCase()) {
                return false;
            }
        }

        // 4. Category filter
        if (categoryFilter !== 'All') {
            if ((p.category || '') !== categoryFilter) return false;
        }

        // 5. In-stock only (when a warehouse is selected)
        if (inStockOnly) {
            const qty = getProductQty(p.sku, p.id, p.type);
            if (qty <= 0) return false;
        }

        return true;
    });

    // Enrich filtered products with computed _inventory so DataTable can sort by it
    const tableData = filteredProducts.map(p => ({
        ...p,
        _inventory: getProductQty(p.sku, p.id, p.type),
    }));

    const downloadCSV = (rows: string[][], filename: string) => {
        const content = rows
            .map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const buildProductCSVRows = (prods: Product[]) => {
        const headers = ['SKU', 'Name', 'Type', 'Brand', 'Category', 'UPC', 'Status', 'Cost of Goods', 'MSRP', 'Reorder Point', 'Inventory'];
        const rows = prods.map(p => [
            p.sku,
            p.name,
            p.type,
            p.brand || '',
            p.category || '',
            p.upc || '',
            p.status,
            String(p.costOfGoods ?? ''),
            String(p.msrpPrice ?? ''),
            String(p.reorderPoint ?? ''),
            String(getProductQty(p.sku, p.id, p.type)),
        ]);
        return [headers, ...rows];
    };

    const handleExportAll = () => {
        downloadCSV(buildProductCSVRows(filteredProducts), `products-export-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleBulkAction = async (action: string) => {
        if (action === 'delete') {
            setIsDeleteModalOpen(true);
        } else if (action === 'deactivate') {
            const ids = Array.from(selectedKeys);
            await Promise.all(ids.map(id => updateProduct(id, { status: 'Inactive' })));
            setSelectedKeys(new Set());
        } else if (action === 'export') {
            const selectedProds = tableData.filter(p => selectedKeys.has(p.id));
            downloadCSV(buildProductCSVRows(selectedProds), `products-selected-${new Date().toISOString().split('T')[0]}.csv`);
            setSelectedKeys(new Set());
        }
    };

    // Tab button style
    const tabStyle = (tab: typeof activeTab): React.CSSProperties => ({
        background: 'none',
        border: 'none',
        padding: '0.625rem 1.25rem',
        fontWeight: activeTab === tab ? 700 : 500,
        color: activeTab === tab ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
        borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
    });

    const tabCount = (n: number) => (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '20px', height: '20px', borderRadius: '10px', padding: '0 5px',
            fontSize: '0.7rem', fontWeight: 700,
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-text-muted)'
        }}>{n}</span>
    );

    return (
        <div>
            {/* PAGE HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Product Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Products
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Manage all SKUs, bundles, and kits in the Super Health Center catalog.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    <button className="btn-secondary" onClick={handleExportAll}>
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn-primary" onClick={() => navigate.push('/products/new')}>
                        <Plus size={16} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                marginBottom: '0',
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                padding: '0.875rem 1.25rem',
            }}>
                {/* Search input */}
                <div style={{ flex: 1, position: 'relative', maxWidth: '420px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Search by SKU, name, brand, or category…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            paddingLeft: '2.25rem',
                            paddingRight: '0.75rem',
                            paddingTop: '0.5rem',
                            paddingBottom: '0.5rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            background: 'var(--color-bg-light)',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Status filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>Status:</span>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.45rem 1.75rem 0.45rem 0.6rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            background: 'var(--color-bg-light)',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Discontinued">Discontinued</option>
                        <option value="Low Stock">Low Stock</option>
                    </select>
                </div>

                {/* Category filter */}
                {categoryOptions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>Category:</span>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            style={{
                                padding: '0.45rem 1.75rem 0.45rem 0.6rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                background: 'var(--color-bg-light)',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            <option value="All">All Categories</option>
                            {categoryOptions.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* In-stock only toggle (visible when a warehouse is selected) */}
                {selectedWarehouseId && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={e => setInStockOnly(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        In stock only
                    </label>
                )}

                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* TAB BAR */}
            <div style={{
                display: 'flex',
                gap: 0,
                borderBottom: '1px solid var(--color-border)',
                borderLeft: '1px solid var(--color-border)',
                borderRight: '1px solid var(--color-border)',
                background: 'var(--color-white)',
                borderRadius: '0',
                paddingLeft: '0.5rem',
                overflowX: 'auto',
            }}>
                <button style={tabStyle('all')} onClick={() => setActiveTab('all')}>
                    All Products {tabCount(products.length)}
                </button>
                <button style={tabStyle('simple')} onClick={() => setActiveTab('simple')}>
                    Main SKUs {tabCount(mainCount)}
                </button>
                <button style={tabStyle('bundle')} onClick={() => setActiveTab('bundle')}>
                    Bundles {tabCount(bundleCount)}
                </button>
                <button style={tabStyle('kit')} onClick={() => setActiveTab('kit')}>
                    Kits {tabCount(kitCount)}
                </button>
            </div>

            {/* TABLE */}
            <div className="card" style={{ padding: 0, borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
                <BulkActionBar
                    selectedCount={selectedKeys.size}
                    module="products"
                    onClearSelection={() => setSelectedKeys(new Set())}
                    onAction={handleBulkAction}
                />
                <DataTable
                    columns={columns}
                    data={tableData}
                    onRowClick={(row) => setSelectedProduct(row as unknown as Product)}
                    selectable
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                />
            </div>

            {/* PRODUCT DETAIL SLIDEOVER */}
            <SlideOverPanel
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                title="Product Details"
                actions={
                    <>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => selectedProduct && navigate.push(`/products/${selectedProduct.id}`)}
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                        <button
                            className="btn-primary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => selectedProduct && navigate.push(`/products/${selectedProduct.id}?tab=inventory`)}
                        >
                            <Box size={14} /> Inventory
                        </button>
                    </>
                }
            >
                {selectedProduct && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Header Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '80px', height: '80px',
                                backgroundColor: 'var(--color-border)', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', flexShrink: 0
                            }}>
                                {selectedProduct.productImageUrl ? (
                                    <img src={selectedProduct.productImageUrl} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>No Image</span>
                                )}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedProduct.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600 }}><SkuLink sku={selectedProduct.sku} onClick={() => setSelectedProduct(null)} /></span>
                                    <span style={{
                                        padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                                        backgroundColor: selectedProduct.type === 'simple' ? '#eff6ff' : '#f0fdf4',
                                        color: selectedProduct.type === 'simple' ? '#1d4ed8' : '#15803d'
                                    }}>
                                        {typeLabel(selectedProduct.type)}
                                    </span>
                                    {getStatusBadge(selectedProduct.status)}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div className="card">
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{selectedWarehouseId ? 'Warehouse Stock' : 'Total Inventory'}</p>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                                    {getProductQty(selectedProduct.sku, selectedProduct.id, selectedProduct.type).toLocaleString()}
                                </p>
                            </div>
                            <div className="card">
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Cost of Goods</p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>
                                    {selectedProduct.costOfGoods ? `$${selectedProduct.costOfGoods.toFixed(2)}` : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Specs */}
                        <div>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Specifications</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Brand</span>
                                <span>{selectedProduct.brand || '—'}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Category</span>
                                <span>{selectedProduct.category || '—'}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>UPC</span>
                                <span>{selectedProduct.upc || '—'}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Cost</span>
                                <span>${(selectedProduct.costOfGoods || 0).toFixed(2)}</span>

                                <span style={{ color: 'var(--color-text-muted)' }}>Retail</span>
                                <span>${(selectedProduct.msrpPrice || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        {selectedProduct.description && (
                            <div>
                                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Description</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal)', whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {selectedProduct.description}
                                </p>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '2rem' }}>
                            <button className="btn-secondary" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }} disabled title="Available after channel setup">
                                <ShoppingCart size={16} /> Add to PO
                            </button>
                            <button className="btn-secondary" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }} disabled title="Available after channel setup">
                                <Share2 size={16} /> Import to Channel
                            </button>
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 30, 30, 0.5)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <XCircle size={20} color="var(--color-shc-red)" /> Delete Products
                            </h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            Delete {selectedKeys.size} product{selectedKeys.size !== 1 ? 's' : ''}? This cannot be undone.
                        </div>
                        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--color-bg-light)' }}>
                            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                style={{ backgroundColor: 'var(--color-shc-red)', color: 'white', border: 'none' }}
                                onClick={() => { setSelectedKeys(new Set()); setIsDeleteModalOpen(false); }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
