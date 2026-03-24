"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/settings';
import { DEFAULT_PERMISSIONS, DEFAULT_APP_ACCESS } from '../types/settings';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadAppUser(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (error || !data) return null;

        return {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            isAccountAdmin: data.is_account_admin ?? false,
            isActive: data.is_active,
            allowedWarehouses: data.allowed_warehouses ?? null,
            appAccess: { ...DEFAULT_APP_ACCESS, ...(data.app_access ?? {}) },
            permissions: { ...DEFAULT_PERMISSIONS, ...(data.permissions ?? {}) },
            createdAt: data.created_at,
            createdBy: data.created_by,
            updatedAt: data.updated_at,
            updatedBy: data.updated_by,
        };
    }

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setLoading(false);
            } else if (session?.user?.email) {
                const appUser = await loadAppUser(session.user.email);
                setCurrentUser(appUser);
                setLoading(false);
            } else {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function signIn(email: string, password: string): Promise<{ error?: string }> {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setLoading(false);
            return { error: error.message };
        }

        if (data.user?.email) {
            const appUser = await loadAppUser(data.user.email);
            if (!appUser) {
                await supabase.auth.signOut();
                setLoading(false);
                return { error: 'Your account is not set up in this system. Please contact your administrator.' };
            }
            setCurrentUser(appUser);
        }

        setLoading(false);
        return {};
    }

    async function signOut() {
        await supabase.auth.signOut();
        setCurrentUser(null);
    }

    return (
        <AuthContext.Provider value={{ currentUser, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
