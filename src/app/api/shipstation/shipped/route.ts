import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Look back to the earliest order import date so we catch ALL orders
        // that shipped outside the old 14-day window.
        // We read the oldest non-shipped order date from DB so we don't fetch
        // more from ShipStation than we actually need.
        const { data: oldestRow } = await supabaseAdmin
            .from('orders')
            .select('order_date')
            .not('fulfillment_status', 'in', '("Shipped","Cancelled")')
            .order('order_date', { ascending: true })
            .limit(1)
            .single();

        // Default to Jan 1 2026 (original import start). If no pending orders remain,
        // fall back to 30 days to still catch any recent shipments.
        const fallbackDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

        const shipDateStart = oldestRow?.order_date
            ? oldestRow.order_date.split('T')[0]
            : fallbackDate;

        console.log(`[ShipStation Shipped] Looking back to ${shipDateStart} for shipped orders`);

        const allOrders: any[] = [];
        let page = 1;
        let totalPages = 1;
        const MAX_PAGES = 20; // 20 × 500 = 10,000 shipped orders max

        do {
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
