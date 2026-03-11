import { v4 as uuidv4 } from 'uuid';
import { api as inventoryApi } from './api';
import type { Order, OrderItem, OrderHistoryEvent, OrderStatus, B2BOrderFormData } from '../types';

const generateMockTimeline = (orderId: string, status: OrderStatus): OrderHistoryEvent[] => {
    const timeline: OrderHistoryEvent[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 3);

    timeline.push({
        id: uuidv4(),
        orderId,
        timestamp: baseDate.toISOString(),
        action: 'Order Created',
        performedBy: 'System',
        notes: 'Imported from Channel'
    });

    if (status === 'Allocated' || status === 'Picking' || status === 'Packed' || status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 2);
        timeline.push({
            id: uuidv4(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Inventory Allocated',
            performedBy: 'System Admin'
        });
    }

    if (status === 'Picking' || status === 'Packed' || status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 4);
        timeline.push({
            id: uuidv4(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Picking Started',
            performedBy: 'Warehouse Staff'
        });
    }

    if (status === 'Packed' || status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 1);
        timeline.push({
            id: uuidv4(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Order Packed',
            performedBy: 'Warehouse Staff'
        });
    }

    if (status === 'Shipped') {
        baseDate.setHours(baseDate.getHours() + 5);
        timeline.push({
            id: uuidv4(),
            orderId,
            timestamp: baseDate.toISOString(),
            action: 'Order Shipped',
            performedBy: 'Shipping Dept',
            notes: 'Tracking: 1Z9999999999999999'
        });
    }

    return timeline;
};

const initialOrders: Order[] = [
    {
        id: 'ORD-2024-1001',
        channel: 'Amazon',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        shippingAddress: '123 Main St, Anytown, CA 90210',
        orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        fulfillmentStatus: 'New',
        paymentStatus: 'Paid',
        items: [
            {
                id: uuidv4(),
                orderId: 'ORD-2024-1001',
                sku: 'SKU-1001',
                quantity: 2,
                price: 29.99,
                pickStatus: 'Pending'
            }
        ],
        timeline: generateMockTimeline('ORD-2024-1001', 'New'),
        subtotal: 59.98,
        tax: 4.80,
        fees: 0,
        total: 64.78,
        margin: 25.50
    },
    {
        id: 'ORD-2024-1002',
        channel: 'B2B',
        customerName: 'Healthy Clinics Inc.',
        customerEmail: 'procurement@healthyclinics.com',
        shippingAddress: '456 Med Blvd, Suite 100, Wellness City, NY 10001',
        orderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        fulfillmentStatus: 'Shipped',
        paymentStatus: 'Paid',
        items: [
            {
                id: uuidv4(),
                orderId: 'ORD-2024-1002',
                sku: 'SKU-1002',
                quantity: 50,
                price: 15.00,
                allocatedWarehouseId: 'WH-EAST',
                allocatedLotNumber: 'L-2023-B2',
                pickStatus: 'Picked'
            },
            {
                id: uuidv4(),
                orderId: 'ORD-2024-1002',
                sku: 'SKU-1004',
                quantity: 5,
                price: 45.00,
                allocatedWarehouseId: 'WH-WEST',
                allocatedLotNumber: 'L-2022-D4',
                pickStatus: 'Picked'
            }
        ],
        timeline: generateMockTimeline('ORD-2024-1002', 'Shipped'),
        subtotal: 975.00,
        tax: 0,
        fees: 25.00, // Shipping fee
        total: 1000.00,
        margin: 400.00
    },
    {
        id: 'ORD-2024-1003',
        channel: 'Shopify',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        shippingAddress: '789 Oak Ln, Suburbia, TX 75001',
        orderDate: new Date().toISOString(),
        fulfillmentStatus: 'Allocated',
        paymentStatus: 'Paid',
        items: [
            {
                id: uuidv4(),
                orderId: 'ORD-2024-1003',
                sku: 'SKU-1003',
                quantity: 1,
                price: 89.99,
                allocatedWarehouseId: 'WH-MAIN',
                allocatedLotNumber: 'L-2024-C3',
                pickStatus: 'Pending'
            }
        ],
        timeline: generateMockTimeline('ORD-2024-1003', 'Allocated'),
        subtotal: 89.99,
        tax: 7.20,
        fees: 5.00,
        total: 102.19,
        margin: 45.00
    }
];

const ordersStore = [...initialOrders];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ordersApi = {
    getOrders: async (): Promise<Order[]> => {
        await delay(400);
        return [...ordersStore].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    },

    getOrderById: async (id: string): Promise<Order | undefined> => {
        await delay(200);
        return ordersStore.find(o => o.id === id);
    },

    createB2BOrder: async (data: B2BOrderFormData): Promise<Order> => {
        await delay(600);
        const orderId = `ORD-B2B-${Math.floor(Math.random() * 10000)}`;

        // Calculate totals
        let subtotal = 0;
        const items: OrderItem[] = data.items.map(item => {
            subtotal += item.price * item.quantity;
            return {
                id: uuidv4(),
                orderId,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                pickStatus: 'Pending'
            };
        });

        const tax = 0; // B2B usually tax exempt or handled differently
        const fees = 0;
        const total = subtotal + tax + fees;
        const margin = subtotal * 0.4; // Mock margin calculation

        const newOrder: Order = {
            id: orderId,
            channel: 'B2B',
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            shippingAddress: data.shippingAddress,
            orderDate: new Date().toISOString(),
            fulfillmentStatus: 'New',
            paymentStatus: 'Unpaid',
            items,
            timeline: [
                {
                    id: uuidv4(),
                    orderId,
                    timestamp: new Date().toISOString(),
                    action: 'B2B Order Created manually',
                    performedBy: data.performedBy,
                    notes: data.notes
                }
            ],
            subtotal,
            tax,
            fees,
            total,
            margin,
            notes: data.notes
        };

        ordersStore.push(newOrder);
        return newOrder;
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus, performedBy: string, notes?: string): Promise<Order> => {
        await delay(400);
        const index = ordersStore.findIndex(o => o.id === orderId);
        if (index === -1) throw new Error(`Order ${orderId} not found`);

        const order = { ...ordersStore[index] };
        order.fulfillmentStatus = status;

        // If picking started, we don't automatically mark items as picked until they actually do it,
        // but for simplicity if Packed/Shipped, ensure items are picked.
        if (status === 'Packed' || status === 'Shipped') {
            order.items = order.items.map(item => ({ ...item, pickStatus: 'Picked' }));
        }

        order.timeline = [
            ...order.timeline,
            {
                id: uuidv4(),
                orderId,
                timestamp: new Date().toISOString(),
                action: `Status changed to ${status}`,
                performedBy,
                notes
            }
        ];

        ordersStore[index] = order;
        return order;
    },

    allocateInventory: async (orderId: string, performedBy: string): Promise<Order> => {
        await delay(800);
        const index = ordersStore.findIndex(o => o.id === orderId);
        if (index === -1) throw new Error(`Order ${orderId} not found`);

        const order = { ...ordersStore[index] };
        if (order.fulfillmentStatus !== 'New') {
            throw new Error(`Order ${orderId} is already ${order.fulfillmentStatus}. Cannot allocate.`);
        }

        const inventory = await inventoryApi.getInventory();
        const allocationIssues: string[] = [];

        // Simple FEFO Allocation Logic mapped over items
        const updatedItems = order.items.map(item => {
            // Find all available lots for this SKU, sorted by earliest expiration date first
            const availableLots = inventory
                .filter(inv => inv.id === item.sku && (inv.quantityOnHand - inv.quantityReserved) > 0)
                .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

            // For simplicity in this mock: we assume one order item line can be fulfilled by ONE lot right now
            // In a real system, it might split the item line into multiple lines for different lots.
            const targetLot = availableLots.find(lot => (lot.quantityOnHand - lot.quantityReserved) >= item.quantity);

            if (targetLot) {
                // In a true integration, we should call an API to reserve these items.
                // For this mock, we just record the allocation on the order.
                return {
                    ...item,
                    allocatedWarehouseId: targetLot.warehouseId,
                    allocatedLotNumber: targetLot.lotNumber
                };
            } else {
                allocationIssues.push(`Insufficient stock for SKU ${item.sku}. Required: ${item.quantity}`);
                return item; // Unchanged
            }
        });

        if (allocationIssues.length > 0) {
            throw new Error(`Allocation Failed: ${allocationIssues.join(' | ')}`);
        }

        order.items = updatedItems;
        order.fulfillmentStatus = 'Allocated';
        order.timeline = [
            ...order.timeline,
            {
                id: uuidv4(),
                orderId,
                timestamp: new Date().toISOString(),
                action: 'Inventory Allocated (FEFO)',
                performedBy
            }
        ];

        ordersStore[index] = order;
        return order;
    }
};
