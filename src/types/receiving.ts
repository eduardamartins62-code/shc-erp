export interface PurchaseOrderItem {
    id: string;
    sku: string;
    name: string;
    expectedQty: number;
    unit: string;
    lotTracked: boolean;
}

export interface PurchaseOrder {
    id: string;
    supplier: string;
    expectedDate: string;
    status: 'pending' | 'partial' | 'overdue' | 'received' | 'on_hold';
    items: PurchaseOrderItem[];
}

export interface LocationSplit {
    id: string;
    location: string;
    qty: number | "";
}

export interface ReceiptLine {
    itemId: string;
    sku: string;
    name: string;
    expectedQty: number | null;
    receivedQty: string;
    unit: string;
    lot: string;
    expDate: string;
    discrepancyAction: 'accept' | 'flag' | 'reject' | null;
    discrepancyNote: string;
    lotTracked: boolean;
    locationSplits: LocationSplit[];
    locationOverride?: string;
    poId: string | null;
    supplierName?: string | null;
}

export interface ReceiptSession {
    receiptNumber: string;
    receivedDate: string;
    warehouseId: string;
    location?: string; // optional - locations are assigned per-line in the put-away step
    notes: string;
    mode: 'po' | 'manual' | 'bulk';
    poId: string | null;
}

export interface DiscrepancyRecord {
    receiptNumber: string;
    poId: string | null;
    sku: string;
    productName: string;
    expectedQty: number;
    receivedQty: number;
    delta: number;
    action: 'accept' | 'flag' | 'reject';
    note: string;
    timestamp: string;
}
