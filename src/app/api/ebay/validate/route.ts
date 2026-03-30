import { NextResponse } from 'next/server';

const EBAY_BASE = process.env.EBAY_USE_SANDBOX === 'true'
    ? 'https://api.sandbox.ebay.com'
    : 'https://api.ebay.com';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { oauthToken } = body;

        if (!oauthToken) {
            return NextResponse.json({ error: 'Missing eBay OAuth token' }, { status: 400 });
        }

        // Call the eBay Sell Inventory API to verify the token is valid
        const response = await fetch(
            `${EBAY_BASE}/sell/inventory/v1/inventory_item?limit=1`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${oauthToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log(`[eBay Validate] Response: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
            return NextResponse.json({ error: 'Invalid or expired eBay OAuth token. Please generate a new User Access Token from the eBay Developer Portal.' }, { status: 401 });
        }

        if (response.status === 403) {
            return NextResponse.json({ error: 'eBay token does not have the required sell.inventory scope. Please add https://api.ebay.com/oauth/api_scope/sell.inventory in OAuth Scopes on the eBay Developer Portal, then regenerate the token.' }, { status: 403 });
        }

        // 400 from the Sell Inventory API almost always means the sell.inventory scope is missing
        if (response.status === 400) {
            return NextResponse.json({ error: 'eBay rejected the request (400). This usually means the sell.inventory scope is missing from your token. Go to eBay Developer Portal → Application Keys → OAuth Scopes, add https://api.ebay.com/oauth/api_scope/sell.inventory, then sign in again to generate a new token.' }, { status: 400 });
        }

        // 200 or 204 (no items yet) both mean the token is valid
        if (response.ok || response.status === 204) {
            return NextResponse.json({ success: true, message: 'eBay credentials validated successfully' });
        }

        return NextResponse.json({ error: `eBay API error (${response.status}): ${response.statusText}` }, { status: response.status });

    } catch (error: any) {
        console.error('[eBay Validate] Error:', error);
        return NextResponse.json({ error: 'Internal server error while validating eBay credentials' }, { status: 500 });
    }
}
