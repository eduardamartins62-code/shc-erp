import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ArrowLeftRight, FileText, Activity } from 'lucide-react';
import AdjustStockTab from '../components/movements/AdjustStockTab';
import TransferStockTab from '../components/movements/TransferStockTab';

import MovementHistoryTab from '../components/movements/MovementHistoryTab';

const InventoryMovements: React.FC = () => {
    const { movements } = useInventory();
    const [activeTab, setActiveTab] = useState<'adjust' | 'transfer' | 'history'>('adjust');

    // Metrics calculation
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMovements = movements.filter(m => new Date(m.createdAt) > thirtyDaysAgo);

    const totalMovements = recentMovements.length;
    const totalAdjustments = recentMovements.filter(m => m.movementType === 'ADJUST').length;
    const totalTransfers = recentMovements.filter(m => m.movementType === 'TRANSFER').length;

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header section (already handled by Layout generally, but we'll add page-specific titles) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Inventory Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Inventory Movements
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Adjust, transfer, and receive stock with full audit history.
                    </p>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid-3">
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Movements (Last 30 Days)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        {totalMovements}
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Adjustments (Last 30 Days)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-shc-red)' }}>
                        {totalAdjustments}
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Transfers (Last 30 Days)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>
                        {totalTransfers}
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)' }}>
                    <button
                        onClick={() => setActiveTab('adjust')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            backgroundColor: activeTab === 'adjust' ? 'var(--color-white)' : 'transparent',
                            color: activeTab === 'adjust' ? 'var(--color-shc-red)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === 'adjust' ? 600 : 500,
                            borderBottom: activeTab === 'adjust' ? '2px solid var(--color-shc-red)' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FileText size={18} />
                        Adjust Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('transfer')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            backgroundColor: activeTab === 'transfer' ? 'var(--color-white)' : 'transparent',
                            color: activeTab === 'transfer' ? '#3b82f6' : 'var(--color-text-muted)',
                            fontWeight: activeTab === 'transfer' ? 600 : 500,
                            borderBottom: activeTab === 'transfer' ? '2px solid #3b82f6' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeftRight size={18} />
                        Transfer Stock
                    </button>

                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            backgroundColor: activeTab === 'history' ? 'var(--color-white)' : 'transparent',
                            color: activeTab === 'history' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === 'history' ? 600 : 500,
                            borderBottom: activeTab === 'history' ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Activity size={18} />
                        Movement History
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '1.5rem' }}>
                    {activeTab === 'adjust' && <AdjustStockTab />}
                    {activeTab === 'transfer' && <TransferStockTab />}

                    {activeTab === 'history' && <MovementHistoryTab movements={movements} />}
                </div>

            </div>
        </div>
    );
};

export default InventoryMovements;
