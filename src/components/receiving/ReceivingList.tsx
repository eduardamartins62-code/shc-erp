import React, { useState, useMemo } from 'react';
import type { PurchaseOrder } from '../../types/receiving';
import { Plus, Search, Loader2, X, Printer, PauseCircle, PlayCircle, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SlideOverPanel } from '../ui/SlideOverPanel';

interface ReceivingListProps {
    pos: PurchaseOrder[];
    loading: boolean;
    onStartPO: (po: PurchaseOrder) => void;
    onStartManual: () => void;
    onStartBulk: () => void;
    selectedPOIds: Set<string>;
    setSelectedPOIds: (ids: Set<string>) => void;
    drawerPO: PurchaseOrder | null;
    setDrawerPO: (po: PurchaseOrder | null) => void;
    onPrintSingle: (po: PurchaseOrder) => void;
    onPrintMultiple: (ids: Set<string>) => void;
    onHoldPO: (po: PurchaseOrder) => void;
}

type Tab = 'pending' | 'received' | 'on_hold';

const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
        case 'pending':
            return <span className="badge badge-amber">PENDING</span>;
        case 'partial':
            return <span className="badge badge-amber">PARTIAL</span>;
        case 'overdue':
            return <span className="badge badge-red">OVERDUE</span>;
        case 'received':
            return <span className="badge badge-green">RECEIVED</span>;
        case 'on_hold':
            return <span className="badge" style={{ background: 'rgba(100,116,139,0.1)', color: '#475569', border: '1px solid #CBD5E1' }}>ON HOLD</span>;
    }
};

const ReceivingList: React.FC<ReceivingListProps> = ({
    pos, loading, onStartPO, onStartManual,
    onStartBulk, selectedPOIds, setSelectedPOIds,
    drawerPO, setDrawerPO, onPrintSingle, onPrintMultiple, onHoldPO
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [sortKey, setSortKey] = useState<'id' | 'supplier' | 'expectedDate' | 'items' | 'status' | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleColSort = (key: typeof sortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sortIcon = (key: typeof sortKey) => {
        if (sortKey !== key) return <ChevronsUpDown size={13} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />;
        return sortDir === 'asc'
            ? <ArrowUp size={13} style={{ color: '#fff', flexShrink: 0 }} />
            : <ArrowDown size={13} style={{ color: '#fff', flexShrink: 0 }} />;
    };

    const pendingPOs = useMemo(() => pos.filter(p => ['pending', 'overdue', 'partial'].includes(p.status)), [pos]);
    const receivedPOs = useMemo(() => pos.filter(p => p.status === 'received'), [pos]);
    const onHoldPOs = useMemo(() => pos.filter(p => p.status === 'on_hold'), [pos]);

    const tabPOs = activeTab === 'pending' ? pendingPOs : activeTab === 'received' ? receivedPOs : onHoldPOs;

    const filteredPOs = useMemo(() => {
        let result = tabPOs;

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase().trim();
            result = result.filter(p =>
                p.id.toLowerCase().includes(lower) ||
                p.supplier.toLowerCase().includes(lower) ||
                p.status.toLowerCase().includes(lower) ||
                new Date(p.expectedDate).toLocaleDateString().includes(lower) ||
                p.items.some(item =>
                    item.sku.toLowerCase().includes(lower) ||
                    item.name.toLowerCase().includes(lower) ||
                    (item.unit || '').toLowerCase().includes(lower)
                )
            );
        }

        if (sortKey) {
            result = [...result].sort((a, b) => {
                let aVal: string | number;
                let bVal: string | number;
                if (sortKey === 'expectedDate') {
                    aVal = new Date(a.expectedDate).getTime();
                    bVal = new Date(b.expectedDate).getTime();
                } else if (sortKey === 'items') {
                    aVal = a.items.length;
                    bVal = b.items.length;
                } else {
                    aVal = (a[sortKey] as string).toLowerCase();
                    bVal = (b[sortKey] as string).toLowerCase();
                }
                if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [tabPOs, searchTerm, sortKey, sortDir]);

    const tabStyle = (tab: Tab) => ({
        background: 'none',
        border: 'none',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontWeight: activeTab === tab ? 600 : 400,
        color: activeTab === tab ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
        borderBottom: activeTab === tab ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
        marginBottom: '-9px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '14px',
        whiteSpace: 'nowrap' as const
    });

    const countBadge = (n: number) => (
        <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#1e293b' }}>{n}</span>
    );

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Warehouse Operations
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Receiving
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Process inbound shipments against purchase orders or manually.
                    </p>
                </div>
                <button className="btn-primary" onClick={onStartManual}>
                    <Plus size={18} />
                    Manual Receiving
                </button>
            </div>

            {/* PO Table with Tabs */}
            <div className="table-container">
                {/* Tab bar + search */}
                <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => setActiveTab('pending')} style={tabStyle('pending')}>
                            Pending POs {countBadge(pendingPOs.length)}
                        </button>
                        <button onClick={() => setActiveTab('received')} style={tabStyle('received')}>
                            Received {countBadge(receivedPOs.length)}
                        </button>
                        <button onClick={() => setActiveTab('on_hold')} style={tabStyle('on_hold')}>
                            On Hold {countBadge(onHoldPOs.length)}
                        </button>
                    </div>
                    <div style={{ position: 'relative', width: '260px', padding: '12px 0' }}>
                        <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '22px' }} />
                        <input
                            type="text"
                            placeholder="Search PO, supplier, item name, SKU…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Loader2 size={32} color="var(--color-shc-red)" className="animate-spin" />
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {activeTab === 'pending' && (
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={filteredPOs.length > 0 && selectedPOIds.size === filteredPOs.length}
                                            ref={(input) => {
                                                if (input) {
                                                    input.indeterminate = selectedPOIds.size > 0 && selectedPOIds.size < filteredPOs.length;
                                                }
                                            }}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedPOIds(new Set(filteredPOs.map(p => p.id)));
                                                else setSelectedPOIds(new Set());
                                            }}
                                            style={{ accentColor: '#3B82F6', width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                    </th>
                                )}
                                {(['id', 'supplier', 'expectedDate', 'items', 'status'] as const).map((key, i) => {
                                    const labels: Record<string, string> = { id: 'PO Number', supplier: 'Supplier', expectedDate: 'Expected', items: 'Items', status: 'Status' };
                                    return (
                                        <th
                                            key={key}
                                            onClick={() => handleColSort(key)}
                                            style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                                            title={sortKey === key ? (sortDir === 'asc' ? 'A → Z (click for Z → A)' : 'Z → A (click to reset)') : 'Click to sort'}
                                        >
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {labels[key]}
                                                {sortIcon(key)}
                                            </div>
                                        </th>
                                    );
                                })}
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'pending' ? 7 : 6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px' }}>
                                        {activeTab === 'pending' && 'No pending purchase orders.'}
                                        {activeTab === 'received' && 'No received POs yet.'}
                                        {activeTab === 'on_hold' && 'No POs on hold.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredPOs.map((po) => {
                                    const isSelected = selectedPOIds.has(po.id);
                                    return (
                                        <tr
                                            key={po.id}
                                            className="po-row"
                                            style={isSelected ? { backgroundColor: 'rgba(59,130,246,0.06)', borderLeft: '3px solid #3B82F6' } : {}}
                                        >
                                            {activeTab === 'pending' && (
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedPOIds);
                                                            if (e.target.checked) newSet.add(po.id);
                                                            else newSet.delete(po.id);
                                                            setSelectedPOIds(newSet);
                                                        }}
                                                        style={{ accentColor: '#3B82F6', width: '16px', height: '16px', cursor: 'pointer' }}
                                                    />
                                                </td>
                                            )}
                                            <td style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                                                <span
                                                    style={{ color: '#60A5FA', textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}
                                                    onClick={(e) => { e.stopPropagation(); setDrawerPO(po); }}
                                                    onMouseOver={(e) => (e.currentTarget.style.color = '#93C5FD')}
                                                    onMouseOut={(e) => (e.currentTarget.style.color = '#60A5FA')}
                                                >
                                                    {po.id}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{po.supplier}</td>
                                            <td>{new Date(po.expectedDate).toLocaleDateString()}</td>
                                            <td>{po.items.length}</td>
                                            <td>{getStatusBadge(po.status)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {activeTab === 'pending' && (
                                                        <button className="btn-secondary" onClick={() => onStartPO(po)}>
                                                            Receive
                                                        </button>
                                                    )}
                                                    {activeTab === 'on_hold' && (
                                                        <button className="btn-secondary" onClick={() => onStartPO(po)}>
                                                            Receive
                                                        </button>
                                                    )}
                                                    {(activeTab === 'pending' || activeTab === 'on_hold') && (
                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() => onHoldPO(po)}
                                                            title={po.status === 'on_hold' ? 'Remove hold' : 'Put on hold'}
                                                            style={{ padding: '6px 10px' }}
                                                        >
                                                            {po.status === 'on_hold'
                                                                ? <PlayCircle size={15} />
                                                                : <PauseCircle size={15} />
                                                            }
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Bulk Action Toolbar */}
            {selectedPOIds.size > 0 && (
                <div style={{
                    position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
                    background: '#0D1117', border: '1px solid #1F2937', borderRadius: '14px',
                    padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: '480px', zIndex: 40,
                    animation: 'slideUp 0.2s ease-out'
                }}>
                    <style>{`@keyframes slideUp { from { transform: translate(-50%, 12px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }`}</style>
                    <div style={{ background: '#3B82F6', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 700, color: 'white' }}>
                        {selectedPOIds.size} PO{selectedPOIds.size === 1 ? '' : 's'} selected
                    </div>
                    <div style={{ width: '1px', height: '20px', background: '#1F2937' }} />
                    <button
                        style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={onStartBulk}
                    >
                        Receive Selected &rarr;
                    </button>
                    <button
                        style={{ background: 'transparent', color: '#D1D5DB', border: 'none', padding: '6px 12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => onPrintMultiple(selectedPOIds)}
                    >
                        <Printer size={16} /> Print Selected
                    </button>
                    <div style={{ width: '1px', height: '20px', background: '#1F2937' }} />
                    <button
                        style={{ background: 'transparent', color: '#6B7280', border: 'none', padding: '6px 12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setSelectedPOIds(new Set())}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#F9FAFB')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#6B7280')}
                    >
                        <X size={16} /> Clear
                    </button>
                </div>
            )}

            {/* PO Detail Drawer */}
            <SlideOverPanel isOpen={!!drawerPO} onClose={() => setDrawerPO(null)} title="" hideHeader={true}>
                {drawerPO && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'DM Mono', 'Courier New', monospace", color: '#60A5FA' }}>
                                    {drawerPO.id}
                                </div>
                                <button onClick={() => setDrawerPO(null)} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                {getStatusBadge(drawerPO.status)}
                                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{drawerPO.supplier}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                Expected: {new Date(drawerPO.expectedDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Supplier', value: drawerPO.supplier },
                                { label: 'Expected Date', value: new Date(drawerPO.expectedDate).toLocaleDateString() },
                                { label: 'PO Status', value: getStatusBadge(drawerPO.status) },
                                { label: 'Total Items', value: drawerPO.items.length },
                                { label: 'Total Units Expected', value: drawerPO.items.reduce((s, i) => s + i.expectedQty, 0) },
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>{row.label}</span>
                                    <span style={{ color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 500 }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                Line Items
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        {(['SKU', 'Product', 'Qty', 'Unit', 'Lot Tracked'] as const).map(h => (
                                            <th key={h} style={{ textAlign: h === 'Qty' ? 'right' : h === 'Unit' || h === 'Lot Tracked' ? 'center' : 'left', paddingBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {drawerPO.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '8px 0', fontFamily: 'monospace', color: 'var(--color-primary-dark)' }}>{item.sku}</td>
                                            <td style={{ padding: '8px 0' }}>{item.name}</td>
                                            <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>{item.expectedQty}</td>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-muted)', textAlign: 'center' }}>{item.unit}</td>
                                            <td style={{ padding: '8px 0', textAlign: 'center' }}>
                                                {item.lotTracked
                                                    ? <span style={{ background: 'rgba(168,85,247,0.1)', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>YES</span>
                                                    : <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '24px' }}>
                            {drawerPO.status !== 'received' && (
                                <button
                                    style={{ width: '100%', background: '#3B82F6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                                    onClick={() => { setDrawerPO(null); onStartPO(drawerPO); }}
                                >
                                    Receive This PO &rarr;
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    style={{ flex: 1, background: 'transparent', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={() => onPrintSingle(drawerPO)}
                                >
                                    <Printer size={16} /> Print PO
                                </button>
                                {drawerPO.status !== 'received' && (
                                    <button
                                        style={{ flex: 1, background: 'transparent', color: drawerPO.status === 'on_hold' ? 'var(--color-status-good)' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onClick={() => { onHoldPO(drawerPO); setDrawerPO(null); }}
                                    >
                                        {drawerPO.status === 'on_hold' ? <><PlayCircle size={16} /> Remove Hold</> : <><PauseCircle size={16} /> Put on Hold</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SlideOverPanel>
        </div>
    );
};

export default ReceivingList;
