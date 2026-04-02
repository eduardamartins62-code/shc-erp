import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EBAY_BASE = process.env.EBAY_USE_SANDBOX === 'true'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

const TRADING_URL = process.env.EBAY_USE_SANDBOX === 'true'
    ? 'https://api.sandbox.ebay.com/ws/api.dll'
    : 'https://api.ebay.com/ws/api.dll';

interface InventoryRow {
    product_id: string;
    quantity_on_hand: number;
    quantity_reserved: number;
}

/**
 * Fetches all active fixed-price listings via the Trading API (GetMyeBaySelling),
 * returning a map of Custom Label (SKU) → eBay Item ID.
 *
 * This works for ALL listings regardless of how they were created — Seller Hub,
 * API, bulk upload, etc.
 */
async function fetchSkuToItemIdMap(oauthToken: string): Promise<Map<string, string>> {
    const skuToItemId = new Map<string, string>();
    let page = 1;
    let totalPages = 1;

    do {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ActiveList>
    <Include>true</Include>
    <ListingType>FixedPriceItem</ListingType>
    <Pagination>
      <EntriesPerPage>200</EntriesPerPage>
      <PageNumber>${page}</PageNumber>
    </Pagination>
  </ActiveList>
  <OutputSelector>ActiveList.ItemArray.Item.ItemID</OutputSelector>
  <OutputSelector>ActiveList.ItemArray.Item.SKU</OutputSelector>
  <OutputSelector>ActiveList.PaginationResult.TotalNumberOfPages</OutputSelector>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Version>967</Version>
</GetMyeBaySellingRequest>`;

        const res = await fetch(TRADING_URL, {
            method: 'POST',
            headers: {
                'X-EBAY-API-SITEID': '0',
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-CALL-NAME': 'GetMyeBaySelling',
                'X-EBAY-API-IAF-TOKEN': oauthToken,
                'Content-Type': 'text/xml',
            },
            body: xml,
        });

        if (!res.ok) {
            console.warn(`[eBay Sync] Trading API HTTP ${res.status}`);
            break;
        }

        const text = await res.text();

        if (text.includes('<Ack>Failure</Ack>')) {
            const errMatch = text.match(/<ShortMessage>(.*?)<\/ShortMessage>/);
            console.warn('[eBay Sync] Trading API error:', errMatch?.[1] ?? 'unknown');
            break;
        }

        // Parse total pages
        const pagesMatch = text.match(/<TotalNumberOfPages>(\d+)<\/TotalNumberOfPages>/);
        if (pagesMatch) totalPages = parseInt(pagesMatch[1], 10);

        // Extract each <Item> block to get ItemID + SKU (Custom Label)
        const itemBlocks = text.match(/<Item>([\s\S]*?)<\/Item>/g) ?? [];
        for (const block of itemBlocks) {
            const idMatch = block.match(/<ItemID>(\d+)<\/ItemID>/);
            const skuMatch = block.match(/<SKU>(.*?)<\/SKU>/);
            if (idMatch && skuMatch) {
                skuToItemId.set(skuMatch[1].trim(), idMatch[1]);
            }
        }

        page++;
    } while (page <= totalPages);

    return skuToItemId;
}

/**
 * Updates quantities for up to 4 listings per call via the Trading API
 * (ReviseInventoryStatus). This works for ALL Seller Hub listings regardless
 * of whether they've been migrated to the Inventory API.
 */
async function reviseInventoryStatus(
    oauthToken: string,
    items: Array<{ itemId: string; sku: string; quantity: number }>
): Promise<Map<string, { success: boolean; error?: string }>> {
    const results = new Map<string, { success: boolean; error?: string }>();
    const BATCH = 4; // eBay Trading API limit per ReviseInventoryStatus call

    for (let i = 0; i < items.length; i += BATCH) {
        const batch = items.slice(i, i + BATCH);

        const inventoryStatusXml = batch
            .map(item => `
  <InventoryStatus>
    <ItemID>${item.itemId}</ItemID>
    <Quantity>${item.quantity}</Quantity>
  </InventoryStatus>`)
            .join('');

        const xml = `<?xml version="1.0" encoding="utf-8"?>
<ReviseInventoryStatusRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  ${inventoryStatusXml}
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Version>967</Version>
</ReviseInventoryStatusRequest>`;

        try {
            const res = await fetch(TRADING_URL, {
                method: 'POST',
                headers: {
                    'X-EBAY-API-SITEID': '0',
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'ReviseInventoryStatus',
                    'X-EBAY-API-IAF-TOKEN': oauthToken,
                    'Content-Type': 'text/xml',
                },
                body: xml,
            });

            const text = await res.text();
            const isSuccess = text.includes('<Ack>Success</Ack>') || text.includes('<Ack>Warning</Ack>');

            if (isSuccess) {
                for (const item of batch) results.set(item.sku, { success: true });
            } else {
                const errMatch = text.match(/<ShortMessage>(.*?)<\/ShortMessage>/);
                const errMsg = errMatch?.[1] ?? `HTTP ${res.status}`;
                // Check per-item errors
                for (const item of batch) {
                    results.set(item.sku, { success: false, error: errMsg });
                }
            }
        } catch (err: any) {
            for (const item of batch) {
                results.set(item.sku, { success: false, error: err.message });
            }
        }
    }

    return results;
}

/**
 * POST /api/ebay/sync-inventory
 *
 * Flow:
 * 1. Read WMS inventory from Supabase, aggregate available qty per SKU.
 * 2. Apply channel buffer % and per-SKU exclusions.
 * 3. Fetch all eBay active listings via Trading API → build SKU → ItemID map.
 * 4. For SKUs that have a matching eBay ItemID → call ReviseInventoryStatus
 *    (Trading API) which updates the live listing quantity directly. Works for
 *    ALL listings regardless of how they were created.
 * 5. For SKUs with no eBay listing match → still PUT the inventory_item record
 *    so it's ready when a listing is created.
 *
 * Auth: Bearer {eBay User OAuth Token} in Authorization header.
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

        // 2. Fetch WMS inventory from Supabase
        const { data: inventoryRows, error: dbError } = await supabaseAdmin
            .from('inventory')
            .select('product_id, quantity_on_hand, quantity_reserved');

        if (dbError) {
            return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
        }

        if (!inventoryRows || inventoryRows.length === 0) {
            return NextResponse.json({ synced: 0, failed: 0, skipped: 0, results: [], syncedAt: new Date().toISOString() });
        }

        // 3. Aggregate available qty per SKU across all locations
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

        // 5. Fetch all eBay listings via Trading API → SKU (Custom Label) → ItemID map
        console.log('[eBay Sync] Fetching active listings from Trading API...');
        const skuToItemId = await fetchSkuToItemIdMap(oauthToken);
        console.log(`[eBay Sync] ${skuToItemId.size} eBay listings with Custom Labels found`);

        // 6. Split: listings we can update via Trading API vs inventory-record-only
        const toRevise: Array<{ itemId: string; sku: string; quantity: number }> = [];
        const noListingMatch: Array<[string, number]> = [];

        for (const [sku, quantity] of eligibleEntries) {
            const itemId = skuToItemId.get(sku);
            if (itemId) {
                toRevise.push({ itemId, sku, quantity });
            } else {
                noListingMatch.push([sku, quantity]);
            }
        }

        console.log(`[eBay Sync] ${toRevise.length} SKUs matched to eBay listings, ${noListingMatch.length} unmatched`);

        const results: Array<{ sku: string; quantity: number; success: boolean; method: string; error?: string }> = [];

        // 7a. Update live listing quantities via Trading API ReviseInventoryStatus
        if (toRevise.length > 0) {
            const reviseResults = await reviseInventoryStatus(oauthToken, toRevise);
            for (const { sku, quantity } of toRevise) {
                const r = reviseResults.get(sku) ?? { success: false, error: 'No response' };
                results.push({ sku, quantity, success: r.success, method: 'trading_api', ...(r.error ? { error: r.error } : {}) });
            }
        }

        // 7b. For WMS SKUs with no matching eBay listing, PUT the inventory_item
        //     record so it's ready when a listing is eventually created.
        await Promise.all(
            noListingMatch.map(async ([sku, quantity]) => {
                try {
                    const res = await fetch(
                        `${EBAY_BASE}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${oauthToken}`,
                                'Content-Language': 'en-US',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                availability: { shipToLocationAvailability: { quantity } },
                            }),
                        }
                    );
                    const success = res.ok || res.status === 204;
                    results.push({ sku, quantity, success, method: 'inventory_item_only' });
                } catch (err: any) {
                    results.push({ sku, quantity, success: false, method: 'inventory_item_only', error: err.message });
                }
            })
        );

        const synced = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const liveListingsUpdated = results.filter(r => r.success && r.method === 'trading_api').length;

        console.log(`[eBay Sync] Complete — ${liveListingsUpdated} live listings updated, ${synced} total synced, ${failed} failed`);

        return NextResponse.json({
            synced,
            failed,
            liveListingsUpdated,
            noListingMatch: noListingMatch.length,
            results,
            syncedAt: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[eBay Sync] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error during eBay inventory sync' }, { status: 500 });
    }
}
