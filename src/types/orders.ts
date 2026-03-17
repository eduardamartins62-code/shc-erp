import type { OrderTag } from './tags';

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
    id: string;
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
    trackingNumber?: string;
    carrierCode?: string;
    shippedAt?: string;
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
    tags?: OrderTag[];
}

export interface B2BShipTo {
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
}

export interface B2BOrderFormData {
    orderNumber: string;
    orderDate: string;
    shipTo: B2BShipTo;
    items: { sku: string; quantity: number; price: number }[];
    tax: number;
    shippingFee: number;
    notes?: string;
    internalNotes?: string;
    tagIds: string[];
    carrier?: string;
    requestedService?: string;
    warehouseId?: string;
    performedBy: string;
}
