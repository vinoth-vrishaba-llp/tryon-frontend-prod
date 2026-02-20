// frontend/components/CheckoutPage.tsx
import React, { useState } from 'react';
import { User, Plan, CouponApplyResult } from '../types';
import { apiClient } from '../services/apiClient';
import { encryptData } from '../services/encryption';
import { applyCoupon } from '../services/couponService';

interface CheckoutPageProps {
    user: User;
    plan: Plan;
    onPaymentSuccess: (user: User) => void;
    onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
    user,
    plan,
    onPaymentSuccess,
    onBack
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState<CouponApplyResult | null>(null);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const baseAmount =
        plan.billingCycle === 'monthly'
            ? plan.monthlyPrice
            : plan.yearlyPrice;

    const finalAmount = couponApplied ? couponApplied.discountedAmount : baseAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        setCouponApplied(null);
        try {
            const result = await applyCoupon(couponCode.trim(), plan.name, plan.billingCycle);
            setCouponApplied(result);
        } catch (err: any) {
            setCouponError(err.message || 'Invalid coupon code');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(null);
        setCouponCode('');
        setCouponError('');
    };

    const handlePayment = async () => {
        setIsLoading(true);
        setError('');

        try {
            // 1️⃣ Create Razorpay Order (amount derived server-side)
            const order = await apiClient.post<{
                id: string;
                amount: number;
                currency: string;
            }>('/payment/create-order', {
                type: 'plan_upgrade',
                planType: plan.name,
                billingCycle: plan.billingCycle,
                couponCode: couponApplied ? couponApplied.coupon.code : undefined,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            // 2️⃣ Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'AI Try-On Studio',
                description: `${plan.name} Plan Subscription`,
                order_id: order.id,

                handler: async (response: any) => {
                    try {
                        // 3️⃣ Verify Payment - Encrypt sensitive payment data
                        const [
                            encryptedOrderId,
                            encryptedPaymentId,
                            encryptedSignature,
                            encryptedPlanType,
                            encryptedBillingCycle
                        ] = await Promise.all([
                            encryptData(response.razorpay_order_id),
                            encryptData(response.razorpay_payment_id),
                            encryptData(response.razorpay_signature),
                            encryptData(plan.name),
                            encryptData(plan.billingCycle)
                        ]);

                        const result = await apiClient.post<{
                            success: boolean;
                            message: string;
                            user?: any;
                            error?: string;
                        }>('/payment/verify', {
                            razorpay_order_id: encryptedOrderId,
                            razorpay_payment_id: encryptedPaymentId,
                            razorpay_signature: encryptedSignature,
                            type: 'plan_upgrade',
                            planType: encryptedPlanType,
                            billingCycle: encryptedBillingCycle,
                            couponCode: couponApplied ? couponApplied.coupon.code : undefined,
                            encrypted: true
                        });

                        if (!result.success || !result.user) {
                            throw new Error(
                                result.error || result.message || 'Payment verification failed'
                            );
                        }

                        // 4️⃣ Map backend user → frontend User
                        const mappedUser: User = {
                            id: result.user.id?.toString() || user.id,
                            name: result.user.fullName || result.user.name || user.name,
                            email: result.user.email || user.email,
                            role: result.user.role || user.role,
                            brandName: result.user.brandName,
                            mobile: result.user.mobile,
                            website: result.user.website,
                            tokenBalance: result.user.creditsBalance || 0,
                            planType: result.user.planType || 'Free',
                            subscriptionExpiry: result.user.subscriptionEnd,
                            paymentStatus: result.user.paymentStatus || 'active',
                            fullName: result.user.fullName,
                            creditsBalance: result.user.creditsBalance,
                            subscriptionStart: result.user.subscriptionStart,
                            subscriptionEnd: result.user.subscriptionEnd,
                            isActive: result.user.isActive,
                            createdAt: result.user.createdAt,
                            lastLogin: result.user.lastLogin
                        };

                        onPaymentSuccess(mappedUser);
                    } catch (err: any) {
                        setError(
                            err.response?.data?.details?.[0]?.message ||
                            err.response?.data?.error ||
                            err.message ||
                            'Payment verification failed'
                        );
                    }
                },

                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.mobile
                },

                theme: {
                    color: '#000000'
                }
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', (response: any) => {
                setError(response.error?.description || 'Payment failed');
            });

            rzp.open();
        } catch (err: any) {
            setError(
                err.response?.data?.details?.[0]?.message ||
                err.response?.data?.error ||
                err.message ||
                'Payment failed'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-secondary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-content tracking-tight">
                            Checkout
                        </h1>
                        <p className="mt-2 text-lg text-content-secondary">
                            Review your plan and complete the payment.
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-surface text-content-secondary border border-border rounded-xl font-bold hover:bg-surface-secondary transition-all shadow-sm"
                    >
                        Back to Pricing
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-surface-tertiary text-content rounded-2xl text-center font-bold border border-border">
                        {error}
                    </div>
                )}

                <div className="bg-surface rounded-3xl shadow-xl overflow-hidden border border-border">
                    <div className="p-8 sm:p-12">
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Plan Details */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-content mb-6">
                                    Selected Plan
                                </h2>

                                <div className={`rounded-2xl p-6 mb-8 ${plan.color}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <p className="text-sm opacity-70">{plan.idealFor}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black">
                                                ₹{baseAmount.toLocaleString()}
                                            </p>
                                            <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                {plan.billingCycle === 'monthly'
                                                    ? 'per month'
                                                    : 'per year'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-black/5">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <span className="text-xl">⚡</span>
                                            {plan.credits} Credits included
                                        </p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-content mb-4">
                                    Plan Features
                                </h3>

                                <ul className="space-y-3">
                                    {plan.features
                                        .filter(f => f.included)
                                        .map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-3 text-sm text-content-secondary"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-primary"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {feature.name}
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* Order Summary */}
                            <div className="w-full md:w-80 bg-surface-secondary rounded-2xl p-8">
                                <h2 className="text-xl font-black text-content mb-6">
                                    Order Summary
                                </h2>

                                {/* Coupon Code Input */}
                                <div className="mb-6">
                                    {!couponApplied ? (
                                        <div>
                                            <label className="block text-xs font-bold text-content-tertiary uppercase tracking-wider mb-2">
                                                Coupon Code
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={e => {
                                                        setCouponCode(e.target.value.toUpperCase());
                                                        setCouponError('');
                                                    }}
                                                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Enter code"
                                                    disabled={isApplyingCoupon}
                                                    maxLength={50}
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={isApplyingCoupon || !couponCode.trim()}
                                                    className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface-secondary transition-all disabled:opacity-50"
                                                >
                                                    {isApplyingCoupon ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponError && (
                                                <p className="mt-1.5 text-xs text-red-500 font-medium">{couponError}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                                            <div>
                                                <p className="text-xs font-bold text-green-700">
                                                    Coupon applied:{' '}
                                                    <span className="font-mono">{couponApplied.coupon.code}</span>
                                                </p>
                                                <p className="text-xs text-green-600 mt-0.5">
                                                    {couponApplied.coupon.type === 'flat'
                                                        ? `₹${couponApplied.discountAmount.toLocaleString()} off`
                                                        : `${couponApplied.coupon.value}% off`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="ml-2 text-green-600 hover:text-green-800 transition-colors"
                                                title="Remove coupon"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-content-tertiary">
                                            {plan.name} Plan ({plan.billingCycle})
                                        </span>
                                        <span className={`font-bold ${couponApplied ? 'line-through text-content-disabled' : ''}`}>
                                            ₹{baseAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    {couponApplied && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 font-medium">Discount</span>
                                            <span className="font-bold text-green-600">
                                                − ₹{couponApplied.discountAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-content-tertiary">Tax</span>
                                        <span className="font-bold">₹0</span>
                                    </div>

                                    <div className="pt-4 border-t border-border flex justify-between items-baseline">
                                        <span className="text-lg font-black text-content">
                                            Total
                                        </span>
                                        <span className="text-2xl font-black text-primary">
                                            ₹{finalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-content-inverse rounded-2xl font-black text-lg shadow-xl hover:bg-interactive-hover transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing…' : 'Pay Now'}
                                </button>

                                <p className="mt-4 text-center text-xs text-content-disabled">
                                    Secure payment via Razorpay
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
