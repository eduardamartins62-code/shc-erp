import React, { useState } from 'react';
import { useLocations } from '../context/LocationContext';
import { useProducts } from '../context/ProductContext';
import { Plus, Printer, Edit, CheckSquare, AlertTriangle, AlertCircle, Box, MapPin } from 'lucide-react';
import LocationFormModal from '../components/locations/LocationFormModal';
import PrintLabelView from '../components/locations/PrintLabelView';
import type { WarehouseLocation } from '../types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { SlideOverPanel } from '../components/ui/SlideOverPanel';
import { BulkActionBar } from '../components/ui/BulkActionBar';

const Locations: React.FC = () => {
    const { locations, loading, updateLocation } = useLocations();
    const { inventoryLocations } = useProducts();

    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [bulkWarning, setBulkWarning] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<WarehouseLocation | null>(null);
    const [detailLocation, setDetailLocation] = useState<WarehouseLocation | null>(null);

    const [locationsToPrint, setLocationsToPrint] = useState<WarehouseLocation[]>([]);

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
        if (toPrint.length > 0) {
            setLocationsToPrint(toPrint);
        } else {
            setLocationsToPrint(locations.filter(l => l.isActive));
        }
    };

    const handleBulkActivate = async () => {
        setBulkWarning('');
        if (selectedRows.size === 0) return;
        const promises = Array.from(selectedRows).map(id => updateLocation(id, { isActive: true }));
        await Promise.all(promises);
        setSelectedRows(new Set());
    };

    const handleBulkDeactivate = async () => {
        setBulkWarning('');
        if (selectedRows.size === 0) return;

        const locationsWithStock: string[] = [];
        const locsToDeactivate = locations.filter(l => selectedRows.has(l.id));

        for (const loc of locsToDeactivate) {
            const hasStock = inventoryLocations.some(invLoc =>
                invLoc.warehouseName === (loc.warehouseName || loc.warehouseCode) &&
                invLoc.locationCode === loc.locationCode &&
                invLoc.qtyOnHand > 0
            );
            if (hasStock) {
                locationsWithStock.push(loc.locationCode);
            }
        }

        if (locationsWithStock.length > 0) {
            setBulkWarning(`Cannot deactivate locations with current stock: ${locationsWithStock.join(', ')}`);
            return;
        }

        const promises = Array.from(selectedRows).map(id => updateLocation(id, { isActive: false }));
        await Promise.all(promises);
        setSelectedRows(new Set());
    };

    const handlePrintSingle = (loc: WarehouseLocation) => {
        setLocationsToPrint([loc]);
    };

    const toggleLocationStatus = async (loc: WarehouseLocation) => {
        if (loc.isActive) {
            const hasStock = inventoryLocations.some(invLoc =>
                invLoc.warehouseName === (loc.warehouseName || loc.warehouseCode) &&
                invLoc.locationCode === loc.locationCode &&
                invLoc.qtyOnHand > 0
            );
            if (hasStock) {
                alert(`Cannot deactivate location ${loc.locationCode} because it has stock.`);
                return;
            }
            await updateLocation(loc.id, { isActive: false });
        } else {
            await updateLocation(loc.id, { isActive: true });
        }
    };

    const columns: Column<WarehouseLocation>[] = [
        { key: 'warehouseCode', label: 'Warehouse', type: 'select', filterable: true, options: Array.from(new Set(locations.map(l => l.warehouseCode || l.warehouseName))).filter(Boolean) as string[] },
        {
            key: 'locationCode',
            label: 'Location Code',
            type: 'text',
            filterable: true,
            render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-shc-red)' }}>{val}</span>
        },
        {
            key: 'displayName',
            label: 'Name / Desc',
            type: 'text',
            filterable: true,
            render: (_, loc) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{loc.displayName !== loc.locationCode ? loc.displayName : (loc.description || '—')}</span>
                    {loc.displayName !== loc.locationCode && loc.description && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{loc.description}</span>}
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            type: 'select',
            filterable: true,
            options: Array.from(new Set(locations.map(l => l.type))),
            render: (val) => (
                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                    {val || '—'}
                </span>
            )
        },
        {
            key: 'position',
            label: 'Position (A/Se/Sh/B)',
            type: 'text',
            filterable: true,
            render: (_, loc) => {
                const positionParts = [];
                if (loc.aisle) positionParts.push(`Aisle ${loc.aisle}`);
                if (loc.section) positionParts.push(`Sec ${loc.section}`);
                if (loc.shelf) positionParts.push(`Shelf ${loc.shelf}`);
                if (loc.bin) positionParts.push(`Bin ${loc.bin}`);
                return <span style={{ color: 'var(--color-text-muted)' }}>{positionParts.length > 0 ? positionParts.join(' / ') : '—'}</span>;
            }
        },
        {
            key: 'isActive',
            label: 'Active',
            type: 'select',
            filterable: true,
            options: ['Active', 'Inactive'],
            render: (val) => (
                val ? <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Active</span>
                    : <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Inactive</span>
            )
        }
    ];

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading locations...</div>;
    }

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
                <button
                    onClick={handleAddLocation}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--color-shc-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Plus size={18} />
                    Add Location
                </button>
                <button
                    onClick={handleBulkPrint}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--color-white)',
                        color: 'var(--color-text-dark)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Printer size={18} />
                    Print {selectedRows.size > 0 ? `Selected (${selectedRows.size})` : 'All Active'}
                </button>
                {selectedRows.size > 0 && (
                    <>
                        <button
                            onClick={handleBulkActivate}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'var(--color-bg-light)',
                                color: '#047857',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <CheckSquare size={18} />
                            Activate
                        </button>
                        <button
                            onClick={handleBulkDeactivate}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'var(--color-bg-light)',
                                color: 'var(--color-shc-red)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <AlertCircle size={18} />
                            Deactivate
                        </button>
                    </>
                )}
            </div>

            {bulkWarning && (
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={18} />
                    {bulkWarning}
                </div>
            )}

            {/* Main Content Card */}
            <div style={{ backgroundColor: 'var(--color-white)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <BulkActionBar
                    selectedCount={selectedRows.size}
                    module="locations"
                    onClearSelection={() => setSelectedRows(new Set())}
                />
                <DataTable
                    data={locations}
                    columns={columns}
                    selectable={true}
                    rowKey="id"
                    selectedKeys={selectedRows}
                    onSelectionChange={setSelectedRows}
                />
            </div>

            <SlideOverPanel
                isOpen={!!detailLocation}
                onClose={() => setDetailLocation(null)}
                title="Location Details"
                actions={
                    <>
                        <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                                if (detailLocation) {
                                    handleEditLocation(detailLocation);
                                    setDetailLocation(null);
                                }
                            }}
                        >
                            <Edit size={14} /> Edit
                        </button>
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
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{detailLocation.locationCode}</h3>
                                {detailLocation.isActive ? (
                                    <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Active</span>
                                ) : (
                                    <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500 }}>Inactive</span>
                                )}
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={16} />
                                {detailLocation.warehouseCode || detailLocation.warehouseName}
                            </p>
                        </div>

                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Type</p>
                                    <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem', textTransform: 'capitalize' }}>{detailLocation.type}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Display Name</p>
                                    <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>{detailLocation.displayName}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Position Tracking</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '1rem', backgroundColor: 'var(--color-white)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Aisle</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{detailLocation.aisle || '-'}</p>
                                </div>
                                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Section</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{detailLocation.section || '-'}</p>
                                </div>
                                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Shelf</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{detailLocation.shelf || '-'}</p>
                                </div>
                                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Bin</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>{detailLocation.bin || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {detailLocation.description || detailLocation.notes ? (
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
                        ) : null}

                        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                                <Box size={18} /> View Inventory Contents
                            </button>
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
