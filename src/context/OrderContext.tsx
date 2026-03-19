import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { Order, OrderStatus, B2BOrderFormData } from '../types';
import { ordersApi } from '../services/ordersApi';
import { useSettings } from './SettingsContext';
import { shipstationApi } from '../services/shipstationApi';
import { useInventory } from './InventoryContext';

interface OrderContextProps {
    orders: Order[];
    loading: boolean;
    error: string | null;
    lastOrderSyncedAt: string | null;
    fetchOrders: () => Promise<void>;
    createB2BOrder: (data: B2BOrderFormData) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus, performedBy: string, notes?: string) => Promise<void>;
    allocateOrderInventory: (orderId: string, performedBy: string) => Promise<void>;
    syncShipStationOrders: () => Promise<void>;
    syncShippedOrders: () => Promise<void>;
    cancelOrder: (orderId: string, reason: string, performedBy: string) => Promise<void>;
    deleteOrders: (orderIds: string[]) => Promise<void>;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastOrderSyncedAt, setLastOrderSyncedAt] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return sessionStorage.getItem('orders_last_synced');
        return null;
    });
    const { channels, systemSettings } = useSettings();
    const { reserveInventory, releaseInventory } = useInventory();

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ordersApi.getOrders();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const createB2BOrder = async (data: B2BOrderFormData) => {
        setLoading(true);
        setError(null);
        try {
            await ordersApi.createB2BOrder(data);
            await reserveInventory(data.items.map(i => ({ sku: i.sku, quantity: i.quantity })), data.performedBy);
            await fetchOrders(); // Refresh table
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create B2B order');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus, performedBy: string, notes?: string) => {
        setLoading(true);
        setError(null);
        try {
            await ordersApi.updateOrderStatus(orderId, status, performedBy, notes);
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to update order status to ${status}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const allocateOrderInventory = async (orderId: string, performedBy: string) => {
        setLoading(true);
        setError(null);
        try {
            // Need to first verify we have the inventory
            await ordersApi.allocateInventory(orderId, performedBy);
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to allocate inventory');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string, reason: string, performedBy: string) => {
        setLoading(true);
        setError(null);
        try {
            const orderToCancel = orders.find(o => o.id === orderId);
            await ordersApi.cancelOrder(orderId, reason, performedBy);
            if (orderToCancel) {
                await releaseInventory(orderToCancel.items.map(i => ({ sku: i.sku, quantity: i.quantity })), performedBy);
            }
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel order');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteOrders = async (orderIds: string[]) => {
        setLoading(true);
        setError(null);
        try {
            await ordersApi.deleteOrders(orderIds);
            await fetchOrders();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete orders');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const syncShipStationOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const ssChannel = channels.find(c => c.channel === 'ShipStation');
            if (!ssChannel || !ssChannel.isEnabled) {
                throw new Error("ShipStation integration is not enabled in settings.");
            }
            if (!ssChannel.apiKey || !ssChannel.apiSecret) {
                throw new Error("ShipStation API Keys are missing. Head to Settings > Integrations to configure them.");
            }

            const newOrders = await shipstationApi.fetchOrders(ssChannel.apiKey, ssChannel.apiSecret);

            // Query DB directly so we never use stale React state — prevents double-reserving
            const existingIds = await ordersApi.getExistingOrderIds();
            const toAdd = newOrders.filter(o => !existingIds.has(o.id));

            if (toAdd.length > 0) {
                // Query DB directly for product SKUs — never use React state here, it may be
                // empty or stale if the sync runs before useProducts has finished loading.
                const existingSkus = await ordersApi.getExistingSkus();
                toAdd.forEach(order => {
                    order.items.forEach(item => {
                        item.mappingStatus = existingSkus.has(item.sku) ? 'Mapped' : 'Unmapped';
                    });
                });

                // Reserve inventory only for orders that are NOT already shipped/cancelled
                const itemsToReserve = toAdd.flatMap(o =>
                    (o.fulfillmentStatus === 'Shipped' || o.fulfillmentStatus === 'Cancelled')
                        ? []
                        : o.items.filter(i => i.mappingStatus === 'Mapped').map(i => ({ sku: i.sku, quantity: i.quantity }))
                );

                if (itemsToReserve.length > 0) {
                    await reserveInventory(itemsToReserve, 'System API Sync');
                }

                // Persist the newly fetched external orders into our Supabase database permanently
                await ordersApi.batchCreateOrders(toAdd);
            }

            // Always check for shipped status updates — not just when new orders exist.
            // This runs inside syncShipStationOrders so the manual "Import Orders" button
            // also picks up shipped status changes, not just the 15-min auto-sync.
            await syncShippedOrders();

            // Fetch orders directly from DB to refresh UI with truth
            await fetchOrders();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync with ShipStation');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const syncShippedOrders = async () => {
        const ssChannel = channels.find(c => c.channel === 'ShipStation');
        if (!ssChannel || !ssChannel.isEnabled || !ssChannel.apiKey || !ssChannel.apiSecret) return;
        // Respect the "Sync Shipped Order Status" toggle — defaults ON if never explicitly set
        if (ssChannel.syncShippedOrders === false) return;

        const method = (systemSettings as any)?.inventoryDeductionMethod || 'FEFO';
        const autoDeduct = (systemSettings as any)?.autoDeductInventoryOnShipped !== false; // default true

        // Fetch shipped orders from ShipStation — throws on API failure so the error bubbles
        // up to syncShipStationOrders and is shown in the UI via setError.
        let shippedFromSS: Awaited<ReturnType<typeof shipstationApi.fetchShippedOrders>>;
        try {
            shippedFromSS = await shipstationApi.fetchShippedOrders(ssChannel.apiKey, ssChannel.apiSecret);
        } catch (fetchErr) {
            console.error('[ShipStation] fetchShippedOrders failed:', fetchErr);
            throw fetchErr; // Let syncShipStationOrders surface this to the user
        }
        if (shippedFromSS.length === 0) return;

        // Build a lookup map: orderNumber → tracking info
        const shippedMap = new Map(shippedFromSS.map(o => [o.orderNumber, o]));

        // Query the DB directly — never use React state here to avoid stale closure bugs.
        // The auto-sync runs on a 15-min interval that captures function refs from an old render,
        // so `orders` state would be stale. Querying the DB always gives the truth.
        const nonShipped = await ordersApi.getNonShippedOrders();
        const ordersToMarkShipped = nonShipped.filter(o => shippedMap.has(o.id));

        let markedCount = 0;
        for (const order of ordersToMarkShipped) {
            try {
                const trackingInfo = shippedMap.get(order.id)!;

                // Auto-deduct inventory only if the toggle is on.
                // If deduction fails, log and continue — don't block the status update.
                if (autoDeduct) {
                    try {
                        await ordersApi.deductInventoryForShippedOrder(order.id, method, 'ShipStation Sync');
                    } catch (deductErr) {
                        console.error(`Inventory deduction failed for order ${order.id}:`, deductErr);
                    }
                }

                // Mark as shipped and save tracking info
                await ordersApi.markOrderShippedWithTracking(
                    order.id,
                    trackingInfo.trackingNumber,
                    trackingInfo.carrierCode,
                    trackingInfo.shippedAt,
                    'ShipStation Sync'
                );
                markedCount++;
            } catch (orderErr) {
                console.error(`Failed to mark order ${order.id} as shipped:`, orderErr);
            }
        }

        if (markedCount > 0) {
            await fetchOrders();
        }
    };

    useEffect(() => {
        fetchOrders().then(() => {
            // Fix any Unmapped items whose SKU is now in the product catalog.
            // If any were newly mapped, reserve their inventory — this handles the case
            // where orders were imported before the product existed in the catalog.
            ordersApi.refreshMappingStatus()
                .then(async (newlyMapped) => {
                    if (newlyMapped.length > 0) {
                        await reserveInventory(newlyMapped, 'System: Mapping Status Refresh').catch(() => {});
                    }
                    await fetchOrders();
                })
                .catch(() => {});
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep refs to the latest sync functions so the interval never closes over stale versions
    const syncShipStationOrdersRef = useRef(syncShipStationOrders);
    const syncShippedOrdersRef = useRef(syncShippedOrders);
    useEffect(() => {
        syncShipStationOrdersRef.current = syncShipStationOrders;
        syncShippedOrdersRef.current = syncShippedOrders;
    });

    // 15-min auto-sync interval — uses refs to always call the latest function version
    useEffect(() => {
        const ssChannel = channels.find(c => c.channel === 'ShipStation');
        if (!ssChannel || !ssChannel.isEnabled || !ssChannel.autoImportOrders) return;

        const interval = setInterval(async () => {
            // syncShipStationOrders already calls syncShippedOrders internally,
            // so one call here is sufficient for the full sync cycle.
            await syncShipStationOrdersRef.current();
            const now = new Date().toISOString();
            setLastOrderSyncedAt(now);
            sessionStorage.setItem('orders_last_synced', now);
        }, 15 * 60 * 1000);

        return () => clearInterval(interval);
    }, [channels]);

    return (
        <OrderContext.Provider
            value={{
                orders,
                loading,
                error,
                lastOrderSyncedAt,
                fetchOrders,
                createB2BOrder,
                updateOrderStatus,
                allocateOrderInventory,
                syncShipStationOrders,
                syncShippedOrders,
                cancelOrder,
                deleteOrders,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};
