import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/recalculate-reservations
 *
 * Recalculates quantity_reserved for every inventory row from scratch
 * by summing quantities from actual open (non-Shipped, non-Cancelled) orders.
 *
 * This is the ground-truth approach — no dependency on historical sync events.
 * Safe to run any time.
 */
export async function POST() {
    try {
        // 1. Sum quantities for every SKU across all open orders
        const { data: pendingItems, error: ordersError } = await supabase
            .from('order_items')
            .select('sku, quantity, orders!inner(fulfillment_status)')
            .not('orders.fulfillment_status', 'in', '("Shipped","Cancelled")');

        if (ordersError) {
            return NextResponse.json({ error: ordersError.message }, { status: 500 });
        }

        // Build SKU → total reserved map
        const reservedBySku = new Map<string, number>();
        for (const item of pendingItems ?? []) {
            const prev = reservedBySku.get(item.sku) ?? 0;
            reservedBySku.set(item.sku, prev + (item.quantity ?? 0));
        }

        // 2. Fetch all inventory rows
        const { data: allInventory, error: invError } = await supabase
            .from('inventory')
            .select('id, product_id, quantity_on_hand, quantity_reserved');

        if (invError) {
            return NextResponse.json({ error: invError.message }, { status: 500 });
        }

        // 3. Distribute reserved quantities across lots per SKU (same FEFO ordering
        //    the reservation logic uses — earliest expiry gets reserved first)
        // Group lots by SKU
        const lotsBySku = new Map<string, typeof allInventory>();
        for (const lot of allInventory ?? []) {
            const arr = lotsBySku.get(lot.product_id) ?? [];
            arr.push(lot);
            lotsBySku.set(lot.product_id, arr);
        }

        let updated = 0;
        let cleared = 0;

        // Process every SKU that appears in inventory
        for (const [sku, lots] of Array.from(lotsBySku.entries())) {
            let remaining = reservedBySku.get(sku) ?? 0;

            // Sort lots by expiration_date ascending (FEFO) — nulls last
            lots.sort((a: any, b: any) => {
                if (!a.expiration_date && !b.expiration_date) return 0;
                if (!a.expiration_date) return 1;
                if (!b.expiration_date) return -1;
                return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
            });

            for (const lot of lots) {
                const correctReserved = Math.min(remaining, Math.max(0, lot.quantity_on_hand));
                remaining = Math.max(0, remaining - correctReserved);

                if (lot.quantity_reserved !== correctReserved) {
                    await supabase
                        .from('inventory')
                        .update({
                            quantity_reserved: correctReserved,
                            last_updated: new Date().toISOString(),
                            updated_by: 'System: Recalculate Reservations',
                        })
                        .eq('id', lot.id);

                    correctReserved === 0 ? cleared++ : updated++;
                }
            }
        }

        const skusWithReservations = reservedBySku.size;
        console.log(`[Recalculate Reservations] Done — ${updated} rows updated, ${cleared} rows cleared to 0`);

        return NextResponse.json({
            message: `Done. ${updated + cleared} inventory row(s) corrected (${cleared} cleared to 0). ${skusWithReservations} SKU(s) have active open orders.`,
            updated,
            cleared,
            skusWithOpenOrders: skusWithReservations,
        });

    } catch (err: any) {
        console.error('[Recalculate Reservations] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
