import React, { useMemo } from 'react';
import { useLocations } from '../../context/LocationContext';
import { useInventory } from '../../context/InventoryContext';

interface Props {
    warehouseId: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    style?: React.CSSProperties;
    disabled?: boolean;
    /** When provided, only locations that have stock for this SKU are shown */
    skuFilter?: string;
}

const LocationSelect: React.FC<Props> = ({
    warehouseId, value, onChange, required, style, disabled, skuFilter,
}) => {
    const { locations } = useLocations();
    const { inventory } = useInventory();

    const options = useMemo(() => {
        if (!warehouseId) return [];

        const activeLocations = locations.filter(
            loc => loc.isActive && loc.warehouseId === warehouseId
        );

        return activeLocations
            .map(loc => {
                // Determine stock status using inventory items (reliable warehouseId + locationCode match)
                const itemsHere = inventory.filter(
                    inv => inv.warehouseId === warehouseId &&
                        inv.locationCode === loc.locationCode &&
                        (inv.quantityOnHand - inv.quantityReserved) > 0
                );

                // If skuFilter is set, only show locations that have that SKU
                if (skuFilter) {
                    const skuHere = itemsHere.some(inv => inv.id === skuFilter);
                    if (!skuHere) return null;
                }

                const hasStock = itemsHere.length > 0;
                const typeStr = loc.type ? ` [${loc.type}]` : '';
                const stockStr = hasStock ? '📦' : '⭕';
                const label = `${stockStr} ${loc.locationCode}${typeStr}`;

                return { value: loc.locationCode, label };
            })
            .filter(Boolean)
            .sort((a, b) => a!.label.localeCompare(b!.label)) as { value: string; label: string }[];
    }, [warehouseId, locations, inventory, skuFilter]);

    const selectStyle: React.CSSProperties = {
        padding: '0.625rem 0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        backgroundColor: disabled ? 'var(--color-bg-light)' : 'var(--color-white)',
        fontSize: '0.875rem',
        width: '100%',
        ...style,
    };

    return (
        <select value={value} onChange={onChange} required={required} style={selectStyle} disabled={disabled}>
            <option value="">Select location…</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
};

export default LocationSelect;
