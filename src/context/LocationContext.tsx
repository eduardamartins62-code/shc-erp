import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { WarehouseLocation } from '../types';

interface LocationContextType {
    locations: WarehouseLocation[];
    loading: boolean;
    error: string | null;
    refreshLocations: () => Promise<void>;
    addLocation: (data: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateLocation: (id: string, data: Partial<WarehouseLocation>) => Promise<void>;
    bulkImportLocations: (locations: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
    isLocationCodeUnique: (warehouseId: string, locationCode: string, excludeId?: string) => boolean;
    generateLocationCode: (warehousePrefix: string, aisle: string, section: string, shelf: string, bin: string) => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locations, setLocations] = useState<WarehouseLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshLocations = async () => {
        try {
            setLoading(true);
            const data = await api.getLocations();
            setLocations(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLocations();
    }, []);

    const addLocation = async (data: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            await api.addLocation(data);
            await refreshLocations();
        } catch (err: any) {
            setError(err.message || 'Failed to add location');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateLocation = async (id: string, data: Partial<WarehouseLocation>) => {
        try {
            setLoading(true);
            await api.updateLocation(id, data);
            await refreshLocations();
        } catch (err: any) {
            setError(err.message || 'Failed to update location');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const bulkImportLocations = async (newLocations: Omit<WarehouseLocation, 'id' | 'createdAt' | 'updatedAt'>[]) => {
        try {
            setLoading(true);
            await api.bulkImportLocations(newLocations);
            await refreshLocations();
        } catch (err: any) {
            setError(err.message || 'Failed to import locations');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const isLocationCodeUnique = (warehouseId: string, locationCode: string, excludeId?: string) => {
        return !locations.some(loc =>
            loc.warehouseId === warehouseId &&
            loc.locationCode === locationCode &&
            loc.id !== excludeId
        );
    };

    const generateLocationCode = (warehousePrefix: string, aisle: string, section: string, shelf: string, bin: string) => {
        const parts = [];
        if (warehousePrefix) parts.push(warehousePrefix);

        let m1 = '';
        if (aisle) m1 += aisle;
        if (section) m1 += section;
        if (m1) parts.push(m1);

        let m2 = '';
        if (shelf) m2 += shelf;
        if (bin) m2 += bin;
        if (m2) parts.push(m2);

        return parts.filter(Boolean).join('-');
    };

    return (
        <LocationContext.Provider value={{
            locations,
            loading,
            error,
            refreshLocations,
            addLocation,
            updateLocation,
            bulkImportLocations,
            isLocationCodeUnique,
            generateLocationCode
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocations = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocations must be used within a LocationProvider');
    }
    return context;
};
