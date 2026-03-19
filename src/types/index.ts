export interface InventoryItem {
  id: string; // SKU
  warehouseId: string;
  locationCode?: string; // specific location within the warehouse
  quantityOnHand: number;
  quantityReserved: number;
  // quantityAvailable is calculated: quantityOnHand - quantityReserved
  lotNumber: string;
  expirationDate: string; // ISO date string
  lotReceiveCost?: number; // Cost of goods when this lot was received
  lastUpdated: string; // ISO date string
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  itemId: string; // SKU
  warehouseId: string;
  action: 'RECEIVE' | 'ADJUST' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  quantityChange: number;
  reasonCode?: string;
  timestamp: string;
  performedBy: string;
  details?: string;
}

export interface DailySnapshot {
  date: string;
  totalAvailable: number;
  totalCogs: number;
  lowStockCount: number;
}

export interface ReceiptFormData {
  sku: string;
  warehouseId: string;
  locationCode: string;
  quantity: number;
  unitCost?: number;
  lotNumber?: string;
  expirationDate?: string;
  performedBy: string;
  reason?: string;
}

export interface TransferFormData {
  sku: string;
  fromWarehouseId: string;
  fromLocationCode: string;
  toWarehouseId: string;
  toLocationCode: string;
  quantity: number;
  performedBy: string;
  lotNumber?: string;
  expirationDate?: string;
  reason?: string;
}

export interface AdjustmentFormData {
  sku: string;
  warehouseId: string;
  locationCode?: string;
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  lotNumber?: string;
  expirationDate?: string;
  reasonCode: string;
  performedBy: string;
}

export * from './orders';
export * from './products';
export * from './locations';
export * from './settings';
