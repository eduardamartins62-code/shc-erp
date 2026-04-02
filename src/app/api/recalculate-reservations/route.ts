import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/recalculate-reservations
 *
 * Resets quantity_reserved for every inventory row to exactly what
 * real open (non-Shipped, non-Cancelled) orders require.
 * Safe and idempotent — can be run any time.
 */
export async function POST() {
    try {
        // 1. Get all pending order IDs first (avoids unreliable joined-table filters)
        const { data: openOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id')
            .not('fulfillment_status', 'in', '("Shipped","Cancelled")');

        if (ordersError) {
            return NextResponse.json({ error: ordersError.message }, { status: 500 });
        }

        const openOrderIds = (openOrders ?? []).map(o => o.id);

        // 2. Build SKU → total reserved map from open order items
        const reservedBySku = new Map<string, number>();

        if (openOrderIds.length > 0) {
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('sku, quantity')
                .in('order_id', openOrderIds);

            if (itemsError) {
                return NextResponse.json({ error: itemsError.message }, { status: 500 });
            }

            for (const item of items ?? []) {
                reservedBySku.set(item.sku, (reservedBySku.get(item.sku) ?? 0) + (item.quantity ?? 0));
            }
        }

        // 3. Fetch all inventory rows
        const { data: allInventory, error: invError } = await supabase
            .from('inventory')
            .select('id, product_id, quantity_on_hand, quantity_reserved');

        if (invError) {
            return NextResponse.json({ error: invError.message }, { status: 500 });
        }

        // 4. Group lots by SKU and sort FEFO (earliest expiry first)
        const lotsBySku = new Map<string, typeof allInventory>();
        for (const lot of allInventory ?? []) {
            const arr = lotsBySku.get(lot.product_id) ?? [];
            arr.push(lot);
            lotsBySku.set(lot.product_id, arr);
        }

        let updated = 0;
        let cleared = 0;

        for (const [sku, lots] of Array.from(lotsBySku.entries())) {
            let remaining = reservedBySku.get(sku) ?? 0;

            // Sort FEFO — reserve from earliest-expiring lots first
            const sorted = [...lots].sort((a: any, b: any) => {
                if (!a.expiration_date && !b.expiration_date) return 0;
                if (!a.expiration_date) return 1;
                if (!b.expiration_date) return -1;
                return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
            });

            for (const lot of sorted) {
                // Reserve up to what this lot can cover, never more than on_hand
                const correctReserved = Math.min(remaining, Math.max(0, lot.quantity_on_hand));
                remaining = Math.max(0, remaining - correctReserved);

                if (lot.quantity_reserved !== correctReserved) {
                    const { error } = await supabase
                        .from('inventory')
                        .update({
                            quantity_reserved: correctReserved,
                            last_updated: new Date().toISOString(),
                            updated_by: 'System: Recalculate Reservations',
                        })
                        .eq('id', lot.id);

                    if (!error) {
                        correctReserved === 0 ? cleared++ : updated++;
                    }
                }
            }
        }

        console.log(`[Recalculate Reservations] ${updated} rows updated, ${cleared} rows cleared`);

        return NextResponse.json({
            message: `${cleared} stale reservation(s) cleared, ${updated} row(s) set to correct values. ${reservedBySku.size} SKU(s) have active open orders.`,
            updated,
            cleared,
            skusWithOpenOrders: reservedBySku.size,
        });

    } catch (err: any) {
        console.error('[Recalculate Reservations] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
