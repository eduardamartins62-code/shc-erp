import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Only fetch orders created in the last 7 days.
        // This ensures only new/recent orders are ever pulled — historical orders
        // already in the DB are ignored (deduplicated by order ID anyway).
        const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

        // Only fetch awaiting_shipment — these are the new orders that need to be imported.
        // Shipped orders in this window are handled separately by the shipped sync.
        const response = await fetch(
            `https://ssapi.shipstation.com/orders?orderStatus=awaiting_shipment&createDateStart=${dateFrom}&pageSize=500&sortBy=OrderDate&sortDir=DESC`,
            { headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' } }
        );

        const data = response.ok ? await response.json() : { orders: [] };
        const orders = data.orders || [];

        console.log(`[ShipStation] Fetched ${orders.length} awaiting_shipment orders (last 7 days since ${dateFrom})`);
        return NextResponse.json({ orders, total: orders.length });

    } catch (error: any) {
        console.error('ShipStation Orders Error:', error);
        return NextResponse.json({ error: 'Internal server error while fetching orders' }, { status: 500 });
    }
}
