-- Migration: Channel inventory buffer % + per-SKU channel exclusions
-- Run this in Supabase SQL Editor

-- 1. Add inventory buffer % column to channels table
ALTER TABLE channels
    ADD COLUMN IF NOT EXISTS inventory_buffer_percent SMALLINT NOT NULL DEFAULT 0
    CONSTRAINT inventory_buffer_percent_range CHECK (inventory_buffer_percent >= 0 AND inventory_buffer_percent <= 100);

-- 2. Create per-SKU channel exclusion table
-- A row here means that SKU is EXCLUDED (will NOT sync) on that channel.
CREATE TABLE IF NOT EXISTS product_channel_exclusions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_sku       TEXT NOT NULL,
    channel_id        UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_sku, channel_id)
);

-- 3. Index for fast lookups by channel (used on every sync run)
CREATE INDEX IF NOT EXISTS idx_pce_channel_id ON product_channel_exclusions(channel_id);

-- 4. Enable RLS
ALTER TABLE product_channel_exclusions ENABLE ROW LEVEL SECURITY;

-- 5. Allow authenticated users full access (same policy as other WMS tables)
CREATE POLICY "Authenticated users can manage exclusions"
    ON product_channel_exclusions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
