import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EBAY_BASE = process.env.EBAY_USE_SANDBOX === 'true'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

/**
 * GET /api/ebay/check-listings?channelId=xxx
 *
 * Diagnostic endpoint that shows:
 * - All published eBay offers and their SKUs
 * - Which WMS SKUs have matching eBay offers (will sync to live listings)
 * - Which WMS SKUs have NO eBay offer (won't update live listings)
 *
 * This helps identify SKU mismatches between WMS and eBay.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
        return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
    }

    // Get the channel's OAuth token
    const { data: channel, error: chErr } = await supabaseAdmin
        .from('channels')
        .select('oauth_token, store_name')
        .eq('id', channelId)
        .single();

    if (chErr || !channel?.oauth_token) {
        return NextResponse.json({ error: 'Channel not found or not connected' }, { status: 404 });
    }

    const oauthToken = channel.oauth_token;

    // Fetch WMS SKUs
    const { data: inventoryRows } = await supabaseAdmin
        .from('inventory')
        .select('product_id, quantity_on_hand, quantity_reserved');

    const wmsSkus = new Set((inventoryRows ?? []).map((r: any) => r.product_id as string));

    // Fetch all eBay offers
    const ebayOffers: Array<{ offerId: string; sku: string; status: string; listingId?: string; quantity?: number }> = [];
    let offset = 0;
    const limit = 200;

    while (true) {
        const res = await fetch(`${EBAY_BASE}/sell/inventory/v1/offer?limit=${limit}&offset=${offset}`, {
            headers: { 'Authorization': `Bearer ${oauthToken}`, 'Accept': 'application/json' },
        });

        if (!res.ok) break;
        const data = await res.json();
        const offers = data.offers ?? [];

        for (const o of offers) {
            ebayOffers.push({
                offerId: o.offerId,
                sku: o.sku,
                status: o.status,
                listingId: o.listing?.listingId,
                quantity: o.availableQuantity,
            });
        }

        if (offers.length < limit) break;
        offset += limit;
    }

    const publishedOfferSkus = new Set(
        ebayOffers.filter(o => o.status === 'PUBLISHED').map(o => o.sku)
    );

    // Cross-reference
    const wmsSkusWithLiveOffer = Array.from(wmsSkus).filter(s => publishedOfferSkus.has(s));
    const wmsSkusWithoutOffer = Array.from(wmsSkus).filter(s => !publishedOfferSkus.has(s));
    const ebayOnlySkus = Array.from(publishedOfferSkus).filter(s => !wmsSkus.has(s));

    return NextResponse.json({
        summary: {
            totalWmsSkus: wmsSkus.size,
            totalEbayOffers: ebayOffers.length,
            publishedOffers: ebayOffers.filter(o => o.status === 'PUBLISHED').length,
            willSyncToLiveListing: wmsSkusWithLiveOffer.length,
            missingOffer: wmsSkusWithoutOffer.length,
            ebayOnlySkus: ebayOnlySkus.length,
        },
        wmsSkusWithLiveOffer,   // these will update live listings on sync ✅
        wmsSkusWithoutOffer,    // these exist in WMS but eBay has no matching offer ❌
        ebayOnlySkus,           // on eBay but not in WMS
        allEbayOffers: ebayOffers,
    });
}
