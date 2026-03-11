import React, { useState } from 'react';
import { Upload, Download, FileText, Database, Package, ShoppingCart, MapPin, Activity } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useOrders } from '../context/OrderContext';
import { exportProductsToCSV, exportInventoryToCSV, exportOrdersToCSV, exportLocationsToCSV } from '../utils/csvExport';

type TabType = 'products' | 'inventory' | 'locations' | 'orders';

const DataManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Bring in data contexts
    const { products } = useProducts();
    const { inventory } = useInventory();
    const { locations } = useLocations();
    const { orders } = useOrders();

    const tabs = [
        { id: 'products', label: 'Products', icon: <Package size={18} /> },
        { id: 'inventory', label: 'Inventory', icon: <Database size={18} /> },
        { id: 'locations', label: 'Locations', icon: <MapPin size={18} /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!selectedFile) {
            alert('Please select a CSV file to import first.');
            return;
        }

        // Mock import process
        alert(`Simulating import of "${selectedFile.name}" for ${activeTab}... This feature requires a backend API to parse and save the data.`);
        setSelectedFile(null); // Reset after "import"
    };

    const handleExport = () => {
        switch (activeTab) {
            case 'products':
                exportProductsToCSV(products);
                break;
            case 'inventory':
                exportInventoryToCSV(inventory);
                break;
            case 'locations':
                exportLocationsToCSV(locations);
                break;
            case 'orders':
                exportOrdersToCSV(orders);
                break;
        }
    };

    return (
        <div className="data-management-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Data Operations
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--color-text-main)', margin: '0 0 4px 0' }}>
                        Data Management
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', margin: 0 }}>
                        Import and export bulk data across different modules of the ERP system.
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--color-shc-red)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--color-shc-red)' : 'var(--color-text-muted)',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Import Card */}
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Upload size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Import {tabs.find(t => t.id === activeTab)?.label}</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.875rem', maxWidth: '300px' }}>
                        Upload a CSV file to bulk import or update existing {activeTab} records in the system.
                    </p>

                    <label
                        className="import-dropzone"
                        style={{
                            width: '100%',
                            border: '2px dashed var(--color-border)',
                            borderRadius: '8px',
                            padding: '2rem',
                            marginBottom: '1.5rem',
                            backgroundColor: selectedFile ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-bg-light)',
                            cursor: 'pointer',
                            display: 'block',
                            borderColor: selectedFile ? '#3b82f6' : 'var(--color-border)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <FileText size={24} color={selectedFile ? '#3b82f6' : 'var(--color-text-muted)'} style={{ marginBottom: '0.5rem', margin: '0 auto' }} />
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: selectedFile ? 'var(--color-text-main)' : 'inherit' }}>
                            {selectedFile ? selectedFile.name : 'Click to browse or drag file here'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supported format: .csv'}
                        </div>
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }}>Download Template</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleImport}>Import Data</button>
                    </div>
                </div>

                {/* Export Card */}
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Download size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Export {tabs.find(t => t.id === activeTab)?.label}</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.875rem', maxWidth: '300px' }}>
                        Download a comprehensive CSV export of all your {activeTab} data for reporting or backup.
                    </p>

                    <div style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 600 }}>Export Options:</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <input type="radio" name="export-scope" defaultChecked /> All Records
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <input type="radio" name="export-scope" /> Filtered View (Current List)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <input type="checkbox" defaultChecked /> Include inactive records
                        </label>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={handleExport}>
                        <Download size={16} /> Generate Export
                    </button>
                </div>
            </div>

            {/* Recent Jobs History */}
            <div className="card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Data Jobs</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Job Type</th>
                                <th>Entity</th>
                                <th>Status</th>
                                <th>Records Processed</th>
                                <th>User</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{new Date().toLocaleString()}</td>
                                <td><span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Import</span></td>
                                <td>Products</td>
                                <td><span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Completed</span></td>
                                <td>1,245</td>
                                <td>System Admin</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">View Log</button>
                                </td>
                            </tr>
                            <tr>
                                <td>{new Date(Date.now() - 86400000).toLocaleString()}</td>
                                <td><span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Export</span></td>
                                <td>Inventory</td>
                                <td><span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Completed</span></td>
                                <td>8,432</td>
                                <td>Manager User</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">Download File</button>
                                </td>
                            </tr>
                            <tr>
                                <td>{new Date(Date.now() - 172800000).toLocaleString()}</td>
                                <td><span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Import</span></td>
                                <td>Locations</td>
                                <td><span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Failed</span></td>
                                <td>0 / 150</td>
                                <td>System Admin</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}>View Errors</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
