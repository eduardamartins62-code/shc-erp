import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' },
            { status: 500 }
        );
    }

    const { email, name, redirectTo } = await req.json();

    if (!email) {
        return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // Use the service-role client — this key is server-only and never sent to the browser
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name ?? '' },
        redirectTo: redirectTo ?? `${supabaseUrl.replace('.supabase.co', '')}/reset-password`,
    });

    if (error) {
        // "User already registered" is non-fatal — they already have an auth account
        if (error.message?.toLowerCase().includes('already registered')) {
            return NextResponse.json({ success: true, alreadyExists: true });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
