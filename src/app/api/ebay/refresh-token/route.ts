import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/ebay/refresh-token
 * Body: { channelId: string }
 *
 * Uses the stored refresh token to obtain a new eBay access token,
 * then updates the channel row in Supabase with the new token + expiry.
 */
export async function POST(request: Request) {
    try {
        const { channelId } = await request.json();
        if (!channelId) {
            return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });
        }

        // Load current channel from Supabase
        const { data: channel, error: fetchError } = await supabaseAdmin
            .from('channels')
            .select('oauth_refresh_token')
            .eq('id', channelId)
            .single();

        if (fetchError || !channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        const refreshToken: string = channel.oauth_refresh_token;
        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token stored for this channel. Please re-authorize eBay.' }, { status: 400 });
        }

        const clientId = process.env.EBAY_CLIENT_ID!;
        const clientSecret = process.env.EBAY_CLIENT_SECRET!;
        const isSandbox = process.env.EBAY_USE_SANDBOX === 'true';

        const tokenUrl = isSandbox
            ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
            : 'https://api.ebay.com/identity/v1/oauth2/token';

        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory',
            }),
        });

        if (!tokenResponse.ok) {
            const err = await tokenResponse.text();
            console.error('[eBay Refresh] Token refresh failed:', err);
            return NextResponse.json({ error: `eBay token refresh failed: ${err}` }, { status: 400 });
        }

        const tokenData = await tokenResponse.json();
        const newAccessToken: string = tokenData.access_token;
        const expiresIn: number = tokenData.expires_in ?? 7200;
        const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        // Persist the new token + expiry to Supabase
        const { error: updateError } = await supabaseAdmin
            .from('channels')
            .update({
                oauth_token: newAccessToken,
                oauth_token_expires_at: newExpiresAt,
                updated_at: new Date().toISOString(),
            })
            .eq('id', channelId);

        if (updateError) {
            console.error('[eBay Refresh] Failed to save new token:', updateError);
            return NextResponse.json({ error: 'Token refreshed but failed to save to database' }, { status: 500 });
        }

        console.log(`[eBay Refresh] Token refreshed for channel ${channelId}, expires at ${newExpiresAt}`);
        return NextResponse.json({ success: true, expiresAt: newExpiresAt });

    } catch (err: any) {
        console.error('[eBay Refresh] Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
