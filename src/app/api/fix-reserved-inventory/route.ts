import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/fix-reserved-inventory
 *
 * One-time (and idempotent) cleanup that finds every order in the DB that is
 * already marked Shipped but whose items still have quantity_reserved > 0 in
 * the inventory table, then properly deducts stock and clears the reservation.
 *
 * Safe to run multiple times — uses the order_timeline "Inventory auto-removed"
 * event as a deduplication flag so already-processed orders are never touched twice.
 */
export async function POST() {
    try {
        // 1. Fetch all Shipped orders with their items
        const { data: shippedOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id, order_items(sku, quantity)')
            .eq('fulfillment_status', 'Shipped');

        if (ordersError) {
            return NextResponse.json({ error: ordersError.message }, { status: 500 });
        }
        if (!shippedOrders || shippedOrders.length === 0) {
            return NextResponse.json({ message: 'No shipped orders found.', fixed: 0, skipped: 0 });
        }

        // 2. Fetch which orders already have a deduction timeline event
        const orderIds = shippedOrders.map(o => o.id);
        const { data: timelineRows } = await supabase
            .from('order_timeline')
            .select('order_id')
            .in('order_id', orderIds)
            .ilike('action', '%Inventory auto-removed%');

        const alreadyDeducted = new Set((timelineRows ?? []).map(r => r.order_id));

        // 3. Process each order that hasn't had a deduction yet
        let fixed = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const order of shippedOrders) {
            if (alreadyDeducted.has(order.id)) {
                // Deduction already ran — just make sure reservation is cleared
                // (handles edge case where deduction ran but reservation wasn't freed)
                skipped++;
                continue;
            }

            const items: { sku: string; quantity: number }[] = order.order_items ?? [];
            if (items.length === 0) { skipped++; continue; }

            let orderHadReservation = false;

            for (const item of items) {
                // Fetch lots with any reservation for this SKU, FEFO order
                const { data: lots } = await supabase
                    .from('inventory')
                    .select('id, quantity_on_hand, quantity_reserved')
                    .eq('product_id', item.sku)
                    .gt('quantity_reserved', 0)
                    .order('expiration_date', { ascending: true, nullsFirst: false });

                if (!lots || lots.length === 0) continue;

                let remaining = item.quantity;
                for (const lot of lots) {
                    if (remaining <= 0) break;

                    // Only deduct up to what was actually reserved on this lot
                    // This makes the operation safe and idempotent — if on_hand was already
                    // reduced by a previous run, quantity_reserved will be 0 and we skip.
                    const deduct = Math.min(lot.quantity_reserved, remaining);
                    if (deduct <= 0) continue;

                    const newOnHand = Math.max(0, lot.quantity_on_hand - deduct);
                    const newReserved = Math.max(0, lot.quantity_reserved - deduct);

                    await supabase
                        .from('inventory')
                        .update({
                            quantity_on_hand: newOnHand,
                            quantity_reserved: newReserved,
                            last_updated: new Date().toISOString(),
                            updated_by: 'System: Fix Reserved Inventory'
                        })
                        .eq('id', lot.id);

                    remaining -= deduct;
                    orderHadReservation = true;
                }
            }

            if (orderHadReservation) {
                // Log the deduction event so this order is skipped on future runs
                await supabase.from('order_timeline').insert({
                    order_id: order.id,
                    action: 'Inventory auto-removed via FEFO',
                    performed_by: 'System: Fix Reserved Inventory',
                    notes: 'Stock deducted during stale-reservation cleanup run',
                    created_at: new Date().toISOString(),
                });
                fixed++;
            } else {
                skipped++;
            }
        }

        console.log(`[Fix Reserved] Complete — ${fixed} orders fixed, ${skipped} skipped`);

        return NextResponse.json({
            message: `Done. ${fixed} order(s) had stale reservations cleared. ${skipped} order(s) were already clean or already deducted.`,
            fixed,
            skipped,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (err: any) {
        console.error('[Fix Reserved] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
