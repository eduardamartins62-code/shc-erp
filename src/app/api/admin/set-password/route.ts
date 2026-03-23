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

    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // Look up the Supabase Auth user by email
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const authUser = listData.users.find(u => u.email === email);
    if (!authUser) {
        // User doesn't have an auth account yet — create one with this password
        const { error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 400 });
        }
        return NextResponse.json({ success: true, created: true });
    }

    // Update existing auth user's password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(authUser.id, { password });
    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
