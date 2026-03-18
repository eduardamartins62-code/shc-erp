import React, { useState, useEffect } from 'react';
import { Settings, X, Search, GripVertical } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import InventoryTable from './InventoryTable';
import type { InventoryItem } from '../types';

interface DashboardInventoryWidgetProps {
    userId?: string;
}

const DashboardInventoryWidget: React.FC<DashboardInventoryWidgetProps> = ({ userId = 'default_user' }) => {
    const { products } = useProducts();
    const { inventory } = useInventory();

    const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const storageKey = `dashboard_inventory_skus_${userId}`;

    // Load personalization
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setSelectedSkus(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved SKUs", e);
                setupDefaultSkus();
            }
        } else {
            setupDefaultSkus();
        }
    }, [storageKey, inventory]);

    const setupDefaultSkus = () => {
        // Default to up to 10 SKUs with lowest stock
        if (inventory.length === 0) return;

        // Group and sum total available per SKU
        const skuTotals = new Map<string, number>();
        inventory.forEach(item => {
            const available = item.quantityOnHand - item.quantityReserved;
            skuTotals.set(item.id, (skuTotals.get(item.id) || 0) + available);
        });

        const sortedSkus = Array.from(skuTotals.entries())
            .sort((a, b) => a[1] - b[1]) // Lowest first
            .slice(0, 10)
            .map(([sku]) => sku);

        setSelectedSkus(sortedSkus);
    };

    const handleSave = () => {
        localStorage.setItem(storageKey, JSON.stringify(selectedSkus));
        setIsModalOpen(false);
    };

    const handleReset = () => {
        localStorage.removeItem(storageKey);
        setupDefaultSkus();
        setIsModalOpen(false);
    };

    // Drag and Drop ordering handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        const newItems = [...selectedSkus];
        const [movedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(dropIndex, 0, movedItem);
        setSelectedSkus(newItems);
    };

    const toggleSku = (sku: string) => {
        setSelectedSkus(prev => {
            if (prev.includes(sku)) {
                return prev.filter(s => s !== sku);
            }
            if (prev.length >= 10) return prev; // max 10
            return [...prev, sku];
        });
    };

    // Filter and sort inventory items for the table based on selectedSkus
    // For Dashboard, we aggregate by SKU so we don't have multiple rows per SKU if they span locations
    // But InventoryTable already works row-by-row based on `data`. Let's just pass matching items, 
    // or aggregate them if desired. The prompt asks to "display ONLY the user's chosen 10 SKUs in their chosen order"
    // To match order, we must sort the flattened items by the order of `selectedSkus`.

    // Aggregate inventory by SKU and pre-compute sortable fields so DataTable can sort on them.
    // DataTable sorts by row[col.key], so computed columns (available, cogs, name) must be real fields.
    const aggregatedInventory = selectedSkus.reduce((acc: (InventoryItem & { available: number; cogs: number; name: string })[],  sku) => {
        const productInv = inventory.filter(i => i.id === sku);
        if (productInv.length > 0) {
            const product = products.find(p => p.sku === sku);
            const totalQOH = productInv.reduce((sum, item) => sum + item.quantityOnHand, 0);
            const totalRes = productInv.reduce((sum, item) => sum + item.quantityReserved, 0);
            const available = Math.max(0, totalQOH - totalRes);
            const cogs = (product?.costOfGoods ?? 0) * totalQOH;
            acc.push({
                ...productInv[0],
                warehouseId: 'All Warehouses',
                quantityOnHand: totalQOH,
                quantityReserved: totalRes,
                available,
                cogs,
                name: product?.name ?? sku,
            });
        }
        return acc;
    }, []);

    // Also we need to render the Modal for selection
    const allSkus = Array.from(new Set(inventory.map(i => i.id))).sort();
    const filteredSkus = allSkus.filter(sku =>
        sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (products.find(p => p.sku === sku)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                >
                    <Settings size={16} /> Personalize
                </button>
            </div>

            <InventoryTable data={aggregatedInventory} isDashboard={true} />

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Personalize Dashboard</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                            Select up to 10 SKUs to display on your dashboard.
                        </p>

                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search SKUs or Name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border)'
                                }}
                            />
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.5rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                                SELECTED ({selectedSkus.length}/10)
                            </div>

                            {selectedSkus.map((sku, index) => {
                                const prod = products.find(p => p.sku === sku);
                                return (
                                    <div
                                        key={sku}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--color-bg-light)', marginBottom: '0.25rem', borderRadius: '4px', cursor: 'grab' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                                            <GripVertical size={14} style={{ color: 'var(--color-text-muted)' }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sku}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{prod?.name}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleSku(sku)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-shc-red)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}

                            <hr style={{ borderColor: 'var(--color-border)', margin: '1rem 0' }} />

                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                                AVAILABLE SKUS
                            </div>

                            {filteredSkus.filter(s => !selectedSkus.includes(s)).map(sku => {
                                const prod = products.find(p => p.sku === sku);
                                return (
                                    <div key={sku} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sku}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{prod?.name}</span>
                                        </div>
                                        <button
                                            onClick={() => toggleSku(sku)}
                                            disabled={selectedSkus.length >= 10}
                                            style={{
                                                background: 'none',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '4px',
                                                padding: '0.25rem 0.5rem',
                                                cursor: selectedSkus.length >= 10 ? 'not-allowed' : 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                opacity: selectedSkus.length >= 10 ? 0.5 : 1
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                );
                            })}

                            {filteredSkus.length === 0 && (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No SKUs found.
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={handleReset}>
                                Reset to Default
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleSave}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardInventoryWidget;
