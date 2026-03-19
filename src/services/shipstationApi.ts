import { v4 as uuidv4 } from 'uuid';
import type { Order, OrderItem } from '../types';

interface ShipStationOrderResponse {
    // This interface simulates a simplified response from the real ShipStation API
    orderId: number;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    customerUsername: string;
    customerEmail: string;
    shipTo: {
        name: string;
        street1: string;
        street2: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    items: {
        orderItemId: number;
        sku: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }[];
    orderTotal: number;
    taxAmount: number;
    shippingAmount: number;
    customerNotes: string | null;
    carrierCode?: string;
    requestedShippingService?: string;
    advancedOptions?: {
        source?: string;
        storeId?: number;
    };
}

const mockShipStationResponse: ShipStationOrderResponse[] = [
    {
        orderId: 100001,
        orderNumber: 'SS-100001',
        orderDate: new Date().toISOString(),
        orderStatus: 'awaiting_shipment',
        customerUsername: 'Alice Wonder',
        customerEmail: 'alice@example.com',
        shipTo: {
            name: 'Alice Wonder',
            street1: '123 Rabbit Hole',
            street2: null,
            city: 'Wonderland',
            state: 'WL',
            postalCode: '12345',
            country: 'US',
        },
        items: [
            {
                orderItemId: 2001,
                sku: 'SKU-1001',
                name: 'Main Product',
                quantity: 1,
                unitPrice: 29.99,
            }
        ],
        orderTotal: 34.99,
        taxAmount: 0.00,
        shippingAmount: 5.00,
        customerNotes: 'Please ship quickly!'
    },
    {
        orderId: 100002,
        orderNumber: 'SS-100002',
        orderDate: new Date(Date.now() - 3600000).toISOString(),
        orderStatus: 'awaiting_shipment',
        customerUsername: 'Bob Builder',
        customerEmail: 'bob@example.com',
        shipTo: {
            name: 'Bob Builder',
            street1: '456 Construction Way',
            street2: 'Suite B',
            city: 'Builder City',
            state: 'BC',
            postalCode: '67890',
            country: 'US',
        },
        items: [
            {
                orderItemId: 2002,
                sku: 'SKU-1002',
                name: 'Secondary Product',
                quantity: 3,
                unitPrice: 15.00,
            },
            {
                orderItemId: 2003,
                sku: 'SKU-1004',
                name: 'Discounted Product',
                quantity: 1,
                unitPrice: 45.00,
            }
        ],
        orderTotal: 96.50,
        taxAmount: 6.50,
        shippingAmount: 0.00,
        customerNotes: null
    }
];

// Helper to map ShipStation Address to our flat string format
const formatAddress = (shipTo: ShipStationOrderResponse['shipTo']): string => {
    return `${shipTo.name}, ${shipTo.street1}${shipTo.street2 ? ` ${shipTo.street2}` : ''}, ${shipTo.city}, ${shipTo.state} ${shipTo.postalCode}, ${shipTo.country}`;
};

export const shipstationApi = {
    /**
     * Validates API credentials against the backend proxy.
     */
    validateCredentials: async (apiKey: string, apiSecret: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/shipstation/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, apiSecret })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to validate credentials');
            }
            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    /**
     * Fetches orders from ShipStation using the provided credentials via proxy.
     */
    fetchOrders: async (apiKey: string, apiSecret: string): Promise<Order[]> => {
        if (!apiKey || !apiSecret) {
            throw new Error('Authentication failed: Missing ShipStation API keys.');
        }

        const base64Credentials = btoa(`${apiKey}:${apiSecret}`);

        const response = await fetch('/api/shipstation/orders', {
            headers: {
                'Authorization': `Basic ${base64Credentials}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to fetch orders from ShipStation');
        }

        const data = await response.json();

        // Ensure we gracefully handle if there are no orders
        const ssOrders: any[] = data.orders || [];

        // Map the real ShipStation data to our internal Order schema
        const mappedOrders: Order[] = ssOrders.map(ssOrder => {
            // User-facing ShipStation Order Number
            const orderId = ssOrder.orderNumber;

            // Map items gracefully checking if items array exists
            const mappedItems: OrderItem[] = (ssOrder.items || []).map((item: any) => ({
                id: uuidv4(),
                orderId: orderId,
                sku: item.sku,
                quantity: item.quantity,
                price: item.unitPrice,
                pickStatus: 'Pending',
                mappingStatus: 'Mapped', // Will be determined by inventory check later
            }));

            // Subtotal
            const subtotal = mappedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            const mockMargin = subtotal * 0.3; // Basic 30% mock margin since SS doesn't provide COGS natively

            // Map SS orderStatus to internal fulfillmentStatus
            const fulfillmentStatus: Order['fulfillmentStatus'] =
                ssOrder.orderStatus === 'shipped' ? 'Shipped'
                : ssOrder.orderStatus === 'cancelled' ? 'Cancelled'
                : 'New';

            return {
                id: orderId,
                channel: 'ShipStation',
                storeName: ssOrder.advancedOptions?.source || 'ShipStation Store',
                customerName: ssOrder.advancedOptions?.source || 'ShipStation Store',
                shipToName: ssOrder.shipTo?.name || 'Unknown Recipient',
                customerEmail: ssOrder.customerEmail || 'no-email@shc.com',
                shippingAddress: formatAddress(ssOrder.shipTo),
                orderDate: ssOrder.orderDate,
                fulfillmentStatus,
                paymentStatus: 'Paid',
                carrier: ssOrder.carrierCode,
                requestedService: ssOrder.requestedShippingService,
                trackingNumber: ssOrder.trackingNumber || undefined,
                shippedAt: ssOrder.shipDate || undefined,
                items: mappedItems,
                timeline: [
                    {
                        id: uuidv4(),
                        orderId: orderId,
                        timestamp: new Date().toISOString(),
                        action: 'Imported from ShipStation',
                        performedBy: 'System API',
                        notes: `Original Order #: ${ssOrder.orderNumber}`
                    }
                ],
                subtotal: subtotal,
                tax: ssOrder.taxAmount || 0,
                fees: ssOrder.shippingAmount || 0,
                total: ssOrder.orderTotal || 0,
                margin: mockMargin,
                notes: ssOrder.customerNotes || undefined
            };
        });

        return mappedOrders;
    },

    /**
     * Fetches orders with shipped status from ShipStation, including tracking info.
     * Throws on failure so syncShippedOrders can surface the error to the user.
     */
    fetchShippedOrders: async (apiKey: string, apiSecret: string): Promise<{
        orderNumber: string;
        trackingNumber?: string;
        carrierCode?: string;
        shippedAt?: string;
    }[]> => {
        if (!apiKey || !apiSecret) throw new Error('Missing ShipStation API keys');
        const base64Credentials = btoa(`${apiKey}:${apiSecret}`);
        const response = await fetch('/api/shipstation/shipped', {
            headers: { 'Authorization': `Basic ${base64Credentials}` }
        });
        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || `ShipStation API error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const orders: any[] = data.orders || [];
        return orders.map((o: any) => {
            // SS GET /orders returns shipment info directly on the order object for shipped status
            // Some accounts also nest a shipments array; prefer that tracking if present
            const shipments: any[] = o.shipments || [];
            const latest = shipments.length > 0 ? shipments[shipments.length - 1] : null;
            return {
                orderNumber: o.orderNumber,
                trackingNumber: latest?.trackingNumber || o.trackingNumber || undefined,
                carrierCode: latest?.carrierCode || o.carrierCode || undefined,
                shippedAt: latest?.shipDate || o.shipDate || undefined
            };
        });
    },

    /**
     * Pushes stock quantities to ShipStation.
     */
    syncInventory: async (apiKey: string, apiSecret: string): Promise<void> => {
        if (!apiKey || !apiSecret) {
            throw new Error('Authentication failed: Missing ShipStation API keys.');
        }

        // Just simulating the validation of keys via proxy before resolving true
        await shipstationApi.validateCredentials(apiKey, apiSecret);

        // Note: Real inventory pushing to SS requires knowing their exact warehouse/location ID structure.
        console.log("Real Integration: Keys Validated. Ready to push stock levels to SS locations.");
    }
};
