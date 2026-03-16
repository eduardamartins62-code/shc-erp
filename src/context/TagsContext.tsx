"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { OrderTag } from '../types/tags';
import { tagsApi } from '../services/tagsApi';

interface TagsContextProps {
    tags: OrderTag[];
    loading: boolean;
    fetchTags: () => Promise<void>;
    createTag: (name: string, color: string) => Promise<void>;
    deleteTag: (id: string) => Promise<void>;
    assignTagToOrder: (orderId: string, tagId: string) => Promise<void>;
    removeTagFromOrder: (orderId: string, tagId: string) => Promise<void>;
}

const TagsContext = createContext<TagsContextProps | undefined>(undefined);

export const useTags = () => {
    const ctx = useContext(TagsContext);
    if (!ctx) throw new Error('useTags must be used within a TagsProvider');
    return ctx;
};

export const TagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tags, setTags] = useState<OrderTag[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const data = await tagsApi.getTags();
            setTags(data);
        } catch (err) {
            console.error('Failed to fetch tags', err);
        } finally {
            setLoading(false);
        }
    };

    const createTag = async (name: string, color: string) => {
        const tag = await tagsApi.createTag(name, color);
        setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const deleteTag = async (id: string) => {
        await tagsApi.deleteTag(id);
        setTags(prev => prev.filter(t => t.id !== id));
    };

    const assignTagToOrder = async (orderId: string, tagId: string) => {
        await tagsApi.assignTagToOrder(orderId, tagId);
    };

    const removeTagFromOrder = async (orderId: string, tagId: string) => {
        await tagsApi.removeTagFromOrder(orderId, tagId);
    };

    useEffect(() => { fetchTags(); }, []);

    return (
        <TagsContext.Provider value={{ tags, loading, fetchTags, createTag, deleteTag, assignTagToOrder, removeTagFromOrder }}>
            {children}
        </TagsContext.Provider>
    );
};
