export type UserRole = 'Admin' | 'Manager' | 'Operator' | 'ReadOnly';

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    allowedWarehouses: string[] | null; // null = all
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

export interface Warehouse {
    id: string;
    warehouseName: string;
    warehouseCode: string;
    description?: string;
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    timeZone: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

export type ChannelEnum = 'Amazon' | 'Walmart' | 'Shopify' | 'eBay' | 'TikTok' | 'B2B' | 'ShipStation' | 'WooCommerce' | 'Etsy' | 'BigCommerce' | 'Magento';

export interface ChannelConfig {
    id: string;
    channel: ChannelEnum;
    storeName: string;
    isEnabled: boolean;
    defaultWarehouseId?: string;
    notes?: string;
    apiKey?: string;
    apiSecret?: string;
    autoImportOrders?: boolean;
    syncInventory?: boolean;
    syncTracking?: boolean;
    syncShippedOrders?: boolean;
}

export interface SystemSettings {
    defaultTimeZone: string;
    defaultCurrency: string;
    defaultDateFormat: string;
    lowStockThresholdDefault: number;
    enableLotTracking: boolean;
    enableExpirationTracking: boolean;
    inventoryDeductionMethod: 'FIFO' | 'FEFO';
    autoDeductInventoryOnShipped: boolean;
}
