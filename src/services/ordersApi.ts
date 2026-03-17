import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { api as inventoryApi } from './api';
import { tagsApi } from './tagsApi';
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
            .gte('order_date', '2026-01-01')
            .order('order_date', { ascending: false });

        if (ordersError) throw new Error(ordersError.message);

        // Short-circuit if no orders
        if (!dbOrders || !dbOrders.length) return [];

        // Fetch persistent timeline events (non-fatal — fall back to generated timeline)
        let timelineMap: Record<string, any[]> = {};
        try {
            const { data: timelineRows } = await supabase
                .from('order_timeline')
                .select('*')
                .in('order_id', dbOrders.map((o: any) => o.id))
                .order('timestamp', { ascending: true });

            (timelineRows || []).forEach((row: any) => {
                if (!timelineMap[row.order_id]) timelineMap[row.order_id] = [];
                timelineMap[row.order_id].push({
                    id: row.id,
                    orderId: row.order_id,
                    timestamp: row.timestamp,
                    action: row.action,
                    performedBy: row.performed_by,
                    notes: row.notes
                });
            });
        } catch {
            // Timeline is non-critical; continue with generated timeline only
        }

        const result = dbOrders.map((o: any) => ({
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
            trackingNumber: o.tracking_number,
            carrierCode: o.carrier_code,
            shippedAt: o.shipped_at,
            subtotal: o.subtotal,
            tax: o.tax,
            fees: o.fees,
            total: o.total,
            margin: o.margin,
            notes: o.notes,
            canceledAt: o.canceled_at,
            canceledBy: o.canceled_by,
            cancellationReason: o.cancellation_reason,
            timeline: [...generateTimelineForOrder(o), ...(timelineMap[o.id] || [])].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
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
            })),
            tags: []
        }));

        // Fetch tags for all orders (non-fatal)
        try {
            const orderIds = result.map((o: any) => o.id);
            const tagMap = await tagsApi.getTagsForOrders(orderIds);
            result.forEach((o: any) => {
                o.tags = tagMap[o.id] ?? [];
            });
        } catch {
            // Tags are non-critical; orders still load without them
        }

        return result as Order[];
    },

    getOrderById: async (id: string): Promise<Order | undefined> => {
        const { data: dbOrder, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single();

        if (error || !dbOrder) return undefined;

        // Fetch persistent timeline events for this order
        const { data: timelineRows } = await supabase
            .from('order_timeline')
            .select('*')
            .eq('order_id', dbOrder.id)
            .order('timestamp', { ascending: true });

        const persistedTimeline = (timelineRows || []).map((row: any) => ({
            id: row.id,
            orderId: row.order_id,
            timestamp: row.timestamp,
            action: row.action,
            performedBy: row.performed_by,
            notes: row.notes
        }));

        const tagMap = await tagsApi.getTagsForOrders([dbOrder.id]);
        const tags = tagMap[dbOrder.id] ?? [];

        const mergedTimeline = [...generateTimelineForOrder(dbOrder), ...persistedTimeline]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
            timeline: mergedTimeline,
            tags,
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
        const orderId = data.orderNumber;
        const shipToAddress = `${data.shipTo.name}${data.shipTo.company ? `, ${data.shipTo.company}` : ''}, ${data.shipTo.address1}${data.shipTo.address2 ? ` ${data.shipTo.address2}` : ''}, ${data.shipTo.city}, ${data.shipTo.state} ${data.shipTo.zip}, ${data.shipTo.country}`;

        let subtotal = 0;
        data.items.forEach(item => { subtotal += item.price * item.quantity; });
        const total = subtotal + data.tax + data.shippingFee;
        const margin = subtotal * 0.4;

        const orderEntry = {
            id: orderId,
            channel: 'B2B',
            ship_to_name: data.shipTo.name,
            customer_name: data.shipTo.company || data.shipTo.name,
            customer_email: data.shipTo.email || '',
            shipping_address: shipToAddress,
            order_date: data.orderDate || new Date().toISOString(),
            fulfillment_status: 'New',
            payment_status: 'Unpaid',
            carrier: data.carrier,
            requested_service: data.requestedService,
            subtotal,
            tax: data.tax,
            fees: data.shippingFee,
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

        if (data.tagIds && data.tagIds.length > 0) {
            await tagsApi.assignTagsToOrder(orderId, data.tagIds);
        }

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
            tracking_number: o.trackingNumber || null,
            carrier_code: o.carrierCode || null,
            shipped_at: o.shippedAt || null,
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
    },

    addTimelineEvent: async (orderId: string, action: string, performedBy: string, notes?: string): Promise<void> => {
        const { error } = await supabase.from('order_timeline').insert([{
            order_id: orderId,
            timestamp: new Date().toISOString(),
            action,
            performed_by: performedBy,
            notes: notes || null
        }]);
        if (error) throw new Error(error.message);
    },

    deductInventoryForShippedOrder: async (orderId: string, method: 'FIFO' | 'FEFO', performedBy: string): Promise<void> => {
        const order = await ordersApi.getOrderById(orderId);
        if (!order) return;

        for (const item of order.items) {
            const sortColumn = method === 'FEFO' ? 'expiration_date' : 'lot_number';
            const { data: lots } = await supabase
                .from('inventory')
                .select('*')
                .eq('product_id', item.sku)
                .gt('quantity_on_hand', 0)
                .order(sortColumn, { ascending: true, nullsFirst: false });

            if (!lots || lots.length === 0) continue;

            let remaining = item.quantity;
            for (const lot of lots) {
                if (remaining <= 0) break;
                const deduct = Math.min(lot.quantity_on_hand, remaining);
                const newQty = Math.max(0, lot.quantity_on_hand - deduct);
                const newReserved = Math.max(0, (lot.quantity_reserved || 0) - deduct);
                await supabase.from('inventory').update({
                    quantity_on_hand: newQty,
                    quantity_reserved: newReserved,
                    last_updated: new Date().toISOString(),
                    updated_by: performedBy
                }).eq('id', lot.id);
                remaining -= deduct;
            }
        }

        await ordersApi.addTimelineEvent(
            orderId,
            `Inventory auto-removed via ${method}`,
            performedBy,
            `Stock deducted when order marked as shipped by ShipStation`
        );
    },

    /**
     * Mark an order as shipped with carrier + tracking info from ShipStation.
     */
    markOrderShippedWithTracking: async (
        orderId: string,
        trackingNumber: string | undefined,
        carrierCode: string | undefined,
        shippedAt: string | undefined,
        performedBy: string
    ): Promise<void> => {
        const updateData: any = {
            fulfillment_status: 'Shipped',
            updated_at: new Date().toISOString()
        };
        if (trackingNumber) updateData.tracking_number = trackingNumber;
        if (carrierCode) updateData.carrier_code = carrierCode;
        if (shippedAt) updateData.shipped_at = shippedAt;

        const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
        if (error) throw new Error(error.message);

        // Mark all items as Picked
        await supabase.from('order_items').update({ pick_status: 'Picked' }).eq('order_id', orderId);

        const trackingNote = [
            trackingNumber ? `Tracking: ${trackingNumber}` : null,
            carrierCode ? `Carrier: ${carrierCode}` : null
        ].filter(Boolean).join(' | ');

        await ordersApi.addTimelineEvent(orderId, 'Order Shipped', performedBy,
            trackingNote || 'Marked shipped via ShipStation sync');
    },

    /**
     * Bulk update fulfillment status for a set of orders (used for bulk pick/pack).
     */
    bulkUpdateOrderStatus: async (orderIds: string[], status: OrderStatus, performedBy: string): Promise<void> => {
        const updateData: any = { fulfillment_status: status, updated_at: new Date().toISOString() };

        const { error } = await supabase.from('orders').update(updateData).in('id', orderIds);
        if (error) throw new Error(error.message);

        if (status === 'Picking' || status === 'Packed') {
            const { error: itemsError } = await supabase
                .from('order_items')
                .update({ pick_status: status === 'Packed' ? 'Picked' : 'Pending' })
                .in('order_id', orderIds);
            if (itemsError) throw new Error(itemsError.message);
        }

        // Add timeline events
        await Promise.all(orderIds.map(id =>
            ordersApi.addTimelineEvent(id, `Status updated to ${status}`, performedBy,
                `Bulk action — ${orderIds.length} orders updated`)
        ));
    },

    /**
     * Permanently delete orders and all related records.
     */
    deleteOrders: async (orderIds: string[]): Promise<void> => {
        if (!orderIds.length) return;

        // Delete child records first (in case FK cascade is not configured)
        await supabase.from('order_timeline').delete().in('order_id', orderIds);
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('order_tag_assignments').delete().in('order_id', orderIds);

        const { error } = await supabase.from('orders').delete().in('id', orderIds);
        if (error) throw new Error(error.message);
    }
};
