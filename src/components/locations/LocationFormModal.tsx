import React, { useState, useEffect } from 'react';
import { useLocations } from '../../context/LocationContext';
import { useSettings } from '../../context/SettingsContext';
import { X } from 'lucide-react';
import Barcode from 'react-barcode';
import type { WarehouseLocation, LocationType } from '../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    locationToEdit?: WarehouseLocation | null;
}

const LocationFormModal: React.FC<Props> = ({ isOpen, onClose, locationToEdit }) => {
    const { addLocation, updateLocation, isLocationCodeUnique, generateLocationCode, loading } = useLocations();
    const { warehouses } = useSettings();

    const [formData, setFormData] = useState({
        warehouseId: '',
        warehouseCode: '',
        locationCode: '',
        displayName: '',
        type: 'SHELF' as LocationType,
        description: '',
        notes: '',
        aisle: '',
        section: '',
        shelf: '',
        bin: '',
        barcodeValue: '',
        isActive: true,
    });

    const [error, setError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [isAutoSyncingBarcode, setIsAutoSyncingBarcode] = useState(true);
    const [isAutoSyncingCode, setIsAutoSyncingCode] = useState(true);

    useEffect(() => {
        if (locationToEdit) {
            setFormData({
                warehouseId: locationToEdit.warehouseId || '',
                warehouseCode: locationToEdit.warehouseCode || '',
                locationCode: locationToEdit.locationCode,
                displayName: locationToEdit.displayName || '',
                type: locationToEdit.type || 'SHELF',
                description: locationToEdit.description || '',
                notes: locationToEdit.notes || '',
                aisle: locationToEdit.aisle || '',
                section: locationToEdit.section || '',
                shelf: locationToEdit.shelf || '',
                bin: locationToEdit.bin || '',
                barcodeValue: locationToEdit.barcodeValue,
                isActive: locationToEdit.isActive,
            });
            setIsAutoSyncingBarcode(locationToEdit.locationCode === locationToEdit.barcodeValue);
            setIsAutoSyncingCode(false); // If editing, don't auto-sync by default unless fields change code
        } else {
            setFormData({
                warehouseId: '',
                warehouseCode: '',
                locationCode: '',
                displayName: '',
                type: 'SHELF',
                description: '',
                notes: '',
                aisle: '',
                section: '',
                shelf: '',
                bin: '',
                barcodeValue: '',
                isActive: true,
            });
            setIsAutoSyncingBarcode(true);
            setIsAutoSyncingCode(true);
        }
        setError('');
        setCodeError('');
    }, [locationToEdit, isOpen]);

    useEffect(() => {
        if (formData.warehouseId && formData.locationCode) {
            const unique = isLocationCodeUnique(formData.warehouseId, formData.locationCode, locationToEdit?.id);
            if (!unique) {
                setCodeError('This Location Code already exists in the selected warehouse.');
            } else {
                setCodeError('');
            }
        } else {
            setCodeError('');
        }
    }, [formData.warehouseId, formData.locationCode, isLocationCodeUnique, locationToEdit]);

    if (!isOpen) return null;

    const updateAutoCode = (newFields: Partial<typeof formData>) => {
        const data = { ...formData, ...newFields };
        if (isAutoSyncingCode && data.warehouseId) {
            const w = warehouses.find(wh => wh.id === data.warehouseId);
            const prefix = w ? (w.warehouseCode.split('-').pop()?.substring(0, 2).toUpperCase() || '') : '';
            const newCode = generateLocationCode(prefix, data.aisle, data.section, data.shelf, data.bin);
            if (newCode && newCode !== prefix) {
                data.locationCode = newCode;
                if (isAutoSyncingBarcode) {
                    data.barcodeValue = newCode;
                }
            }
        }
        setFormData(data);
    };

    const handleLocationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setIsAutoSyncingCode(false);
        setFormData(prev => ({
            ...prev,
            locationCode: val,
            barcodeValue: isAutoSyncingBarcode ? val : prev.barcodeValue
        }));
    };

    const handleBarcodeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, barcodeValue: val }));

        // If they manually change the barcode value and it differs from location code, break the sync
        if (val !== formData.locationCode) {
            setIsAutoSyncingBarcode(false);
        } else {
            setIsAutoSyncingBarcode(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.warehouseId || !formData.locationCode) {
            setError('Warehouse and Location Code are required.');
            return;
        }

        if (codeError) {
            setError('Please resolve validation errors before saving.');
            return;
        }

        try {
            // Find warehouseCode from warehouseId
            const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);
            const dataToSave = {
                ...formData,
                warehouseCode: selectedWarehouse?.warehouseCode || '',
                warehouseName: selectedWarehouse?.warehouseName || '',
                displayName: formData.displayName.trim() === '' ? formData.locationCode : formData.displayName,
            };

            if (locationToEdit) {
                await updateLocation(locationToEdit.id, { ...dataToSave, updatedBy: 'System Admin' });
            } else {
                await addLocation({ ...dataToSave, createdBy: 'System Admin', updatedBy: 'System Admin' });
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save location.');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: '10px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        {locationToEdit ? 'Edit Location' : 'Add Location'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    {error && (
                        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <form id="location-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Warehouse <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                            </label>
                            <select
                                value={formData.warehouseId}
                                onChange={(e) => updateAutoCode({ warehouseId: e.target.value })}
                                required
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                            >
                                <option value="">Select a warehouse...</option>
                                {warehouses.filter(w => w.isActive).map(wh => (
                                    <option key={wh.id} value={wh.id}>{wh.warehouseName} ({wh.warehouseCode})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Location Code <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.locationCode}
                                onChange={handleLocationCodeChange}
                                placeholder="e.g. LA-A1-0203"
                                style={{ padding: '0.75rem', borderRadius: '6px', border: `1px solid ${codeError ? 'var(--color-shc-red)' : 'var(--color-border)'}`, fontSize: '0.875rem' }}
                            />
                            {codeError && (
                                <span style={{ color: 'var(--color-shc-red)', fontSize: '0.75rem' }}>{codeError}</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Barcode Value
                            </label>
                            <input
                                type="text"
                                value={formData.barcodeValue}
                                onChange={handleBarcodeValueChange}
                                placeholder="Defaults to Location Code"
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="Defaults to Location Code"
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', fontSize: '0.875rem' }}
                            >
                                <option value="SHELF">Shelf</option>
                                <option value="BIN">Bin</option>
                                <option value="PALLET">Pallet</option>
                                <option value="FLOOR">Floor</option>
                                <option value="STAGING">Staging</option>
                                <option value="RECEIVING">Receiving</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional details..."
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>
                                Notes
                            </label>
                            <input
                                type="text"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Internal notes..."
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>Aisle</label>
                            <input
                                type="text"
                                value={formData.aisle}
                                onChange={(e) => updateAutoCode({ aisle: e.target.value.toUpperCase() })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', textTransform: 'uppercase' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>Section</label>
                            <input
                                type="text"
                                value={formData.section}
                                onChange={(e) => updateAutoCode({ section: e.target.value.toUpperCase() })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', textTransform: 'uppercase' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>Shelf</label>
                            <input
                                type="text"
                                value={formData.shelf}
                                onChange={(e) => updateAutoCode({ shelf: e.target.value.toUpperCase() })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', textTransform: 'uppercase' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)' }}>Bin</label>
                            <input
                                type="text"
                                value={formData.bin}
                                onChange={(e) => updateAutoCode({ bin: e.target.value.toUpperCase() })}
                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', textTransform: 'uppercase' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' }}>
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-dark)', cursor: 'pointer' }}>
                                Location is Active
                            </label>
                        </div>
                    </form>

                    {/* Barcode Preview */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        backgroundColor: 'var(--color-bg-light)',
                        border: '1px dashed var(--color-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            Barcode Preview
                        </p>
                        {formData.barcodeValue ? (
                            <Barcode value={formData.barcodeValue} height={60} width={2} />
                        ) : (
                            <div style={{ height: '60px', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                Enter a barcode value to preview
                            </div>
                        )}
                    </div>
                </div>

                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-light)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--color-white)',
                            color: 'var(--color-text-dark)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="location-form"
                        disabled={loading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--color-shc-red)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Location'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationFormModal;
