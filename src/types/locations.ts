export type LocationType = 'SHELF' | 'BIN' | 'PALLET' | 'FLOOR' | 'STAGING' | 'RECEIVING';

export interface WarehouseLocation {
    id: string;
    warehouseId: string;
    warehouseCode: string;
    warehouseName?: string; // Kept for backwards compatibility / UI convenience in some places
    locationCode: string; // unique per warehouse
    displayName?: string; // defaults to locationCode if not provided
    type: LocationType;
    description?: string;
    aisle?: string;
    section?: string;
    shelf?: string;
    bin?: string;
    notes?: string;
    barcodeValue: string; // defaults to locationCode
    isActive: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}
