import { supabase } from '../lib/supabase';
import type { OrderTag } from '../types/tags';

export const tagsApi = {
    getTags: async (): Promise<OrderTag[]> => {
        const { data, error } = await supabase
            .from('order_tags')
            .select('*')
            .order('name');
        if (error) throw new Error(error.message);
        return (data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            color: t.color,
            createdAt: t.created_at
        }));
    },

    createTag: async (name: string, color: string): Promise<OrderTag> => {
        const { data, error } = await supabase
            .from('order_tags')
            .insert([{ name, color }])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return { id: data.id, name: data.name, color: data.color, createdAt: data.created_at };
    },

    deleteTag: async (id: string): Promise<void> => {
        const { error } = await supabase.from('order_tags').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    getTagsForOrders: async (orderIds: string[]): Promise<Record<string, OrderTag[]>> => {
        if (!orderIds.length) return {};
        const { data, error } = await supabase
            .from('order_tag_assignments')
            .select('order_id, order_tags(*)')
            .in('order_id', orderIds);
        if (error) throw new Error(error.message);
        const map: Record<string, OrderTag[]> = {};
        (data || []).forEach((row: any) => {
            const t = row.order_tags;
            if (!map[row.order_id]) map[row.order_id] = [];
            map[row.order_id].push({ id: t.id, name: t.name, color: t.color, createdAt: t.created_at });
        });
        return map;
    },

    assignTagToOrder: async (orderId: string, tagId: string): Promise<void> => {
        const { error } = await supabase
            .from('order_tag_assignments')
            .upsert([{ order_id: orderId, tag_id: tagId }], { onConflict: 'order_id,tag_id', ignoreDuplicates: true });
        if (error) throw new Error(error.message);
    },

    assignTagsToOrder: async (orderId: string, tagIds: string[]): Promise<void> => {
        if (!tagIds.length) return;
        const rows = tagIds.map(tagId => ({ order_id: orderId, tag_id: tagId }));
        const { error } = await supabase.from('order_tag_assignments').upsert(rows, { onConflict: 'order_id,tag_id', ignoreDuplicates: true });
        if (error) throw new Error(error.message);
    },

    removeTagFromOrder: async (orderId: string, tagId: string): Promise<void> => {
        const { error } = await supabase
            .from('order_tag_assignments')
            .delete()
            .eq('order_id', orderId)
            .eq('tag_id', tagId);
        if (error) throw new Error(error.message);
    }
};
