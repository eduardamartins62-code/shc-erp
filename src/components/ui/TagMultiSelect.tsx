"use client";

import React from 'react';
import { useTags } from '../../context/TagsContext';
import TagChip from './TagChip';
import Link from 'next/link';

interface TagMultiSelectProps {
    selectedTagIds: string[];
    onChange: (ids: string[]) => void;
}

const TagMultiSelect: React.FC<TagMultiSelectProps> = ({ selectedTagIds, onChange }) => {
    const { tags } = useTags();

    const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));
    const availableTags = tags.filter(t => !selectedTagIds.includes(t.id));

    const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tagId = e.target.value;
        if (tagId) {
            onChange([...selectedTagIds, tagId]);
            e.target.value = '';
        }
    };

    const handleRemove = (tagId: string) => {
        onChange(selectedTagIds.filter(id => id !== tagId));
    };

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem', minHeight: '28px' }}>
                {selectedTags.map(tag => (
                    <TagChip key={tag.id} tag={tag} onRemove={() => handleRemove(tag.id)} size="md" />
                ))}
            </div>
            {availableTags.length > 0 ? (
                <select
                    onChange={handleAdd}
                    defaultValue=""
                    style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-white)' }}
                >
                    <option value="" disabled>+ Add tag...</option>
                    {availableTags.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            ) : (
                <Link href="/settings/tags" target="_blank" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    + Manage tags in Settings
                </Link>
            )}
        </div>
    );
};

export default TagMultiSelect;
