

export type OrderStatus = 'New' | 'Allocated' | 'Picking' | 'Packed' | 'Shipped' | 'Cancelled' | 'Returned';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded';

export interface OrderItem {
    id: string;
    orderId: string;
    sku: string;
    quantity: number;
    price: number;
    allocatedWarehouseId?: string;
    allocatedLotNumber?: string;
    pickStatus: 'Pending' | 'Picked';
    quantityReserved?: number;
    mappingStatus?: 'Mapped' | 'Unmapped';
}

export interface OrderHistoryEvent {
    id: string;
    orderId: string;
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
}

export interface Order {
    id: string; // e.g., ORD-2024-001
    channel: 'Amazon' | 'Walmart' | 'Shopify' | 'eBay' | 'TikTok Shop' | 'B2B' | 'ShipStation';
    storeName?: string;
    customerName: string;
    shipToName?: string;
    customerEmail: string;
    shippingAddress: string;
    orderDate: string;
    fulfillmentStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    carrier?: string;
    requestedService?: string;
    items: OrderItem[];
    timeline: OrderHistoryEvent[];
    subtotal: number;
    tax: number;
    fees: number;
    total: number;
    margin: number;
    notes?: string;
    canceledAt?: string;
    canceledBy?: string;
    cancellationReason?: string;
}

export interface B2BOrderFormData {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    items: { sku: string; quantity: number; price: number }[];
    notes?: string;
    performedBy: string;
}
