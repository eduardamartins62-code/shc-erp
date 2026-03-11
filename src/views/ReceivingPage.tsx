import React, { useState, useEffect } from 'react';
import type { PurchaseOrder } from '../types/receiving';
import { getPurchaseOrders, getLocations } from '../services/receivingApi';
import ReceivingList from '../components/receiving/ReceivingList';
import ReceivingSession from '../components/receiving/ReceivingSession';
import { CheckCircle2 } from 'lucide-react';

const ReceivingPage: React.FC = () => {
    const [view, setView] = useState<'list' | 'session' | 'success'>('list');
    const [mode, setMode] = useState<'po' | 'manual' | 'bulk' | null>(null);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [selectedPOs, setSelectedPOs] = useState<PurchaseOrder[]>([]);

    const [pos, setPOs] = useState<PurchaseOrder[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // New State for Addendum Features
    const [drawerPO, setDrawerPO] = useState<PurchaseOrder | null>(null);
    const [selectedPOIds, setSelectedPOIds] = useState<Set<string>>(new Set());
    const [printTarget, setPrintTarget] = useState<PurchaseOrder | PurchaseOrder[] | null>(null);

    // Success state data
    const [successData, setSuccessData] = useState<{ receiptNumber: string; deltaCount: number } | null>(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [fetchedPOs, fetchedLocs] = await Promise.all([
                getPurchaseOrders(),
                getLocations()
            ]);
            setPOs(fetchedPOs);
            setLocations(fetchedLocs);
        } catch (error) {
            console.error('Failed to load receiving data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Print Side-effect
    useEffect(() => {
        if (!printTarget) return;
        const style = document.createElement("style");
        style.id = "shc-print-styles";
        style.innerHTML = `
            @media print {
                body > * { display: none !important; }
                #print-template { display: block !important; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.getElementById("shc-print-styles")?.remove();
        };
    }, [printTarget]);

    const handleStartPO = (po: PurchaseOrder) => {
        setMode('po');
        setSelectedPO(po);
        setDrawerPO(null); // Close drawer if open
        setView('session');
    };

    const handleStartBulk = () => {
        setMode('bulk');
        const bulkPos = pos.filter(p => selectedPOIds.has(p.id));
        setSelectedPOs(bulkPos);
        setView('session');
    };

    const handleStartManual = () => {
        setMode('manual');
        setSelectedPO(null);
        setView('session');
    };

    const handleBackToList = () => {
        setMode(null);
        setSelectedPO(null);
        setSelectedPOs([]);
        setSelectedPOIds(new Set()); // Auto-clear selection
        setView('list');
    };

    const handleSuccess = (receiptNumber: string, deltaCount: number) => {
        setSuccessData({ receiptNumber, deltaCount });
        setView('success');

        // Re-fetch POs to get updated status natively
        fetchInitialData();

        // After 2.5s, return to list view
        setTimeout(() => {
            handleBackToList();
            setSuccessData(null);
        }, 2500);
    };

    const handlePrintSingle = (po: PurchaseOrder) => {
        setPrintTarget(po);
        setTimeout(() => window.print(), 10);
    };

    const handlePrintMultiple = (ids: Set<string>) => {
        const toPrint = pos.filter(p => ids.has(p.id));
        setPrintTarget(toPrint);
        setTimeout(() => window.print(), 10);
    };

    if (view === 'list') {
        return (
            <>
                <ReceivingList
                    pos={pos}
                    loading={loading}
                    onStartPO={handleStartPO}
                    onStartManual={handleStartManual}
                    onStartBulk={handleStartBulk}
                    selectedPOIds={selectedPOIds}
                    setSelectedPOIds={setSelectedPOIds}
                    drawerPO={drawerPO}
                    setDrawerPO={setDrawerPO}
                    onPrintSingle={handlePrintSingle}
                    onPrintMultiple={handlePrintMultiple}
                />
                <PrintTemplate target={printTarget} />
            </>
        );
    }

    if (view === 'session') {
        return (
            <ReceivingSession
                mode={mode!}
                selectedPO={selectedPO}
                selectedPOs={selectedPOs}
                locations={locations}
                onBack={handleBackToList}
                onSuccess={handleSuccess}
            />
        );
    }

    if (view === 'success' && successData) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-status-good)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <CheckCircle2 color="var(--color-status-good)" size={36} />
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: '0 0 8px 0' }}>
                    Receipt Posted
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: '0 0 24px 0' }}>
                    {successData.receiptNumber} — inventory updated
                </p>

                {successData.deltaCount > 0 && (
                    <div style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        color: 'var(--color-status-reserved)',
                        border: '1px solid var(--color-status-reserved)',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: 500
                    }}>
                        {successData.deltaCount} discrepanc{successData.deltaCount === 1 ? 'y' : 'ies'} logged for review
                    </div>
                )}
            </div>
        );
    }

    return null;
};

// --- Print Template Component ---
const PrintTemplate: React.FC<{ target: PurchaseOrder | PurchaseOrder[] | null }> = ({ target }) => {
    if (!target) return <div id="print-template" style={{ display: 'none' }}></div>;

    const orders = Array.isArray(target) ? target : [target];

    return (
        <div id="print-template" style={{ display: 'none' }}>
            {orders.map((po, idx) => (
                <div key={po.id} className={idx < orders.length - 1 ? 'page-break' : ''}>
                    <div className="print-header">
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px', textTransform: 'uppercase' }}>SHC ERP</h1>
                            <div style={{ fontSize: '14px', marginTop: '4px' }}>Purchase Order</div>
                        </div>
                    </div>
                    <div className="print-meta-grid">
                        <div className="print-meta-label">PO Number:</div><div>{po.id}</div>
                        <div className="print-meta-label">Supplier:</div><div>{po.supplier}</div>
                        <div className="print-meta-label">Expected:</div><div>{new Date(po.expectedDate).toLocaleDateString()}</div>
                        <div className="print-meta-label">Status:</div><div style={{ textTransform: 'uppercase' }}>{po.status}</div>
                        <div className="print-meta-label">Printed:</div><div>{new Date().toLocaleString()}</div>
                    </div>

                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px', fontSize: '11px', letterSpacing: '0.05em' }}>LINE ITEMS</div>
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Qty</th>
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {po.items.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontFamily: 'monospace' }}>{item.sku}</td>
                                    <td>{item.name}</td>
                                    <td>{item.expectedQty}</td>
                                    <td>{item.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '32px' }}>
                        Total Units Expected: {po.items.reduce((s, i) => s + i.expectedQty, 0)}
                    </div>

                    <div style={{ marginTop: '24px' }}>Receiving Notes: ________________________________________________________________</div>
                    <div style={{ marginTop: '16px' }}>__________________________________________________________________________________</div>
                    <div style={{ marginTop: '16px' }}>__________________________________________________________________________________</div>

                    <div className="print-signature-section">
                        <div>
                            <div>Received By:</div>
                            <div className="print-signature-line"></div>
                        </div>
                        <div>
                            <div>Date:</div>
                            <div className="print-signature-line"></div>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                            <div>Signature:</div>
                            <div className="print-signature-line"></div>
                        </div>
                    </div>
                </div>
            ))}
            <style dangerouslySetInnerHTML={{
                __html: `
                #print-template {
                    font-family: 'Arial', sans-serif;
                    font-size: 12px;
                    color: #000;
                    padding: 32px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #000;
                    padding-bottom: 16px;
                    margin-bottom: 20px;
                }
                .print-meta-grid {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 6px 12px;
                    margin-bottom: 24px;
                }
                .print-meta-label { font-weight: bold; }
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 24px;
                }
                .print-table th {
                    border-bottom: 2px solid #000;
                    text-align: left;
                    padding: 6px 8px;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .print-table td {
                    border-bottom: 1px solid #ccc;
                    padding: 6px 8px;
                }
                .print-signature-section {
                    margin-top: 32px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .print-signature-line {
                    border-bottom: 1px solid #000;
                    margin-top: 24px;
                    margin-bottom: 4px;
                }
                .page-break { page-break-after: always; }
            ` }} />
        </div>
    );
};

export default ReceivingPage;
