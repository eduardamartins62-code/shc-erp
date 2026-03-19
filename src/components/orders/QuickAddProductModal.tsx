"use client";

import React, { useState } from 'react';
import { X, Package, Layers, Box, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';

type ProductType = 'simple' | 'bundle' | 'alias' | 'supply';

interface QuickAddProductModalProps {
    sku: string;
    onClose: () => void;
    onAdded: () => void; // called after product is created so caller can refresh
}

const TYPE_OPTIONS: { type: ProductType; label: string; sub: string; icon: React.ReactNode }[] = [
    {
        type: 'simple',
        label: 'Sellable SKU',
        sub: 'A standalone SKU with its own inventory (e.g. single item, case, variant).',
        icon: <Box size={20} />
    },
    {
        type: 'bundle',
        label: 'Bundle',
        sub: 'Sold as one unit but made up of multiple individual products. Inventory deducted from components.',
        icon: <Layers size={20} />
    },
    {
        type: 'alias',
        label: 'Alias',
        sub: 'Alternate SKU that maps 1:1 to a sellable SKU. Inventory shared with the parent product.',
        icon: <Package size={20} />
    },
    {
        type: 'supply',
        label: 'Supply Item',
        sub: 'Non-sellable internal supply item (e.g. packaging, labels). Tracked separately.',
        icon: <Package size={20} />
    }
];

const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({ sku, onClose, onAdded }) => {
    const { addProduct } = useProducts();

    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [msrp, setMsrp] = useState('');
    const [cogs, setCogs] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSave = async () => {
        if (!selectedType) { setError('Please select a product type.'); return; }
        if (!name.trim()) { setError('Product name is required.'); return; }
        setError('');
        setSaving(true);
        try {
            const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
                sku: sku.trim(),
                type: selectedType,
                name: name.trim(),
                brand: brand.trim() || undefined,
                msrpPrice: msrp ? parseFloat(msrp) : undefined,
                costOfGoods: cogs ? parseFloat(cogs) : undefined,
                status: 'Active'
            };
            await addProduct(payload);

            // Update all existing order_items with this SKU from Unmapped → Mapped
            await supabase
                .from('order_items')
                .update({ mapping_status: 'Mapped' })
                .eq('sku', sku.trim())
                .eq('mapping_status', 'Unmapped');

            setDone(true);
            setTimeout(() => {
                onAdded();
                onClose();
            }, 900);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create product.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(18, 18, 18, 0.75)',
                zIndex: 1100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'var(--color-primary-dark)',
                    color: 'white',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Add Unregistered SKU</h3>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', opacity: 0.65 }}>
                            SKU: <strong style={{ opacity: 1 }}>{sku}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.25rem' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                {done ? (
                    <div style={{ padding: '2.5rem', textAlign: 'center', color: '#166534' }}>
                        <CheckCircle2 size={40} style={{ marginBottom: '0.75rem' }} />
                        <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>Product created!</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Refreshing order data…</p>
                    </div>
                ) : (
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                        {/* Type selector */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
                                PRODUCT TYPE *
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {TYPE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => setSelectedType(opt.type)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            border: selectedType === opt.type
                                                ? '2px solid var(--color-shc-red)'
                                                : '2px solid var(--color-border)',
                                            borderRadius: '8px',
                                            backgroundColor: selectedType === opt.type ? '#fff5f5' : '#fafafa',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <span style={{
                                            color: selectedType === opt.type ? 'var(--color-shc-red)' : 'var(--color-text-muted)',
                                            flexShrink: 0,
                                            marginTop: '0.1rem'
                                        }}>
                                            {opt.icon}
                                        </span>
                                        <span>
                                            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                                                {opt.label}
                                            </span>
                                            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                                {opt.sub}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                            {/* SKU (read-only) */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>SKU</label>
                                <input
                                    className="form-input"
                                    value={sku}
                                    readOnly
                                    style={{ backgroundColor: '#f1f5f9', color: 'var(--color-text-muted)', cursor: 'not-allowed', width: '100%' }}
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Product Name *</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Whey Protein Chocolate 2lb"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: '100%' }}
                                    autoFocus
                                />
                            </div>

                            {/* Brand + MSRP in a row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Brand</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. SHC"
                                        value={brand}
                                        onChange={e => setBrand(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>MSRP ($)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={msrp}
                                        onChange={e => setMsrp(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {(selectedType === 'simple' || selectedType === 'supply') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cost of Goods ($)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={cogs}
                                        onChange={e => setCogs(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Note for bundle/alias */}
                        {(selectedType === 'bundle' || selectedType === 'alias') && (
                            <div style={{
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                padding: '0.625rem 0.875rem',
                                fontSize: '0.78rem',
                                color: '#0369a1',
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                <span>
                                    You can {selectedType === 'bundle' ? 'add bundle components' : 'set the parent SKU'} after saving by visiting the product detail page.
                                </span>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-shc-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <AlertCircle size={14} /> {error}
                            </p>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                            <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving || !selectedType || !name.trim()}>
                                {saving ? 'Creating…' : 'Create Product'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickAddProductModal;
