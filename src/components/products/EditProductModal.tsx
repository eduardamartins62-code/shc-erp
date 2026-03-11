"use client";

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Product } from '../../types/products';
import { useProducts } from '../../context/ProductContext';
import { useRouter } from 'next/navigation';

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    isDuplicate?: boolean;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product, isDuplicate = false }) => {
    const { addProduct, updateProduct } = useProducts();
    const navigate = useRouter();

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

    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                sku: isDuplicate ? `${product.sku}-COPY` : product.sku,
                name: isDuplicate ? `${product.name} (Copy)` : product.name,
                brand: product.brand || '',
                category: product.category || '',
                upc: product.upc || '',
                costOfGoods: product.costOfGoods ? product.costOfGoods.toString() : '',
                msrpPrice: product.msrpPrice ? product.msrpPrice.toString() : '',
                status: product.status
            });
        }
    }, [product, isOpen, isDuplicate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submittedData = {
            sku: formData.sku,
            name: formData.name,
            brand: formData.brand,
            category: formData.category,
            upc: formData.upc,
            costOfGoods: formData.costOfGoods ? parseFloat(formData.costOfGoods) : undefined,
            msrpPrice: formData.msrpPrice ? parseFloat(formData.msrpPrice) : undefined,
            status: formData.status
        };

        if (isDuplicate && product) {
            const newProduct = addProduct({
                ...submittedData,
                type: product.type,
                reorderPoint: product.reorderPoint,
                productImageUrl: product.productImageUrl
            });
            // Also need to handle bundle components if it was a bundle, but this is a simplified edit modal for the UI fixes.
            onClose();
            navigate.push(`/products/${newProduct.id}`);
        } else if (product) {
            updateProduct(product.id, submittedData);
            onClose();
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 30, 30, 0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
                        {isDuplicate ? 'Duplicate Product' : 'Edit Product'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <form id="edit-product-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                            <label className="form-label">Product Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">SKU *</label>
                            <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="form-control bg-white">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Discontinued">Discontinued</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="form-control" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="form-control" />
                        </div>
                        {product.type === 'simple' && (
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
                    </form>
                </div>

                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--color-bg-light)' }}>
                    <button className="btn-secondary" onClick={onClose} type="button">Cancel</button>
                    <button type="submit" form="edit-product-form" className="btn-primary">
                        <Save size={16} style={{ marginRight: '0.5rem' }} /> {isDuplicate ? 'Save Clone' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;
