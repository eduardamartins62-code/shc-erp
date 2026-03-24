import { supabase } from '../lib/supabase';
import { api } from './api';
import type { PurchaseOrder, ReceiptSession, ReceiptLine, DiscrepancyRecord } from '../types/receiving';

// ---------------------------------------------------------------------------
// Purchase Orders — Supabase-backed with mock fallback
// ---------------------------------------------------------------------------

const mockPOs: PurchaseOrder[] = [
    {
        id: 'PO-2024-0041',
        supplier: 'NutriLife Supplements',
        expectedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'overdue',
        items: [
            { id: 'poi-1', sku: 'NL-WHEY-CHOC', name: 'Whey Protein - Chocolate', expectedQty: 100, unit: 'ea', lotTracked: true },
            { id: 'poi-2', sku: 'NL-CREA-500', name: 'Creatine Monohydrate 500g', expectedQty: 50, unit: 'ea', lotTracked: true },
            { id: 'poi-3', sku: 'NL-SHAKER', name: 'NutriLife Shaker Bottle', expectedQty: 200, unit: 'ea', lotTracked: false },
        ]
    },
    {
        id: 'PO-2024-0045',
        supplier: 'Global Health Co.',
        expectedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        items: [
            { id: 'poi-4', sku: 'GH-VITA-C', name: 'Vitamin C 1000mg', expectedQty: 300, unit: 'btl', lotTracked: true },
            { id: 'poi-5', sku: 'GH-OMEGA-3', name: 'Omega 3 Fish Oil', expectedQty: 150, unit: 'btl', lotTracked: true },
        ]
    },
    {
        id: 'PO-2024-0048',
        supplier: 'EcoPack Solutions',
        expectedDate: new Date().toISOString(),
        status: 'partial',
        items: [
            { id: 'poi-6', sku: 'PKG-BOX-M', name: 'Shipping Box - Medium', expectedQty: 500, unit: 'box', lotTracked: false },
            { id: 'poi-7', sku: 'PKG-TAPE', name: 'Packing Tape 3"', expectedQty: 100, unit: 'roll', lotTracked: false },
        ]
    }
];

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    // Try Supabase purchase_orders table; fall back to mock data
    const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, purchase_order_items(*)')
        .order('expected_date', { ascending: true });

    if (error || !data || data.length === 0) {
        return [...mockPOs];
    }

    return data.map(po => ({
        id: po.id,
        supplier: po.supplier,
        expectedDate: po.expected_date,
        status: po.status,
        items: (po.purchase_order_items || []).map((item: any) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            expectedQty: item.expected_qty,
            unit: item.unit,
            lotTracked: item.lot_tracked
        }))
    }));
};

// ---------------------------------------------------------------------------
// Locations — fetched from Supabase locations table, filtered by warehouse
// ---------------------------------------------------------------------------

export const getLocations = async (warehouseId?: string): Promise<string[]> => {
    let query = supabase.from('locations').select('location_code, display_name').eq('is_active', true);
    if (warehouseId) query = query.eq('warehouse_id', warehouseId);
    query = query.order('location_code', { ascending: true });

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
        return ['Dock A', 'Dock B', 'Dock C', 'Bay 1-A', 'Bay 1-B', 'Bay 2-A', 'Bay 2-B', 'Staging Area'];
    }
    return data.map(l => l.display_name || l.location_code);
};

// ---------------------------------------------------------------------------
// Submit Receipt — updates PO status AND pushes stock into inventory
// ---------------------------------------------------------------------------

export const submitReceipt = async (
    session: ReceiptSession,
    lines: ReceiptLine[],
    discrepancies: DiscrepancyRecord[]
): Promise<{ success: boolean; poid?: string; newStatus?: string }> => {

    // 1. Receive each line into inventory via the main api
    const receivableLines = lines.filter(l => {
        const qty = parseInt(l.receivedQty);
        return !isNaN(qty) && qty > 0 && l.sku;
    });

    for (const line of receivableLines) {
        const qty = parseInt(line.receivedQty);
        const reason = `Receipt ${session.receiptNumber}${session.poId ? ` / PO ${session.poId}` : ''}`;
        const base = {
            sku: line.sku,
            warehouseId: session.warehouseId || 'WH-MAIN',
            lotNumber: line.lot || undefined,
            expirationDate: line.expDate || undefined,
            performedBy: 'Receiving',
            reason
        };

        try {
            if (line.locationSplits && line.locationSplits.length > 0) {
                const splitTotal = line.locationSplits.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
                const remainingQty = qty - splitTotal;

                // Main location gets whatever is left after splits
                if (remainingQty > 0) {
                    await api.receiveStock({
                        ...base,
                        locationCode: line.locationOverride || session.location || '',
                        quantity: remainingQty
                    });
                }

                // Each split goes to its own location
                for (const split of line.locationSplits) {
                    const splitQty = Number(split.qty);
                    if (splitQty > 0 && split.location) {
                        await api.receiveStock({
                            ...base,
                            locationCode: split.location,
                            quantity: splitQty
                        });
                    }
                }
            } else {
                await api.receiveStock({
                    ...base,
                    locationCode: line.locationOverride || session.location || '',
                    quantity: qty
                });
            }
        } catch (err) {
            console.error(`Failed to receive line ${line.sku}:`, err);
        }
    }

    // 2. Update PO status in Supabase if linked to a PO
    if (session.mode === 'po' && session.poId) {
        const allReceived = lines.every(l => {
            if (l.expectedQty === null) return true;
            const received = parseInt(l.receivedQty) || 0;
            return received >= l.expectedQty;
        });
        const newStatus: PurchaseOrder['status'] = allReceived ? 'received' : 'partial';

        await supabase
            .from('purchase_orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', session.poId);

        return { success: true, poid: session.poId, newStatus };
    }

    return { success: true };
};

// ---------------------------------------------------------------------------
// Update PO Status (hold / unhold / etc.)
// ---------------------------------------------------------------------------

export const updatePOStatus = async (
    poId: string,
    status: PurchaseOrder['status']
): Promise<void> => {
    await supabase
        .from('purchase_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', poId);
};
