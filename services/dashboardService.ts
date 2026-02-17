import { UserDashboardData, AdminDashboardData, AdminUserImagesResponse, AdminUserImagesFilters } from "../types";
import { apiClient } from "./apiClient";
import { encryptData } from "./encryption";

/**
 * Get user dashboard data
 * Note: Email is now extracted from JWT token on the backend
 */
export const getUserDashboardData = async (): Promise<UserDashboardData> => {
    return apiClient.get<UserDashboardData>('/dashboard/user');
};

/**
 * Get current user profile (lightweight, for polling)
 */
export const getCurrentUserProfile = async (): Promise<{ user: any }> => {
    return apiClient.get<{ user: any }>('/user/me');
};

/**
 * Get admin dashboard data
 * Note: Admin check is now done via JWT token on the backend
 */
export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    return apiClient.get<AdminDashboardData>('/dashboard/admin');
};

/**
 * Toggle maintenance mode (admin only)
 * Note: Admin auth is verified via JWT token
 */
export const toggleMaintenanceMode = async (enabled: boolean): Promise<void> => {
    await apiClient.post('/admin/maintenance', { enabled });
};

/**
 * Send broadcast email (admin only)
 * Note: Admin auth is verified via JWT token
 */
export const sendBroadcastEmail = async (subject: string, message: string, target: string): Promise<void> => {
    await apiClient.post('/admin/broadcast', { subject, message, target });
};

/**
 * Get user details (admin only)
 * Note: Admin auth is verified via JWT token
 */
export const getUserDetails = async (userId: string): Promise<any> => {
    return apiClient.get(`/admin/user/${userId}`);
};

/**
 * Get user's generated images (admin only)
 * Supports pagination and filtering
 */
export const getUserImages = async (
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: AdminUserImagesFilters
): Promise<AdminUserImagesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters) {
        if (filters.section) params.append('section', filters.section);
        if (filters.category) params.append('category', filters.category);
        if (filters.quality) params.append('quality', filters.quality);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
    }

    return apiClient.get<AdminUserImagesResponse>(
        `/admin/user/${userId}/images?${params.toString()}`
    );
};

/**
 * Check maintenance status (public endpoint)
 */
export const checkMaintenanceStatus = async (): Promise<{ maintenanceMode: boolean }> => {
    return apiClient.publicGet<{ maintenanceMode: boolean }>('/status/maintenance');
};

/**
 * Toggle user active status (admin only)
 * Used to suspend or activate users
 */
export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<{ success: boolean; message: string; user: any }> => {
    return apiClient.post(`/admin/user/${userId}/toggle-status`, { isActive });
};

/**
 * Trigger history cleanup - deletes images older than 30 days (admin only)
 */
export const triggerHistoryCleanup = async (): Promise<{ success: boolean; deletedCount: number; message: string }> => {
    return apiClient.post('/admin/cleanup-history', {});
};

/**
 * Admin reset user password (admin only)
 * Directly changes a user's password without sending email
 */
export const adminResetPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const encryptedPassword = await encryptData(newPassword);
    return apiClient.post(`/admin/user/${userId}/reset-password`, {
        newPassword: encryptedPassword,
        encrypted: true
    });
};
