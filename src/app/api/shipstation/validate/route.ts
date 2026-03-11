import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { apiKey, apiSecret } = body;

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Missing API credentials' }, { status: 400 });
        }

        const base64Credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

        // We use the tags or stores endpoint just to validate credentials are correct
        const response = await fetch('https://ssapi.shipstation.com/stores', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64Credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json({ error: 'Invalid API Key or Secret' }, { status: 401 });
            }
            return NextResponse.json({ error: `ShipStation API Error: ${response.statusText}` }, { status: response.status });
        }

        return NextResponse.json({ success: true, message: 'Credentials validated successfully' });

    } catch (error: any) {
        console.error('ShipStation Validation Error:', error);
        return NextResponse.json({ error: 'Internal server error while validating credentials' }, { status: 500 });
    }
}
