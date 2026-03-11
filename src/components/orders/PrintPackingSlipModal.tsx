import React, { useRef } from 'react';
import type { Order } from '../../types';
import { Printer, Download, X } from 'lucide-react';

interface PrintPackingSlipModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const PrintPackingSlipModal: React.FC<PrintPackingSlipModalProps> = ({ order, isOpen, onClose }) => {
    const slipRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !order) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        // In a real app we might use html2pdf.js or similar. 
        // For now, prompt the user to use Print to PDF.
        alert('To download as PDF, click Print and select "Save as PDF" as your destination.');
        window.print();
    };

    return (
        <div className="print-modal-container" style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 30, 30, 0.8)', zIndex: 1100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', overflowY: 'auto'
        }}>
            {/* Styles for Printing */}
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                        .print-modal-container {
                    position: absolute;
                left: 0;
                top: 0;
                margin: 0;
                padding: 0;
                background: transparent;
                        }
                .packing-slip, .packing-slip * {
                    visibility: visible;
                        }
                .packing-slip {
                    position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                box-shadow: none !important;
                border: none !important;
                        }
                .no-print {
                    display: none !important;
                        }
                    }
                `}
            </style>

            {/* Print Controls (Hidden on actual print) */}
            <div className="no-print" style={{
                display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px',
                backgroundColor: 'var(--color-white)', padding: '1rem', borderRadius: '8px',
                marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Printer size={20} /> Print Preview
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" onClick={handleDownloadPdf}>
                        <Download size={16} /> Download PDF
                    </button>
                    <button className="btn-primary" onClick={handlePrint}>
                        <Printer size={16} /> Print
                    </button>
                    <button className="btn-secondary" onClick={onClose} style={{ marginLeft: '1rem' }}>
                        <X size={16} /> Close
                    </button>
                </div>
            </div>

            {/* The Packing Slip Document */}
            <div className="packing-slip" ref={slipRef} style={{
                backgroundColor: '#ffffff',
                width: '100%',
                maxWidth: '800px',
                minHeight: '1056px', // Approx letter size
                padding: '3rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                color: '#000',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            SHC ERP
                        </h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563', fontSize: '0.875rem' }}>
                            123 Warehouse Avenue<br />
                            Logistics City, LC 90210
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, fontSize: '2rem', color: '#9ca3af', textTransform: 'uppercase' }}>Packing Slip</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${order.id}`}
                                alt="Barcode"
                                style={{ width: '80px', height: '80px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>Ship To</h3>
                        <p style={{ margin: 0, fontWeight: 600 }}>{order.customerName}</p>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#374151' }}>{order.shippingAddress}</p>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>Order Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', fontSize: '0.875rem' }}>
                            <span style={{ color: '#6b7280' }}>Order #:</span>
                            <span style={{ fontWeight: 600 }}>{order.id}</span>

                            <span style={{ color: '#6b7280' }}>Order Date:</span>
                            <span>{new Date(order.orderDate).toLocaleString()}</span>

                            <span style={{ color: '#6b7280' }}>Channel:</span>
                            <span>{order.channel}</span>

                            <span style={{ color: '#6b7280' }}>Shipping Method:</span>
                            <span>Standard Shipping</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>SKU</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>Description</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Qty Ordered</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Qty to Ship</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Unit Price</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>Line Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={item.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 600, fontSize: '0.875rem' }}>{item.sku}</td>
                                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#4b5563' }}>Product Name For {item.sku}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>{item.quantity}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>${item.price.toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem' }}>${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals & Notes */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>Order Notes</h3>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563', fontStyle: 'italic' }}>
                            {order.notes || 'No special instructions.'}
                        </p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                            <span style={{ color: '#4b5563' }}>Subtotal:</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                            <span style={{ color: '#4b5563' }}>Shipping:</span>
                            <span>${order.fees.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                            <span style={{ color: '#4b5563' }}>Tax:</span>
                            <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 700, fontSize: '1.125rem' }}>
                            <span>Grand Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintPackingSlipModal;
