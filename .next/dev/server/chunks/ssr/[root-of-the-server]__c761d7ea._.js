module.exports = [
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/src/utils/csvExport.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportInventoryToCSV",
    ()=>exportInventoryToCSV,
    "exportLocationsToCSV",
    ()=>exportLocationsToCSV,
    "exportOrdersToCSV",
    ()=>exportOrdersToCSV,
    "exportProductsToCSV",
    ()=>exportProductsToCSV
]);
// Helper to reliably enclose strings with commas in quotes
const escapeCSVField = (field)=>{
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};
// Generic trigger download function
const triggerDownload = (csvContent, filename)=>{
    const blob = new Blob([
        csvContent
    ], {
        type: 'text/csv;charset=utf-8;'
    });
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
const exportProductsToCSV = (products, filename = 'products_export.csv')=>{
    const headers = [
        'ID',
        'SKU',
        'Type',
        'Name',
        'UPC',
        'Brand',
        'Category',
        'Subcategory',
        'Weight',
        'Length',
        'Width',
        'Height',
        'Cost of Goods',
        'MAP Price',
        'MSRP Price',
        'Status',
        'Reorder Point',
        'Preferred Supplier',
        'Created At'
    ];
    const rows = products.map((p)=>[
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
        ...rows.map((row)=>row.map(escapeCSVField).join(','))
    ].join('\n');
    triggerDownload(csvContent, filename);
};
const exportInventoryToCSV = (inventory, filename = 'inventory_export.csv')=>{
    const headers = [
        'SKU (ID)',
        'Warehouse ID',
        'Quantity On Hand',
        'Quantity Reserved',
        'Quantity Available',
        'Lot Number',
        'Expiration Date',
        'Lot Receive Cost',
        'Last Updated'
    ];
    const rows = inventory.map((item)=>[
            item.id,
            item.warehouseId,
            item.quantityOnHand,
            item.quantityReserved,
            item.quantityOnHand - item.quantityReserved,
            item.lotNumber,
            item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '',
            item.lotReceiveCost || '',
            new Date(item.lastUpdated).toLocaleDateString()
        ]);
    const csvContent = [
        headers.join(','),
        ...rows.map((row)=>row.map(escapeCSVField).join(','))
    ].join('\n');
    triggerDownload(csvContent, filename);
};
const exportOrdersToCSV = (orders, filename = 'orders_export.csv')=>{
    const headers = [
        'Order ID',
        'Channel',
        'Customer Name',
        'Customer Email',
        'Order Date',
        'Fulfillment Status',
        'Payment Status',
        'Subtotal',
        'Tax',
        'Total',
        'Margin',
        'Item Count'
    ];
    const rows = orders.map((order)=>[
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
            order.items.reduce((sum, item)=>sum + item.quantity, 0)
        ]);
    const csvContent = [
        headers.join(','),
        ...rows.map((row)=>row.map(escapeCSVField).join(','))
    ].join('\n');
    triggerDownload(csvContent, filename);
};
const exportLocationsToCSV = (locations, filename = 'locations_export.csv')=>{
    const headers = [
        'ID',
        'Warehouse ID',
        'Warehouse Code',
        'Location Code',
        'Display Name',
        'Type',
        'Description',
        'Aisle',
        'Section',
        'Shelf',
        'Bin',
        'Barcode Value',
        'Is Active',
        'Created At'
    ];
    const rows = locations.map((loc)=>[
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
        ...rows.map((row)=>row.map(escapeCSVField).join(','))
    ].join('\n');
    triggerDownload(csvContent, filename);
};
}),
"[project]/src/views/DataManagement.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-ssr] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ProductContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ProductContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/InventoryContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LocationContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/LocationContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$OrderContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/OrderContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$csvExport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/csvExport.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const DataManagement = ()=>{
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('products');
    const [selectedFile, setSelectedFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isImporting, setIsImporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [importResult, setImportResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Bring in data contexts
    const { products, bulkImportProducts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ProductContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProducts"])();
    const { inventory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInventory"])();
    const { locations, bulkImportLocations } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LocationContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLocations"])();
    const { orders } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$OrderContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOrders"])();
    const tabs = [
        {
            id: 'products',
            label: 'Products',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                size: 18
            }, void 0, false, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 25,
                columnNumber: 52
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: 'inventory',
            label: 'Inventory',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                size: 18
            }, void 0, false, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 26,
                columnNumber: 54
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: 'locations',
            label: 'Locations',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                size: 18
            }, void 0, false, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 27,
                columnNumber: 54
            }, ("TURBOPACK compile-time value", void 0))
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                size: 18
            }, void 0, false, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 28,
                columnNumber: 48
            }, ("TURBOPACK compile-time value", void 0))
        }
    ];
    const handleFileSelect = (event)=>{
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };
    const handleImport = async ()=>{
        if (!selectedFile) {
            setImportResult({
                success: false,
                message: 'Please select a CSV file to import first.'
            });
            return;
        }
        setIsImporting(true);
        setImportResult(null);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results)=>{
                try {
                    const rows = results.data;
                    if (rows.length === 0) {
                        setImportResult({
                            success: false,
                            message: 'The uploaded file is empty.'
                        });
                        return;
                    }
                    if (activeTab === 'products') {
                        // Quick structural validation for Products
                        if (!rows[0].sku || !rows[0].name) {
                            throw new Error("Invalid format. Must contain 'sku' and 'name' header columns.");
                        }
                        // Map CSV rows to Product schema interface
                        const mappedProducts = rows.map((r)=>({
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
                        bulkImportProducts(mappedProducts);
                        setImportResult({
                            success: true,
                            message: 'Products successfully imported into catalog.',
                            rowsProcessed: rows.length
                        });
                    } else if (activeTab === 'locations') {
                        // Quick structural validation for Locations
                        if (!rows[0].warehouseId || !rows[0].locationCode) {
                            throw new Error("Invalid format. Must contain 'warehouseId' and 'locationCode' header columns.");
                        }
                        const mappedLocations = rows.map((r)=>({
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
                        setImportResult({
                            success: true,
                            message: 'Locations successfully generated.',
                            rowsProcessed: rows.length
                        });
                    } else {
                        setImportResult({
                            success: false,
                            message: `Bulk import is not yet visually configured for ${activeTab}.`
                        });
                    }
                } catch (err) {
                    console.error("Import Parsing Error:", err);
                    setImportResult({
                        success: false,
                        message: err.message || 'Failed to parse file mappings.'
                    });
                } finally{
                    setIsImporting(false);
                    setSelectedFile(null); // Reset after import attempt
                }
            },
            error: (error)=>{
                console.error("PapaParse Error:", error);
                setImportResult({
                    success: false,
                    message: 'Failed to read the raw CSV file.'
                });
                setIsImporting(false);
            }
        });
    };
    const handleExport = ()=>{
        switch(activeTab){
            case 'products':
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$csvExport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportProductsToCSV"])(products);
                break;
            case 'inventory':
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$csvExport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportInventoryToCSV"])(inventory);
                break;
            case 'locations':
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$csvExport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportLocationsToCSV"])(locations);
                break;
            case 'orders':
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$csvExport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportOrdersToCSV"])(orders);
                break;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "data-management-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '1rem'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        minWidth: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: 'var(--color-text-muted)',
                                letterSpacing: '0.06em',
                                marginBottom: '4px'
                            },
                            children: "Data Operations"
                        }, void 0, false, {
                            fileName: "[project]/src/views/DataManagement.tsx",
                            lineNumber: 146,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                fontSize: '28px',
                                fontWeight: 'bold',
                                letterSpacing: '-0.02em',
                                color: 'var(--color-text-main)',
                                margin: '0 0 4px 0'
                            },
                            children: "Data Management"
                        }, void 0, false, {
                            fileName: "[project]/src/views/DataManagement.tsx",
                            lineNumber: 149,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: 'var(--color-text-muted)',
                                fontSize: '14px',
                                margin: 0
                            },
                            children: "Import and export bulk data across different modules of the ERP system."
                        }, void 0, false, {
                            fileName: "[project]/src/views/DataManagement.tsx",
                            lineNumber: 152,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/DataManagement.tsx",
                    lineNumber: 145,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 144,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '0.5rem'
                },
                children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab(tab.id),
                        style: {
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
                            transition: 'all 0.2s ease'
                        },
                        children: [
                            tab.icon,
                            tab.label
                        ]
                    }, tab.id, true, {
                        fileName: "[project]/src/views/DataManagement.tsx",
                        lineNumber: 161,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 159,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem',
                    marginBottom: '3rem'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                    size: 32
                                }, void 0, false, {
                                    fileName: "[project]/src/views/DataManagement.tsx",
                                    lineNumber: 188,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 187,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '1.25rem',
                                    marginBottom: '1rem'
                                },
                                children: [
                                    "Import ",
                                    tabs.find((t)=>t.id === activeTab)?.label
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 190,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '2rem',
                                    fontSize: '0.875rem',
                                    maxWidth: '300px'
                                },
                                children: [
                                    "Upload a CSV file to bulk import or update existing ",
                                    activeTab,
                                    " records in the system."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 191,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "import-dropzone",
                                style: {
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
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: ".csv",
                                        style: {
                                            display: 'none'
                                        },
                                        onChange: handleFileSelect
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 210,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                        size: 24,
                                        color: selectedFile ? '#3b82f6' : 'var(--color-text-muted)',
                                        style: {
                                            marginBottom: '0.5rem',
                                            margin: '0 auto'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 216,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: selectedFile ? 'var(--color-text-main)' : 'inherit'
                                        },
                                        children: selectedFile ? selectedFile.name : 'Click to browse or drag file here'
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 217,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-muted)',
                                            marginTop: '0.25rem'
                                        },
                                        children: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supported format: .csv'
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 220,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 195,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: '1rem',
                                    width: '100%'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn btn-secondary",
                                        style: {
                                            flex: 1
                                        },
                                        children: "Download Template"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 226,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn btn-primary",
                                        style: {
                                            flex: 1
                                        },
                                        onClick: handleImport,
                                        disabled: isImporting,
                                        children: isImporting ? 'Processing...' : 'Import Data'
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 227,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 225,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            importResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '1.5rem',
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    backgroundColor: importResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: importResult.success ? '#047857' : '#b91c1c',
                                    border: `1px solid ${importResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 600,
                                            marginBottom: '0.25rem'
                                        },
                                        children: importResult.success ? 'Success' : 'Import Failed'
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 244,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: importResult.message
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 247,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    importResult.rowsProcessed !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '0.5rem',
                                            fontSize: '0.75rem',
                                            opacity: 0.8
                                        },
                                        children: [
                                            "Processed ",
                                            importResult.rowsProcessed,
                                            " rows"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 249,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 238,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/DataManagement.tsx",
                        lineNumber: 186,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card",
                        style: {
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    size: 32
                                }, void 0, false, {
                                    fileName: "[project]/src/views/DataManagement.tsx",
                                    lineNumber: 260,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 259,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '1.25rem',
                                    marginBottom: '1rem'
                                },
                                children: [
                                    "Export ",
                                    tabs.find((t)=>t.id === activeTab)?.label
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 262,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '2rem',
                                    fontSize: '0.875rem',
                                    maxWidth: '300px'
                                },
                                children: [
                                    "Download a comprehensive CSV export of all your ",
                                    activeTab,
                                    " data for reporting or backup."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 263,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '100%',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    textAlign: 'left'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '0.875rem',
                                            marginBottom: '1rem',
                                            fontWeight: 600
                                        },
                                        children: "Export Options:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 268,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.875rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                name: "export-scope",
                                                defaultChecked: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 270,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            " All Records"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 269,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            fontSize: '0.875rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                name: "export-scope"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 273,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            " Filtered View (Current List)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 272,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.875rem'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                defaultChecked: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 276,
                                                columnNumber: 29
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            " Include inactive records"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 275,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 267,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-primary",
                                style: {
                                    width: '100%',
                                    marginTop: 'auto'
                                },
                                onClick: handleExport,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 281,
                                        columnNumber: 25
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " Generate Export"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/DataManagement.tsx",
                                lineNumber: 280,
                                columnNumber: 21
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/DataManagement.tsx",
                        lineNumber: 258,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 184,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            fontSize: '1.25rem',
                            marginBottom: '1.5rem'
                        },
                        children: "Recent Data Jobs"
                    }, void 0, false, {
                        fileName: "[project]/src/views/DataManagement.tsx",
                        lineNumber: 288,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "table-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Date & Time"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 293,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Job Type"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 294,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Entity"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 295,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 296,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Records Processed"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 297,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "User"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 298,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/DataManagement.tsx",
                                                lineNumber: 299,
                                                columnNumber: 33
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/DataManagement.tsx",
                                        lineNumber: 292,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/DataManagement.tsx",
                                    lineNumber: 291,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: new Date().toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3b82f6'
                                                        },
                                                        children: "Import"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "Products"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#10b981'
                                                        },
                                                        children: "Completed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 307,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "1,245"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 308,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "System Admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn btn-secondary btn-sm",
                                                        children: "View Log"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 311,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/views/DataManagement.tsx",
                                            lineNumber: 303,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: new Date(Date.now() - 86400000).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#10b981'
                                                        },
                                                        children: "Export"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "Inventory"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 317,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#10b981'
                                                        },
                                                        children: "Completed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "8,432"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "Manager User"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn btn-secondary btn-sm",
                                                        children: "Download File"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/views/DataManagement.tsx",
                                            lineNumber: 314,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: new Date(Date.now() - 172800000).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 326,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3b82f6'
                                                        },
                                                        children: "Import"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 327,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 327,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "Locations"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                            color: '#ef4444'
                                                        },
                                                        children: "Failed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 329,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "0 / 150"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: "System Admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn btn-secondary btn-sm",
                                                        style: {
                                                            color: '#ef4444',
                                                            borderColor: '#ef4444'
                                                        },
                                                        children: "View Errors"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/DataManagement.tsx",
                                                        lineNumber: 333,
                                                        columnNumber: 37
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/DataManagement.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/views/DataManagement.tsx",
                                            lineNumber: 325,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/DataManagement.tsx",
                                    lineNumber: 302,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/DataManagement.tsx",
                            lineNumber: 290,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/views/DataManagement.tsx",
                        lineNumber: 289,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/DataManagement.tsx",
                lineNumber: 287,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/DataManagement.tsx",
        lineNumber: 143,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = DataManagement;
}),
"[project]/src/app/data-management/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$DataManagement$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/views/DataManagement.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$views$2f$DataManagement$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/data-management/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Upload
]);
/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 3v12",
            key: "1x0j5s"
        }
    ],
    [
        "path",
        {
            d: "m17 8-5-5-5 5",
            key: "7q97r8"
        }
    ],
    [
        "path",
        {
            d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
            key: "ih7n3h"
        }
    ]
];
const Upload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("upload", __iconNode);
;
 //# sourceMappingURL=upload.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Upload",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Download
]);
/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 15V3",
            key: "m9g1x1"
        }
    ],
    [
        "path",
        {
            d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
            key: "ih7n3h"
        }
    ],
    [
        "path",
        {
            d: "m7 10 5 5 5-5",
            key: "brsn70"
        }
    ]
];
const Download = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("download", __iconNode);
;
 //# sourceMappingURL=download.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript) <export default as Download>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Download",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>FileText
]);
/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
            key: "1oefj6"
        }
    ],
    [
        "path",
        {
            d: "M14 2v5a1 1 0 0 0 1 1h5",
            key: "wfsgrz"
        }
    ],
    [
        "path",
        {
            d: "M10 9H8",
            key: "b1mrlr"
        }
    ],
    [
        "path",
        {
            d: "M16 13H8",
            key: "t4e002"
        }
    ],
    [
        "path",
        {
            d: "M16 17H8",
            key: "z1uh3a"
        }
    ]
];
const FileText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("file-text", __iconNode);
;
 //# sourceMappingURL=file-text.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileText",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Database
]);
/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "ellipse",
        {
            cx: "12",
            cy: "5",
            rx: "9",
            ry: "3",
            key: "msslwz"
        }
    ],
    [
        "path",
        {
            d: "M3 5V19A9 3 0 0 0 21 19V5",
            key: "1wlel7"
        }
    ],
    [
        "path",
        {
            d: "M3 12A9 3 0 0 0 21 12",
            key: "mv7ke4"
        }
    ]
];
const Database = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("database", __iconNode);
;
 //# sourceMappingURL=database.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript) <export default as Database>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Database",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/ (function(root, factory) {
    /* globals define */ if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        ((r)=>r !== undefined && __turbopack_context__.v(r))(factory());
    } else if ("TURBOPACK compile-time truthy", 1) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else //TURBOPACK unreachable
    ;
// in strict mode we cannot access arguments.callee, so we need a named reference to
// stringify the factory method for the blob worker
// eslint-disable-next-line func-name
})(/*TURBOPACK member replacement*/ __turbopack_context__.e, function moduleFactory() {
    'use strict';
    var global = function() {
        // alternative method, similar to `Function('return this')()`
        // but without using `eval` (which is disabled when
        // using Content Security Policy).
        if (typeof self !== 'undefined') {
            return self;
        }
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        if (typeof global !== 'undefined') {
            return global;
        }
        // When running tests none of the above have been defined
        return {};
    }();
    function getWorkerBlob() {
        var URL = global.URL || global.webkitURL || null;
        var code = moduleFactory.toString();
        return Papa.BLOB_URL || (Papa.BLOB_URL = URL.createObjectURL(new Blob([
            "var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ",
            '(',
            code,
            ')();'
        ], {
            type: 'text/javascript'
        })));
    }
    var IS_WORKER = !global.document && !!global.postMessage, IS_PAPA_WORKER = global.IS_PAPA_WORKER || false;
    var workers = {}, workerIdCounter = 0;
    var Papa = {};
    Papa.parse = CsvToJson;
    Papa.unparse = JsonToCsv;
    Papa.RECORD_SEP = String.fromCharCode(30);
    Papa.UNIT_SEP = String.fromCharCode(31);
    Papa.BYTE_ORDER_MARK = '\ufeff';
    Papa.BAD_DELIMITERS = [
        '\r',
        '\n',
        '"',
        Papa.BYTE_ORDER_MARK
    ];
    Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
    Papa.NODE_STREAM_INPUT = 1;
    // Configurable chunk sizes for local and remote files, respectively
    Papa.LocalChunkSize = 1024 * 1024 * 10; // 10 MB
    Papa.RemoteChunkSize = 1024 * 1024 * 5; // 5 MB
    Papa.DefaultDelimiter = ','; // Used if not specified and detection fails
    // Exposed for testing and development only
    Papa.Parser = Parser;
    Papa.ParserHandle = ParserHandle;
    Papa.NetworkStreamer = NetworkStreamer;
    Papa.FileStreamer = FileStreamer;
    Papa.StringStreamer = StringStreamer;
    Papa.ReadableStreamStreamer = ReadableStreamStreamer;
    if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
        Papa.DuplexStreamStreamer = DuplexStreamStreamer;
    }
    if (global.jQuery) {
        var $ = global.jQuery;
        $.fn.parse = function(options) {
            var config = options.config || {};
            var queue = [];
            this.each(function(idx) {
                var supported = $(this).prop('tagName').toUpperCase() === 'INPUT' && $(this).attr('type').toLowerCase() === 'file' && global.FileReader;
                if (!supported || !this.files || this.files.length === 0) return true; // continue to next input element
                for(var i = 0; i < this.files.length; i++){
                    queue.push({
                        file: this.files[i],
                        inputElem: this,
                        instanceConfig: $.extend({}, config)
                    });
                }
            });
            parseNextFile(); // begin parsing
            return this; // maintains chainability
            //TURBOPACK unreachable
            ;
            function parseNextFile() {
                if (queue.length === 0) {
                    if (isFunction(options.complete)) options.complete();
                    return;
                }
                var f = queue[0];
                if (isFunction(options.before)) {
                    var returned = options.before(f.file, f.inputElem);
                    if (typeof returned === 'object') {
                        if (returned.action === 'abort') {
                            error('AbortError', f.file, f.inputElem, returned.reason);
                            return; // Aborts all queued files immediately
                        } else if (returned.action === 'skip') {
                            fileComplete(); // parse the next file in the queue, if any
                            return;
                        } else if (typeof returned.config === 'object') f.instanceConfig = $.extend(f.instanceConfig, returned.config);
                    } else if (returned === 'skip') {
                        fileComplete(); // parse the next file in the queue, if any
                        return;
                    }
                }
                // Wrap up the user's complete callback, if any, so that ours also gets executed
                var userCompleteFunc = f.instanceConfig.complete;
                f.instanceConfig.complete = function(results) {
                    if (isFunction(userCompleteFunc)) userCompleteFunc(results, f.file, f.inputElem);
                    fileComplete();
                };
                Papa.parse(f.file, f.instanceConfig);
            }
            function error(name, file, elem, reason) {
                if (isFunction(options.error)) options.error({
                    name: name
                }, file, elem, reason);
            }
            function fileComplete() {
                queue.splice(0, 1);
                parseNextFile();
            }
        };
    }
    if (IS_PAPA_WORKER) {
        global.onmessage = workerThreadReceivedMessage;
    }
    function CsvToJson(_input, _config) {
        _config = _config || {};
        var dynamicTyping = _config.dynamicTyping || false;
        if (isFunction(dynamicTyping)) {
            _config.dynamicTypingFunction = dynamicTyping;
            // Will be filled on first row call
            dynamicTyping = {};
        }
        _config.dynamicTyping = dynamicTyping;
        _config.transform = isFunction(_config.transform) ? _config.transform : false;
        if (_config.worker && Papa.WORKERS_SUPPORTED) {
            var w = newWorker();
            w.userStep = _config.step;
            w.userChunk = _config.chunk;
            w.userComplete = _config.complete;
            w.userError = _config.error;
            _config.step = isFunction(_config.step);
            _config.chunk = isFunction(_config.chunk);
            _config.complete = isFunction(_config.complete);
            _config.error = isFunction(_config.error);
            delete _config.worker; // prevent infinite loop
            w.postMessage({
                input: _input,
                config: _config,
                workerId: w.id
            });
            return;
        }
        var streamer = null;
        if (_input === Papa.NODE_STREAM_INPUT && typeof PAPA_BROWSER_CONTEXT === 'undefined') {
            // create a node Duplex stream for use
            // with .pipe
            streamer = new DuplexStreamStreamer(_config);
            return streamer.getStream();
        } else if (typeof _input === 'string') {
            _input = stripBom(_input);
            if (_config.download) streamer = new NetworkStreamer(_config);
            else streamer = new StringStreamer(_config);
        } else if (_input.readable === true && isFunction(_input.read) && isFunction(_input.on)) {
            streamer = new ReadableStreamStreamer(_config);
        } else if (global.File && _input instanceof File || _input instanceof Object) streamer = new FileStreamer(_config);
        return streamer.stream(_input);
        //TURBOPACK unreachable
        ;
        // Strip character from UTF-8 BOM encoded files that cause issue parsing the file
        function stripBom(string) {
            if (string.charCodeAt(0) === 0xfeff) {
                return string.slice(1);
            }
            return string;
        }
    }
    function JsonToCsv(_input, _config) {
        // Default configuration
        /** whether to surround every datum with quotes */ var _quotes = false;
        /** whether to write headers */ var _writeHeader = true;
        /** delimiting character(s) */ var _delimiter = ',';
        /** newline character(s) */ var _newline = '\r\n';
        /** quote character */ var _quoteChar = '"';
        /** escaped quote character, either "" or <config.escapeChar>" */ var _escapedQuote = _quoteChar + _quoteChar;
        /** whether to skip empty lines */ var _skipEmptyLines = false;
        /** the columns (keys) we expect when we unparse objects */ var _columns = null;
        /** whether to prevent outputting cells that can be parsed as formulae by spreadsheet software (Excel and LibreOffice) */ var _escapeFormulae = false;
        unpackConfig();
        var quoteCharRegex = new RegExp(escapeRegExp(_quoteChar), 'g');
        if (typeof _input === 'string') _input = JSON.parse(_input);
        if (Array.isArray(_input)) {
            if (!_input.length || Array.isArray(_input[0])) return serialize(null, _input, _skipEmptyLines);
            else if (typeof _input[0] === 'object') return serialize(_columns || Object.keys(_input[0]), _input, _skipEmptyLines);
        } else if (typeof _input === 'object') {
            if (typeof _input.data === 'string') _input.data = JSON.parse(_input.data);
            if (Array.isArray(_input.data)) {
                if (!_input.fields) _input.fields = _input.meta && _input.meta.fields || _columns;
                if (!_input.fields) _input.fields = Array.isArray(_input.data[0]) ? _input.fields : typeof _input.data[0] === 'object' ? Object.keys(_input.data[0]) : [];
                if (!Array.isArray(_input.data[0]) && typeof _input.data[0] !== 'object') _input.data = [
                    _input.data
                ]; // handles input like [1,2,3] or ['asdf']
            }
            return serialize(_input.fields || [], _input.data || [], _skipEmptyLines);
        }
        // Default (any valid paths should return before this)
        throw new Error('Unable to serialize unrecognized input');
        function unpackConfig() {
            if (typeof _config !== 'object') return;
            if (typeof _config.delimiter === 'string' && !Papa.BAD_DELIMITERS.filter(function(value) {
                return _config.delimiter.indexOf(value) !== -1;
            }).length) {
                _delimiter = _config.delimiter;
            }
            if (typeof _config.quotes === 'boolean' || typeof _config.quotes === 'function' || Array.isArray(_config.quotes)) _quotes = _config.quotes;
            if (typeof _config.skipEmptyLines === 'boolean' || typeof _config.skipEmptyLines === 'string') _skipEmptyLines = _config.skipEmptyLines;
            if (typeof _config.newline === 'string') _newline = _config.newline;
            if (typeof _config.quoteChar === 'string') _quoteChar = _config.quoteChar;
            if (typeof _config.header === 'boolean') _writeHeader = _config.header;
            if (Array.isArray(_config.columns)) {
                if (_config.columns.length === 0) throw new Error('Option columns is empty');
                _columns = _config.columns;
            }
            if (_config.escapeChar !== undefined) {
                _escapedQuote = _config.escapeChar + _quoteChar;
            }
            if (_config.escapeFormulae instanceof RegExp) {
                _escapeFormulae = _config.escapeFormulae;
            } else if (typeof _config.escapeFormulae === 'boolean' && _config.escapeFormulae) {
                _escapeFormulae = /^[=+\-@\t\r].*$/;
            }
        }
        /** The double for loop that iterates the data and writes out a CSV string including header row */ function serialize(fields, data, skipEmptyLines) {
            var csv = '';
            if (typeof fields === 'string') fields = JSON.parse(fields);
            if (typeof data === 'string') data = JSON.parse(data);
            var hasHeader = Array.isArray(fields) && fields.length > 0;
            var dataKeyedByField = !Array.isArray(data[0]);
            // If there a header row, write it first
            if (hasHeader && _writeHeader) {
                for(var i = 0; i < fields.length; i++){
                    if (i > 0) csv += _delimiter;
                    csv += safe(fields[i], i);
                }
                if (data.length > 0) csv += _newline;
            }
            // Then write out the data
            for(var row = 0; row < data.length; row++){
                var maxCol = hasHeader ? fields.length : data[row].length;
                var emptyLine = false;
                var nullLine = hasHeader ? Object.keys(data[row]).length === 0 : data[row].length === 0;
                if (skipEmptyLines && !hasHeader) {
                    emptyLine = skipEmptyLines === 'greedy' ? data[row].join('').trim() === '' : data[row].length === 1 && data[row][0].length === 0;
                }
                if (skipEmptyLines === 'greedy' && hasHeader) {
                    var line = [];
                    for(var c = 0; c < maxCol; c++){
                        var cx = dataKeyedByField ? fields[c] : c;
                        line.push(data[row][cx]);
                    }
                    emptyLine = line.join('').trim() === '';
                }
                if (!emptyLine) {
                    for(var col = 0; col < maxCol; col++){
                        if (col > 0 && !nullLine) csv += _delimiter;
                        var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
                        csv += safe(data[row][colIdx], col);
                    }
                    if (row < data.length - 1 && (!skipEmptyLines || maxCol > 0 && !nullLine)) {
                        csv += _newline;
                    }
                }
            }
            return csv;
        }
        /** Encloses a value around quotes if needed (makes a value safe for CSV insertion) */ function safe(str, col) {
            if (typeof str === 'undefined' || str === null) return '';
            if (str.constructor === Date) return JSON.stringify(str).slice(1, 25);
            var needsQuotes = false;
            if (_escapeFormulae && typeof str === "string" && _escapeFormulae.test(str)) {
                str = "'" + str;
                needsQuotes = true;
            }
            var escapedQuoteStr = str.toString().replace(quoteCharRegex, _escapedQuote);
            needsQuotes = needsQuotes || _quotes === true || typeof _quotes === 'function' && _quotes(str, col) || Array.isArray(_quotes) && _quotes[col] || hasAny(escapedQuoteStr, Papa.BAD_DELIMITERS) || escapedQuoteStr.indexOf(_delimiter) > -1 || escapedQuoteStr.charAt(0) === ' ' || escapedQuoteStr.charAt(escapedQuoteStr.length - 1) === ' ';
            return needsQuotes ? _quoteChar + escapedQuoteStr + _quoteChar : escapedQuoteStr;
        }
        function hasAny(str, substrings) {
            for(var i = 0; i < substrings.length; i++)if (str.indexOf(substrings[i]) > -1) return true;
            return false;
        }
    }
    /** ChunkStreamer is the base prototype for various streamer implementations. */ function ChunkStreamer(config) {
        this._handle = null;
        this._finished = false;
        this._completed = false;
        this._halted = false;
        this._input = null;
        this._baseIndex = 0;
        this._partialLine = '';
        this._rowCount = 0;
        this._start = 0;
        this._nextChunk = null;
        this.isFirstChunk = true;
        this._completeResults = {
            data: [],
            errors: [],
            meta: {}
        };
        replaceConfig.call(this, config);
        this.parseChunk = function(chunk, isFakeChunk) {
            // First chunk pre-processing
            const skipFirstNLines = parseInt(this._config.skipFirstNLines) || 0;
            if (this.isFirstChunk && skipFirstNLines > 0) {
                let _newline = this._config.newline;
                if (!_newline) {
                    const quoteChar = this._config.quoteChar || '"';
                    _newline = this._handle.guessLineEndings(chunk, quoteChar);
                }
                const splitChunk = chunk.split(_newline);
                chunk = [
                    ...splitChunk.slice(skipFirstNLines)
                ].join(_newline);
            }
            if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk)) {
                var modifiedChunk = this._config.beforeFirstChunk(chunk);
                if (modifiedChunk !== undefined) chunk = modifiedChunk;
            }
            this.isFirstChunk = false;
            this._halted = false;
            // Rejoin the line we likely just split in two by chunking the file
            var aggregate = this._partialLine + chunk;
            this._partialLine = '';
            var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);
            if (this._handle.paused() || this._handle.aborted()) {
                this._halted = true;
                return;
            }
            var lastIndex = results.meta.cursor;
            if (!this._finished) {
                this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
                this._baseIndex = lastIndex;
            }
            if (results && results.data) this._rowCount += results.data.length;
            var finishedIncludingPreview = this._finished || this._config.preview && this._rowCount >= this._config.preview;
            if (IS_PAPA_WORKER) {
                global.postMessage({
                    results: results,
                    workerId: Papa.WORKER_ID,
                    finished: finishedIncludingPreview
                });
            } else if (isFunction(this._config.chunk) && !isFakeChunk) {
                this._config.chunk(results, this._handle);
                if (this._handle.paused() || this._handle.aborted()) {
                    this._halted = true;
                    return;
                }
                results = undefined;
                this._completeResults = undefined;
            }
            if (!this._config.step && !this._config.chunk) {
                this._completeResults.data = this._completeResults.data.concat(results.data);
                this._completeResults.errors = this._completeResults.errors.concat(results.errors);
                this._completeResults.meta = results.meta;
            }
            if (!this._completed && finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted)) {
                this._config.complete(this._completeResults, this._input);
                this._completed = true;
            }
            if (!finishedIncludingPreview && (!results || !results.meta.paused)) this._nextChunk();
            return results;
        };
        this._sendError = function(error) {
            if (isFunction(this._config.error)) this._config.error(error);
            else if (IS_PAPA_WORKER && this._config.error) {
                global.postMessage({
                    workerId: Papa.WORKER_ID,
                    error: error,
                    finished: false
                });
            }
        };
        function replaceConfig(config) {
            // Deep-copy the config so we can edit it
            var configCopy = copy(config);
            configCopy.chunkSize = parseInt(configCopy.chunkSize); // parseInt VERY important so we don't concatenate strings!
            if (!config.step && !config.chunk) configCopy.chunkSize = null; // disable Range header if not streaming; bad values break IIS - see issue #196
            this._handle = new ParserHandle(configCopy);
            this._handle.streamer = this;
            this._config = configCopy; // persist the copy to the caller
        }
    }
    function NetworkStreamer(config) {
        config = config || {};
        if (!config.chunkSize) config.chunkSize = Papa.RemoteChunkSize;
        ChunkStreamer.call(this, config);
        var xhr;
        if (IS_WORKER) {
            this._nextChunk = function() {
                this._readChunk();
                this._chunkLoaded();
            };
        } else {
            this._nextChunk = function() {
                this._readChunk();
            };
        }
        this.stream = function(url) {
            this._input = url;
            this._nextChunk(); // Starts streaming
        };
        this._readChunk = function() {
            if (this._finished) {
                this._chunkLoaded();
                return;
            }
            xhr = new XMLHttpRequest();
            if (this._config.withCredentials) {
                xhr.withCredentials = this._config.withCredentials;
            }
            if (!IS_WORKER) {
                xhr.onload = bindFunction(this._chunkLoaded, this);
                xhr.onerror = bindFunction(this._chunkError, this);
            }
            xhr.open(this._config.downloadRequestBody ? 'POST' : 'GET', this._input, !IS_WORKER);
            // Headers can only be set when once the request state is OPENED
            if (this._config.downloadRequestHeaders) {
                var headers = this._config.downloadRequestHeaders;
                for(var headerName in headers){
                    xhr.setRequestHeader(headerName, headers[headerName]);
                }
            }
            if (this._config.chunkSize) {
                var end = this._start + this._config.chunkSize - 1; // minus one because byte range is inclusive
                xhr.setRequestHeader('Range', 'bytes=' + this._start + '-' + end);
            }
            try {
                xhr.send(this._config.downloadRequestBody);
            } catch (err) {
                this._chunkError(err.message);
            }
            if (IS_WORKER && xhr.status === 0) this._chunkError();
        };
        this._chunkLoaded = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status < 200 || xhr.status >= 400) {
                this._chunkError();
                return;
            }
            // Use chunckSize as it may be a diference on reponse lentgh due to characters with more than 1 byte
            this._start += this._config.chunkSize ? this._config.chunkSize : xhr.responseText.length;
            this._finished = !this._config.chunkSize || this._start >= getFileSize(xhr);
            this.parseChunk(xhr.responseText);
        };
        this._chunkError = function(errorMessage) {
            var errorText = xhr.statusText || errorMessage;
            this._sendError(new Error(errorText));
        };
        function getFileSize(xhr) {
            var contentRange = xhr.getResponseHeader('Content-Range');
            if (contentRange === null) {
                return -1;
            }
            return parseInt(contentRange.substring(contentRange.lastIndexOf('/') + 1));
        }
    }
    NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
    NetworkStreamer.prototype.constructor = NetworkStreamer;
    function FileStreamer(config) {
        config = config || {};
        if (!config.chunkSize) config.chunkSize = Papa.LocalChunkSize;
        ChunkStreamer.call(this, config);
        var reader, slice;
        // FileReader is better than FileReaderSync (even in worker) - see http://stackoverflow.com/q/24708649/1048862
        // But Firefox is a pill, too - see issue #76: https://github.com/mholt/PapaParse/issues/76
        var usingAsyncReader = typeof FileReader !== 'undefined'; // Safari doesn't consider it a function - see issue #105
        this.stream = function(file) {
            this._input = file;
            slice = file.slice || file.webkitSlice || file.mozSlice;
            if (usingAsyncReader) {
                reader = new FileReader(); // Preferred method of reading files, even in workers
                reader.onload = bindFunction(this._chunkLoaded, this);
                reader.onerror = bindFunction(this._chunkError, this);
            } else reader = new FileReaderSync(); // Hack for running in a web worker in Firefox
            this._nextChunk(); // Starts streaming
        };
        this._nextChunk = function() {
            if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview)) this._readChunk();
        };
        this._readChunk = function() {
            var input = this._input;
            if (this._config.chunkSize) {
                var end = Math.min(this._start + this._config.chunkSize, this._input.size);
                input = slice.call(input, this._start, end);
            }
            var txt = reader.readAsText(input, this._config.encoding);
            if (!usingAsyncReader) this._chunkLoaded({
                target: {
                    result: txt
                }
            }); // mimic the async signature
        };
        this._chunkLoaded = function(event) {
            // Very important to increment start each time before handling results
            this._start += this._config.chunkSize;
            this._finished = !this._config.chunkSize || this._start >= this._input.size;
            this.parseChunk(event.target.result);
        };
        this._chunkError = function() {
            this._sendError(reader.error);
        };
    }
    FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
    FileStreamer.prototype.constructor = FileStreamer;
    function StringStreamer(config) {
        config = config || {};
        ChunkStreamer.call(this, config);
        var remaining;
        this.stream = function(s) {
            remaining = s;
            return this._nextChunk();
        };
        this._nextChunk = function() {
            if (this._finished) return;
            var size = this._config.chunkSize;
            var chunk;
            if (size) {
                chunk = remaining.substring(0, size);
                remaining = remaining.substring(size);
            } else {
                chunk = remaining;
                remaining = '';
            }
            this._finished = !remaining;
            return this.parseChunk(chunk);
        };
    }
    StringStreamer.prototype = Object.create(StringStreamer.prototype);
    StringStreamer.prototype.constructor = StringStreamer;
    function ReadableStreamStreamer(config) {
        config = config || {};
        ChunkStreamer.call(this, config);
        var queue = [];
        var parseOnData = true;
        var streamHasEnded = false;
        this.pause = function() {
            ChunkStreamer.prototype.pause.apply(this, arguments);
            this._input.pause();
        };
        this.resume = function() {
            ChunkStreamer.prototype.resume.apply(this, arguments);
            this._input.resume();
        };
        this.stream = function(stream) {
            this._input = stream;
            this._input.on('data', this._streamData);
            this._input.on('end', this._streamEnd);
            this._input.on('error', this._streamError);
        };
        this._checkIsFinished = function() {
            if (streamHasEnded && queue.length === 1) {
                this._finished = true;
            }
        };
        this._nextChunk = function() {
            this._checkIsFinished();
            if (queue.length) {
                this.parseChunk(queue.shift());
            } else {
                parseOnData = true;
            }
        };
        this._streamData = bindFunction(function(chunk) {
            try {
                queue.push(typeof chunk === 'string' ? chunk : chunk.toString(this._config.encoding));
                if (parseOnData) {
                    parseOnData = false;
                    this._checkIsFinished();
                    this.parseChunk(queue.shift());
                }
            } catch (error) {
                this._streamError(error);
            }
        }, this);
        this._streamError = bindFunction(function(error) {
            this._streamCleanUp();
            this._sendError(error);
        }, this);
        this._streamEnd = bindFunction(function() {
            this._streamCleanUp();
            streamHasEnded = true;
            this._streamData('');
        }, this);
        this._streamCleanUp = bindFunction(function() {
            this._input.removeListener('data', this._streamData);
            this._input.removeListener('end', this._streamEnd);
            this._input.removeListener('error', this._streamError);
        }, this);
    }
    ReadableStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
    ReadableStreamStreamer.prototype.constructor = ReadableStreamStreamer;
    function DuplexStreamStreamer(_config) {
        var Duplex = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Duplex;
        var config = copy(_config);
        var parseOnWrite = true;
        var writeStreamHasFinished = false;
        var parseCallbackQueue = [];
        var stream = null;
        this._onCsvData = function(results) {
            var data = results.data;
            if (!stream.push(data) && !this._handle.paused()) {
                // the writeable consumer buffer has filled up
                // so we need to pause until more items
                // can be processed
                this._handle.pause();
            }
        };
        this._onCsvComplete = function() {
            // node will finish the read stream when
            // null is pushed
            stream.push(null);
        };
        config.step = bindFunction(this._onCsvData, this);
        config.complete = bindFunction(this._onCsvComplete, this);
        ChunkStreamer.call(this, config);
        this._nextChunk = function() {
            if (writeStreamHasFinished && parseCallbackQueue.length === 1) {
                this._finished = true;
            }
            if (parseCallbackQueue.length) {
                parseCallbackQueue.shift()();
            } else {
                parseOnWrite = true;
            }
        };
        this._addToParseQueue = function(chunk, callback) {
            // add to queue so that we can indicate
            // completion via callback
            // node will automatically pause the incoming stream
            // when too many items have been added without their
            // callback being invoked
            parseCallbackQueue.push(bindFunction(function() {
                this.parseChunk(typeof chunk === 'string' ? chunk : chunk.toString(config.encoding));
                if (isFunction(callback)) {
                    return callback();
                }
            }, this));
            if (parseOnWrite) {
                parseOnWrite = false;
                this._nextChunk();
            }
        };
        this._onRead = function() {
            if (this._handle.paused()) {
                // the writeable consumer can handle more data
                // so resume the chunk parsing
                this._handle.resume();
            }
        };
        this._onWrite = function(chunk, encoding, callback) {
            this._addToParseQueue(chunk, callback);
        };
        this._onWriteComplete = function() {
            writeStreamHasFinished = true;
            // have to write empty string
            // so parser knows its done
            this._addToParseQueue('');
        };
        this.getStream = function() {
            return stream;
        };
        stream = new Duplex({
            readableObjectMode: true,
            decodeStrings: false,
            read: bindFunction(this._onRead, this),
            write: bindFunction(this._onWrite, this)
        });
        stream.once('finish', bindFunction(this._onWriteComplete, this));
    }
    if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
        DuplexStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
        DuplexStreamStreamer.prototype.constructor = DuplexStreamStreamer;
    }
    // Use one ParserHandle per entire CSV file or string
    function ParserHandle(_config) {
        // One goal is to minimize the use of regular expressions...
        var MAX_FLOAT = Math.pow(2, 53);
        var MIN_FLOAT = -MAX_FLOAT;
        var FLOAT = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/;
        var ISO_DATE = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/;
        var self1 = this;
        var _stepCounter = 0; // Number of times step was called (number of rows parsed)
        var _rowCounter = 0; // Number of rows that have been parsed so far
        var _input; // The input being parsed
        var _parser; // The core parser being used
        var _paused = false; // Whether we are paused or not
        var _aborted = false; // Whether the parser has aborted or not
        var _delimiterError; // Temporary state between delimiter detection and processing results
        var _fields = []; // Fields are from the header row of the input, if there is one
        var _results = {
            data: [],
            errors: [],
            meta: {}
        };
        if (isFunction(_config.step)) {
            var userStep = _config.step;
            _config.step = function(results) {
                _results = results;
                if (needsHeaderRow()) processResults();
                else {
                    processResults();
                    // It's possbile that this line was empty and there's no row here after all
                    if (_results.data.length === 0) return;
                    _stepCounter += results.data.length;
                    if (_config.preview && _stepCounter > _config.preview) _parser.abort();
                    else {
                        _results.data = _results.data[0];
                        userStep(_results, self1);
                    }
                }
            };
        }
        /**
		 * Parses input. Most users won't need, and shouldn't mess with, the baseIndex
		 * and ignoreLastRow parameters. They are used by streamers (wrapper functions)
		 * when an input comes in multiple chunks, like from a file.
		 */ this.parse = function(input, baseIndex, ignoreLastRow) {
            var quoteChar = _config.quoteChar || '"';
            if (!_config.newline) _config.newline = this.guessLineEndings(input, quoteChar);
            _delimiterError = false;
            if (!_config.delimiter) {
                var delimGuess = guessDelimiter(input, _config.newline, _config.skipEmptyLines, _config.comments, _config.delimitersToGuess);
                if (delimGuess.successful) _config.delimiter = delimGuess.bestDelimiter;
                else {
                    _delimiterError = true; // add error after parsing (otherwise it would be overwritten)
                    _config.delimiter = Papa.DefaultDelimiter;
                }
                _results.meta.delimiter = _config.delimiter;
            } else if (isFunction(_config.delimiter)) {
                _config.delimiter = _config.delimiter(input);
                _results.meta.delimiter = _config.delimiter;
            }
            var parserConfig = copy(_config);
            if (_config.preview && _config.header) parserConfig.preview++; // to compensate for header row
            _input = input;
            _parser = new Parser(parserConfig);
            _results = _parser.parse(_input, baseIndex, ignoreLastRow);
            processResults();
            return _paused ? {
                meta: {
                    paused: true
                }
            } : _results || {
                meta: {
                    paused: false
                }
            };
        };
        this.paused = function() {
            return _paused;
        };
        this.pause = function() {
            _paused = true;
            _parser.abort();
            // If it is streaming via "chunking", the reader will start appending correctly already so no need to substring,
            // otherwise we can get duplicate content within a row
            _input = isFunction(_config.chunk) ? "" : _input.substring(_parser.getCharIndex());
        };
        this.resume = function() {
            if (self1.streamer._halted) {
                _paused = false;
                self1.streamer.parseChunk(_input, true);
            } else {
                // Bugfix: #636 In case the processing hasn't halted yet
                // wait for it to halt in order to resume
                setTimeout(self1.resume, 3);
            }
        };
        this.aborted = function() {
            return _aborted;
        };
        this.abort = function() {
            _aborted = true;
            _parser.abort();
            _results.meta.aborted = true;
            if (isFunction(_config.complete)) _config.complete(_results);
            _input = '';
        };
        this.guessLineEndings = function(input, quoteChar) {
            input = input.substring(0, 1024 * 1024); // max length 1 MB
            // Replace all the text inside quotes
            var re = new RegExp(escapeRegExp(quoteChar) + '([^]*?)' + escapeRegExp(quoteChar), 'gm');
            input = input.replace(re, '');
            var r = input.split('\r');
            var n = input.split('\n');
            var nAppearsFirst = n.length > 1 && n[0].length < r[0].length;
            if (r.length === 1 || nAppearsFirst) return '\n';
            var numWithN = 0;
            for(var i = 0; i < r.length; i++){
                if (r[i][0] === '\n') numWithN++;
            }
            return numWithN >= r.length / 2 ? '\r\n' : '\r';
        };
        function testEmptyLine(s) {
            return _config.skipEmptyLines === 'greedy' ? s.join('').trim() === '' : s.length === 1 && s[0].length === 0;
        }
        function testFloat(s) {
            if (FLOAT.test(s)) {
                var floatValue = parseFloat(s);
                if (floatValue > MIN_FLOAT && floatValue < MAX_FLOAT) {
                    return true;
                }
            }
            return false;
        }
        function processResults() {
            if (_results && _delimiterError) {
                addError('Delimiter', 'UndetectableDelimiter', 'Unable to auto-detect delimiting character; defaulted to \'' + Papa.DefaultDelimiter + '\'');
                _delimiterError = false;
            }
            if (_config.skipEmptyLines) {
                _results.data = _results.data.filter(function(d) {
                    return !testEmptyLine(d);
                });
            }
            if (needsHeaderRow()) fillHeaderFields();
            return applyHeaderAndDynamicTypingAndTransformation();
        }
        function needsHeaderRow() {
            return _config.header && _fields.length === 0;
        }
        function fillHeaderFields() {
            if (!_results) return;
            function addHeader(header, i) {
                if (isFunction(_config.transformHeader)) header = _config.transformHeader(header, i);
                _fields.push(header);
            }
            if (Array.isArray(_results.data[0])) {
                for(var i = 0; needsHeaderRow() && i < _results.data.length; i++)_results.data[i].forEach(addHeader);
                _results.data.splice(0, 1);
            } else _results.data.forEach(addHeader);
        }
        function shouldApplyDynamicTyping(field) {
            // Cache function values to avoid calling it for each row
            if (_config.dynamicTypingFunction && _config.dynamicTyping[field] === undefined) {
                _config.dynamicTyping[field] = _config.dynamicTypingFunction(field);
            }
            return (_config.dynamicTyping[field] || _config.dynamicTyping) === true;
        }
        function parseDynamic(field, value) {
            if (shouldApplyDynamicTyping(field)) {
                if (value === 'true' || value === 'TRUE') return true;
                else if (value === 'false' || value === 'FALSE') return false;
                else if (testFloat(value)) return parseFloat(value);
                else if (ISO_DATE.test(value)) return new Date(value);
                else return value === '' ? null : value;
            }
            return value;
        }
        function applyHeaderAndDynamicTypingAndTransformation() {
            if (!_results || !_config.header && !_config.dynamicTyping && !_config.transform) return _results;
            function processRow(rowSource, i) {
                var row = _config.header ? {} : [];
                var j;
                for(j = 0; j < rowSource.length; j++){
                    var field = j;
                    var value = rowSource[j];
                    if (_config.header) field = j >= _fields.length ? '__parsed_extra' : _fields[j];
                    if (_config.transform) value = _config.transform(value, field);
                    value = parseDynamic(field, value);
                    if (field === '__parsed_extra') {
                        row[field] = row[field] || [];
                        row[field].push(value);
                    } else row[field] = value;
                }
                if (_config.header) {
                    if (j > _fields.length) addError('FieldMismatch', 'TooManyFields', 'Too many fields: expected ' + _fields.length + ' fields but parsed ' + j, _rowCounter + i);
                    else if (j < _fields.length) addError('FieldMismatch', 'TooFewFields', 'Too few fields: expected ' + _fields.length + ' fields but parsed ' + j, _rowCounter + i);
                }
                return row;
            }
            var incrementBy = 1;
            if (!_results.data.length || Array.isArray(_results.data[0])) {
                _results.data = _results.data.map(processRow);
                incrementBy = _results.data.length;
            } else _results.data = processRow(_results.data, 0);
            if (_config.header && _results.meta) _results.meta.fields = _fields;
            _rowCounter += incrementBy;
            return _results;
        }
        function guessDelimiter(input, newline, skipEmptyLines, comments, delimitersToGuess) {
            var bestDelim, bestDelta, fieldCountPrevRow, maxFieldCount;
            delimitersToGuess = delimitersToGuess || [
                ',',
                '\t',
                '|',
                ';',
                Papa.RECORD_SEP,
                Papa.UNIT_SEP
            ];
            for(var i = 0; i < delimitersToGuess.length; i++){
                var delim = delimitersToGuess[i];
                var delta = 0, avgFieldCount = 0, emptyLinesCount = 0;
                fieldCountPrevRow = undefined;
                var preview = new Parser({
                    comments: comments,
                    delimiter: delim,
                    newline: newline,
                    preview: 10
                }).parse(input);
                for(var j = 0; j < preview.data.length; j++){
                    if (skipEmptyLines && testEmptyLine(preview.data[j])) {
                        emptyLinesCount++;
                        continue;
                    }
                    var fieldCount = preview.data[j].length;
                    avgFieldCount += fieldCount;
                    if (typeof fieldCountPrevRow === 'undefined') {
                        fieldCountPrevRow = fieldCount;
                        continue;
                    } else if (fieldCount > 0) {
                        delta += Math.abs(fieldCount - fieldCountPrevRow);
                        fieldCountPrevRow = fieldCount;
                    }
                }
                if (preview.data.length > 0) avgFieldCount /= preview.data.length - emptyLinesCount;
                if ((typeof bestDelta === 'undefined' || delta <= bestDelta) && (typeof maxFieldCount === 'undefined' || avgFieldCount > maxFieldCount) && avgFieldCount > 1.99) {
                    bestDelta = delta;
                    bestDelim = delim;
                    maxFieldCount = avgFieldCount;
                }
            }
            _config.delimiter = bestDelim;
            return {
                successful: !!bestDelim,
                bestDelimiter: bestDelim
            };
        }
        function addError(type, code, msg, row) {
            var error = {
                type: type,
                code: code,
                message: msg
            };
            if (row !== undefined) {
                error.row = row;
            }
            _results.errors.push(error);
        }
    }
    /** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions */ function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    /** The core parser implements speedy and correct CSV parsing */ function Parser(config) {
        // Unpack the config object
        config = config || {};
        var delim = config.delimiter;
        var newline = config.newline;
        var comments = config.comments;
        var step = config.step;
        var preview = config.preview;
        var fastMode = config.fastMode;
        var quoteChar;
        var renamedHeaders = null;
        var headerParsed = false;
        if (config.quoteChar === undefined || config.quoteChar === null) {
            quoteChar = '"';
        } else {
            quoteChar = config.quoteChar;
        }
        var escapeChar = quoteChar;
        if (config.escapeChar !== undefined) {
            escapeChar = config.escapeChar;
        }
        // Delimiter must be valid
        if (typeof delim !== 'string' || Papa.BAD_DELIMITERS.indexOf(delim) > -1) delim = ',';
        // Comment character must be valid
        if (comments === delim) throw new Error('Comment character same as delimiter');
        else if (comments === true) comments = '#';
        else if (typeof comments !== 'string' || Papa.BAD_DELIMITERS.indexOf(comments) > -1) comments = false;
        // Newline must be valid: \r, \n, or \r\n
        if (newline !== '\n' && newline !== '\r' && newline !== '\r\n') newline = '\n';
        // We're gonna need these at the Parser scope
        var cursor = 0;
        var aborted = false;
        this.parse = function(input, baseIndex, ignoreLastRow) {
            // For some reason, in Chrome, this speeds things up (!?)
            if (typeof input !== 'string') throw new Error('Input must be a string');
            // We don't need to compute some of these every time parse() is called,
            // but having them in a more local scope seems to perform better
            var inputLen = input.length, delimLen = delim.length, newlineLen = newline.length, commentsLen = comments.length;
            var stepIsFunction = isFunction(step);
            // Establish starting state
            cursor = 0;
            var data = [], errors = [], row = [], lastCursor = 0;
            if (!input) return returnable();
            if (fastMode || fastMode !== false && input.indexOf(quoteChar) === -1) {
                var rows = input.split(newline);
                for(var i = 0; i < rows.length; i++){
                    row = rows[i];
                    cursor += row.length;
                    if (i !== rows.length - 1) cursor += newline.length;
                    else if (ignoreLastRow) return returnable();
                    if (comments && row.substring(0, commentsLen) === comments) continue;
                    if (stepIsFunction) {
                        data = [];
                        pushRow(row.split(delim));
                        doStep();
                        if (aborted) return returnable();
                    } else pushRow(row.split(delim));
                    if (preview && i >= preview) {
                        data = data.slice(0, preview);
                        return returnable(true);
                    }
                }
                return returnable();
            }
            var nextDelim = input.indexOf(delim, cursor);
            var nextNewline = input.indexOf(newline, cursor);
            var quoteCharRegex = new RegExp(escapeRegExp(escapeChar) + escapeRegExp(quoteChar), 'g');
            var quoteSearch = input.indexOf(quoteChar, cursor);
            // Parser loop
            for(;;){
                // Field has opening quote
                if (input[cursor] === quoteChar) {
                    // Start our search for the closing quote where the cursor is
                    quoteSearch = cursor;
                    // Skip the opening quote
                    cursor++;
                    for(;;){
                        // Find closing quote
                        quoteSearch = input.indexOf(quoteChar, quoteSearch + 1);
                        //No other quotes are found - no other delimiters
                        if (quoteSearch === -1) {
                            if (!ignoreLastRow) {
                                // No closing quote... what a pity
                                errors.push({
                                    type: 'Quotes',
                                    code: 'MissingQuotes',
                                    message: 'Quoted field unterminated',
                                    row: data.length,
                                    index: cursor
                                });
                            }
                            return finish();
                        }
                        // Closing quote at EOF
                        if (quoteSearch === inputLen - 1) {
                            var value = input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar);
                            return finish(value);
                        }
                        // If this quote is escaped, it's part of the data; skip it
                        // If the quote character is the escape character, then check if the next character is the escape character
                        if (quoteChar === escapeChar && input[quoteSearch + 1] === escapeChar) {
                            quoteSearch++;
                            continue;
                        }
                        // If the quote character is not the escape character, then check if the previous character was the escape character
                        if (quoteChar !== escapeChar && quoteSearch !== 0 && input[quoteSearch - 1] === escapeChar) {
                            continue;
                        }
                        if (nextDelim !== -1 && nextDelim < quoteSearch + 1) {
                            nextDelim = input.indexOf(delim, quoteSearch + 1);
                        }
                        if (nextNewline !== -1 && nextNewline < quoteSearch + 1) {
                            nextNewline = input.indexOf(newline, quoteSearch + 1);
                        }
                        // Check up to nextDelim or nextNewline, whichever is closest
                        var checkUpTo = nextNewline === -1 ? nextDelim : Math.min(nextDelim, nextNewline);
                        var spacesBetweenQuoteAndDelimiter = extraSpaces(checkUpTo);
                        // Closing quote followed by delimiter or 'unnecessary spaces + delimiter'
                        if (input.substr(quoteSearch + 1 + spacesBetweenQuoteAndDelimiter, delimLen) === delim) {
                            row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
                            cursor = quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen;
                            // If char after following delimiter is not quoteChar, we find next quote char position
                            if (input[quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen] !== quoteChar) {
                                quoteSearch = input.indexOf(quoteChar, cursor);
                            }
                            nextDelim = input.indexOf(delim, cursor);
                            nextNewline = input.indexOf(newline, cursor);
                            break;
                        }
                        var spacesBetweenQuoteAndNewLine = extraSpaces(nextNewline);
                        // Closing quote followed by newline or 'unnecessary spaces + newLine'
                        if (input.substring(quoteSearch + 1 + spacesBetweenQuoteAndNewLine, quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen) === newline) {
                            row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
                            saveRow(quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen);
                            nextDelim = input.indexOf(delim, cursor); // because we may have skipped the nextDelim in the quoted field
                            quoteSearch = input.indexOf(quoteChar, cursor); // we search for first quote in next line
                            if (stepIsFunction) {
                                doStep();
                                if (aborted) return returnable();
                            }
                            if (preview && data.length >= preview) return returnable(true);
                            break;
                        }
                        // Checks for valid closing quotes are complete (escaped quotes or quote followed by EOF/delimiter/newline) -- assume these quotes are part of an invalid text string
                        errors.push({
                            type: 'Quotes',
                            code: 'InvalidQuotes',
                            message: 'Trailing quote on quoted field is malformed',
                            row: data.length,
                            index: cursor
                        });
                        quoteSearch++;
                        continue;
                    }
                    continue;
                }
                // Comment found at start of new line
                if (comments && row.length === 0 && input.substring(cursor, cursor + commentsLen) === comments) {
                    if (nextNewline === -1) return returnable();
                    cursor = nextNewline + newlineLen;
                    nextNewline = input.indexOf(newline, cursor);
                    nextDelim = input.indexOf(delim, cursor);
                    continue;
                }
                // Next delimiter comes before next newline, so we've reached end of field
                if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1)) {
                    row.push(input.substring(cursor, nextDelim));
                    cursor = nextDelim + delimLen;
                    // we look for next delimiter char
                    nextDelim = input.indexOf(delim, cursor);
                    continue;
                }
                // End of row
                if (nextNewline !== -1) {
                    row.push(input.substring(cursor, nextNewline));
                    saveRow(nextNewline + newlineLen);
                    if (stepIsFunction) {
                        doStep();
                        if (aborted) return returnable();
                    }
                    if (preview && data.length >= preview) return returnable(true);
                    continue;
                }
                break;
            }
            return finish();
            //TURBOPACK unreachable
            ;
            function pushRow(row) {
                data.push(row);
                lastCursor = cursor;
            }
            /**
             * checks if there are extra spaces after closing quote and given index without any text
             * if Yes, returns the number of spaces
             */ function extraSpaces(index) {
                var spaceLength = 0;
                if (index !== -1) {
                    var textBetweenClosingQuoteAndIndex = input.substring(quoteSearch + 1, index);
                    if (textBetweenClosingQuoteAndIndex && textBetweenClosingQuoteAndIndex.trim() === '') {
                        spaceLength = textBetweenClosingQuoteAndIndex.length;
                    }
                }
                return spaceLength;
            }
            /**
			 * Appends the remaining input from cursor to the end into
			 * row, saves the row, calls step, and returns the results.
			 */ function finish(value) {
                if (ignoreLastRow) return returnable();
                if (typeof value === 'undefined') value = input.substring(cursor);
                row.push(value);
                cursor = inputLen; // important in case parsing is paused
                pushRow(row);
                if (stepIsFunction) doStep();
                return returnable();
            }
            /**
			 * Appends the current row to the results. It sets the cursor
			 * to newCursor and finds the nextNewline. The caller should
			 * take care to execute user's step function and check for
			 * preview and end parsing if necessary.
			 */ function saveRow(newCursor) {
                cursor = newCursor;
                pushRow(row);
                row = [];
                nextNewline = input.indexOf(newline, cursor);
            }
            /** Returns an object with the results, errors, and meta. */ function returnable(stopped) {
                if (config.header && !baseIndex && data.length && !headerParsed) {
                    const result = data[0];
                    const headerCount = Object.create(null); // To track the count of each base header
                    const usedHeaders = new Set(result); // To track used headers and avoid duplicates
                    let duplicateHeaders = false;
                    for(let i = 0; i < result.length; i++){
                        let header = result[i];
                        if (isFunction(config.transformHeader)) header = config.transformHeader(header, i);
                        if (!headerCount[header]) {
                            headerCount[header] = 1;
                            result[i] = header;
                        } else {
                            let newHeader;
                            let suffixCount = headerCount[header];
                            // Find a unique new header
                            do {
                                newHeader = `${header}_${suffixCount}`;
                                suffixCount++;
                            }while (usedHeaders.has(newHeader))
                            usedHeaders.add(newHeader); // Mark this new Header as used
                            result[i] = newHeader;
                            headerCount[header]++;
                            duplicateHeaders = true;
                            if (renamedHeaders === null) {
                                renamedHeaders = {};
                            }
                            renamedHeaders[newHeader] = header;
                        }
                        usedHeaders.add(header); // Ensure the original header is marked as used
                    }
                    if (duplicateHeaders) {
                        console.warn('Duplicate headers found and renamed.');
                    }
                    headerParsed = true;
                }
                return {
                    data: data,
                    errors: errors,
                    meta: {
                        delimiter: delim,
                        linebreak: newline,
                        aborted: aborted,
                        truncated: !!stopped,
                        cursor: lastCursor + (baseIndex || 0),
                        renamedHeaders: renamedHeaders
                    }
                };
            }
            /** Executes the user's step function and resets data & errors. */ function doStep() {
                step(returnable());
                data = [];
                errors = [];
            }
        };
        /** Sets the abort flag */ this.abort = function() {
            aborted = true;
        };
        /** Gets the cursor position */ this.getCharIndex = function() {
            return cursor;
        };
    }
    function newWorker() {
        if (!Papa.WORKERS_SUPPORTED) return false;
        var workerUrl = getWorkerBlob();
        var w = new global.Worker(workerUrl);
        w.onmessage = mainThreadReceivedMessage;
        w.id = workerIdCounter++;
        workers[w.id] = w;
        return w;
    }
    /** Callback when main thread receives a message */ function mainThreadReceivedMessage(e) {
        var msg = e.data;
        var worker = workers[msg.workerId];
        var aborted = false;
        if (msg.error) worker.userError(msg.error, msg.file);
        else if (msg.results && msg.results.data) {
            var abort = function() {
                aborted = true;
                completeWorker(msg.workerId, {
                    data: [],
                    errors: [],
                    meta: {
                        aborted: true
                    }
                });
            };
            var handle = {
                abort: abort,
                pause: notImplemented,
                resume: notImplemented
            };
            if (isFunction(worker.userStep)) {
                for(var i = 0; i < msg.results.data.length; i++){
                    worker.userStep({
                        data: msg.results.data[i],
                        errors: msg.results.errors,
                        meta: msg.results.meta
                    }, handle);
                    if (aborted) break;
                }
                delete msg.results; // free memory ASAP
            } else if (isFunction(worker.userChunk)) {
                worker.userChunk(msg.results, handle, msg.file);
                delete msg.results;
            }
        }
        if (msg.finished && !aborted) completeWorker(msg.workerId, msg.results);
    }
    function completeWorker(workerId, results) {
        var worker = workers[workerId];
        if (isFunction(worker.userComplete)) worker.userComplete(results);
        worker.terminate();
        delete workers[workerId];
    }
    function notImplemented() {
        throw new Error('Not implemented.');
    }
    /** Callback when worker thread receives a message */ function workerThreadReceivedMessage(e) {
        var msg = e.data;
        if (typeof Papa.WORKER_ID === 'undefined' && msg) Papa.WORKER_ID = msg.workerId;
        if (typeof msg.input === 'string') {
            global.postMessage({
                workerId: Papa.WORKER_ID,
                results: Papa.parse(msg.input, msg.config),
                finished: true
            });
        } else if (global.File && msg.input instanceof File || msg.input instanceof Object) {
            var results = Papa.parse(msg.input, msg.config);
            if (results) global.postMessage({
                workerId: Papa.WORKER_ID,
                results: results,
                finished: true
            });
        }
    }
    /** Makes a deep copy of an array or object (mostly) */ function copy(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        var cpy = Array.isArray(obj) ? [] : {};
        for(var key in obj)cpy[key] = copy(obj[key]);
        return cpy;
    }
    function bindFunction(f, self1) {
        return function() {
            f.apply(self1, arguments);
        };
    }
    function isFunction(func) {
        return typeof func === 'function';
    }
    return Papa;
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c761d7ea._.js.map