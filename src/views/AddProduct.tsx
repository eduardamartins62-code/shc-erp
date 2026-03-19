"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types/products';
import { ArrowLeft, Plus, X, Save, Search, ChevronDown } from 'lucide-react';

// ─── Searchable SKU Selector ───────────────────────────────────────────────
interface SkuSearchProps {
    options: Product[];
    value: string; // productId
    onChange: (productId: string) => void;
    placeholder?: string;
    required?: boolean;
}

const SkuSearch: React.FC<SkuSearchProps> = ({ options, value, onChange, placeholder = 'Search SKU…', required }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find(p => p.id === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query
        ? options.filter(p =>
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.name.toLowerCase().includes(query.toLowerCase())
        )
        : options;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
            {/* Trigger */}
            <div
                onClick={() => { setOpen(o => !o); setQuery(''); }}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)',
                    borderRadius: '4px', backgroundColor: 'var(--color-white)',
                    cursor: 'pointer', fontSize: '0.875rem', gap: '0.5rem',
                    minHeight: '38px'
                }}
            >
                {selected ? (
                    <span style={{ fontWeight: 500 }}>
                        <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{selected.sku}</span>
                        {' — '}{selected.name}
                    </span>
                ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>{placeholder}</span>
                )}
                <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
            </div>
            {/* Hidden required sentinel */}
            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value}
                    onChange={() => {}}
                    style={{ opacity: 0, height: 0, position: 'absolute' }}
                />
            )}
            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
                    backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)',
                    borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    marginTop: '2px', overflow: 'hidden'
                }}>
                    {/* Search input */}
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type to filter…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                        />
                    </div>
                    {/* Options list */}
                    <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No results</div>
                        ) : filtered.map(p => (
                            <div
                                key={p.id}
                                onClick={() => { onChange(p.id); setOpen(false); setQuery(''); }}
                                style={{
                                    padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem',
                                    backgroundColor: p.id === value ? 'var(--color-bg-light)' : 'transparent',
                                    display: 'flex', gap: '0.5rem', alignItems: 'center'
                                }}
                                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-light)')}
                                onMouseOut={e => (e.currentTarget.style.backgroundColor = p.id === value ? 'var(--color-bg-light)' : 'transparent')}
                            >
                                <span style={{ fontFamily: 'monospace', color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem' }}>{p.sku}</span>
                                <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                                <span>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────
type ProductType = 'simple' | 'bundle' | 'alias' | 'supply';

const TYPE_CONFIG: Record<ProductType, { label: string; description: string }> = {
    simple:  { label: 'Sellable SKU',    description: 'Standard inventoriable product sold individually' },
    bundle:  { label: 'Bundle',          description: 'Combination of multiple existing SKUs sold together' },
    alias:   { label: 'Alias',           description: 'Alternate SKU that maps to a single sellable SKU' },
    supply:  { label: 'Supply / Other',  description: 'Internal supply or non-sellable item (packaging, labels, etc.)' },
};

const AddProduct: React.FC = () => {
    const navigate = useRouter();
    const { addProduct, products, addBundleComponent } = useProducts();

    const [type, setType] = useState<ProductType>('simple');
    const [lotTracked, setLotTracked] = useState(false);
    const [formData, setFormData] = useState({
        sku: '', name: '', brand: '', category: '', upc: '',
        costOfGoods: '', msrpPrice: '',
        status: 'Active' as Product['status']
    });

    // Bundle components
    const [components, setComponents] = useState<{ productId: string; qty: number }[]>([]);

    // Alias parent SKU
    const [aliasParentId, setAliasParentId] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddComponent = () => setComponents(prev => [...prev, { productId: '', qty: 1 }]);
    const handleUpdateComponent = (index: number, field: 'productId' | 'qty', value: string | number) => {
        setComponents(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });
    };
    const handleRemoveComponent = (index: number) => setComponents(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
            sku: formData.sku,
            name: formData.name,
            type,
            brand: formData.brand || undefined,
            category: formData.category || undefined,
            upc: formData.upc || undefined,
            costOfGoods: formData.costOfGoods ? parseFloat(formData.costOfGoods) : undefined,
            msrpPrice: formData.msrpPrice ? parseFloat(formData.msrpPrice) : undefined,
            status: formData.status,
            lotTracked: (type === 'simple' || type === 'supply') ? lotTracked : false,
        };

        const created = await addProduct(newProduct);

        // Bundle: save all components
        if (type === 'bundle') {
            components.forEach(comp => {
                if (comp.productId) {
                    addBundleComponent({ bundleProductId: created.id, componentProductId: comp.productId, quantityRequiredPerBundle: comp.qty });
                }
            });
        }

        // Alias: save the single parent as a 1:1 component
        if (type === 'alias' && aliasParentId) {
            addBundleComponent({ bundleProductId: created.id, componentProductId: aliasParentId, quantityRequiredPerBundle: 1 });
        }

        navigate.push('/products');
    };

    const sellableProducts = products.filter(p => p.type === 'simple');
    const allInventoriable = products.filter(p => p.type === 'simple' || p.type === 'supply');

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* PAGE HEADER */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    type="button"
                    onClick={() => navigate.push('/products')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', color: 'var(--color-text-muted)', borderRadius: '50%' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0', color: 'var(--color-primary-dark)' }}>Add New Product</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Create a new SKU, bundle, alias, or supply item.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* PRODUCT TYPE */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Product Type</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {(Object.entries(TYPE_CONFIG) as [ProductType, typeof TYPE_CONFIG[ProductType]][]).map(([t, cfg]) => (
                            <label key={t} style={{
                                border: `2px solid ${type === t ? 'var(--color-shc-red)' : 'var(--color-border)'}`,
                                borderRadius: '8px', padding: '1rem', cursor: 'pointer',
                                backgroundColor: type === t ? 'rgba(193,39,45,0.04)' : 'var(--color-white)',
                                display: 'flex', gap: '0.75rem', alignItems: 'flex-start', transition: 'all 0.15s'
                            }}>
                                <input
                                    type="radio" name="type" value={t}
                                    checked={type === t}
                                    onChange={() => { setType(t); setLotTracked(false); }}
                                    style={{ accentColor: 'var(--color-shc-red)', width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>{cfg.label}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{cfg.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* BASIC INFORMATION */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Basic Information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">SKU *</label>
                            <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="form-control" placeholder="e.g. WHEY-001" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Product Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" placeholder="e.g. Premium Whey Protein" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">UPC Barcode</label>
                            <input type="text" name="upc" value={formData.upc} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="form-control bg-white">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Discontinued">Discontinued</option>
                            </select>
                        </div>
                    </div>

                    {/* LOT TRACKING — only for simple / supply */}
                    {(type === 'simple' || type === 'supply') && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', width: 'fit-content' }}>
                                <input
                                    type="checkbox"
                                    checked={lotTracked}
                                    onChange={e => setLotTracked(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-shc-red)', cursor: 'pointer' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>Lot Tracked</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        Requires a lot number and expiration date when receiving inventory
                                    </div>
                                </div>
                            </label>

                            {/* Lot info preview appears when lot tracked is checked */}
                            {lotTracked && (
                                <div style={{
                                    marginTop: '1rem', padding: '1rem', borderRadius: '8px',
                                    backgroundColor: '#fffbeb', border: '1px solid #fcd34d',
                                    display: 'flex', flexDirection: 'column', gap: '0.5rem'
                                }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>⚠</span> Lot tracking enabled
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#78350f' }}>
                                        When receiving this product, a <strong>Lot #</strong> and <strong>Expiration Date</strong> will be required on every receiving entry.
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>LOT # (example)</div>
                                            <div style={{ padding: '0.4rem 0.6rem', border: '1px solid #fcd34d', borderRadius: '4px', backgroundColor: 'white', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>e.g. LOT-2024-001</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>EXP DATE (example)</div>
                                            <div style={{ padding: '0.4rem 0.6rem', border: '1px solid #fcd34d', borderRadius: '4px', backgroundColor: 'white', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>e.g. 2025-12-31</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PRICING & COSTS */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Pricing & Costs</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {(type === 'simple' || type === 'supply') && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Cost of Goods (COGS)</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-white)', overflow: 'hidden' }}>
                                    <span style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)', fontSize: '0.875rem' }}>$</span>
                                    <input type="number" step="0.01" name="costOfGoods" value={formData.costOfGoods} onChange={handleInputChange} style={{ border: 'none', flex: 1, padding: '0.5rem 0.75rem', outline: 'none', width: '100%', fontSize: '0.875rem' }} placeholder="0.00" />
                                </div>
                            </div>
                        )}
                        {type !== 'supply' && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">MSRP / Price</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-white)', overflow: 'hidden' }}>
                                    <span style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)', fontSize: '0.875rem' }}>$</span>
                                    <input type="number" step="0.01" name="msrpPrice" value={formData.msrpPrice} onChange={handleInputChange} style={{ border: 'none', flex: 1, padding: '0.5rem 0.75rem', outline: 'none', width: '100%', fontSize: '0.875rem' }} placeholder="0.00" />
                                </div>
                            </div>
                        )}
                        {type === 'supply' && !formData.costOfGoods && (
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', paddingTop: '1.5rem' }}>
                                Supply items track cost only — no retail price needed.
                            </div>
                        )}
                    </div>
                </div>

                {/* ALIAS PARENT SKU */}
                {type === 'alias' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)' }}>Parent Sellable SKU</h2>
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            Select the sellable SKU this alias maps to. Orders for the alias SKU will resolve inventory from the parent.
                        </p>
                        <SkuSearch
                            options={sellableProducts}
                            value={aliasParentId}
                            onChange={setAliasParentId}
                            placeholder="Search and select parent SKU…"
                            required
                        />
                    </div>
                )}

                {/* BUNDLE COMPONENTS */}
                {type === 'bundle' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', color: 'var(--color-primary-dark)' }}>Bundle Components</h2>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Define which SKUs are included in this bundle and how many of each.</p>
                            </div>
                            <button type="button" onClick={handleAddComponent} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-shc-red)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                                <Plus size={16} /> Add Component
                            </button>
                        </div>

                        {components.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
                                <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>No components added. Bundles require at least one component SKU.</p>
                                <button type="button" onClick={handleAddComponent} className="btn-secondary">Add First Component</button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Component SKU / Name</th>
                                            <th style={{ width: '140px' }}>Quantity</th>
                                            <th style={{ width: '60px', textAlign: 'center' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {components.map((comp, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <SkuSearch
                                                        options={allInventoriable}
                                                        value={comp.productId}
                                                        onChange={(id) => handleUpdateComponent(index, 'productId', id)}
                                                        placeholder="Search component SKU…"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        required type="number" min="1" value={comp.qty}
                                                        onChange={e => handleUpdateComponent(index, 'qty', parseInt(e.target.value))}
                                                        className="form-control" style={{ marginBottom: 0 }}
                                                    />
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button type="button" onClick={() => handleRemoveComponent(index)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                                        <X size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* SAVE / CANCEL */}
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={() => navigate.push('/products')} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">
                        <Save size={18} /> Save Product
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddProduct;
