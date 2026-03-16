import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }
        const response = await fetch('https://ssapi.shipstation.com/orders?orderStatus=shipped&pageSize=100', {
            method: 'GET',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            return NextResponse.json({ error: `ShipStation API Error: ${response.statusText}` }, { status: response.status });
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
