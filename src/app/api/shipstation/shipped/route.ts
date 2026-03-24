import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Use a 14-day window — orders ship within days of being placed, and a shorter
        // window means fewer pages to paginate, avoiding Vercel serverless timeouts.
        const shipDateStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]; // YYYY-MM-DD

        const allOrders: any[] = [];
        let page = 1;
        let totalPages = 1;
        const MAX_PAGES = 5; // Safety cap — 5 × 500 = 2,500 shipped orders max per sync

        do {
            // sortBy valid values: OrderDate, ModifyDate, CreateDate (ShipDate is not supported)
            // ModifyDate DESC ensures recently-shipped orders (status change) surface first
            const url = `https://ssapi.shipstation.com/orders?orderStatus=shipped&shipDateStart=${shipDateStart}&pageSize=500&page=${page}&sortBy=ModifyDate&sortDir=DESC`;
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
        } while (page <= totalPages && page <= MAX_PAGES);

        return NextResponse.json({ orders: allOrders, total: allOrders.length });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
