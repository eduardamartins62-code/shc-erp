import React, { useState } from 'react';
import type { InventoryItem } from '../../types';

interface ExportInventoryModalProps {
    item?: InventoryItem | null; // If null, maybe export all? We are triggering from a specific product.
    isOpen: boolean;
    onClose: () => void;
}

const ExportInventoryModal: React.FC<ExportInventoryModalProps> = ({ item, isOpen, onClose }) => {
    const [format, setFormat] = useState<'csv' | 'excel'>('csv');
    const [includeStock, setIncludeStock] = useState(true);
    const [includeMovements, setIncludeMovements] = useState(false);
    const [includeLots, setIncludeLots] = useState(true);
    const [includeLocations, setIncludeLocations] = useState(false);
    const [dateRange, setDateRange] = useState('7days');
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const handleExport = () => {
        if (!item) return;
        setIsExporting(true);
        setTimeout(() => {
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `inventory_export_${item.id}_${dateStr}.csv`;

            const available = item.quantityOnHand - item.quantityReserved;
            const isExpired = new Date(item.expirationDate) < new Date();
            const status = isExpired ? 'Expired' : available < 50 ? 'Low Stock' : item.quantityReserved > 0 ? 'Reserved' : 'Good';

            const headers: string[] = ['SKU', 'Warehouse'];
            const values: (string | number)[] = [item.id, item.warehouseId];

            if (includeStock) {
                headers.push('QtyOnHand', 'QtyReserved', 'Available', 'Status');
                values.push(item.quantityOnHand, item.quantityReserved, available, status);
            }
            if (includeLots) {
                headers.push('LotNumber', 'ExpirationDate');
                values.push(item.lotNumber, item.expirationDate ? item.expirationDate.split('T')[0] : '');
            }
            if (includeLocations) {
                headers.push('Location');
                values.push(item.warehouseId);
            }

            headers.push('LastUpdated', 'UpdatedBy');
            values.push(item.lastUpdated ? item.lastUpdated.split('T')[0] : '', item.updatedBy);

            const escape = (v: string | number) => {
                const s = String(v);
                return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
            };
            const content = [headers.join(','), values.map(escape).join(',')].join('\n');

            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setIsExporting(false);
            onClose();
        }, 800);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 30, 30, 0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--color-bg-light)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Export Inventory Data</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {item && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            Exporting data for SKU: <strong>{item.id}</strong>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem' }}>Format</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} />
                                CSV
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="format" value="excel" checked={format === 'excel'} onChange={() => setFormat('excel')} />
                                Excel (.xlsx)
                            </label>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem' }}>Data to Include</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={includeStock} onChange={(e) => setIncludeStock(e.target.checked)} />
                                Current Stock Levels
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={includeLots} onChange={(e) => setIncludeLots(e.target.checked)} />
                                Lot & Expiration Info
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={includeLocations} onChange={(e) => setIncludeLocations(e.target.checked)} />
                                Location Breakdown
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={includeMovements} onChange={(e) => setIncludeMovements(e.target.checked)} />
                                Movement History
                            </label>
                        </div>
                    </div>

                    {includeMovements && (
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-white)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Movement Date Range</label>
                            <select className="input" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                <option value="7days">Last 7 days</option>
                                <option value="30days">Last 30 days</option>
                                <option value="90days">Last 90 days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--color-bg-white)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        Exporting 1 record as CSV
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button className="btn-secondary" onClick={onClose} disabled={isExporting}>Cancel</button>
                        <button className="btn-primary" onClick={handleExport} disabled={isExporting || !item}>
                            {isExporting ? 'Exporting...' : 'Export Data'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportInventoryModal;
