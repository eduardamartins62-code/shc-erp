import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Fetch awaiting_shipment AND shipped orders in parallel
        const [awaitingRes, shippedRes] = await Promise.all([
            fetch('https://ssapi.shipstation.com/orders?orderStatus=awaiting_shipment&pageSize=500', {
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
            }),
            fetch('https://ssapi.shipstation.com/orders?orderStatus=shipped&pageSize=500', {
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
            })
        ]);

        const awaitingData = awaitingRes.ok ? await awaitingRes.json() : { orders: [] };
        const shippedData = shippedRes.ok ? await shippedRes.json() : { orders: [] };

        const allOrders = [
            ...(awaitingData.orders || []),
            ...(shippedData.orders || [])
        ];

        console.log(`[ShipStation] Fetched ${awaitingData.orders?.length || 0} awaiting + ${shippedData.orders?.length || 0} shipped orders`);
        return NextResponse.json({ orders: allOrders, total: allOrders.length });

    } catch (error: any) {
        console.error('ShipStation Orders Error:', error);
        return NextResponse.json({ error: 'Internal server error while fetching orders' }, { status: 500 });
    }
}
