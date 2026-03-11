import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useSettings } from '../context/SettingsContext';
import { X, CheckCircle } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const TransferForm: React.FC<Props> = ({ onClose }) => {
    const { transferStock, loading, error, inventory } = useInventory();
    const { locations } = useLocations();
    const { warehouses } = useSettings();

    // Get unique SKUs available for transfer
    const uniqueSkus = Array.from(new Set(inventory.filter(i => (i.quantityOnHand - i.quantityReserved) > 0).map(i => i.id)));

    const [formData, setFormData] = useState({
        sku: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        fromLocationCode: '',
        toLocationCode: '',
        quantity: 1,
        reason: '',
    });

    const [success, setSuccess] = useState(false);

    // Available from warehouses for selected SKU
    const availableFromWarehouses = Array.from(
        new Set(
            inventory
                .filter(i => i.id === formData.sku && (i.quantityOnHand - i.quantityReserved) > 0)
                .map(i => i.warehouseId)
        )
    );

    // Max available in selected warehouse
    const maxAvailable = inventory
        .filter(i => i.id === formData.sku && i.warehouseId === formData.fromWarehouseId)
        .reduce((sum, item) => sum + (item.quantityOnHand - item.quantityReserved), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reason.trim()) {
            alert("Notes are required for all transfers.");
            return;
        }
        if (formData.fromWarehouseId === formData.toWarehouseId && formData.fromLocationCode === formData.toLocationCode) {
            alert("Source and destination must be different. Choose a different warehouse or location.");
            return;
        }
        try {
            await transferStock({
                ...formData,
                performedBy: 'System Admin'
            });
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            // Error handled by context
        }
    };

    if (success) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={64} color="var(--color-status-good)" style={{ margin: '0 auto 1rem' }} />
                    <h3>Transfer Completed Successfully!</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Transfer Stock</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div style={{ color: 'var(--color-shc-red)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(193, 39, 45, 0.1)', borderRadius: '4px' }}>{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Select SKU</label>
                            <select
                                className="form-control"
                                required
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value, fromWarehouseId: '' })}
                            >
                                <option value="">Select SKU to transfer</option>
                                {uniqueSkus.map(sku => (
                                    <option key={sku} value={sku}>{sku}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">From Location</label>
                                <select
                                    className="form-control"
                                    required
                                    value={formData.fromWarehouseId}
                                    onChange={e => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                                    disabled={!formData.sku}
                                >
                                    <option value="">Select Source</option>
                                    {availableFromWarehouses.map(wh => (
                                        <option key={wh} value={wh}>{wh}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">To Location</label>
                                <select
                                    className="form-control"
                                    required
                                    value={formData.toWarehouseId}
                                    onChange={e => setFormData({ ...formData, toWarehouseId: e.target.value })}
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses.filter(w => w.isActive).map(wh => (
                                        <option key={wh.id} value={wh.id}>{wh.warehouseName}{wh.id === formData.fromWarehouseId ? ' (same — pick different bin)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Location Selectors */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">From Location Server</label>
                                <select
                                    className="form-control"
                                    required
                                    value={formData.fromLocationCode}
                                    onChange={e => setFormData({ ...formData, fromLocationCode: e.target.value })}
                                    disabled={!formData.fromWarehouseId}
                                >
                                    <option value="">Auto (Default)</option>
                                    {locations.filter(l => l.warehouseId === formData.fromWarehouseId && l.isActive).map(loc => (
                                        <option key={loc.id} value={loc.locationCode}>{loc.locationCode}</option>
                                    ))}
                                </select>
                                {formData.fromWarehouseId && locations.filter(l => l.warehouseId === formData.fromWarehouseId).length === 0 && (
                                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        No locations setup. Using default logic.
                                    </small>
                                )}
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">To Location Server</label>
                                <select
                                    className="form-control"
                                    required
                                    value={formData.toLocationCode}
                                    onChange={e => setFormData({ ...formData, toLocationCode: e.target.value })}
                                    disabled={!formData.toWarehouseId}
                                >
                                    <option value="">Auto (Default)</option>
                                    {locations.filter(l => l.warehouseId === formData.toWarehouseId && l.isActive).map(loc => (
                                        <option key={loc.id} value={loc.locationCode}>{loc.locationCode}</option>
                                    ))}
                                </select>
                                {formData.toWarehouseId && locations.filter(l => l.warehouseId === formData.toWarehouseId).length === 0 && (
                                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                                        No locations setup. Using default logic.
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notes / Reason <span style={{ color: 'var(--color-shc-red)' }}>*</span> <small style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(Required)</small></label>
                            <textarea
                                className="form-control"
                                required
                                rows={2}
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Reference PO, transfer ticket, or reason…"
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Quantity to Transfer</label>
                            <input
                                type="number"
                                className="form-control"
                                required
                                min="1"
                                max={maxAvailable || 1}
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                disabled={!formData.fromWarehouseId}
                            />
                            {formData.fromWarehouseId && (
                                <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                    Max available: {maxAvailable} (FEFO logic applied automatically)
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading || !formData.toWarehouseId || formData.quantity > maxAvailable || !formData.reason.trim()}>
                            {loading ? 'Processing...' : 'Transfer Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferForm;
