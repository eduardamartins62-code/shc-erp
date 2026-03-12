import React, { useState } from 'react';
import type { Order } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { AlertTriangle, XCircle } from 'lucide-react';

interface CancelOrderModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ order, isOpen, onClose }) => {
    const { cancelOrder } = useOrders();
    const [reason, setReason] = useState('Customer Request');
    const [customReason, setCustomReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    if (!isOpen || !order) return null;

    const reasons = [
        'Customer Request',
        'Out of Stock',
        'Duplicate Order',
        'Fraud Suspected',
        'Shipping Issue',
        'Other'
    ];

    const isPartiallyPicked = ['Allocated', 'Picking', 'Packed'].includes(order.fulfillmentStatus);

    const handleConfirm = async () => {
        const finalReason = reason === 'Other' ? customReason : reason;

        setIsCancelling(true);
        try {
            await cancelOrder(order.id, finalReason, 'System Admin');
            onClose();
            // Just simulate toast in UI via a global event for now if `useToast` isn't imported, but actually I will just use `alert` fallback removed.
            // Let's use a simple custom event.
            window.dispatchEvent(new CustomEvent('shc-toast', {
                detail: { message: `Order #${order.id} has been cancelled`, type: 'success' }
            }));

        } catch (err) {
            console.error('Failed to cancel order:', err);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 30, 30, 0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <XCircle size={20} color="var(--color-shc-red)" /> Cancel Order #{order.id}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ backgroundColor: 'var(--color-bg-danger)', color: 'var(--color-status-expired)', padding: '1rem', borderRadius: '4px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                            <strong>Warning:</strong> This action cannot be undone. Inventory reservations for this order will be reversed.
                        </div>
                    </div>

                    {isPartiallyPicked && (
                        <div style={{ backgroundColor: 'var(--color-bg-warning)', color: 'var(--color-status-reserved)', padding: '1rem', borderRadius: '4px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                                <strong>Restocking Required:</strong> This order has already been partially picked or packed. Physical items must be returned to stock.
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Cancellation Reason *</label>
                        <select
                            className="input"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {reason === 'Other' && (
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Custom Reason *</label>
                            <textarea
                                className="input"
                                rows={3}
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please explain the reason for cancellation..."
                                required
                            />
                        </div>
                    )}

                </div>

                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--color-white)' }}>
                    <button className="btn-secondary" onClick={onClose} disabled={isCancelling}>Keep Order</button>
                    <button
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={isCancelling || (reason === 'Other' && !customReason.trim())}
                    >
                        {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;
