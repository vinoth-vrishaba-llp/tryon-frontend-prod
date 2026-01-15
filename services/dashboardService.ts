import { UserDashboardData, AdminDashboardData } from "../types";
import { apiClient } from "./apiClient";

/**
 * Get user dashboard data
 * Note: Email is now extracted from JWT token on the backend
 */
export const getUserDashboardData = async (): Promise<UserDashboardData> => {
    return apiClient.get<UserDashboardData>('/dashboard/user');
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
 * Check maintenance status (public endpoint)
 */
export const checkMaintenanceStatus = async (): Promise<{ maintenanceMode: boolean }> => {
    return apiClient.publicGet<{ maintenanceMode: boolean }>('/status/maintenance');
};
