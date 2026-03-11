"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { useInventory } from '../context/InventoryContext';
import { Search, AlertTriangle } from 'lucide-react';

const ExpirationDashboard: React.FC = () => {
    const navigate = useRouter();
    const { products, inventoryLocations } = useProducts();
    const { systemSettings } = useSettings();
    const { movements } = useInventory();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [expirationWindow, setExpirationWindow] = useState('All');
    const [showLowStockAndExpiring, setShowLowStockAndExpiring] = useState(false);

    const lowStockThreshold = systemSettings?.lowStockThresholdDefault || 10;

    const enrichedLocations = useMemo(() => {
        return inventoryLocations.map(loc => {
            const product = products.find(p => p.id === loc.productId);
            return {
                ...loc,
                product
            };
        }).filter(item => item.product && item.expirationDate && item.qtyOnHand > 0);
    }, [inventoryLocations, products]);

    const baseFilteredLocations = useMemo(() => {
        return enrichedLocations.filter(loc => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const skuMatch = loc.product?.sku.toLowerCase().includes(query);
                const nameMatch = loc.product?.name.toLowerCase().includes(query);
                if (!skuMatch && !nameMatch) return false;
            }
            if (selectedWarehouse && loc.warehouseName !== selectedWarehouse) return false;
            if (selectedBrand && loc.product?.brand !== selectedBrand) return false;
            if (selectedCategory && loc.product?.category !== selectedCategory) return false;
            return true;
        });
    }, [enrichedLocations, searchQuery, selectedWarehouse, selectedBrand, selectedCategory]);

    const {
        expiredLots,
        expiring30DaysLots,
        expiring60DaysLots,
        qtyExpired,
        qty30Days
    } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDays = new Date(today);
        thirtyDays.setDate(today.getDate() + 30);

        const sixtyDays = new Date(today);
        sixtyDays.setDate(today.getDate() + 60);

        let expired = 0;
        let exp30 = 0;
        let exp60 = 0;
        let totalExpired = 0;
        let total30 = 0;

        baseFilteredLocations.forEach(loc => {
            if (!loc.expirationDate) return;
            const exp = new Date(loc.expirationDate);
            exp.setHours(0, 0, 0, 0);

            if (exp < today) {
                expired++;
                totalExpired += loc.qtyOnHand;
            } else if (exp <= thirtyDays) {
                exp30++;
                total30 += loc.qtyOnHand;
            }
            if (exp >= today && exp <= sixtyDays) {
                exp60++;
            }
        });

        return { expiredLots: expired, expiring30DaysLots: exp30, expiring60DaysLots: exp60, qtyExpired: totalExpired, qty30Days: total30 };
    }, [baseFilteredLocations]);

    const filteredData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return baseFilteredLocations.filter(loc => {
            if (loc.expirationDate) {
                const exp = new Date(loc.expirationDate);
                exp.setHours(0, 0, 0, 0);
                const diffTime = exp.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (expirationWindow === 'Expired' && diffDays >= 0) return false;
                if (expirationWindow === '0-30' && (diffDays < 0 || diffDays > 30)) return false;
                if (expirationWindow === '31-60' && (diffDays <= 30 || diffDays > 60)) return false;
                if (expirationWindow === '61-90' && (diffDays <= 60 || diffDays > 90)) return false;

                if (showLowStockAndExpiring) {
                    if (loc.qtyOnHand > lowStockThreshold || diffDays > 60) {
                        return false;
                    }
                }
            }

            return true;
        }).sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime());
    }, [baseFilteredLocations, expirationWindow, showLowStockAndExpiring, lowStockThreshold]);

    const warehouses = useMemo(() => Array.from(new Set(enrichedLocations.map(l => l.warehouseName))).sort(), [enrichedLocations]);
    const brands = useMemo(() => Array.from(new Set(enrichedLocations.map(l => l.product?.brand).filter(Boolean))) as string[], [enrichedLocations]);
    const categories = useMemo(() => Array.from(new Set(enrichedLocations.map(l => l.product?.category).filter(Boolean))) as string[], [enrichedLocations]);

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Inventory Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Expiration Dashboard
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>Monitor lots that are expired or approaching expiration.</p>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--color-shc-red)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Expired Lots</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-shc-red)' }}>{expiredLots}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--color-status-reserved)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Expiring in 30 Days</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-status-reserved)' }}>{expiring30DaysLots}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--color-status-pending)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Expiring in 60 Days</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-status-pending)' }}>{expiring60DaysLots}</div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Expired Qty (On Hand)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{qtyExpired.toLocaleString()}</div>
                </div>
                <div className="card">
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>30-Day Window Qty</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{qty30Days.toLocaleString()}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Search Product</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search SKU or Name..."
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Warehouse</label>
                        <select className="input-field" value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)} style={{ width: '100%' }}>
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Brand</label>
                        <select className="input-field" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={{ width: '100%' }}>
                            <option value="">All Brands</option>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Category</label>
                        <select className="input-field" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ width: '100%' }}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Expiration</label>
                        <select className="input-field" value={expirationWindow} onChange={e => setExpirationWindow(e.target.value)} style={{ width: '100%' }}>
                            <option value="All">All</option>
                            <option value="Expired">Expired</option>
                            <option value="0-30">0–30 days</option>
                            <option value="31-60">31–60 days</option>
                            <option value="61-90">61–90 days</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input
                            type="checkbox"
                            checked={showLowStockAndExpiring}
                            onChange={e => setShowLowStockAndExpiring(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>Show only low-stock & expiring items</span>
                        <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>(Low stock &lt;= {lowStockThreshold}, Expiring &lt;= 60 days)</span>
                    </label>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Expiring Lots Breakdown</h2>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Showing {filteredData.length} records</div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Warehouse</th>
                                <th>Location</th>
                                <th>Lot Number</th>
                                <th>Expiration</th>
                                <th>Days</th>
                                <th style={{ textAlign: 'right' }}>QOH</th>
                                <th style={{ textAlign: 'right' }}>Reserved</th>
                                <th style={{ textAlign: 'right' }}>Avail</th>
                                <th>Last Movement</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(loc => {
                                const exp = new Date(loc.expirationDate!);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                exp.setHours(0, 0, 0, 0);
                                const diffTime = exp.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                let rowStyle = {};
                                let badge = null;
                                if (diffDays < 0) {
                                    rowStyle = { backgroundColor: 'rgba(193, 39, 45, 0.05)' };
                                    badge = <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>Expired</span>;
                                } else if (diffDays <= 30) {
                                    rowStyle = { backgroundColor: 'rgba(230, 92, 0, 0.05)' };
                                    badge = <span className="badge badge-amber" style={{ marginLeft: '0.5rem' }}>Soon</span>;
                                }

                                return (
                                    <tr key={loc.id} style={rowStyle}>
                                        <td style={{ fontWeight: 600 }}>{loc.product?.sku}</td>
                                        <td style={{ color: 'var(--color-primary-dark)' }}>{loc.product?.name}</td>
                                        <td>{loc.warehouseName}</td>
                                        <td>{loc.locationCode || '—'}</td>
                                        <td><code style={{ background: 'var(--color-bg-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{loc.lotNumber}</code></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {exp.toISOString().split('T')[0]}
                                                {badge}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600, color: diffDays < 0 ? 'var(--color-shc-red)' : diffDays <= 30 ? 'var(--color-status-reserved)' : 'inherit' }}>
                                            {diffDays}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 500 }}>{loc.qtyOnHand.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--color-status-reserved)' }}>{loc.qtyReserved.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-status-active)' }}>{loc.qtyAvailable.toLocaleString()}</td>
                                        <td>
                                            {(() => {
                                                const locMovements = movements.filter(m =>
                                                    m.productId === loc.productId &&
                                                    ((m.warehouseToId === loc.warehouseName && m.locationToId === loc.locationCode) ||
                                                        (m.warehouseFromId === loc.warehouseName && m.locationFromId === loc.locationCode)) &&
                                                    m.lotNumber === loc.lotNumber
                                                );
                                                const lastMovement = locMovements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                                                return lastMovement ? (
                                                    <div>
                                                        <div style={{ fontSize: '0.875rem' }}>{new Date(lastMovement.createdAt).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{lastMovement.movementType}</div>
                                                    </div>
                                                ) : '—';
                                            })()}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => navigate.push('/movements')}
                                                >
                                                    Adjust
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => navigate.push('/movements')}
                                                >
                                                    Transfer
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => navigate.push(`/products/${loc.product?.id}`)}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={12} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                        No expiring inventory found matching the filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpirationDashboard;
