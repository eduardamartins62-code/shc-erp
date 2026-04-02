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

/**
 * Fetches all active fixed-price listing IDs and their Custom Labels (SKUs)
 * from the eBay Trading API (GetMyeBaySelling), paginating through all results.
 */
async function getActiveListings(oauthToken: string): Promise<{ itemId: string; sku: string | null }[]> {
    const listings: { itemId: string; sku: string | null }[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
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
            body: xmlBody,
        });

        if (!res.ok) {
            console.error(`[eBay Migrate] Trading API HTTP error: ${res.status}`);
            break;
        }

        const xml = await res.text();

        // Check for API-level errors
        if (xml.includes('<Ack>Failure</Ack>')) {
            const errMatch = xml.match(/<LongMessage>(.*?)<\/LongMessage>/);
            console.error('[eBay Migrate] Trading API error:', errMatch?.[1]);
            break;
        }

        // Extract total pages
        const pagesMatch = xml.match(/<TotalNumberOfPages>(\d+)<\/TotalNumberOfPages>/);
        if (pagesMatch) totalPages = parseInt(pagesMatch[1], 10);

        // Extract Item blocks: each <Item> contains <ItemID> and optionally <SKU>
        const itemBlocks = xml.match(/<Item>([\s\S]*?)<\/Item>/g) ?? [];
        for (const block of itemBlocks) {
            const idMatch = block.match(/<ItemID>(\d+)<\/ItemID>/);
            const skuMatch = block.match(/<SKU>(.*?)<\/SKU>/);
            if (idMatch) {
                listings.push({
                    itemId: idMatch[1],
                    sku: skuMatch ? skuMatch[1].trim() : null,
                });
            }
        }

        page++;
    } while (page <= totalPages);

    return listings;
}

/**
 * POST /api/ebay/migrate-listings
 *
 * 1. Fetches all active Seller Hub listings via the Trading API (GetMyeBaySelling).
 * 2. Calls bulk_migrate_listings on each batch of 25 to link them to the
 *    Inventory API — after which the regular sync can update their quantities.
 *
 * This is a one-time operation per account. Listings already migrated are
 * returned as "already migrated" by eBay and are safe to include again.
 *
 * Auth: Bearer {eBay OAuth Token} in Authorization header.
 * Body: { channelId: string }
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing eBay OAuth token' }, { status: 401 });
        }
        const oauthToken = authHeader.slice(7);

        const body = await request.json().catch(() => ({}));
        const channelId: string | undefined = body?.channelId;

        // 1. Get all active listing IDs from Trading API
        console.log('[eBay Migrate] Fetching active listings from Trading API...');
        const activeListings = await getActiveListings(oauthToken);
        console.log(`[eBay Migrate] Found ${activeListings.length} active fixed-price listings`);

        if (activeListings.length === 0) {
            return NextResponse.json({
                migrated: 0,
                alreadyMigrated: 0,
                failed: 0,
                total: 0,
                listings: [],
                message: 'No active fixed-price listings found on this eBay account.',
            });
        }

        // 2. Migrate in batches of 25 (eBay API limit)
        const BATCH = 25;
        const allResponses: Array<{
            listingId: string;
            sku: string | null;
            statusCode: number;
            errors?: string;
        }> = [];

        for (let i = 0; i < activeListings.length; i += BATCH) {
            const batch = activeListings.slice(i, i + BATCH);
            const payload = {
                requests: batch.map(l => ({ listingId: l.itemId })),
            };

            try {
                const migrateRes = await fetch(
                    `${EBAY_BASE}/sell/inventory/v1/bulk_migrate_listings`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${oauthToken}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const migrateData = await migrateRes.json().catch(() => ({}));
                const responses = migrateData.responses ?? [];

                for (const resp of responses) {
                    const listing = batch.find(l => l.itemId === resp.listingId);
                    allResponses.push({
                        listingId: resp.listingId,
                        sku: listing?.sku ?? resp.sku ?? null,
                        statusCode: resp.statusCode ?? (migrateRes.ok ? 200 : 500),
                        errors: resp.errors?.[0]?.message,
                    });
                }

                // If eBay returned no per-listing responses but the call succeeded
                if (responses.length === 0 && migrateRes.ok) {
                    for (const l of batch) {
                        allResponses.push({ listingId: l.itemId, sku: l.sku, statusCode: 200 });
                    }
                }
            } catch (err: any) {
                for (const l of batch) {
                    allResponses.push({
                        listingId: l.itemId,
                        sku: l.sku,
                        statusCode: 500,
                        errors: err.message,
                    });
                }
            }
        }

        const migrated = allResponses.filter(r => r.statusCode === 200 || r.statusCode === 204).length;
        const alreadyMigrated = allResponses.filter(r => r.statusCode === 409).length; // 409 = already migrated
        const failed = allResponses.filter(r => r.statusCode >= 400 && r.statusCode !== 409).length;

        console.log(`[eBay Migrate] Done — ${migrated} migrated, ${alreadyMigrated} already done, ${failed} failed`);

        // Store migration timestamp on the channel record
        if (channelId) {
            await supabaseAdmin
                .from('channels')
                .update({ notes: `Listings migrated at ${new Date().toISOString()}` })
                .eq('id', channelId);
        }

        return NextResponse.json({
            migrated,
            alreadyMigrated,
            failed,
            total: activeListings.length,
            listings: allResponses,
        });

    } catch (error: any) {
        console.error('[eBay Migrate] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error during listing migration' }, { status: 500 });
    }
}
