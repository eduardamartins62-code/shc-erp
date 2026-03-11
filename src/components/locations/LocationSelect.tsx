import React, { useMemo } from 'react';
import { useLocations } from '../../context/LocationContext';
import { useProducts } from '../../context/ProductContext';
import { useSettings } from '../../context/SettingsContext';

interface Props {
    warehouseId: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    style?: React.CSSProperties;
    disabled?: boolean;
}

const LocationSelect: React.FC<Props> = ({ warehouseId, value, onChange, required, style, disabled }) => {
    const { locations } = useLocations();
    const { inventoryLocations } = useProducts();
    const { warehouses } = useSettings();

    const options = useMemo(() => {
        if (!warehouseId) return [];

        // Find warehouse to get the name/code
        const warehouse = warehouses.find(w => w.id === warehouseId);
        const whNameOrCode = warehouse ? (warehouse.warehouseCode || warehouse.warehouseName) : '';

        // Filter active locations by warehouse
        const activeLocations = locations.filter(
            loc => loc.isActive && loc.warehouseId === warehouseId
        );

        return activeLocations.map(loc => {
            // Check stock status
            const hasStock = inventoryLocations.some(
                inv => inv.warehouseName === whNameOrCode &&
                    inv.locationCode === loc.locationCode &&
                    inv.qtyOnHand > 0
            );

            // Format option label
            const stockStr = hasStock ? '📦 Has Stock' : '⭕ Empty';
            const typeStr = loc.type ? `[${loc.type}]` : '';
            const label = `${loc.locationCode} ${typeStr} - ${stockStr}`;

            return {
                value: loc.locationCode,
                label
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, [warehouseId, locations, inventoryLocations, warehouses]);

    const selectStyle: React.CSSProperties = {
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
        backgroundColor: disabled ? 'var(--color-bg-light)' : 'var(--color-white)',
        fontSize: '0.875rem',
        ...style
    };

    return (
        <select
            value={value}
            onChange={onChange}
            required={required}
            style={selectStyle}
            disabled={disabled}
        >
            <option value="">Select Location...</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

export default LocationSelect;
