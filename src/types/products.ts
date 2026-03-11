export interface Product {
    id: string;
    sku: string;
    type: 'simple' | 'bundle';
    name: string;
    upc?: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    description?: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    costOfGoods?: number; // for simple
    mapPrice?: number;
    msrpPrice?: number;
    status: 'Active' | 'Inactive' | 'Discontinued';
    imageUrl?: string;
    productImageUrl?: string; // high-res square thumbnail
    reorderPoint?: number;
    preferredSupplier?: string;
    createdAt: string;
    updatedAt: string;
}

export interface COGSHistoryLog {
    id: string;
    sku: string;
    previousCost: number;
    newCost: number;
    changedBy: string;
    changedAt: string;
    notes?: string;
}

export interface ProductActivityLog {
    id: string;
    sku: string;
    action: string;
    details: string;
    user: string;
    module: string; // e.g., 'Inventory', 'Product', 'COGS'
    timestamp: string;
}

export interface InventoryLocation {
    id: string;
    productId: string; // FK to Product
    warehouseName: string;
    locationCode: string;
    lotNumber?: string;
    expirationDate?: string;
    lotReceiveCost?: number;
    qtyOnHand: number;
    qtyReserved: number;
    qtyAvailable: number; // calculated
    lastUpdatedAt: string;
}

export interface InventoryMovement {
    id: string;
    movementType: 'ADJUST' | 'TRANSFER' | 'RECEIVE' | 'CONSUME' | 'RETURN_TO_STOCK' | 'RETURN_TO_VENDOR';
    productId: string; // FK to Product
    sku: string;
    warehouseFromId?: string; // nullable; for transfers/adjustments
    locationFromId?: string;  // nullable
    warehouseToId?: string;   // nullable; for transfers/receiving
    locationToId?: string;    // nullable
    lotNumber?: string;
    expirationDate?: string;
    quantity: number;       // positive or negative integer
    reason?: string;
    referenceType?: string;
    referenceId?: string;
    createdAt: string;      // timestamp
    createdBy: string;      // user/email if available
    updatedAt: string;
}

export interface BundleComponent {
    id: string;
    bundleProductId: string; // FK to Product
    componentProductId: string; // FK to Product
    quantityRequiredPerBundle: number;
}
