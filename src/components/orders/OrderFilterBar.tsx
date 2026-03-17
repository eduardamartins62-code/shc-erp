"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { Order } from '../../types';
import type { OrderTag } from '../../types/tags';
import { ChevronDown, X, Filter } from 'lucide-react';

export interface OrderFilters {
    tagIds: string[];
    channels: string[];
    statuses: string[];
    dateFrom: string;
    dateTo: string;
}

export const EMPTY_FILTERS: OrderFilters = {
    tagIds: [],
    channels: [],
    statuses: [],
    dateFrom: '',
    dateTo: ''
};

interface OrderFilterBarProps {
    orders: Order[];          // full unfiltered list (for deriving options)
    tags: OrderTag[];
    filters: OrderFilters;
    onChange: (filters: OrderFilters) => void;
}

// ── tiny hook: close dropdown when clicking outside ──────────────────────────
function useOutsideClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [ref, onClose]);
}

// ── generic dropdown pill button ─────────────────────────────────────────────
interface DropdownPillProps {
    label: string;
    activeCount?: number;
    children: React.ReactNode;
}

const DropdownPill: React.FC<DropdownPillProps> = ({ label, activeCount, children }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClose(ref, () => setOpen(false));

    const isActive = (activeCount ?? 0) > 0;

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.3rem 0.65rem',
                    border: isActive ? '1.5px solid var(--color-shc-red)' : '1px solid var(--color-border)',
                    borderRadius: '16px',
                    backgroundColor: isActive ? '#fff5f5' : '#fff',
                    color: isActive ? 'var(--color-shc-red)' : 'var(--color-text-main)',
                    fontSize: '0.8rem', fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s'
                }}
            >
                {label}
                {isActive && (
                    <span style={{
                        backgroundColor: 'var(--color-shc-red)', color: '#fff',
                        borderRadius: '9px', padding: '0 5px', fontSize: '0.68rem', fontWeight: 700, lineHeight: '1.4'
                    }}>{activeCount}</span>
                )}
                <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    backgroundColor: '#fff', borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 200, minWidth: '200px', maxHeight: '280px', overflowY: 'auto'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

// ── main component ────────────────────────────────────────────────────────────
const OrderFilterBar: React.FC<OrderFilterBarProps> = ({ orders, tags, filters, onChange }) => {
    const channels = Array.from(new Set(orders.map(o => o.channel).filter(Boolean)));
    const statuses = ['New', 'Allocated', 'Picking', 'Packed', 'Shipped', 'Cancelled'];

    const toggle = <K extends 'tagIds' | 'channels' | 'statuses'>(key: K, value: string) => {
        const arr = filters[key] as string[];
        onChange({
            ...filters,
            [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
        });
    };

    const activeCount = filters.tagIds.length + filters.channels.length + filters.statuses.length
        + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

    const hasAny = activeCount > 0;

    // Active filter chips
    const chips: { label: string; onRemove: () => void }[] = [
        ...filters.tagIds.map(id => {
            const tag = tags.find(t => t.id === id);
            return {
                label: tag ? tag.name : id,
                onRemove: () => toggle('tagIds', id),
                color: tag?.color
            };
        }),
        ...filters.channels.map(ch => ({
            label: ch,
            onRemove: () => toggle('channels', ch)
        })),
        ...filters.statuses.map(st => ({
            label: st,
            onRemove: () => toggle('statuses', st)
        })),
        ...(filters.dateFrom ? [{ label: `From: ${filters.dateFrom}`, onRemove: () => onChange({ ...filters, dateFrom: '' }) }] : []),
        ...(filters.dateTo ? [{ label: `To: ${filters.dateTo}`, onRemove: () => onChange({ ...filters, dateTo: '' }) }] : []),
    ] as { label: string; onRemove: () => void; color?: string }[];

    const checkboxStyle = (active: boolean): React.CSSProperties => ({
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.45rem 0.85rem', cursor: 'pointer',
        backgroundColor: active ? '#fff5f5' : 'transparent',
        fontSize: '0.83rem', color: 'var(--color-text-main)',
        borderBottom: '1px solid #f1f5f9'
    });

    return (
        <div style={{ marginBottom: '1rem' }}>
            {/* Filter pills row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '0.15rem' }}>
                    <Filter size={13} /> Filter By:
                </span>

                {/* Tag filter */}
                <DropdownPill label="Tag" activeCount={filters.tagIds.length}>
                    {tags.length === 0 ? (
                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No tags created yet</div>
                    ) : (
                        tags.map(tag => (
                            <div
                                key={tag.id}
                                style={checkboxStyle(filters.tagIds.includes(tag.id))}
                                onClick={() => toggle('tagIds', tag.id)}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={filters.tagIds.includes(tag.id)}
                                    style={{ accentColor: tag.color, cursor: 'pointer' }}
                                />
                                <span style={{
                                    display: 'inline-block', width: '10px', height: '10px',
                                    borderRadius: '50%', backgroundColor: tag.color, flexShrink: 0
                                }} />
                                {tag.name}
                            </div>
                        ))
                    )}
                </DropdownPill>

                {/* Store / Channel filter */}
                <DropdownPill label="Store" activeCount={filters.channels.length}>
                    {channels.length === 0 ? (
                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No stores found</div>
                    ) : (
                        channels.map(ch => (
                            <div
                                key={ch}
                                style={checkboxStyle(filters.channels.includes(ch))}
                                onClick={() => toggle('channels', ch)}
                            >
                                <input type="checkbox" readOnly checked={filters.channels.includes(ch)} style={{ cursor: 'pointer' }} />
                                {ch}
                            </div>
                        ))
                    )}
                </DropdownPill>

                {/* Status filter */}
                <DropdownPill label="Status" activeCount={filters.statuses.length}>
                    {statuses.map(st => (
                        <div
                            key={st}
                            style={checkboxStyle(filters.statuses.includes(st))}
                            onClick={() => toggle('statuses', st)}
                        >
                            <input type="checkbox" readOnly checked={filters.statuses.includes(st)} style={{ cursor: 'pointer' }} />
                            {st}
                        </div>
                    ))}
                </DropdownPill>

                {/* Order Date */}
                <DropdownPill label="Order Date" activeCount={(filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)}>
                    <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>FROM</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.dateFrom}
                                onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>TO</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.dateTo}
                                onChange={e => onChange({ ...filters, dateTo: e.target.value })}
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>
                </DropdownPill>

                {/* Clear all */}
                {hasAny && (
                    <button
                        onClick={() => onChange(EMPTY_FILTERS)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--color-shc-red)',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.4rem'
                        }}
                    >
                        <X size={12} /> Clear all
                    </button>
                )}
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                    {chips.map((chip, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            backgroundColor: (chip as any).color ? (chip as any).color + '22' : '#f1f5f9',
                            border: `1px solid ${(chip as any).color ? (chip as any).color + '55' : 'var(--color-border)'}`,
                            borderRadius: '12px', padding: '0.15rem 0.5rem 0.15rem 0.6rem',
                            fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-main)'
                        }}>
                            {chip.label}
                            <button
                                onClick={chip.onRemove}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-text-muted)', lineHeight: 1 }}
                            >
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderFilterBar;

// ── helper: apply filters to an orders array ─────────────────────────────────
export function applyOrderFilters(orders: Order[], filters: OrderFilters): Order[] {
    return orders.filter(order => {
        if (filters.tagIds.length > 0) {
            const orderTagIds = (order.tags ?? []).map(t => t.id);
            if (!filters.tagIds.some(id => orderTagIds.includes(id))) return false;
        }
        if (filters.channels.length > 0 && !filters.channels.includes(order.channel)) return false;
        if (filters.statuses.length > 0 && !filters.statuses.includes(order.fulfillmentStatus)) return false;
        if (filters.dateFrom) {
            if (new Date(order.orderDate) < new Date(filters.dateFrom)) return false;
        }
        if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            if (new Date(order.orderDate) > to) return false;
        }
        return true;
    });
}
