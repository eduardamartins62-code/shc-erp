import { v4 as uuidv4 } from 'uuid';
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
    DailySnapshot
} from '../types';

// Initial Mock Data
const initialInventory: InventoryItem[] = [
    {
        id: 'SKU-1001',
        warehouseId: 'WH-MAIN',
        quantityOnHand: 500,
        quantityReserved: 50,
        lotNumber: 'L-2023-A1',
        expirationDate: '2027-12-31T00:00:00.000Z',
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
    },
    {
        id: 'SKU-1002',
        warehouseId: 'WH-EAST',
        quantityOnHand: 150,
        quantityReserved: 0,
        lotNumber: 'L-2023-B2',
        expirationDate: '2026-06-30T00:00:00.000Z',
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
    },
    {
        id: 'SKU-1003',
        warehouseId: 'WH-MAIN',
        quantityOnHand: 200,
        quantityReserved: 200,
        lotNumber: 'L-2024-C3',
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // Expires in 30 days
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
    },
    {
        id: 'SKU-1004',
        warehouseId: 'WH-WEST',
        quantityOnHand: 10,
        quantityReserved: 5,
        lotNumber: 'L-2022-D4',
        expirationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // Expired 5 days ago
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
    }
];

const inventoryStore = [...initialInventory];
const auditStore: AuditLog[] = [];
// New mock store for detailed movements
const movementStore: InventoryMovement[] = [
    {
        id: uuidv4(),
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
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
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
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
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
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
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
        updatedAt: new Date().toISOString(),
    }
];

const snapshotStore: DailySnapshot[] = Array.from({ length: 30 }).map((_, i) => {
    const daysAgo = 30 - i;
    const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString();

    // Create some fake trend data that generally goes up but has some variance
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

const locationStore: WarehouseLocation[] = [
    {
        id: uuidv4(),
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
        updatedBy: 'System',
    },
    {
        id: uuidv4(),
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
        updatedBy: 'System',
    },
    {
        id: uuidv4(),
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
        updatedBy: 'System',
    }
];

const userStore: User[] = [
    {
        id: uuidv4(),
        fullName: 'System Admin',
        email: 'admin@shc.com',
        role: 'Admin',
        isActive: true,
        allowedWarehouses: null, // all
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

// Initialize from LocalStorage or use defaults
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
    enableExpirationTracking: true
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    getInventory: async (): Promise<InventoryItem[]> => {
        await delay(300);
        return [...inventoryStore];
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
        await delay(300);
        for (const item of items) {
            let remaining = item.quantity;
            const availableLots = inventoryStore
                .filter(inv => inv.id === item.sku && (inv.quantityOnHand - inv.quantityReserved) > 0)
                .sort((a, b) => new Date(a.expirationDate || '9999-12-31').getTime() - new Date(b.expirationDate || '9999-12-31').getTime());

            for (const lot of availableLots) {
                if (remaining <= 0) break;
                const available = lot.quantityOnHand - lot.quantityReserved;
                const toReserve = Math.min(available, remaining);
                lot.quantityReserved += toReserve;
                remaining -= toReserve;
            }
        }
    },

    releaseInventory: async (items: { sku: string, quantity: number }[], performedBy: string): Promise<void> => {
        await delay(300);
        for (const item of items) {
            let remaining = item.quantity;
            const reservedLots = inventoryStore
                .filter(inv => inv.id === item.sku && inv.quantityReserved > 0);

            for (const lot of reservedLots) {
                if (remaining <= 0) break;
                const toRelease = Math.min(lot.quantityReserved, remaining);
                lot.quantityReserved -= toRelease;
                remaining -= toRelease;
            }
        }
    },

    getDailySnapshots: async (): Promise<DailySnapshot[]> => {
        await delay(150);
        return [...snapshotStore];
    },

    getLocations: async (): Promise<WarehouseLocation[]> => {
        await delay(200);
        return [...locationStore];
    },

    addLocation: async (data: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<WarehouseLocation> => {
        await delay(400);

        // Enforce (warehouseId, locationCode) uniqueness
        const exists = locationStore.some(
            loc => loc.warehouseId === data.warehouseId && loc.locationCode === data.locationCode
        );
        if (exists) {
            throw new Error(`Location code "${data.locationCode}" already exists in the selected warehouse.`);
        }

        const newLocation: WarehouseLocation = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        locationStore.push(newLocation);
        return newLocation;
    },

    updateLocation: async (id: string, data: Partial<WarehouseLocation>): Promise<WarehouseLocation> => {
        await delay(400);
        const index = locationStore.findIndex(loc => loc.id === id);
        if (index === -1) throw new Error('Location not found');

        // Check uniqueness if modifying code or warehouse
        const newWarehouseId = data.warehouseId || locationStore[index].warehouseId;
        const newLocationCode = data.locationCode || locationStore[index].locationCode;

        if (
            (data.warehouseId || data.locationCode) &&
            locationStore.some(loc => loc.id !== id && loc.warehouseId === newWarehouseId && loc.locationCode === newLocationCode)
        ) {
            throw new Error(`Location code "${newLocationCode}" already exists in the selected warehouse.`);
        }

        locationStore[index] = {
            ...locationStore[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        return locationStore[index];
    },

    receiveStock: async (data: ReceiptFormData): Promise<InventoryItem> => {
        await delay(500);

        // Check if item with same SKU, Warehouse, and Lot exists. If so, simply add to it.
        const existingIndex = inventoryStore.findIndex(
            item => item.id === data.sku && item.warehouseId === data.warehouseId && item.lotNumber === data.lotNumber && (!data.locationCode || data.locationCode === "Default")
        );

        let updatedItem: InventoryItem;

        if (existingIndex >= 0) {
            updatedItem = {
                ...inventoryStore[existingIndex],
                quantityOnHand: inventoryStore[existingIndex].quantityOnHand + data.quantity,
                ...(data.unitCost !== undefined && { lotReceiveCost: data.unitCost }),
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
                ...(data.unitCost !== undefined && { lotReceiveCost: data.unitCost }),
                lastUpdated: new Date().toISOString(),
                updatedBy: data.performedBy
            };
            inventoryStore.push(updatedItem);
        }

        const log: AuditLog = {
            id: uuidv4(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'RECEIVE',
            quantityChange: data.quantity,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
            details: `Received lot ${data.lotNumber || 'N/A'}`
        };
        auditStore.push(log);

        const movement: InventoryMovement = {
            id: uuidv4(),
            movementType: 'RECEIVE',
            productId: data.sku, // For mocked data, using SKU as productId
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
        };
        movementStore.push(movement);

        return updatedItem;
    },

    adjustStock: async (data: AdjustmentFormData): Promise<InventoryItem> => {
        await delay(500);

        // Find specific match, incorporating optional lot and location logic in real app
        // For mock, defaulting to basic match with lot if provided 
        const index = inventoryStore.findIndex(
            item => item.id === data.sku && item.warehouseId === data.warehouseId && (!data.lotNumber || item.lotNumber === data.lotNumber)
        );

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

        const log: AuditLog = {
            id: uuidv4(),
            itemId: data.sku,
            warehouseId: data.warehouseId,
            action: 'ADJUST',
            quantityChange: diff,
            reasonCode: data.reasonCode,
            timestamp: new Date().toISOString(),
            performedBy: data.performedBy,
        };
        auditStore.push(log);

        const movement: InventoryMovement = {
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
        };
        movementStore.push(movement);

        return updatedItem;
    },

    transferStock: async (data: TransferFormData): Promise<{ from: InventoryItem, to: InventoryItem }> => {
        await delay(600);

        // Optional filtering by specific lot if provided in form
        let sourceItems = inventoryStore
            .filter(item => item.id === data.sku && item.warehouseId === data.fromWarehouseId)

        if (data.lotNumber) {
            sourceItems = sourceItems.filter(item => item.lotNumber === data.lotNumber);
        }

        sourceItems = sourceItems.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

        let remainingToTransfer = data.quantity;
        const itemsToUpdate = [];

        // Check total available before starting
        const totalAvailable = sourceItems.reduce((sum, item) => sum + (item.quantityOnHand - item.quantityReserved), 0);
        if (totalAvailable < data.quantity) {
            throw new Error(`Insufficient available quantity. Needed: ${data.quantity}, Available: ${totalAvailable}`);
        }

        // Deduct from source items using FEFO
        for (const item of sourceItems) {
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
        let lastSourceItemUpdated: InventoryItem | null = null;
        let lastTargetItemUpdated: InventoryItem | null = null;

        for (const update of itemsToUpdate) {
            // Deduct
            const sourceIndex = inventoryStore.findIndex(i => i.id === update.id && i.warehouseId === update.warehouseId && i.lotNumber === update.lotNumber);
            inventoryStore[sourceIndex].quantityOnHand -= update.deducted;
            inventoryStore[sourceIndex].lastUpdated = new Date().toISOString();
            inventoryStore[sourceIndex].updatedBy = data.performedBy;
            lastSourceItemUpdated = inventoryStore[sourceIndex];

            // Log Source Deduction
            auditStore.push({
                id: uuidv4(),
                itemId: data.sku,
                warehouseId: data.fromWarehouseId,
                action: 'TRANSFER_OUT',
                quantityChange: -update.deducted,
                timestamp: new Date().toISOString(),
                performedBy: data.performedBy,
                details: `Transferred to ${data.toWarehouseId} (Lot: ${update.lotNumber})`
            });

            // Add to target
            const targetIndex = inventoryStore.findIndex(i => i.id === data.sku && i.warehouseId === data.toWarehouseId && i.lotNumber === update.lotNumber);

            if (targetIndex >= 0) {
                inventoryStore[targetIndex].quantityOnHand += update.deducted;
                inventoryStore[targetIndex].lastUpdated = new Date().toISOString();
                inventoryStore[targetIndex].updatedBy = data.performedBy;
                lastTargetItemUpdated = inventoryStore[targetIndex];
            } else {
                const newItem: InventoryItem = {
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
                id: uuidv4(),
                itemId: data.sku,
                warehouseId: data.toWarehouseId,
                action: 'TRANSFER_IN',
                quantityChange: update.deducted,
                timestamp: new Date().toISOString(),
                performedBy: data.performedBy,
                details: `Transferred from ${data.fromWarehouseId} (Lot: ${update.lotNumber})`
            });

            // Log Movement for Movement History Report
            const movement: InventoryMovement = {
                id: uuidv4(),
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
                updatedAt: new Date().toISOString(),
            };
            movementStore.push(movement);
        }

        return {
            from: lastSourceItemUpdated!,
            to: lastTargetItemUpdated!
        };
    },

    // --- Settings API Mock ---

    getUsers: async (): Promise<User[]> => {
        await delay(200);
        return [...userStore];
    },

    addUser: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
        await delay(300);
        const newUser: User = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
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
        if (warehouseStore.some(w => w.warehouseCode === data.warehouseCode)) {
            throw new Error('Warehouse code must be unique');
        }

        if (data.isDefault) {
            warehouseStore.forEach(w => w.isDefault = false);
        }

        const newWarehouse: Warehouse = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        warehouseStore.push(newWarehouse);
        return newWarehouse;
    },

    updateWarehouse: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
        await delay(300);
        const index = warehouseStore.findIndex(w => w.id === id);
        if (index === -1) throw new Error('Warehouse not found');

        if (data.warehouseCode && data.warehouseCode !== warehouseStore[index].warehouseCode && warehouseStore.some(w => w.warehouseCode === data.warehouseCode)) {
            throw new Error('Warehouse code must be unique');
        }

        if (data.isDefault) {
            warehouseStore.forEach(w => w.isDefault = false);
        }

        warehouseStore[index] = { ...warehouseStore[index], ...data, updatedAt: new Date().toISOString() };
        return warehouseStore[index];
    },

    getChannels: async (): Promise<ChannelConfig[]> => {
        await delay(200);
        return [...channelStore];
    },

    addChannel: async (data: Omit<ChannelConfig, 'id'>): Promise<ChannelConfig> => {
        await delay(300);
        const newChannel: ChannelConfig = {
            id: uuidv4(),
            ...data
        };
        channelStore.push(newChannel);
        persistChannels();
        return newChannel;
    },
    updateChannel: async (id: string, updates: Partial<ChannelConfig>): Promise<ChannelConfig> => {
        await delay(300);
        const index = channelStore.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Channel not found');
        channelStore[index] = { ...channelStore[index], ...updates };
        persistChannels();
        return channelStore[index];
    },
    deleteChannel: async (id: string): Promise<void> => {
        await delay(300);
        const index = channelStore.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Channel not found');
        if (index > -1) {
            channelStore.splice(index, 1);
            persistChannels();
        }
    },

    getSystemSettings: async (): Promise<SystemSettings> => {
        await delay(200);
        return { ...systemSettingsStore };
    },

    updateSystemSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
        await delay(300);
        Object.assign(systemSettingsStore, data);
        return { ...systemSettingsStore };
    },

    reverseMovement: async (movementId: string): Promise<void> => {
        await delay(500);

        const original = movementStore.find(m => m.id === movementId);
        if (!original) throw new Error(`Movement ${movementId} not found`);
        if ((original as any).isReversed) throw new Error('This movement has already been reversed.');

        const reversalId = uuidv4();
        const now = new Date().toISOString();

        // Create a reversal movement record
        const reversal: InventoryMovement = {
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
            updatedAt: now,
        };
        movementStore.push(reversal);

        // Apply reversal to inventory
        if (original.movementType === 'RECEIVE') {
            const targetIdx = inventoryStore.findIndex(
                i => i.id === original.sku && i.warehouseId === original.warehouseToId && (!original.lotNumber || i.lotNumber === original.lotNumber)
            );
            if (targetIdx >= 0) {
                inventoryStore[targetIdx].quantityOnHand = Math.max(0, inventoryStore[targetIdx].quantityOnHand - original.quantity);
                inventoryStore[targetIdx].lastUpdated = now;
                inventoryStore[targetIdx].updatedBy = 'System Admin (Reversal)';
            }
        } else if (original.movementType === 'ADJUST') {
            const idx = inventoryStore.findIndex(
                i => i.id === original.sku && i.warehouseId === original.warehouseFromId && (!original.lotNumber || i.lotNumber === original.lotNumber)
            );
            if (idx >= 0) {
                inventoryStore[idx].quantityOnHand = Math.max(0, inventoryStore[idx].quantityOnHand - original.quantity);
                inventoryStore[idx].lastUpdated = now;
                inventoryStore[idx].updatedBy = 'System Admin (Reversal)';
            }
        } else if (original.movementType === 'TRANSFER') {
            const sourceIdx = inventoryStore.findIndex(
                i => i.id === original.sku && i.warehouseId === original.warehouseToId && (!original.lotNumber || i.lotNumber === original.lotNumber)
            );
            if (sourceIdx >= 0) {
                inventoryStore[sourceIdx].quantityOnHand = Math.max(0, inventoryStore[sourceIdx].quantityOnHand - original.quantity);
                inventoryStore[sourceIdx].lastUpdated = now;
                inventoryStore[sourceIdx].updatedBy = 'System Admin (Reversal)';
            }
            const destIdx = inventoryStore.findIndex(
                i => i.id === original.sku && i.warehouseId === original.warehouseFromId && (!original.lotNumber || i.lotNumber === original.lotNumber)
            );
            if (destIdx >= 0) {
                inventoryStore[destIdx].quantityOnHand += original.quantity;
                inventoryStore[destIdx].lastUpdated = now;
                inventoryStore[destIdx].updatedBy = 'System Admin (Reversal)';
            } else {
                inventoryStore.push({
                    id: original.sku,
                    warehouseId: original.warehouseFromId!,
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
        const origIdx = movementStore.findIndex(m => m.id === movementId);
        if (origIdx >= 0) {
            (movementStore[origIdx] as any).isReversed = true;
            (movementStore[origIdx] as any).reversalId = reversalId;
        }

        // Audit log
        auditStore.push({
            id: uuidv4(),
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
