import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InventoryRow {
    product_id: string;
    quantity_on_hand: number;
    quantity_reserved: number;
}

/**
 * POST /api/ebay/sync-inventory
 *
 * Reads current WMS inventory from Supabase, aggregates available quantity per SKU,
 * then pushes each SKU's quantity to eBay via the Sell Inventory API.
 *
 * Auth: Bearer {eBay User OAuth Token} in the Authorization header.
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing eBay OAuth token in Authorization header' }, { status: 401 });
        }
        const oauthToken = authHeader.slice(7);

        // 1. Fetch inventory from Supabase
        const { data: inventoryRows, error: dbError } = await supabaseAdmin
            .from('inventory')
            .select('product_id, quantity_on_hand, quantity_reserved');

        if (dbError) {
            console.error('[eBay Sync] Supabase error:', dbError);
            return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
        }

        if (!inventoryRows || inventoryRows.length === 0) {
            return NextResponse.json({
                synced: 0,
                failed: 0,
                results: [],
                syncedAt: new Date().toISOString()
            });
        }

        // 2. Aggregate available quantity per SKU (sum across all locations/warehouses)
        const skuQtyMap = new Map<string, number>();
        for (const row of inventoryRows as InventoryRow[]) {
            const available = Math.max(0, (row.quantity_on_hand ?? 0) - (row.quantity_reserved ?? 0));
            skuQtyMap.set(row.product_id, (skuQtyMap.get(row.product_id) ?? 0) + available);
        }

        // 3. Push each SKU to eBay Sell Inventory API
        const results = await Promise.all(
            Array.from(skuQtyMap.entries()).map(async ([sku, quantity]) => {
                try {
                    const encodedSku = encodeURIComponent(sku);
                    const ebayResponse = await fetch(
                        `https://api.ebay.com/sell/inventory/v1/inventory_item/${encodedSku}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${oauthToken}`,
                                'Content-Language': 'en-US',
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                availability: {
                                    shipToLocationAvailability: {
                                        quantity
                                    }
                                }
                            })
                        }
                    );

                    if (ebayResponse.ok || ebayResponse.status === 204) {
                        return { sku, quantity, success: true };
                    }

                    const errBody = await ebayResponse.json().catch(() => ({}));
                    const errMsg = errBody?.errors?.[0]?.message || ebayResponse.statusText;
                    console.warn(`[eBay Sync] SKU ${sku} failed: ${ebayResponse.status} ${errMsg}`);
                    return { sku, quantity, success: false, error: errMsg };

                } catch (err: any) {
                    return { sku, quantity, success: false, error: err.message };
                }
            })
        );

        const synced = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`[eBay Sync] Complete — ${synced} synced, ${failed} failed`);

        return NextResponse.json({
            synced,
            failed,
            results,
            syncedAt: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[eBay Sync] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error during eBay inventory sync' }, { status: 500 });
    }
}
