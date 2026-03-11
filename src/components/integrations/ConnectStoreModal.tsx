import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ChannelEnum } from '../../types';

interface ConnectStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPlatform: (platform: ChannelEnum) => void;
}

// Brand data for the grid
const platforms: { name: ChannelEnum; logoUrl: string; description: string }[] = [
    { name: 'Shopify', logoUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-shopify-226579.png?f=webp', description: 'Connect your Shopify store.' },
    { name: 'Amazon', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg', description: 'Connect Amazon Seller Central.' },
    { name: 'WooCommerce', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/WooCommerce_logo.svg/1024px-WooCommerce_logo.svg.png', description: 'Connect WooCommerce.' },
    { name: 'eBay', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg', description: 'Connect eBay.' },
    { name: 'Etsy', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg', description: 'Connect Etsy.' },
    { name: 'BigCommerce', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/BigCommerce_logo.svg', description: 'Connect BigCommerce.' },
    { name: 'Magento', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Magento_logo.svg/1200px-Magento_logo.svg.png', description: 'Connect Magento.' },
    { name: 'Walmart', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Walmart_Spark.svg', description: 'Connect Walmart Marketplace.' },
    { name: 'TikTok', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', description: 'Connect TikTok Shop.' },
    { name: 'ShipStation', logoUrl: 'https://shipstation.github.io/api-docs/images/logo.png', description: 'Connect ShipStation for global fulfillment.' },
];

export const ConnectStoreModal: React.FC<ConnectStoreModalProps> = ({ isOpen, onClose, onSelectPlatform }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-bg-main)',
                width: '100%', maxWidth: '900px', maxHeight: '90vh',
                borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'white'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Connect a Store</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-muted)', padding: '0.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '4px'
                    }} title="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#fdfdfd' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search for stores and marketplaces"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                                border: '1px solid var(--color-border)', fontSize: '0.875rem',
                                outline: 'none', transition: 'border-color 0.2s',

                            }}
                        />
                    </div>

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Select your store or marketplace to begin</h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '1rem'
                    }}>
                        {platforms.map(platform => (
                            <button
                                key={platform.name}
                                onClick={() => onSelectPlatform(platform.name)}
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minHeight: '140px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-shc-red)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: '8px', right: '8px',
                                    color: '#10b981'
                                }}>
                                    <ExternalLink size={14} />
                                </div>
                                <img
                                    src={platform.logoUrl}
                                    alt={platform.name}
                                    style={{
                                        maxHeight: '48px',
                                        maxWidth: '120px',
                                        objectFit: 'contain',
                                        marginBottom: '1rem'
                                    }}
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextElementSibling) {
                                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                        }
                                    }}
                                />
                                {/* Fallback text if image missing */}
                                <span style={{ display: 'none', fontWeight: 600, fontSize: '1.125rem', marginBottom: '1rem' }}>{platform.name}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', fontWeight: 500 }}>{platform.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
