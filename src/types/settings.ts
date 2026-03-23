export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';

export const PERMISSION_MODULES = {
    dashboard: 'Dashboard',
    products: 'Products',
    inventory: 'Inventory & Stock',
    locations: 'Locations',
    orders: 'Orders',
    receiving: 'Receiving',
    dataManagement: 'Data Management',
    settingsUsers: 'Settings – Users',
    settingsWarehouses: 'Settings – Warehouses',
    settingsChannels: 'Settings – Channels',
    settingsPreferences: 'Settings – Preferences',
} as const;

export type PermissionModuleKey = keyof typeof PERMISSION_MODULES;
export type UserPermissions = Record<PermissionModuleKey, PermissionLevel>;

export const DEFAULT_PERMISSIONS: UserPermissions = {
    dashboard: 'none',
    products: 'none',
    inventory: 'none',
    locations: 'none',
    orders: 'none',
    receiving: 'none',
    dataManagement: 'none',
    settingsUsers: 'none',
    settingsWarehouses: 'none',
    settingsChannels: 'none',
    settingsPreferences: 'none',
};

export interface User {
    id: string;
    fullName: string;
    email: string;
    isAccountAdmin: boolean;
    isActive: boolean;
    allowedWarehouses: string[] | null; // null = all
    permissions: UserPermissions; // ignored when isAccountAdmin = true
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
