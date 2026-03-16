import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { X, Plus, Trash2 } from 'lucide-react';
import type { B2BOrderFormData } from '../types';
import { generateB2BOrderNumber } from '../utils/orderUtils';

interface B2BOrderFormProps {
    onClose: () => void;
}

const B2BOrderForm: React.FC<B2BOrderFormProps> = ({ onClose }) => {
    const { createB2BOrder } = useOrders();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [shipToName, setShipToName] = useState('');
    const [shipToEmail, setShipToEmail] = useState('');
    const [shipToAddress1, setShipToAddress1] = useState('');
    const [shipToCity, setShipToCity] = useState('');
    const [shipToState, setShipToState] = useState('');
    const [shipToZip, setShipToZip] = useState('');
    const [notes, setNotes] = useState('');

    const [items, setItems] = useState<B2BOrderFormData['items']>([
        { sku: '', quantity: 1, price: 0 }
    ]);

    const handleAddItem = () => {
        setItems([...items, { sku: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: keyof B2BOrderFormData['items'][0], value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!shipToName || !shipToAddress1 || items.length === 0) {
                throw new Error("Please fill in required fields.");
            }
            if (items.some(i => !i.sku || i.quantity <= 0 || i.price <= 0)) {
                throw new Error("Please ensure all items have valid SKU, quantity, and price.");
            }

            await createB2BOrder({
                orderNumber: generateB2BOrderNumber(),
                orderDate: new Date().toISOString(),
                shipTo: {
                    name: shipToName,
                    address1: shipToAddress1,
                    city: shipToCity,
                    state: shipToState,
                    zip: shipToZip,
                    country: 'US',
                    email: shipToEmail
                },
                notes,
                items,
                tax: 0,
                shippingFee: 0,
                tagIds: [],
                performedBy: 'System Admin'
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>Create Manual B2B Order</h2>

                {error && (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Ship To Information */}
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem' }}>Ship To</h3>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={shipToName}
                                    onChange={(e) => setShipToName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={shipToEmail}
                                    onChange={(e) => setShipToEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>Address Line 1 *</label>
                            <input
                                type="text"
                                required
                                value={shipToAddress1}
                                onChange={(e) => setShipToAddress1(e.target.value)}
                            />
                        </div>
                        <div className="grid-2" style={{ marginTop: '1rem' }}>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" value={shipToCity} onChange={(e) => setShipToCity(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input type="text" value={shipToState} onChange={(e) => setShipToState(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>ZIP</label>
                                <input type="text" value={shipToZip} onChange={(e) => setShipToZip(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>Order Items</h3>
                            <button type="button" className="btn-secondary" onClick={handleAddItem} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                <Plus size={14} /> Add Line Item
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {items.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', backgroundColor: '#fafafa', padding: '1rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                                        <label>SKU</label>
                                        <input
                                            type="text"
                                            required
                                            value={item.sku}
                                            onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                                            placeholder="e.g. SKU-1001"
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label>Unit Price ($)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        style={{ background: 'none', border: 'none', padding: '0.75rem', color: 'var(--color-shc-red)', cursor: 'pointer', opacity: items.length > 1 ? 1 : 0.5 }}
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={items.length <= 1}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div>
                        <div className="form-group">
                            <label>Internal Notes</label>
                            <textarea
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Create Order'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default B2BOrderForm;
