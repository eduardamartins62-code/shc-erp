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
    inventoryDeductionMethod: 'FEFO'
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
        await delay(200);
        return [...auditStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getInventoryMovements: async (): Promise<InventoryMovement[]> => {
        await delay(200);
        return [...movementStore].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
            is_active: data.isActive,
            created_by: data.createdBy,
            updated_by: data.updatedBy
        }));

        const { error } = await supabase.from('locations').upsert(locationsToAdd, { onConflict: 'warehouse_id,location_code', ignoreDuplicates: true });
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

        auditStore.push({
            id: uuidv4(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'RECEIVE',
            quantityChange: data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
            details: `Received lot ${data.lotNumber || 'N/A'}`
        });

        movementStore.push({
            id: uuidv4(),
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
            updatedAt: new Date().toISOString(),
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

        auditStore.push({
            id: uuidv4(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'ADJUST',
            quantityChange: diff,
            reasonCode: data.reasonCode,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
        });

        movementStore.push({
            id: uuidv4(),
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
            updatedAt: new Date().toISOString(),
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

        auditStore.push({
            id: uuidv4(),
            itemId: data.sku,
            warehouseId: data.fromWarehouseId,
            action: 'TRANSFER_OUT',
            quantityChange: -data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
        });

        auditStore.push({
            id: uuidv4(),
            itemId: data.sku,
            warehouseId: data.toWarehouseId,
            action: 'TRANSFER_IN',
            quantityChange: data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
        });

        movementStore.push({
            id: uuidv4(),
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
            updatedAt: new Date().toISOString(),
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
        await delay(200);
        return [...userStore];
    },

    addUser: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
        await delay(300);
        const newUser: User = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'System', updatedBy: 'System' };
        userStore.push(newUser);
        return newUser;
    },

    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        await delay(300);
        const index = userStore.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');
        userStore[index] = { ...userStore[index], ...data, updatedAt: new Date().toISOString() };
        return userStore[index];
    },

    getWarehouses: async (): Promise<Warehouse[]> => {
        await delay(200);
        return [...warehouseStore];
    },

    addWarehouse: async (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> => {
        await delay(300);
        const newWh: Warehouse = { ...data, id: data.warehouseCode, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'System', updatedBy: 'System' };
        warehouseStore.push(newWh);
        return newWh;
    },

    updateWarehouse: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
        await delay(300);
        const index = warehouseStore.findIndex(w => w.id === id);
        if (index === -1) throw new Error('Warehouse not found');
        warehouseStore[index] = { ...warehouseStore[index], ...data, updatedAt: new Date().toISOString() };
        return warehouseStore[index];
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
    }
};
