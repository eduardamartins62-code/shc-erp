import type { PermissionModuleKey, PermissionLevel, User } from '../types';

const LEVEL_RANK: Record<PermissionLevel, number> = {
    none: 0,
    view: 1,
    edit: 2,
    admin: 3,
};

/**
 * Returns permission-checking utilities for a given user.
 *
 * Usage:
 *   const { can, isAdmin } = usePermissions(currentUser);
 *   can('orders', 'edit')   // true if user has View & Edit or Admin on Orders
 *   can('orders', 'admin')  // true only if Admin on Orders (or Account Admin)
 *   isAdmin                 // true if Account Admin
 *
 * When no user is provided (unauthenticated) all checks return false.
 * Account Admins bypass all module checks and always return true.
 */
export function usePermissions(user: User | null | undefined) {
    const isAdmin = user?.isAccountAdmin ?? false;

    const can = (module: PermissionModuleKey, required: PermissionLevel): boolean => {
        if (!user || !user.isActive) return false;
        if (isAdmin) return true;
        const userLevel = user.permissions?.[module] ?? 'none';
        return LEVEL_RANK[userLevel] >= LEVEL_RANK[required];
    };

    const levelFor = (module: PermissionModuleKey): PermissionLevel => {
        if (!user || !user.isActive) return 'none';
        if (isAdmin) return 'admin';
        return user.permissions?.[module] ?? 'none';
    };

    return { can, isAdmin, levelFor };
}
