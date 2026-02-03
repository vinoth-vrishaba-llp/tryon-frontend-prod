import React, { useEffect, useState } from 'react';
import { User, UserDetails } from '../types';
import { getUserDetails } from '../services/dashboardService';

interface UserDetailsPageProps {
    adminUser: User;
    userId: string;
    onBack: () => void;
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ adminUser, userId, onBack }) => {
    const [details, setDetails] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getUserDetails(userId);
                setDetails(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [userId]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading User Details...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!details) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
                        <p className="text-gray-600">Comprehensive insights for {details.name}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-all text-sm">
                        Suspend Account
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all text-sm">
                        Reset Password
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* A. Personal & Account Information */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="text-primary">👤</span> Personal Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <p className="text-sm font-medium text-gray-900">{details.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                <p className="text-sm font-medium text-gray-900">{details.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Name</label>
                                <p className="text-sm font-medium text-gray-900">{details.brandName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
                                <p className="text-sm font-medium text-primary hover:underline cursor-pointer">{details.website || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="text-primary">📅</span> Account Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase">Plan Type</label>
                                <span className="px-2 py-1 bg-indigo-50 text-primary rounded text-[10px] font-bold uppercase">
                                    {details.planType}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                <span className="flex items-center text-[10px] font-bold text-green-600">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                                    {details.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Signup Date</label>
                                <p className="text-sm font-medium text-gray-900">{details.signupDate}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                                <p className="text-sm font-medium text-gray-900">{details.subscriptionExpiry}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Usage & Activity Insights */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-primary">📸</span> Image Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Images</p>
                                    <p className="text-2xl font-black text-gray-900">{details.usageInsights.totalImages}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Credits Used</p>
                                    <p className="text-2xl font-black text-primary">{details.usageInsights.totalTokens}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-primary">📈</span> Peak Usage
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-900">{details.usageInsights.peakUsage.day}</p>
                                <p className="text-xs text-gray-500">{details.usageInsights.peakUsage.time}</p>
                                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Usage Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-4">Categories</p>
                                <div className="space-y-3">
                                    {details.usageInsights.categories.map(cat => (
                                        <div key={cat.label}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-600">{cat.label}</span>
                                                <span className="font-bold text-gray-900">{cat.value}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-400" style={{ width: `${cat.value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-4">Models</p>
                                <div className="space-y-3">
                                    {details.usageInsights.models.map(model => (
                                        <div key={model.label}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-600">{model.label}</span>
                                                <span className="font-bold text-gray-900">{model.value}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${model.value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* C. Additional Insights */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Usage Trend (Monthly)</h3>
                        <div className="h-48 flex items-end justify-between gap-4">
                            {details.usageInsights.usageTrend.map(item => (
                                <div key={item.label} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-lg"
                                        style={{ height: `${(item.value / 250) * 100}%` }}
                                    ></div>
                                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">{item.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Avg Credits / Session</p>
                                <p className="text-xl font-black text-gray-900">{details.usageInsights.avgCreditsPerSession} ⚡</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Last Active</p>
                                <p className="text-xl font-black text-gray-900">{details.usageInsights.lastActive}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;
