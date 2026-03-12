import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import OrderTable from '../components/OrderTable';
import B2BOrderForm from '../components/B2BOrderForm';
import { Download, Plus } from 'lucide-react';

const OrdersDashboard: React.FC = () => {
    const { orders, loading, error, syncShipStationOrders } = useOrders();
    const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<'Pending' | 'Shipped' | 'Cancelled'>('Pending');

    const pendingOrders = orders.filter(o => ['New', 'Allocated', 'Picking', 'Packed'].includes(o.fulfillmentStatus));
    const shippedOrders = orders.filter(o => o.fulfillmentStatus === 'Shipped');
    const cancelledOrders = orders.filter(o => o.fulfillmentStatus === 'Cancelled');

    const getFilteredOrders = () => {
        switch (activeTab) {
            case 'Pending': return pendingOrders;
            case 'Shipped': return shippedOrders;
            case 'Cancelled': return cancelledOrders;
            default: return pendingOrders;
        }
    };

    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.fulfillmentStatus === 'New').length;
    const pendingFulfillment = orders.filter(o =>
        ['Allocated', 'Picking', 'Packed'].includes(o.fulfillmentStatus)
    ).length;

    return (
        <div style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Multichannel Management
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Order Management
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Manage multichannel fulfillment, allocation, and tracking.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    <button
                        className="btn-secondary"
                        onClick={async () => {
                            setSyncing(true);
                            try {
                                await syncShipStationOrders();
                                alert('Orders synced successfully!');
                            } catch (e: any) {
                                alert(e.message);
                            } finally {
                                setSyncing(false);
                            }
                        }}
                        disabled={syncing || loading}
                    >
                        <Download size={18} />
                        {syncing ? 'Importing...' : 'Import Orders'}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setIsB2BModalOpen(true)}
                    >
                        <Plus size={18} />
                        Create B2B Order
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Total Orders</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{totalOrders}</div>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>New / Unallocated</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-shc-red)' }}>{newOrders}</div>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>In Progress</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>{pendingFulfillment}</div>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '2rem' }}>
                    Error loading orders: {error}
                </div>
            )}

            {/* Main Table Layer */}
            <div className="card">
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('Pending')}
                        style={{
                            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                            fontWeight: activeTab === 'Pending' ? 600 : 400,
                            color: activeTab === 'Pending' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'Pending' ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
                            marginBottom: '-9px',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        Pending <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#1e293b' }}>{pendingOrders.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('Shipped')}
                        style={{
                            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                            fontWeight: activeTab === 'Shipped' ? 600 : 400,
                            color: activeTab === 'Shipped' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'Shipped' ? '2px solid var(--color-primary-dark)' : '2px solid transparent',
                            marginBottom: '-9px',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        Shipped <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#1e293b' }}>{shippedOrders.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('Cancelled')}
                        style={{
                            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                            fontWeight: activeTab === 'Cancelled' ? 600 : 400,
                            color: activeTab === 'Cancelled' ? 'var(--color-shc-red)' : 'var(--color-text-muted)',
                            borderBottom: activeTab === 'Cancelled' ? '2px solid var(--color-shc-red)' : '2px solid transparent',
                            marginBottom: '-9px',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        Cancelled <span style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{cancelledOrders.length}</span>
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                        {activeTab} Orders
                    </h2>
                </div>
                <OrderTable orders={getFilteredOrders()} loading={loading} />
            </div>

            {isB2BModalOpen && (
                <B2BOrderForm onClose={() => setIsB2BModalOpen(false)} />
            )}
        </div>
    );
};

export default OrdersDashboard;
