import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ArrowLeftRight, FileText, Activity, Plus, Minus } from 'lucide-react';
import AdjustStockTab from '../components/movements/AdjustStockTab';
import TransferStockTab from '../components/movements/TransferStockTab';
import MovementHistoryTab from '../components/movements/MovementHistoryTab';

type AdjustMode = 'Add' | 'Remove';

const InventoryMovements: React.FC = () => {
    const { movements } = useInventory();
    const [activeTab, setActiveTab] = useState<'adjust' | 'transfer' | 'history'>('adjust');
    const [adjustMode, setAdjustMode] = useState<AdjustMode>('Add');

    // Metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMovements = movements.filter(m => new Date(m.createdAt) > thirtyDaysAgo);
    const totalMovements = recentMovements.length;
    const totalAdjustments = recentMovements.filter(m => m.movementType === 'ADJUST').length;
    const totalTransfers = recentMovements.filter(m => m.movementType === 'TRANSFER').length;

    const handleAddStock = () => { setAdjustMode('Add'); setActiveTab('adjust'); };
    const handleRemoveStock = () => { setAdjustMode('Remove'); setActiveTab('adjust'); };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Inventory Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Adjustments
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Add, remove, and transfer stock with full audit history.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    <button
                        className="btn-secondary"
                        onClick={handleRemoveStock}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <Minus size={16} /> Remove Stock
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleAddStock}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <Plus size={16} /> Add Stock
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid-3">
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Movements (Last 30 Days)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{totalMovements}</div>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Adjustments (Last 30 Days)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-shc-red)' }}>{totalAdjustments}</div>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Transfers (Last 30 Days)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>{totalTransfers}</div>
                </div>
            </div>

            {/* Tab card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-light)' }}>
                    {([
                        { id: 'adjust', label: 'Adjust Inventory', icon: <FileText size={18} />, color: 'var(--color-shc-red)' },
                        { id: 'transfer', label: 'Transfer Stock', icon: <ArrowLeftRight size={18} />, color: '#3b82f6' },
                        { id: 'history', label: 'Movement History', icon: <Activity size={18} />, color: 'var(--color-primary-dark)' },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, padding: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                border: 'none',
                                backgroundColor: activeTab === tab.id ? 'var(--color-white)' : 'transparent',
                                color: activeTab === tab.id ? tab.color : 'var(--color-text-muted)',
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {activeTab === 'adjust' && <AdjustStockTab defaultMode={adjustMode} onModeChange={setAdjustMode} />}
                    {activeTab === 'transfer' && <TransferStockTab />}
                    {activeTab === 'history' && <MovementHistoryTab movements={movements} />}
                </div>
            </div>
        </div>
    );
};

export default InventoryMovements;
