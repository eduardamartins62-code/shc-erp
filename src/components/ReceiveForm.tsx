import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, CheckCircle } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const ReceiveForm: React.FC<Props> = ({ onClose }) => {
    const { receiveStock, loading, error } = useInventory();
    const [formData, setFormData] = useState({
        sku: '',
        warehouseId: '',
        quantity: 1,
        lotNumber: '',
        expirationDate: '',
    });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await receiveStock({
                ...formData,
                locationCode: 'Default',
                performedBy: 'System Admin' // Mock current user
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            // Error handled by context or could be displayed here
        }
    };

    if (success) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={64} color="var(--color-status-good)" style={{ margin: '0 auto 1rem' }} />
                    <h3>Stock Received Successfully!</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Receive Stock</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div style={{ color: 'var(--color-shc-red)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(193, 39, 45, 0.1)', borderRadius: '4px' }}>{error}</div>}

                        <div className="form-group">
                            <label className="form-label">SKU</label>
                            <input
                                type="text"
                                className="form-control"
                                required
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="e.g. SKU-1005"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Warehouse ID</label>
                            <select
                                className="form-control"
                                required
                                value={formData.warehouseId}
                                onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                            >
                                <option value="">Select Warehouse</option>
                                <option value="WH-MAIN">Main Warehouse</option>
                                <option value="WH-EAST">East Facility</option>
                                <option value="WH-WEST">West Facility</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Lot Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={formData.lotNumber}
                                    onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                                    placeholder="e.g. L-2024-X1"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Expiration Date</label>
                            <input
                                type="date"
                                className="form-control"
                                required
                                value={formData.expirationDate}
                                onChange={e => {
                                    setFormData({ ...formData, expirationDate: e.target.value });
                                }}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Receive Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReceiveForm;
