import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Download, FileText, Database, Package, ShoppingCart, MapPin, X, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useLocations } from '../context/LocationContext';
import { useOrders } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import Papa from 'papaparse';
import { exportProductsToCSV, exportInventoryToCSV, exportOrdersToCSV, exportLocationsToCSV, exportKitsToCSV, downloadImportTemplate } from '../utils/csvExport';
import { api } from '../services/api';

type TabType = 'products' | 'inventory' | 'locations' | 'orders' | 'kits';

interface ImportJob {
    id: string;
    createdAt: string;
    jobType: string;
    entity: string;
    status: string;
    recordsProcessed: number;
    totalRecords: number;
    errorMessage: string | null;
    fileName: string | null;
    fileContent: string | null;
    performedBy: string;
}

const DataManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const { can, levelFor } = usePermissions(currentUser);
    const canEdit = can('dataManagement', 'edit');
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string; rowsProcessed?: number } | null>(null);
    const [jobs, setJobs] = useState<ImportJob[]>([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [logModal, setLogModal] = useState<ImportJob | null>(null);

    // Bring in data contexts
    const { products, bundleComponents, bulkImportProducts } = useProducts();
    const { inventory, bulkImportInventory } = useInventory();
    const { locations, bulkImportLocations } = useLocations();
    const { orders } = useOrders();
    const { warehouses } = useSettings();

    const tabs = [
        { id: 'products', label: 'Products', icon: <Package size={18} /> },
        { id: 'inventory', label: 'Inventory', icon: <Database size={18} /> },
        { id: 'locations', label: 'Locations', icon: <MapPin size={18} /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
        { id: 'kits', label: 'Kits & Bundles', icon: <Layers size={18} /> },
    ];

    const loadJobs = useCallback(async () => {
        try {
            setJobsLoading(true);
            const data = await api.fetchImportJobs();
            setJobs(data);
        } catch (e) {
            console.error('Failed to load import jobs', e);
        } finally {
            setJobsLoading(false);
        }
    }, []);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        // Read content so we can store it for re-download later
        const reader = new FileReader();
        reader.onload = (e) => setSelectedFileContent(e.target?.result as string ?? null);
        reader.readAsText(file);
    };

    const downloadFileContent = (job: ImportJob) => {
        if (!job.fileContent) return;
        const blob = new Blob([job.fileContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = job.fileName || `${job.entity}-import.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
                const rows = results.data as any[];
                const fileName = selectedFile.name;
                const fileContent = selectedFileContent || '';
                let success = false;
                let errorMessage: string | undefined;
                let rowsProcessed = 0;

                try {
                    if (rows.length === 0) {
                        throw new Error('The uploaded file is empty.');
                    }

                    if (activeTab === 'products') {
                        if (!rows[0].sku || !rows[0].name) {
                            throw new Error("Invalid format. Must contain 'sku' and 'name' header columns.");
                        }
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
                        rowsProcessed = rows.length;
                        success = true;
                        setImportResult({ success: true, message: 'Products successfully imported into catalog.', rowsProcessed });
                    }
                    else if (activeTab === 'inventory') {
                        if (!rows[0].sku || !rows[0].warehouseId) {
                            throw new Error("Invalid format. Must contain 'sku' and 'warehouseId' header columns.");
                        }
                        // Validate warehouse IDs
                        const validWarehouseIds = new Set(warehouses.map(w => w.id));
                        const badIds = Array.from(new Set(rows.map((r: any) => r.warehouseId).filter((id: string) => !validWarehouseIds.has(id))));
                        if (badIds.length > 0) {
                            throw new Error(`Unrecognised warehouse ID(s): ${badIds.join(', ')}. Only warehouses registered in Settings can be used.`);
                        }
                        // Validate location codes — any locationCode in the CSV must exist
                        // in the locations table for that warehouse. Rows without a locationCode are fine.
                        const rowsWithLocation = rows.filter((r: any) => r.locationCode && String(r.locationCode).trim());
                        if (rowsWithLocation.length > 0) {
                            const badLocations: string[] = [];
                            rowsWithLocation.forEach((r: any) => {
                                const exists = locations.some(
                                    l => l.warehouseId === r.warehouseId &&
                                         l.locationCode === String(r.locationCode).trim() &&
                                         l.isActive
                                );
                                if (!exists) {
                                    const label = `"${r.locationCode}" in warehouse ${r.warehouseId}`;
                                    if (!badLocations.includes(label)) badLocations.push(label);
                                }
                            });
                            if (badLocations.length > 0) {
                                throw new Error(
                                    `Location code(s) not found in the system: ${badLocations.join(', ')}. ` +
                                    `Add these locations under Settings > Locations before importing, or remove the locationCode column from your sheet.`
                                );
                            }
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
                        rowsProcessed = rows.length;
                        success = true;
                        setImportResult({ success: true, message: 'Inventory records successfully imported.', rowsProcessed });
                    }
                    else if (activeTab === 'locations') {
                        if (!rows[0].warehouseId || !rows[0].locationCode) {
                            throw new Error("Invalid format. Must contain 'warehouseId' and 'locationCode' header columns.");
                        }
                        const validWarehouseIds = new Set(warehouses.map(w => w.id));
                        const badIds = Array.from(new Set(rows.map((r: any) => r.warehouseId).filter((id: string) => !validWarehouseIds.has(id))));
                        if (badIds.length > 0) {
                            throw new Error(`Unrecognised warehouse ID(s): ${badIds.join(', ')}. Only warehouses registered in Settings can be used.`);
                        }
                        const mappedLocations = rows.map(r => ({
                            warehouseId: r.warehouseId,
                            locationCode: r.locationCode,
                            warehouseCode: r.warehouseId,
                            warehouseName: r.warehouseName || r.warehouseId,
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
                        rowsProcessed = rows.length;
                        success = true;
                        setImportResult({ success: true, message: 'Locations successfully imported.', rowsProcessed });
                    }
                    else if (activeTab === 'kits') {
                        if (!rows[0].bundleSku || !rows[0].componentSku || !rows[0].quantityRequired) {
                            throw new Error("Invalid format. Must contain 'bundleSku', 'componentSku', and 'quantityRequired' columns.");
                        }

                        // Validate all component SKUs exist in the product catalog
                        const existingSkus = new Set(products.map(p => p.sku));
                        const missingComponentSkus = Array.from(new Set(
                            rows.map((r: any) => r.componentSku?.trim()).filter((sku: string) => sku && !existingSkus.has(sku))
                        ));
                        if (missingComponentSkus.length > 0) {
                            throw new Error(
                                `Component SKU(s) not found in the product catalog: ${missingComponentSkus.join(', ')}. ` +
                                `Import those products first before creating kits that reference them.`
                            );
                        }

                        // Group rows by bundleSku to upsert bundle products + their components
                        const bundleMap = new Map<string, { rows: any[] }>();
                        rows.forEach((r: any) => {
                            const bSku = r.bundleSku?.trim();
                            if (!bSku) return;
                            if (!bundleMap.has(bSku)) bundleMap.set(bSku, { rows: [] });
                            bundleMap.get(bSku)!.rows.push(r);
                        });

                        // 1. Upsert the bundle products themselves
                        const bundleProducts = Array.from(bundleMap.entries()).map(([bSku, { rows: bRows }]) => {
                            const r = bRows[0]; // first row has the bundle-level info
                            return {
                                sku: bSku,
                                name: r.bundleName || bSku,
                                type: 'bundle' as const,
                                brand: r.brand || '',
                                category: r.category || '',
                                status: (r.status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
                                costOfGoods: r.costOfGoods ? parseFloat(r.costOfGoods) : undefined,
                                msrpPrice: r.msrpPrice ? parseFloat(r.msrpPrice) : undefined,
                                description: r.description || '',
                            };
                        });
                        await bulkImportProducts(bundleProducts);

                        // 2. Upsert component relationships — use bundleSku as bundleProductId
                        // (the api method will do delete+insert to cleanly replace components)
                        const componentRows = rows.map((r: any) => ({
                            bundleProductId: r.bundleSku?.trim(),
                            componentProductId: r.componentSku?.trim(),
                            quantityRequiredPerBundle: parseFloat(r.quantityRequired) || 1,
                        })).filter((c: any) => c.bundleProductId && c.componentProductId);

                        await api.bulkImportKitComponents(componentRows);

                        rowsProcessed = rows.length;
                        success = true;
                        const kitCount = bundleMap.size;
                        setImportResult({
                            success: true,
                            message: `Successfully imported ${kitCount} bundle${kitCount !== 1 ? 's' : ''} with ${rows.length} component row${rows.length !== 1 ? 's' : ''}.`,
                            rowsProcessed,
                        });
                    }
                    else {
                        throw new Error(`Import for '${activeTab}' is not yet configured.`);
                    }
                } catch (err: any) {
                    console.error('Import Error:', err);
                    errorMessage = err.message || 'Unknown error occurred.';
                    setImportResult({ success: false, message: errorMessage! });
                } finally {
                    // Log every attempt to Supabase
                    await api.logImportJob({
                        jobType: 'import',
                        entity: activeTab,
                        status: success ? 'completed' : 'failed',
                        recordsProcessed: rowsProcessed,
                        totalRecords: rows.length,
                        errorMessage,
                        fileName,
                        fileContent,
                        performedBy: 'System Admin',
                    });
                    await loadJobs(); // Refresh the jobs list
                    setIsImporting(false);
                    setSelectedFile(null);
                    setSelectedFileContent(null);
                }
            },
            error: (error) => {
                console.error('PapaParse Error:', error);
                setImportResult({ success: false, message: 'Failed to read the CSV file.' });
                api.logImportJob({
                    jobType: 'import', entity: activeTab, status: 'failed',
                    recordsProcessed: 0, totalRecords: 0,
                    errorMessage: 'Failed to read the CSV file: ' + error.message,
                    fileName: selectedFile?.name,
                    fileContent: selectedFileContent || undefined,
                });
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
            case 'kits':
                exportKitsToCSV(products, bundleComponents);
                break;
        }
    };

    if (levelFor('dataManagement') === 'none') return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to view Data Management. Contact your administrator.</p>
        </div>
    );

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
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: canEdit ? 1 : 0.5, pointerEvents: canEdit ? undefined : 'none' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Import / Export History</h2>
                    <button
                        className="btn-secondary"
                        onClick={loadJobs}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {jobsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading job history…</div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No import/export jobs recorded yet. Run an import above to see history here.
                    </div>
                ) : (
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    {['Date & Time', 'Type', 'Entity', 'Status', 'Records', 'User', 'Actions'].map(h => (
                                        <th key={h} style={{ backgroundColor: 'var(--color-primary-dark)', color: '#fff', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => {
                                    const isFailed = job.status === 'failed';
                                    const isImport = job.jobType === 'import';
                                    return (
                                        <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                {new Date(job.createdAt).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                    backgroundColor: isImport ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                                                    color: isImport ? '#3b82f6' : '#10b981',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {job.jobType}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                {job.entity}
                                                {job.fileName && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{job.fileName}</div>}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                    backgroundColor: isFailed ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                                    color: isFailed ? '#ef4444' : '#10b981',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                                                {isFailed
                                                    ? <span style={{ color: '#ef4444' }}>0 / {job.totalRecords}</span>
                                                    : job.recordsProcessed.toLocaleString()
                                                }
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{job.performedBy}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {(isFailed || job.errorMessage) && (
                                                        <button
                                                            onClick={() => setLogModal(job)}
                                                            style={{
                                                                padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer',
                                                                border: '1px solid #ef4444', color: '#ef4444', background: 'none',
                                                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                            }}
                                                        >
                                                            <AlertCircle size={12} /> View Error
                                                        </button>
                                                    )}
                                                    {job.fileContent && (
                                                        <button
                                                            onClick={() => downloadFileContent(job)}
                                                            style={{
                                                                padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer',
                                                                border: '1px solid var(--color-border)', color: 'var(--color-text-main)', background: 'none',
                                                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                            }}
                                                        >
                                                            <Download size={12} /> Download File
                                                        </button>
                                                    )}
                                                    {!isFailed && !job.fileContent && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Error Log Modal */}
            {logModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '560px', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={18} color="#ef4444" />
                                Import Error — {logModal.entity} · {new Date(logModal.createdAt).toLocaleString()}
                            </h3>
                            <button onClick={() => setLogModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>File: {logModal.fileName || '—'}</div>
                            <pre style={{
                                backgroundColor: 'var(--color-bg-light)', border: '1px solid var(--color-border)',
                                borderRadius: '6px', padding: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word', maxHeight: '300px', overflowY: 'auto',
                                color: '#b91c1c', margin: 0
                            }}>
                                {logModal.errorMessage || 'No error details available.'}
                            </pre>
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--color-bg-light)' }}>
                            {logModal.fileContent && (
                                <button className="btn-secondary" onClick={() => downloadFileContent(logModal)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Download size={14} /> Download Original File
                                </button>
                            )}
                            <button className="btn-primary" onClick={() => setLogModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataManagement;
