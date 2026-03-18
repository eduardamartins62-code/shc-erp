import type { Product } from '../types/products';
import type { InventoryItem } from '../types';
import type { Order } from '../types/orders';

// Helper to reliably enclose strings with commas in quotes
const escapeCSVField = (field: any): string => {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

// Generic trigger download function
const triggerDownload = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.setAttribute('download', filename);
    anchor.style.visibility = 'hidden';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};

export const exportProductsToCSV = (products: Product[], filename: string = 'products_export.csv') => {
    const headers = [
        'ID', 'SKU', 'Type', 'Name', 'UPC', 'Brand', 'Category', 'Subcategory',
        'Weight', 'Length', 'Width', 'Height', 'Cost of Goods', 'MAP Price', 'MSRP Price',
        'Status', 'Reorder Point', 'Preferred Supplier', 'Created At'
    ];

    const rows = products.map(p => [
        p.id,
        p.sku,
        p.type,
        p.name,
        p.upc || '',
        p.brand || '',
        p.category || '',
        p.subcategory || '',
        p.weight || '',
        p.length || '',
        p.width || '',
        p.height || '',
        p.costOfGoods || '',
        p.mapPrice || '',
        p.msrpPrice || '',
        p.status,
        p.reorderPoint || '',
        p.preferredSupplier || '',
        new Date(p.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    triggerDownload(csvContent, filename);
};

export const exportInventoryToCSV = (inventory: InventoryItem[], filename: string = 'inventory_export.csv') => {
    const headers = [
        'SKU (ID)', 'Warehouse ID', 'Quantity On Hand', 'Quantity Reserved', 'Quantity Available',
        'Lot Number', 'Expiration Date', 'Lot Receive Cost', 'Last Updated'
    ];

    const rows = inventory.map(item => [
        item.id,
        item.warehouseId,
        item.quantityOnHand,
        item.quantityReserved,
        item.quantityOnHand - item.quantityReserved, // calc available
        item.lotNumber,
        item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '',
        item.lotReceiveCost || '',
        new Date(item.lastUpdated).toLocaleDateString()
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    triggerDownload(csvContent, filename);
};


export const exportOrdersToCSV = (orders: Order[], filename: string = 'orders_export.csv') => {
    const headers = [
        'Order ID', 'Channel', 'Customer Name', 'Customer Email', 'Order Date',
        'Fulfillment Status', 'Payment Status', 'Subtotal', 'Tax', 'Total', 'Margin', 'Item Count'
    ];

    const rows = orders.map(order => [
        order.id,
        order.channel,
        order.customerName,
        order.customerEmail,
        new Date(order.orderDate).toLocaleDateString(),
        order.fulfillmentStatus,
        order.paymentStatus,
        order.subtotal,
        order.tax,
        order.total,
        order.margin,
        order.items.reduce((sum, item) => sum + item.quantity, 0)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    triggerDownload(csvContent, filename);
};

import type { WarehouseLocation } from '../types/locations';
import type { BundleComponent } from '../types/products';

// Template CSV downloads — headers match what the importer expects (camelCase)
export const downloadImportTemplate = (
    tab: 'products' | 'inventory' | 'locations' | 'orders' | 'kits',
    sampleWarehouse?: { id: string; name: string }
) => {
    let headers: string[];
    let sampleRows: string[][];
    let filename: string;

    switch (tab) {
        case 'products':
            headers = ['sku', 'name', 'type', 'brand', 'category', 'subcategory', 'status', 'upc', 'costOfGoods', 'mapPrice', 'msrpPrice', 'weight', 'length', 'width', 'height', 'reorderPoint', 'preferredSupplier', 'description'];
            sampleRows = [['SKU-001', 'Sample Product', 'simple', 'Acme', 'Electronics', 'Audio', 'Active', '012345678901', '10.00', '14.99', '19.99', '1.5', '10', '5', '3', '10', 'Supplier Co', 'A sample product description']];
            filename = 'products_import_template.csv';
            break;
        case 'locations': {
            const whId = sampleWarehouse?.id ?? 'REPLACE_WITH_WAREHOUSE_ID';
            const whName = sampleWarehouse?.name ?? 'Your Warehouse Name';
            headers = ['warehouseId', 'locationCode', 'warehouseName', 'displayName', 'type', 'description', 'aisle', 'section', 'shelf', 'bin', 'barcodeValue', 'isActive'];
            sampleRows = [[whId, 'A-01-01-A', whName, 'Aisle A Shelf 1 Bin A', 'SHELF', 'Primary shelf location', 'A', '01', '01', 'A', 'A-01-01-A', 'true']];
            filename = 'locations_import_template.csv';
            break;
        }
        case 'inventory':
            headers = ['sku', 'warehouseId', 'locationCode', 'quantityOnHand', 'lotNumber', 'expirationDate', 'lotReceiveCost'];
            sampleRows = [['SKU-001', 'WH-001', 'A-01-01-A', '100', 'LOT-2024-001', '2025-12-31', '10.00']];
            filename = 'inventory_import_template.csv';
            break;
        case 'orders':
            headers = ['orderId', 'channel', 'customerName', 'customerEmail', 'sku', 'quantity', 'unitPrice'];
            sampleRows = [['ORD-001', 'Shopify', 'John Doe', 'john@example.com', 'SKU-001', '2', '19.99']];
            filename = 'orders_import_template.csv';
            break;
        case 'kits':
            // Each row = one component of a kit/bundle.
            // Repeat bundleSku/bundleName/etc. for every component row of the same kit.
            headers = ['bundleSku', 'bundleName', 'type', 'brand', 'category', 'status', 'costOfGoods', 'msrpPrice', 'componentSku', 'quantityRequired'];
            sampleRows = [
                ['KIT-001', 'Starter Kit', 'bundle', 'Acme', 'Kits', 'Active', '25.00', '49.99', 'SKU-001', '2'],
                ['KIT-001', 'Starter Kit', 'bundle', 'Acme', 'Kits', 'Active', '25.00', '49.99', 'SKU-002', '1'],
                ['KIT-002', 'Pro Bundle', 'kit',    'Acme', 'Kits', 'Active', '45.00', '89.99', 'SKU-001', '1'],
                ['KIT-002', 'Pro Bundle', 'kit',    'Acme', 'Kits', 'Active', '45.00', '89.99', 'SKU-003', '3'],
            ];
            filename = 'kits_bundles_import_template.csv';
            break;
    }

    const csvContent = [
        headers.join(','),
        ...sampleRows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');
    triggerDownload(csvContent, filename);
};

export const exportLocationsToCSV = (locations: WarehouseLocation[], filename: string = 'locations_export.csv') => {
    const headers = [
        'ID', 'Warehouse ID', 'Warehouse Code', 'Location Code', 'Display Name', 'Type',
        'Description', 'Aisle', 'Section', 'Shelf', 'Bin', 'Barcode Value', 'Is Active', 'Created At'
    ];

    const rows = locations.map(loc => [
        loc.id,
        loc.warehouseId,
        loc.warehouseCode,
        loc.locationCode,
        loc.displayName || '',
        loc.type,
        loc.description || '',
        loc.aisle || '',
        loc.section || '',
        loc.shelf || '',
        loc.bin || '',
        loc.barcodeValue,
        loc.isActive ? 'Yes' : 'No',
        new Date(loc.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    triggerDownload(csvContent, filename);
};

/**
 * Exports all kit/bundle products with their component relationships.
 * One row per component — bundle info is repeated across each row for that kit.
 */
export const exportKitsToCSV = (
    products: Product[],
    bundleComponents: BundleComponent[],
    filename: string = 'kits_bundles_export.csv'
) => {
    const headers = [
        'bundleSku', 'bundleName', 'type', 'brand', 'category', 'status',
        'costOfGoods', 'msrpPrice', 'componentSku', 'componentName', 'quantityRequired'
    ];

    const kitProducts = products.filter(p => p.type === 'bundle' || p.type === 'kit');

    const rows: string[][] = [];
    for (const kit of kitProducts) {
        const components = bundleComponents.filter(c => c.bundleProductId === kit.id || c.bundleProductId === kit.sku);
        if (components.length === 0) {
            rows.push([
                kit.sku, kit.name, kit.type, kit.brand || '', kit.category || '', kit.status,
                String(kit.costOfGoods ?? ''), String(kit.msrpPrice ?? ''), '', '', ''
            ]);
        } else {
            for (const comp of components) {
                const compProduct = products.find(p => p.id === comp.componentProductId || p.sku === comp.componentProductId);
                rows.push([
                    kit.sku, kit.name, kit.type, kit.brand || '', kit.category || '', kit.status,
                    String(kit.costOfGoods ?? ''), String(kit.msrpPrice ?? ''),
                    compProduct?.sku || comp.componentProductId,
                    compProduct?.name || '',
                    String(comp.quantityRequiredPerBundle)
                ]);
            }
        }
    }

    const csvContent = rows.length === 0
        ? headers.join(',')
        : [headers.join(','), ...rows.map(row => row.map(escapeCSVField).join(','))].join('\n');

    triggerDownload(csvContent, filename);
};
