import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardInventoryWidget from '../components/DashboardInventoryWidget';
import { useInventory } from '../context/InventoryContext';
import { useProducts } from '../context/ProductContext';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Dashboard: React.FC = () => {
    const router = useRouter();
    const { inventory, auditLogs, snapshots } = useInventory();
    const { products } = useProducts();

    // Quick Stats — computed from real Supabase inventory data
    const totalQoH = inventory.reduce((sum, item) => sum + item.quantityOnHand, 0);
    const totalReserved = inventory.reduce((sum, item) => sum + item.quantityReserved, 0);
    const totalAvailable = totalQoH - totalReserved;

    // Low stock: count unique SKUs where total available < their product's reorderPoint (or < 50 if none set)
    const availablePerSku = inventory.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + Math.max(0, item.quantityOnHand - item.quantityReserved);
        return acc;
    }, {});
    const lowStockCount = Object.entries(availablePerSku).filter(([sku, avail]) => {
        const product = products.find(p => p.sku === sku);
        const threshold = product?.reorderPoint ?? 50;
        return avail < threshold;
    }).length;

    // Compute COGS directly from real Supabase inventory × product unit cost
    // (calculateCOGS from ProductContext uses mock inventoryLocations, so QOH is always 0 there)
    const totalCogs = inventory.reduce((sum, item) => {
        const product = products.find(p => p.sku === item.id);
        const unitCost = product?.costOfGoods ?? 0;
        return sum + unitCost * item.quantityOnHand;
    }, 0);

    // Trend Calculations
    const hasEnoughData = snapshots.length >= 2;
    const firstSnapshot = hasEnoughData ? snapshots[0] : null;
    const lastSnapshot = hasEnoughData ? snapshots[snapshots.length - 1] : null;

    let availableDiff = 0, availablePct = 0;
    let cogsDiff = 0, cogsPct = 0;
    let lowStockDiff = 0;

    if (hasEnoughData && firstSnapshot && lastSnapshot) {
        availableDiff = lastSnapshot.totalAvailable - firstSnapshot.totalAvailable;
        availablePct = firstSnapshot.totalAvailable ? (availableDiff / firstSnapshot.totalAvailable) * 100 : 0;

        cogsDiff = lastSnapshot.totalCogs - firstSnapshot.totalCogs;
        cogsPct = firstSnapshot.totalCogs ? (cogsDiff / firstSnapshot.totalCogs) * 100 : 0;

        lowStockDiff = lastSnapshot.lowStockCount - firstSnapshot.lowStockCount;
    }

    const formatTrend = (diff: number, pct?: number, isCurrency: boolean = false) => {
        const sign = diff > 0 ? '+' : ''; // negative already has '-'
        if (isCurrency) {
            return `${sign}$${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${pct?.toFixed(1)}%) vs last 30 days`;
        }
        if (pct !== undefined) {
            return `${sign}${pct.toFixed(1)}% vs last 30 days`;
        }
        return `${sign}${diff} items vs last 30 days`;
    };

    const renderSparkline = (dataKey: string, color: string) => {
        if (!hasEnoughData) {
            return (
                <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
                    <div style={{ width: '100%', height: '2px', backgroundColor: color, opacity: 0.3 }}></div>
                </div>
            );
        }
        return (
            <div style={{ height: '50px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={snapshots}>
                        <RechartsTooltip
                            contentStyle={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                            labelStyle={{ display: 'none' }}
                            itemStyle={{ color: 'var(--color-charcoal)' }}
                            formatter={(value: any) => [value, '']}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fill={color}
                            fillOpacity={0.15}
                            strokeWidth={2}
                            dot={(props: any) => {
                                if (props.index === snapshots.length - 1) {
                                    return <circle key="dot" cx={props.cx} cy={props.cy} r={3} fill={color} />;
                                }
                                return <React.Fragment key={props.index}></React.Fragment>;
                            }}
                            activeDot={{ r: 4 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const cardStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
        minHeight: '160px',
        padding: '1.25rem'
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        SHC Inventory
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Inventory Overview
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Monitor stock levels, COGS, and overall inventory health.
                    </p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                {/* Total Available Card — clickable → Stock page */}
                <div
                    className="card"
                    style={{ ...cardStyle, cursor: 'pointer', transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }}
                    onClick={() => router.push('/wms/warehouses')}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-primary)'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; }}
                    title="View Stock by Warehouse"
                >
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Total Available</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{totalAvailable.toLocaleString()}</div>
                    {renderSparkline('totalAvailable', availableDiff >= 0 ? '#10b981' : '#ef4444')}
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500, color: !hasEnoughData ? 'var(--color-text-muted)' : (availableDiff >= 0 ? '#10b981' : '#ef4444') }}>
                        {!hasEnoughData ? "Not enough data yet" : formatTrend(availableDiff, availablePct)}
                    </div>
                </div>

                {/* Total COGS Card */}
                <div className="card" style={cardStyle}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }} title="Total inventory value based on current QOH × unit cost per SKU">Total COGS</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-shc-red)' }}>
                        ${totalCogs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {renderSparkline('totalCogs', 'var(--color-shc-red)')}
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500, color: !hasEnoughData ? 'var(--color-text-muted)' : 'var(--color-shc-red)' }}>
                        {!hasEnoughData ? "Not enough data yet" : formatTrend(cogsDiff, cogsPct, true)}
                    </div>
                </div>

                {/* Low Stock Items Card — clickable → Stock page filtered to low stock */}
                <div
                    className="card"
                    style={{ ...cardStyle, cursor: 'pointer', transition: 'box-shadow 0.15s ease, border-color 0.15s ease' }}
                    onClick={() => router.push('/wms/warehouses?filter=lowstock')}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#f59e0b'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.borderColor = ''; }}
                    title="View low stock items in Stock by Warehouse"
                >
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>Low Stock Items</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-status-low)' }}>{lowStockCount}</div>
                    {renderSparkline('lowStockCount', lowStockDiff <= 0 ? '#10b981' : '#ef4444')}
                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500, color: !hasEnoughData ? 'var(--color-text-muted)' : (lowStockDiff <= 0 ? '#10b981' : '#ef4444') }}>
                        {!hasEnoughData ? "Not enough data yet" : formatTrend(lowStockDiff)}
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <DashboardInventoryWidget />
            </div>

            {/* Recent Activity Log */}
            <div className="card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Audit Activity</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Time/Date</th>
                                <th>Action</th>
                                <th>SKU</th>
                                <th>Warehouse</th>
                                <th>Quantity Change</th>
                                <th>Performed By</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.slice(0, 10).map(log => (
                                <tr key={log.id}>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td>
                                        <span className="badge" style={{
                                            backgroundColor: log.action.includes('RECEIVE') || log.action.includes('IN') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(193, 39, 45, 0.1)',
                                            color: log.action.includes('RECEIVE') || log.action.includes('IN') ? 'var(--color-status-good)' : 'var(--color-shc-red)'
                                        }}>{log.action}</span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{log.itemId}</td>
                                    <td>{log.warehouseId}</td>
                                    <td style={{
                                        fontWeight: 600,
                                        color: log.quantityChange > 0 ? 'var(--color-status-good)' : 'var(--color-shc-red)'
                                    }}>
                                        {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                                    </td>
                                    <td>{log.performedBy}</td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>
                                        {log.reasonCode ? `Reason: ${log.reasonCode}` : (log.details || '-')}
                                    </td>
                                </tr>
                            ))}
                            {auditLogs.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                        No recent activity logs.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
