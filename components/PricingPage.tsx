import React, { useState } from 'react';
import { User, Plan } from '../types';

interface PricingPageProps {
    user: User;
    onPlanSelected: (plan: Plan) => void;
    onBack: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ user, onPlanSelected, onBack }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper function to check if subscription is truly active
    const isSubscriptionActive = (user: User): boolean => {
        // If paymentStatus is explicitly expired, return false
        if (user.paymentStatus === 'expired') return false;

        // If no paid plan, not active
        if (user.planType === 'Free' || user.paymentStatus === 'none') return false;

        // Check if subscriptionEnd date has passed
        if (user.subscriptionEnd) {
            const endDate = new Date(user.subscriptionEnd);
            const now = new Date();
            if (endDate < now) return false; // Subscription expired
        }

        // Otherwise, check paymentStatus
        return user.paymentStatus === 'active';
    };

    // Updated pricing to match backend (₹750, ₹2500, ₹9000)
    const plans = [
        {
            name: 'Basic',
            monthlyPrice: 750,
            yearlyPrice: 7500,
            credits: 75,
            features: [
                { name: 'Standard Quality (1K) - 3 credits', included: true },
                { name: 'High Quality (2K) - 5 credits', included: false },
                { name: 'Ultra Quality (4K) - 10 credits', included: false },
                { name: 'Max Images: 25/month (Standard)', included: true },
            ],
            idealFor: 'Casual users, new creators',
            color: 'bg-surface-secondary',
            buttonColor: 'bg-primary hover:bg-interactive-hover text-content-inverse',
        },
        {
            name: 'Pro',
            monthlyPrice: 2500,
            yearlyPrice: 25000,
            credits: 250,
            features: [
                { name: 'Standard Quality (1K) - 3 credits', included: true },
                { name: 'High Quality (2K) - 5 credits', included: true },
                { name: 'Ultra Quality (4K) - 10 credits', included: true },
                { name: 'Up to 83 Standard or 25 Ultra images/month', included: true },
            ],
            idealFor: 'Freelancers, boutiques, content creators',
            color: 'bg-surface-tertiary border-2 border-border-strong',
            buttonColor: 'bg-primary hover:bg-interactive-hover text-content-inverse',
        },
        {
            name: 'Ultimate',
            monthlyPrice: 9000,
            yearlyPrice: 90000,
            credits: 900,
            features: [
                { name: 'Standard Quality (1K) - 3 credits', included: true },
                { name: 'High Quality (2K) - 5 credits', included: true },
                { name: 'Ultra Quality (4K) - 10 credits', included: true },
                { name: 'Up to 300 Standard or 90 Ultra images/month', included: true },
            ],
            idealFor: 'Studios, e-commerce brands, agencies',
            color: 'bg-surface-inverse text-content-inverse',
            buttonColor: 'bg-surface text-content hover:bg-surface-secondary font-black',
            popular: true,
        },
    ];

    const handleSelectPlan = (planName: string) => {
        const selectedPlan = plans.find(p => p.name === planName);
        if (selectedPlan) {
            onPlanSelected({
                ...selectedPlan,
                billingCycle
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            

            <div className="text-center mb-12">
                <button
                    onClick={onBack}
                    className="mb-8 text-sm font-bold text-content-tertiary hover:text-primary flex items-center gap-2 mx-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Studio
                </button>
                <h1 className="text-4xl font-black text-content mb-4">Choose Your Creative Power</h1>
                <p className="text-xl text-content-secondary max-w-2xl mx-auto">
                    Unlock the full potential of AI-driven fashion photography. Select a plan that fits your brand's needs.
                </p>

                {/* Toggle */}
                <div className="mt-10 flex items-center justify-center gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-content' : 'text-content-disabled'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-14 h-7 bg-surface-tertiary rounded-full transition-colors focus:outline-none"
                    >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-surface rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7 bg-primary' : ''}`} />
                    </button>
                    <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-content' : 'text-content-disabled'}`}>
                        Yearly <span className="text-content-secondary text-xs ml-1">(Save 17%)</span>
                    </span>
                </div>
            </div>

            {error && (
                <div className="max-w-md mx-auto mb-8 p-4 bg-surface-tertiary text-content rounded-xl text-center font-bold border border-border">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrentPlan = user.planType === plan.name && isSubscriptionActive(user);
                    return (
                    <div
                        key={plan.name}
                        className={`relative rounded-3xl p-8 shadow-xl transition-all hover:scale-[1.02] ${plan.color}`}
                    >
                        {isCurrentPlan && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-content-inverse px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                Current Plan
                            </span>
                        )}
                        {plan.popular && !isCurrentPlan && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-content-inverse px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                Most Popular
                            </span>
                        )}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <p className={`text-sm mb-6 ${plan.name === 'Ultimate' ? 'text-content-disabled' : 'text-content-tertiary'}`}>{plan.idealFor}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black">
                                    ₹{billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                                </span>
                                <span className={`text-sm ${plan.name === 'Ultimate' ? 'text-content-disabled' : 'text-content-tertiary'}`}>/mo</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-xs text-content-secondary font-bold mt-1">Billed ₹{plan.yearlyPrice.toLocaleString()} annually</p>
                            )}
                        </div>

                        <div className="mb-8 p-4 rounded-2xl bg-white/10 border border-white/10">
                            <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Monthly Credits</p>
                            <p className="text-2xl font-black">{plan.credits} ⚡</p>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    {feature.included ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-content-disabled" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className={feature.included ? '' : 'opacity-50'}>{feature.name}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSelectPlan(plan.name)}
                            disabled={isLoading || isCurrentPlan}
                            className={`w-full py-4 rounded-2xl font-black transition-all disabled:opacity-50 ${
                                isCurrentPlan
                                    ? 'bg-content-disabled text-content-inverse cursor-not-allowed'
                                    : plan.buttonColor
                            }`}
                        >
                            {isCurrentPlan
                                ? 'Current Plan'
                                : isLoading
                                    ? 'Processing...'
                                    : `Get Started with ${plan.name}`}
                        </button>
                    </div>
                    );
                })}
            </div>

            <div className="mt-20 bg-surface rounded-3xl p-10 shadow-sm border border-border">
                <h3 className="text-2xl font-bold mb-8 text-center text-content">Credit Consumption Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-surface-secondary rounded-2xl">
                        <p className="font-bold text-content mb-2">Standard Quality (1K)</p>
                        <p className="text-3xl font-black text-primary mb-2">3 ⚡</p>
                        <p className="text-sm text-content-tertiary">Fast, standard quality previews for quick iterations.</p>
                    </div>
                    <div className="p-6 bg-surface-secondary rounded-2xl">
                        <p className="font-bold text-content mb-2">High Quality (2K)</p>
                        <p className="text-3xl font-black text-primary mb-2">5 ⚡</p>
                        <p className="text-sm text-content-tertiary">High-resolution professional studio renders.</p>
                    </div>
                    <div className="p-6 bg-surface-secondary rounded-2xl">
                        <p className="font-bold text-content mb-2">Ultra Quality (4K)</p>
                        <p className="text-3xl font-black text-primary mb-2">10 ⚡</p>
                        <p className="text-sm text-content-tertiary">Maximum detail for high-end e-commerce and print.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;