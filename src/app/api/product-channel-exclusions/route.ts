import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/product-channel-exclusions?sku=XXX
 * Returns an array of channel_ids that are excluded (disabled) for the given SKU.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    if (!sku) {
        return NextResponse.json({ error: 'Missing sku query param' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('product_channel_exclusions')
        .select('channel_id')
        .eq('product_sku', sku);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ excludedChannelIds: (data ?? []).map(r => r.channel_id) });
}

/**
 * POST /api/product-channel-exclusions
 * Body: { sku: string, channelId: string }
 * Excludes (disables sync) a SKU from a channel.
 */
export async function POST(request: Request) {
    const { sku, channelId } = await request.json();
    if (!sku || !channelId) {
        return NextResponse.json({ error: 'Missing sku or channelId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('product_channel_exclusions')
        .upsert({ product_sku: sku, channel_id: channelId }, { onConflict: 'product_sku,channel_id' });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

/**
 * DELETE /api/product-channel-exclusions
 * Body: { sku: string, channelId: string }
 * Re-enables sync for a SKU on a channel (removes the exclusion).
 */
export async function DELETE(request: Request) {
    const { sku, channelId } = await request.json();
    if (!sku || !channelId) {
        return NextResponse.json({ error: 'Missing sku or channelId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('product_channel_exclusions')
        .delete()
        .eq('product_sku', sku)
        .eq('channel_id', channelId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
