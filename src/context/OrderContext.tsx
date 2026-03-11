import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Order, OrderStatus, B2BOrderFormData } from '../types';
import { ordersApi } from '../services/ordersApi';
import { useSettings } from './SettingsContext';
import { shipstationApi } from '../services/shipstationApi';

interface OrderContextProps {
    orders: Order[];
    loading: boolean;
    error: string | null;
    fetchOrders: () => Promise<void>;
    createB2BOrder: (data: B2BOrderFormData) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus, performedBy: string, notes?: string) => Promise<void>;
    allocateOrderInventory: (orderId: string, performedBy: string) => Promise<void>;
    syncShipStationOrders: () => Promise<void>;
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
    const { channels } = useSettings();

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

            // In a real app we'd save these via the backend ordersApi.
            // For now, we simulate inserting them into our context/store.
            setOrders(prev => {
                const existingIds = new Set(prev.map(o => o.id));
                const toAdd = newOrders.filter(o => !existingIds.has(o.id));
                return [...toAdd, ...prev];
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sync with ShipStation');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <OrderContext.Provider
            value={{
                orders,
                loading,
                error,
                fetchOrders,
                createB2BOrder,
                updateOrderStatus,
                allocateOrderInventory,
                syncShipStationOrders,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};
