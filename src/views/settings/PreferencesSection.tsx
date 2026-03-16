import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Settings as SettingsIcon } from 'lucide-react';

export const PreferencesSection: React.FC = () => {
    const { systemSettings, updateSystemSettings } = useSettings();
    const [formData, setFormData] = useState({
        defaultTimeZone: 'America/New_York',
        defaultCurrency: 'USD',
        defaultDateFormat: 'MM/DD/YYYY',
        lowStockThresholdDefault: 20,
        enableLotTracking: true,
        enableExpirationTracking: true,
        inventoryDeductionMethod: 'FEFO' as 'FIFO' | 'FEFO'
    });

    useEffect(() => {
        if (systemSettings) {
            setFormData(systemSettings);
        }
    }, [systemSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSystemSettings(formData);
            alert("System preferences saved successfully.");
        } catch (error) {
            console.error("Failed to save preferences", error);
            alert("Failed to save preferences.");
        }
    };

    if (!systemSettings) return <div>Loading...</div>;

    return (
        <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            maxWidth: '800px'
        }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SettingsIcon size={20} color="var(--color-shc-red)" />
                    System Preferences
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Configure global options that apply across all modules.
                </p>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Regional Settings */}
                <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Regional Formatting</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Default Time Zone</label>
                            <select
                                value={formData.defaultTimeZone}
                                onChange={e => setFormData({ ...formData, defaultTimeZone: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                            >
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                <option value="America/Denver">Mountain Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="Europe/London">London</option>
                                <option value="Europe/Paris">Central Europe</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Default Currency</label>
                            <select
                                value={formData.defaultCurrency}
                                onChange={e => setFormData({ ...formData, defaultCurrency: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="CAD">CAD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Date Format</label>
                            <select
                                value={formData.defaultDateFormat}
                                onChange={e => setFormData({ ...formData, defaultDateFormat: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inventory Defaults */}
                <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Inventory Tracking</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                Global Low Stock Default Threshold
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.lowStockThresholdDefault}
                                onChange={e => setFormData({ ...formData, lowStockThresholdDefault: parseInt(e.target.value) || 0 })}
                                style={{ width: '150px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                            />
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                Used when a product lacks a specific low stock override.
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="lot-tracking"
                                checked={formData.enableLotTracking}
                                onChange={e => setFormData({ ...formData, enableLotTracking: e.target.checked })}
                            />
                            <label htmlFor="lot-tracking" style={{ fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Enable Lot Tracking Globally
                            </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="exp-tracking"
                                checked={formData.enableExpirationTracking}
                                onChange={e => setFormData({ ...formData, enableExpirationTracking: e.target.checked })}
                            />
                            <label htmlFor="exp-tracking" style={{ fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                                Enable Expiration Date Tracking Globally
                            </label>
                        </div>
                    </div>
                </div>

                {/* Order Fulfillment */}
                <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Order Fulfillment</h4>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                            Inventory Deduction Method
                        </label>
                        <select
                            value={formData.inventoryDeductionMethod}
                            onChange={e => setFormData({ ...formData, inventoryDeductionMethod: e.target.value as 'FIFO' | 'FEFO' })}
                            style={{ width: '200px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        >
                            <option value="FEFO">FEFO (First Expired, First Out)</option>
                            <option value="FIFO">FIFO (First In, First Out)</option>
                        </select>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                            Determines the order in which inventory lots are deducted when an order ships.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '0.5rem 1.5rem',
                            backgroundColor: 'var(--color-shc-red)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Save Preferences
                    </button>
                </div>
            </form>
        </div>
    );
};
