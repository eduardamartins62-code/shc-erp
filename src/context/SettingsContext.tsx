import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Warehouse, ChannelConfig, SystemSettings } from '../types';
import { api } from '../services/api';
import { shipstationApi } from '../services/shipstationApi';

interface SettingsContextType {
    users: User[];
    warehouses: Warehouse[];
    channels: ChannelConfig[];
    systemSettings: SystemSettings | null;
    loading: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;

    // User Actions
    addUser: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;

    // Warehouse Actions
    addWarehouse: (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;

    // Channel Actions
    addChannel: (data: Omit<ChannelConfig, 'id'>) => Promise<void>;
    updateChannel: (id: string, data: Partial<ChannelConfig>) => Promise<void>;
    deleteChannel: (id: string) => Promise<void>;

    // System Actions
    updateSystemSettings: (data: Partial<SystemSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [channels, setChannels] = useState<ChannelConfig[]>([]);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const [usersData, warehousesData, channelsData, systemSettingsData] = await Promise.all([
                api.getUsers(),
                api.getWarehouses(),
                api.getChannels(),
                api.getSystemSettings()
            ]);
            setUsers(usersData);
            setWarehouses(warehousesData);
            setSystemSettings(systemSettingsData);

            // Fetch channels from localStorage if available, otherwise fallback to API default
            if (typeof window !== 'undefined') {
                const savedChannels = localStorage.getItem('shc_channels');
                if (savedChannels) {
                    try {
                        setChannels(JSON.parse(savedChannels));
                    } catch (e) {
                        console.error("Failed to parse channels", e);
                        setChannels(channelsData);
                    }
                } else {
                    setChannels(channelsData);
                    localStorage.setItem('shc_channels', JSON.stringify(channelsData));
                }
            } else {
                setChannels(channelsData);
            }

        } catch (err: any) {
            setError(err.message || "Failed to load settings data");
        } finally {
            setLoading(false);
        }
    };

    // Helper to persist to localStorage whenever channels change
    const updateChannelsState = (newChannels: ChannelConfig[]) => {
        setChannels(newChannels);
        if (typeof window !== 'undefined') {
            localStorage.setItem('shc_channels', JSON.stringify(newChannels));
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    // 15-minute background inventory sync for enabled channels
    useEffect(() => {
        const syncInterval = setInterval(async () => {
            for (const channel of channels) {
                if (channel.isEnabled && channel.syncInventory) {
                    try {
                        console.log(`[Background Worker] Syncing inventory for ${channel.channel}...`);
                        if (channel.channel === 'ShipStation' && channel.apiKey && channel.apiSecret) {
                            await shipstationApi.syncInventory(channel.apiKey, channel.apiSecret);
                        }
                        // Add other channels here in the future
                    } catch (err) {
                        console.error(`[Background Worker] Failed to sync inventory for ${channel.channel}:`, err);
                    }
                }
            }
        }, 15 * 60 * 1000); // 15 minutes

        return () => clearInterval(syncInterval);
    }, [channels]);

    // USER ACTIONS
    const addUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            await api.addUser(data);
            await refreshSettings();
        } catch (err: any) {
            setError(err.message || 'Failed to add user');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: string, data: Partial<User>) => {
        try {
            setLoading(true);
            setError(null);
            await api.updateUser(id, data);
            await refreshSettings();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // WAREHOUSE ACTIONS
    const addWarehouse = async (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            await api.addWarehouse(data);
            await refreshSettings();
        } catch (err: any) {
            setError(err.message || 'Failed to add warehouse');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateWarehouse = async (id: string, data: Partial<Warehouse>) => {
        try {
            setLoading(true);
            setError(null);
            await api.updateWarehouse(id, data);
            await refreshSettings();
        } catch (err: any) {
            setError(err.message || 'Failed to update warehouse');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // CHANNEL ACTIONS
    const addChannel = async (data: Omit<ChannelConfig, 'id'>) => {
        try {
            setLoading(true);
            setError(null);
            const newChannel = await api.addChannel(data);
            updateChannelsState([...channels, newChannel]);
        } catch (err: any) {
            setError(err.message || 'Failed to add channel');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateChannel = async (id: string, data: Partial<ChannelConfig>) => {
        try {
            setLoading(true);
            setError(null);
            const updatedChannel = await api.updateChannel(id, data);
            updateChannelsState(channels.map(c => c.id === id ? updatedChannel : c));
        } catch (err: any) {
            setError(err.message || 'Failed to update channel');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteChannel = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            await api.deleteChannel(id);
            updateChannelsState(channels.filter(c => c.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete channel');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // SYSTEM SETTINGS ACTIONS
    const updateSystemSettings = async (data: Partial<SystemSettings>) => {
        try {
            setLoading(true);
            setError(null);
            await api.updateSystemSettings(data);
            await refreshSettings();
        } catch (err: any) {
            setError(err.message || 'Failed to update system settings');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                users,
                warehouses,
                channels,
                systemSettings,
                loading,
                error,
                refreshSettings,
                addUser,
                updateUser,
                addWarehouse,
                updateWarehouse,
                addChannel,
                updateChannel,
                deleteChannel,
                updateSystemSettings
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
