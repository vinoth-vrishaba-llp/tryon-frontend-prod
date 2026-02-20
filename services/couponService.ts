import { apiClient } from './apiClient';
import { Coupon, CouponApplyResult } from '../types';

/**
 * Validate a coupon code against a specific plan (authenticated user).
 * Returns discount breakdown if valid; throws with 'Invalid coupon code' if not.
 */
export const applyCoupon = async (
    code: string,
    planType: string,
    billingCycle: string
): Promise<CouponApplyResult> => {
    return apiClient.post<CouponApplyResult>('/coupons/apply', { code, planType, billingCycle });
};

/**
 * Admin: Get all coupons.
 */
export const getAllCoupons = async (): Promise<{ success: boolean; coupons: Coupon[] }> => {
    return apiClient.get('/admin/coupons');
};

/**
 * Admin: Create a new coupon.
 */
export const createCoupon = async (data: {
    code: string;
    type: 'flat' | 'percentage';
    value: number;
    status: 'active' | 'inactive';
}): Promise<{ success: boolean; coupon: Coupon }> => {
    return apiClient.post('/admin/coupons', data);
};

/**
 * Admin: Update an existing coupon.
 */
export const updateCoupon = async (
    id: string,
    updates: Partial<{ code: string; type: string; value: number; status: string }>
): Promise<{ success: boolean; coupon: Coupon }> => {
    return apiClient.patch(`/admin/coupons/${id}`, updates);
};

/**
 * Admin: Delete a coupon.
 */
export const deleteCoupon = async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/admin/coupons/${id}`);
};
