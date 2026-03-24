import React, { useState, useMemo } from 'react';
import { useLocations } from '../context/LocationContext';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Plus, Printer, Edit, CheckSquare, AlertTriangle, AlertCircle, Box, MapPin, CheckCircle, Package, X } from 'lucide-react';
import LocationFormModal from '../components/locations/LocationFormModal';
import PrintLabelView from '../components/locations/PrintLabelView';
import type { WarehouseLocation } from '../types';
import type { InventoryItem } from '../types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { SlideOverPanel } from '../components/ui/SlideOverPanel';
import { BulkActionBar } from '../components/ui/BulkActionBar';

const REASON_CODES = [
    { value: 'CYCLE_COUNT', label: 'Cycle Count Variance' },
    { value: 'DAMAGE', label: 'Damaged Goods' },
    { value: 'EXPIRED', label: 'Expired Stock' },
    { value: 'THEFT', label: 'Shrinkage / Theft' },
    { value: 'RECEIVING', label: 'Receiving Correction' },
    { value: 'OTHER', label: 'Other' },
];

const Locations: React.FC = () => {
    const { currentUser } = useAuth();
    const { can, levelFor } = usePermissions(currentUser);
    const { locations, loading, updateLocation } = useLocations();
    const { inventoryLocations, products } = useProducts();
    const { inventory, adjustStock } = useInventory();
    const { selectedWarehouseId } = useSettings();
    const canEdit = can('locations', 'edit');

    const filteredLocations = useMemo(() =>
        selectedWarehouseId
            ? locations.filter(l => l.warehouseId === selectedWarehouseId)
            : locations,
        [locations, selectedWarehouseId]
    );

    // Map: "warehouseId|locationCode" → { totalQOH, skuCount } — uses real Supabase inventory
    const locationStockMap = useMemo(() => {
        const map = new Map<string, { totalQOH: number; skuCount: number }>();
        inventory.forEach(item => {
            if (!item.locationCode || item.quantityOnHand <= 0) return;
            const key = `${item.warehouseId}|${item.locationCode}`;
            const existing = map.get(key) || { totalQOH: 0, skuCount: 0 };
            map.set(key, {
                totalQOH: existing.totalQOH + item.quantityOnHand,
                skuCount: existing.skuCount + 1,
            });
        });
        return map;
    }, [inventory]);

    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [bulkWarning, setBulkWarning] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<WarehouseLocation | null>(null);
    const [detailLocation, setDetailLocation] = useState<WarehouseLocation | null>(null);
    const [locationsToPrint, setLocationsToPrint] = useState<WarehouseLocation[]>([]);

    // Adjust form state
    const [adjustingKey, setAdjustingKey] = useState<string | null>(null);
    const [adjustNewQoh, setAdjustNewQoh] = useState<number>(0);
    const [adjustReason, setAdjustReason] = useState('');
    const [adjusting, setAdjusting] = useState(false);
    const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);
    const [adjustError, setAdjustError] = useState<string | null>(null);

    const handleAddLocation = () => {
        setLocationToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditLocation = (loc: WarehouseLocation) => {
        setLocationToEdit(loc);
        setIsModalOpen(true);
    };

    const handleBulkPrint = () => {
        const toPrint = locations.filter(l => selectedRows.has(l.id));
        setLocationsToPrint(toPrint.length > 0 ? toPrint : locations.filter(l => l.isActive));
    };

    const handleBulkActivate = async () => {
        setBulkWarning('');
        if (selectedRows.size === 0) return;
        await Promise.all(Array.from(selectedRows).map(id => updateLocation(id, { isActive: true })));
        setSelectedRows(new Set());
    };

    const handleBulkDeactivate = async () => {
        setBulkWarning('');
        if (selectedRows.size === 0) return;

        const locsWithStock: string[] = [];
        for (const loc of locations.filter(l => selectedRows.has(l.id))) {
            const hasStock = inventory.some(
                item => item.warehouseId === loc.warehouseId && item.locationCode === loc.locationCode && item.quantityOnHand > 0
            );
            if (hasStock) locsWithStock.push(loc.locationCode);
        }

        if (locsWithStock.length > 0) {
            setBulkWarning(`Cannot deactivate locations with current stock: ${locsWithStock.join(', ')}`);
            return;
        }

        await Promise.all(Array.from(selectedRows).map(id => updateLocation(id, { isActive: false })));
        setSelectedRows(new Set());
    };

    const handlePrintSingle = (loc: WarehouseLocation) => setLocationsToPrint([loc]);

    const toggleLocationStatus = async (loc: WarehouseLocation) => {
        if (loc.isActive) {
            const hasStock = inventory.some(
                item => item.warehouseId === loc.warehouseId && item.locationCode === loc.locationCode && item.quantityOnHand > 0
            );
            if (hasStock) {
                alert(`Cannot deactivate ${loc.locationCode} — it has stock.`);
                return;
            }
            await updateLocation(loc.id, { isActive: false });
        } else {
            await updateLocation(loc.id, { isActive: true });
        }
    };

    // Items in the currently viewed location (real Supabase data)
    const locationItems = useMemo(() => {
        if (!detailLocation) return [];
        return inventory.filter(
            item =>
                item.warehouseId === detailLocation.warehouseId &&
                item.locationCode === detailLocation.locationCode &&
                item.quantityOnHand > 0
        );
    }, [detailLocation, inventory]);

    const openAdjust = (itemKey: string, currentQoh: number) => {
        setAdjustingKey(itemKey);
        setAdjustNewQoh(currentQoh);
        setAdjustReason('');
        setAdjustError(null);
    };

    const cancelAdjust = () => {
        setAdjustingKey(null);
        setAdjustError(null);
    };

    const handleAdjustSubmit = async (item: InventoryItem) => {
        const diff = adjustNewQoh - item.quantityOnHand;
        if (diff === 0) { cancelAdjust(); return; }
        if (!adjustReason) { setAdjustError('Please select a reason code.'); return; }
        setAdjusting(true);
        setAdjustError(null);
        try {
            await adjustStock({
                sku: item.id,
                warehouseId: item.warehouseId,
                locationCode: item.locationCode || '',
                adjustmentType: diff >= 0 ? 'Increase' : 'Decrease',
                quantity: Math.abs(diff),
                lotNumber: item.lotNumber || '',
                expirationDate: item.expirationDate || '',
                reasonCode: adjustReason,
                performedBy: 'System Admin',
            });
            cancelAdjust();
            setAdjustSuccess(item.id);
            setTimeout(() => setAdjustSuccess(null), 2500);
        } catch (err: any) {
            setAdjustError(err.message || 'Adjustment failed.');
        } finally {
            setAdjusting(false);
        }
    };

    const columns: Column<WarehouseLocation>[] = [
        {
            key: 'warehouseCode',
            label: 'Warehouse',
            type: 'select',
            filterable: true,
            options: Array.from(new Set(filteredLocations.map(l => l.warehouseCode || l.warehouseName))).filter(Boolean) as string[],
        },
        {
            key: 'locationCode',
            label: 'Location Code',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-shc-red)' }}>{val}</span>,
        },
        {
            key: 'displayName',
            label: 'Name / Desc',
            type: 'text',
            filterable: true,
            render: (_, loc) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>
                        {loc.displayName !== loc.locationCode ? loc.displayName : (loc.description || '—')}
                    </span>
                    {loc.displayName !== loc.locationCode && loc.description && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{loc.description}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            type: 'select',
            filterable: true,
            options: Array.from(new Set(filteredLocations.map(l => l.type))),
            render: (val) => (
                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                    {val || '—'}
                </span>
            ),
        },
        {
            key: 'position' as any,
            label: 'Position',
            type: 'text',
            render: (_, loc) => {
                const parts: string[] = [];
                if (loc.aisle) parts.push(`A${loc.aisle}`);
                if (loc.section) parts.push(`S${loc.section}`);
                if (loc.shelf) parts.push(`Sh${loc.shelf}`);
                if (loc.bin) parts.push(`B${loc.bin}`);
                return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{parts.length > 0 ? parts.join(' · ') : '—'}</span>;
            },
        },
        {
            key: 'totalStock' as any,
            label: 'Total Stock',
            type: 'text',
            render: (_, loc) => {
                const stock = locationStockMap.get(`${loc.warehouseId}|${loc.locationCode}`);
                if (!stock) {
                    return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Empty</span>;
                }
                return (
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stock.totalQOH.toLocaleString()} units</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{stock.skuCount} SKU{stock.skuCount !== 1 ? 's' : ''}</div>
                    </div>
                );
            },
        },
        {
            key: 'isActive',
            label: 'Status',
            type: 'select',
            filterable: true,
            options: ['Active', 'Inactive'],
            render: (val) => (
                val
                    ? <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Active</span>
                    : <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Inactive</span>
            ),
        },
    ];

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading locations…</div>;
    }

    if (levelFor('locations') === 'none') return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to view Locations. Contact your administrator.</p>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Warehouse Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Locations
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Manage all warehouse locations and barcoded storage positions.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {canEdit && (
                <button
                    onClick={handleAddLocation}
                    style={{
                        padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-shc-red)', color: 'white',
                        border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}
                >
                    <Plus size={18} /> Add Location
                </button>
                )}
                <button
                    onClick={handleBulkPrint}
                    style={{
                        padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-white)', color: 'var(--color-text-dark)',
                        border: '1px solid var(--color-border)', borderRadius: '6px', fontWeight: 500, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}
                >
                    <Printer size={18} /> Print {selectedRows.size > 0 ? `Selected (${selectedRows.size})` : 'All Active'}
                </button>
                {selectedRows.size > 0 && (
                    <>
                        <button
                            onClick={handleBulkActivate}
                            style={{
                                padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-bg-light)', color: '#047857',
                                border: '1px solid var(--color-border)', borderRadius: '6px', fontWeight: 500, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                        >
                            <CheckSquare size={18} /> Activate
                        </button>
                        <button
                            onClick={handleBulkDeactivate}
                            style={{
                                padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-shc-red)',
                                border: '1px solid var(--color-border)', borderRadius: '6px', fontWeight: 500, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}
                        >
                            <AlertCircle size={18} /> Deactivate
                        </button>
                    </>
                )}
            </div>

            {bulkWarning && (
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={18} /> {bulkWarning}
                </div>
            )}

            {/* Main Table */}
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <BulkActionBar
                    selectedCount={selectedRows.size}
                    module="locations"
                    onClearSelection={() => setSelectedRows(new Set())}
                />
                <DataTable
                    data={filteredLocations}
                    columns={columns}
                    selectable
                    rowKey="id"
                    selectedKeys={selectedRows}
                    onSelectionChange={setSelectedRows}
                    onRowClick={(loc) => {
                        setDetailLocation(loc);
                        setAdjustingKey(null);
                        setAdjustSuccess(null);
                        setAdjustError(null);
                    }}
                />
            </div>

            {/* Location Detail SlideOver */}
            <SlideOverPanel
                isOpen={!!detailLocation}
                onClose={() => { setDetailLocation(null); cancelAdjust(); }}
                title="Location Details"
                actions={
                    <>
                        {canEdit && (
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => { if (detailLocation) { handleEditLocation(detailLocation); setDetailLocation(null); } }}
                        >
                            <Edit size={14} /> Edit
                        </button>
                        )}
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => detailLocation && handlePrintSingle(detailLocation)}
                        >
                            <Printer size={14} /> Print Label
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: detailLocation?.isActive ? 'var(--color-shc-red)' : '#047857' }}
                            onClick={() => {
                                if (detailLocation) {
                                    toggleLocationStatus(detailLocation);
                                    setDetailLocation(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
                                }
                            }}
                        >
                            {detailLocation?.isActive ? <AlertCircle size={14} /> : <CheckSquare size={14} />}
                            {detailLocation?.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </>
                }
            >
                {detailLocation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Location Header */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{detailLocation.locationCode}</h3>
                                {detailLocation.isActive
                                    ? <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Active</span>
                                    : <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Inactive</span>
                                }
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} /> {detailLocation.warehouseCode || detailLocation.warehouseName}
                            </p>
                        </div>

                        {/* Type & Name */}
                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Type</p>
                                    <p style={{ margin: 0, fontWeight: 500, textTransform: 'capitalize' }}>{detailLocation.type}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Display Name</p>
                                    <p style={{ margin: 0, fontWeight: 500 }}>{detailLocation.displayName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Position Tracking */}
                        <div>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                Position Tracking
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, backgroundColor: 'var(--color-white)', borderRadius: '6px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                                {[
                                    { label: 'Aisle', value: detailLocation.aisle },
                                    { label: 'Section', value: detailLocation.section },
                                    { label: 'Shelf', value: detailLocation.shelf },
                                    { label: 'Bin', value: detailLocation.bin },
                                ].map((pos, i) => (
                                    <div key={pos.label} style={{ textAlign: 'center', padding: '1rem', ...(i > 0 ? { borderLeft: '1px solid var(--color-border)' } : {}) }}>
                                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{pos.label}</p>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>{pos.value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description / Notes */}
                        {(detailLocation.description || detailLocation.notes) && (
                            <div>
                                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Additional Info</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {detailLocation.description && (
                                        <div>
                                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Description</p>
                                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{detailLocation.description}</p>
                                        </div>
                                    )}
                                    {detailLocation.notes && (
                                        <div>
                                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Notes</p>
                                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{detailLocation.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Inventory Contents ── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Box size={16} /> Inventory Contents
                                </h4>
                                {locationItems.length > 0 && (
                                    <span style={{
                                        fontSize: '0.72rem', color: 'var(--color-text-muted)',
                                        backgroundColor: 'var(--color-bg-light)', padding: '0.2rem 0.6rem', borderRadius: '50px',
                                    }}>
                                        {locationItems.reduce((s, i) => s + i.quantityOnHand, 0).toLocaleString()} units · {locationItems.length} SKU{locationItems.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Adjustment success banner */}
                            {adjustSuccess && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                                    <CheckCircle size={14} /> Adjustment saved for <strong>{adjustSuccess}</strong>
                                </div>
                            )}

                            {locationItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px' }}>
                                    <Package size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35, display: 'block' }} />
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No inventory at this location</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {locationItems.map(item => {
                                        const itemKey = `${item.id}|${item.warehouseId}|${item.lotNumber || ''}`;
                                        const product = products.find(p => p.sku === item.id);
                                        const isAdjusting = adjustingKey === itemKey;
                                        const available = item.quantityOnHand - item.quantityReserved;
                                        const isExpired = item.expirationDate ? new Date(item.expirationDate) < new Date() : false;

                                        return (
                                            <div
                                                key={itemKey}
                                                style={{
                                                    border: `1px solid ${isAdjusting ? 'var(--color-shc-red)' : 'var(--color-border)'}`,
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    transition: 'border-color 0.15s',
                                                }}
                                            >
                                                {/* Item row */}
                                                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-white)' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-shc-red)' }}>{item.id}</span>
                                                            {product && (
                                                                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                                                    {product.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                                            {item.lotNumber && (
                                                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Lot: {item.lotNumber}</span>
                                                            )}
                                                            {item.expirationDate && (
                                                                <span style={{ fontSize: '0.72rem', color: isExpired ? '#b91c1c' : 'var(--color-text-muted)', fontWeight: isExpired ? 600 : 400 }}>
                                                                    {isExpired ? '⚠ Exp: ' : 'Exp: '}{new Date(item.expirationDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Stock numbers */}
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QOH</div>
                                                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{item.quantityOnHand}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Res.</div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: item.quantityReserved > 0 ? '#b45309' : 'var(--color-text-muted)' }}>{item.quantityReserved}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avail.</div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: available > 0 ? '#166534' : '#b91c1c' }}>{available}</div>
                                                        </div>
                                                    </div>

                                                    {/* Adjust toggle button */}
                                                    {isAdjusting ? (
                                                        <button
                                                            onClick={cancelAdjust}
                                                            title="Cancel adjustment"
                                                            style={{ padding: '0.3rem', border: '1px solid var(--color-border)', borderRadius: '5px', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    ) : canEdit ? (
                                                        <button
                                                            onClick={() => openAdjust(itemKey, item.quantityOnHand)}
                                                            style={{ padding: '0.3rem 0.65rem', border: '1px solid var(--color-border)', borderRadius: '5px', background: 'none', cursor: 'pointer', color: 'var(--color-text-dark)', fontSize: '0.75rem', fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap' }}
                                                        >
                                                            Adjust
                                                        </button>
                                                    ) : null}
                                                </div>

                                                {/* Inline Adjust Form */}
                                                {isAdjusting && (
                                                    <div style={{ borderTop: '1px solid var(--color-border)', padding: '0.875rem 1rem', backgroundColor: '#fafafa' }}>
                                                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
                                                            Adjust Stock — current QOH: <strong>{item.quantityOnHand}</strong>
                                                            {item.quantityReserved > 0 && (
                                                                <span style={{ color: '#b45309', fontWeight: 400, marginLeft: '0.5rem' }}>({item.quantityReserved} reserved — cannot go below)</span>
                                                            )}
                                                        </p>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>New QOH *</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    style={{ fontSize: '0.875rem', padding: '0.4rem 0.6rem' }}
                                                                    min={item.quantityReserved}
                                                                    value={adjustNewQoh}
                                                                    onChange={e => setAdjustNewQoh(Math.max(item.quantityReserved, parseInt(e.target.value) || 0))}
                                                                />
                                                                {adjustNewQoh !== item.quantityOnHand && (
                                                                    <span style={{ fontSize: '0.72rem', color: adjustNewQoh > item.quantityOnHand ? '#166534' : '#b91c1c', marginTop: '2px', display: 'block', fontWeight: 600 }}>
                                                                        {adjustNewQoh > item.quantityOnHand ? '▲ +' : '▼ '}{adjustNewQoh - item.quantityOnHand} units
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>Reason *</label>
                                                                <select
                                                                    className="form-control"
                                                                    style={{ fontSize: '0.875rem', padding: '0.4rem 0.6rem' }}
                                                                    value={adjustReason}
                                                                    onChange={e => setAdjustReason(e.target.value)}
                                                                >
                                                                    <option value="">Select reason…</option>
                                                                    {REASON_CODES.map(rc => (
                                                                        <option key={rc.value} value={rc.value}>{rc.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        {adjustError && (
                                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#b91c1c' }}>{adjustError}</p>
                                                        )}
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={cancelAdjust}
                                                                disabled={adjusting}
                                                                style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '5px', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleAdjustSubmit(item)}
                                                                disabled={adjusting || adjustNewQoh === item.quantityOnHand}
                                                                style={{
                                                                    padding: '0.4rem 0.875rem',
                                                                    backgroundColor: adjustNewQoh === item.quantityOnHand ? '#e5e7eb' : 'var(--color-shc-red)',
                                                                    color: adjustNewQoh === item.quantityOnHand ? 'var(--color-text-muted)' : 'white',
                                                                    border: 'none', borderRadius: '5px', cursor: adjustNewQoh === item.quantityOnHand ? 'not-allowed' : 'pointer',
                                                                    fontSize: '0.8rem', fontWeight: 600,
                                                                }}
                                                            >
                                                                {adjusting ? 'Saving…' : 'Confirm Adjustment'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            {/* Modals & Print Overlays */}
            <LocationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                locationToEdit={locationToEdit}
            />
            {locationsToPrint.length > 0 && (
                <PrintLabelView
                    locations={locationsToPrint}
                    onClose={() => setLocationsToPrint([])}
                />
            )}
        </div>
    );
};

export default Locations;
