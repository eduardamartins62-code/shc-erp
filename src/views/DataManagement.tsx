import React, { useState } from 'react';
import { Upload, Download, FileText, Database, Package, ShoppingCart, MapPin, Activity } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useOrders } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import Papa from 'papaparse';
import { exportProductsToCSV, exportInventoryToCSV, exportOrdersToCSV, exportLocationsToCSV, downloadImportTemplate } from '../utils/csvExport';

type TabType = 'products' | 'inventory' | 'locations' | 'orders';

const DataManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string; rowsProcessed?: number } | null>(null);

    // Bring in data contexts
    const { products, bulkImportProducts } = useProducts();
    const { inventory, bulkImportInventory } = useInventory();
    const { locations, bulkImportLocations } = useLocations();
    const { orders } = useOrders();
    const { warehouses } = useSettings();

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

    const handleImport = async () => {
        if (!selectedFile) {
            setImportResult({ success: false, message: 'Please select a CSV file to import first.' });
            return;
        }

        setIsImporting(true);
        setImportResult(null);

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data as any[];
                    if (rows.length === 0) {
                        setImportResult({ success: false, message: 'The uploaded file is empty.' });
                        return;
                    }

                    if (activeTab === 'products') {
                        // Quick structural validation for Products
                        if (!rows[0].sku || !rows[0].name) {
                            throw new Error("Invalid format. Must contain 'sku' and 'name' header columns.");
                        }

                        // Map CSV rows to Product schema interface
                        const mappedProducts = rows.map(r => ({
                            sku: r.sku,
                            name: r.name,
                            type: r.type || 'simple',
                            brand: r.brand || '',
                            category: r.category || '',
                            status: r.status || 'Active',
                            costOfGoods: r.costOfGoods ? parseFloat(r.costOfGoods) : undefined,
                            msrpPrice: r.msrpPrice ? parseFloat(r.msrpPrice) : undefined,
                            description: r.description || ''
                        }));

                        await bulkImportProducts(mappedProducts);
                        setImportResult({ success: true, message: 'Products successfully imported into catalog.', rowsProcessed: rows.length });
                    }
                    else if (activeTab === 'inventory') {
                        if (!rows[0].sku || !rows[0].warehouseId) {
                            throw new Error("Invalid format. Must contain 'sku' and 'warehouseId' header columns.");
                        }
                        const validWarehouseIds = new Set(warehouses.map(w => w.id));
                        const badIds = [...new Set(rows.map((r: any) => r.warehouseId).filter((id: string) => !validWarehouseIds.has(id)))];
                        if (badIds.length > 0) {
                            throw new Error(`Unrecognised warehouse ID(s): ${badIds.join(', ')}. Only warehouses registered in Settings can be used.`);
                        }
                        const mappedInventory = rows.map(r => ({
                            sku: r.sku,
                            warehouseId: r.warehouseId,
                            locationCode: r.locationCode || undefined,
                            quantityOnHand: r.quantityOnHand ? parseFloat(r.quantityOnHand) : 0,
                            lotNumber: r.lotNumber || undefined,
                            expirationDate: r.expirationDate || undefined,
                            lotReceiveCost: r.lotReceiveCost ? parseFloat(r.lotReceiveCost) : undefined,
                        }));
                        await bulkImportInventory(mappedInventory);
                        setImportResult({ success: true, message: 'Inventory records successfully imported.', rowsProcessed: rows.length });
                    }
                    else if (activeTab === 'locations') {
                        // Quick structural validation for Locations
                        if (!rows[0].warehouseId || !rows[0].locationCode) {
                            throw new Error("Invalid format. Must contain 'warehouseId' and 'locationCode' header columns.");
                        }
                        const validWarehouseIds = new Set(warehouses.map(w => w.id));
                        const badIds = [...new Set(rows.map((r: any) => r.warehouseId).filter((id: string) => !validWarehouseIds.has(id)))];
                        if (badIds.length > 0) {
                            throw new Error(`Unrecognised warehouse ID(s): ${badIds.join(', ')}. Only warehouses registered in Settings can be used.`);
                        }

                        const mappedLocations = rows.map(r => ({
                            warehouseId: r.warehouseId,
                            locationCode: r.locationCode,
                            warehouseCode: r.warehouseId,
                            warehouseName: r.warehouseName || r.warehouseId, // Fallback
                            displayName: r.displayName || r.locationCode,
                            type: r.type || 'SHELF',
                            description: r.description || '',
                            aisle: r.aisle || '',
                            section: r.section || '',
                            shelf: r.shelf || '',
                            bin: r.bin || '',
                            barcodeValue: r.barcodeValue || r.locationCode,
                            isActive: r.isActive ? String(r.isActive).toLowerCase() === 'true' : true,
                            createdBy: 'System CSV Import',
                            updatedBy: 'System CSV Import'
                        }));

                        await bulkImportLocations(mappedLocations);
                        setImportResult({ success: true, message: 'Locations successfully generated.', rowsProcessed: rows.length });
                    }
                    else {
                        setImportResult({ success: false, message: `Bulk import is not yet visually configured for ${activeTab}.` });
                    }
                } catch (err: any) {
                    console.error("Import Parsing Error:", err);
                    setImportResult({ success: false, message: err.message || 'Failed to parse file mappings.' });
                } finally {
                    setIsImporting(false);
                    setSelectedFile(null); // Reset after import attempt
                }
            },
            error: (error) => {
                console.error("PapaParse Error:", error);
                setImportResult({ success: false, message: 'Failed to read the raw CSV file.' });
                setIsImporting(false);
            }
        });
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
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => downloadImportTemplate(activeTab, warehouses[0] ? { id: warehouses[0].id, name: warehouses[0].warehouseName } : undefined)}>Download Template</button>
                        <button 
                            className="btn btn-primary" 
                            style={{ flex: 1 }} 
                            onClick={handleImport}
                            disabled={isImporting}
                        >
                            {isImporting ? 'Processing...' : 'Import Data'}
                        </button>
                    </div>

                    {importResult && (
                        <div style={{
                            marginTop: '1.5rem', width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem',
                            backgroundColor: importResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: importResult.success ? '#047857' : '#b91c1c',
                            border: `1px solid ${importResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                {importResult.success ? 'Success' : 'Import Failed'}
                            </div>
                            <div>{importResult.message}</div>
                            {importResult.rowsProcessed !== undefined && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
                                    Processed {importResult.rowsProcessed} rows
                                </div>
                            )}
                        </div>
                    )}
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
