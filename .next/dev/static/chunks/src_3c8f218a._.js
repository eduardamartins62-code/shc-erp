(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
;
// Initial Mock Data
const initialInventory = [
    {
        id: 'SKU-1001',
        warehouseId: 'WH-MAIN',
        quantityOnHand: 500,
        quantityReserved: 50,
        lotNumber: 'L-2023-A1',
        expirationDate: '2027-12-31T00:00:00.000Z',
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: 'SKU-1002',
        warehouseId: 'WH-EAST',
        quantityOnHand: 150,
        quantityReserved: 0,
        lotNumber: 'L-2023-B2',
        expirationDate: '2026-06-30T00:00:00.000Z',
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: 'SKU-1003',
        warehouseId: 'WH-MAIN',
        quantityOnHand: 200,
        quantityReserved: 200,
        lotNumber: 'L-2024-C3',
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: 'SKU-1004',
        warehouseId: 'WH-WEST',
        quantityOnHand: 10,
        quantityReserved: 5,
        lotNumber: 'L-2022-D4',
        expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System'
    }
];
const inventoryStore = [
    ...initialInventory
];
const auditStore = [];
// New mock store for detailed movements
const movementStore = [
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        movementType: 'RECEIVE',
        productId: 'SKU-1001',
        sku: 'SKU-1001',
        warehouseToId: 'WH-MAIN',
        locationToId: 'A1-R2-S3',
        lotNumber: 'L-2023-A1',
        expirationDate: '2027-12-31T00:00:00.000Z',
        quantity: 500,
        reason: 'Initial Stock',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString()
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        movementType: 'RECEIVE',
        productId: 'SKU-1002',
        sku: 'SKU-1002',
        warehouseToId: 'WH-EAST',
        locationToId: 'B1-R1-S1',
        lotNumber: 'L-2023-B2',
        expirationDate: '2026-06-30T00:00:00.000Z',
        quantity: 150,
        reason: 'Initial Stock',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString()
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        movementType: 'TRANSFER',
        productId: 'SKU-1001',
        sku: 'SKU-1001',
        warehouseFromId: 'WH-MAIN',
        locationFromId: 'A1-R2-S3',
        warehouseToId: 'WH-WEST',
        locationToId: 'C1-R1-S1',
        lotNumber: 'L-2023-A1',
        expirationDate: '2027-12-31T00:00:00.000Z',
        quantity: 50,
        reason: 'Store Transfer',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString()
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        movementType: 'ADJUST',
        productId: 'SKU-1004',
        sku: 'SKU-1004',
        warehouseFromId: 'WH-WEST',
        locationFromId: 'C1-R1-S2',
        lotNumber: 'L-2022-D4',
        expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        quantity: -2,
        reason: 'Damaged Goods',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString()
    }
];
const snapshotStore = Array.from({
    length: 30
}).map((_, i)=>{
    const daysAgo = 30 - i;
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString();
    // Create some fake trend data that generally goes up but has some variance
    const baseAvailable = 800;
    const availableVariance = Math.floor(Math.sin(daysAgo) * 50) + i * 2;
    const baseCogs = 12000;
    const cogsVariance = Math.floor(Math.cos(daysAgo) * 500) + i * 50;
    const baseLowStock = 10;
    const lowStockVariance = Math.floor(Math.sin(daysAgo / 2) * 3) - Math.floor(i / 10);
    return {
        date,
        totalAvailable: baseAvailable + availableVariance,
        totalCogs: baseCogs + cogsVariance,
        lowStockCount: Math.max(0, baseLowStock + lowStockVariance)
    };
});
const locationStore = [
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        warehouseId: 'WH-MAIN',
        warehouseCode: 'WH-MAIN',
        warehouseName: 'WH-MAIN',
        locationCode: 'A-01-01-01',
        displayName: 'A-01-01-01',
        type: 'SHELF',
        description: 'Main Aisle First Rack',
        aisle: 'A',
        section: '01',
        shelf: '01',
        bin: '01',
        barcodeValue: 'A-01-01-01',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        warehouseId: 'WH-MAIN',
        warehouseCode: 'WH-MAIN',
        warehouseName: 'WH-MAIN',
        locationCode: 'B-02-05-00',
        displayName: 'Bulk Storage B',
        type: 'PALLET',
        description: 'Bulk Storage B',
        aisle: 'B',
        section: '02',
        shelf: '05',
        bin: '',
        barcodeValue: 'B-02-05-00',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        warehouseId: 'WH-EAST',
        warehouseCode: 'WH-EAST',
        warehouseName: 'WH-EAST',
        locationCode: 'E-10-01-00',
        displayName: 'East Receiving',
        type: 'FLOOR',
        description: 'East Receiving',
        aisle: 'E',
        section: '10',
        shelf: '01',
        bin: '',
        barcodeValue: 'E-10-01-00',
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    }
];
const userStore = [
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        fullName: 'System Admin',
        email: 'admin@shc.com',
        role: 'Admin',
        isActive: true,
        allowedWarehouses: null,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        fullName: 'Warehouse Manager',
        email: 'manager@shc.com',
        role: 'Manager',
        isActive: true,
        allowedWarehouses: [
            'WH-MAIN'
        ],
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    }
];
const warehouseStore = [
    {
        id: 'WH-MAIN',
        warehouseName: 'Main Warehouse',
        warehouseCode: 'WH-MAIN',
        description: 'Primary Midwest Distribution Center',
        addressLine1: '123 Logistics Way',
        city: 'Columbus',
        state: 'OH',
        postalCode: '43004',
        country: 'USA',
        timeZone: 'America/New_York',
        isActive: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: 'WH-EAST',
        warehouseName: 'East Coast Hub',
        warehouseCode: 'WH-EAST',
        description: 'East Coast Receiving',
        addressLine1: '456 Port Ave',
        city: 'Newark',
        state: 'NJ',
        postalCode: '07114',
        country: 'USA',
        timeZone: 'America/New_York',
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    },
    {
        id: 'WH-WEST',
        warehouseName: 'West Coast Dist',
        warehouseCode: 'WH-WEST',
        description: 'West Coast Fulfillment',
        addressLine1: '789 Pacific Blvd',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
        timeZone: 'America/Los_Angeles',
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    }
];
const channelStore = [
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        channel: 'Amazon',
        storeName: 'Amazon US Main',
        isEnabled: true,
        defaultWarehouseId: 'WH-MAIN',
        notes: 'FBA and FBM synced'
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        channel: 'Shopify',
        storeName: 'Super Health Center DTC',
        isEnabled: true,
        defaultWarehouseId: 'WH-MAIN',
        notes: 'DTC Site'
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        channel: 'Walmart',
        storeName: 'Walmart Marketplace',
        isEnabled: false,
        notes: 'Pending API keys'
    },
    {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        channel: 'ShipStation',
        storeName: 'ShipStation Primary',
        isEnabled: false,
        notes: 'Awaiting configuration',
        apiKey: '',
        apiSecret: '',
        autoImportOrders: true,
        syncInventory: false,
        syncTracking: true
    }
];
const systemSettingsStore = {
    defaultTimeZone: 'America/New_York',
    defaultCurrency: 'USD',
    defaultDateFormat: 'MM/DD/YYYY',
    lowStockThresholdDefault: 20,
    enableLotTracking: true,
    enableExpirationTracking: true
};
// Simulate network delay
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
const api = {
    getInventory: async ()=>{
        await delay(300);
        return [
            ...inventoryStore
        ];
    },
    getAuditLogs: async ()=>{
        await delay(200);
        return [
            ...auditStore
        ].sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    getInventoryMovements: async ()=>{
        await delay(200);
        return [
            ...movementStore
        ].sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    getDailySnapshots: async ()=>{
        await delay(150);
        return [
            ...snapshotStore
        ];
    },
    getLocations: async ()=>{
        await delay(200);
        return [
            ...locationStore
        ];
    },
    addLocation: async (data)=>{
        await delay(400);
        // Enforce (warehouseId, locationCode) uniqueness
        const exists = locationStore.some((loc)=>loc.warehouseId === data.warehouseId && loc.locationCode === data.locationCode);
        if (exists) {
            throw new Error(`Location code "${data.locationCode}" already exists in the selected warehouse.`);
        }
        const newLocation = {
            ...data,
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        locationStore.push(newLocation);
        return newLocation;
    },
    updateLocation: async (id, data)=>{
        await delay(400);
        const index = locationStore.findIndex((loc)=>loc.id === id);
        if (index === -1) throw new Error('Location not found');
        // Check uniqueness if modifying code or warehouse
        const newWarehouseId = data.warehouseId || locationStore[index].warehouseId;
        const newLocationCode = data.locationCode || locationStore[index].locationCode;
        if ((data.warehouseId || data.locationCode) && locationStore.some((loc)=>loc.id !== id && loc.warehouseId === newWarehouseId && loc.locationCode === newLocationCode)) {
            throw new Error(`Location code "${newLocationCode}" already exists in the selected warehouse.`);
        }
        locationStore[index] = {
            ...locationStore[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return locationStore[index];
    },
    receiveStock: async (data)=>{
        await delay(500);
        // Check if item with same SKU, Warehouse, and Lot exists. If so, simply add to it.
        const existingIndex = inventoryStore.findIndex((item)=>item.id === data.sku && item.warehouseId === data.warehouseId && item.lotNumber === data.lotNumber && (!data.locationCode || data.locationCode === "Default"));
        let updatedItem;
        if (existingIndex >= 0) {
            updatedItem = {
                ...inventoryStore[existingIndex],
                quantityOnHand: inventoryStore[existingIndex].quantityOnHand + data.quantity,
                ...data.unitCost !== undefined && {
                    lotReceiveCost: data.unitCost
                },
                lastUpdated: new Date().toISOString(),
                updatedBy: data.performedBy
            };
            inventoryStore[existingIndex] = updatedItem;
        } else {
            updatedItem = {
                id: data.sku,
                warehouseId: data.warehouseId,
                quantityOnHand: data.quantity,
                quantityReserved: 0,
                lotNumber: data.lotNumber || '',
                expirationDate: data.expirationDate || '',
                ...data.unitCost !== undefined && {
                    lotReceiveCost: data.unitCost
                },
                lastUpdated: new Date().toISOString(),
                updatedBy: data.performedBy
            };
            inventoryStore.push(updatedItem);
        }
        const log = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'RECEIVE',
            quantityChange: data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
            details: `Received lot ${data.lotNumber || 'N/A'}`
        };
        auditStore.push(log);
        const movement = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            movementType: 'RECEIVE',
            productId: data.sku,
            sku: data.sku,
            warehouseToId: data.warehouseId,
            locationToId: data.locationCode,
            lotNumber: data.lotNumber,
            expirationDate: data.expirationDate,
            quantity: data.quantity,
            reason: data.reason || 'Received Stock',
            createdAt: new Date().toISOString(),
            createdBy: data.performedBy,
            updatedAt: new Date().toISOString()
        };
        movementStore.push(movement);
        return updatedItem;
    },
    adjustStock: async (data)=>{
        await delay(500);
        // Find specific match, incorporating optional lot and location logic in real app
        // For mock, defaulting to basic match with lot if provided 
        const index = inventoryStore.findIndex((item)=>item.id === data.sku && item.warehouseId === data.warehouseId && (!data.lotNumber || item.lotNumber === data.lotNumber));
        if (index === -1) {
            throw new Error(`Item ${data.sku} not found in warehouse ${data.warehouseId} for specified lot/location`);
        }
        const oldItem = inventoryStore[index];
        let diff = data.quantity;
        if (data.adjustmentType === 'Decrease') {
            diff = -Math.abs(data.quantity);
        } else {
            diff = Math.abs(data.quantity);
        }
        const newQuantityOnHand = oldItem.quantityOnHand + diff;
        if (newQuantityOnHand < oldItem.quantityReserved) {
            throw new Error("Cannot decrease quantity on hand below reserved quantity.");
        }
        const updatedItem = {
            ...oldItem,
            quantityOnHand: newQuantityOnHand,
            lastUpdated: new Date().toISOString(),
            updatedBy: data.performedBy
        };
        inventoryStore[index] = updatedItem;
        const log = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'ADJUST',
            quantityChange: diff,
            reasonCode: data.reasonCode,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy
        };
        auditStore.push(log);
        const movement = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            movementType: 'ADJUST',
            productId: data.sku,
            sku: data.sku,
            warehouseFromId: data.warehouseId,
            locationFromId: data.locationCode,
            lotNumber: data.lotNumber,
            expirationDate: data.expirationDate,
            quantity: diff,
            reason: data.reasonCode || 'Adjustment',
            createdAt: new Date().toISOString(),
            createdBy: data.performedBy,
            updatedAt: new Date().toISOString()
        };
        movementStore.push(movement);
        return updatedItem;
    },
    transferStock: async (data)=>{
        await delay(600);
        // Optional filtering by specific lot if provided in form
        let sourceItems = inventoryStore.filter((item)=>item.id === data.sku && item.warehouseId === data.fromWarehouseId);
        if (data.lotNumber) {
            sourceItems = sourceItems.filter((item)=>item.lotNumber === data.lotNumber);
        }
        sourceItems = sourceItems.sort((a, b)=>new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
        let remainingToTransfer = data.quantity;
        const itemsToUpdate = [];
        // Check total available before starting
        const totalAvailable = sourceItems.reduce((sum, item)=>sum + (item.quantityOnHand - item.quantityReserved), 0);
        if (totalAvailable < data.quantity) {
            throw new Error(`Insufficient available quantity. Needed: ${data.quantity}, Available: ${totalAvailable}`);
        }
        // Deduct from source items using FEFO
        for (const item of sourceItems){
            if (remainingToTransfer <= 0) break;
            const availableInLot = item.quantityOnHand - item.quantityReserved;
            if (availableInLot <= 0) continue;
            const toDeduct = Math.min(availableInLot, remainingToTransfer);
            remainingToTransfer -= toDeduct;
            itemsToUpdate.push({
                ...item,
                deducted: toDeduct
            });
        }
        if (remainingToTransfer > 0) {
            throw new Error("Logic Error: Failed to allocate full transfer quantity despite sufficient balance.");
        }
        // Apply deductions and additions
        let lastSourceItemUpdated = null;
        let lastTargetItemUpdated = null;
        for (const update of itemsToUpdate){
            // Deduct
            const sourceIndex = inventoryStore.findIndex((i)=>i.id === update.id && i.warehouseId === update.warehouseId && i.lotNumber === update.lotNumber);
            inventoryStore[sourceIndex].quantityOnHand -= update.deducted;
            inventoryStore[sourceIndex].lastUpdated = new Date().toISOString();
            inventoryStore[sourceIndex].updatedBy = data.performedBy;
            lastSourceItemUpdated = inventoryStore[sourceIndex];
            // Log Source Deduction
            auditStore.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                itemId: data.sku,
                warehouseId: data.fromWarehouseId,
                action: 'TRANSFER_OUT',
                quantityChange: -update.deducted,
                timestamp: new Date().toISOString(),
                performedBy: data.performedBy,
                details: `Transferred to ${data.toWarehouseId} (Lot: ${update.lotNumber})`
            });
            // Add to target
            const targetIndex = inventoryStore.findIndex((i)=>i.id === data.sku && i.warehouseId === data.toWarehouseId && i.lotNumber === update.lotNumber);
            if (targetIndex >= 0) {
                inventoryStore[targetIndex].quantityOnHand += update.deducted;
                inventoryStore[targetIndex].lastUpdated = new Date().toISOString();
                inventoryStore[targetIndex].updatedBy = data.performedBy;
                lastTargetItemUpdated = inventoryStore[targetIndex];
            } else {
                const newItem = {
                    id: data.sku,
                    warehouseId: data.toWarehouseId,
                    quantityOnHand: update.deducted,
                    quantityReserved: 0,
                    lotNumber: update.lotNumber,
                    expirationDate: update.expirationDate,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: data.performedBy
                };
                inventoryStore.push(newItem);
                lastTargetItemUpdated = newItem;
            }
            // Log Target Addition
            auditStore.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                itemId: data.sku,
                warehouseId: data.toWarehouseId,
                action: 'TRANSFER_IN',
                quantityChange: update.deducted,
                timestamp: new Date().toISOString(),
                performedBy: data.performedBy,
                details: `Transferred from ${data.fromWarehouseId} (Lot: ${update.lotNumber})`
            });
            // Log Movement for Movement History Report
            const movement = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                movementType: 'TRANSFER',
                productId: data.sku,
                sku: data.sku,
                warehouseFromId: data.fromWarehouseId,
                locationFromId: data.fromLocationCode,
                warehouseToId: data.toWarehouseId,
                locationToId: data.toLocationCode,
                lotNumber: update.lotNumber,
                expirationDate: update.expirationDate,
                quantity: update.deducted,
                reason: data.reason || `Transferred to ${data.toWarehouseId}`,
                createdAt: new Date().toISOString(),
                createdBy: data.performedBy,
                updatedAt: new Date().toISOString()
            };
            movementStore.push(movement);
        }
        return {
            from: lastSourceItemUpdated,
            to: lastTargetItemUpdated
        };
    },
    // --- Settings API Mock ---
    getUsers: async ()=>{
        await delay(200);
        return [
            ...userStore
        ];
    },
    addUser: async (data)=>{
        await delay(300);
        const newUser = {
            ...data,
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        userStore.push(newUser);
        return newUser;
    },
    updateUser: async (id, data)=>{
        await delay(300);
        const index = userStore.findIndex((u)=>u.id === id);
        if (index === -1) throw new Error('User not found');
        userStore[index] = {
            ...userStore[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return userStore[index];
    },
    getWarehouses: async ()=>{
        await delay(200);
        return [
            ...warehouseStore
        ];
    },
    addWarehouse: async (data)=>{
        await delay(300);
        if (warehouseStore.some((w)=>w.warehouseCode === data.warehouseCode)) {
            throw new Error('Warehouse code must be unique');
        }
        if (data.isDefault) {
            warehouseStore.forEach((w)=>w.isDefault = false);
        }
        const newWarehouse = {
            ...data,
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        warehouseStore.push(newWarehouse);
        return newWarehouse;
    },
    updateWarehouse: async (id, data)=>{
        await delay(300);
        const index = warehouseStore.findIndex((w)=>w.id === id);
        if (index === -1) throw new Error('Warehouse not found');
        if (data.warehouseCode && data.warehouseCode !== warehouseStore[index].warehouseCode && warehouseStore.some((w)=>w.warehouseCode === data.warehouseCode)) {
            throw new Error('Warehouse code must be unique');
        }
        if (data.isDefault) {
            warehouseStore.forEach((w)=>w.isDefault = false);
        }
        warehouseStore[index] = {
            ...warehouseStore[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return warehouseStore[index];
    },
    getChannels: async ()=>{
        await delay(200);
        return [
            ...channelStore
        ];
    },
    addChannel: async (data)=>{
        await delay(300);
        const newChannel = {
            ...data,
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()
        };
        channelStore.push(newChannel);
        return newChannel;
    },
    updateChannel: async (id, data)=>{
        await delay(300);
        const index = channelStore.findIndex((c)=>c.id === id);
        if (index === -1) throw new Error('Channel not found');
        channelStore[index] = {
            ...channelStore[index],
            ...data
        };
        return channelStore[index];
    },
    deleteChannel: async (id)=>{
        await delay(300);
        const index = channelStore.findIndex((c)=>c.id === id);
        if (index === -1) throw new Error('Channel not found');
        channelStore.splice(index, 1);
    },
    getSystemSettings: async ()=>{
        await delay(200);
        return {
            ...systemSettingsStore
        };
    },
    updateSystemSettings: async (data)=>{
        await delay(300);
        Object.assign(systemSettingsStore, data);
        return {
            ...systemSettingsStore
        };
    },
    reverseMovement: async (movementId)=>{
        await delay(500);
        const original = movementStore.find((m)=>m.id === movementId);
        if (!original) throw new Error(`Movement ${movementId} not found`);
        if (original.isReversed) throw new Error('This movement has already been reversed.');
        const reversalId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])();
        const now = new Date().toISOString();
        // Create a reversal movement record
        const reversal = {
            id: reversalId,
            movementType: original.movementType,
            productId: original.productId,
            sku: original.sku,
            warehouseFromId: original.movementType === 'TRANSFER' ? original.warehouseToId : original.warehouseFromId,
            locationFromId: original.movementType === 'TRANSFER' ? original.locationToId : original.locationFromId,
            warehouseToId: original.movementType === 'TRANSFER' ? original.warehouseFromId : original.warehouseToId,
            locationToId: original.movementType === 'TRANSFER' ? original.locationFromId : original.locationToId,
            lotNumber: original.lotNumber,
            expirationDate: original.expirationDate,
            quantity: -original.quantity,
            reason: `REVERSAL of movement ${original.id}`,
            referenceType: 'REVERSAL',
            referenceId: original.id,
            createdAt: now,
            createdBy: 'System Admin',
            updatedAt: now
        };
        movementStore.push(reversal);
        // Apply reversal to inventory
        if (original.movementType === 'RECEIVE') {
            const targetIdx = inventoryStore.findIndex((i)=>i.id === original.sku && i.warehouseId === original.warehouseToId && (!original.lotNumber || i.lotNumber === original.lotNumber));
            if (targetIdx >= 0) {
                inventoryStore[targetIdx].quantityOnHand = Math.max(0, inventoryStore[targetIdx].quantityOnHand - original.quantity);
                inventoryStore[targetIdx].lastUpdated = now;
                inventoryStore[targetIdx].updatedBy = 'System Admin (Reversal)';
            }
        } else if (original.movementType === 'ADJUST') {
            const idx = inventoryStore.findIndex((i)=>i.id === original.sku && i.warehouseId === original.warehouseFromId && (!original.lotNumber || i.lotNumber === original.lotNumber));
            if (idx >= 0) {
                inventoryStore[idx].quantityOnHand = Math.max(0, inventoryStore[idx].quantityOnHand - original.quantity);
                inventoryStore[idx].lastUpdated = now;
                inventoryStore[idx].updatedBy = 'System Admin (Reversal)';
            }
        } else if (original.movementType === 'TRANSFER') {
            const sourceIdx = inventoryStore.findIndex((i)=>i.id === original.sku && i.warehouseId === original.warehouseToId && (!original.lotNumber || i.lotNumber === original.lotNumber));
            if (sourceIdx >= 0) {
                inventoryStore[sourceIdx].quantityOnHand = Math.max(0, inventoryStore[sourceIdx].quantityOnHand - original.quantity);
                inventoryStore[sourceIdx].lastUpdated = now;
                inventoryStore[sourceIdx].updatedBy = 'System Admin (Reversal)';
            }
            const destIdx = inventoryStore.findIndex((i)=>i.id === original.sku && i.warehouseId === original.warehouseFromId && (!original.lotNumber || i.lotNumber === original.lotNumber));
            if (destIdx >= 0) {
                inventoryStore[destIdx].quantityOnHand += original.quantity;
                inventoryStore[destIdx].lastUpdated = now;
                inventoryStore[destIdx].updatedBy = 'System Admin (Reversal)';
            } else {
                inventoryStore.push({
                    id: original.sku,
                    warehouseId: original.warehouseFromId,
                    quantityOnHand: original.quantity,
                    quantityReserved: 0,
                    lotNumber: original.lotNumber || '',
                    expirationDate: original.expirationDate || '',
                    lastUpdated: now,
                    updatedBy: 'System Admin (Reversal)'
                });
            }
        }
        // Mark original as reversed
        const origIdx = movementStore.findIndex((m)=>m.id === movementId);
        if (origIdx >= 0) {
            movementStore[origIdx].isReversed = true;
            movementStore[origIdx].reversalId = reversalId;
        }
        // Audit log
        auditStore.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: original.sku,
            warehouseId: original.warehouseFromId || original.warehouseToId || '',
            // @ts-expect-error action 'REVERSAL' is missing from types
            action: 'REVERSAL',
            quantityChange: -original.quantity,
            timestamp: now,
            performedBy: 'System Admin',
            details: `Reversed movement ${original.id} (${original.movementType})`
        });
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/LocationContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocationProvider",
    ()=>LocationProvider,
    "useLocations",
    ()=>useLocations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const LocationContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const LocationProvider = ({ children })=>{
    _s();
    const [locations, setLocations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshLocations = async ()=>{
        try {
            setLoading(true);
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getLocations();
            setLocations(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch locations');
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocationProvider.useEffect": ()=>{
            refreshLocations();
        }
    }["LocationProvider.useEffect"], []);
    const addLocation = async (data)=>{
        try {
            setLoading(true);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].addLocation(data);
            await refreshLocations();
        } catch (err) {
            setError(err.message || 'Failed to add location');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const updateLocation = async (id, data)=>{
        try {
            setLoading(true);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateLocation(id, data);
            await refreshLocations();
        } catch (err) {
            setError(err.message || 'Failed to update location');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const isLocationCodeUnique = (warehouseId, locationCode, excludeId)=>{
        return !locations.some((loc)=>loc.warehouseId === warehouseId && loc.locationCode === locationCode && loc.id !== excludeId);
    };
    const generateLocationCode = (warehousePrefix, aisle, section, shelf, bin)=>{
        const parts = [];
        if (warehousePrefix) parts.push(warehousePrefix);
        let m1 = '';
        if (aisle) m1 += aisle;
        if (section) m1 += section;
        if (m1) parts.push(m1);
        let m2 = '';
        if (shelf) m2 += shelf;
        if (bin) m2 += bin;
        if (m2) parts.push(m2);
        return parts.filter(Boolean).join('-');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LocationContext.Provider, {
        value: {
            locations,
            loading,
            error,
            refreshLocations,
            addLocation,
            updateLocation,
            isLocationCodeUnique,
            generateLocationCode
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/LocationContext.tsx",
        lineNumber: 92,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LocationProvider, "lyqqJySOUP3kBHrSwUSHlvdlzIo=");
_c = LocationProvider;
const useLocations = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LocationContext);
    if (context === undefined) {
        throw new Error('useLocations must be used within a LocationProvider');
    }
    return context;
};
_s1(useLocations, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LocationProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/shipstationApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "shipstationApi",
    ()=>shipstationApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
;
const mockShipStationResponse = [
    {
        orderId: 100001,
        orderNumber: 'SS-100001',
        orderDate: new Date().toISOString(),
        orderStatus: 'awaiting_shipment',
        customerUsername: 'Alice Wonder',
        customerEmail: 'alice@example.com',
        shipTo: {
            name: 'Alice Wonder',
            street1: '123 Rabbit Hole',
            street2: null,
            city: 'Wonderland',
            state: 'WL',
            postalCode: '12345',
            country: 'US'
        },
        items: [
            {
                orderItemId: 2001,
                sku: 'SKU-1001',
                name: 'Main Product',
                quantity: 1,
                unitPrice: 29.99
            }
        ],
        orderTotal: 34.99,
        taxAmount: 0.00,
        shippingAmount: 5.00,
        customerNotes: 'Please ship quickly!'
    },
    {
        orderId: 100002,
        orderNumber: 'SS-100002',
        orderDate: new Date(Date.now() - 3600000).toISOString(),
        orderStatus: 'awaiting_shipment',
        customerUsername: 'Bob Builder',
        customerEmail: 'bob@example.com',
        shipTo: {
            name: 'Bob Builder',
            street1: '456 Construction Way',
            street2: 'Suite B',
            city: 'Builder City',
            state: 'BC',
            postalCode: '67890',
            country: 'US'
        },
        items: [
            {
                orderItemId: 2002,
                sku: 'SKU-1002',
                name: 'Secondary Product',
                quantity: 3,
                unitPrice: 15.00
            },
            {
                orderItemId: 2003,
                sku: 'SKU-1004',
                name: 'Discounted Product',
                quantity: 1,
                unitPrice: 45.00
            }
        ],
        orderTotal: 96.50,
        taxAmount: 6.50,
        shippingAmount: 0.00,
        customerNotes: null
    }
];
// Helper to map ShipStation Address to our flat string format
const formatAddress = (shipTo)=>{
    return `${shipTo.name}, ${shipTo.street1}${shipTo.street2 ? ` ${shipTo.street2}` : ''}, ${shipTo.city}, ${shipTo.state} ${shipTo.postalCode}, ${shipTo.country}`;
};
const shipstationApi = {
    /**
     * Validates API credentials against the backend proxy.
     */ validateCredentials: async (apiKey, apiSecret)=>{
        try {
            const response = await fetch('/api/shipstation/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey,
                    apiSecret
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to validate credentials');
            }
            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    /**
     * Fetches orders from ShipStation using the provided credentials via proxy.
     */ fetchOrders: async (apiKey, apiSecret)=>{
        if (!apiKey || !apiSecret) {
            throw new Error('Authentication failed: Missing ShipStation API keys.');
        }
        const base64Credentials = btoa(`${apiKey}:${apiSecret}`);
        const response = await fetch('/api/shipstation/orders', {
            headers: {
                'Authorization': `Basic ${base64Credentials}`
            }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to fetch orders from ShipStation');
        }
        const data = await response.json();
        // Ensure we gracefully handle if there are no orders
        const ssOrders = data.orders || [];
        // Map the real ShipStation data to our internal Order schema
        const mappedOrders = ssOrders.map((ssOrder)=>{
            const orderId = `ORD-SS-${ssOrder.orderId}`;
            // Map items gracefully checking if items array exists
            const mappedItems = (ssOrder.items || []).map((item)=>({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    orderId: orderId,
                    sku: item.sku,
                    quantity: item.quantity,
                    price: item.unitPrice,
                    pickStatus: 'Pending'
                }));
            // Subtotal
            const subtotal = mappedItems.reduce((acc, item)=>acc + item.quantity * item.price, 0);
            const mockMargin = subtotal * 0.3; // Basic 30% mock margin since SS doesn't provide COGS natively
            return {
                id: orderId,
                channel: 'ShipStation',
                customerName: ssOrder.customerUsername || 'Unknown Customer',
                customerEmail: ssOrder.customerEmail || 'no-email@shc.com',
                shippingAddress: formatAddress(ssOrder.shipTo),
                orderDate: ssOrder.orderDate,
                // Map SS status to our internal
                fulfillmentStatus: 'New',
                paymentStatus: 'Paid',
                items: mappedItems,
                timeline: [
                    {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                        orderId: orderId,
                        timestamp: new Date().toISOString(),
                        action: 'Imported from ShipStation',
                        performedBy: 'System API',
                        notes: `Original Order #: ${ssOrder.orderNumber}`
                    }
                ],
                subtotal: subtotal,
                tax: ssOrder.taxAmount || 0,
                fees: ssOrder.shippingAmount || 0,
                total: ssOrder.orderTotal || 0,
                margin: mockMargin,
                notes: ssOrder.customerNotes || undefined
            };
        });
        return mappedOrders;
    },
    /**
     * Pushes stock quantities to ShipStation.
     */ syncInventory: async (apiKey, apiSecret)=>{
        if (!apiKey || !apiSecret) {
            throw new Error('Authentication failed: Missing ShipStation API keys.');
        }
        // Just simulating the validation of keys via proxy before resolving true
        await shipstationApi.validateCredentials(apiKey, apiSecret);
        // Note: Real inventory pushing to SS requires knowing their exact warehouse/location ID structure.
        console.log("Real Integration: Keys Validated. Ready to push stock levels to SS locations.");
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/SettingsContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SettingsProvider",
    ()=>SettingsProvider,
    "useSettings",
    ()=>useSettings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$shipstationApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/shipstationApi.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
const SettingsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const SettingsProvider = ({ children })=>{
    _s();
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [warehouses, setWarehouses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [channels, setChannels] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [systemSettings, setSystemSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshSettings = async ()=>{
        try {
            setLoading(true);
            setError(null);
            const [usersData, warehousesData, channelsData, systemSettingsData] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getUsers(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getWarehouses(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getChannels(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getSystemSettings()
            ]);
            setUsers(usersData);
            setWarehouses(warehousesData);
            setChannels(channelsData);
            setSystemSettings(systemSettingsData);
        } catch (err) {
            setError(err.message || "Failed to load settings data");
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SettingsProvider.useEffect": ()=>{
            refreshSettings();
        }
    }["SettingsProvider.useEffect"], []);
    // 15-minute background inventory sync for enabled channels
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SettingsProvider.useEffect": ()=>{
            const syncInterval = setInterval({
                "SettingsProvider.useEffect.syncInterval": async ()=>{
                    for (const channel of channels){
                        if (channel.isEnabled && channel.syncInventory) {
                            try {
                                console.log(`[Background Worker] Syncing inventory for ${channel.channel}...`);
                                if (channel.channel === 'ShipStation' && channel.apiKey && channel.apiSecret) {
                                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$shipstationApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shipstationApi"].syncInventory(channel.apiKey, channel.apiSecret);
                                }
                            // Add other channels here in the future
                            } catch (err) {
                                console.error(`[Background Worker] Failed to sync inventory for ${channel.channel}:`, err);
                            }
                        }
                    }
                }
            }["SettingsProvider.useEffect.syncInterval"], 15 * 60 * 1000); // 15 minutes
            return ({
                "SettingsProvider.useEffect": ()=>clearInterval(syncInterval)
            })["SettingsProvider.useEffect"];
        }
    }["SettingsProvider.useEffect"], [
        channels
    ]);
    // USER ACTIONS
    const addUser = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].addUser(data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to add user');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const updateUser = async (id, data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateUser(id, data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to update user');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    // WAREHOUSE ACTIONS
    const addWarehouse = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].addWarehouse(data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to add warehouse');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const updateWarehouse = async (id, data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateWarehouse(id, data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to update warehouse');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    // CHANNEL ACTIONS
    const addChannel = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].addChannel(data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to add channel');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const updateChannel = async (id, data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateChannel(id, data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to update channel');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const deleteChannel = async (id)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].deleteChannel(id);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to delete channel');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    // SYSTEM SETTINGS ACTIONS
    const updateSystemSettings = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateSystemSettings(data);
            await refreshSettings();
        } catch (err) {
            setError(err.message || 'Failed to update system settings');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SettingsContext.Provider, {
        value: {
            users,
            warehouses,
            channels,
            systemSettings,
            loading,
            error,
            refreshSettings,
            addUser,
            updateUser,
            addWarehouse,
            updateWarehouse,
            addChannel,
            updateChannel,
            deleteChannel,
            updateSystemSettings
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/SettingsContext.tsx",
        lineNumber: 206,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(SettingsProvider, "craevfDTMxMkxkedPG9+5xwGON8=");
_c = SettingsProvider;
const useSettings = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
_s1(useSettings, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "SettingsProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/ToastContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const ToastProvider = ({ children })=>{
    _s();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[showToast]": (message, type = 'info')=>{
            const id = crypto.randomUUID();
            setToasts({
                "ToastProvider.useCallback[showToast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            message,
                            type
                        }
                    ]
            }["ToastProvider.useCallback[showToast]"]);
            // Auto remove after 3 seconds
            setTimeout({
                "ToastProvider.useCallback[showToast]": ()=>{
                    setToasts({
                        "ToastProvider.useCallback[showToast]": (prev)=>prev.filter({
                                "ToastProvider.useCallback[showToast]": (t)=>t.id !== id
                            }["ToastProvider.useCallback[showToast]"])
                    }["ToastProvider.useCallback[showToast]"]);
                }
            }["ToastProvider.useCallback[showToast]"], 3000);
        }
    }["ToastProvider.useCallback[showToast]"], []);
    const removeToast = (id)=>{
        setToasts((prev)=>prev.filter((t)=>t.id !== id));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            showToast
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                },
                children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            minWidth: '250px',
                            backgroundColor: toast.type === 'error' ? 'var(--color-shc-red)' : toast.type === 'success' ? '#10B981' : 'var(--color-charcoal)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            animation: 'slideIn 0.3s ease-out forwards',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: toast.message
                            }, void 0, false, {
                                fileName: "[project]/src/context/ToastContext.tsx",
                                lineNumber: 64,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>removeToast(toast.id),
                                style: {
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/src/context/ToastContext.tsx",
                                    lineNumber: 77,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/context/ToastContext.tsx",
                                lineNumber: 65,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, toast.id, true, {
                        fileName: "[project]/src/context/ToastContext.tsx",
                        lineNumber: 47,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/context/ToastContext.tsx",
                lineNumber: 37,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `
            }, void 0, false, {
                fileName: "[project]/src/context/ToastContext.tsx",
                lineNumber: 82,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/context/ToastContext.tsx",
        lineNumber: 35,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ToastProvider, "bva7iOXLAgwOJBzZ6Hx6GD8IQA4=");
_c = ToastProvider;
const useToast = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
_s1(useToast, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ToastProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/ProductContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductProvider",
    ()=>ProductProvider,
    "useProducts",
    ()=>useProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const ProductContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Initial Mock Data
const initialProducts = [
    {
        id: 'p1',
        sku: 'WHEY-ISO-CHOC',
        type: 'simple',
        name: 'Whey Isolate - Chocolate',
        brand: 'Super Health',
        category: 'Protein',
        costOfGoods: 15.50,
        msrpPrice: 39.99,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'p2',
        sku: 'CREA-MONO-500',
        type: 'simple',
        name: 'Creatine Monohydrate 500g',
        brand: 'Super Health',
        category: 'Performance',
        costOfGoods: 8.00,
        msrpPrice: 19.99,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'b1',
        sku: 'MUSCLE-BUILD-STACK',
        type: 'bundle',
        name: 'Muscle Builder Stack',
        brand: 'Super Health',
        category: 'Bundles',
        msrpPrice: 49.99,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
const initialInventory = [
    {
        id: 'loc1',
        productId: 'p1',
        warehouseName: 'Main Warehouse',
        locationCode: 'A1-B2',
        qtyOnHand: 150,
        qtyReserved: 10,
        qtyAvailable: 140,
        lotReceiveCost: 13.00,
        lastUpdatedAt: new Date().toISOString()
    },
    {
        id: 'loc2',
        productId: 'p2',
        warehouseName: 'Main Warehouse',
        locationCode: 'C3-D4',
        qtyOnHand: 200,
        qtyReserved: 50,
        qtyAvailable: 150,
        lastUpdatedAt: new Date().toISOString()
    }
];
const initialBundleComponents = [
    {
        id: 'bc1',
        bundleProductId: 'b1',
        componentProductId: 'p1',
        quantityRequiredPerBundle: 1
    },
    {
        id: 'bc2',
        bundleProductId: 'b1',
        componentProductId: 'p2',
        quantityRequiredPerBundle: 1
    }
];
const initialCOGSHistory = [
    {
        id: 'cogs1',
        sku: 'WHEY-ISO-CHOC',
        previousCost: 13.00,
        newCost: 15.50,
        changedBy: 'Admin User',
        changedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        notes: 'Supplier price increase'
    }
];
const initialActivityLogs = [
    {
        id: 'act1',
        sku: 'WHEY-ISO-CHOC',
        action: 'Cost Updated',
        details: 'Cost changed from $13.00 → $15.50',
        user: 'Admin User',
        module: 'COGS',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
    }
];
const ProductProvider = ({ children })=>{
    _s();
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialProducts);
    const [inventoryLocations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialInventory);
    const [bundleComponents, setBundleComponents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialBundleComponents);
    const [cogsHistory, setCogsHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialCOGSHistory);
    const [activityLogs, setActivityLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialActivityLogs);
    const getProducts = ()=>products;
    const getProduct = (id)=>products.find((p)=>p.id === id);
    const addProduct = (data)=>{
        const newProduct = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setProducts((prev)=>[
                ...prev,
                newProduct
            ]);
        return newProduct;
    };
    const updateProduct = (id, data)=>{
        setProducts((prev)=>prev.map((p)=>p.id === id ? {
                    ...p,
                    ...data,
                    updatedAt: new Date().toISOString()
                } : p));
    };
    const getInventoryLocations = (productId)=>inventoryLocations.filter((loc)=>loc.productId === productId);
    const getBundleComponents = (bundleId)=>bundleComponents.filter((bc)=>bc.bundleProductId === bundleId);
    const addBundleComponent = (data)=>{
        const newComp = {
            ...data,
            id: crypto.randomUUID()
        };
        setBundleComponents((prev)=>[
                ...prev,
                newComp
            ]);
    };
    const removeBundleComponent = (id)=>{
        setBundleComponents((prev)=>prev.filter((bc)=>bc.id !== id));
    };
    const calculateSimpleInventory = (productId)=>{
        const locs = getInventoryLocations(productId);
        return locs.reduce((acc, loc)=>({
                qtyOnHand: acc.qtyOnHand + loc.qtyOnHand,
                qtyReserved: acc.qtyReserved + loc.qtyReserved,
                qtyAvailable: acc.qtyAvailable + loc.qtyAvailable
            }), {
            qtyOnHand: 0,
            qtyReserved: 0,
            qtyAvailable: 0
        });
    };
    const calculateBundleInventory = (bundleId)=>{
        const components = getBundleComponents(bundleId);
        if (components.length === 0) return 0;
        let maxBundles = Infinity;
        for (const comp of components){
            const inv = calculateSimpleInventory(comp.componentProductId);
            const possibleBundles = Math.floor(inv.qtyAvailable / comp.quantityRequiredPerBundle);
            if (possibleBundles < maxBundles) {
                maxBundles = possibleBundles;
            }
        }
        return maxBundles === Infinity ? 0 : maxBundles;
    };
    const calculateCOGS = (sku)=>{
        const product = products.find((p)=>p.sku === sku);
        if (!product || product.type !== 'simple' || !product.costOfGoods) return 0;
        const inv = calculateSimpleInventory(product.id);
        return product.costOfGoods * inv.qtyOnHand;
    };
    const logProductActivity = (sku, action, details, module)=>{
        const newLog = {
            id: crypto.randomUUID(),
            sku,
            action,
            details,
            user: 'Current User',
            module,
            timestamp: new Date().toISOString()
        };
        setActivityLogs((prev)=>[
                newLog,
                ...prev
            ]);
    };
    const logCostChange = (sku, newCost, notes)=>{
        const product = products.find((p)=>p.sku === sku);
        if (!product) return;
        const previousCost = product.costOfGoods || 0;
        const newCogsLog = {
            id: crypto.randomUUID(),
            sku,
            previousCost,
            newCost,
            changedBy: 'Current User',
            changedAt: new Date().toISOString(),
            notes
        };
        setCogsHistory((prev)=>[
                newCogsLog,
                ...prev
            ]);
        updateProduct(product.id, {
            costOfGoods: newCost
        });
        logProductActivity(sku, 'Cost Updated', `Cost changed from $${previousCost.toFixed(2)} → $${newCost.toFixed(2)}`, 'COGS');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProductContext.Provider, {
        value: {
            products,
            inventoryLocations,
            bundleComponents,
            cogsHistory,
            activityLogs,
            getProducts,
            getProduct,
            addProduct,
            updateProduct,
            getInventoryLocations,
            getBundleComponents,
            addBundleComponent,
            removeBundleComponent,
            calculateBundleInventory,
            calculateSimpleInventory,
            calculateCOGS,
            logCostChange,
            logProductActivity
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ProductContext.tsx",
        lineNumber: 255,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ProductProvider, "qgCk8rQAwZxeYjMsbaQMUgdWNbM=");
_c = ProductProvider;
const useProducts = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ProductContext);
    if (!context) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
};
_s1(useProducts, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ProductProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/InventoryContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InventoryProvider",
    ()=>InventoryProvider,
    "useInventory",
    ()=>useInventory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const InventoryContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const InventoryProvider = ({ children })=>{
    _s();
    const [inventory, setInventory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [auditLogs, setAuditLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [movements, setMovements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [snapshots, setSnapshots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const refreshInventory = async ()=>{
        try {
            setLoading(true);
            setError(null);
            const [invData, auditData, movementData, snapshotData] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getInventory(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getAuditLogs(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getInventoryMovements(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getDailySnapshots()
            ]);
            setInventory(invData);
            setAuditLogs(auditData);
            setMovements(movementData);
            setSnapshots(snapshotData);
        } catch (err) {
            setError(err.message || "Failed to load inventory data");
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InventoryProvider.useEffect": ()=>{
            refreshInventory();
        }
    }["InventoryProvider.useEffect"], []);
    const receiveStock = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].receiveStock(data);
            await refreshInventory();
        } catch (err) {
            setError(err.message || 'Failed to receive stock');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const adjustStock = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].adjustStock(data);
            await refreshInventory();
        } catch (err) {
            setError(err.message || 'Failed to adjust stock');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const transferStock = async (data)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].transferStock(data);
            await refreshInventory();
        } catch (err) {
            setError(err.message || 'Failed to transfer stock');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const reverseMovement = async (movementId)=>{
        try {
            setLoading(true);
            setError(null);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].reverseMovement(movementId);
            await refreshInventory();
        } catch (err) {
            setError(err.message || 'Failed to reverse movement');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InventoryContext.Provider, {
        value: {
            inventory,
            auditLogs,
            movements,
            snapshots,
            loading,
            error,
            refreshInventory,
            receiveStock,
            adjustStock,
            transferStock,
            reverseMovement
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/InventoryContext.tsx",
        lineNumber: 112,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(InventoryProvider, "lSOmJxZl6brBuFEsTdQOfffNGu4=");
_c = InventoryProvider;
const useInventory = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
_s1(useInventory, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "InventoryProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/ordersApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ordersApi",
    ()=>ordersApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
const generateMockTimeline = (orderId, status)=>{
    const timeline = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 3);
    timeline.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        orderId,
        timestamp: baseDate.toISOString(),
        action: 'Order Created',
        performedBy: 'System',
        notes: 'Imported from Channel'
    });
    if (status === 'Allocated' || status === 'Picking' || status === 'Packed' || status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 2);
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Inventory Allocated',
            performedBy: 'System Admin'
        });
    }
    if (status === 'Picking' || status === 'Packed' || status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 4);
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Picking Started',
            performedBy: 'Warehouse Staff'
        });
    }
    if (status === 'Packed' || status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 1);
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Order Packed',
            performedBy: 'Warehouse Staff'
        });
    }
    if (status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 5);
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Order Shipped',
            performedBy: 'Shipping Dept',
            notes: 'Tracking: 1Z9999999999999999'
        });
    }
    return timeline;
};
const initialOrders = [
    {
        id: 'ORD-2024-1001',
        channel: 'Amazon',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        shippingAddress: '123 Main St, Anytown, CA 90210',
        orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        fulfillmentStatus: 'New',
        paymentStatus: 'Paid',
        items: [
            {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId: 'ORD-2024-1001',
                sku: 'SKU-1001',
                quantity: 2,
                price: 29.99,
                pickStatus: 'Pending'
            }
        ],
        timeline: generateMockTimeline('ORD-2024-1001', 'New'),
        subtotal: 59.98,
        tax: 4.80,
        fees: 0,
        total: 64.78,
        margin: 25.50
    },
    {
        id: 'ORD-2024-1002',
        channel: 'B2B',
        customerName: 'Healthy Clinics Inc.',
        customerEmail: 'procurement@healthyclinics.com',
        shippingAddress: '456 Med Blvd, Suite 100, Wellness City, NY 10001',
        orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        fulfillmentStatus: 'Shipped',
        paymentStatus: 'Paid',
        items: [
            {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId: 'ORD-2024-1002',
                sku: 'SKU-1002',
                quantity: 50,
                price: 15.00,
                allocatedWarehouseId: 'WH-EAST',
                allocatedLotNumber: 'L-2023-B2',
                pickStatus: 'Picked'
            },
            {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId: 'ORD-2024-1002',
                sku: 'SKU-1004',
                quantity: 5,
                price: 45.00,
                allocatedWarehouseId: 'WH-WEST',
                allocatedLotNumber: 'L-2022-D4',
                pickStatus: 'Picked'
            }
        ],
        timeline: generateMockTimeline('ORD-2024-1002', 'Shipped'),
        subtotal: 975.00,
        tax: 0,
        fees: 25.00,
        total: 1000.00,
        margin: 400.00
    },
    {
        id: 'ORD-2024-1003',
        channel: 'Shopify',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        shippingAddress: '789 Oak Ln, Suburbia, TX 75001',
        orderDate: new Date().toISOString(),
        fulfillmentStatus: 'Allocated',
        paymentStatus: 'Paid',
        items: [
            {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId: 'ORD-2024-1003',
                sku: 'SKU-1003',
                quantity: 1,
                price: 89.99,
                allocatedWarehouseId: 'WH-MAIN',
                allocatedLotNumber: 'L-2024-C3',
                pickStatus: 'Pending'
            }
        ],
        timeline: generateMockTimeline('ORD-2024-1003', 'Allocated'),
        subtotal: 89.99,
        tax: 7.20,
        fees: 5.00,
        total: 102.19,
        margin: 45.00
    }
];
const ordersStore = [
    ...initialOrders
];
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
const ordersApi = {
    getOrders: async ()=>{
        await delay(400);
        return [
            ...ordersStore
        ].sort((a, b)=>new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    },
    getOrderById: async (id)=>{
        await delay(200);
        return ordersStore.find((o)=>o.id === id);
    },
    createB2BOrder: async (data)=>{
        await delay(600);
        const orderId = `ORD-B2B-${Math.floor(Math.random() * 10000)}`;
        // Calculate totals
        let subtotal = 0;
        const items = data.items.map((item)=>{
            subtotal += item.price * item.quantity;
            return {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                pickStatus: 'Pending'
            };
        });
        const tax = 0; // B2B usually tax exempt or handled differently
        const fees = 0;
        const total = subtotal + tax + fees;
        const margin = subtotal * 0.4; // Mock margin calculation
        const newOrder = {
            id: orderId,
            channel: 'B2B',
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            shippingAddress: data.shippingAddress,
            orderDate: new Date().toISOString(),
            fulfillmentStatus: 'New',
            paymentStatus: 'Unpaid',
            items,
            timeline: [
                {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    orderId,
                    timestamp: new Date().toISOString(),
                    action: 'B2B Order Created manually',
                    performedBy: data.performedBy,
                    notes: data.notes
                }
            ],
            subtotal,
            tax,
            fees,
            total,
            margin,
            notes: data.notes
        };
        ordersStore.push(newOrder);
        return newOrder;
    },
    updateOrderStatus: async (orderId, status, performedBy, notes)=>{
        await delay(400);
        const index = ordersStore.findIndex((o)=>o.id === orderId);
        if (index === -1) throw new Error(`Order ${orderId} not found`);
        const order = {
            ...ordersStore[index]
        };
        order.fulfillmentStatus = status;
        // If picking started, we don't automatically mark items as picked until they actually do it,
        // but for simplicity if Packed/Shipped, ensure items are picked.
        if (status === 'Packed' || status === 'Shipped') {
            order.items = order.items.map((item)=>({
                    ...item,
                    pickStatus: 'Picked'
                }));
        }
        order.timeline = [
            ...order.timeline,
            {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId,
                timestamp: new Date().toISOString(),
                action: `Status changed to ${status}`,
                performedBy,
                notes
            }
        ];
        ordersStore[index] = order;
        return order;
    },
    allocateInventory: async (orderId, performedBy)=>{
        await delay(800);
        const index = ordersStore.findIndex((o)=>o.id === orderId);
        if (index === -1) throw new Error(`Order ${orderId} not found`);
        const order = {
            ...ordersStore[index]
        };
        if (order.fulfillmentStatus !== 'New') {
            throw new Error(`Order ${orderId} is already ${order.fulfillmentStatus}. Cannot allocate.`);
        }
        const inventory = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getInventory();
        const allocationIssues = [];
        // Simple FEFO Allocation Logic mapped over items
        const updatedItems = order.items.map((item)=>{
            // Find all available lots for this SKU, sorted by earliest expiration date first
            const availableLots = inventory.filter((inv)=>inv.id === item.sku && inv.quantityOnHand - inv.quantityReserved > 0).sort((a, b)=>new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
            // For simplicity in this mock: we assume one order item line can be fulfilled by ONE lot right now
            // In a real system, it might split the item line into multiple lines for different lots.
            const targetLot = availableLots.find((lot)=>lot.quantityOnHand - lot.quantityReserved >= item.quantity);
            if (targetLot) {
                // In a true integration, we should call an API to reserve these items.
                // For this mock, we just record the allocation on the order.
                return {
                    ...item,
                    allocatedWarehouseId: targetLot.warehouseId,
                    allocatedLotNumber: targetLot.lotNumber
                };
            } else {
                allocationIssues.push(`Insufficient stock for SKU ${item.sku}. Required: ${item.quantity}`);
                return item; // Unchanged
            }
        });
        if (allocationIssues.length > 0) {
            throw new Error(`Allocation Failed: ${allocationIssues.join(' | ')}`);
        }
        order.items = updatedItems;
        order.fulfillmentStatus = 'Allocated';
        order.timeline = [
            ...order.timeline,
            {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                orderId,
                timestamp: new Date().toISOString(),
                action: 'Inventory Allocated (FEFO)',
                performedBy
            }
        ];
        ordersStore[index] = order;
        return order;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/OrderContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderProvider",
    ()=>OrderProvider,
    "useOrders",
    ()=>useOrders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/ordersApi.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/SettingsContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$shipstationApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/shipstationApi.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
;
const OrderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useOrders = ()=>{
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
_s(useOrders, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const OrderProvider = ({ children })=>{
    _s1();
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const { channels } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])();
    const fetchOrders = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ordersApi"].getOrders();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally{
            setLoading(false);
        }
    };
    const createB2BOrder = async (data)=>{
        setLoading(true);
        setError(null);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ordersApi"].createB2BOrder(data);
            await fetchOrders(); // Refresh table
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create B2B order');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const updateOrderStatus = async (orderId, status, performedBy, notes)=>{
        setLoading(true);
        setError(null);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ordersApi"].updateOrderStatus(orderId, status, performedBy, notes);
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to update order status to ${status}`);
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const allocateOrderInventory = async (orderId, performedBy)=>{
        setLoading(true);
        setError(null);
        try {
            // Need to first verify we have the inventory
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ordersApi"].allocateInventory(orderId, performedBy);
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to allocate inventory');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const syncShipStationOrders = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const ssChannel = channels.find((c)=>c.channel === 'ShipStation');
            if (!ssChannel || !ssChannel.isEnabled) {
                throw new Error("ShipStation integration is not enabled in settings.");
            }
            if (!ssChannel.apiKey || !ssChannel.apiSecret) {
                throw new Error("ShipStation API Keys are missing. Head to Settings > Integrations to configure them.");
            }
            const newOrders = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$shipstationApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shipstationApi"].fetchOrders(ssChannel.apiKey, ssChannel.apiSecret);
            // In a real app we'd save these via the backend ordersApi.
            // For now, we simulate inserting them into our context/store.
            setOrders((prev)=>{
                const existingIds = new Set(prev.map((o)=>o.id));
                const toAdd = newOrders.filter((o)=>!existingIds.has(o.id));
                return [
                    ...toAdd,
                    ...prev
                ];
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync with ShipStation');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OrderProvider.useEffect": ()=>{
            fetchOrders();
        }
    }["OrderProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderContext.Provider, {
        value: {
            orders,
            loading,
            error,
            fetchOrders,
            createB2BOrder,
            updateOrderStatus,
            allocateOrderInventory,
            syncShipStationOrders
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/OrderContext.tsx",
        lineNumber: 125,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(OrderProvider, "QhP3i8fVWsNmRbDlZVlFJaytaB4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"]
    ];
});
_c = OrderProvider;
var _c;
__turbopack_context__.k.register(_c, "OrderProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LocationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/LocationContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/SettingsContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ToastContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ProductContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/ProductContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/InventoryContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$OrderContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/OrderContext.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$LocationContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocationProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SettingsProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ToastContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$ProductContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductProvider"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InventoryProvider"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$OrderContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrderProvider"], {
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/src/app/providers.tsx",
                            lineNumber: 17,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/providers.tsx",
                        lineNumber: 16,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/providers.tsx",
                    lineNumber: 15,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/providers.tsx",
                lineNumber: 14,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/providers.tsx",
            lineNumber: 13,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/providers.tsx",
        lineNumber: 12,
        columnNumber: 9
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/warehouse.js [app-client] (ecmascript) <export default as Warehouse>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map.js [app-client] (ecmascript) <export default as Map>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down-to-line.js [app-client] (ecmascript) <export default as ArrowDownToLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left-right.js [app-client] (ecmascript) <export default as ArrowLeftRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const NAV_ITEMS = [
    {
        to: '/',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        label: 'Dashboard',
        end: true
    },
    {
        to: '/products',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
        label: 'Product Catalog'
    },
    {
        to: '/warehouses',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Map$3e$__["Map"],
        label: 'Stock by Warehouse'
    },
    {
        to: '/movements',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
        label: 'Movements'
    },
    {
        to: '/receiving',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__["ArrowDownToLine"],
        label: 'Receiving'
    },
    {
        to: '/locations',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
        label: 'Locations'
    },
    {
        to: '/orders',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
        label: 'Orders'
    },
    {
        to: '/data-management',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__["ArrowLeftRight"],
        label: 'Imports & Exports'
    },
    {
        to: '/expiration',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
        label: 'Expiration Dashboard'
    }
];
const BOTTOM_NAV = [
    {
        to: '/settings/users',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        label: 'Settings'
    }
];
const Layout = ({ children })=>{
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Layout.useState": ()=>{
            try {
                return sessionStorage.getItem('sidebar-collapsed') === 'true';
            } catch  {
                return false;
            }
        }
    }["Layout.useState"]);
    const [mobileOpen, setMobileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggleCollapsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Layout.useCallback[toggleCollapsed]": ()=>{
            setCollapsed({
                "Layout.useCallback[toggleCollapsed]": (prev)=>{
                    const next = !prev;
                    try {
                        sessionStorage.setItem('sidebar-collapsed', String(next));
                    } catch  {}
                    return next;
                }
            }["Layout.useCallback[toggleCollapsed]"]);
        }
    }["Layout.useCallback[toggleCollapsed]"], []);
    const sidebarClass = [
        'sidebar',
        collapsed ? 'sidebar-collapsed' : '',
        mobileOpen ? 'sidebar-open' : ''
    ].filter(Boolean).join(' ');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-shell",
        children: [
            mobileOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sidebar-overlay",
                onClick: ()=>setMobileOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/components/Layout.tsx",
                lineNumber: 84,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: sidebarClass,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sidebar-inner",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sidebar-logo",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$warehouse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Warehouse$3e$__["Warehouse"], {
                                    size: 26,
                                    color: "var(--color-shc-red)",
                                    className: "sidebar-logo-icon"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 96,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sidebar-logo-text",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sidebar-brand",
                                            children: "WMS"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 102,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sidebar-subtitle",
                                            children: "ERP Module"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 103,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 101,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Layout.tsx",
                            lineNumber: 95,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sidebar-nav",
                            children: NAV_ITEMS.map(({ to, icon: Icon, label, end })=>{
                                const isActive = end ? pathname === to : pathname.startsWith(to);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: to,
                                    className: `nav-link ${isActive ? 'active' : ''}`,
                                    title: label,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            size: 20,
                                            style: {
                                                flexShrink: 0
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 118,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "nav-link-label",
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 119,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, to, true, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 112,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0));
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/Layout.tsx",
                            lineNumber: 108,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sidebar-bottom",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "sidebar-collapse-btn",
                                    onClick: toggleCollapsed,
                                    "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar',
                                    children: [
                                        collapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                            size: 16,
                                            style: {
                                                flexShrink: 0
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 134,
                                            columnNumber: 35
                                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                            size: 16,
                                            style: {
                                                flexShrink: 0
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 135,
                                            columnNumber: 35
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "nav-link-label",
                                            children: "Collapse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 137,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 128,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sidebar-divider"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 140,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                BOTTOM_NAV.map(({ to, icon: Icon, label })=>{
                                    const isActive = pathname.startsWith(to);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: to,
                                        className: `nav-link ${isActive ? 'active' : ''}`,
                                        title: label,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                size: 20,
                                                style: {
                                                    flexShrink: 0
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Layout.tsx",
                                                lineNumber: 151,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "nav-link-label",
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/Layout.tsx",
                                                lineNumber: 152,
                                                columnNumber: 37
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, to, true, {
                                        fileName: "[project]/src/components/Layout.tsx",
                                        lineNumber: 145,
                                        columnNumber: 33
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Layout.tsx",
                            lineNumber: 126,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Layout.tsx",
                    lineNumber: 92,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/Layout.tsx",
                lineNumber: 91,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "main-content",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "main-inner",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                            className: "card topbar-card",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "mobile-menu-btn",
                                    onClick: ()=>setMobileOpen(true),
                                    "aria-label": "Open navigation",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Layout.tsx",
                                        lineNumber: 172,
                                        columnNumber: 29
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 167,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "topbar-location",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "topbar-label",
                                            children: "Location"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 176,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "topbar-value",
                                            children: "All Warehouses"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 177,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 175,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "topbar-user",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "user-avatar",
                                            children: "SA"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 181,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "user-info",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "user-name",
                                                    children: "System Admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Layout.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "user-email",
                                                    children: "admin@shc.com"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/Layout.tsx",
                                                    lineNumber: 184,
                                                    columnNumber: 33
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/Layout.tsx",
                                            lineNumber: 182,
                                            columnNumber: 29
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/Layout.tsx",
                                    lineNumber: 180,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Layout.tsx",
                            lineNumber: 165,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        children
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Layout.tsx",
                    lineNumber: 162,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/Layout.tsx",
                lineNumber: 161,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Layout.tsx",
        lineNumber: 81,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Layout, "FdPtzmHA9CffwCfyytE28qBUoa0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = Layout;
const __TURBOPACK__default__export__ = Layout;
var _c;
__turbopack_context__.k.register(_c, "Layout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_3c8f218a._.js.map