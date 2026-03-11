import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product, InventoryLocation, BundleComponent, COGSHistoryLog, ProductActivityLog } from '../types/products';

interface ProductContextType {
    products: Product[];
    inventoryLocations: InventoryLocation[];
    bundleComponents: BundleComponent[];
    cogsHistory: COGSHistoryLog[];
    activityLogs: ProductActivityLog[];

    getProducts: () => Product[];
    getProduct: (id: string) => Product | undefined;
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
    updateProduct: (id: string, product: Partial<Product>) => void;

    getInventoryLocations: (productId: string) => InventoryLocation[];

    getBundleComponents: (bundleId: string) => BundleComponent[];
    addBundleComponent: (component: Omit<BundleComponent, 'id'>) => void;
    removeBundleComponent: (id: string) => void;

    calculateBundleInventory: (bundleId: string) => number;
    calculateSimpleInventory: (productId: string) => { qtyOnHand: number; qtyReserved: number; qtyAvailable: number };
    calculateCOGS: (sku: string) => number;

    logCostChange: (sku: string, newCost: number, notes?: string) => void;
    logProductActivity: (sku: string, action: string, details: string, module: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initial Mock Data
const initialProducts: Product[] = [
    {
        id: 'p1',
        sku: 'WHEY-ISO-CHOC',
        type: 'simple',
        name: 'Whey Isolate - Chocolate',
        brand: 'Super Health',
        category: 'Protein',
        costOfGoods: 15.50,
        msrpPrice: 39.99,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'p2',
        sku: 'CREA-MONO-500',
        type: 'simple',
        name: 'Creatine Monohydrate 500g',
        brand: 'Super Health',
        category: 'Performance',
        costOfGoods: 8.00,
        msrpPrice: 19.99,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'b1',
        sku: 'MUSCLE-BUILD-STACK',
        type: 'bundle',
        name: 'Muscle Builder Stack',
        brand: 'Super Health',
        category: 'Bundles',
        msrpPrice: 49.99,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

const initialInventory: InventoryLocation[] = [
    {
        id: 'loc1',
        productId: 'p1',
        warehouseName: 'Main Warehouse',
        locationCode: 'A1-B2',
        qtyOnHand: 150,
        qtyReserved: 10,
        qtyAvailable: 140,
        lotReceiveCost: 13.00,
        lastUpdatedAt: new Date().toISOString()
    },
    {
        id: 'loc2',
        productId: 'p2',
        warehouseName: 'Main Warehouse',
        locationCode: 'C3-D4',
        qtyOnHand: 200,
        qtyReserved: 50,
        qtyAvailable: 150,
        lastUpdatedAt: new Date().toISOString()
    }
];

const initialBundleComponents: BundleComponent[] = [
    {
        id: 'bc1',
        bundleProductId: 'b1',
        componentProductId: 'p1', // Whey
        quantityRequiredPerBundle: 1
    },
    {
        id: 'bc2',
        bundleProductId: 'b1',
        componentProductId: 'p2', // Creatine
        quantityRequiredPerBundle: 1
    }
];

const initialCOGSHistory: COGSHistoryLog[] = [
    {
        id: 'cogs1',
        sku: 'WHEY-ISO-CHOC',
        previousCost: 13.00,
        newCost: 15.50,
        changedBy: 'Admin User',
        changedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        notes: 'Supplier price increase'
    }
];

const initialActivityLogs: ProductActivityLog[] = [
    {
        id: 'act1',
        sku: 'WHEY-ISO-CHOC',
        action: 'Cost Updated',
        details: 'Cost changed from $13.00 → $15.50',
        user: 'Admin User',
        module: 'COGS',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
    }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [inventoryLocations] = useState<InventoryLocation[]>(initialInventory);
    const [bundleComponents, setBundleComponents] = useState<BundleComponent[]>(initialBundleComponents);
    const [cogsHistory, setCogsHistory] = useState<COGSHistoryLog[]>(initialCOGSHistory);
    const [activityLogs, setActivityLogs] = useState<ProductActivityLog[]>(initialActivityLogs);

    const getProducts = () => products;

    const getProduct = (id: string) => products.find(p => p.id === id);

    const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
        const newProduct: Product = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
    };

    const updateProduct = (id: string, data: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
    };

    const getInventoryLocations = (productId: string) => inventoryLocations.filter(loc => loc.productId === productId);

    const getBundleComponents = (bundleId: string) => bundleComponents.filter(bc => bc.bundleProductId === bundleId);

    const addBundleComponent = (data: Omit<BundleComponent, 'id'>) => {
        const newComp: BundleComponent = {
            ...data,
            id: crypto.randomUUID()
        };
        setBundleComponents(prev => [...prev, newComp]);
    };

    const removeBundleComponent = (id: string) => {
        setBundleComponents(prev => prev.filter(bc => bc.id !== id));
    };

    const calculateSimpleInventory = (productId: string) => {
        const locs = getInventoryLocations(productId);
        return locs.reduce(
            (acc, loc) => ({
                qtyOnHand: acc.qtyOnHand + loc.qtyOnHand,
                qtyReserved: acc.qtyReserved + loc.qtyReserved,
                qtyAvailable: acc.qtyAvailable + loc.qtyAvailable
            }),
            { qtyOnHand: 0, qtyReserved: 0, qtyAvailable: 0 }
        );
    };

    const calculateBundleInventory = (bundleId: string) => {
        const components = getBundleComponents(bundleId);
        if (components.length === 0) return 0;

        let maxBundles = Infinity;

        for (const comp of components) {
            const inv = calculateSimpleInventory(comp.componentProductId);
            const possibleBundles = Math.floor(inv.qtyAvailable / comp.quantityRequiredPerBundle);
            if (possibleBundles < maxBundles) {
                maxBundles = possibleBundles;
            }
        }

        return maxBundles === Infinity ? 0 : maxBundles;
    };
    const calculateCOGS = (sku: string) => {
        const product = products.find(p => p.sku === sku);
        if (!product || product.type !== 'simple' || !product.costOfGoods) return 0;
        const inv = calculateSimpleInventory(product.id);
        return product.costOfGoods * inv.qtyOnHand;
    };

    const logProductActivity = (sku: string, action: string, details: string, module: string) => {
        const newLog: ProductActivityLog = {
            id: crypto.randomUUID(),
            sku,
            action,
            details,
            user: 'Current User',
            module,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const logCostChange = (sku: string, newCost: number, notes?: string) => {
        const product = products.find(p => p.sku === sku);
        if (!product) return;

        const previousCost = product.costOfGoods || 0;
        const newCogsLog: COGSHistoryLog = {
            id: crypto.randomUUID(),
            sku,
            previousCost,
            newCost,
            changedBy: 'Current User',
            changedAt: new Date().toISOString(),
            notes
        };
        setCogsHistory(prev => [newCogsLog, ...prev]);

        updateProduct(product.id, { costOfGoods: newCost });

        logProductActivity(
            sku,
            'Cost Updated',
            `Cost changed from $${previousCost.toFixed(2)} → $${newCost.toFixed(2)}`,
            'COGS'
        );
    };

    return (
        <ProductContext.Provider value={{
            products,
            inventoryLocations,
            bundleComponents,
            cogsHistory,
            activityLogs,
            getProducts,
            getProduct,
            addProduct,
            updateProduct,
            getInventoryLocations,
            getBundleComponents,
            addBundleComponent,
            removeBundleComponent,
            calculateBundleInventory,
            calculateSimpleInventory,
            calculateCOGS,
            logCostChange,
            logProductActivity
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
};
