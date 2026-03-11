import React, { useState, useMemo } from 'react';
import type { PurchaseOrder } from '../../types/receiving';
import { Plus, Search, Loader2, X, Printer } from 'lucide-react';
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
}

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
    }
};

const ReceivingList: React.FC<ReceivingListProps> = ({
    pos, loading, onStartPO, onStartManual,
    onStartBulk, selectedPOIds, setSelectedPOIds,
    drawerPO, setDrawerPO, onPrintSingle, onPrintMultiple
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const stats = useMemo(() => {
        return {
            open: pos.filter(p => p.status === 'pending').length,
            overdue: pos.filter(p => p.status === 'overdue').length,
            partial: pos.filter(p => p.status === 'partial').length,
            total: pos.length
        };
    }, [pos]);

    const filteredPOs = useMemo(() => {
        if (!searchTerm) return pos;
        const lower = searchTerm.toLowerCase();
        return pos.filter(p => p.id.toLowerCase().includes(lower) || p.supplier.toLowerCase().includes(lower));
    }, [pos, searchTerm]);

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
                <button
                    className="btn-primary"
                    onClick={onStartManual}
                >
                    <Plus size={18} />
                    Manual Receiving
                </button>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Open POs', value: stats.open, color: 'var(--color-status-reserved)' },
                    { label: 'Overdue', value: stats.overdue, color: 'var(--color-status-expired)' },
                    { label: 'Partial', value: stats.partial, color: 'var(--color-status-reserved)' },
                    { label: 'Total POs', value: stats.total, color: 'var(--color-text-main)' }
                ].map((stat, i) => (
                    <div key={i} className="card">
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* PO Table Panel */}
            <div className="table-container">
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                        Purchase Orders
                    </h2>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                        <input
                            type="text"
                            placeholder="Search PO number or supplier..."
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
                        {/* Header Row */}
                        <thead>
                            <tr>
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
                                            if (e.target.checked) {
                                                setSelectedPOIds(new Set(filteredPOs.map(p => p.id)));
                                            } else {
                                                setSelectedPOIds(new Set());
                                            }
                                        }}
                                        style={{ accentColor: '#3B82F6', width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                </th>
                                <th>PO Number</th>
                                <th>Supplier</th>
                                <th>Expected</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        {/* Data Rows */}
                        <tbody>
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center' }}>
                                        No purchase orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPOs.map((po) => {
                                    const isSelected = selectedPOIds.has(po.id);
                                    return (
                                        <tr key={po.id} className="po-row" style={isSelected ? {
                                            backgroundColor: 'rgba(59, 130, 246, 0.06)',
                                            borderLeft: '3px solid #3B82F6'
                                        } : {}}>
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
                                            <td style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                                                <span
                                                    style={{ color: '#60A5FA', textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}
                                                    onClick={(e) => { e.stopPropagation(); setDrawerPO(po); }}
                                                    onMouseOver={(e) => e.currentTarget.style.color = '#93C5FD'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = '#60A5FA'}
                                                >
                                                    {po.id}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{po.supplier}</td>
                                            <td>{new Date(po.expectedDate).toLocaleDateString()}</td>
                                            <td>{po.items.length}</td>
                                            <td>{getStatusBadge(po.status)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => onStartPO(po)}
                                                >
                                                    Receive
                                                </button>
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
                    position: 'fixed',
                    bottom: '28px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0D1117',
                    border: '1px solid #1F2937',
                    borderRadius: '14px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    minWidth: '480px',
                    zIndex: 40,
                    animation: 'slideUp 0.2s ease-out'
                }}>
                    <style>
                        {`
                        @keyframes slideUp {
                            from { transform: translate(-50%, 12px); opacity: 0; }
                            to { transform: translate(-50%, 0); opacity: 1; }
                        }
                        `}
                    </style>
                    <div style={{
                        background: '#3B82F6',
                        borderRadius: '8px',
                        padding: '4px 12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'white'
                    }}>
                        {selectedPOIds.size} PO{selectedPOIds.size === 1 ? '' : 's'} selected
                    </div>

                    <div style={{ width: '1px', height: '20px', background: '#1F2937' }}></div>

                    <button
                        style={{
                            background: '#3B82F6', color: 'white', border: 'none',
                            padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                        onClick={onStartBulk}
                    >
                        Receive Selected &rarr;
                    </button>

                    <button
                        style={{
                            background: 'transparent', color: '#D1D5DB', border: 'none',
                            padding: '6px 12px', fontSize: '14px', fontWeight: 500,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                        onClick={() => onPrintMultiple(selectedPOIds)}
                    >
                        <Printer size={16} /> Print Selected
                    </button>

                    <div style={{ width: '1px', height: '20px', background: '#1F2937' }}></div>

                    <button
                        style={{
                            background: 'transparent', color: '#6B7280', border: 'none',
                            padding: '6px 12px', fontSize: '14px', fontWeight: 500,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                        onClick={() => setSelectedPOIds(new Set())}
                        onMouseOver={(e) => e.currentTarget.style.color = '#F9FAFB'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
                    >
                        <X size={16} /> Clear
                    </button>
                </div>
            )}

            {/* PO Detail Drawer */}
            <SlideOverPanel
                isOpen={!!drawerPO}
                onClose={() => setDrawerPO(null)}
                title=""
                hideHeader={true}
            >
                {drawerPO && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '24px' }}>
                        {/* Drawer Header */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'DM Mono', 'Courier New', monospace", color: '#60A5FA' }}>
                                    {drawerPO.id}
                                </div>
                                <button
                                    onClick={() => setDrawerPO(null)}
                                    style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}
                                >
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

                        {/* Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Supplier', value: drawerPO.supplier },
                                { label: 'Expected Date', value: new Date(drawerPO.expectedDate).toLocaleDateString() },
                                { label: 'PO Status', value: getStatusBadge(drawerPO.status) },
                                { label: 'Total Items', value: drawerPO.items.length },
                                { label: 'Total Units Expected', value: drawerPO.items.reduce((s, i) => s + i.expectedQty, 0) },
                                { label: 'Created', value: new Date(drawerPO.expectedDate).toLocaleDateString() } // Mock
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>{row.label}</span>
                                    <span style={{ color: 'var(--color-text-main)', fontSize: '13px', fontWeight: 500 }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Line Items */}
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                Line Items
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', paddingBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>SKU</th>
                                        <th style={{ textAlign: 'left', paddingBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Product</th>
                                        <th style={{ textAlign: 'right', paddingBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Qty</th>
                                        <th style={{ textAlign: 'center', paddingBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Unit</th>
                                        <th style={{ textAlign: 'center', paddingBottom: '8px', color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Lot Tracked</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drawerPO.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '8px 0', fontFamily: 'monospace', color: 'var(--color-primary-dark)' }}>{item.sku}</td>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-main)' }}>{item.name}</td>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-dark)', fontWeight: 600, textAlign: 'right' }}>{item.expectedQty}</td>
                                            <td style={{ padding: '8px 0', color: 'var(--color-text-muted)', textAlign: 'center' }}>{item.unit}</td>
                                            <td style={{ padding: '8px 0', textAlign: 'center' }}>
                                                {item.lotTracked ? (
                                                    <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>YES</span>
                                                ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Drawer Actions */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '24px' }}>
                            <button
                                style={{
                                    width: '100%', background: '#3B82F6', color: 'white', border: 'none',
                                    padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                                }}
                                onClick={() => {
                                    setDrawerPO(null);
                                    onStartPO(drawerPO);
                                }}
                            >
                                Receive This PO &rarr;
                            </button>
                            <button
                                style={{
                                    width: '100%', background: 'transparent', color: 'var(--color-text-main)', border: '1px solid var(--color-border)',
                                    padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                                onClick={() => onPrintSingle(drawerPO)}
                            >
                                <Printer size={16} /> Print PO
                            </button>
                        </div>
                    </div>
                )}
            </SlideOverPanel>
        </div>
    );
};

export default ReceivingList;
