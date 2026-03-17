"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Archive, Edit2, ArrowRightLeft, CheckCircle, Printer, CloudOff, RefreshCw, XCircle, Tag, ChevronDown, Package } from 'lucide-react';
import type { OrderTag } from '../../types/tags';

export type BulkModuleType = 'products' | 'inventory' | 'orders' | 'locations' | 'movements' | 'purchase_orders' | 'integrations';

interface BulkActionBarProps {
    selectedCount: number;
    module: BulkModuleType;
    onClearSelection: () => void;
    onAction?: (action: string) => void;
    // orders-specific
    availableTags?: OrderTag[];
    onBulkAddTag?: (tagId: string) => Promise<void>;
    onBulkRemoveTag?: (tagId: string) => Promise<void>;
    onBulkPickPack?: () => void;
}

// Dropdown that closes on outside click
function useOutsideClose(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [ref, cb]);
}

const TagDropdown: React.FC<{
    tags: OrderTag[];
    onAddTag: (id: string) => Promise<void>;
    onRemoveTag: (id: string) => Promise<void>;
}> = ({ tags, onAddTag, onRemoveTag }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [mode, setMode] = useState<'add' | 'remove'>('add');
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClose(ref, () => setOpen(false));

    const handle = async (tagId: string) => {
        setLoading(tagId);
        try {
            if (mode === 'add') await onAddTag(tagId);
            else await onRemoveTag(tagId);
        } finally {
            setLoading(null);
            setOpen(false);
        }
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                className="btn-secondary"
                onClick={() => setOpen(o => !o)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
                <Tag size={14} /> Tag <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    backgroundColor: '#fff', borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                    zIndex: 300, minWidth: '210px'
                }}>
                    {/* Add / Remove toggle */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0.4rem' }}>
                        {(['add', 'remove'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                style={{
                                    flex: 1, border: 'none', borderRadius: '6px', padding: '0.3rem',
                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                    backgroundColor: mode === m ? 'var(--color-primary-dark)' : 'transparent',
                                    color: mode === m ? '#fff' : 'var(--color-text-muted)'
                                }}
                            >
                                {m === 'add' ? 'Add Tag' : 'Remove Tag'}
                            </button>
                        ))}
                    </div>

                    {tags.length === 0 ? (
                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No tags created yet</div>
                    ) : (
                        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                            {tags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => handle(tag.id)}
                                    disabled={loading === tag.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        width: '100%', padding: '0.5rem 0.85rem',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '0.83rem', color: 'var(--color-text-main)',
                                        borderBottom: '1px solid #f1f5f9',
                                        opacity: loading === tag.id ? 0.5 : 1,
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        backgroundColor: tag.color, flexShrink: 0,
                                        border: '1.5px solid rgba(0,0,0,0.1)'
                                    }} />
                                    <span style={{
                                        display: 'inline-block', backgroundColor: tag.color + '22',
                                        border: `1px solid ${tag.color}55`, borderRadius: '10px',
                                        padding: '0.1rem 0.5rem', fontSize: '0.78rem', fontWeight: 600,
                                        color: tag.color
                                    }}>
                                        {tag.name}
                                    </span>
                                    {loading === tag.id && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>…</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount, module, onClearSelection, onAction,
    availableTags, onBulkAddTag, onBulkRemoveTag, onBulkPickPack
}) => {
    if (selectedCount === 0) return null;

    const renderActions = () => {
        switch (module) {
            case 'products':
                return (
                    <>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => onAction?.('deactivate')}>
                            <Archive size={14} /> Deactivate
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => onAction?.('export')}>
                            <Download size={14} /> Export Selected
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-shc-red)' }} onClick={() => onAction?.('delete')}>
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
                        {onBulkPickPack && (
                            <button
                                className="btn-primary"
                                style={{ padding: '0.25rem 0.65rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                onClick={onBulkPickPack}
                            >
                                <Package size={14} /> Pick &amp; Pack
                            </button>
                        )}
                        {availableTags && onBulkAddTag && onBulkRemoveTag && (
                            <TagDropdown
                                tags={availableTags}
                                onAddTag={onBulkAddTag}
                                onRemoveTag={onBulkRemoveTag}
                            />
                        )}
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => onAction?.('export')}>
                            <Download size={14} /> Export
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-shc-red)' }} onClick={() => onAction?.('cancel')}>
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
        if (module === 'orders') return `${selectedCount} order${selectedCount !== 1 ? 's' : ''} selected`;
        return `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`;
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#f0f7ff',
            borderBottom: '1px solid #bfdbfe',
            color: 'var(--color-text-main)',
            borderRadius: '8px 8px 0 0',
            marginBottom: '0',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1d4ed8' }}>{renderLabel()}</span>
                <div style={{ paddingLeft: '1rem', borderLeft: '1px solid #bfdbfe', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {renderActions()}
                </div>
            </div>
            <button
                onClick={onClearSelection}
                style={{
                    background: 'none', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem'
                }}
                title="Clear Selection"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default BulkActionBar;
