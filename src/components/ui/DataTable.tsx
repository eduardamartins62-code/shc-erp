import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

export type FilterType = 'text' | 'select' | 'date-range' | 'number-range';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean; // Defaults to true
    // Deprecated filter properties kept for backward compatibility to avoid TS errors
    type?: FilterType | string;
    filterable?: boolean;
    options?: string[];
    render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
    selectable?: boolean;
    rowKey?: keyof T | ((row: T) => string); // Default is 'id'
    selectedKeys?: Set<string>;
    onSelectionChange?: (keys: Set<string>) => void;
}

// Matches a strict number: optional minus, digits, optional decimal
const isNumericString = (val: unknown): boolean => {
    if (typeof val === 'number') return true;
    if (typeof val !== 'string') return false;
    return /^-?\d+(\.\d+)?$/.test(val.trim());
};

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    onRowClick,
    selectable = false,
    rowKey = 'id',
    selectedKeys = new Set(),
    onSelectionChange
}: DataTableProps<T>) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

    // Cycle: none → asc → desc → none
    const handleSort = (key: string) => {
        if (sortColumn !== key) {
            setSortColumn(key);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else if (sortDirection === 'desc') {
            setSortColumn(null);
            setSortDirection(null);
        } else {
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Nulls/undefined always sink to the bottom
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Booleans: true before false on asc, false before true on desc
            if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                if (aVal === bVal) return 0;
                return sortDirection === 'asc'
                    ? (aVal ? -1 : 1)   // true first
                    : (aVal ? 1 : -1);  // false first
            }

            // Strict numeric strings (e.g. "42", "3.14", "-7") — compare as numbers
            if (isNumericString(aVal) && isNumericString(bVal)) {
                const diff = Number(aVal) - Number(bVal);
                return sortDirection === 'asc' ? diff : -diff;
            }

            // Date strings: ISO-8601 dates sort correctly as strings; also handle Date objects
            if (aVal instanceof Date && bVal instanceof Date) {
                return sortDirection === 'asc'
                    ? aVal.getTime() - bVal.getTime()
                    : bVal.getTime() - aVal.getTime();
            }

            // Fallback: case-insensitive string comparison
            const aStr = typeof aVal === 'string' ? aVal.toLowerCase() : String(aVal).toLowerCase();
            const bStr = typeof bVal === 'string' ? bVal.toLowerCase() : String(bVal).toLowerCase();

            if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortColumn, sortDirection]);

    const getRowKey = (row: T): string => {
        if (typeof rowKey === 'function') return rowKey(row);
        return String(row[rowKey as keyof T]);
    };

    const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onSelectionChange) return;
        if (e.target.checked) {
            onSelectionChange(new Set(sortedData.map(getRowKey)));
        } else {
            onSelectionChange(new Set());
        }
    };

    const toggleRow = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        e.stopPropagation();
        if (!onSelectionChange) return;
        const newSet = new Set(selectedKeys);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        onSelectionChange(newSet);
    };

    const isAllSelected = sortedData.length > 0 && Array.from(selectedKeys).filter(k => sortedData.some(r => getRowKey(r) === k)).length === sortedData.length;
    const isIndeterminate = selectedKeys.size > 0 && selectedKeys.size < sortedData.length;

    return (
        <div className="table-container" style={{ width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr>
                        {selectable && (
                            <th style={{ backgroundColor: 'var(--color-primary-dark)', width: '40px', padding: '1rem 0.5rem 1rem 1.5rem', borderBottom: '2px solid var(--color-border)' }}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleAll}
                                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>
                        )}
                        {columns.map(col => {
                            const isSortable = col.sortable !== false;
                            const isActive = sortColumn === col.key;
                            const dir = isActive ? sortDirection : null;

                            return (
                                <th
                                    key={col.key as string}
                                    title={
                                        !isSortable ? undefined
                                            : dir === 'asc' ? 'Sorted A → Z  (click for Z → A)'
                                            : dir === 'desc' ? 'Sorted Z → A  (click to clear)'
                                            : 'Click to sort A → Z'
                                    }
                                    style={{
                                        backgroundColor: 'var(--color-primary-dark)',
                                        color: 'var(--color-white)',
                                        padding: '1rem',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        whiteSpace: 'nowrap',
                                        verticalAlign: 'bottom',
                                        borderBottom: '2px solid var(--color-border)',
                                        cursor: isSortable ? 'pointer' : 'default',
                                        userSelect: 'none',
                                    }}
                                    onClick={() => isSortable && handleSort(col.key as string)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>{col.label}</span>
                                        {isSortable && (
                                            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                {dir === 'asc' ? (
                                                    <ArrowUp size={14} style={{ color: '#fff' }} />
                                                ) : dir === 'desc' ? (
                                                    <ArrowDown size={14} style={{ color: '#fff' }} />
                                                ) : (
                                                    <ChevronsUpDown size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => {
                        const key = getRowKey(row);
                        const isSelected = selectedKeys.has(key);

                        return (
                            <tr
                                key={key || index}
                                onClick={() => onRowClick && onRowClick(row)}
                                style={{
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    transition: 'background-color 0.15s ease',
                                    backgroundColor: isSelected ? 'rgba(193, 39, 45, 0.05)' : 'transparent'
                                }}
                                onMouseOver={(e) => {
                                    if (isSelected) return;
                                    if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-bg-light)';
                                }}
                                onMouseOut={(e) => {
                                    if (isSelected) return;
                                    if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {selectable && (
                                    <td style={{ padding: '1rem 0.5rem 1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={isSelected} onChange={(e) => toggleRow(e, key)} style={{ cursor: 'pointer' }} />
                                    </td>
                                )}
                                {columns.map(col => (
                                    <td key={col.key as string} style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--color-border)',
                                        color: 'var(--color-charcoal)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {col.render ? col.render(row[col.key as string], row) : row[col.key as string] as React.ReactNode}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    {sortedData.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                No records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
