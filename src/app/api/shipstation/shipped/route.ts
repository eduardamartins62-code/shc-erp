import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Use shipDateStart (last 60 days) so we catch recently-shipped orders regardless
        // of when the order was originally created. Paginate through all pages so high-volume
        // stores (e.g. SHC) don't push lower-volume store orders off page 1.
        const shipDateStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]; // YYYY-MM-DD

        const allOrders: any[] = [];
        let page = 1;
        let totalPages = 1;

        do {
            const url = `https://ssapi.shipstation.com/orders?orderStatus=shipped&shipDateStart=${shipDateStart}&pageSize=500&page=${page}&sortBy=ShipDate&sortDir=DESC`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                return NextResponse.json(
                    { error: `ShipStation API Error: ${response.statusText}` },
                    { status: response.status }
                );
            }

            const data = await response.json();
            const pageOrders: any[] = data.orders || [];
            allOrders.push(...pageOrders);
            totalPages = data.pages ?? 1;
            console.log(`[ShipStation Shipped] Page ${page}/${totalPages} — fetched ${pageOrders.length} orders (total so far: ${allOrders.length})`);
            page++;
        } while (page <= totalPages);

        return NextResponse.json({ orders: allOrders, total: allOrders.length });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
