import React from 'react';
import type { Product, BundleComponent } from '../../types/products';

interface ProductOverviewTabProps {
    product: Product;
    isBundle: boolean;
    totalInventoryData: { qtyOnHand: number; qtyReserved: number; qtyAvailable: number } | null;
    activeWarehousesCount: number;
    activeLotsCount: number;
    soonestExpiration?: string;
    autoCalculatedBundleInventory: number;
    components: BundleComponent[];
    calculateSimpleInventory: (productId: string) => { qtyOnHand: number; qtyReserved: number; qtyAvailable: number };
    products: Product[]; // needed for bundle component names
}

export const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({
    product,
    isBundle,
    totalInventoryData,
    activeWarehousesCount,
    activeLotsCount,
    soonestExpiration,
    autoCalculatedBundleInventory,
    components,
    calculateSimpleInventory,
    products
}) => {
    // Inventory Summary logic
    const totalCogsValue = !isBundle && product.costOfGoods && totalInventoryData
        ? product.costOfGoods * totalInventoryData.qtyOnHand
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* INVENTORY SUMMARY & PRODUCT DETAILS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 1.5fr)', gap: '1.5rem', alignItems: 'start' }}>

                {/* LEFT: PRODUCT DETAILS */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: 0 }}>Product Details</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Product Name</div>
                            <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{product.name}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>SKU</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{product.sku}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>UPC / Barcode</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{product.upc || '—'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Brand</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{product.brand || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Category</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{product.category || '—'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Type</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)', textTransform: 'capitalize' }}>{product.type}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Reorder Point</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-status-good)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {product.reorderPoint || '—'}
                                    {product.reorderPoint && totalInventoryData && totalInventoryData.qtyOnHand <= product.reorderPoint && (
                                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Low Stock</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Weight & Dimensions</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>
                                    {product.weight ? `${product.weight} lbs` : '—'}
                                    {product.length && product.width && product.height ? ` · ${product.length}×${product.width}×${product.height}"` : ''}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Preferred Supplier</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{product.preferredSupplier || '—'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Cost (COGS)</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>
                                    {product.costOfGoods ? `$${product.costOfGoods.toFixed(2)}` : '—'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>MAP / MSRP</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>
                                    {product.msrpPrice ? `$${product.msrpPrice.toFixed(2)}` : '—'}
                                </div>
                            </div>
                        </div>

                        {product.description && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Description</div>
                                <div style={{ color: 'var(--color-primary-dark)', fontSize: '0.9rem', lineHeight: '1.5' }}>{product.description}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: INVENTORY SUMMARY */}
                {isBundle ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: 0 }}>Bundle Summary</h2>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Max Buildable Quantity</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                                        {autoCalculatedBundleInventory.toLocaleString()}
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>Based on lowest available component stock</p>
                                </div>
                            </div>
                        </div>

                        {/* BUNDLE COMPONENTS */}
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Bundle Components</h2>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Component SKU</th>
                                            <th style={{ textAlign: 'right' }}>Qty Required</th>
                                            <th style={{ textAlign: 'right' }}>Avail Units</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {components.map((comp) => {
                                            const childProduct = products.find(p => p.id === comp.componentProductId);
                                            const childInv = calculateSimpleInventory(comp.componentProductId);
                                            return (
                                                <tr key={comp.id}>
                                                    <td style={{ fontWeight: 500 }}>{childProduct?.sku || 'N/A'}</td>
                                                    <td style={{ textAlign: 'right' }}>{comp.quantityRequiredPerBundle}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                                                        {childInv.qtyAvailable.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {components.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                                    No components configured.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Inventory Summary</h2>
                            {activeLotsCount > 0 ? (
                                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-status-good)', boxShadow: '0 0 0 2px rgba(10, 191, 83, 0.2)' }}></span>
                                    FEFO Active
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    No Lots Assigned
                                    <a href="/movements" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>+ Assign Lot</a>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total On Hand</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                                    {totalInventoryData?.qtyOnHand.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total COGS Value</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                                    ${totalCogsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Reserved</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-status-reserved)' }}>
                                    {totalInventoryData?.qtyReserved.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Available</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-status-good)' }}>
                                    {totalInventoryData?.qtyAvailable.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warehouses</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginTop: '0.25rem' }}>
                                    {activeWarehousesCount}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Lots</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginTop: '0.25rem' }}>
                                    {activeLotsCount}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soonest Exp</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', color: soonestExpiration && new Date(soonestExpiration) < new Date() ? 'var(--color-shc-red)' : 'var(--color-primary-dark)' }}>
                                    {soonestExpiration ? new Date(soonestExpiration).toLocaleDateString() : '—'}
                                </div>
                            </div>
                        </div>

                        {/* Sparkline Visual (Mock) */}
                        {product.reorderPoint !== undefined && totalInventoryData && (
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    <span>Stock Level</span>
                                    <span>Reorder Point: {product.reorderPoint}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-bg-light)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0,
                                        width: `${Math.min(100, (totalInventoryData.qtyOnHand / (product.reorderPoint * 3)) * 100)}%`,
                                        backgroundColor: totalInventoryData.qtyOnHand <= product.reorderPoint ? 'var(--color-status-low)' : 'var(--color-status-good)'
                                    }} />
                                    <div style={{
                                        position: 'absolute', left: `${Math.min(100, (product.reorderPoint / (product.reorderPoint * 3)) * 100)}%`,
                                        top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--color-shc-red)'
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
