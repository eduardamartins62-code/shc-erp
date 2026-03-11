import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { InventoryItem } from '../types';
import { X, CheckCircle } from 'lucide-react';

interface Props {
    item: InventoryItem;
    onClose: () => void;
}

const AdjustForm: React.FC<Props> = ({ item, onClose }) => {
    const { adjustStock, loading, error } = useInventory();
    const [formData, setFormData] = useState({
        sku: item.id,
        warehouseId: item.warehouseId,
        newQuantityOnHand: item.quantityOnHand,
        reasonCode: '',
    });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const diff = formData.newQuantityOnHand - item.quantityOnHand;
            await adjustStock({
                sku: formData.sku,
                warehouseId: formData.warehouseId,
                locationCode: 'Default',
                adjustmentType: diff >= 0 ? 'Increase' : 'Decrease',
                quantity: Math.abs(diff),
                reasonCode: formData.reasonCode,
                performedBy: 'System Admin' // Mock current user
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
                    <h3>Stock Adjusted Successfully!</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Adjust Stock (Cycle Count)</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div style={{ color: 'var(--color-shc-red)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(193, 39, 45, 0.1)', borderRadius: '4px' }}>{error}</div>}

                        <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div><strong>SKU:</strong> {item.id}</div>
                                <div><strong>Warehouse:</strong> {item.warehouseId}</div>
                                <div><strong>Current QOH:</strong> {item.quantityOnHand}</div>
                                <div><strong>Reserved:</strong> {item.quantityReserved}</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Quantity On Hand</label>
                            <input
                                type="number"
                                className="form-control"
                                required
                                min={item.quantityReserved} // Can't go below reserved
                                value={formData.newQuantityOnHand}
                                onChange={e => setFormData({ ...formData, newQuantityOnHand: e.target.value === '' ? item.quantityReserved : parseInt(e.target.value, 10) })}
                            />
                            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                Must be at least the reserved quantity ({item.quantityReserved}).
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Reason Code</label>
                            <select
                                className="form-control"
                                required
                                value={formData.reasonCode}
                                onChange={e => setFormData({ ...formData, reasonCode: e.target.value })}
                            >
                                <option value="">Select Reason</option>
                                <option value="CYCLE_COUNT">Cycle Count Variance</option>
                                <option value="DAMAGE">Damaged Goods</option>
                                <option value="EXPIRED">Expired Stock</option>
                                <option value="THEFT">Shrinkage / Theft</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustForm;
