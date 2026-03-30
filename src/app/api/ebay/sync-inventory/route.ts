import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EBAY_BASE = process.env.EBAY_USE_SANDBOX === 'true'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

interface InventoryRow {
    product_id: string;
    quantity_on_hand: number;
    quantity_reserved: number;
}

/**
 * POST /api/ebay/sync-inventory
 *
 * Reads current WMS inventory from Supabase, aggregates available quantity per SKU,
 * applies the channel's inventory buffer % and per-SKU exclusions, then pushes
 * each eligible SKU's quantity to eBay via the Sell Inventory API.
 *
 * Auth: Bearer {eBay User OAuth Token} in the Authorization header.
 * Body: { channelId: string }
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing eBay OAuth token in Authorization header' }, { status: 401 });
        }
        const oauthToken = authHeader.slice(7);

        // Parse channelId from body (optional — falls back to no filtering)
        const body = await request.json().catch(() => ({}));
        const channelId: string | undefined = body?.channelId;

        // 1. Fetch channel settings (buffer %) and excluded SKUs in parallel
        let bufferPercent = 0;
        const excludedSkus = new Set<string>();

        if (channelId) {
            const [channelResult, exclusionsResult] = await Promise.all([
                supabaseAdmin
                    .from('channels')
                    .select('inventory_buffer_percent')
                    .eq('id', channelId)
                    .single(),
                supabaseAdmin
                    .from('product_channel_exclusions')
                    .select('product_sku')
                    .eq('channel_id', channelId),
            ]);

            if (channelResult.data?.inventory_buffer_percent != null) {
                bufferPercent = Math.max(0, Math.min(100, channelResult.data.inventory_buffer_percent));
            }
            if (exclusionsResult.data) {
                for (const row of exclusionsResult.data) {
                    excludedSkus.add(row.product_sku);
                }
            }
        }

        // 2. Fetch inventory from Supabase
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

        // 3. Aggregate available quantity per SKU (sum across all locations/warehouses)
        const skuQtyMap = new Map<string, number>();
        for (const row of inventoryRows as InventoryRow[]) {
            const available = Math.max(0, (row.quantity_on_hand ?? 0) - (row.quantity_reserved ?? 0));
            skuQtyMap.set(row.product_id, (skuQtyMap.get(row.product_id) ?? 0) + available);
        }

        // 4. Apply exclusions and buffer
        const multiplier = (100 - bufferPercent) / 100;
        const eligibleEntries = Array.from(skuQtyMap.entries())
            .filter(([sku]) => !excludedSkus.has(sku))
            .map(([sku, qty]) => [sku, Math.floor(qty * multiplier)] as [string, number]);

        if (bufferPercent > 0) {
            console.log(`[eBay Sync] Buffer ${bufferPercent}% — sending ${multiplier * 100}% of stock`);
        }
        if (excludedSkus.size > 0) {
            console.log(`[eBay Sync] Excluding ${excludedSkus.size} SKU(s) from sync`);
        }

        // 5. Push each eligible SKU to eBay Sell Inventory API
        const results = await Promise.all(
            eligibleEntries.map(async ([sku, quantity]) => {
                try {
                    const encodedSku = encodeURIComponent(sku);
                    const ebayResponse = await fetch(
                        `${EBAY_BASE}/sell/inventory/v1/inventory_item/${encodedSku}`,
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

        console.log(`[eBay Sync] Complete — ${synced} synced, ${failed} failed (${excludedSkus.size} excluded, ${bufferPercent}% buffer)`);

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
