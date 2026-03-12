import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { ChannelEnum } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface SetupStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: ChannelEnum | null;
}

export const SetupStoreModal: React.FC<SetupStoreModalProps> = ({ isOpen, onClose, platform }) => {
    const { addChannel, warehouses } = useSettings();
    const [storeName, setStoreName] = useState('');
    const [defaultWarehouseId, setDefaultWarehouseId] = useState<string>('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Specific toggles
    const [autoImport, setAutoImport] = useState(true);
    const [syncInventory, setSyncInventory] = useState(false);
    const [syncTracking, setSyncTracking] = useState(true);

    if (!isOpen || !platform) return null;

    const handleConnect = async () => {
        if (!storeName.trim()) {
            setError("Store Name is a required property");
            return;
        }

        setIsConnecting(true);
        setError(null);

        // Simulate creation flow
        setTimeout(async () => {
            try {
                // If the platform is ShipStation, we DO NOT generate mock keys anymore.
                // It must run through the real auth flow from the channel list.
                const isShipStation = platform === 'ShipStation';
                
                const mockKey = isShipStation ? '' : `oauth-${platform.toLowerCase()}-key-${Date.now()}`;
                const mockSecret = isShipStation ? '' : `oauth-${platform.toLowerCase()}-secret-${Date.now()}`;

                await addChannel({
                    channel: platform,
                    storeName: storeName.trim(),
                    isEnabled: !isShipStation, // ShipStation starts disabled until keys are provided
                    apiKey: mockKey,
                    apiSecret: mockSecret,
                    defaultWarehouseId: defaultWarehouseId || undefined,
                    autoImportOrders: autoImport,
                    syncInventory: syncInventory,
                    syncTracking: syncTracking,
                    notes: isShipStation ? `Pending API Key Authorization` : `Connected via Web UI`
                });

                setIsConnecting(false);
                onClose(); // Auto-close on success
            } catch (e: any) {
                console.error("Connection failed", e);
                setError(e.message || "Failed to establish secure connection.");
                setIsConnecting(false);
            }
        }, 1000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-bg-main)',
                width: '100%', maxWidth: '600px', maxHeight: '90vh',
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
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Set Up Store Connection</h2>
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
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: 'white' }}>

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 700 }}>{platform}</h3>

                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        Follow the steps below to securely connect your {platform} account. Once complete, your orders and inventory will begin syncing automatically based on your preferences.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Store Name <span style={{ color: 'var(--color-shc-red)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={`e.g. My ${platform} Store`}
                                value={storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value);
                                    if (error) setError(null);
                                }}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '6px',
                                    border: `1px solid ${error ? 'var(--color-shc-red)' : 'var(--color-border)'}`,
                                    fontSize: '0.875rem', outline: 'none'
                                }}
                            />
                            {error && (
                                <p style={{ margin: '0.5rem 0 0 0', display: 'inline-block', fontSize: '0.75rem', color: 'var(--color-shc-red)', backgroundColor: '#fef2f2', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #fee2e2' }}>
                                    • {error}
                                </p>
                            )}
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                Choose a unique name to identify this specific connection.
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Default Warehouse
                            </label>
                            <select
                                value={defaultWarehouseId}
                                onChange={(e) => setDefaultWarehouseId(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '6px',
                                    border: '1px solid var(--color-border)', fontSize: '0.875rem', outline: 'none',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">-- Let system decide (Unassigned) --</option>
                                {warehouses?.map(w => (
                                    <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>
                                ))}
                            </select>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                Orders imported from this store will be assigned to this warehouse by default.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600 }}>Initial Configuration Options</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={autoImport}
                                        onChange={(e) => setAutoImport(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--color-shc-red)' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Auto-Import Orders</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Immediately fetch unfulfilled orders</div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={syncInventory}
                                        onChange={(e) => setSyncInventory(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--color-shc-red)' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sync Inventory</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Push stock levels continuously</div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={syncTracking}
                                        onChange={(e) => setSyncTracking(e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--color-shc-red)' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sync Tracking Numbers</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Send shipments back to {platform}</div>
                                    </div>
                                </label>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#f9fafb'
                }}>
                    <button
                        style={{
                            background: 'none', border: 'none', color: '#3b82f6',
                            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', padding: '0.5rem 0'
                        }}
                        onClick={onClose}
                    >
                        Back
                    </button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-secondary" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                        <button
                            className="btn-primary"
                            style={{ padding: '0.5rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none' }}
                            onClick={handleConnect}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <><RefreshCw size={16} className="spin" style={{ marginRight: '6px' }} /> Connecting...</>
                            ) : (
                                "Connect"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
