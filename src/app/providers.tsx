"use client";

import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ToastProvider } from '../context/ToastContext';
import { ProductProvider } from '../context/ProductContext';
import { InventoryProvider } from '../context/InventoryContext';
import { OrderProvider } from '../context/OrderContext';
import { TagsProvider } from '../context/TagsContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LocationProvider>
                <SettingsProvider>
                    <ToastProvider>
                        <ProductProvider>
                            <InventoryProvider>
                                <OrderProvider>
                                    <TagsProvider>
                                        {children}
                                    </TagsProvider>
                                </OrderProvider>
                            </InventoryProvider>
                        </ProductProvider>
                    </ToastProvider>
                </SettingsProvider>
            </LocationProvider>
        </AuthProvider>
    );
}
