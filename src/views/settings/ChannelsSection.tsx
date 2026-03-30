import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettings } from '../../context/SettingsContext';
import { Globe, Plus, Settings2, Trash2, RefreshCw, PowerOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ConnectStoreModal } from '../../components/integrations/ConnectStoreModal';
import { SetupStoreModal } from '../../components/integrations/SetupStoreModal';
import { SlideOverPanel } from '../../components/ui/SlideOverPanel';
import { shipstationApi } from '../../services/shipstationApi';
import { ebayApi } from '../../services/ebayApi';
import type { ChannelConfig, ChannelEnum } from '../../types';

export const ChannelsSection: React.FC = () => {
    const { currentUser } = useAuth();
    const { can } = usePermissions(currentUser);
    const canEdit = can('settingsChannels', 'edit');
    const { channels, updateChannel, deleteChannel, warehouses } = useSettings();
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    // Settings Modal State
    const [detailChannel, setDetailChannel] = useState<ChannelConfig | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Connection Modals State
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<ChannelEnum | null>(null);

    const handlePlatformSelect = (platform: ChannelEnum) => {
        setSelectedPlatform(platform);
        setIsConnectModalOpen(false);
        setIsSetupModalOpen(true);
    };

    // Deletion Modal State
    const [channelToDelete, setChannelToDelete] = useState<{ id: string, name: string } | null>(null);

    // API Key Modal State
    const [oauthModalPlatform, setOauthModalPlatform] = useState<string | null>(null);
    const [oauthPendingId, setOauthPendingId] = useState<string | null>(null);
    const [apiInputKey, setApiInputKey] = useState('');
    const [apiInputSecret, setApiInputSecret] = useState('');
    const [apiAuthError, setApiAuthError] = useState<string | null>(null);

    const handleConfirmDelete = async () => {
        if (!channelToDelete) return;
        try {
            await deleteChannel(channelToDelete.id);
            setChannelToDelete(null);
            if (detailChannel?.id === channelToDelete.id) {
                setDetailChannel(null); // Close settings if open
            }
        } catch (error) {
            console.error("Failed to delete channel", error);
        }
    };

    const handleConnectShipStation = (id: string) => {
        setOauthPendingId(id);
        setOauthModalPlatform('ShipStation');
        setApiInputKey('');
        setApiInputSecret('');
        setApiAuthError(null);
    };

    // eBay OAuth Token Modal State
    const [ebayModalId, setEbayModalId] = useState<string | null>(null);
    const [ebayTokenInput, setEbayTokenInput] = useState('');
    const [ebayAuthError, setEbayAuthError] = useState<string | null>(null);
    const [isConnectingEbay, setIsConnectingEbay] = useState(false);
    const [ebaySuccessMessage, setEbaySuccessMessage] = useState<string | null>(null);

    const searchParams = useSearchParams();

    // Auto-save eBay token when redirected back from the OAuth callback
    useEffect(() => {
        const token = searchParams.get('ebay_token');
        const refreshToken = searchParams.get('ebay_refresh_token');
        const tokenExpiresAt = searchParams.get('ebay_token_expires_at');
        const channelId = searchParams.get('ebay_channel_id');
        if (!token || !channelId) return;

        const save = async () => {
            try {
                await updateChannel(channelId, {
                    oauthToken: token,
                    oauthRefreshToken: refreshToken || undefined,
                    oauthTokenExpiresAt: tokenExpiresAt || undefined,
                    isEnabled: true,
                });
                setEbaySuccessMessage(`eBay connected successfully! Token auto-refreshes every 2 hours using your refresh token (valid 18 months).`);
                // Clean URL params without a full navigation
                const url = new URL(window.location.href);
                url.searchParams.delete('ebay_token');
                url.searchParams.delete('ebay_refresh_token');
                url.searchParams.delete('ebay_token_expires_at');
                url.searchParams.delete('ebay_channel_id');
                window.history.replaceState({}, '', url.toString());
            } catch (err: any) {
                console.error('[eBay OAuth] Auto-save failed:', err);
            }
        };
        save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConnectEbay = (id: string) => {
        setEbayModalId(id);
        setEbayTokenInput('');
        setEbayAuthError(null);
    };

    const handleEbayConnectComplete = async () => {
        if (!ebayModalId) return;
        if (!ebayTokenInput.trim()) {
            setEbayAuthError('eBay User Access Token is required.');
            return;
        }
        setIsConnectingEbay(true);
        setEbayAuthError(null);
        try {
            await ebayApi.validateCredentials(ebayTokenInput.trim());
            await updateChannel(ebayModalId, { oauthToken: ebayTokenInput.trim(), isEnabled: true });
            if (detailChannel?.id === ebayModalId) {
                setDetailChannel(prev => prev ? { ...prev, oauthToken: ebayTokenInput.trim(), isEnabled: true } : null);
            }
            setEbayModalId(null);
            setEbayTokenInput('');
        } catch (error: any) {
            setEbayAuthError(error.message || 'Failed to validate eBay token. Please check it and try again.');
        } finally {
            setIsConnectingEbay(false);
        }
    };

    const handleDisconnectEbay = async (id: string) => {
        if (!confirm('Disconnect eBay? This will stop all inventory syncs.')) return;
        await updateChannel(id, { oauthToken: '', isEnabled: false });
        if (detailChannel?.id === id) {
            setDetailChannel(prev => prev ? { ...prev, oauthToken: '', isEnabled: false } : null);
        }
    };

    const handleOAuthComplete = async () => {
        if (!oauthPendingId) return;

        if (!apiInputKey.trim() || !apiInputSecret.trim()) {
            setApiAuthError("API Key and Secret are required.");
            return;
        }

        const id = oauthPendingId;
        setIsConnecting(true);
        setApiAuthError(null);

        try {
            // Test the credentials against the real Next.js proxy
            await shipstationApi.validateCredentials(apiInputKey.trim(), apiInputSecret.trim());

            // If it succeeds, save it
            await updateChannel(id, { apiKey: apiInputKey.trim(), apiSecret: apiInputSecret.trim(), isEnabled: true });
            if (detailChannel?.id === id) {
                setDetailChannel(prev => prev ? { ...prev, apiKey: apiInputKey.trim(), apiSecret: apiInputSecret.trim(), isEnabled: true } : null);
            }

            setOauthModalPlatform(null); // Close modal on success
            setApiInputKey('');
            setApiInputSecret('');

        } catch (error: any) {
            console.error("Connection failed", error);
            setApiAuthError(error.message || "Failed to validate API keys. Please check them and try again.");
        } finally {
            setIsConnecting(false);
            if (!apiAuthError) { // Only clear ID if not lingering on error
                setOauthPendingId(null);
            }
        }
    };

    const handleDisconnectShipStation = async (id: string) => {
        if (!confirm("Disconnect ShipStation? This stops all syncs.")) return;
        try {
            await updateChannel(id, { apiKey: '', apiSecret: '', isEnabled: false });
            if (detailChannel?.id === id) {
                setDetailChannel(prev => prev ? { ...prev, apiKey: '', apiSecret: '', isEnabled: false } : null);
            }
        } catch (error) {
            console.error("Disconnection failed", error);
        }
    };

    const columns: Column<ChannelConfig>[] = [
        {
            key: 'storeName',
            label: 'Store Name',
            type: 'text',
            filterable: true,
            render: (val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '6px',
                        backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        {row.channel.substring(0, 1)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{val || row.channel}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{row.channel}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'isEnabled',
            label: 'Store Import Status',
            type: 'select',
            filterable: true,
            options: ['Active', 'Inactive'],
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: val ? '#10b981' : 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: val ? '#10b981' : 'var(--color-border)' }}></div>
                    {val ? 'Connected & Active' : 'Disconnected'}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            type: 'text',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                    {canEdit && (
                    <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem', color: 'var(--color-text-muted)' }}
                        title="Configure Settings"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDetailChannel(row);
                        }}
                    >
                        <Settings2 size={16} />
                    </button>
                    )}
                    {canEdit && (
                    <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem', color: 'var(--color-shc-red)', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}
                        title="Delete Connection"
                        onClick={(e) => {
                            e.stopPropagation();
                            setChannelToDelete({ id: row.id, name: row.storeName || row.channel });
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                    )}
                </div>
            )
        }
    ];

    // Filter to only show channels that have been 'connected' (i.e., not just the raw untoggled mock data from the initial pass)
    // For this mockup, we'll assume anything that isEnabled OR has a custom storeName represents a connected store.
    const connectedStores = channels.filter(c => c.isEnabled || c.storeName);

    return (
        <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)'
        }}>
            {ebaySuccessMessage && (
                <div style={{
                    marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
                    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
                    fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    ✅ {ebaySuccessMessage}
                    <button onClick={() => setEbaySuccessMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', fontSize: '1rem' }}>×</button>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Store Setup
                    </h3>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '600px', lineHeight: 1.5 }}>
                        Connect an unlimited number of stores (including shopping carts, marketplaces, ERPs, etc) to begin importing your orders. Once connected, you can customize each store's settings.
                    </p>
                </div>
                {canEdit && (
                <button
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => setIsConnectModalOpen(true)}
                >
                    <Plus size={16} /> Connect Store
                </button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={connectedStores}
                onRowClick={(row) => setDetailChannel(row)}
                selectable
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <ConnectStoreModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                onSelectPlatform={handlePlatformSelect}
            />

            <SetupStoreModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                platform={selectedPlatform}
            />

            <SlideOverPanel
                isOpen={!!detailChannel}
                onClose={() => setDetailChannel(null)}
                title={`${detailChannel?.storeName || detailChannel?.channel} Settings`}
                actions={
                    <button
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-shc-red)' }}
                        onClick={() => {
                            if (detailChannel) {
                                setChannelToDelete({ id: detailChannel.id, name: detailChannel.storeName || detailChannel.channel });
                            }
                        }}
                    >
                        <PowerOff size={14} /> Remove Connection
                    </button>
                }
            >
                {detailChannel && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{detailChannel.channel}</h3>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                Connection Status: <span style={{ fontWeight: 600, color: detailChannel.isEnabled ? '#10b981' : 'var(--color-text-muted)' }}>{detailChannel.isEnabled ? 'Connected & Active' : 'Disconnected'}</span>
                            </p>
                        </div>

                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Default Warehouse</p>
                                    <select
                                        value={detailChannel.defaultWarehouseId || ''}
                                        onChange={async (e) => {
                                            const wId = e.target.value;
                                            await updateChannel(detailChannel.id, { defaultWarehouseId: wId || undefined });
                                            setDetailChannel(prev => prev ? { ...prev, defaultWarehouseId: wId || undefined } : null);
                                        }}
                                        disabled={!detailChannel.isEnabled}
                                        style={{
                                            padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', width: '100%',
                                            backgroundColor: detailChannel.isEnabled ? 'white' : '#f9fafb',
                                            color: detailChannel.isEnabled ? 'var(--color-text-main)' : 'var(--color-text-muted)'
                                        }}
                                    >
                                        <option value="">-- None --</option>
                                        {warehouses?.map(w => (
                                            <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>
                                        ))}
                                    </select>
                                </div>

                                {detailChannel.channel === 'ShipStation' && (
                                    <>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                                        <div>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>ShipStation Connection</p>

                                            {(!detailChannel.apiKey || !detailChannel.apiSecret) ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                        Connect your ShipStation account to automatically import orders and sync inventory.
                                                    </p>
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                        onClick={() => handleConnectShipStation(detailChannel.id)}
                                                        disabled={isConnecting}
                                                    >
                                                        {isConnecting ? (
                                                            <><RefreshCw size={16} className="spin" style={{ marginRight: '6px' }} /> Connecting...</>
                                                        ) : (
                                                            <>Connect</>
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 500, fontSize: '0.875rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                                        Connected securely via OAuth
                                                    </div>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', color: 'var(--color-shc-red)', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}
                                                        onClick={() => handleDisconnectShipStation(detailChannel.id)}
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                                    </>
                                )}

                                {detailChannel.channel === 'eBay' && (
                                    <>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                                        <div>
                                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>eBay Connection</p>

                                            {!detailChannel.oauthToken ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                        Connect your eBay seller account to push WMS stock quantities every 10 minutes.
                                                    </p>
                                                    <a
                                                        href={`/api/ebay/authorize?channelId=${detailChannel.id}`}
                                                        className="btn-primary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }}
                                                    >
                                                        Authorize with eBay
                                                    </a>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 500, fontSize: '0.875rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                                        Connected — auto-sync every 10 min
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <a
                                                            href={`/api/ebay/authorize?channelId=${detailChannel.id}`}
                                                            className="btn-secondary"
                                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }}
                                                        >
                                                            Re-authorize
                                                        </a>
                                                        <button
                                                            className="btn-secondary"
                                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', color: 'var(--color-shc-red)', borderColor: '#fee2e2', backgroundColor: '#fef2f2' }}
                                                            onClick={() => handleDisconnectEbay(detailChannel.id)}
                                                        >
                                                            Disconnect
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                                    </>
                                )}

                                <div>
                                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Integration Features</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Auto-Import Orders Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Auto-Import Orders</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Automatically fetch new orders</div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <div style={{
                                                    position: 'relative', width: '36px', height: '20px',
                                                    backgroundColor: detailChannel.autoImportOrders ? 'var(--color-shc-red)' : '#e5e7eb',
                                                    borderRadius: '999px', transition: 'background-color 0.2s',
                                                }}>
                                                    <div style={{
                                                        position: 'absolute', top: '2px', left: detailChannel.autoImportOrders ? '18px' : '2px',
                                                        width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                                                        transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                                <input type="checkbox" style={{ display: 'none' }} checked={detailChannel.autoImportOrders || false}
                                                    onChange={async (e) => {
                                                        const val = e.target.checked;
                                                        setDetailChannel(prev => prev ? { ...prev, autoImportOrders: val } : null);
                                                        await updateChannel(detailChannel.id, { autoImportOrders: val });
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* Sync Inventory Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sync Inventory</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Push stock quantities to marketplace</div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <div style={{
                                                    position: 'relative', width: '36px', height: '20px',
                                                    backgroundColor: detailChannel.syncInventory ? 'var(--color-shc-red)' : '#e5e7eb',
                                                    borderRadius: '999px', transition: 'background-color 0.2s',
                                                }}>
                                                    <div style={{
                                                        position: 'absolute', top: '2px', left: detailChannel.syncInventory ? '18px' : '2px',
                                                        width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                                                        transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                                <input type="checkbox" style={{ display: 'none' }} checked={detailChannel.syncInventory || false}
                                                    onChange={async (e) => {
                                                        const val = e.target.checked;
                                                        setDetailChannel(prev => prev ? { ...prev, syncInventory: val } : null);
                                                        await updateChannel(detailChannel.id, { syncInventory: val });
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* Sync Tracking Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sync Tracking Numbers</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Send tracking info back</div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <div style={{
                                                    position: 'relative', width: '36px', height: '20px',
                                                    backgroundColor: detailChannel.syncTracking ? 'var(--color-shc-red)' : '#e5e7eb',
                                                    borderRadius: '999px', transition: 'background-color 0.2s',
                                                }}>
                                                    <div style={{
                                                        position: 'absolute', top: '2px', left: detailChannel.syncTracking ? '18px' : '2px',
                                                        width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                                                        transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                                <input type="checkbox" style={{ display: 'none' }} checked={detailChannel.syncTracking || false}
                                                    onChange={async (e) => {
                                                        const val = e.target.checked;
                                                        setDetailChannel(prev => prev ? { ...prev, syncTracking: val } : null);
                                                        await updateChannel(detailChannel.id, { syncTracking: val });
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* Sync Shipped Order Status Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Sync Shipped Order Status</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Auto-update orders marked shipped in ShipStation</div>
                                            </div>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <div style={{
                                                    position: 'relative', width: '36px', height: '20px',
                                                    backgroundColor: detailChannel.syncShippedOrders !== false ? 'var(--color-shc-red)' : '#e5e7eb',
                                                    borderRadius: '999px', transition: 'background-color 0.2s',
                                                }}>
                                                    <div style={{
                                                        position: 'absolute', top: '2px', left: detailChannel.syncShippedOrders !== false ? '18px' : '2px',
                                                        width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%',
                                                        transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                    }} />
                                                </div>
                                                <input type="checkbox" style={{ display: 'none' }} checked={detailChannel.syncShippedOrders !== false}
                                                    onChange={async (e) => {
                                                        const val = e.target.checked;
                                                        setDetailChannel(prev => prev ? { ...prev, syncShippedOrders: val } : null);
                                                        await updateChannel(detailChannel.id, { syncShippedOrders: val });
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-primary"
                                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                                onClick={async () => {
                                    if (detailChannel.channel === 'ShipStation') {
                                        if (!detailChannel.apiKey || !detailChannel.apiSecret) {
                                            alert("Please save API Keys before syncing inventory.");
                                            return;
                                        }
                                        try {
                                            await shipstationApi.syncInventory(detailChannel.apiKey, detailChannel.apiSecret);
                                            alert(`Inventory synced successfully to ShipStation.`);
                                        } catch (e: any) {
                                            alert(`Sync failed: ${e.message}`);
                                        }
                                    } else if (detailChannel.channel === 'eBay') {
                                        if (!detailChannel.oauthToken) {
                                            alert("Please connect your eBay account before syncing inventory.");
                                            return;
                                        }
                                        try {
                                            const result = await ebayApi.syncInventory(detailChannel.oauthToken);
                                            alert(`eBay sync complete — ${result.synced} SKUs updated, ${result.failed} failed.`);
                                        } catch (e: any) {
                                            alert(`eBay sync failed: ${e.message}`);
                                        }
                                    } else {
                                        alert(`Syncing inventory for ${detailChannel.channel} is not implemented.`);
                                    }
                                }}
                            >
                                <RefreshCw size={18} /> Sync Inventory Updates
                            </button>
                        </div>
                    </div>
                )}
            </SlideOverPanel>

            {/* Custom Delete Confirmation Modal to avoid browser popup blockers */}
            {channelToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 99999, // Super high z-index and darker backdrop
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', width: '100%', maxWidth: '400px', // Hardcoded solid white background
                        borderRadius: '12px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                        border: '1px solid var(--color-border)', position: 'relative' // Ensure it stacks correctly internally
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary-dark)' }}>Confirm Deletion</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                            Are you sure you want to completely remove <strong>{channelToDelete.name}</strong>? This action cannot be undone and will stop all data syncing immediately.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={() => setChannelToDelete(null)}>Cancel</button>
                            <button className="btn-primary" style={{ backgroundColor: 'var(--color-shc-red)', borderColor: 'var(--color-shc-red)', color: '#ffffff' }} onClick={handleConfirmDelete}>Remove Connection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* eBay OAuth Token Modal */}
            {ebayModalId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 999999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', width: '100%', maxWidth: '460px',
                        borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ backgroundColor: '#e53e3e', height: '4px', width: '100%' }}></div>
                        <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid #fee2e2' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" alt="eBay" style={{ height: '28px', objectFit: 'contain' }} />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', textAlign: 'center', color: 'var(--color-primary-dark)' }}>Connect to eBay</h3>
                            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', lineHeight: 1.6 }}>
                                Generate a <strong>User Access Token</strong> from the{' '}
                                <strong>eBay Developer Portal → Get a Token for My Account</strong>{' '}
                                with the <code style={{ backgroundColor: '#f3f4f6', padding: '0 4px', borderRadius: '3px' }}>sell.inventory</code> scope selected.
                            </p>

                            {ebayAuthError && (
                                <div style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', color: 'var(--color-shc-red)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    {ebayAuthError}
                                </div>
                            )}

                            <div style={{ width: '100%', marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>User Access Token</label>
                                <textarea
                                    value={ebayTokenInput}
                                    onChange={(e) => setEbayTokenInput(e.target.value)}
                                    placeholder="Paste your eBay User Access Token here..."
                                    rows={4}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#f9fafb', outline: 'none', fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical' }}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', backgroundColor: '#e53e3e', borderColor: '#e53e3e', color: 'white', fontSize: '1rem', fontWeight: 600 }}
                                onClick={handleEbayConnectComplete}
                                disabled={isConnectingEbay}
                            >
                                {isConnectingEbay ? <><RefreshCw size={18} className="spin" style={{ marginRight: '8px' }} /> Validating...</> : 'Authorize eBay Connection'}
                            </button>
                            <button
                                className="btn-secondary"
                                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', marginTop: '0.75rem', border: 'none', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}
                                onClick={() => { setEbayModalId(null); setEbayAuthError(null); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Modal - Real Backend Auth testing */}
            {oauthModalPlatform && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 999999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', width: '100%', maxWidth: '420px',
                        borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ backgroundColor: '#10b981', height: '4px', width: '100%' }}></div>
                        <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                                <Globe size={32} color="var(--color-text-main)" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', textAlign: 'center', color: 'var(--color-primary-dark)' }}>Connect to {oauthModalPlatform}</h3>
                            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', lineHeight: 1.5 }}>
                                Generate API Keys from your {oauthModalPlatform} Account Settings and securely enter them below to authorize access.
                            </p>

                            {apiAuthError && (
                                <div style={{ width: '100%', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', color: 'var(--color-shc-red)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    {apiAuthError}
                                </div>
                            )}

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>API Key</label>
                                    <input
                                        type="text"
                                        value={apiInputKey}
                                        onChange={(e) => setApiInputKey(e.target.value)}
                                        placeholder="Enter your API Key"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#f9fafb', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>API Secret</label>
                                    <input
                                        type="password"
                                        value={apiInputSecret}
                                        onChange={(e) => setApiInputSecret(e.target.value)}
                                        placeholder="Enter your API Secret"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#f9fafb', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', backgroundColor: '#10b981', borderColor: '#10b981', color: 'white', fontSize: '1rem', fontWeight: 600 }}
                                onClick={handleOAuthComplete}
                                disabled={isConnecting}
                            >
                                {isConnecting ? <><RefreshCw size={18} className="spin" style={{ marginRight: '8px' }} /> Connecting Backend...</> : 'Authorize Connection'}
                            </button>
                            <button
                                className="btn-secondary"
                                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', marginTop: '0.75rem', border: 'none', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}
                                onClick={() => {
                                    setOauthModalPlatform(null);
                                    setOauthPendingId(null);
                                    setApiAuthError(null);
                                }}
                            >
                                Cancel & Return to ERP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
