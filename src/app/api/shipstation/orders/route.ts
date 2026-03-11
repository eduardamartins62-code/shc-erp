import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // In a real app with a DB, we would extract the user/tenant ID from the session
        // and look up their ShipStation credentials in the database.
        // For this proxy approach, we will expect the frontend to pass the Authorization header directly.

        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        // Fetch orders from ShipStation
        const response = await fetch('https://ssapi.shipstation.com/orders?orderStatus=awaiting_shipment', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: `ShipStation API Error: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('ShipStation Orders Error:', error);
        return NextResponse.json({ error: 'Internal server error while fetching orders' }, { status: 500 });
    }
}
