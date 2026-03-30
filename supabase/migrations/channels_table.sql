-- Migration: Create channels table
-- Replaces localStorage-based channel storage with a persistent Supabase table.

CREATE TABLE IF NOT EXISTS channels (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    channel             text NOT NULL,
    store_name          text NOT NULL,
    is_enabled          boolean NOT NULL DEFAULT false,
    default_warehouse_id text,
    notes               text,
    api_key             text,
    api_secret          text,
    oauth_token         text,
    auto_import_orders  boolean NOT NULL DEFAULT false,
    sync_inventory      boolean NOT NULL DEFAULT false,
    sync_tracking       boolean NOT NULL DEFAULT false,
    sync_shipped_orders boolean NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can perform all operations
CREATE POLICY "Allow all operations for authenticated users"
    ON channels
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
