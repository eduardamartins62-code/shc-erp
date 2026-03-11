import React, { useState } from 'react';
import type { ProductActivityLog } from '../../types/products';
import { Filter } from 'lucide-react';

interface ProductActivityTabProps {
    logs: ProductActivityLog[];
}

export const ProductActivityTab: React.FC<ProductActivityTabProps> = ({ logs }) => {
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [dateRange, setDateRange] = useState(''); // Just a mock dropdown for now

    const filteredLogs = logs.filter(log => {
        if (actionFilter && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
        if (userFilter && !log.user.toLowerCase().includes(userFilter.toLowerCase())) return false;
        // date range ignored for this mock
        return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Extract unique actions for filter dropdown
    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
    const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Activity Log</h2>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                            <Filter size={16} />
                        </span>
                        <select
                            className="form-control"
                            style={{ paddingLeft: '2.5rem', appearance: 'none' }}
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-control"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                        >
                            <option value="">All Users</option>
                            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <select
                            className="form-control"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="">Any Time</option>
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date / Time</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>User</th>
                            <th>Module</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                                    {new Date(log.timestamp).toLocaleDateString()} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td>
                                    <span className="badge" style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary-dark)' }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--color-primary-dark)' }}>{log.details}</td>
                                <td>{log.user}</td>
                                <td><span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{log.module}</span></td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                    No activity found matching the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
