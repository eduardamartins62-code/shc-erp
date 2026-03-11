"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Link, ArrowRight } from 'lucide-react';

export const LocationsSectionLink: React.FC = () => {
    const navigate = useRouter();

    return (
        <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '2rem',
            border: '1px solid var(--color-border)',
            maxWidth: '600px'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Link size={24} color="var(--color-shc-red)" />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>
                        Manage Storage Locations
                    </h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                        Warehouse aisles, racks, shelves, and bins are maintained in the dedicated Locations module. Navigate there to add or modify structural storage data and manage barcode values.
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate.push('/locations')}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--color-shc-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                Open Locations Module <ArrowRight size={18} />
            </button>
        </div>
    );
};
