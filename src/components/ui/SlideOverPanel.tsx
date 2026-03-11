import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    hideHeader?: boolean;
}

export const SlideOverPanel: React.FC<SlideOverPanelProps> = ({ isOpen, onClose, title, children, actions, hideHeader }) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(30, 30, 30, 0.5)', // Match primary-dark modal background
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'opacity 0.3s ease-in-out'
        }}>
            <div
                style={{
                    position: 'absolute',
                    inset: 0
                }}
                onClick={onClose}
                aria-label="Close slide over"
            />

            <div style={{
                backgroundColor: 'var(--color-white)',
                width: '100%',
                maxWidth: '600px',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                animation: 'slideInRight 0.3s ease-out'
            }}>
                {/* Header */}
                {!hideHeader && (
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--color-primary-dark)',
                        color: 'var(--color-white)'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-white)', fontWeight: 600 }}>
                            {title}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {actions && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {actions}
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-white)',
                                    opacity: 0.8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.25rem',
                                    borderRadius: '4px'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-bg-light)'
                }}>
                    {children}
                </div>
            </div>

            <style>
                {`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}
            </style>
        </div>
    );
};
