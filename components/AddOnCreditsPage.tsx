import React, { useState, useEffect } from 'react';
import { User, Page } from '../types';
import { apiClient } from '../services/apiClient';
import { canPurchaseAddons, validateAddonPurchase } from '../services/authService';
import { encryptData } from '../services/encryption';

interface AddOnCreditsPageProps {
    user: User;
    onCreditsPurchased: (updatedUser: User) => void;
    onBack: () => void;
    onNavigate: (page: Page) => void;
}

const CREDIT_PACKS = [
    {
        id: 'flash-s',
        name: 'Flash Pack S',
        credits: 50,
        price: 399,
        description: 'Perfect for quick experiments and small projects.'
    },
    {
        id: 'flash-m',
        name: 'Flash Pack M',
        credits: 150,
        price: 999,
        description: 'Our most popular pack for regular content creation.',
        popular: true
    },
    {
        id: 'flash-l',
        name: 'Flash Pack L',
        credits: 300,
        price: 1799,
        description: 'Best value for high-volume studio renders.'
    }
];

const AddOnCreditsPage: React.FC<AddOnCreditsPageProps> = ({ user, onCreditsPurchased, onBack, onNavigate }) => {
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

    // CRITICAL: Check access on mount
    useEffect(() => {
        const validation = validateAddonPurchase(user);
        
        if (!validation.allowed) {
            setMessage({
                type: 'warning',
                text: validation.error || 'Add-on credits require an active paid subscription.'
            });
            
            // Start countdown to redirect
            setRedirectCountdown(5);
        }
    }, [user]);

    // Handle countdown and redirect
    useEffect(() => {
        if (redirectCountdown !== null) {
            if (redirectCountdown === 0) {
                onNavigate('pricing');
            } else {
                const timer = setTimeout(() => {
                    setRedirectCountdown(redirectCountdown - 1);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [redirectCountdown, onNavigate]);

    const handlePurchase = async (packId: string) => {
        // CRITICAL: Validate before purchase
        const validation = validateAddonPurchase(user);
        if (!validation.allowed) {
            setMessage({
                type: 'error',
                text: validation.error || 'Cannot purchase add-on credits'
            });
            if (validation.action === 'upgrade') {
                setTimeout(() => onNavigate('pricing'), 2000);
            }
            return;
        }

        setIsPurchasing(packId);
        setMessage(null);

        try {
            const selectedPack = CREDIT_PACKS.find(p => p.id === packId);
            if (!selectedPack) throw new Error('Invalid pack selected');

            // 1. Create Order (authenticated)
            const order = await apiClient.post<{ id: string; amount: number; currency: string }>('/payment/create-order', {
                amount: selectedPack.price,
                currency: 'INR',
                receipt: `receipt_addon_${Date.now()}`,
                type: 'addon_purchase' // Include type for backend validation
            });

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'AI Try-On Studio',
                description: `${selectedPack.name} Purchase`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment - Encrypt sensitive payment data
                        const [
                            encryptedOrderId,
                            encryptedPaymentId,
                            encryptedSignature,
                            encryptedPackId
                        ] = await Promise.all([
                            encryptData(response.razorpay_order_id),
                            encryptData(response.razorpay_payment_id),
                            encryptData(response.razorpay_signature),
                            encryptData(packId)
                        ]);

                        const data = await apiClient.post<{
                            success: boolean;
                            message: string;
                            user: any;
                            error?: string;
                        }>('/payment/verify', {
                            razorpay_order_id: encryptedOrderId,
                            razorpay_payment_id: encryptedPaymentId,
                            razorpay_signature: encryptedSignature,
                            type: 'addon_purchase',
                            packId: encryptedPackId,
                            encrypted: true
                        });

                        if (data.success && data.user) {
                            setMessage({ type: 'success', text: data.message });
                            
                            // Map backend user to frontend User type
                            const mappedUser: User = {
                                id: data.user.id?.toString() || user.id,
                                name: data.user.fullName || data.user.name || user.name,
                                email: data.user.email || user.email,
                                role: data.user.role || user.role,
                                brandName: data.user.brandName,
                                mobile: data.user.mobile,
                                website: data.user.website,
                                tokenBalance: data.user.creditsBalance || 0,
                                planType: data.user.planType || 'Free',
                                subscriptionExpiry: data.user.subscriptionEnd,
                                paymentStatus: data.user.paymentStatus || 'none', // Keep as string now
                                fullName: data.user.fullName,
                                creditsBalance: data.user.creditsBalance,
                                subscriptionStart: data.user.subscriptionStart,
                                subscriptionEnd: data.user.subscriptionEnd,
                                isActive: data.user.isActive,
                                createdAt: data.user.createdAt,
                                lastLogin: data.user.lastLogin
                            };
                            
                            onCreditsPurchased(mappedUser);
                        } else {
                            setMessage({ type: 'error', text: data.error || 'Purchase failed' });
                        }
                    } catch (err: any) {
                        // Handle 402 - requires plan
                        if (err.message?.includes('require') && err.message?.includes('plan')) {
                            setMessage({ 
                                type: 'error', 
                                text: 'Add-on credits require an active subscription. Redirecting to pricing...' 
                            });
                            setTimeout(() => onNavigate('pricing'), 2000);
                        } else {
                            setMessage({ type: 'error', text: err.message || 'Payment verification failed' });
                        }
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.mobile
                },
                theme: {
                    color: '#1a237e'
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setMessage({ type: 'error', text: response.error.description });
            });
            rzp.open();

        } catch (error: any) {
            // Handle 402 - requires plan
            if (error.message?.includes('require') && error.message?.includes('plan')) {
                setMessage({ 
                    type: 'error', 
                    text: 'Add-on credits require an active subscription. Redirecting to pricing...' 
                });
                setTimeout(() => onNavigate('pricing'), 2000);
            } else {
                setMessage({ type: 'error', text: error.message || 'Network error. Please try again.' });
            }
        } finally {
            setIsPurchasing(null);
        }
    };

    // Show blocking message if user doesn't have active plan
    const canPurchase = canPurchaseAddons(user);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Add-On Credits</h1>
                        <p className="mt-2 text-lg text-gray-600">Top up your credits to keep creating stunning renders.</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* CRITICAL: Access Control Warning */}
                {!canPurchase && (
                    <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-start gap-4">
                            <svg className="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-red-900 mb-2">Access Restricted</h3>
                                <p className="text-red-700 font-bold mb-4">
                                    Add-on credits are only available as a top-up for active subscribers.
                                    {user.planType === 'Free' && ' You are currently on the Free plan.'}
                                    {user.paymentStatus === 'expired' && ' Your subscription has expired.'}
                                </p>
                                {redirectCountdown !== null && (
                                    <p className="text-red-600 text-sm mb-3">
                                        Redirecting to pricing page in {redirectCountdown} seconds...
                                    </p>
                                )}
                                <button
                                    onClick={() => onNavigate('pricing')}
                                    className="px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    View Plans & Pricing
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`mb-8 p-4 rounded-2xl border ${
                        message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 
                        message.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                        'bg-red-50 border-red-100 text-red-700'
                    } animate-in fade-in slide-in-from-top-4`}>
                        <p className="font-bold text-center">{message.text}</p>
                    </div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${!canPurchase ? 'opacity-50 pointer-events-none' : ''}`}>
                    {CREDIT_PACKS.map((pack) => (
                        <div
                            key={pack.id}
                            className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all hover:scale-105 ${
                                pack.popular ? 'border-primary' : 'border-transparent'
                            }`}
                        >
                            {pack.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-gray-900 mb-2">{pack.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{pack.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-gray-900">{pack.credits}</span>
                                    <span className="text-xl font-bold text-gray-400">⚡ Credits</span>
                                </div>
                                <div className="mt-2 text-2xl font-black text-primary">₹{pack.price.toLocaleString()}</div>
                            </div>

                            <button
                                onClick={() => handlePurchase(pack.id)}
                                disabled={isPurchasing !== null || !canPurchase}
                                className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    pack.popular
                                        ? 'bg-primary text-white hover:bg-indigo-800 shadow-indigo-200 shadow-xl'
                                        : 'bg-gray-900 text-white hover:bg-black'
                                }`}
                            >
                                {isPurchasing === pack.id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Pay ₹${pack.price.toLocaleString()}`
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 p-3 rounded-2xl">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-indigo-900 mb-1">About Add-On Credits</h4>
                            <p className="text-indigo-700 text-sm leading-relaxed mb-2">
                                Add-on credits never expire and are used only after your monthly plan credits are exhausted.
                                They are perfect for busy months when you need extra capacity.
                            </p>
                            <p className="text-indigo-600 text-xs font-bold">
                                ⚠️ Add-on credits are only available as a top-up for active subscribers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddOnCreditsPage;