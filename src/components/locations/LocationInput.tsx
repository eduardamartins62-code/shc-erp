"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocations } from '../../context/LocationContext';
import { useInventory } from '../../context/InventoryContext';
import { MapPin } from 'lucide-react';

interface Props {
    warehouseId: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    /** Only suggest locations that have stock for this SKU */
    skuFilter?: string;
}

const LocationInput: React.FC<Props> = ({
    warehouseId, value, onChange, disabled, placeholder = 'Type location code…', skuFilter,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { locations } = useLocations();
    const { inventory } = useInventory();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const suggestions = useMemo(() => {
        if (!warehouseId) return [];

        const activeLocs = locations.filter(
            l => l.isActive && l.warehouseId === warehouseId &&
                l.locationCode.toUpperCase() !== 'DEFAULT'
        );

        return activeLocs
            .map(loc => {
                const itemsHere = inventory.filter(
                    i => i.warehouseId === warehouseId &&
                        i.locationCode === loc.locationCode &&
                        (i.quantityOnHand - i.quantityReserved) > 0
                );

                if (skuFilter) {
                    const hasSku = itemsHere.some(i => i.id === skuFilter);
                    if (!hasSku) return null;
                }

                const hasStock = itemsHere.length > 0;
                return { code: loc.locationCode, hasStock, type: loc.type };
            })
            .filter(Boolean)
            .filter(loc =>
                !value || loc!.code.toLowerCase().includes(value.toLowerCase())
            )
            .sort((a, b) => a!.code.localeCompare(b!.code)) as { code: string; hasStock: boolean; type?: string }[];
    }, [warehouseId, value, locations, inventory, skuFilter]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <MapPin
                    size={14}
                    style={{
                        position: 'absolute', left: '0.625rem', top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)', pointerEvents: 'none',
                    }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={e => { onChange(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    disabled={disabled}
                    placeholder={disabled ? 'Select warehouse first' : placeholder}
                    style={{
                        width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem',
                        paddingTop: '0.625rem', paddingBottom: '0.625rem',
                        borderRadius: '6px', border: '1px solid var(--color-border)',
                        fontSize: '0.875rem',
                        backgroundColor: disabled ? 'var(--color-bg-light)' : 'var(--color-white)',
                        outline: 'none', boxSizing: 'border-box',
                        cursor: disabled ? 'not-allowed' : 'text',
                    }}
                />
            </div>

            {open && !disabled && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 600,
                    backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)',
                    borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    marginTop: '2px', maxHeight: '200px', overflowY: 'auto',
                }}>
                    {suggestions.map(loc => (
                        <div
                            key={loc.code}
                            onMouseDown={() => { onChange(loc.code); setOpen(false); }}
                            style={{
                                padding: '0.5rem 0.875rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem',
                                backgroundColor: loc.code === value ? '#eff6ff' : 'transparent',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = loc.code === value ? '#eff6ff' : 'transparent')}
                        >
                            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                                {loc.code}
                            </span>
                            {loc.type && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                    {loc.type}
                                </span>
                            )}
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                                {loc.hasStock ? '📦' : '⭕'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationInput;
