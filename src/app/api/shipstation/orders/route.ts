import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Only fetch orders created on or after Jan 1 2026
        const dateFrom = '2026-01-01';

        // Fetch awaiting_shipment AND shipped orders in parallel
        const [awaitingRes, shippedRes] = await Promise.all([
            fetch(`https://ssapi.shipstation.com/orders?orderStatus=awaiting_shipment&createDateStart=${dateFrom}&pageSize=500&sortBy=OrderDate&sortDir=DESC`, {
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
            }),
            fetch(`https://ssapi.shipstation.com/orders?orderStatus=shipped&createDateStart=${dateFrom}&pageSize=500&sortBy=OrderDate&sortDir=DESC`, {
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
            })
        ]);

        const awaitingData = awaitingRes.ok ? await awaitingRes.json() : { orders: [] };
        const shippedData = shippedRes.ok ? await shippedRes.json() : { orders: [] };

        const allOrders = [
            ...(awaitingData.orders || []),
            ...(shippedData.orders || [])
        ];

        console.log(`[ShipStation] Fetched ${awaitingData.orders?.length || 0} awaiting + ${shippedData.orders?.length || 0} shipped orders (since ${dateFrom})`);
        return NextResponse.json({ orders: allOrders, total: allOrders.length });

    } catch (error: any) {
        console.error('ShipStation Orders Error:', error);
        return NextResponse.json({ error: 'Internal server error while fetching orders' }, { status: 500 });
    }
}
