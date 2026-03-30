import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * GET /api/ebay/callback
 *
 * eBay OAuth 2.0 redirect handler.
 * eBay redirects here after the user authorises the app, sending ?code=...
 * This route exchanges the authorisation code for a User Access Token and
 * displays it so the user can copy it into the WMS Channels settings.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const channelId = searchParams.get('state') ?? '';

    if (error) {
        return htmlResponse(`
            <h2>❌ eBay Authorization Declined</h2>
            <p>eBay returned an error: <strong>${error}</strong></p>
            <p><a href="/wms/settings/channels">← Back to Channels</a></p>
        `);
    }

    if (!code) {
        return htmlResponse(`
            <h2>❌ No Authorization Code</h2>
            <p>eBay did not return an authorization code. Please try again.</p>
            <p><a href="/wms/settings/channels">← Back to Channels</a></p>
        `);
    }

    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const ruName = process.env.EBAY_RUNAME;
    const isSandbox = process.env.EBAY_USE_SANDBOX === 'true';

    if (!clientId || !clientSecret || !ruName) {
        return htmlResponse(`
            <h2>❌ Missing Configuration</h2>
            <p>EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, or EBAY_RUNAME is not set in the server environment.</p>
            <p><a href="/wms/settings/channels">← Back to Channels</a></p>
        `);
    }

    const tokenUrl = isSandbox
        ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
        : 'https://api.ebay.com/identity/v1/oauth2/token';

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: ruName,
            }),
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error('[eBay Callback] Token exchange failed:', errText);
            return htmlResponse(`
                <h2>❌ Token Exchange Failed</h2>
                <p>eBay returned status <strong>${tokenResponse.status}</strong>:</p>
                <pre style="background:#fef2f2;padding:12px;border-radius:6px;font-size:12px;overflow:auto">${errText}</pre>
                <p><a href="/wms/settings/channels">← Back to Channels</a></p>
            `);
        }

        const tokenData = await tokenResponse.json();
        const accessToken: string = tokenData.access_token;
        const expiresInHours = Math.floor((tokenData.expires_in ?? 0) / 3600);

        console.log('[eBay Callback] Token exchange successful');

        // Redirect back to channels page with token + channelId so the UI can auto-save it
        const redirectUrl = `/wms/settings/channels?ebay_token=${encodeURIComponent(accessToken)}&ebay_channel_id=${encodeURIComponent(channelId)}&ebay_expires_in=${tokenData.expires_in ?? 0}`;
        return NextResponse.redirect(new URL(redirectUrl, request.url));

    } catch (err: any) {
        console.error('[eBay Callback] Unexpected error:', err);
        return htmlResponse(`
            <h2>❌ Unexpected Error</h2>
            <p>${err.message}</p>
            <p><a href="/wms/settings/channels">← Back to Channels</a></p>
        `);
    }
}

function htmlResponse(body: string): Response {
    return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>eBay Authorization — SHC ERP</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      padding: 2.5rem;
      max-width: 640px;
      width: 100%;
    }
    h2 { margin: 0 0 0.75rem; font-size: 1.4rem; color: #111; }
    p  { color: #555; line-height: 1.6; margin: 0.5rem 0; }
    #token-box {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 14px;
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      color: #333;
      margin: 1.25rem 0 0.75rem;
      max-height: 140px;
      overflow-y: auto;
    }
    button {
      background: #b91c1c;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.6rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #991b1b; }
    a { color: #b91c1c; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .meta { font-size: 0.8rem; color: #888; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">${body}</div>
</body>
</html>`,
        { headers: { 'Content-Type': 'text/html' } }
    );
}
