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
            color: 'bg-gray-50',
            buttonColor: 'bg-gray-900 hover:bg-black text-white',
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
            color: 'bg-indigo-50 border-2 border-primary',
            buttonColor: 'bg-gray-900 hover:bg-black text-white',
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
            color: 'bg-gray-900 text-white',
            buttonColor: 'bg-white text-gray-900 hover:bg-gray-100 font-black',
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
                    className="mb-8 text-sm font-bold text-gray-500 hover:text-primary flex items-center gap-2 mx-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Studio
                </button>
                <h1 className="text-4xl font-black text-gray-900 mb-4">Choose Your Creative Power</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Unlock the full potential of AI-driven fashion photography. Select a plan that fits your brand's needs.
                </p>

                {/* Toggle */}
                <div className="mt-10 flex items-center justify-center gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-14 h-7 bg-gray-200 rounded-full transition-colors focus:outline-none"
                    >
                        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7 bg-primary' : ''}`} />
                    </button>
                    <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
                        Yearly <span className="text-green-600 text-xs ml-1">(Save 17%)</span>
                    </span>
                </div>
            </div>

            {error && (
                <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative rounded-3xl p-8 shadow-xl transition-all hover:scale-[1.02] ${plan.color}`}
                    >
                        {plan.popular && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                Most Popular
                            </span>
                        )}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <p className={`text-sm mb-6 ${plan.name === 'Ultimate' ? 'text-gray-400' : 'text-gray-500'}`}>{plan.idealFor}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black">
                                    ₹{billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                                </span>
                                <span className={`text-sm ${plan.name === 'Ultimate' ? 'text-gray-400' : 'text-gray-500'}`}>/mo</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-xs text-green-600 font-bold mt-1">Billed ₹{plan.yearlyPrice.toLocaleString()} annually</p>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className={feature.included ? '' : 'opacity-50'}>{feature.name}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSelectPlan(plan.name)}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-black transition-all disabled:opacity-50 ${plan.buttonColor}`}
                        >
                            {isLoading ? 'Processing...' : `Get Started with ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20 bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-center">Credit Consumption Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-slate-50 rounded-2xl">
                        <p className="font-bold text-gray-900 mb-2">Standard Quality (1K)</p>
                        <p className="text-3xl font-black text-primary mb-2">3 ⚡</p>
                        <p className="text-sm text-gray-500">Fast, standard quality previews for quick iterations.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                        <p className="font-bold text-gray-900 mb-2">High Quality (2K)</p>
                        <p className="text-3xl font-black text-primary mb-2">5 ⚡</p>
                        <p className="text-sm text-gray-500">High-resolution professional studio renders.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl">
                        <p className="font-bold text-gray-900 mb-2">Ultra Quality (4K)</p>
                        <p className="text-3xl font-black text-primary mb-2">10 ⚡</p>
                        <p className="text-sm text-gray-500">Maximum detail for high-end e-commerce and print.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;