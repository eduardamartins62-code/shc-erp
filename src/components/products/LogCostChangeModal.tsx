import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

interface LogCostChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCost: number;
    onSave: (newCost: number, notes: string) => void;
}

const LogCostChangeModal: React.FC<LogCostChangeModalProps> = ({ isOpen, onClose, currentCost, onSave }) => {
    const [newCost, setNewCost] = useState<string>(currentCost.toString());
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        const parsedCost = parseFloat(newCost);
        if (!isNaN(parsedCost) && parsedCost > 0) {
            onSave(parsedCost, notes);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Log Cost Change</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Current Unit Cost</label>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                            ${currentCost.toFixed(2)}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Unit Cost ($)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                <DollarSign size={16} />
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                style={{ paddingLeft: '2rem' }}
                                value={newCost}
                                onChange={(e) => setNewCost(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Reason / Notes</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            placeholder="e.g. Supplier raised prices"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn-primary">Save Cost Change</button>
                </div>
            </div>
        </div>
    );
};

export default LogCostChangeModal;
