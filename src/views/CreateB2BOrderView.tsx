"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import { useProducts } from '../context/ProductContext';
import TagMultiSelect from '../components/ui/TagMultiSelect';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { generateB2BOrderNumber } from '../utils/orderUtils';
import type { B2BOrderFormData } from '../types';

interface LineItem {
    sku: string;
    quantity: number;
    price: number;
}

const CreateB2BOrderView: React.FC = () => {
    const router = useRouter();
    const { createB2BOrder, loading } = useOrders();
    const { warehouses, systemSettings } = useSettings();
    const { products } = useProducts();
    const [error, setError] = useState<string | null>(null);

    const [orderNumber, setOrderNumber] = useState(generateB2BOrderNumber());
    const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
    const [carrier, setCarrier] = useState('');
    const [requestedService, setRequestedService] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [tagIds, setTagIds] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    const [shipTo, setShipTo] = useState({
        name: '', company: '', address1: '', address2: '',
        city: '', state: '', zip: '', country: 'US', phone: '', email: ''
    });

    const [items, setItems] = useState<LineItem[]>([{ sku: '', quantity: 1, price: 0 }]);

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const [tax, setTax] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const orderTotal = subtotal + tax + shippingFee;

    const addItem = () => setItems([...items, { sku: '', quantity: 1, price: 0 }]);
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: keyof LineItem, value: string | number) => {
        setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!shipTo.name || !shipTo.address1 || !shipTo.city || !shipTo.state || !shipTo.zip) {
            setError('Please fill in all required shipping address fields.');
            return;
        }
        if (items.some(i => !i.sku)) {
            setError('All line items must have a SKU selected.');
            return;
        }
        try {
            const formData: B2BOrderFormData = {
                orderNumber,
                orderDate: new Date(orderDate).toISOString(),
                shipTo: { ...shipTo },
                items: items.map(i => ({ sku: i.sku, quantity: Number(i.quantity), price: Number(i.price) })),
                tax: Number(tax),
                shippingFee: Number(shippingFee),
                notes,
                internalNotes,
                tagIds,
                carrier,
                requestedService,
                warehouseId,
                performedBy: 'Admin'
            };
            await createB2BOrder(formData);
            router.push('/wms/orders');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create order');
        }
    };

    const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', boxSizing: 'border-box' as const };
    const labelStyle = { display: 'block' as const, marginBottom: '0.3rem', fontWeight: 500 as const, fontSize: '0.8rem', color: 'var(--color-text-main)' };
    const sectionStyle = { backgroundColor: 'var(--color-white)', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '1.5rem', marginBottom: '1.5rem' };

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <button className="btn-secondary" style={{ marginBottom: '1.5rem', border: 'none', background: 'transparent', padding: 0 }} onClick={() => router.push('/wms/orders')}>
                <ArrowLeft size={18} /> Back to Orders
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Create B2B Order</h1>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Fill in the details below to create a new manual B2B order.</p>
            </div>

            {error && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Left column */}
                    <div>
                        {/* Ship To */}
                        <div style={sectionStyle}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Ship To</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Name <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                                    <input style={inputStyle} value={shipTo.name} onChange={e => setShipTo({ ...shipTo, name: e.target.value })} placeholder="Full name" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Company</label>
                                    <input style={inputStyle} value={shipTo.company} onChange={e => setShipTo({ ...shipTo, company: e.target.value })} placeholder="Company name" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Address Line 1 <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                                    <input style={inputStyle} value={shipTo.address1} onChange={e => setShipTo({ ...shipTo, address1: e.target.value })} placeholder="Street address" required />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Address Line 2</label>
                                    <input style={inputStyle} value={shipTo.address2} onChange={e => setShipTo({ ...shipTo, address2: e.target.value })} placeholder="Apt, Suite, etc." />
                                </div>
                                <div>
                                    <label style={labelStyle}>City <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                                    <input style={inputStyle} value={shipTo.city} onChange={e => setShipTo({ ...shipTo, city: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>State <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                                    <input style={inputStyle} value={shipTo.state} onChange={e => setShipTo({ ...shipTo, state: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>ZIP Code <span style={{ color: 'var(--color-shc-red)' }}>*</span></label>
                                    <input style={inputStyle} value={shipTo.zip} onChange={e => setShipTo({ ...shipTo, zip: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Country</label>
                                    <input style={inputStyle} value={shipTo.country} onChange={e => setShipTo({ ...shipTo, country: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input style={inputStyle} value={shipTo.phone} onChange={e => setShipTo({ ...shipTo, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input style={inputStyle} type="email" value={shipTo.email} onChange={e => setShipTo({ ...shipTo, email: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div style={sectionStyle}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Order Items</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>SKU</th>
                                            <th style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', width: '80px' }}>Qty</th>
                                            <th style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', width: '120px' }}>Unit Price</th>
                                            <th style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', width: '100px' }}>Total</th>
                                            <th style={{ width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <select
                                                        value={item.sku}
                                                        onChange={e => {
                                                            const sku = e.target.value;
                                                            const product = products.find(p => p.sku === sku);
                                                            updateItem(idx, 'sku', sku);
                                                            if (product?.msrpPrice) updateItem(idx, 'price', product.msrpPrice);
                                                        }}
                                                        style={{ ...inputStyle, minWidth: '160px' }}
                                                        required
                                                    >
                                                        <option value="">Select SKU...</option>
                                                        {products.map(p => (
                                                            <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} style={{ ...inputStyle, textAlign: 'right', width: '70px' }} />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, textAlign: 'right', width: '110px' }} />
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    {items.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={addItem} style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <Plus size={14} /> Add Line Item
                            </button>
                        </div>

                        {/* Totals */}
                        <div style={sectionStyle}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Order Totals</h3>
                            <div style={{ maxWidth: '320px', marginLeft: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Tax</span>
                                    <input type="number" min="0" step="0.01" value={tax} onChange={e => setTax(parseFloat(e.target.value) || 0)} style={{ width: '100px', padding: '0.3rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'right', fontSize: '0.875rem' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Shipping Fee</span>
                                    <input type="number" min="0" step="0.01" value={shippingFee} onChange={e => setShippingFee(parseFloat(e.target.value) || 0)} style={{ width: '100px', padding: '0.3rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'right', fontSize: '0.875rem' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem' }}>
                                    <span>Order Total</span>
                                    <span style={{ color: 'var(--color-primary-dark)' }}>${orderTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={sectionStyle}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Order Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Order Number</label>
                                    <input style={inputStyle} value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Order Date</label>
                                    <input type="date" style={inputStyle} value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Carrier</label>
                                    <input style={inputStyle} value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="UPS, FedEx, USPS..." />
                                </div>
                                <div>
                                    <label style={labelStyle}>Requested Service</label>
                                    <input style={inputStyle} value={requestedService} onChange={e => setRequestedService(e.target.value)} placeholder="Ground, 2-Day..." />
                                </div>
                                <div>
                                    <label style={labelStyle}>Warehouse</label>
                                    <select style={inputStyle} value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                                        <option value="">Select warehouse...</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.warehouseName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Tags</h3>
                            <TagMultiSelect selectedTagIds={tagIds} onChange={setTagIds} />
                        </div>

                        <div style={sectionStyle}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>Notes</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Customer Notes</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes visible to customer..." />
                                </div>
                                <div>
                                    <label style={labelStyle}>Internal Notes</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Internal warehouse notes..." />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                            {loading ? 'Creating Order...' : 'Create B2B Order'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateB2BOrderView;
