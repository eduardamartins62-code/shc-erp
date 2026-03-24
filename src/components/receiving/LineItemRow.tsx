import React from 'react';
import type { ReceiptLine, LocationSplit } from '../../types/receiving';
import { Trash2, AlertCircle, GitBranch, X } from 'lucide-react';

interface LineItemRowProps {
    line: ReceiptLine;
    mode: 'po' | 'manual' | 'bulk';
    stepMode: 'receive' | 'putaway';
    index: number;
    locations: string[];
    sessionLocation: string;
    products?: Array<{ id: string; sku: string; name: string }>;
    onChange: (index: number, field: keyof ReceiptLine, value: any) => void;
    onRemove?: (index: number) => void;
}

const LineItemRow: React.FC<LineItemRowProps> = ({
    line, mode, stepMode, index, locations, sessionLocation, products = [], onChange, onRemove
}) => {
    const parsedQty = parseInt(line.receivedQty) || 0;
    const isValidQty = !isNaN(parseInt(line.receivedQty));

    const hasDiscrepancy =
        stepMode === 'receive' &&
        (mode === 'po' || mode === 'bulk') &&
        line.expectedQty !== null &&
        line.receivedQty !== '' &&
        isValidQty &&
        parsedQty !== line.expectedQty;

    const delta = (hasDiscrepancy && line.expectedQty !== null) ? parsedQty - line.expectedQty : 0;
    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;

    const rowBorderLeft = hasDiscrepancy
        ? '3px solid var(--color-status-expired)'
        : '3px solid transparent';

    // ── RECEIVE STEP ────────────────────────────────────────────────────────
    if (stepMode === 'receive') {
        const colSpan = mode === 'manual' ? 7 : 6;

        return (
            <React.Fragment>
                <tr
                    style={{
                        background: 'var(--color-bg-light)',
                        borderBottom: '1px solid var(--color-border)',
                        borderLeft: rowBorderLeft,
                        transition: 'background-color 0.15s ease'
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-light)')}
                >
                    {/* SKU */}
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                        {mode === 'manual' ? (
                            <>
                                <input
                                    list={`line-sku-list-${index}`}
                                    placeholder="Type or select SKU…"
                                    value={line.sku}
                                    onChange={e => {
                                        const val = e.target.value;
                                        onChange(index, 'sku', val);
                                        const match = products.find(p => p.sku === val);
                                        if (match && !line.name) onChange(index, 'name', match.name);
                                    }}
                                    autoComplete="off"
                                    style={{ width: '100%', fontSize: '13px', padding: '6px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                                <datalist id={`line-sku-list-${index}`}>
                                    {products.map(p => <option key={p.id} value={p.sku}>{p.name}</option>)}
                                </datalist>
                            </>
                        ) : (
                            <span style={{ fontFamily: "'DM Mono', 'Courier New', monospace", color: '#3b82f6', fontSize: '12px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'all', cursor: 'text' }}>
                                {line.sku || 'N/A'}
                            </span>
                        )}
                    </td>

                    {/* Product */}
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                        {mode === 'manual' ? (
                            <input
                                type="text"
                                placeholder="Product Name..."
                                value={line.name}
                                onChange={e => onChange(index, 'name', e.target.value)}
                                style={{ width: '100%', fontSize: '13px', padding: '6px', border: '1px solid var(--color-border)', borderRadius: '4px', fontWeight: 500 }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13px' }}>{line.name}</span>
                                {line.lotTracked && (
                                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>LOT TRACKED</span>
                                )}
                            </div>
                        )}
                    </td>

                    {/* Expected */}
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                        {(mode === 'po' || mode === 'bulk') && line.expectedQty !== null ? (
                            <span style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 500 }}>{line.expectedQty} {line.unit}</span>
                        ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>—</span>
                        )}
                    </td>

                    {/* Received */}
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                        <input
                            type="number" min="0" placeholder="Qty"
                            value={line.receivedQty}
                            onChange={e => {
                                const val = e.target.value;
                                onChange(index, 'receivedQty', val);
                                if ((mode === 'po' || mode === 'bulk') && line.expectedQty !== null) {
                                    const parsed = parseInt(val);
                                    if (val === '' || (!isNaN(parsed) && parsed === line.expectedQty)) {
                                        onChange(index, 'discrepancyAction', null);
                                        onChange(index, 'discrepancyNote', '');
                                    }
                                }
                            }}
                            style={{
                                width: '100%', minWidth: 0, fontSize: '13px', fontWeight: 600,
                                padding: '5px 4px',
                                border: hasDiscrepancy ? '2px solid var(--color-status-expired)' : '1px solid var(--color-border)',
                                borderRadius: '6px', outline: 'none', textAlign: 'center', boxSizing: 'border-box'
                            }}
                            onFocus={e => (e.target.style.borderColor = hasDiscrepancy ? 'var(--color-status-expired)' : 'var(--color-primary)')}
                            onBlur={e => (e.target.style.borderColor = hasDiscrepancy ? 'var(--color-status-expired)' : 'var(--color-border)')}
                        />
                    </td>

                    {/* Lot # */}
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                        {line.lotTracked || mode === 'manual' ? (
                            <input
                                type="text"
                                placeholder={line.lotTracked ? 'Lot # *' : 'Lot #'}
                                required={line.lotTracked}
                                value={line.lot}
                                onChange={e => onChange(index, 'lot', e.target.value)}
                                style={{
                                    width: '100%', fontSize: '13px', padding: '6px',
                                    border: (line.lotTracked && !line.lot && parsedQty > 0)
                                        ? '1px solid var(--color-status-expired)'
                                        : '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    fontFamily: "'DM Mono', 'Courier New', monospace"
                                }}
                            />
                        ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>—</span>
                        )}
                    </td>

                    {/* Exp Date */}
                    <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
                        {line.lotTracked || mode === 'manual' ? (
                            <input
                                type="date"
                                required={line.lotTracked}
                                value={line.expDate}
                                onChange={e => onChange(index, 'expDate', e.target.value)}
                                style={{
                                    width: '100%', minWidth: 0, fontSize: '12px', padding: '5px 4px',
                                    border: (line.lotTracked && !line.expDate && parsedQty > 0)
                                        ? '1px solid var(--color-status-expired)'
                                        : '1px solid var(--color-border)',
                                    borderRadius: '4px', boxSizing: 'border-box'
                                }}
                            />
                        ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>—</span>
                        )}
                    </td>

                    {/* Remove button (manual mode only) */}
                    {mode === 'manual' && onRemove && (
                        <td style={{ padding: '8px 4px', verticalAlign: 'middle', width: '36px' }}>
                            <button
                                onClick={() => onRemove(index)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                onMouseOver={e => { e.currentTarget.style.color = 'var(--color-status-expired)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    )}
                </tr>

                {/* Discrepancy sub-row */}
                {hasDiscrepancy && (
                    <tr>
                        <td colSpan={colSpan} style={{ padding: 0, border: 'none' }}>
                            <div style={{
                                background: 'rgba(239,68,68,0.04)', borderLeft: '3px solid var(--color-status-expired)',
                                borderBottom: '1px solid var(--color-border)', padding: '12px 16px',
                                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-status-expired)', fontWeight: 600, fontSize: '13px' }}>
                                    <AlertCircle size={16} />
                                    {deltaStr} units vs expected
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="radio" checked={line.discrepancyAction === 'accept'} onChange={() => onChange(index, 'discrepancyAction', 'accept')} style={{ accentColor: 'var(--color-status-good)' }} />
                                        Accept
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="radio" checked={line.discrepancyAction === 'flag'} onChange={() => onChange(index, 'discrepancyAction', 'flag')} style={{ accentColor: 'var(--color-status-reserved)' }} />
                                        Flag
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="radio" checked={line.discrepancyAction === 'reject'} onChange={() => onChange(index, 'discrepancyAction', 'reject')} style={{ accentColor: 'var(--color-status-expired)' }} />
                                        Reject
                                    </label>
                                </div>
                                <div style={{ flex: 1, minWidth: '160px' }}>
                                    <input
                                        type="text"
                                        placeholder="Note regarding discrepancy..."
                                        value={line.discrepancyNote}
                                        onChange={e => onChange(index, 'discrepancyNote', e.target.value)}
                                        style={{
                                            width: '100%', fontSize: '13px', padding: '6px 8px',
                                            border: '1px solid var(--color-status-expired)', borderRadius: '4px',
                                            background: 'var(--color-white)', outlineColor: 'var(--color-status-expired)'
                                        }}
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    }

    // ── PUT AWAY STEP ───────────────────────────────────────────────────────
    const hasLocation = !!line.locationOverride;
    const splitTotal = line.locationSplits.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
    const remainingQty = parsedQty - splitTotal;
    const isOverSplit = splitTotal > parsedQty;

    const handleAddSplit = () => {
        const newSplit: LocationSplit = { id: `split-${Date.now()}`, location: locations[0] || '', qty: '' };
        onChange(index, 'locationSplits', [...line.locationSplits, newSplit]);
    };

    const handleRemoveSplit = (splitId: string) => {
        onChange(index, 'locationSplits', line.locationSplits.filter(s => s.id !== splitId));
    };

    const handleSplitChange = (splitId: string, field: 'location' | 'qty', value: string | number) => {
        onChange(index, 'locationSplits', line.locationSplits.map(s => s.id === splitId ? { ...s, [field]: value } : s));
    };

    return (
        <React.Fragment>
            <tr
                style={{
                    background: 'var(--color-bg-light)',
                    borderBottom: line.locationSplits.length > 0 ? 'none' : '1px solid var(--color-border)',
                    borderLeft: isOverSplit ? '3px solid var(--color-status-expired)' : hasLocation ? '3px solid var(--color-status-good)' : '3px solid var(--color-border)',
                    transition: 'background-color 0.15s ease'
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-light)')}
            >
                {/* SKU */}
                <td style={{ padding: '10px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                    <span style={{ fontFamily: "'DM Mono', 'Courier New', monospace", color: '#3b82f6', fontSize: '12px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {line.sku || 'N/A'}
                    </span>
                </td>

                {/* Product */}
                <td style={{ padding: '10px 10px', verticalAlign: 'middle', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13px' }}>{line.name}</span>
                        {line.lotTracked && (
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>LOT TRACKED</span>
                        )}
                    </div>
                </td>

                {/* Qty (read-only) */}
                <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                    {line.locationSplits.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: isOverSplit ? 'var(--color-status-expired)' : 'var(--color-text-main)' }}>
                                {line.receivedQty} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-text-muted)' }}>{line.unit}</span>
                            </span>
                            <span style={{ fontSize: '11px', color: isOverSplit ? 'var(--color-status-expired)' : 'var(--color-text-muted)', fontWeight: isOverSplit ? 700 : 400 }}>
                                {isOverSplit ? `Over by ${splitTotal - parsedQty}` : `${remainingQty} here`}
                            </span>
                        </div>
                    ) : (
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {line.receivedQty} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-text-muted)' }}>{line.unit}</span>
                        </span>
                    )}
                </td>

                {/* Lot # (read-only) */}
                <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                    {line.lot ? (
                        <span style={{ fontFamily: "'DM Mono', 'Courier New', monospace", fontSize: '12px', color: 'var(--color-text-main)' }}>{line.lot}</span>
                    ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>—</span>
                    )}
                </td>

                {/* Exp Date (read-only) */}
                <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                    {line.expDate ? (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-main)' }}>
                            {new Date(line.expDate + 'T00:00:00').toLocaleDateString()}
                        </span>
                    ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>—</span>
                    )}
                </td>

                {/* Location (editable) */}
                <td style={{ padding: '10px 10px', verticalAlign: 'middle' }}>
                    <select
                        value={line.locationOverride || ''}
                        onChange={e => onChange(index, 'locationOverride', e.target.value || undefined)}
                        style={{
                            width: '100%', fontSize: '13px', padding: '6px 8px',
                            border: hasLocation ? '1px solid var(--color-status-good)' : '1px solid var(--color-status-expired)',
                            borderRadius: '6px', background: 'var(--color-white)',
                            color: hasLocation ? 'var(--color-text-main)' : 'var(--color-status-expired)',
                            outline: 'none', cursor: 'pointer', fontWeight: hasLocation ? 500 : 400
                        }}
                    >
                        <option value="">Select location... *</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddSplit}
                        style={{
                            marginTop: '4px', background: 'none', border: 'none', padding: 0,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '3px', fontSize: '11px', color: 'var(--color-text-muted)'
                        }}
                        onMouseOver={e => (e.currentTarget.style.color = '#3B82F6')}
                        onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                    >
                        <GitBranch size={10} /> Split
                    </button>
                </td>
            </tr>

            {/* Split rows */}
            {line.locationSplits.map((split, splitIdx) => {
                const isLastSplit = splitIdx === line.locationSplits.length - 1;
                return (
                    <tr key={split.id} style={{
                        background: 'rgba(59,130,246,0.03)',
                        borderBottom: isLastSplit ? '1px solid var(--color-border)' : 'none',
                        borderLeft: '3px solid #3B82F6'
                    }}>
                        <td style={{ padding: '6px 10px', textAlign: 'center', color: '#93C5FD', fontSize: '14px', verticalAlign: 'middle' }}>↳</td>
                        <td></td>
                        {/* Qty input for split */}
                        <td style={{ padding: '6px 10px', verticalAlign: 'middle' }}>
                            <input
                                type="number" min="0" placeholder="Qty"
                                value={split.qty}
                                onChange={e => handleSplitChange(split.id, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                                style={{
                                    width: '100%', minWidth: 0, fontSize: '13px', fontWeight: 600,
                                    padding: '5px 4px', border: '1px solid #93C5FD', borderRadius: '6px',
                                    textAlign: 'center', outline: 'none', boxSizing: 'border-box'
                                }}
                                onFocus={e => (e.target.style.borderColor = '#3B82F6')}
                                onBlur={e => (e.target.style.borderColor = '#93C5FD')}
                            />
                        </td>
                        <td></td>
                        <td></td>
                        {/* Split location + remove */}
                        <td style={{ padding: '6px 10px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <select
                                    value={split.location}
                                    onChange={e => handleSplitChange(split.id, 'location', e.target.value)}
                                    style={{
                                        flex: 1, fontSize: '12px', padding: '5px 6px',
                                        border: '1px solid #93C5FD', borderRadius: '4px',
                                        background: 'var(--color-white)', outline: 'none', cursor: 'pointer'
                                    }}
                                >
                                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                                <button
                                    onClick={() => handleRemoveSplit(split.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#93C5FD', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                    onMouseOver={e => { e.currentTarget.style.color = 'var(--color-status-expired)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                                    onMouseOut={e => { e.currentTarget.style.color = '#93C5FD'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                );
            })}
        </React.Fragment>
    );
};

export default LineItemRow;
