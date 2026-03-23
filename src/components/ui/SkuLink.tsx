"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';

interface SkuLinkProps {
    sku: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const SkuLink: React.FC<SkuLinkProps> = ({ sku, onClick, className, style }) => {
    const navigate = useRouter();
    const { products } = useProducts();
    const { showToast } = useToast();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const product = products.find(p => p.sku === sku);

        if (product) {
            if (onClick) onClick(); // Close modals if needed
            navigate.push(`/wms/products/${product.id}`); // Navigate to product detail using product ID as per the usual convention, or by sku if that's how it's set up
        } else {
            showToast(`Product not found for SKU: ${sku}`, 'error');
        }
    };

    return (
        <a
            href="#"
            onClick={handleClick}
            className={className}
            style={{
                color: '#3B82F6', // Blue color suitable for links
                textDecoration: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.color = '#2563EB';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.color = '#3B82F6';
            }}
        >
            {sku}
        </a>
    );
};
