"use client";

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import type { InventoryLocation } from '../types/products';
import { Edit2, MoreHorizontal, Camera, Image as ImageIcon } from 'lucide-react';
import ImageUploadModal from '../components/products/ImageUploadModal';
import EditProductModal from '../components/products/EditProductModal';
import { ProductOverviewTab } from '../components/products/ProductOverviewTab';
import { ProductInventoryTab } from '../components/products/ProductInventoryTab';
import { ProductCOGSTab } from '../components/products/ProductCOGSTab';
import { ProductActivityTab } from '../components/products/ProductActivityTab';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useRouter();
    const searchParams = useSearchParams();

    // Default tab comes from URL or falls back to 'overview'
    const activeTab = searchParams.get('tab') || 'overview';

    const {
        getProduct,
        products,
        getInventoryLocations,
        getBundleComponents,
        calculateSimpleInventory,
        calculateBundleInventory,
        cogsHistory,
        activityLogs,
        logCostChange,
        updateProduct
    } = useProducts();
    const { inventory } = useInventory();
    const { warehouses } = useSettings();

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const product = id ? getProduct(id) : undefined;

    // Synchronize tab changes to URL
    const handleTabChange = (tab: string) => {
        navigate.push(`?tab=${tab}`);
    };

    if (!product) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>Product not found</h2>
                <button
                    onClick={() => navigate.push('/wms/products')}
                    className="btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isBundle = product.type === 'bundle' || product.type === 'alias';
    const components = isBundle ? getBundleComponents(product.id) : [];
    const autoCalculatedBundleInventory = isBundle ? calculateBundleInventory(product.id) : 0;

    // Build real inventory locations from Supabase inventory records for this SKU
    const realInventoryLocations: InventoryLocation[] = isBundle ? [] : inventory
        .filter(i => i.id === product.sku)
        .map(i => {
            const wh = warehouses.find(w => w.id === i.warehouseId);
            const qtyAvailable = Math.max(0, i.quantityOnHand - i.quantityReserved);
            // Only include expiration date if it's a real date (not empty/epoch)
            const hasRealExp = i.expirationDate && new Date(i.expirationDate).getFullYear() > 1970;
            return {
                id: `${i.warehouseId}-${i.locationCode || 'default'}-${i.lotNumber || 'nolot'}`,
                productId: product.id,
                warehouseName: wh ? wh.warehouseName : i.warehouseId,
                locationCode: i.locationCode || '',
                lotNumber: i.lotNumber || undefined,
                expirationDate: hasRealExp ? i.expirationDate : undefined,
                lotReceiveCost: i.lotReceiveCost,
                qtyOnHand: i.quantityOnHand,
                qtyReserved: i.quantityReserved,
                qtyAvailable,
                lastUpdatedAt: i.lastUpdated,
            } as InventoryLocation;
        });

    // Fall back to mock data only if no real records exist
    const locations = isBundle ? [] : (realInventoryLocations.length > 0 ? realInventoryLocations : getInventoryLocations(product.id));

    // Real totals: sum from actual Supabase data when available
    const totalInventoryData = isBundle ? null : (realInventoryLocations.length > 0
        ? realInventoryLocations.reduce(
            (acc, loc) => ({
                qtyOnHand: acc.qtyOnHand + loc.qtyOnHand,
                qtyReserved: acc.qtyReserved + loc.qtyReserved,
                qtyAvailable: acc.qtyAvailable + loc.qtyAvailable,
            }),
            { qtyOnHand: 0, qtyReserved: 0, qtyAvailable: 0 }
        )
        : calculateSimpleInventory(product.id));

    const sortedLocations = [...locations].sort((a, b) => {
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        const compareExp = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        if (compareExp !== 0) return compareExp;
        return a.warehouseName.localeCompare(b.warehouseName);
    });

    const activeLotsCount = new Set(locations.filter(l => l.lotNumber && l.qtyOnHand > 0).map(l => l.lotNumber)).size;
    const activeWarehousesCount = new Set(locations.filter(l => l.qtyOnHand > 0).map(l => l.warehouseName)).size;
    const soonestExpiration = sortedLocations.find(l => l.expirationDate && l.qtyOnHand > 0)?.expirationDate;

    // Filter static/context logs for this product
    const productActivityLogs = activityLogs.filter(log => log.sku === product.sku);

    // Derive activity entries from real Supabase inventory records for this SKU
    // Each inventory row (lot) becomes its own log entry with real date + user
    const inventoryRowLogs = inventory
        .filter(i => i.id === product.sku)
        .map(i => {
            const isImport = (i.updatedBy || '').toLowerCase().includes('import');
            return {
                id: `inv-${i.warehouseId}-${i.lotNumber || 'nolot'}-${i.lastUpdated}`,
                sku: product.sku,
                action: isImport ? 'CSV Import' : 'Stock Added',
                details: [
                    `Warehouse: ${i.warehouseId}`,
                    i.locationCode ? `Location: ${i.locationCode}` : null,
                    `QOH: ${i.quantityOnHand.toLocaleString()}`,
                    i.lotNumber ? `Lot: ${i.lotNumber}` : null,
                ].filter(Boolean).join(' · '),
                user: i.updatedBy || 'System',
                module: 'Inventory',
                timestamp: i.lastUpdated,
            };
        });

    const allActivityLogs = [
        ...productActivityLogs,
        ...inventoryRowLogs,
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const getStatusBadge = (status: string) => {
        // We calculate reorder point logic
        const totalInventory = !isBundle && totalInventoryData ? totalInventoryData.qtyAvailable : autoCalculatedBundleInventory;
        const reorderPoint = product.reorderPoint;

        if (typeof reorderPoint === 'number' && totalInventory <= reorderPoint) {
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

    const handleSaveImage = async (imageUrl: string) => {
        await updateProduct(product.id, { productImageUrl: imageUrl });
    };

    const handleLogCostChange = (newCost: number, notes: string) => {
        logCostChange(product.sku, newCost, notes);
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* 1) PAGE HEADER REDESIGN */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>

                    {/* Image Thumbnail */}
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-bg-light)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                        className="product-image-container"
                        onClick={() => setIsImageModalOpen(true)}
                    >
                        {product.productImageUrl ? (
                            <>
                                <img src={product.productImageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="image-overlay" style={{
                                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', opacity: 0, transition: 'opacity 0.2s',
                                    fontSize: '0.875rem', fontWeight: 500
                                }}>
                                    <Camera size={20} style={{ marginRight: '0.5rem' }} />
                                    Change
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                                <ImageIcon size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Add Photo</span>
                            </div>
                        )}
                        <style>{`
                            .product-image-container:hover .image-overlay { opacity: 1 !important; }
                        `}</style>
                    </div>

                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)' }}>{product.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="badge" style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                                SKU: {product.sku}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)' }}>&middot;</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                {product.brand || 'No Brand'} &middot; {product.category || 'Uncategorized'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    {getStatusBadge(product.status)}

                    {/* LOT TRACKED TOGGLE — simple/supply products only */}
                    {(product.type === 'simple' || product.type === 'supply') && (
                        <label
                            title={product.lotTracked ? 'Lot tracking ON — click to disable' : 'Lot tracking OFF — click to enable'}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
                            onClick={async () => {
                                await updateProduct(product.id, { lotTracked: !product.lotTracked });
                            }}
                        >
                            <div style={{
                                position: 'relative', width: '36px', height: '20px',
                                backgroundColor: product.lotTracked ? 'var(--color-shc-red)' : '#e5e7eb',
                                borderRadius: '999px', transition: 'background-color 0.2s',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    position: 'absolute', top: '2px',
                                    left: product.lotTracked ? '18px' : '2px',
                                    width: '16px', height: '16px',
                                    backgroundColor: 'white', borderRadius: '50%',
                                    transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: product.lotTracked ? 'var(--color-shc-red)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                Lot Tracked
                            </span>
                        </label>
                    )}

                    {/* MORE BUTTON & DROPDOWN */}
                    <div style={{ position: 'relative' }}>
                        <button className="btn-secondary" onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}>
                            <MoreHorizontal size={16} />
                            More
                        </button>

                        {isMoreMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                backgroundColor: 'var(--color-white)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '0.5rem 0'
                            }}>
                                <button
                                    onClick={() => {
                                        setIsMoreMenuOpen(false);
                                        // Navigate to edit page with state to prefill a duplicate
                                        navigate.push('/wms/products/new');
                                    }}
                                    style={{
                                        background: 'none', border: 'none', padding: '0.5rem 1rem',
                                        textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem',
                                        color: 'var(--color-primary-dark)'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Duplicate Product
                                </button>
                                <button
                                    onClick={async () => {
                                        setIsMoreMenuOpen(false);
                                        if (window.confirm(`Are you sure you want to deactivate ${product.sku}?`)) {
                                            await updateProduct(product.id, { status: 'Inactive' });
                                        }
                                    }}
                                    style={{
                                        background: 'none', border: 'none', padding: '0.5rem 1rem',
                                        textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem',
                                        color: 'var(--color-primary-dark)'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Deactivate
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMoreMenuOpen(false);
                                        if (window.confirm("This will permanently remove the product and all inventory records. This cannot be undone.")) {
                                            // Call delete function here (assuming context provides it)
                                            // deleteProduct(product.id);
                                            console.log(`Deleting product ${product.id}`);
                                            navigate.push('/wms/products');
                                        }
                                    }}
                                    style={{
                                        background: 'none', border: 'none', padding: '0.5rem 1rem',
                                        textAlign: 'left', cursor: 'pointer', fontSize: '0.875rem',
                                        color: 'var(--color-shc-red)'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Delete Product
                                </button>
                            </div>
                        )}

                        {/* Overlay to close menu when clicking outside */}
                        {isMoreMenuOpen && (
                            <div
                                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                                onClick={() => setIsMoreMenuOpen(false)}
                            />
                        )}
                    </div>

                    <button className="btn-primary" onClick={() => setIsEditModalOpen(true)}>
                        <Edit2 size={16} />
                        Edit Product
                    </button>
                </div>
            </div>

            {/* 2) TAB NAVIGATION */}
            <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('overview')}
                    style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: activeTab === 'overview' ? 600 : 500, color: activeTab === 'overview' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontSize: '1rem' }}
                >
                    Overview
                </button>
                {!isBundle && (
                    <button
                        className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => handleTabChange('inventory')}
                        style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: activeTab === 'inventory' ? 600 : 500, color: activeTab === 'inventory' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'inventory' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        Inventory
                    </button>
                )}
                {!isBundle && (
                    <button
                        className={`tab-btn ${activeTab === 'cogs-history' ? 'active' : ''}`}
                        onClick={() => handleTabChange('cogs-history')}
                        style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: activeTab === 'cogs-history' ? 600 : 500, color: activeTab === 'cogs-history' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'cogs-history' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        COGS History
                    </button>
                )}
                <button
                    className={`tab-btn ${activeTab === 'activity-log' ? 'active' : ''}`}
                    onClick={() => handleTabChange('activity-log')}
                    style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: activeTab === 'activity-log' ? 600 : 500, color: activeTab === 'activity-log' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'activity-log' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontSize: '1rem' }}
                >
                    Activity Log
                </button>
                {!isBundle && (
                    <button
                        className={`tab-btn ${activeTab === 'relationships' ? 'active' : ''}`}
                        onClick={() => handleTabChange('relationships')}
                        style={{ background: 'none', border: 'none', padding: '0.75rem 0', fontWeight: activeTab === 'relationships' ? 600 : 500, color: activeTab === 'relationships' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'relationships' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        Relationships
                    </button>
                )}
            </div>

            {/* TAB CONTENT PANELS */}
            <div>
                {activeTab === 'overview' && (
                    <ProductOverviewTab
                        product={product}
                        isBundle={isBundle}
                        totalInventoryData={totalInventoryData}
                        activeWarehousesCount={activeWarehousesCount}
                        activeLotsCount={activeLotsCount}
                        soonestExpiration={soonestExpiration}
                        autoCalculatedBundleInventory={autoCalculatedBundleInventory}
                        components={components}
                        calculateSimpleInventory={calculateSimpleInventory}
                        products={products}
                    />
                )}
                {activeTab === 'inventory' && !isBundle && (
                    <ProductInventoryTab
                        product={product}
                        sortedLocations={sortedLocations}
                        movements={[]}
                        navigate={navigate}
                    />
                )}
                {activeTab === 'cogs-history' && !isBundle && (
                    <ProductCOGSTab
                        product={product}
                        cogsHistory={cogsHistory}
                        locations={locations}
                        onLogCostChange={handleLogCostChange}
                    />
                )}
                {activeTab === 'activity-log' && (
                    <ProductActivityTab
                        logs={allActivityLogs}
                    />
                )}
                {activeTab === 'relationships' && !isBundle && (
                    <div>
                        {/* Find all bundles/kits that use this product as a component */}
                        {(() => {
                            const usedInBundles = products.filter(p =>
                                (p.type === 'bundle' || p.type === 'alias') &&
                                getBundleComponents(p.id).some(bc => bc.componentProductId === product.id)
                            );
                            return (
                                <div className="card">
                                    <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>Used In Bundles & Aliases</h2>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
                                        Bundles and aliases that include <strong>{product.name}</strong> as a component.
                                    </p>
                                    {usedInBundles.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                            This product is not used in any bundles or aliases.
                                        </div>
                                    ) : (
                                        <div className="table-container">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>SKU</th>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Qty Required</th>
                                                        <th>Status</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {usedInBundles.map(bundle => {
                                                        const comp = getBundleComponents(bundle.id).find(bc => bc.componentProductId === product.id);
                                                        return (
                                                            <tr key={bundle.id}>
                                                                <td><span style={{ fontFamily: 'monospace', color: '#3b82f6', fontSize: '0.875rem' }}>{bundle.sku}</span></td>
                                                                <td style={{ fontWeight: 500 }}>{bundle.name}</td>
                                                                <td>
                                                                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-bg-light)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                                                        {bundle.type === 'bundle' ? 'Bundle' : 'Alias'}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>{comp?.quantityRequiredPerBundle ?? 1}</td>
                                                                <td>
                                                                    <span className={`badge ${bundle.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{bundle.status}</span>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn-secondary"
                                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                                        onClick={() => navigate.push(`/wms/products/${bundle.id}`)}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* MODALS */}
            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                currentImageUrl={product.productImageUrl}
                onSave={handleSaveImage}
            />
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={product}
            />
        </div>
    );
};

export default ProductDetail;
