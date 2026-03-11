import React from 'react';
import { X, Download, Archive, Edit2, ArrowRightLeft, CheckCircle, Printer, CloudOff, RefreshCw, XCircle, ShoppingCart } from 'lucide-react';

export type BulkModuleType = 'products' | 'inventory' | 'orders' | 'locations' | 'movements' | 'purchase_orders' | 'integrations';

interface BulkActionBarProps {
    selectedCount: number;
    module: BulkModuleType;
    onClearSelection: () => void;
    onAction?: (action: string) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, module, onClearSelection, onAction }) => {
    if (selectedCount === 0) return null;

    const renderActions = () => {
        switch (module) {
            case 'products':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => onAction && onAction('deactivate')}>
                            <Archive size={14} /> Deactivate
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => onAction && onAction('export')}>
                            <Download size={14} /> Export Selected
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-shc-red)' }} onClick={() => onAction && onAction('delete')}>
                            <XCircle size={14} /> Delete
                        </button>
                    </>
                );
            case 'inventory':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Edit2 size={14} /> Adjust Selected
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Download size={14} /> Export
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <ArrowRightLeft size={14} /> Move Stock
                        </button>
                    </>
                );
            case 'orders':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <CheckCircle size={14} /> Mark as Received
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Download size={14} /> Export
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-shc-red)' }}>
                            <XCircle size={14} /> Cancel Selected
                        </button>
                    </>
                );
            case 'locations':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Printer size={14} /> Print Labels
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Download size={14} /> Export
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-warning)' }}>
                            <CloudOff size={14} /> Deactivate Selected
                        </button>
                    </>
                );
            case 'movements':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Download size={14} /> Export Selected
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Printer size={14} /> Print Selected
                        </button>
                    </>
                );
            case 'purchase_orders':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Download size={14} /> Export
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-shc-red)' }}>
                            <XCircle size={14} /> Cancel Selected
                        </button>
                    </>
                );
            case 'integrations':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <Download size={14} /> Import Selected
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            <RefreshCw size={14} /> Sync Selected
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-warning)' }}>
                            <CloudOff size={14} /> Unlink Selected
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    const renderLabel = () => {
        if (module === 'products') return `${selectedCount} products selected`;
        if (module === 'orders') return `${selectedCount} orders selected`;
        return `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`;
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '0',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{renderLabel()}</span>
                <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                    {renderActions()}
                </div>
            </div>
            <button
                onClick={onClearSelection}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem'
                }}
                title="Clear Selection"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default BulkActionBar;
