import React, { useEffect, useState } from 'react';
import Barcode from 'react-barcode';
import type { WarehouseLocation } from '../../types';

interface Props {
    locations: WarehouseLocation[];
    onClose: () => void;
}

const PrintLabelView: React.FC<Props> = ({ locations, onClose }) => {
    // We delay the print call slightly to ensure images/barcodes render
    const [readyToPrint, setReadyToPrint] = useState(false);

    useEffect(() => {
        if (locations.length > 0) {
            const timer = setTimeout(() => {
                setReadyToPrint(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [locations]);

    useEffect(() => {
        if (readyToPrint) {
            window.print();
            // Optional: close after printing. Browsers pause JS execution during print dialogue,
            // so this runs after print dialogue closes. Some users prefer not auto-closing though, 
            // so we instead provide a close button on the UI just in case.
        }
    }, [readyToPrint]);

    if (!locations || locations.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 9999, // very high to sit on top of everything
            overflowY: 'auto'
        }}>
            {/* Non-printable controls */}
            <div className="no-print" style={{ padding: '1rem', backgroundColor: '#f1f1f1', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 500 }}>Print Preview - {locations.length} Label(s)</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => window.print()}
                        style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Print Now
                    </button>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Close Preview
                    </button>
                </div>
            </div>

            {/* Printable Area */}
            <div className="print-area" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.1in', padding: '2rem', justifyContent: 'center' }}>
                {/* CSS to ensure page breaks and clean prints */}
                <style>
                    {`
                    @media print {
                        .no-print { display: none !important; }
                        body, html { margin: 0; padding: 0; background: white; }
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 8.5in;
                            padding: 0 !important;
                            margin: 0 !important;
                            display: grid !important; 
                            grid-template-columns: repeat(3, 1fr) !important; 
                            gap: 0 !important; 
                            align-items: start;
                            justify-content: start;
                        }
                        .label-container { 
                            width: 2.625in !important; 
                            height: 1in !important; 
                            margin: 0 !important; 
                            padding: 0.1in !important;
                            border: none !important; 
                            page-break-inside: avoid;
                        }
                        @page { 
                            /* Avery 5160 margins approximately */
                            margin: 0.5in 0.187in; 
                            size: letter; 
                        }
                    }
                    `}
                </style>

                {locations.map((loc) => (
                    <div key={loc.id} className="label-container" style={{
                        width: '2.625in',
                        height: '1in',
                        border: '1px dashed #ccc',
                        display: 'flex',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        padding: '0.1in',
                        backgroundColor: 'white',
                    }}>
                        {/* SHC Logo Placeholder */}
                        <div style={{
                            flex: '0 0 0.4in',
                            height: '0.4in',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.1in',
                            borderRadius: '4px'
                        }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>SHC</span>
                        </div>

                        {/* Label Body */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.5px' }}>{loc.locationCode}</span>
                                <span style={{
                                    fontSize: '8px',
                                    padding: '2px 4px',
                                    backgroundColor: '#e2e8f0',
                                    color: '#334155',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>
                                    {loc.type || 'LOC'}
                                </span>
                            </div>

                            <div style={{ marginTop: '4px', width: '100%', overflow: 'hidden' }}>
                                <Barcode
                                    value={loc.barcodeValue || loc.locationCode}
                                    height={24}
                                    width={1.2}
                                    fontSize={10}
                                    margin={0}
                                    displayValue={false}
                                />
                            </div>
                            <div style={{ fontSize: '8px', color: '#64748b', marginTop: '2px', textAlign: 'center' }}>
                                {loc.barcodeValue || loc.locationCode}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrintLabelView;
