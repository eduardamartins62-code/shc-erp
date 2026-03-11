"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types/products';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';

const AddProduct: React.FC = () => {
    const navigate = useRouter();
    const { addProduct, products, addBundleComponent } = useProducts();

    const [type, setType] = useState<'simple' | 'bundle'>('simple');
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        brand: '',
        category: '',
        upc: '',
        costOfGoods: '',
        msrpPrice: '',
        status: 'Active' as Product['status']
    });

    const [components, setComponents] = useState<{ productId: string; qty: number }[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddComponent = () => {
        setComponents(prev => [...prev, { productId: '', qty: 1 }]);
    };

    const handleUpdateComponent = (index: number, field: 'productId' | 'qty', value: string | number) => {
        setComponents(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleRemoveComponent = (index: number) => {
        setComponents(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
            sku: formData.sku,
            name: formData.name,
            type,
            brand: formData.brand,
            category: formData.category,
            upc: formData.upc,
            costOfGoods: formData.costOfGoods ? parseFloat(formData.costOfGoods) : undefined,
            msrpPrice: formData.msrpPrice ? parseFloat(formData.msrpPrice) : undefined,
            status: formData.status
        };

        const createdProduct = addProduct(newProduct);

        if (type === 'bundle' && components.length > 0) {
            components.forEach(comp => {
                if (comp.productId) {
                    addBundleComponent({
                        bundleProductId: createdProduct.id,
                        componentProductId: comp.productId,
                        quantityRequiredPerBundle: comp.qty
                    });
                }
            });
        }

        navigate.push('/products');
    };

    const simpleProducts = products.filter(p => p.type === 'simple');

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* 1) PAGE HEADER */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    type="button"
                    onClick={() => navigate.push('/products')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        color: 'var(--color-text-muted)',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0', color: 'var(--color-primary-dark)' }}>Add New Product</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Create a new SKU or merchandise kit.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* 2) PRODUCT TYPE CARD */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Product Type</h2>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <label style={{
                            flex: 1,
                            border: `1px solid ${type === 'simple' ? 'var(--color-shc-red)' : 'var(--color-border)'}`,
                            borderRadius: '8px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            backgroundColor: type === 'simple' ? 'rgba(193, 39, 45, 0.03)' : 'var(--color-white)',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'flex-start',
                            transition: 'all 0.2s'
                        }}>
                            <input
                                type="radio"
                                name="type"
                                value="simple"
                                checked={type === 'simple'}
                                onChange={() => setType('simple')}
                                style={{ accentColor: 'var(--color-shc-red)', width: '20px', height: '20px', marginTop: '0.1rem' }}
                            />
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>Simple SKU</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Standard inventoriable product</div>
                            </div>
                        </label>
                        <label style={{
                            flex: 1,
                            border: `1px solid ${type === 'bundle' ? 'var(--color-shc-red)' : 'var(--color-border)'}`,
                            borderRadius: '8px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            backgroundColor: type === 'bundle' ? 'rgba(193, 39, 45, 0.03)' : 'var(--color-white)',
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'flex-start',
                            transition: 'all 0.2s'
                        }}>
                            <input
                                type="radio"
                                name="type"
                                value="bundle"
                                checked={type === 'bundle'}
                                onChange={() => setType('bundle')}
                                style={{ accentColor: 'var(--color-shc-red)', width: '20px', height: '20px', marginTop: '0.1rem' }}
                            />
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>Bundle / Kit</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Combination of existing SKUs</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* 3) BASIC INFORMATION CARD */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Basic Information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                </div>

                {/* 4) PRICING & COSTS CARD */}
                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Pricing & Costs</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {type === 'simple' && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Cost of Goods (COGS)</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-white)', overflow: 'hidden' }}>
                                    <span style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)', fontSize: '0.875rem' }}>$</span>
                                    <input type="number" step="0.01" name="costOfGoods" value={formData.costOfGoods} onChange={handleInputChange} style={{ border: 'none', flex: 1, padding: '0.5rem 0.75rem', outline: 'none', width: '100%', fontSize: '0.875rem' }} placeholder="0.00" />
                                </div>
                            </div>
                        )}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">MSRP / Price</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', backgroundColor: 'var(--color-white)', overflow: 'hidden' }}>
                                <span style={{ padding: '0.45rem 0.75rem', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)', fontSize: '0.875rem' }}>$</span>
                                <input type="number" step="0.01" name="msrpPrice" value={formData.msrpPrice} onChange={handleInputChange} style={{ border: 'none', flex: 1, padding: '0.5rem 0.75rem', outline: 'none', width: '100%', fontSize: '0.875rem' }} placeholder="0.00" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5) BUNDLE COMPONENTS CARD */}
                {type === 'bundle' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary-dark)' }}>Bundle Components</h2>
                            <button type="button" onClick={handleAddComponent} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-shc-red)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                                <Plus size={16} /> Add Component
                            </button>
                        </div>

                        {components.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
                                <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>No components added yet. Bundles require at least one simple SKU component.</p>
                                <button type="button" onClick={handleAddComponent} className="btn-secondary">
                                    Add First Component
                                </button>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Component SKU / Name</th>
                                            <th style={{ width: '150px' }}>Quantity Required</th>
                                            <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {components.map((comp, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <select
                                                        required
                                                        value={comp.productId}
                                                        onChange={(e) => handleUpdateComponent(index, 'productId', e.target.value)}
                                                        className="form-control"
                                                        style={{ marginBottom: 0, width: '100%' }}
                                                    >
                                                        <option value="">-- Select Component SKU --</option>
                                                        {simpleProducts.map(p => (
                                                            <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input
                                                        required
                                                        type="number"
                                                        min="1"
                                                        value={comp.qty}
                                                        onChange={(e) => handleUpdateComponent(index, 'qty', parseInt(e.target.value))}
                                                        className="form-control"
                                                        style={{ marginBottom: 0 }}
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

                {/* 6) SAVE / CANCEL ACTION BAR */}
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={() => navigate.push('/products')} className="btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                        <Save size={18} />
                        Save Product
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AddProduct;
