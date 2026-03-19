"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { Product } from '../../types/products';

interface SkuSearchProps {
    products: Product[];
    value: string; // SKU string
    onChange: (sku: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

const SkuSearch: React.FC<SkuSearchProps> = ({
    products,
    value,
    onChange,
    placeholder = 'Search SKU…',
    required,
    disabled,
}) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = products.find(p => p.sku === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query
        ? products.filter(p =>
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.name.toLowerCase().includes(query.toLowerCase())
        )
        : products;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
            {/* Trigger */}
            <div
                onClick={() => { if (!disabled) { setOpen(o => !o); setQuery(''); } }}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem', border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    backgroundColor: disabled ? 'var(--color-bg-light)' : 'var(--color-white)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem', gap: '0.5rem', minHeight: '42px',
                }}
            >
                {selected ? (
                    <span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3b82f6' }}>{selected.sku}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{selected.name}</span>
                    </span>
                ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>{placeholder}</span>
                )}
                <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
            </div>

            {/* Hidden required sentinel */}
            {required && (
                <input
                    tabIndex={-1} required value={value} onChange={() => {}}
                    style={{ opacity: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
                />
            )}

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 600,
                    backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)',
                    borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    marginTop: '2px', overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '0.5rem', borderBottom: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        <input
                            autoFocus type="text" placeholder="Type to filter…"
                            value={query} onChange={e => setQuery(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                No results
                            </div>
                        ) : filtered.map(p => (
                            <div
                                key={p.id}
                                onClick={() => { onChange(p.sku); setOpen(false); setQuery(''); }}
                                style={{
                                    padding: '0.5rem 1rem', cursor: 'pointer',
                                    backgroundColor: p.sku === value ? '#eff6ff' : 'transparent',
                                    borderBottom: '1px solid #f1f5f9',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = p.sku === value ? '#eff6ff' : 'transparent')}
                            >
                                <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.875rem', color: '#3b82f6' }}>{p.sku}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkuSearch;
