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

interface EbayOffer {
    offerId: string;
    sku: string;
    status: string;
    listing?: { listingId: string };
}

/**
 * Fetches all published offers for the seller, paginating through all results.
 * Returns a map of SKU → offerId[] (a SKU can have multiple offers/marketplaces).
 */
async function fetchAllOffers(oauthToken: string): Promise<Map<string, string[]>> {
    const skuToOfferIds = new Map<string, string[]>();
    let offset = 0;
    const limit = 200;

    while (true) {
        const url = `${EBAY_BASE}/sell/inventory/v1/offer?limit=${limit}&offset=${offset}`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!res.ok) break; // no offers or token can't list them — fall through gracefully

        const data = await res.json();
        const offers: EbayOffer[] = data.offers ?? [];

        for (const offer of offers) {
            if (!offer.sku || offer.status !== 'PUBLISHED') continue;
            const existing = skuToOfferIds.get(offer.sku) ?? [];
            existing.push(offer.offerId);
            skuToOfferIds.set(offer.sku, existing);
        }

        if (offers.length < limit) break; // last page
        offset += limit;
    }

    return skuToOfferIds;
}

/**
 * POST /api/ebay/sync-inventory
 *
 * 1. Reads WMS inventory from Supabase, aggregates available qty per SKU.
 * 2. Applies the channel's inventory buffer % and per-SKU exclusions.
 * 3. Fetches all published eBay offers (to get offer IDs per SKU).
 * 4. For SKUs that have published offers → uses bulk_update_price_quantity
 *    so both the inventory item record AND the live listing quantity update.
 * 5. For SKUs without offers (inventory-item-only, no live listing) → falls
 *    back to a plain PUT inventory_item so the record is at least current.
 *
 * Auth: Bearer {eBay User OAuth Token} in the Authorization header.
 * Body: { channelId?: string }
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing eBay OAuth token in Authorization header' }, { status: 401 });
        }
        const oauthToken = authHeader.slice(7);

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
                for (const row of exclusionsResult.data) excludedSkus.add(row.product_sku);
            }
        }

        // 2. Fetch WMS inventory
        const { data: inventoryRows, error: dbError } = await supabaseAdmin
            .from('inventory')
            .select('product_id, quantity_on_hand, quantity_reserved');

        if (dbError) {
            return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
        }

        if (!inventoryRows || inventoryRows.length === 0) {
            return NextResponse.json({ synced: 0, failed: 0, skipped: 0, results: [], syncedAt: new Date().toISOString() });
        }

        // 3. Aggregate available quantity per SKU across all locations/warehouses
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

        if (eligibleEntries.length === 0) {
            return NextResponse.json({ synced: 0, failed: 0, skipped: excludedSkus.size, results: [], syncedAt: new Date().toISOString() });
        }

        // 5. Fetch all published eBay offers so we can update live listings
        const skuToOfferIds = await fetchAllOffers(oauthToken);
        console.log(`[eBay Sync] Found ${skuToOfferIds.size} SKUs with published offers on eBay`);

        // 6. Split into two groups: SKUs with live offers vs inventory-item-only
        const withOffers: Array<[string, number, string[]]> = [];
        const withoutOffers: Array<[string, number]> = [];

        for (const [sku, quantity] of eligibleEntries) {
            const offerIds = skuToOfferIds.get(sku);
            if (offerIds && offerIds.length > 0) {
                withOffers.push([sku, quantity, offerIds]);
            } else {
                withoutOffers.push([sku, quantity]);
            }
        }

        const results: Array<{ sku: string; quantity: number; success: boolean; method: string; error?: string }> = [];

        // 7a. Bulk-update SKUs that have live offers (updates BOTH inventory item AND listing)
        if (withOffers.length > 0) {
            // eBay bulk_update_price_quantity accepts up to 25 per call
            const BATCH = 25;
            for (let i = 0; i < withOffers.length; i += BATCH) {
                const batch = withOffers.slice(i, i + BATCH);
                const requestPayload = {
                    requests: batch.map(([sku, quantity, offerIds]) => ({
                        sku,
                        shipToLocationAvailability: { quantity },
                        offers: offerIds.map(offerId => ({ offerId, availableQuantity: quantity })),
                    })),
                };

                try {
                    const bulkRes = await fetch(
                        `${EBAY_BASE}/sell/inventory/v1/bulk_update_price_quantity`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${oauthToken}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify(requestPayload),
                        }
                    );

                    const bulkData = await bulkRes.json().catch(() => ({}));
                    const responses = bulkData.responses ?? [];

                    for (const entry of responses) {
                        const success = entry.statusCode === 200 || entry.statusCode === 204 || !entry.errors?.length;
                        const errMsg = entry.errors?.[0]?.message;
                        results.push({
                            sku: entry.sku,
                            quantity: (withOffers.find(e => e[0] === entry.sku)?.[1]) ?? 0,
                            success,
                            method: 'bulk_offer',
                            ...(errMsg ? { error: errMsg } : {}),
                        });
                    }

                    // If bulk response didn't return per-SKU responses, mark all as success if HTTP was ok
                    if (responses.length === 0 && bulkRes.ok) {
                        for (const [sku, quantity] of batch) {
                            results.push({ sku, quantity, success: true, method: 'bulk_offer' });
                        }
                    }
                } catch (err: any) {
                    for (const [sku, quantity] of batch) {
                        results.push({ sku, quantity, success: false, method: 'bulk_offer', error: err.message });
                    }
                }
            }
        }

        // 7b. For SKUs without offers, fall back to PUT inventory_item
        //     (updates the catalog record so it's ready when an offer is created)
        await Promise.all(
            withoutOffers.map(async ([sku, quantity]) => {
                try {
                    const res = await fetch(
                        `${EBAY_BASE}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${oauthToken}`,
                                'Content-Language': 'en-US',
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                availability: { shipToLocationAvailability: { quantity } },
                            }),
                        }
                    );
                    const success = res.ok || res.status === 204;
                    const errMsg = success ? undefined : (await res.json().catch(() => ({}))).errors?.[0]?.message || res.statusText;
                    results.push({ sku, quantity, success, method: 'inventory_item_only', ...(errMsg ? { error: errMsg } : {}) });
                } catch (err: any) {
                    results.push({ sku, quantity, success: false, method: 'inventory_item_only', error: err.message });
                }
            })
        );

        const synced = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const liveListingsUpdated = results.filter(r => r.success && r.method === 'bulk_offer').length;

        console.log(`[eBay Sync] Complete — ${synced} synced (${liveListingsUpdated} live listings updated), ${failed} failed, ${excludedSkus.size} excluded, ${bufferPercent}% buffer`);

        return NextResponse.json({
            synced,
            failed,
            liveListingsUpdated,
            noOfferCount: withoutOffers.length,
            results,
            syncedAt: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[eBay Sync] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error during eBay inventory sync' }, { status: 500 });
    }
}
