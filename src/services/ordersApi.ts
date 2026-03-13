import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { api as inventoryApi } from './api';
import type { Order, OrderItem, OrderHistoryEvent, OrderStatus, B2BOrderFormData } from '../types';

// Helper to reconstruct a pseudo-timeline from standard status + DB timestamps
const generateTimelineForOrder = (order: any): OrderHistoryEvent[] => {
    const timeline: OrderHistoryEvent[] = [];
    
    // Created
    timeline.push({
        id: uuidv4(),
        orderId: order.id,
        timestamp: order.created_at,
        action: 'Order Created',
        performedBy: 'System',
        notes: `Imported from ${order.channel}`
    });

    if (order.fulfillment_status === 'Allocated' || order.fulfillment_status === 'Picking' || order.fulfillment_status === 'Shipped') {
        timeline.push({
            id: uuidv4(),
            orderId: order.id,
            timestamp: order.updated_at,
            action: 'Inventory Allocated',
            performedBy: 'System'
        });
    }

    if (order.fulfillment_status === 'Shipped') {
        timeline.push({
            id: uuidv4(),
            orderId: order.id,
            timestamp: order.updated_at,
            action: 'Order Shipped',
            performedBy: 'Shipping Dept',
            notes: order.carrier ? `Carrier: ${order.carrier}` : undefined
        });
    }

    if (order.fulfillment_status === 'Cancelled') {
        timeline.push({
            id: uuidv4(),
            orderId: order.id,
            timestamp: order.canceled_at || order.updated_at,
            action: 'Order Cancelled',
            performedBy: order.canceled_by || 'System',
            notes: order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : undefined
        });
    }

    return timeline;
};

export const ordersApi = {
    getOrders: async (): Promise<Order[]> => {
        const { data: dbOrders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .order('order_date', { ascending: false });

        if (ordersError) throw new Error(ordersError.message);

        return dbOrders.map((o: any) => ({
            id: o.id,
            channel: o.channel,
            storeName: o.store_name,
            customerName: o.customer_name,
            shipToName: o.ship_to_name,
            customerEmail: o.customer_email,
            shippingAddress: o.shipping_address,
            orderDate: o.order_date,
            fulfillmentStatus: o.fulfillment_status,
            paymentStatus: o.payment_status,
            carrier: o.carrier,
            requestedService: o.requested_service,
            subtotal: o.subtotal,
            tax: o.tax,
            fees: o.fees,
            total: o.total,
            margin: o.margin,
            notes: o.notes,
            canceledAt: o.canceled_at,
            canceledBy: o.canceled_by,
            cancellationReason: o.cancellation_reason,
            timeline: generateTimelineForOrder(o),
            items: o.order_items.map((i: any) => ({
                id: i.id,
                orderId: i.order_id,
                sku: i.sku,
                quantity: i.quantity,
                price: i.price,
                allocatedWarehouseId: i.allocated_warehouse_id,
                allocatedLotNumber: i.allocated_lot_number,
                pickStatus: i.pick_status,
                mappingStatus: i.mapping_status
            }))
        })) as Order[];
    },

    getOrderById: async (id: string): Promise<Order | undefined> => {
        const { data: dbOrder, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single();

        if (error || !dbOrder) return undefined;

        return {
            id: dbOrder.id,
            channel: dbOrder.channel,
            storeName: dbOrder.store_name,
            customerName: dbOrder.customer_name,
            shipToName: dbOrder.ship_to_name,
            customerEmail: dbOrder.customer_email,
            shippingAddress: dbOrder.shipping_address,
            orderDate: dbOrder.order_date,
            fulfillmentStatus: dbOrder.fulfillment_status,
            paymentStatus: dbOrder.payment_status,
            carrier: dbOrder.carrier,
            requestedService: dbOrder.requested_service,
            subtotal: dbOrder.subtotal,
            tax: dbOrder.tax,
            fees: dbOrder.fees,
            total: dbOrder.total,
            margin: dbOrder.margin,
            notes: dbOrder.notes,
            canceledAt: dbOrder.canceled_at,
            canceledBy: dbOrder.canceled_by,
            cancellationReason: dbOrder.cancellation_reason,
            timeline: generateTimelineForOrder(dbOrder),
            items: dbOrder.order_items.map((i: any) => ({
                id: i.id,
                orderId: i.order_id,
                sku: i.sku,
                quantity: i.quantity,
                price: i.price,
                allocatedWarehouseId: i.allocated_warehouse_id,
                allocatedLotNumber: i.allocated_lot_number,
                pickStatus: i.pick_status,
                mappingStatus: i.mapping_status
            }))
        } as Order;
    },

    createB2BOrder: async (data: B2BOrderFormData): Promise<Order> => {
        const orderId = `ORD-B2B-${Math.floor(Math.random() * 10000)}`;

        let subtotal = 0;
        data.items.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const margin = subtotal * 0.4;
        const total = subtotal;

        const orderEntry = {
            id: orderId,
            channel: 'B2B',
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            shipping_address: data.shippingAddress,
            order_date: new Date().toISOString(),
            fulfillment_status: 'New',
            payment_status: 'Unpaid',
            subtotal,
            tax: 0,
            fees: 0,
            total,
            margin,
            notes: data.notes
        };

        const { error: orderError } = await supabase.from('orders').insert([orderEntry]);
        if (orderError) throw new Error(orderError.message);

        const orderItemsEntries = data.items.map(item => ({
            order_id: orderId,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            pick_status: 'Pending'
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsEntries);
        if (itemsError) throw new Error(itemsError.message);

        const newOrder = await ordersApi.getOrderById(orderId);
        if (!newOrder) throw new Error('Failed to retrieve newly created B2B order');
        return newOrder;
    },

    batchCreateOrders: async (orders: Order[]): Promise<void> => {
        if (!orders || orders.length === 0) return;

        const orderEntries = orders.map(o => ({
            id: o.id,
            channel: o.channel,
            store_name: o.storeName,
            customer_name: o.customerName,
            ship_to_name: o.shipToName,
            customer_email: o.customerEmail,
            shipping_address: o.shippingAddress,
            order_date: o.orderDate,
            fulfillment_status: o.fulfillmentStatus,
            payment_status: o.paymentStatus,
            carrier: o.carrier,
            requested_service: o.requestedService,
            subtotal: o.subtotal,
            tax: o.tax,
            fees: o.fees,
            total: o.total,
            margin: o.margin,
            notes: o.notes
        }));

        // Upsert orders
        const { error: ordersError } = await supabase
            .from('orders')
            .upsert(orderEntries, { onConflict: 'id', ignoreDuplicates: true });

        if (ordersError) throw new Error(ordersError.message);

        // Map items
        const itemEntries: any[] = [];
        orders.forEach(o => {
            o.items.forEach(i => {
                itemEntries.push({
                    order_id: o.id,
                    sku: i.sku,
                    quantity: i.quantity,
                    price: i.price,
                    pick_status: i.pickStatus,
                    mapping_status: i.mappingStatus
                });
            });
        });

        // Insert items (we could deduplicate better, but for SS sync we only pass new orders)
        if (itemEntries.length > 0) {
            const { error: itemsError } = await supabase.from('order_items').insert(itemEntries);
            if (itemsError) throw new Error(itemsError.message);
        }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus, performedBy: string, notes?: string): Promise<void> => {
        const updateData: any = {
            fulfillment_status: status,
            updated_at: new Date().toISOString()
        };

        const { error: orderError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (orderError) throw new Error(orderError.message);

        if (status === 'Packed' || status === 'Shipped') {
            const { error: itemsError } = await supabase
                .from('order_items')
                .update({ pick_status: 'Picked' })
                .eq('order_id', orderId);
            if (itemsError) throw new Error(itemsError.message);
        }
    },

    allocateInventory: async (orderId: string, performedBy: string): Promise<Order> => {
        const order = await ordersApi.getOrderById(orderId);
        if (!order) throw new Error(`Order ${orderId} not found`);

        if (order.fulfillmentStatus !== 'New') {
            throw new Error(`Order ${orderId} is already ${order.fulfillmentStatus}. Cannot allocate.`);
        }

        const inventory = await inventoryApi.getInventory();
        const allocationIssues: string[] = [];

        // For each item, allocate
        for (const item of order.items) {
            const availableLots = inventory
                .filter(inv => inv.id === item.sku && (inv.quantityOnHand - inv.quantityReserved) > 0)
                .sort((a, b) => new Date(a.expirationDate || '9999-12-31').getTime() - new Date(b.expirationDate || '9999-12-31').getTime());

            const targetLot = availableLots.find(lot => (lot.quantityOnHand - lot.quantityReserved) >= item.quantity);

            if (targetLot) {
                // Update specific order item with allocated warehouse/lot
                await supabase
                    .from('order_items')
                    .update({ 
                        allocated_warehouse_id: targetLot.warehouseId,
                        allocated_lot_number: targetLot.lotNumber 
                    })
                    .eq('id', item.id);
            } else {
                allocationIssues.push(`Insufficient stock for SKU ${item.sku}`);
            }
        }

        if (allocationIssues.length > 0) {
            throw new Error(`Allocation Failed: ${allocationIssues.join(' | ')}`);
        }

        // Only update status if fully allocated without throws
        await ordersApi.updateOrderStatus(orderId, 'Allocated', performedBy);
        
        const finalOrder = await ordersApi.getOrderById(orderId);
        return finalOrder as Order;
    },

    cancelOrder: async (orderId: string, reason: string, performedBy: string): Promise<Order> => {
        const order = await ordersApi.getOrderById(orderId);
        if (!order) throw new Error(`Order ${orderId} not found`);

        if (order.fulfillmentStatus === 'Shipped') {
            throw new Error('Cannot cancel an order that has already shipped');
        }

        const timestamp = new Date().toISOString();
        const { error } = await supabase
            .from('orders')
            .update({
                fulfillment_status: 'Cancelled',
                canceled_at: timestamp,
                canceled_by: performedBy,
                cancellation_reason: reason,
                updated_at: timestamp
            })
            .eq('id', orderId);

        if (error) throw new Error(error.message);

        const updatedOrder = await ordersApi.getOrderById(orderId);
        return updatedOrder as Order;
    }
};
