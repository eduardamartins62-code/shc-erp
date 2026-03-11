import React from 'react';
import type { OrderStatus, PaymentStatus } from '../types';

interface StatusBadgeProps {
    status: OrderStatus | PaymentStatus;
    type?: 'fulfillment' | 'payment';
    size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'fulfillment', size = 'sm' }) => {
    let bgColor = 'var(--color-bg-light)';
    let textColor = 'var(--color-text-muted)';
    let borderColor = 'var(--color-border)';

    if (type === 'fulfillment') {
        switch (status) {
            case 'New':
                bgColor = 'rgba(234, 179, 8, 0.1)';
                textColor = '#ca8a04';
                borderColor = 'rgba(234, 179, 8, 0.2)';
                break;
            case 'Allocated':
                bgColor = 'rgba(59, 130, 246, 0.1)';
                textColor = '#2563eb';
                borderColor = 'rgba(59, 130, 246, 0.2)';
                break;
            case 'Picking':
            case 'Packed':
                bgColor = 'rgba(193, 39, 45, 0.1)'; // SHC Red tint
                textColor = 'var(--color-shc-red)';
                borderColor = 'rgba(193, 39, 45, 0.2)';
                break;
            case 'Shipped':
                bgColor = 'rgba(34, 197, 94, 0.1)';
                textColor = '#16a34a';
                borderColor = 'rgba(34, 197, 94, 0.2)';
                break;
            case 'Cancelled':
            case 'Returned':
                bgColor = 'var(--color-bg-light)';
                textColor = 'var(--color-text-muted)';
                borderColor = 'var(--color-border)';
                break;
        }
    } else if (type === 'payment') {
        switch (status) {
            case 'Paid':
                bgColor = 'rgba(34, 197, 94, 0.1)';
                textColor = '#16a34a';
                borderColor = 'rgba(34, 197, 94, 0.2)';
                break;
            case 'Unpaid':
            case 'Refunded':
                bgColor = 'rgba(193, 39, 45, 0.1)';
                textColor = 'var(--color-shc-red)';
                borderColor = 'rgba(193, 39, 45, 0.2)';
                break;
        }
    }

    const padding = size === 'sm' ? '0.125rem 0.625rem' : '0.25rem 0.875rem';
    const fontSize = size === 'sm' ? '0.75rem' : '0.875rem';

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding,
                fontSize,
                fontWeight: 600,
                borderRadius: '9999px',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                whiteSpace: 'nowrap'
            }}
        >
            {status}
        </span>
    );
};

export default StatusBadge;
