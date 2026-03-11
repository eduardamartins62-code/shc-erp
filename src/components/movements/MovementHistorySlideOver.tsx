import React, { useState, useMemo } from 'react';
import { SlideOverPanel } from '../ui/SlideOverPanel';
import { DataTable, type Column } from '../ui/DataTable';
import { useInventory } from '../../context/InventoryContext';
import type { InventoryItem, InventoryMovement } from '../../types';
import { Filter, Archive } from 'lucide-react';

interface MovementHistorySlideOverProps {
    item: InventoryItem | null;
    isOpen: boolean;
    onClose: () => void;
}

const MovementHistorySlideOver: React.FC<MovementHistorySlideOverProps> = ({ item, isOpen, onClose }) => {
    const { movements } = useInventory();
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    // Filter movements for this SKU
    const skuMovements = useMemo(() => {
        if (!item) return [];
        let data = movements.filter(m => m.sku === item.id);

        if (dateRange.start) {
            data = data.filter(m => new Date(m.createdAt) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            // Include entire end date
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            data = data.filter(m => new Date(m.createdAt) <= end);
        }
        if (selectedType) {
            data = data.filter(m => m.movementType === selectedType);
        }
        if (selectedLocation) {
            data = data.filter(m => m.locationFromId === selectedLocation || m.locationToId === selectedLocation || m.warehouseFromId === selectedLocation || m.warehouseToId === selectedLocation);
        }

        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [item, movements, dateRange, selectedType, selectedLocation]);

    // Derived states for filters
    const availableTypes = useMemo(() => Array.from(new Set((item ? movements.filter(m => m.sku === item.id) : []).map(m => m.movementType))), [item, movements]);
    const availableLocations = useMemo(() => {
        const itemMovements = item ? movements.filter(m => m.sku === item.id) : [];
        const locs = new Set<string>();
        itemMovements.forEach(m => {
            if (m.locationFromId) locs.add(m.locationFromId);
            else if (m.warehouseFromId) locs.add(m.warehouseFromId);
            if (m.locationToId) locs.add(m.locationToId);
            else if (m.warehouseToId) locs.add(m.warehouseToId);
        });
        return Array.from(locs);
    }, [item, movements]);

    // Summary calculations
    const summary = useMemo(() => {
        return skuMovements.reduce((acc, m) => {
            const qty = Number(m.quantity) || 0;
            const isNegative = qty < 0 || ['CONSUME', 'RETURN_TO_VENDOR'].includes(m.movementType);

            if (isNegative || qty < 0) {
                acc.out += Math.abs(qty);
            } else {
                acc.in += Math.abs(qty);
            }
            return acc;
        }, { in: 0, out: 0 });
    }, [skuMovements]);

    const netChange = summary.in - summary.out;

    const columns: Column<InventoryMovement>[] = [
        {
            key: 'createdAt',
            label: 'Date/Time',
            render: (val) => new Date(val).toLocaleString(),
        },
        {
            key: 'movementType',
            label: 'Type',
            render: (val) => (
                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                    {val}
                </span>
            ),
        },
        {
            key: 'quantity',
            label: 'Qty',
            render: (val, row) => {
                const qty = Number(val);
                const isNegative = qty < 0 || ['CONSUME', 'RETURN_TO_VENDOR'].includes(row.movementType);
                const color = isNegative ? 'var(--color-shc-red)' : 'var(--color-status-good)';
                const sign = isNegative && qty > 0 ? '-' : (qty > 0 && !isNegative ? '+' : '');
                return <span style={{ color, fontWeight: 600 }}>{sign}{qty}</span>;
            },
        },
        {
            key: 'location',
            label: 'Location',
            render: (_, row) => {
                const parts = [];
                if (row.warehouseFromId) parts.push(`From: ${row.warehouseFromId}`);
                if (row.warehouseToId) parts.push(`To: ${row.warehouseToId}`);
                return <span style={{ fontSize: '0.875rem' }}>{parts.join(' | ') || '—'}</span>;
            },
        },
        {
            key: 'lotNumber',
            label: 'Lot #',
            render: (val) => val ? <code>{val}</code> : '—',
        },
        {
            key: 'referenceId',
            label: 'Reference',
            render: (val) => val || '—',
        },
        {
            key: 'createdBy',
            label: 'Performed By',
        }
    ];

    if (!item) return null;

    return (
        <SlideOverPanel
            isOpen={isOpen}
            onClose={onClose}
            title={`Movement History: ${item.id}`}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>

                {/* Filters */}
                <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                        <Filter size={16} /> Filters
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Start Date</label>
                            <input
                                type="date"
                                className="input"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>End Date</label>
                            <input
                                type="date"
                                className="input"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Type</label>
                            <select
                                className="input"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Location</label>
                            <select
                                className="input"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {availableLocations.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Total In</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-status-good)' }}>+{summary.in}</p>
                    </div>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Total Out</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-shc-red)' }}>-{summary.out}</p>
                    </div>
                    <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Net Change</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: netChange > 0 ? 'var(--color-status-good)' : (netChange < 0 ? 'var(--color-shc-red)' : 'inherit') }}>
                            {netChange > 0 ? '+' : ''}{netChange}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Movement Records</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {skuMovements.length > 0 ? (
                            <DataTable columns={columns} data={skuMovements} />
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <Archive size={32} style={{ opacity: 0.5 }} />
                                <p>No movement history found for these filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SlideOverPanel>
    );
};

export default MovementHistorySlideOver;
