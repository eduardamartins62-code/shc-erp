export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';

// ── App-level access ─────────────────────────────────────────────────────────
export const ERP_APPS = {
    wms: 'WMS – Warehouse Management',
    crm: 'CRM',
    accounting: 'Accounting',
    hr: 'HR',
    analytics: 'Analytics',
    purchasing: 'Purchasing',
    sales: 'Sales',
    dropshipping: 'Dropshipping',
    globallogistics: 'Global Logistics',
} as const;

export type ERPAppKey = keyof typeof ERP_APPS;
export type AppAccess = Record<ERPAppKey, boolean>;

export const DEFAULT_APP_ACCESS: AppAccess = {
    wms: false,
    crm: false,
    accounting: false,
    hr: false,
    analytics: false,
    purchasing: false,
    sales: false,
    dropshipping: false,
    globallogistics: false,
};

// ── Module-level permissions (within WMS) ────────────────────────────────────
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
    isAccountAdmin: boolean;   // full access to everything
    isActive: boolean;
    allowedWarehouses: string[] | null; // null = all
    appAccess: AppAccess;      // which ERP apps this user can open (ignored when isAccountAdmin)
    permissions: UserPermissions; // WMS module permissions (ignored when isAccountAdmin)
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
    oauthToken?: string;
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
