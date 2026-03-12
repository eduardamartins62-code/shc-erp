import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { InventoryItem, AuditLog, ReceiptFormData, AdjustmentFormData, TransferFormData, InventoryMovement, DailySnapshot } from '../types';
import { api } from '../services/api';

interface InventoryContextType {
    inventory: InventoryItem[];
    auditLogs: AuditLog[];
    movements: InventoryMovement[];
    snapshots: DailySnapshot[];
    loading: boolean;
    error: string | null;
    refreshInventory: () => Promise<void>;
    receiveStock: (data: ReceiptFormData) => Promise<void>;
    adjustStock: (data: AdjustmentFormData) => Promise<void>;
    transferStock: (data: TransferFormData) => Promise<void>;
    reverseMovement: (movementId: string) => Promise<void>;
    reserveInventory: (items: { sku: string, quantity: number }[], performedBy: string) => Promise<void>;
    releaseInventory: (items: { sku: string, quantity: number }[], performedBy: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshInventory = async () => {
        try {
            setLoading(true);
            setError(null);
            const [invData, auditData, movementData, snapshotData] = await Promise.all([
                api.getInventory(),
                api.getAuditLogs(),
                api.getInventoryMovements(),
                api.getDailySnapshots()
            ]);
            setInventory(invData);
            setAuditLogs(auditData);
            setMovements(movementData);
            setSnapshots(snapshotData);
        } catch (err: any) {
            setError(err.message || "Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshInventory();
    }, []);

    const receiveStock = async (data: ReceiptFormData) => {
        try {
            setLoading(true);
            setError(null);
            await api.receiveStock(data);
            await refreshInventory();
        } catch (err: any) {
            setError(err.message || 'Failed to receive stock');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const adjustStock = async (data: AdjustmentFormData) => {
        try {
            setLoading(true);
            setError(null);
            await api.adjustStock(data);
            await refreshInventory();
        } catch (err: any) {
            setError(err.message || 'Failed to adjust stock');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const transferStock = async (data: TransferFormData) => {
        try {
            setLoading(true);
            setError(null);
            await api.transferStock(data);
            await refreshInventory();
        } catch (err: any) {
            setError(err.message || 'Failed to transfer stock');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reverseMovement = async (movementId: string) => {
        try {
            setLoading(true);
            setError(null);
            await api.reverseMovement(movementId);
            await refreshInventory();
        } catch (err: any) {
            setError(err.message || 'Failed to reverse movement');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reserveInventory = async (items: { sku: string, quantity: number }[], performedBy: string) => {
        try {
            setLoading(true);
            await api.reserveInventory(items, performedBy);
            await refreshInventory();
        } catch (err: any) {
            setError(err.message || 'Failed to reserve inventory');
        } finally {
            setLoading(false);
        }
    };

    const releaseInventory = async (items: { sku: string, quantity: number }[], performedBy: string) => {
        try {
            setLoading(true);
            await api.releaseInventory(items, performedBy);
            await refreshInventory();
        } catch (err: any) {
            setError(err.message || 'Failed to release inventory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <InventoryContext.Provider
            value={{
                inventory,
                auditLogs,
                movements,
                snapshots,
                loading,
                error,
                refreshInventory,
                receiveStock,
                adjustStock,
                transferStock,
                reverseMovement,
                reserveInventory,
                releaseInventory
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
