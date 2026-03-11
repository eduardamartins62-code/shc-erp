import type { PurchaseOrder, ReceiptSession, ReceiptLine, DiscrepancyRecord } from '../types/receiving';

// Mock POs
let mockPOs: PurchaseOrder[] = [
    {
        id: 'PO-2024-0041',
        supplier: 'NutriLife Supplements',
        expectedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
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
        expectedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        status: 'pending',
        items: [
            { id: 'poi-4', sku: 'GH-VITA-C', name: 'Vitamin C 1000mg', expectedQty: 300, unit: 'btl', lotTracked: true },
            { id: 'poi-5', sku: 'GH-OMEGA-3', name: 'Omega 3 Fish Oil', expectedQty: 150, unit: 'btl', lotTracked: true },
        ]
    },
    {
        id: 'PO-2024-0048',
        supplier: 'EcoPack Solutions',
        expectedDate: new Date().toISOString(), // Today
        status: 'partial',
        items: [
            { id: 'poi-6', sku: 'PKG-BOX-M', name: 'Shipping Box - Medium', expectedQty: 500, unit: 'box', lotTracked: false },
            { id: 'poi-7', sku: 'PKG-TAPE', name: 'Packing Tape 3"', expectedQty: 100, unit: 'roll', lotTracked: false },
        ]
    }
];

const mockLocations = [
    'Dock A', 'Dock B', 'Dock C', 'Bay 1-A', 'Bay 1-B', 'Bay 2-A', 'Bay 2-B', 'Staging Area'
];

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockPOs]);
        }, 400);
    });
};

export const getLocations = async (): Promise<string[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockLocations]);
        }, 200);
    });
};

export const submitReceipt = async (
    session: ReceiptSession,
    lines: ReceiptLine[],
    discrepancies: DiscrepancyRecord[]
): Promise<{ success: boolean; poid?: string; newStatus?: string }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock update PO status if PO linked
            if (session.mode === 'po' && session.poId) {
                const poIndex = mockPOs.findIndex(p => p.id === session.poId);
                if (poIndex !== -1) {
                    const po = mockPOs[poIndex];
                    // Check if fully received
                    let allFullyReceived = true;
                    for (const item of po.items) {
                        const matchingLine = lines.find(l => l.itemId === item.id);
                        if (!matchingLine || !matchingLine.receivedQty || parseInt(matchingLine.receivedQty) < item.expectedQty) {
                            allFullyReceived = false;
                            break;
                        }
                    }

                    const newStatus = allFullyReceived ? 'received' : 'partial';
                    mockPOs[poIndex] = { ...po, status: newStatus };
                    resolve({ success: true, poid: po.id, newStatus });
                    return;
                }
            }

            resolve({ success: true });
        }, 800);
    });
};
