import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
        // If not configured, assume account exists so reset attempt proceeds normally
        return NextResponse.json({ exists: true });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) return NextResponse.json({ exists: true }); // fail open

    const exists = data.users.some(u => u.email === email);
    return NextResponse.json({ exists });
}
