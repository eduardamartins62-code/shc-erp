import React from 'react';
import type { OrderTag } from '../../types/tags';
import { X } from 'lucide-react';

interface TagChipProps {
    tag: OrderTag;
    onRemove?: () => void;
    size?: 'sm' | 'md';
}

const TagChip: React.FC<TagChipProps> = ({ tag, onRemove, size = 'sm' }) => {
    const padding = size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem';
    const fontSize = size === 'sm' ? '0.7rem' : '0.8rem';

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: tag.color + '22',
            color: tag.color,
            border: `1px solid ${tag.color}55`,
            borderRadius: '12px',
            padding,
            fontSize,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            lineHeight: 1.4
        }}>
            {tag.name}
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 0, display: 'flex', alignItems: 'center',
                        color: tag.color, opacity: 0.7
                    }}
                >
                    <X size={10} />
                </button>
            )}
        </span>
    );
};

export default TagChip;
