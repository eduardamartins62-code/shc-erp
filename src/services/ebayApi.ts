/**
 * eBay Sell Inventory API integration.
 *
 * Credentials stored in ChannelConfig:
 *   oauthToken – eBay User Access Token (OAuth 2.0, obtained from eBay Developer Portal)
 *   apiKey     – App ID / Client ID (stored for reference)
 *
 * eBay Sell Inventory API docs:
 *   https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
 */

export interface EbaySyncResult {
    sku: string;
    quantity: number;
    success: boolean;
    error?: string;
}

export interface EbaySyncSummary {
    synced: number;
    failed: number;
    results: EbaySyncResult[];
    syncedAt: string;
}

export const ebayApi = {
    /**
     * Validates an eBay OAuth User Token by calling the inventory API.
     */
    validateCredentials: async (oauthToken: string): Promise<boolean> => {
        if (!oauthToken) throw new Error('Missing eBay OAuth token.');

        const response = await fetch('/api/ebay/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oauthToken })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `eBay validation failed (${response.status})`);
        }

        return true;
    },

    /**
     * Pushes aggregated WMS inventory quantities to eBay via the backend proxy.
     * Quantities are summed per SKU across all warehouse locations, then the
     * channel's buffer % and per-SKU exclusions are applied server-side.
     */
    syncInventory: async (oauthToken: string, channelId: string): Promise<EbaySyncSummary> => {
        if (!oauthToken) throw new Error('Missing eBay OAuth token.');

        const response = await fetch('/api/ebay/sync-inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${oauthToken}`
            },
            body: JSON.stringify({ channelId })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `eBay inventory sync failed (${response.status})`);
        }

        return response.json() as Promise<EbaySyncSummary>;
    }
};
