import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type {
    InventoryItem,
    AuditLog,
    ReceiptFormData,
    TransferFormData,
    AdjustmentFormData,
    InventoryMovement,
    WarehouseLocation,
    User,
    Warehouse,
    ChannelConfig,
    SystemSettings,
    DailySnapshot,
    Product
} from '../types';

// Audit, Movements, Snapshots, Users, Warehouses, Channels, Settings stay in memory for now.
const auditStore: AuditLog[] = [];
const movementStore: InventoryMovement[] = [];

const snapshotStore: DailySnapshot[] = Array.from({ length: 30 }).map((_, i) => {
    const daysAgo = 30 - i;
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString();
    const baseAvailable = 800;
    const availableVariance = Math.floor(Math.sin(daysAgo) * 50) + (i * 2);
    const baseCogs = 12000;
    const cogsVariance = Math.floor(Math.cos(daysAgo) * 500) + (i * 50);
    const baseLowStock = 10;
    const lowStockVariance = Math.floor(Math.sin(daysAgo / 2) * 3) - Math.floor(i / 10);
    return {
        date,
        totalAvailable: baseAvailable + availableVariance,
        totalCogs: baseCogs + cogsVariance,
        lowStockCount: Math.max(0, baseLowStock + lowStockVariance)
    };
});

const userStore: User[] = [
    {
        id: uuidv4(),
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
        id: uuidv4(),
        fullName: 'Warehouse Manager',
        email: 'manager@shc.com',
        role: 'Manager',
        isActive: true,
        allowedWarehouses: ['WH-MAIN'],
        createdAt: new Date().toISOString(),
        createdBy: 'System',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
    }
];

const warehouseStore: Warehouse[] = [
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

const INITIAL_CHANNELS: ChannelConfig[] = [
    {
        id: uuidv4(),
        channel: 'Amazon',
        storeName: 'Amazon US Main',
        isEnabled: true,
        defaultWarehouseId: 'WH-MAIN',
        notes: 'FBA and FBM synced'
    },
    {
        id: uuidv4(),
        channel: 'Shopify',
        storeName: 'Super Health Center DTC',
        isEnabled: true,
        defaultWarehouseId: 'WH-MAIN',
        notes: 'DTC Site'
    },
    {
        id: uuidv4(),
        channel: 'Walmart',
        storeName: 'Walmart Marketplace',
        isEnabled: false,
        notes: 'Pending API keys'
    },
    {
        id: uuidv4(),
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

let channelStore: ChannelConfig[] = [];
if (typeof window !== 'undefined') {
    const savedChannels = localStorage.getItem('shc_channels');
    if (savedChannels) {
        try {
            channelStore = JSON.parse(savedChannels);
        } catch (e) {
            console.error("Failed to parse channels from localStorage", e);
            channelStore = [...INITIAL_CHANNELS];
        }
    } else {
        channelStore = [...INITIAL_CHANNELS];
        localStorage.setItem('shc_channels', JSON.stringify(channelStore));
    }
} else {
    channelStore = [...INITIAL_CHANNELS];
}

const persistChannels = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('shc_channels', JSON.stringify(channelStore));
    }
};

const systemSettingsStore: SystemSettings = {
    defaultTimeZone: 'America/New_York',
    defaultCurrency: 'USD',
    defaultDateFormat: 'MM/DD/YYYY',
    lowStockThresholdDefault: 20,
    enableLotTracking: true,
    enableExpirationTracking: true,
    inventoryDeductionMethod: 'FEFO',
    autoDeductInventoryOnShipped: true
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    getProducts: async (): Promise<Product[]> => {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw new Error(error.message);
        
        return data.map(p => ({
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
        })) as Product[];
    },

    createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
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
        const { data: response, error } = await supabase.from('products').insert([dbEntry]).select().single();
        if (error) throw new Error(error.message);

        return {
            ...data,
            id: response.id,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        } as Product;
    },

    updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
        const dbEntry: any = {};
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

        const { data: response, error } = await supabase.from('products').update(dbEntry).eq('id', id).select().single();
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
        } as Product;
    },

    bulkCreateProducts: async (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> => {
        const entries = products.map(data => ({
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

        const { error } = await supabase.from('products').upsert(entries, { onConflict: 'sku', ignoreDuplicates: true });
        if (error) throw new Error(error.message);
    },

    getInventory: async (): Promise<InventoryItem[]> => {
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) throw new Error(error.message);
        
        return data.map(dbItem => ({
            id: dbItem.product_id, // For backward compatibility with InventoryItem 'id' being SKU
            sku: dbItem.product_id,
            warehouseId: dbItem.warehouse_id,
            locationCode: dbItem.location_code || undefined,
            quantityOnHand: dbItem.quantity_on_hand,
            quantityReserved: dbItem.quantity_reserved,
            lotNumber: dbItem.lot_number,
            expirationDate: dbItem.expiration_date,
            lotReceiveCost: dbItem.lot_receive_cost,
            lastUpdated: dbItem.last_updated,
            updatedBy: dbItem.updated_by
        })) as InventoryItem[];
    },

    getAuditLogs: async (): Promise<AuditLog[]> => {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(500);
        if (error) return [...auditStore]; // fallback to in-memory if table doesn't exist yet
        return (data || []).map(r => ({
            id: r.id,
            itemId: r.item_id,
            warehouseId: r.warehouse_id,
            action: r.action,
            quantityChange: r.quantity_change,
            reasonCode: r.reason_code,
            timestamp: r.timestamp,
            performedBy: r.performed_by,
            details: r.details
        }));
    },

    getInventoryMovements: async (): Promise<InventoryMovement[]> => {
        const { data, error } = await supabase
            .from('inventory_movements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);
        if (error) return [...movementStore]; // fallback to in-memory if table doesn't exist yet
        return (data || []).map(r => ({
            id: r.id,
            movementType: r.movement_type,
            productId: r.product_id,
            sku: r.sku,
            warehouseFromId: r.warehouse_from_id,
            locationFromId: r.location_from_id,
            warehouseToId: r.warehouse_to_id,
            locationToId: r.location_to_id,
            lotNumber: r.lot_number,
            expirationDate: r.expiration_date,
            quantity: r.quantity,
            reason: r.reason,
            createdAt: r.created_at,
            createdBy: r.created_by,
            updatedAt: r.updated_at
        }));
    },

    reserveInventory: async (items: { sku: string, quantity: number }[], performedBy: string): Promise<void> => {
        for (const item of items) {
            const { data: availableLots, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('product_id', item.sku)
                .order('expiration_date', { ascending: true, nullsFirst: false });
            
            if (error) throw new Error(error.message);

            let remaining = item.quantity;
            for (const lot of availableLots) {
                if (remaining <= 0) break;
                const available = lot.quantity_on_hand - lot.quantity_reserved;
                const toReserve = Math.min(available, remaining);
                
                if (toReserve > 0) {
                    await supabase
                        .from('inventory')
                        .update({ quantity_reserved: lot.quantity_reserved + toReserve })
                        .eq('id', lot.id);
                    remaining -= toReserve;
                }
            }
        }
    },

    releaseInventory: async (items: { sku: string, quantity: number }[], performedBy: string): Promise<void> => {
        for (const item of items) {
            const { data: reservedLots, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('product_id', item.sku)
                .gt('quantity_reserved', 0);

            if (error) throw new Error(error.message);

            let remaining = item.quantity;
            for (const lot of reservedLots) {
                if (remaining <= 0) break;
                const toRelease = Math.min(lot.quantity_reserved, remaining);
                
                if (toRelease > 0) {
                    await supabase
                        .from('inventory')
                        .update({ quantity_reserved: lot.quantity_reserved - toRelease })
                        .eq('id', lot.id);
                    remaining -= toRelease;
                }
            }
        }
    },

    getDailySnapshots: async (): Promise<DailySnapshot[]> => {
        await delay(150);
        return [...snapshotStore];
    },

    getLocations: async (): Promise<WarehouseLocation[]> => {
        const { data, error } = await supabase.from('locations').select('*');
        if (error) throw new Error(error.message);

        return data.map(loc => ({
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
        })) as WarehouseLocation[];
    },

    addLocation: async (data: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<WarehouseLocation> => {
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

        const { data: response, error } = await supabase.from('locations').insert([dbEntry]).select().single();
        if (error) throw new Error(error.message);

        return {
            ...data,
            id: response.id,
            createdAt: response.created_at,
            updatedAt: response.updated_at
        };
    },

    updateLocation: async (id: string, data: Partial<WarehouseLocation>): Promise<WarehouseLocation> => {
        const dbEntry: any = {};
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

        const { data: response, error } = await supabase.from('locations').update(dbEntry).eq('id', id).select().single();
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
        } as WarehouseLocation;
    },

    bulkImportLocations: async (newLocations: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> => {
        const locationsToAdd = newLocations.map(data => ({
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
            is_active: data.isActive
        }));

        const { error } = await supabase.from('locations').insert(locationsToAdd);
        if (error) throw new Error(error.message);
    },

    bulkImportInventory: async (entries: Array<{
        sku: string;
        warehouseId: string;
        locationCode?: string;
        quantityOnHand: number;
        lotNumber?: string;
        expirationDate?: string;
        lotReceiveCost?: number;
    }>): Promise<void> => {
        const rows = entries.map(e => ({
            product_id: e.sku,
            warehouse_id: e.warehouseId,
            location_code: e.locationCode || null,
            quantity_on_hand: e.quantityOnHand,
            quantity_reserved: 0,
            lot_number: e.lotNumber || '',
            expiration_date: e.expirationDate || null,
            lot_receive_cost: e.lotReceiveCost || 0,
            updated_by: 'CSV Import',
        }));
        const { error } = await supabase.from('inventory').insert(rows);
        if (error) throw new Error(error.message);
    },

    receiveStock: async (data: ReceiptFormData): Promise<InventoryItem> => {
        const { data: existingLots, error: selectError } = await supabase
            .from('inventory')
            .select('*')
            .eq('product_id', data.sku)
            .eq('warehouse_id', data.warehouseId)
            .eq('lot_number', data.lotNumber || '');

        if (selectError) throw new Error(selectError.message);

        let finalRecord;

        if (existingLots && existingLots.length > 0) {
            const lot = existingLots[0];
            const { data: updatedLot, error: updateError } = await supabase
                .from('inventory')
                .update({ 
                    quantity_on_hand: lot.quantity_on_hand + data.quantity,
                    updated_by: data.performedBy,
                    last_updated: new Date().toISOString()
                })
                .eq('id', lot.id)
                .select()
                .single();
            if (updateError) throw new Error(updateError.message);
            finalRecord = updatedLot;
        } else {
            const { data: insertedLot, error: insertError } = await supabase
                .from('inventory')
                .insert([{
                    product_id: data.sku,
                    warehouse_id: data.warehouseId,
                    location_code: data.locationCode || null,
                    quantity_on_hand: data.quantity,
                    quantity_reserved: 0,
                    lot_number: data.lotNumber || '',
                    expiration_date: data.expirationDate || null,
                    lot_receive_cost: data.unitCost || 0,
                    updated_by: data.performedBy
                }])
                .select()
                .single();
            if (insertError) throw new Error(insertError.message);
            finalRecord = insertedLot;
        }

        const now = new Date().toISOString();
        await supabase.from('audit_logs').insert([{
            id: uuidv4(),
            item_id: data.sku,
            warehouse_id: data.warehouseId,
            action: 'RECEIVE',
            quantity_change: data.quantity,
            timestamp: now,
            performed_by: data.performedBy,
            details: `Received lot ${data.lotNumber || 'N/A'}`
        }]);
        await supabase.from('inventory_movements').insert([{
            id: uuidv4(),
            movement_type: 'RECEIVE',
            product_id: data.sku,
            sku: data.sku,
            warehouse_to_id: data.warehouseId,
            location_to_id: data.locationCode || null,
            lot_number: data.lotNumber || null,
            expiration_date: data.expirationDate || null,
            quantity: data.quantity,
            reason: data.reason || 'Received Stock',
            created_at: now,
            created_by: data.performedBy,
            updated_at: now
        }]);

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
        } as InventoryItem;
    },

    adjustStock: async (data: AdjustmentFormData): Promise<InventoryItem> => {
        let query = supabase.from('inventory').select('*').eq('product_id', data.sku).eq('warehouse_id', data.warehouseId);
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

        const { data: updatedLot, error: updateError } = await supabase
            .from('inventory')
            .update({ quantity_on_hand: newQty, updated_by: data.performedBy, last_updated: new Date().toISOString() })
            .eq('id', lot.id)
            .select()
            .single();
        
        if (updateError) throw new Error(updateError.message);

        const nowAdj = new Date().toISOString();
        await supabase.from('audit_logs').insert([{
            id: uuidv4(),
            item_id: data.sku,
            warehouse_id: data.warehouseId,
            action: 'ADJUST',
            quantity_change: diff,
            reason_code: data.reasonCode || null,
            timestamp: nowAdj,
            performed_by: data.performedBy
        }]);
        await supabase.from('inventory_movements').insert([{
            id: uuidv4(),
            movement_type: 'ADJUST',
            product_id: data.sku,
            sku: data.sku,
            warehouse_from_id: data.warehouseId,
            location_from_id: data.locationCode || null,
            lot_number: data.lotNumber || null,
            expiration_date: data.expirationDate || null,
            quantity: diff,
            reason: data.reasonCode || 'Adjustment',
            created_at: nowAdj,
            created_by: data.performedBy,
            updated_at: nowAdj
        }]);

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
        } as InventoryItem;
    },

    transferStock: async (data: TransferFormData): Promise<{ from: InventoryItem, to: InventoryItem }> => {
        let query = supabase.from('inventory').select('*').eq('product_id', data.sku).eq('warehouse_id', data.fromWarehouseId);
        if (data.lotNumber) query = query.eq('lot_number', data.lotNumber);

        const { data: sourceLots, error: selectError } = await query.order('expiration_date', { ascending: true });
        if (selectError) throw new Error(selectError.message);
        if (!sourceLots || sourceLots.length === 0) throw new Error('Source inventory not found');

        const totalAvailable = sourceLots.reduce((sum, item) => sum + (item.quantity_on_hand - item.quantity_reserved), 0);
        if (totalAvailable < data.quantity) {
            throw new Error(`Insufficient available stock. Available: ${totalAvailable}, Requested: ${data.quantity}`);
        }

        let remainingToTransfer = data.quantity;
        let lastSourceItem;
        let lastTargetItem;

        for (const sLot of sourceLots) {
            if (remainingToTransfer <= 0) break;

            const qtyAvailable = sLot.quantity_on_hand - sLot.quantity_reserved;
            if (qtyAvailable <= 0) continue;

            const transferQty = Math.min(qtyAvailable, remainingToTransfer);

            const { data: updatedSource, error: deductError } = await supabase
                .from('inventory')
                .update({ quantity_on_hand: sLot.quantity_on_hand - transferQty })
                .eq('id', sLot.id)
                .select()
                .single();
            if (deductError) throw new Error(deductError.message);
            lastSourceItem = updatedSource;

            const { data: existingTargetLots, error: targetSelectError } = await supabase
                .from('inventory')
                .select('*')
                .eq('product_id', data.sku)
                .eq('warehouse_id', data.toWarehouseId)
                .eq('lot_number', sLot.lot_number || '');
            
            if (targetSelectError) throw new Error(targetSelectError.message);

            if (existingTargetLots && existingTargetLots.length > 0) {
                const limitLot = existingTargetLots[0];
                const { data: updatedTarget, error: updateError } = await supabase
                    .from('inventory')
                    .update({ quantity_on_hand: limitLot.quantity_on_hand + transferQty })
                    .eq('id', limitLot.id)
                    .select()
                    .single();
                if (updateError) throw new Error(updateError.message);
                lastTargetItem = updatedTarget;
            } else {
                const { data: insertedTarget, error: insertError } = await supabase
                    .from('inventory')
                    .insert([{
                        product_id: data.sku,
                        warehouse_id: data.toWarehouseId,
                        quantity_on_hand: transferQty,
                        quantity_reserved: 0,
                        lot_number: sLot.lot_number || '',
                        expiration_date: sLot.expiration_date || null,
                        lot_receive_cost: sLot.lot_receive_cost || 0,
                        updated_by: data.performedBy
                    }])
                    .select()
                    .single();
                if (insertError) throw new Error(insertError.message);
                lastTargetItem = insertedTarget;
            }

            remainingToTransfer -= transferQty;
        }

        const nowTrans = new Date().toISOString();
        await supabase.from('audit_logs').insert([
            {
                id: uuidv4(), item_id: data.sku, warehouse_id: data.fromWarehouseId,
                action: 'TRANSFER_OUT', quantity_change: -data.quantity,
                timestamp: nowTrans, performed_by: data.performedBy
            },
            {
                id: uuidv4(), item_id: data.sku, warehouse_id: data.toWarehouseId,
                action: 'TRANSFER_IN', quantity_change: data.quantity,
                timestamp: nowTrans, performed_by: data.performedBy
            }
        ]);
        await supabase.from('inventory_movements').insert([{
            id: uuidv4(),
            movement_type: 'TRANSFER',
            product_id: data.sku,
            sku: data.sku,
            warehouse_from_id: data.fromWarehouseId,
            location_from_id: data.fromLocationCode || null,
            warehouse_to_id: data.toWarehouseId,
            location_to_id: data.toLocationCode || null,
            quantity: data.quantity,
            reason: data.reason || 'Warehouse Transfer',
            created_at: nowTrans,
            created_by: data.performedBy,
            updated_at: nowTrans
        }]);

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
            } as InventoryItem : {} as InventoryItem,
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
            } as InventoryItem : {} as InventoryItem
        };
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
        if (error) return [...userStore]; // fallback to mock if table missing
        return (data || []).map(u => ({
            id: u.id, fullName: u.full_name, email: u.email, role: u.role,
            isActive: u.is_active, allowedWarehouses: u.allowed_warehouses,
            createdAt: u.created_at, createdBy: u.created_by,
            updatedAt: u.updated_at, updatedBy: u.updated_by
        }));
    },

    addUser: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
        const now = new Date().toISOString();
        const { data: row, error } = await supabase.from('users').insert([{
            id: uuidv4(), full_name: data.fullName, email: data.email, role: data.role,
            is_active: data.isActive, allowed_warehouses: data.allowedWarehouses,
            created_at: now, created_by: data.createdBy || 'System',
            updated_at: now, updated_by: data.updatedBy || 'System'
        }]).select().single();
        if (error) throw new Error(error.message);
        return { id: row.id, fullName: row.full_name, email: row.email, role: row.role,
            isActive: row.is_active, allowedWarehouses: row.allowed_warehouses,
            createdAt: row.created_at, createdBy: row.created_by,
            updatedAt: row.updated_at, updatedBy: row.updated_by };
    },

    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        const now = new Date().toISOString();
        const updates: any = { updated_at: now };
        if (data.fullName !== undefined) updates.full_name = data.fullName;
        if (data.email !== undefined) updates.email = data.email;
        if (data.role !== undefined) updates.role = data.role;
        if (data.isActive !== undefined) updates.is_active = data.isActive;
        if (data.allowedWarehouses !== undefined) updates.allowed_warehouses = data.allowedWarehouses;
        const { data: row, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return { id: row.id, fullName: row.full_name, email: row.email, role: row.role,
            isActive: row.is_active, allowedWarehouses: row.allowed_warehouses,
            createdAt: row.created_at, createdBy: row.created_by,
            updatedAt: row.updated_at, updatedBy: row.updated_by };
    },

    getWarehouses: async (): Promise<Warehouse[]> => {
        const { data, error } = await supabase.from('warehouses').select('*').order('is_default', { ascending: false });
        if (error) return [...warehouseStore]; // fallback to mock if table missing
        if (!data || data.length === 0) return [...warehouseStore]; // seed data still useful
        return data.map(w => ({
            id: w.id, warehouseName: w.warehouse_name, warehouseCode: w.warehouse_code,
            description: w.description, addressLine1: w.address_line1, city: w.city,
            state: w.state, postalCode: w.postal_code, country: w.country,
            timeZone: w.time_zone, isActive: w.is_active, isDefault: w.is_default,
            createdAt: w.created_at, createdBy: w.created_by,
            updatedAt: w.updated_at, updatedBy: w.updated_by
        }));
    },

    addWarehouse: async (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> => {
        const now = new Date().toISOString();
        const { data: row, error } = await supabase.from('warehouses').insert([{
            id: data.warehouseCode, warehouse_name: data.warehouseName,
            warehouse_code: data.warehouseCode, description: data.description,
            address_line1: data.addressLine1, city: data.city, state: data.state,
            postal_code: data.postalCode, country: data.country, time_zone: data.timeZone,
            is_active: data.isActive, is_default: data.isDefault,
            created_at: now, created_by: data.createdBy || 'System',
            updated_at: now, updated_by: data.updatedBy || 'System'
        }]).select().single();
        if (error) throw new Error(error.message);
        return { id: row.id, warehouseName: row.warehouse_name, warehouseCode: row.warehouse_code,
            description: row.description, addressLine1: row.address_line1, city: row.city,
            state: row.state, postalCode: row.postal_code, country: row.country,
            timeZone: row.time_zone, isActive: row.is_active, isDefault: row.is_default,
            createdAt: row.created_at, createdBy: row.created_by,
            updatedAt: row.updated_at, updatedBy: row.updated_by };
    },

    updateWarehouse: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
        const now = new Date().toISOString();
        const updates: any = { updated_at: now };
        if (data.warehouseName !== undefined) updates.warehouse_name = data.warehouseName;
        if (data.description !== undefined) updates.description = data.description;
        if (data.addressLine1 !== undefined) updates.address_line1 = data.addressLine1;
        if (data.city !== undefined) updates.city = data.city;
        if (data.state !== undefined) updates.state = data.state;
        if (data.postalCode !== undefined) updates.postal_code = data.postalCode;
        if (data.country !== undefined) updates.country = data.country;
        if (data.timeZone !== undefined) updates.time_zone = data.timeZone;
        if (data.isActive !== undefined) updates.is_active = data.isActive;
        if (data.isDefault !== undefined) updates.is_default = data.isDefault;
        const { data: row, error } = await supabase.from('warehouses').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return { id: row.id, warehouseName: row.warehouse_name, warehouseCode: row.warehouse_code,
            description: row.description, addressLine1: row.address_line1, city: row.city,
            state: row.state, postalCode: row.postal_code, country: row.country,
            timeZone: row.time_zone, isActive: row.is_active, isDefault: row.is_default,
            createdAt: row.created_at, createdBy: row.created_by,
            updatedAt: row.updated_at, updatedBy: row.updated_by };
    },

    getChannels: async (): Promise<ChannelConfig[]> => {
        await delay(300);
        return [...channelStore];
    },

    addChannel: async (data: Omit<ChannelConfig, 'id'>): Promise<ChannelConfig> => {
        await delay(300);
        const newChannel = { ...data, id: uuidv4() };
        channelStore.push(newChannel);
        persistChannels();
        return newChannel;
    },

    updateChannel: async (id: string, data: Partial<ChannelConfig>): Promise<ChannelConfig> => {
        await delay(500);
        const index = channelStore.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Channel not found');

        channelStore[index] = { ...channelStore[index], ...data };
        persistChannels();
        return channelStore[index];
    },

    deleteChannel: async (id: string): Promise<void> => {
        await delay(300);
        channelStore = channelStore.filter(c => c.id !== id);
        persistChannels();
    },

    getSystemSettings: async (): Promise<SystemSettings> => {
        await delay(150);
        return { ...systemSettingsStore };
    },

    updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
        await delay(500);
        Object.assign(systemSettingsStore, settings);
        return { ...systemSettingsStore };
    },

    reverseMovement: async (movementId: string): Promise<void> => {
        await delay(500);
        console.log(`Reversing movement ${movementId}`);
    },

    // ── Import Job Logging ──────────────────────────────────────────────────
    logImportJob: async (job: {
        jobType: 'import' | 'export';
        entity: string;
        status: 'completed' | 'failed';
        recordsProcessed: number;
        totalRecords: number;
        errorMessage?: string;
        fileName?: string;
        fileContent?: string;
        performedBy?: string;
    }): Promise<void> => {
        const { error } = await supabase.from('import_jobs').insert({
            job_type: job.jobType,
            entity: job.entity,
            status: job.status,
            records_processed: job.recordsProcessed,
            total_records: job.totalRecords,
            error_message: job.errorMessage || null,
            file_name: job.fileName || null,
            file_content: job.fileContent || null,
            performed_by: job.performedBy || 'System Admin',
        });
        if (error) console.error('Failed to log import job:', error.message);
    },

    fetchImportJobs: async (): Promise<Array<{
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
    }>> => {
        const { data, error } = await supabase
            .from('import_jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) throw new Error(error.message);
        return (data || []).map(r => ({
            id: r.id,
            createdAt: r.created_at,
            jobType: r.job_type,
            entity: r.entity,
            status: r.status,
            recordsProcessed: r.records_processed,
            totalRecords: r.total_records,
            errorMessage: r.error_message,
            fileName: r.file_name,
            fileContent: r.file_content,
            performedBy: r.performed_by,
        }));
    },
};
