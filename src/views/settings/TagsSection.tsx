"use client";

import React, { useState } from 'react';
import { useTags } from '../../context/TagsContext';
import TagChip from '../../components/ui/TagChip';
import { Tag, Plus, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
    '#C1272D', '#e67e22', '#f1c40f', '#27ae60',
    '#2980b9', '#8e44ad', '#16a085', '#2c3e50',
    '#e74c3c', '#1abc9c'
];

export const TagsSection: React.FC = () => {
    const { tags, loading, createTag, deleteTag } = useTags();
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        setError(null);
        try {
            await createTag(newName.trim(), newColor);
            setNewName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create tag');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTag(id);
            setConfirmDeleteId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete tag');
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '1.5rem', border: '1px solid var(--color-border)', maxWidth: '800px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={20} color="var(--color-shc-red)" />
                    Order Tags
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    Create and manage tags to flag and categorize orders for your warehouse team.
                </p>
            </div>

            {error && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {/* Create new tag */}
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Create New Tag</h4>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>Tag Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Rush Order, Hold, Fragile..."
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', boxSizing: 'border-box' }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.875rem' }}>Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewColor(color)}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        backgroundColor: color, border: newColor === color ? '3px solid var(--color-primary-dark)' : '2px solid transparent',
                                        cursor: 'pointer', outline: newColor === color ? '2px solid white' : 'none',
                                        outlineOffset: '-4px'
                                    }}
                                />
                            ))}
                            {newName && (
                                <div style={{ marginLeft: '0.5rem' }}>
                                    <TagChip tag={{ id: 'preview', name: newName, color: newColor, createdAt: '' }} size="md" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={creating || !newName.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', backgroundColor: 'var(--color-shc-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating || !newName.trim() ? 0.6 : 1 }}>
                            <Plus size={16} />
                            {creating ? 'Creating...' : 'Create Tag'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tag list */}
            <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    Tag Library ({tags.length})
                </h4>
                {loading ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading...</p>
                ) : tags.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No tags yet. Create your first tag above.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {tags.map(tag => (
                            <div key={tag.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-light)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                                <TagChip tag={tag} size="md" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {confirmDeleteId === tag.id ? (
                                        <>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Delete?</span>
                                            <button onClick={() => handleDelete(tag.id)} style={{ fontSize: '0.8rem', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Yes</button>
                                            <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>No</button>
                                        </>
                                    ) : (
                                        <button onClick={() => setConfirmDeleteId(tag.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
