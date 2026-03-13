(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://miisspgluhxawixgntsb.supabase.co") || '';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paXNzcGdsdWh4YXdpeGdudHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjI5MjQsImV4cCI6MjA4ODk5ODkyNH0.CZssdhSfy51cnjh-Q1UxlV4DG-bMSZBhHr9k-tvVZqE") || '';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist/v4.js [app-client] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
;
// Audit, Movements, Snapshots, Users, Warehouses, Channels, Settings stay in memory for now.
const auditStore = [];
const movementStore = [];
const snapshotStore = Array.from({
    length: 30
}).map((_, i)=>{
    const daysAgo = 30 - i;
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString();
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
const INITIAL_CHANNELS = [
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
let channelStore = [];
if ("TURBOPACK compile-time truthy", 1) {
    const savedChannels = localStorage.getItem('shc_channels');
    if (savedChannels) {
        try {
            channelStore = JSON.parse(savedChannels);
        } catch (e) {
            console.error("Failed to parse channels from localStorage", e);
            channelStore = [
                ...INITIAL_CHANNELS
            ];
        }
    } else {
        channelStore = [
            ...INITIAL_CHANNELS
        ];
        localStorage.setItem('shc_channels', JSON.stringify(channelStore));
    }
} else {
    channelStore = [
        ...INITIAL_CHANNELS
    ];
}
const persistChannels = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.setItem('shc_channels', JSON.stringify(channelStore));
    }
};
const systemSettingsStore = {
    defaultTimeZone: 'America/New_York',
    defaultCurrency: 'USD',
    defaultDateFormat: 'MM/DD/YYYY',
    lowStockThresholdDefault: 20,
    enableLotTracking: true,
    enableExpirationTracking: true
};
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
const api = {
    getProducts: async ()=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('products').select('*');
        if (error) throw new Error(error.message);
        return data.map((p)=>({
                id: p.id,
                sku: p.sku,
                name: p.name,
                type: p.type,
                brand: p.brand,
                category: p.category,
                costOfGoods: p.cost_of_goods,
                msrpPrice: p.msrp_price,
                status: p.status,
                description: p.description,
                productImageUrl: p.product_image_url,
                reorderPoint: p.reorder_point,
                createdAt: p.created_at,
                updatedAt: p.updated_at
            }));
    },
    createProduct: async (data)=>{
        const dbEntry = {
            sku: data.sku,
            name: data.name,
            type: data.type,
            brand: data.brand,
            category: data.category,
            cost_of_goods: data.costOfGoods,
            msrp_price: data.msrpPrice,
            status: data.status,
            description: data.description,
            product_image_url: data.productImageUrl,
            reorder_point: data.reorderPoint
        };
        const { data: response, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('products').insert([
            dbEntry
        ]).select().single();
        if (error) throw new Error(error.message);
        return {
            ...data,
            id: response.id,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        };
    },
    updateProduct: async (id, data)=>{
        const dbEntry = {};
        if (data.sku !== undefined) dbEntry.sku = data.sku;
        if (data.name !== undefined) dbEntry.name = data.name;
        if (data.type !== undefined) dbEntry.type = data.type;
        if (data.brand !== undefined) dbEntry.brand = data.brand;
        if (data.category !== undefined) dbEntry.category = data.category;
        if (data.costOfGoods !== undefined) dbEntry.cost_of_goods = data.costOfGoods;
        if (data.msrpPrice !== undefined) dbEntry.msrp_price = data.msrpPrice;
        if (data.status !== undefined) dbEntry.status = data.status;
        if (data.description !== undefined) dbEntry.description = data.description;
        if (data.productImageUrl !== undefined) dbEntry.product_image_url = data.productImageUrl;
        if (data.reorderPoint !== undefined) dbEntry.reorder_point = data.reorderPoint;
        dbEntry.updated_at = new Date().toISOString();
        const { data: response, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('products').update(dbEntry).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return {
            id: response.id,
            sku: response.sku,
            name: response.name,
            type: response.type,
            brand: response.brand,
            category: response.category,
            costOfGoods: response.cost_of_goods,
            msrpPrice: response.msrp_price,
            status: response.status,
            description: response.description,
            productImageUrl: response.product_image_url,
            reorderPoint: response.reorder_point,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        };
    },
    bulkCreateProducts: async (products)=>{
        const entries = products.map((data)=>({
                sku: data.sku,
                name: data.name,
                type: data.type,
                brand: data.brand,
                category: data.category,
                cost_of_goods: data.costOfGoods,
                msrp_price: data.msrpPrice,
                status: data.status,
                description: data.description,
                product_image_url: data.productImageUrl,
                reorder_point: data.reorderPoint
            }));
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('products').upsert(entries, {
            onConflict: 'sku',
            ignoreDuplicates: true
        });
        if (error) throw new Error(error.message);
    },
    getInventory: async ()=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*');
        if (error) throw new Error(error.message);
        return data.map((dbItem)=>({
                id: dbItem.product_id,
                sku: dbItem.product_id,
                warehouseId: dbItem.warehouse_id,
                quantityOnHand: dbItem.quantity_on_hand,
                quantityReserved: dbItem.quantity_reserved,
                lotNumber: dbItem.lot_number,
                expirationDate: dbItem.expiration_date,
                lotReceiveCost: dbItem.lot_receive_cost,
                lastUpdated: dbItem.last_updated,
                updatedBy: dbItem.updated_by
            }));
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
    reserveInventory: async (items, performedBy)=>{
        for (const item of items){
            const { data: availableLots, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*').eq('product_id', item.sku).order('expiration_date', {
                ascending: true,
                nullsFirst: false
            });
            if (error) throw new Error(error.message);
            let remaining = item.quantity;
            for (const lot of availableLots){
                if (remaining <= 0) break;
                const available = lot.quantity_on_hand - lot.quantity_reserved;
                const toReserve = Math.min(available, remaining);
                if (toReserve > 0) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').update({
                        quantity_reserved: lot.quantity_reserved + toReserve
                    }).eq('id', lot.id);
                    remaining -= toReserve;
                }
            }
        }
    },
    releaseInventory: async (items, performedBy)=>{
        for (const item of items){
            const { data: reservedLots, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*').eq('product_id', item.sku).gt('quantity_reserved', 0);
            if (error) throw new Error(error.message);
            let remaining = item.quantity;
            for (const lot of reservedLots){
                if (remaining <= 0) break;
                const toRelease = Math.min(lot.quantity_reserved, remaining);
                if (toRelease > 0) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').update({
                        quantity_reserved: lot.quantity_reserved - toRelease
                    }).eq('id', lot.id);
                    remaining -= toRelease;
                }
            }
        }
    },
    getDailySnapshots: async ()=>{
        await delay(150);
        return [
            ...snapshotStore
        ];
    },
    getLocations: async ()=>{
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('locations').select('*');
        if (error) throw new Error(error.message);
        return data.map((loc)=>({
                id: loc.id,
                warehouseId: loc.warehouse_id,
                warehouseCode: loc.warehouse_code,
                warehouseName: loc.warehouse_name,
                locationCode: loc.location_code,
                displayName: loc.display_name,
                type: loc.type,
                description: loc.description,
                aisle: loc.aisle,
                section: loc.section,
                shelf: loc.shelf,
                bin: loc.bin,
                barcodeValue: loc.barcode_value,
                isActive: loc.is_active,
                createdBy: loc.created_by,
                updatedBy: loc.updated_by,
                createdAt: loc.created_at,
                updatedAt: loc.updated_at
            }));
    },
    addLocation: async (data)=>{
        const dbEntry = {
            warehouse_id: data.warehouseId,
            warehouse_code: data.warehouseCode,
            warehouse_name: data.warehouseName,
            location_code: data.locationCode,
            display_name: data.displayName,
            type: data.type,
            description: data.description,
            aisle: data.aisle,
            section: data.section,
            shelf: data.shelf,
            bin: data.bin,
            barcode_value: data.barcodeValue,
            is_active: data.isActive,
            created_by: data.createdBy,
            updated_by: data.updatedBy
        };
        const { data: response, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('locations').insert([
            dbEntry
        ]).select().single();
        if (error) throw new Error(error.message);
        return {
            ...data,
            id: response.id,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        };
    },
    updateLocation: async (id, data)=>{
        const dbEntry = {};
        if (data.warehouseId !== undefined) dbEntry.warehouse_id = data.warehouseId;
        if (data.warehouseCode !== undefined) dbEntry.warehouse_code = data.warehouseCode;
        if (data.warehouseName !== undefined) dbEntry.warehouse_name = data.warehouseName;
        if (data.locationCode !== undefined) dbEntry.location_code = data.locationCode;
        if (data.displayName !== undefined) dbEntry.display_name = data.displayName;
        if (data.type !== undefined) dbEntry.type = data.type;
        if (data.description !== undefined) dbEntry.description = data.description;
        if (data.aisle !== undefined) dbEntry.aisle = data.aisle;
        if (data.section !== undefined) dbEntry.section = data.section;
        if (data.shelf !== undefined) dbEntry.shelf = data.shelf;
        if (data.bin !== undefined) dbEntry.bin = data.bin;
        if (data.barcodeValue !== undefined) dbEntry.barcode_value = data.barcodeValue;
        if (data.isActive !== undefined) dbEntry.is_active = data.isActive;
        if (data.updatedBy !== undefined) dbEntry.updated_by = data.updatedBy;
        dbEntry.updated_at = new Date().toISOString();
        const { data: response, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('locations').update(dbEntry).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return {
            id: response.id,
            warehouseId: response.warehouse_id,
            warehouseCode: response.warehouse_code,
            warehouseName: response.warehouse_name,
            locationCode: response.location_code,
            displayName: response.display_name,
            type: response.type,
            description: response.description,
            aisle: response.aisle,
            section: response.section,
            shelf: response.shelf,
            bin: response.bin,
            barcodeValue: response.barcode_value,
            isActive: response.is_active,
            createdBy: response.created_by,
            updatedBy: response.updated_by,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        };
    },
    bulkImportLocations: async (newLocations)=>{
        const locationsToAdd = newLocations.map((data)=>({
                warehouse_id: data.warehouseId,
                warehouse_code: data.warehouseCode,
                warehouse_name: data.warehouseName,
                location_code: data.locationCode,
                display_name: data.displayName,
                type: data.type,
                description: data.description,
                aisle: data.aisle,
                section: data.section,
                shelf: data.shelf,
                bin: data.bin,
                barcode_value: data.barcodeValue,
                is_active: data.isActive,
                created_by: data.createdBy,
                updated_by: data.updatedBy
            }));
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('locations').upsert(locationsToAdd, {
            onConflict: 'warehouse_id,location_code',
            ignoreDuplicates: true
        });
        if (error) throw new Error(error.message);
    },
    receiveStock: async (data)=>{
        const { data: existingLots, error: selectError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*').eq('product_id', data.sku).eq('warehouse_id', data.warehouseId).eq('lot_number', data.lotNumber || '');
        if (selectError) throw new Error(selectError.message);
        let finalRecord;
        if (existingLots && existingLots.length > 0) {
            const lot = existingLots[0];
            const { data: updatedLot, error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').update({
                quantity_on_hand: lot.quantity_on_hand + data.quantity,
                updated_by: data.performedBy,
                last_updated: new Date().toISOString()
            }).eq('id', lot.id).select().single();
            if (updateError) throw new Error(updateError.message);
            finalRecord = updatedLot;
        } else {
            const { data: insertedLot, error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').insert([
                {
                    product_id: data.sku,
                    warehouse_id: data.warehouseId,
                    quantity_on_hand: data.quantity,
                    quantity_reserved: 0,
                    lot_number: data.lotNumber || '',
                    expiration_date: data.expirationDate || null,
                    lot_receive_cost: data.unitCost || 0,
                    updated_by: data.performedBy
                }
            ]).select().single();
            if (insertError) throw new Error(insertError.message);
            finalRecord = insertedLot;
        }
        auditStore.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'RECEIVE',
            quantityChange: data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
            details: `Received lot ${data.lotNumber || 'N/A'}`
        });
        movementStore.push({
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
        });
        return {
            id: finalRecord.product_id,
            sku: finalRecord.product_id,
            warehouseId: finalRecord.warehouse_id,
            quantityOnHand: finalRecord.quantity_on_hand,
            quantityReserved: finalRecord.quantity_reserved,
            lotNumber: finalRecord.lot_number,
            expirationDate: finalRecord.expiration_date,
            lotReceiveCost: finalRecord.lot_receive_cost,
            lastUpdated: finalRecord.last_updated,
            updatedBy: finalRecord.updated_by
        };
    },
    adjustStock: async (data)=>{
        let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*').eq('product_id', data.sku).eq('warehouse_id', data.warehouseId);
        if (data.lotNumber) query = query.eq('lot_number', data.lotNumber);
        const { data: existingLots, error: selectError } = await query;
        if (selectError) throw new Error(selectError.message);
        if (!existingLots || existingLots.length === 0) {
            throw new Error(`Item ${data.sku} not found for specified lot`);
        }
        const lot = existingLots[0];
        const diff = data.adjustmentType === 'Decrease' ? -Math.abs(data.quantity) : Math.abs(data.quantity);
        const newQty = lot.quantity_on_hand + diff;
        if (newQty < lot.quantity_reserved) {
            throw new Error("Cannot decrease quantity below reserved quantity.");
        }
        const { data: updatedLot, error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').update({
            quantity_on_hand: newQty,
            updated_by: data.performedBy,
            last_updated: new Date().toISOString()
        }).eq('id', lot.id).select().single();
        if (updateError) throw new Error(updateError.message);
        auditStore.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'ADJUST',
            quantityChange: diff,
            reasonCode: data.reasonCode,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy
        });
        movementStore.push({
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
        });
        return {
            id: updatedLot.product_id,
            sku: updatedLot.product_id,
            warehouseId: updatedLot.warehouse_id,
            quantityOnHand: updatedLot.quantity_on_hand,
            quantityReserved: updatedLot.quantity_reserved,
            lotNumber: updatedLot.lot_number,
            expirationDate: updatedLot.expiration_date,
            lotReceiveCost: updatedLot.lot_receive_cost,
            lastUpdated: updatedLot.last_updated,
            updatedBy: updatedLot.updated_by
        };
    },
    transferStock: async (data)=>{
        let query = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*').eq('product_id', data.sku).eq('warehouse_id', data.fromWarehouseId);
        if (data.lotNumber) query = query.eq('lot_number', data.lotNumber);
        const { data: sourceLots, error: selectError } = await query.order('expiration_date', {
            ascending: true
        });
        if (selectError) throw new Error(selectError.message);
        if (!sourceLots || sourceLots.length === 0) throw new Error('Source inventory not found');
        const totalAvailable = sourceLots.reduce((sum, item)=>sum + (item.quantity_on_hand - item.quantity_reserved), 0);
        if (totalAvailable < data.quantity) {
            throw new Error(`Insufficient available stock. Available: ${totalAvailable}, Requested: ${data.quantity}`);
        }
        let remainingToTransfer = data.quantity;
        let lastSourceItem;
        let lastTargetItem;
        for (const sLot of sourceLots){
            if (remainingToTransfer <= 0) break;
            const qtyAvailable = sLot.quantity_on_hand - sLot.quantity_reserved;
            if (qtyAvailable <= 0) continue;
            const transferQty = Math.min(qtyAvailable, remainingToTransfer);
            const { data: updatedSource, error: deductError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').update({
                quantity_on_hand: sLot.quantity_on_hand - transferQty
            }).eq('id', sLot.id).select().single();
            if (deductError) throw new Error(deductError.message);
            lastSourceItem = updatedSource;
            const { data: existingTargetLots, error: targetSelectError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').select('*').eq('product_id', data.sku).eq('warehouse_id', data.toWarehouseId).eq('lot_number', sLot.lot_number || '');
            if (targetSelectError) throw new Error(targetSelectError.message);
            if (existingTargetLots && existingTargetLots.length > 0) {
                const limitLot = existingTargetLots[0];
                const { data: updatedTarget, error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').update({
                    quantity_on_hand: limitLot.quantity_on_hand + transferQty
                }).eq('id', limitLot.id).select().single();
                if (updateError) throw new Error(updateError.message);
                lastTargetItem = updatedTarget;
            } else {
                const { data: insertedTarget, error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('inventory').insert([
                    {
                        product_id: data.sku,
                        warehouse_id: data.toWarehouseId,
                        quantity_on_hand: transferQty,
                        quantity_reserved: 0,
                        lot_number: sLot.lot_number || '',
                        expiration_date: sLot.expiration_date || null,
                        lot_receive_cost: sLot.lot_receive_cost || 0,
                        updated_by: data.performedBy
                    }
                ]).select().single();
                if (insertError) throw new Error(insertError.message);
                lastTargetItem = insertedTarget;
            }
            remainingToTransfer -= transferQty;
        }
        auditStore.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: data.sku,
            warehouseId: data.fromWarehouseId,
            action: 'TRANSFER_OUT',
            quantityChange: -data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy
        });
        auditStore.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            itemId: data.sku,
            warehouseId: data.toWarehouseId,
            action: 'TRANSFER_IN',
            quantityChange: data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy
        });
        movementStore.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            movementType: 'TRANSFER',
            productId: data.sku,
            sku: data.sku,
            warehouseFromId: data.fromWarehouseId,
            locationFromId: data.fromLocationCode,
            warehouseToId: data.toWarehouseId,
            locationToId: data.toLocationCode,
            quantity: data.quantity,
            reason: data.reason || 'Warehouse Transfer',
            createdAt: new Date().toISOString(),
            createdBy: data.performedBy,
            updatedAt: new Date().toISOString()
        });
        return {
            from: lastSourceItem ? {
                id: lastSourceItem.product_id,
                warehouseId: lastSourceItem.warehouse_id,
                quantityOnHand: lastSourceItem.quantity_on_hand,
                quantityReserved: lastSourceItem.quantity_reserved,
                lotNumber: lastSourceItem.lot_number,
                expirationDate: lastSourceItem.expiration_date,
                lotReceiveCost: lastSourceItem.lot_receive_cost,
                lastUpdated: lastSourceItem.last_updated,
                updatedBy: lastSourceItem.updated_by
            } : {},
            to: lastTargetItem ? {
                id: lastTargetItem.product_id,
                warehouseId: lastTargetItem.warehouse_id,
                quantityOnHand: lastTargetItem.quantity_on_hand,
                quantityReserved: lastTargetItem.quantity_reserved,
                lotNumber: lastTargetItem.lot_number,
                expirationDate: lastTargetItem.expiration_date,
                lotReceiveCost: lastTargetItem.lot_receive_cost,
                lastUpdated: lastTargetItem.last_updated,
                updatedBy: lastTargetItem.updated_by
            } : {}
        };
    },
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
            updatedAt: new Date().toISOString(),
            createdBy: 'System',
            updatedBy: 'System'
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
        const newWh = {
            ...data,
            id: data.warehouseCode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'System',
            updatedBy: 'System'
        };
        warehouseStore.push(newWh);
        return newWh;
    },
    updateWarehouse: async (id, data)=>{
        await delay(300);
        const index = warehouseStore.findIndex((w)=>w.id === id);
        if (index === -1) throw new Error('Warehouse not found');
        warehouseStore[index] = {
            ...warehouseStore[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return warehouseStore[index];
    },
    getChannels: async ()=>{
        await delay(300);
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
        persistChannels();
        return newChannel;
    },
    updateChannel: async (id, data)=>{
        await delay(500);
        const index = channelStore.findIndex((c)=>c.id === id);
        if (index === -1) throw new Error('Channel not found');
        channelStore[index] = {
            ...channelStore[index],
            ...data
        };
        persistChannels();
        return channelStore[index];
    },
    deleteChannel: async (id)=>{
        await delay(300);
        channelStore = channelStore.filter((c)=>c.id !== id);
        persistChannels();
    },
    getSystemSettings: async ()=>{
        await delay(150);
        return {
            ...systemSettingsStore
        };
    },
    updateSystemSettings: async (settings)=>{
        await delay(500);
        Object.assign(systemSettingsStore, settings);
        return {
            ...systemSettingsStore
        };
    },
    reverseMovement: async (movementId)=>{
        await delay(500);
        console.log(`Reversing movement ${movementId}`);
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
    const bulkImportLocations = async (newLocations)=>{
        try {
            setLoading(true);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].bulkImportLocations(newLocations);
            await refreshLocations();
        } catch (err) {
            setError(err.message || 'Failed to import locations');
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
            bulkImportLocations,
            isLocationCodeUnique,
            generateLocationCode
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/LocationContext.tsx",
        lineNumber: 106,
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
            // User-facing ShipStation Order Number
            const orderId = ssOrder.orderNumber;
            // Map items gracefully checking if items array exists
            const mappedItems = (ssOrder.items || []).map((item)=>({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
                    orderId: orderId,
                    sku: item.sku,
                    quantity: item.quantity,
                    price: item.unitPrice,
                    pickStatus: 'Pending',
                    mappingStatus: 'Mapped'
                }));
            // Subtotal
            const subtotal = mappedItems.reduce((acc, item)=>acc + item.quantity * item.price, 0);
            const mockMargin = subtotal * 0.3; // Basic 30% mock margin since SS doesn't provide COGS natively
            return {
                id: orderId,
                channel: 'ShipStation',
                storeName: ssOrder.advancedOptions?.source || 'ShipStation Store',
                customerName: ssOrder.advancedOptions?.source || 'ShipStation Store',
                shipToName: ssOrder.shipTo?.name || 'Unknown Recipient',
                customerEmail: ssOrder.customerEmail || 'no-email@shc.com',
                shippingAddress: formatAddress(ssOrder.shipTo),
                orderDate: ssOrder.orderDate,
                // Map SS status to our internal
                fulfillmentStatus: 'New',
                paymentStatus: 'Paid',
                carrier: ssOrder.carrierCode,
                requestedService: ssOrder.requestedShippingService,
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
            setSystemSettings(systemSettingsData);
            // Fetch channels from localStorage if available, otherwise fallback to API default
            if ("TURBOPACK compile-time truthy", 1) {
                const savedChannels = localStorage.getItem('shc_channels');
                if (savedChannels) {
                    try {
                        setChannels(JSON.parse(savedChannels));
                    } catch (e) {
                        console.error("Failed to parse channels", e);
                        setChannels(channelsData);
                    }
                } else {
                    setChannels(channelsData);
                    localStorage.setItem('shc_channels', JSON.stringify(channelsData));
                }
            } else //TURBOPACK unreachable
            ;
        } catch (err) {
            setError(err.message || "Failed to load settings data");
        } finally{
            setLoading(false);
        }
    };
    // Helper to persist to localStorage whenever channels change
    const updateChannelsState = (newChannels)=>{
        setChannels(newChannels);
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem('shc_channels', JSON.stringify(newChannels));
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
            const newChannel = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].addChannel(data);
            updateChannelsState([
                ...channels,
                newChannel
            ]);
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
            const updatedChannel = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateChannel(id, data);
            updateChannelsState(channels.map((c)=>c.id === id ? updatedChannel : c));
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
            updateChannelsState(channels.filter((c)=>c.id !== id));
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
        lineNumber: 232,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
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
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inventoryLocations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialInventory);
    const [bundleComponents, setBundleComponents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialBundleComponents);
    const [cogsHistory, setCogsHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialCOGSHistory);
    const [activityLogs, setActivityLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialActivityLogs);
    const fetchProducts = async ()=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProductProvider.useEffect": ()=>{
            fetchProducts();
        }
    }["ProductProvider.useEffect"], []);
    const getProducts = ()=>products;
    const getProduct = (id)=>products.find((p)=>p.id === id);
    const addProduct = async (data)=>{
        const newProduct = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].createProduct(data);
        await fetchProducts();
        return newProduct;
    };
    const updateProduct = async (id, data)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateProduct(id, data);
        await fetchProducts();
    };
    const bulkImportProducts = async (newProducts)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].bulkCreateProducts(newProducts);
        await fetchProducts();
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
            fetchProducts,
            getProduct,
            addProduct,
            updateProduct,
            bulkImportProducts,
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
        lineNumber: 273,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ProductProvider, "qWSasBWLovexef4B92UEI3VrgmE=");
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
    const reserveInventory = async (items, performedBy)=>{
        try {
            setLoading(true);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].reserveInventory(items, performedBy);
            await refreshInventory();
        } catch (err) {
            setError(err.message || 'Failed to reserve inventory');
        } finally{
            setLoading(false);
        }
    };
    const releaseInventory = async (items, performedBy)=>{
        try {
            setLoading(true);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].releaseInventory(items, performedBy);
            await refreshInventory();
        } catch (err) {
            setError(err.message || 'Failed to release inventory');
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
            reverseMovement,
            reserveInventory,
            releaseInventory
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/InventoryContext.tsx",
        lineNumber: 138,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.ts [app-client] (ecmascript)");
;
;
;
// Helper to reconstruct a pseudo-timeline from standard status + DB timestamps
const generateTimelineForOrder = (order)=>{
    const timeline = [];
    // Created
    timeline.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
        orderId: order.id,
        timestamp: order.created_at,
        action: 'Order Created',
        performedBy: 'System',
        notes: `Imported from ${order.channel}`
    });
    if (order.fulfillment_status === 'Allocated' || order.fulfillment_status === 'Picking' || order.fulfillment_status === 'Shipped') {
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId: order.id,
            timestamp: order.updated_at,
            action: 'Inventory Allocated',
            performedBy: 'System'
        });
    }
    if (order.fulfillment_status === 'Shipped') {
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId: order.id,
            timestamp: order.updated_at,
            action: 'Order Shipped',
            performedBy: 'Shipping Dept',
            notes: order.carrier ? `Carrier: ${order.carrier}` : undefined
        });
    }
    if (order.fulfillment_status === 'Cancelled') {
        timeline.push({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2f$v4$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])(),
            orderId: order.id,
            timestamp: order.canceled_at || order.updated_at,
            action: 'Order Cancelled',
            performedBy: order.canceled_by || 'System',
            notes: order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : undefined
        });
    }
    return timeline;
};
const ordersApi = {
    getOrders: async ()=>{
        const { data: dbOrders, error: ordersError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').select(`
                *,
                order_items (*)
            `).order('order_date', {
            ascending: false
        });
        if (ordersError) throw new Error(ordersError.message);
        return dbOrders.map((o)=>({
                id: o.id,
                channel: o.channel,
                storeName: o.store_name,
                customerName: o.customer_name,
                shipToName: o.ship_to_name,
                customerEmail: o.customer_email,
                shippingAddress: o.shipping_address,
                orderDate: o.order_date,
                fulfillmentStatus: o.fulfillment_status,
                paymentStatus: o.payment_status,
                carrier: o.carrier,
                requestedService: o.requested_service,
                subtotal: o.subtotal,
                tax: o.tax,
                fees: o.fees,
                total: o.total,
                margin: o.margin,
                notes: o.notes,
                canceledAt: o.canceled_at,
                canceledBy: o.canceled_by,
                cancellationReason: o.cancellation_reason,
                timeline: generateTimelineForOrder(o),
                items: o.order_items.map((i)=>({
                        id: i.id,
                        orderId: i.order_id,
                        sku: i.sku,
                        quantity: i.quantity,
                        price: i.price,
                        allocatedWarehouseId: i.allocated_warehouse_id,
                        allocatedLotNumber: i.allocated_lot_number,
                        pickStatus: i.pick_status,
                        mappingStatus: i.mapping_status
                    }))
            }));
    },
    getOrderById: async (id)=>{
        const { data: dbOrder, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').select('*, order_items(*)').eq('id', id).single();
        if (error || !dbOrder) return undefined;
        return {
            id: dbOrder.id,
            channel: dbOrder.channel,
            storeName: dbOrder.store_name,
            customerName: dbOrder.customer_name,
            shipToName: dbOrder.ship_to_name,
            customerEmail: dbOrder.customer_email,
            shippingAddress: dbOrder.shipping_address,
            orderDate: dbOrder.order_date,
            fulfillmentStatus: dbOrder.fulfillment_status,
            paymentStatus: dbOrder.payment_status,
            carrier: dbOrder.carrier,
            requestedService: dbOrder.requested_service,
            subtotal: dbOrder.subtotal,
            tax: dbOrder.tax,
            fees: dbOrder.fees,
            total: dbOrder.total,
            margin: dbOrder.margin,
            notes: dbOrder.notes,
            canceledAt: dbOrder.canceled_at,
            canceledBy: dbOrder.canceled_by,
            cancellationReason: dbOrder.cancellation_reason,
            timeline: generateTimelineForOrder(dbOrder),
            items: dbOrder.order_items.map((i)=>({
                    id: i.id,
                    orderId: i.order_id,
                    sku: i.sku,
                    quantity: i.quantity,
                    price: i.price,
                    allocatedWarehouseId: i.allocated_warehouse_id,
                    allocatedLotNumber: i.allocated_lot_number,
                    pickStatus: i.pick_status,
                    mappingStatus: i.mapping_status
                }))
        };
    },
    createB2BOrder: async (data)=>{
        const orderId = `ORD-B2B-${Math.floor(Math.random() * 10000)}`;
        let subtotal = 0;
        data.items.forEach((item)=>{
            subtotal += item.price * item.quantity;
        });
        const margin = subtotal * 0.4;
        const total = subtotal;
        const orderEntry = {
            id: orderId,
            channel: 'B2B',
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            shipping_address: data.shippingAddress,
            order_date: new Date().toISOString(),
            fulfillment_status: 'New',
            payment_status: 'Unpaid',
            subtotal,
            tax: 0,
            fees: 0,
            total,
            margin,
            notes: data.notes
        };
        const { error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').insert([
            orderEntry
        ]);
        if (orderError) throw new Error(orderError.message);
        const orderItemsEntries = data.items.map((item)=>({
                order_id: orderId,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                pick_status: 'Pending'
            }));
        const { error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('order_items').insert(orderItemsEntries);
        if (itemsError) throw new Error(itemsError.message);
        const newOrder = await ordersApi.getOrderById(orderId);
        if (!newOrder) throw new Error('Failed to retrieve newly created B2B order');
        return newOrder;
    },
    batchCreateOrders: async (orders)=>{
        if (!orders || orders.length === 0) return;
        const orderEntries = orders.map((o)=>({
                id: o.id,
                channel: o.channel,
                store_name: o.storeName,
                customer_name: o.customerName,
                ship_to_name: o.shipToName,
                customer_email: o.customerEmail,
                shipping_address: o.shippingAddress,
                order_date: o.orderDate,
                fulfillment_status: o.fulfillmentStatus,
                payment_status: o.paymentStatus,
                carrier: o.carrier,
                requested_service: o.requestedService,
                subtotal: o.subtotal,
                tax: o.tax,
                fees: o.fees,
                total: o.total,
                margin: o.margin,
                notes: o.notes
            }));
        // Upsert orders
        const { error: ordersError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').upsert(orderEntries, {
            onConflict: 'id',
            ignoreDuplicates: true
        });
        if (ordersError) throw new Error(ordersError.message);
        // Map items
        const itemEntries = [];
        orders.forEach((o)=>{
            o.items.forEach((i)=>{
                itemEntries.push({
                    order_id: o.id,
                    sku: i.sku,
                    quantity: i.quantity,
                    price: i.price,
                    pick_status: i.pickStatus,
                    mapping_status: i.mappingStatus
                });
            });
        });
        // Insert items (we could deduplicate better, but for SS sync we only pass new orders)
        if (itemEntries.length > 0) {
            const { error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('order_items').insert(itemEntries);
            if (itemsError) throw new Error(itemsError.message);
        }
    },
    updateOrderStatus: async (orderId, status, performedBy, notes)=>{
        const updateData = {
            fulfillment_status: status,
            updated_at: new Date().toISOString()
        };
        const { error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').update(updateData).eq('id', orderId);
        if (orderError) throw new Error(orderError.message);
        if (status === 'Packed' || status === 'Shipped') {
            const { error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('order_items').update({
                pick_status: 'Picked'
            }).eq('order_id', orderId);
            if (itemsError) throw new Error(itemsError.message);
        }
    },
    allocateInventory: async (orderId, performedBy)=>{
        const order = await ordersApi.getOrderById(orderId);
        if (!order) throw new Error(`Order ${orderId} not found`);
        if (order.fulfillmentStatus !== 'New') {
            throw new Error(`Order ${orderId} is already ${order.fulfillmentStatus}. Cannot allocate.`);
        }
        const inventory = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getInventory();
        const allocationIssues = [];
        // For each item, allocate
        for (const item of order.items){
            const availableLots = inventory.filter((inv)=>inv.id === item.sku && inv.quantityOnHand - inv.quantityReserved > 0).sort((a, b)=>new Date(a.expirationDate || '9999-12-31').getTime() - new Date(b.expirationDate || '9999-12-31').getTime());
            const targetLot = availableLots.find((lot)=>lot.quantityOnHand - lot.quantityReserved >= item.quantity);
            if (targetLot) {
                // Update specific order item with allocated warehouse/lot
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('order_items').update({
                    allocated_warehouse_id: targetLot.warehouseId,
                    allocated_lot_number: targetLot.lotNumber
                }).eq('id', item.id);
            } else {
                allocationIssues.push(`Insufficient stock for SKU ${item.sku}`);
            }
        }
        if (allocationIssues.length > 0) {
            throw new Error(`Allocation Failed: ${allocationIssues.join(' | ')}`);
        }
        // Only update status if fully allocated without throws
        await ordersApi.updateOrderStatus(orderId, 'Allocated', performedBy);
        const finalOrder = await ordersApi.getOrderById(orderId);
        return finalOrder;
    },
    cancelOrder: async (orderId, reason, performedBy)=>{
        const order = await ordersApi.getOrderById(orderId);
        if (!order) throw new Error(`Order ${orderId} not found`);
        if (order.fulfillmentStatus === 'Shipped') {
            throw new Error('Cannot cancel an order that has already shipped');
        }
        const timestamp = new Date().toISOString();
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('orders').update({
            fulfillment_status: 'Cancelled',
            canceled_at: timestamp,
            canceled_by: performedBy,
            cancellation_reason: reason,
            updated_at: timestamp
        }).eq('id', orderId);
        if (error) throw new Error(error.message);
        const updatedOrder = await ordersApi.getOrderById(orderId);
        return updatedOrder;
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/InventoryContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
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
    const { reserveInventory, releaseInventory, inventory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInventory"])();
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
            await reserveInventory(data.items.map((i)=>({
                    sku: i.sku,
                    quantity: i.quantity
                })), data.performedBy);
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
    const cancelOrder = async (orderId, reason, performedBy)=>{
        setLoading(true);
        setError(null);
        try {
            const orderToCancel = orders.find((o)=>o.id === orderId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ordersApi"].cancelOrder(orderId, reason, performedBy);
            if (orderToCancel) {
                await releaseInventory(orderToCancel.items.map((i)=>({
                        sku: i.sku,
                        quantity: i.quantity
                    })), performedBy);
            }
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel order');
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
            const existingIds = new Set(orders.map((o)=>o.id)); // Use current orders snapshot
            const toAdd = newOrders.filter((o)=>!existingIds.has(o.id));
            if (toAdd.length > 0) {
                // Cross-reference with inventory to set mappingStatus
                const existingSkus = new Set(inventory.map((inv)=>inv.id));
                toAdd.forEach((order)=>{
                    order.items.forEach((item)=>{
                        item.mappingStatus = existingSkus.has(item.sku) ? 'Mapped' : 'Unmapped';
                    });
                });
                // Reserve inventory for valid items automatically
                const itemsToReserve = toAdd.flatMap((o)=>o.items.filter((i)=>i.mappingStatus === 'Mapped').map((i)=>({
                            sku: i.sku,
                            quantity: i.quantity
                        })));
                if (itemsToReserve.length > 0) {
                    await reserveInventory(itemsToReserve, 'System API Sync');
                }
                // Persist the newly fetched external orders into our Supabase database permanently
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$ordersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ordersApi"].batchCreateOrders(toAdd);
                // Fetch orders directly from DB to refresh UI with truth
                await fetchOrders();
            }
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
            syncShipStationOrders,
            cancelOrder
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/OrderContext.tsx",
        lineNumber: 167,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(OrderProvider, "iWJk0Ah+HtykwvvqVez5W8J+6jM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$SettingsContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$InventoryContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInventory"]
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

//# sourceMappingURL=src_09b0cb21._.js.map