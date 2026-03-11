import sys

def fix():
    with open('src/components/receiving/ReceivingSession.tsx', 'r') as f:
        content = f.read()

    new_content = """            {/* Section 2: Line Items */}
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
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-bg-subtle)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>SKU</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>Expected</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>Received</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>Lot #</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>Exp Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-border)' }}>
                                    Location
                                    <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px', textTransform: 'none' }}>
                                        default: {session.location || 'not set'}
                                    </div>
                                </th>
                                {mode === 'manual' && <th style={{ width: '40px', borderBottom: '1px solid var(--color-border)' }}></th>}
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
        <div style={{ position: 'sticky', top: '24px', alignSelf: 'start' }}>

            {/* Summary Card */}
            <div className="card" style={{ marginBottom: discrepantLines.length > 0 || lines.some(l => l.locationOverride) ? '16px' : '24px' }}>
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

            {/* Location Breakdown Card (conditional) */}
            {(() => {
                const locationCounts = lines.reduce((acc, line) => {
                    const parsedQty = parseInt(line.receivedQty) || 0;
                    if (parsedQty > 0 || mode === 'po' || mode === 'bulk') {
                        const loc = line.locationOverride || session.location;
                        if (loc) {
                            if (!acc[loc]) acc[loc] = 0;
                            acc[loc] += 1;
                        }
                    }
                    return acc;
                }, {} as Record<string, number>);

                const hasOverrides = lines.some(l => l.locationOverride !== null);
                
                if (hasOverrides) {
                    return (
                        <div className="card" style={{ marginBottom: discrepantLines.length > 0 ? '16px' : '24px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', margin: '0 0 16px 0' }}>
                                Location Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                                {Object.entries(locationCounts).map(([loc, count]) => (
                                    <div key={loc} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{loc}</span>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{count} {count === 1 ? 'item' : 'items'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

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

export default ReceivingSession;"""

    header_index = content.find("            {/* Section 2: Line Items */}")
    
    if header_index != -1:
        updated = content[:header_index] + new_content
        with open('src/components/receiving/ReceivingSession.tsx', 'w') as f:
            f.write(updated)
        print("Success")
    else:
        print("Could not find section boundary")

fix()
