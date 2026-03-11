import React, { useState, useMemo } from 'react';
import type { PurchaseOrder, ReceiptSession, ReceiptLine, DiscrepancyRecord } from '../../types/receiving';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import LineItemRow from './LineItemRow';
import { submitReceipt } from '../../services/receivingApi';

interface ReceivingSessionProps {
    mode: 'po' | 'manual' | 'bulk';
    selectedPO: PurchaseOrder | null;
    selectedPOs?: PurchaseOrder[];
    locations: string[];
    onBack: () => void;
    onSuccess: (receiptNumber: string, deltaCount: number) => void;
}

const generateReceiptNumber = () => `RCV-${String(Date.now()).slice(-6)}`;

const ReceivingSession: React.FC<ReceivingSessionProps> = ({
    mode,
    selectedPO,
    selectedPOs,
    locations,
    onBack,
    onSuccess
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [session, setSession] = useState<ReceiptSession>({
        receiptNumber: generateReceiptNumber(),
        receivedDate: new Date().toISOString().split('T')[0],
        location: '',
        notes: '',
        mode,
        poId: selectedPO?.id || null
    });

    const [lines, setLines] = useState<ReceiptLine[]>(() => {
        if (mode === 'bulk' && selectedPOs) {
            return selectedPOs.flatMap(po =>
                po.items.map(item => ({
                    itemId: `${po.id}-${item.id}`,
                    sku: item.sku,
                    name: item.name,
                    expectedQty: item.expectedQty,
                    receivedQty: '',
                    unit: item.unit,
                    lot: '',
                    expDate: '',
                    discrepancyAction: null,
                    discrepancyNote: '',
                    lotTracked: item.lotTracked,
                    locationSplits: [],
                    poId: po.id,
                    supplierName: po.supplier
                }))
            );
        } else if (mode === 'po' && selectedPO) {
            return selectedPO.items.map(item => ({
                itemId: item.id,
                sku: item.sku,
                name: item.name,
                expectedQty: item.expectedQty,
                receivedQty: '',
                unit: item.unit,
                lot: '',
                expDate: '',
                discrepancyAction: null,
                discrepancyNote: '',
                lotTracked: item.lotTracked,
                locationSplits: [],
                poId: selectedPO.id,
                supplierName: selectedPO.supplier
            }));
        } else {
            return [{
                itemId: `manual-${Date.now()}`,
                sku: '',
                name: '',
                expectedQty: null,
                receivedQty: '',
                unit: 'ea',
                lot: '',
                expDate: '',
                discrepancyAction: null,
                discrepancyNote: '',
                lotTracked: false,
                locationSplits: [],
                poId: null,
                supplierName: null
            }];
        }
    });

    const handleSessionChange = (field: keyof ReceiptSession, value: string) => {
        setSession(prev => ({ ...prev, [field]: value }));
    };

    const handleLineChange = (index: number, field: keyof ReceiptLine, value: any) => {
        setLines(prev => {
            const newLines = [...prev];
            newLines[index] = { ...newLines[index], [field]: value };
            return newLines;
        });
    };

    const handleAddLine = () => {
        setLines(prev => [
            ...prev,
            {
                itemId: `manual-${Date.now()}`,
                sku: '',
                name: '',
                expectedQty: null,
                receivedQty: '',
                unit: 'ea',
                lot: '',
                expDate: '',
                discrepancyAction: null,
                discrepancyNote: '',
                lotTracked: false,
                locationSplits: [],
                poId: null,
                supplierName: null
            }
        ]);
    };

    const handleRemoveLine = (index: number) => {
        setLines(prev => prev.filter((_, i) => i !== index));
    };

    const isDiscrepant = (line: ReceiptLine) => {
        if (line.expectedQty === null || line.receivedQty === '') return false;
        const received = parseInt(line.receivedQty);
        if (isNaN(received)) return false;
        return received !== line.expectedQty;
    };

    const totalUnits = useMemo(() => {
        return lines.reduce((sum, line) => {
            const qty = parseInt(line.receivedQty);
            return sum + (isNaN(qty) ? 0 : qty);
        }, 0);
    }, [lines]);

    const discrepantLines = useMemo(() => {
        return lines.filter(isDiscrepant);
    }, [lines]);

    const hasUnresolvedDiscrepancies = discrepantLines.some(l => l.discrepancyAction === null);
    const hasEmptyQuantities = lines.some(l => l.receivedQty === '');
    const hasEmptyLocations = session.location === '';

    const isSubmitDisabled = hasEmptyQuantities || hasUnresolvedDiscrepancies || hasEmptyLocations || isSubmitting;

    const handleSubmit = async () => {
        if (isSubmitDisabled) return;
        setIsSubmitting(true);

        const discrepancies: DiscrepancyRecord[] = discrepantLines.map(line => ({
            receiptNumber: session.receiptNumber,
            poId: session.poId,
            sku: line.sku,
            productName: line.name,
            expectedQty: line.expectedQty as number,
            receivedQty: parseInt(line.receivedQty),
            delta: parseInt(line.receivedQty) - (line.expectedQty as number),
            action: line.discrepancyAction as 'accept' | 'flag' | 'reject',
            note: line.discrepancyNote,
            timestamp: new Date().toISOString()
        }));

        const generatedMovements = lines.map(line => ({
            sku: line.sku,
            qty: parseInt(line.receivedQty) || 0,
            location: line.locationOverride || session.location,
            lot: line.lot,
            expDate: line.expDate
        }));
        console.log('--- GENERATED INVENTORY MOVEMENTS ---', generatedMovements);

        try {
            if (mode === 'bulk' && selectedPOs) {
                // Post individual receipt per PO
                let totalDiscrepancies = 0;
                for (let i = 0; i < selectedPOs.length; i++) {
                    const po = selectedPOs[i];
                    const poLines = lines.filter(l => l.poId === po.id);
                    const poDiscrepantLines = poLines.filter(isDiscrepant);

                    const receiptNumber = `${session.receiptNumber}-${i + 1}`;

                    const poSession: ReceiptSession = {
                        ...session,
                        receiptNumber,
                        poId: po.id
                    };

                    const poDiscrepancies: DiscrepancyRecord[] = poDiscrepantLines.map(line => ({
                        receiptNumber,
                        poId: po.id,
                        sku: line.sku,
                        productName: line.name,
                        expectedQty: line.expectedQty as number,
                        receivedQty: parseInt(line.receivedQty),
                        delta: parseInt(line.receivedQty) - (line.expectedQty as number),
                        action: line.discrepancyAction as 'accept' | 'flag' | 'reject',
                        note: line.discrepancyNote,
                        timestamp: new Date().toISOString()
                    }));

                    await submitReceipt(poSession, poLines, poDiscrepancies);
                    totalDiscrepancies += poDiscrepancies.length;
                }
                onSuccess(session.receiptNumber + " (Bulk)", totalDiscrepancies);
            } else {
                await submitReceipt(session, lines, discrepancies);
                onSuccess(session.receiptNumber, discrepancies.length);
            }
        } catch (error) {
            console.error('Error submitting the receipt', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Session Header (QuickBooks-style) */}
            <div style={{ marginBottom: '32px', background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        padding: '0',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        transition: 'all 0.2s',
                        fontWeight: 500
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--color-charcoal)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            {mode === 'po' ? `PO RECEIVING — ${selectedPO?.id}` : mode === 'bulk' ? `BULK RECEIVING — ${selectedPOs?.length} POs` : 'MANUAL RECEIVING'}
                            {mode === 'po' && selectedPO && <span style={{ marginLeft: '12px', color: 'var(--color-text-main)' }}>{selectedPO.supplier}</span>}
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {session.receiptNumber}
                            {mode === 'po' && selectedPO && (
                                <span style={{
                                    color: selectedPO.status === 'overdue' ? 'var(--color-status-expired)' : selectedPO.status === 'pending' ? 'var(--color-status-reserved)' : '#3B82F6',
                                    backgroundColor: selectedPO.status === 'overdue' ? 'rgba(193, 39, 45, 0.1)' : selectedPO.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {selectedPO.status}
                                </span>
                            )}
                        </h1>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--color-border)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <div style={{ background: 'var(--color-white)', padding: '16px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            RECEIVED DATE
                        </label>
                        <input
                            type="date"
                            value={session.receivedDate}
                            onChange={(e) => handleSessionChange('receivedDate', e.target.value)}
                            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '15px', fontWeight: 500, color: 'var(--color-text-main)', outline: 'none' }}
                        />
                    </div>
                    <div style={{ background: 'var(--color-white)', padding: '16px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            RECEIVING LOCATION <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                        </label>
                        <select
                            value={session.location}
                            onChange={(e) => handleSessionChange('location', e.target.value)}
                            style={{
                                width: '100%', border: 'none', background: 'transparent', fontSize: '15px', fontWeight: 500,
                                color: session.location ? 'var(--color-text-main)' : 'var(--color-status-expired)', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="" disabled>Select location...</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
                {/* LEFT COLUMN */}
                <div style={{ flex: '1 1 500px', minWidth: 0 }}>

                    {/* Section 2: Line Items */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                                {mode === 'po' && selectedPO ? `Line Items — ${selectedPO.supplier}` : 'Line Items'}
                            </h2>
                            {discrepantLines.length > 0 && (
                                <div style={{ color: 'var(--color-status-expired)', fontSize: '13px', fontWeight: 500 }}>
                                    ⚠ {discrepantLines.length} discrepanc{discrepantLines.length === 1 ? 'y' : 'ies'} require action
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                          <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr style={{ background: 'var(--color-bg-subtle)' }}>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)', width: '12%' }}>SKU</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>Product</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)', width: '9%' }}>Expected</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)', width: '10%' }}>Received</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)', width: '9%' }}>Lot #</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)', width: '16%' }}>Exp Date</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>Location</th>
                                        {mode === 'manual' && <th style={{ width: '36px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mode === 'bulk' && selectedPOs ? (
                                        selectedPOs.map((po) => {
                                            const poLines = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.poId === po.id);
                                            if (poLines.length === 0) return null;
                                            return (
                                                <React.Fragment key={po.id}>
                                                    <tr>
                                                        <td colSpan={7} style={{ padding: '16px 16px 8px 16px', borderBottom: 'none' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                                                                    {po.id} · {po.supplier}
                                                                </div>
                                                                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB', marginLeft: '16px' }}></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {poLines.map(({ l, i }) => (
                                                        <LineItemRow
                                                            key={l.itemId}
                                                            line={l}
                                                            mode={mode}
                                                            index={i}
                                                            locations={locations}
                                                            sessionLocation={session.location}
                                                            onChange={handleLineChange}
                                                        />
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        lines.map((line, index) => (
                                            <LineItemRow
                                                key={line.itemId}
                                                line={line}
                                                mode={mode}
                                                index={index}
                                                locations={locations}
                                                sessionLocation={session.location}
                                                onChange={handleLineChange}
                                                onRemove={mode === 'manual' && lines.length > 1 ? handleRemoveLine : undefined}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                          </div>
                        </div>

                        {mode === 'manual' && (
                            <button
                                onClick={handleAddLine}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: '1px dashed var(--color-border)',
                                    borderRadius: '10px',
                                    color: 'var(--color-text-muted)',
                                    padding: '16px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    marginTop: '12px'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-charcoal)';
                                    e.currentTarget.style.color = 'var(--color-charcoal)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                }}
                            >
                                <Plus size={18} /> Add Line Item
                            </button>
                        )}
                    </div>

                    {/* Section 3: Notes Card */}
                    <div className="card">
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            Shipment Notes
                        </label>
                        <textarea
                            placeholder="Any additional notes about this shipment..."
                            value={session.notes}
                            onChange={(e) => handleSessionChange('notes', e.target.value)}
                            className="form-control"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    {/* End of Left Column */}
                </div>

                {/* RIGHT COLUMN — SUMMARY SIDEBAR */}
                <div style={{ flex: '0 0 300px', position: 'sticky', top: '24px', alignSelf: 'start' }}>

                    {/* Summary Card */}
                    <div className="card" style={{ marginBottom: discrepantLines.length > 0 ? '16px' : '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)', margin: '0 0 16px 0' }}>
                            Receipt Summary
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Receipt #:</span>
                                <span style={{ fontFamily: "'DM Mono', 'Courier New', monospace", color: 'var(--color-text-main)' }}>{session.receiptNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Mode:</span>
                                <span style={{ color: 'var(--color-text-main)' }}>{mode === 'po' ? 'PO-Linked' : mode === 'bulk' ? 'Bulk (Multi-PO)' : 'Manual'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Line Items:</span>
                                <span style={{ color: 'var(--color-text-main)' }}>{lines.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Total Units:</span>
                                <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{totalUnits}</span>
                            </div>

                            <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Discrepancies:</span>
                                <span style={{
                                    color: discrepantLines.length === 0 ? 'var(--color-status-good)' : 'var(--color-status-expired)',
                                    fontWeight: 600
                                }}>
                                    {discrepantLines.length}
                                </span>
                            </div>
                        </div>
                    </div>


                    {/* Discrepancy Action Card (conditional) */}
                    {discrepantLines.length > 0 && (
                        <div style={{ background: 'var(--color-bg-danger)', border: '1px solid var(--color-status-expired)', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-status-expired)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                ⚠ Action Required
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {discrepantLines.map(line => {
                                    const rQty = parseInt(line.receivedQty) || 0;
                                    const delta = line.expectedQty !== null ? rQty - line.expectedQty : 0;
                                    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;

                                    let actionColor = 'var(--color-status-expired)';
                                    let actionText = 'NO ACTION SET';

                                    if (line.discrepancyAction === 'accept') { actionColor = 'var(--color-status-good)'; actionText = 'Accept'; }
                                    if (line.discrepancyAction === 'flag') { actionColor = 'var(--color-status-reserved)'; actionText = 'Flagged'; }
                                    if (line.discrepancyAction === 'reject') { actionColor = 'var(--color-status-expired)'; actionText = 'Rejected'; }

                                    return (
                                        <div key={line.itemId} style={{ fontSize: '13px' }}>
                                            <div style={{ color: 'var(--color-text-main)', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {line.name || line.sku || 'Unknown Item'}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: delta > 0 ? 'var(--color-status-good)' : 'var(--color-status-expired)', fontFamily: "'DM Mono', 'Courier New', monospace", fontSize: '12px' }}>
                                                    {deltaStr} units
                                                </span>
                                                <span style={{ color: actionColor, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                                                    {actionText}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Post Receipt Button */}
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        style={{
                            width: '100%',
                            fontSize: '14px'
                        }}
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Post Receipt →'}
                    </button>

                    {/* Helper text below button */}
                    {hasUnresolvedDiscrepancies && (
                        <div style={{ color: 'var(--color-status-expired)', textAlign: 'center', fontSize: '12px', marginTop: '12px', fontWeight: 500 }}>
                            Set an action for all discrepancies to continue
                        </div>
                    )}
                    {hasEmptyLocations && !hasUnresolvedDiscrepancies && (
                        <div style={{ color: 'var(--color-status-expired)', textAlign: 'center', fontSize: '12px', marginTop: '12px', fontWeight: 500 }}>
                            Please select a Receiving Location
                        </div>
                    )}
                </div>

                {/* End of Two-Column Layout */}
            </div>
        </div>
    );
};

export default ReceivingSession;