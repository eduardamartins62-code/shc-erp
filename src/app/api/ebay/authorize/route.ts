import { NextResponse } from 'next/server';

/**
 * GET /api/ebay/authorize?channelId=xxx
 *
 * Redirects the user to eBay's OAuth consent page with the correct
 * sell.inventory scope. After consent, eBay redirects to /api/ebay/callback.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId') ?? '';

    const clientId = process.env.EBAY_CLIENT_ID;
    const ruName = process.env.EBAY_RUNAME;
    const isSandbox = process.env.EBAY_USE_SANDBOX === 'true';

    if (!clientId || !ruName) {
        return NextResponse.json({ error: 'EBAY_CLIENT_ID or EBAY_RUNAME not configured' }, { status: 500 });
    }

    const baseUrl = isSandbox
        ? 'https://auth.sandbox.ebay.com/oauth2/authorize'
        : 'https://auth.ebay.com/oauth2/authorize';

    const scopes = [
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
    ].join(' ');

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: ruName,
        response_type: 'code',
        scope: scopes,
        state: channelId, // passed back in callback so we know which channel to update
    });

    return NextResponse.redirect(`${baseUrl}?${params.toString()}`);
}
