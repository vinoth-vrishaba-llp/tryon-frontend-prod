import React, { useEffect, useState } from 'react';
import { User, UserDashboardData } from '../types';
import { getUserDashboardData } from '../services/dashboardService';
import { apiClient } from '../services/apiClient';
import { encryptData } from '../services/encryption';

interface UserDashboardProps {
    user: User;
    onBack: () => void;
    onNavigateToPricing: () => void;
    onUserUpdate?: (user: User) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onBack, onNavigateToPricing, onUserUpdate }) => {
    const [data, setData] = useState<UserDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        fullName: user.fullName || '',
        brandName: user.brandName || '',
        mobile: user.mobile || '',
        website: user.website || ''
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Sync profile form with user prop changes
    useEffect(() => {
        setProfileForm({
            fullName: user.fullName || '',
            brandName: user.brandName || '',
            mobile: user.mobile || '',
            website: user.website || ''
        });
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getUserDashboardData();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const response = await apiClient.put<{ success: boolean; user: any }>('/profile', profileForm);

            if (response.success && response.user) {
                setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
                if (onUserUpdate) {
                    onUserUpdate(response.user);
                }
                // Also update local form state with returned data
                setProfileForm({
                    fullName: response.user.fullName || '',
                    brandName: response.user.brandName || '',
                    mobile: response.user.mobile || '',
                    website: response.user.website || ''
                });
            }
        } catch (err: any) {
            setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsChangingPassword(true);

        try {
            // Encrypt passwords before sending
            const [encryptedNewPassword, encryptedConfirmPassword] = await Promise.all([
                encryptData(passwordForm.newPassword),
                encryptData(passwordForm.confirmPassword)
            ]);

            await apiClient.post('/profile/change-password', {
                newPassword: encryptedNewPassword,
                confirmPassword: encryptedConfirmPassword,
                encrypted: true
            });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
                    <p className="text-gray-600">Manage your account and view usage statistics</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                    Back to Studio
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Brand Name</p>
                    <p className="text-xl font-bold text-gray-900">{user.brandName || 'N/A'}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Account Type</p>
                    <p className="text-xl font-bold text-primary">{user.planType || 'Free'}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Subscription Expiry</p>
                    <p className="text-xl font-bold text-gray-900">{user.subscriptionExpiry || 'N/A'}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Remaining Credits</p>
                    <p className="text-xl font-bold text-green-600">{user.tokenBalance} ⚡</p>
                </div>
            </div>

            {/* Usage Summary */}
            <div className="bg-gradient-to-r from-indigo-600 to-primary rounded-2xl p-8 mb-8 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Usage Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <p className="text-indigo-100 text-sm mb-2 uppercase tracking-wider">Total Try-Ons</p>
                        <p className="text-4xl font-black">{data.totalTryOns}</p>
                    </div>
                    <div className="text-center border-x border-indigo-400/30">
                        <p className="text-indigo-100 text-sm mb-2 uppercase tracking-wider">Usage This Month</p>
                        <p className="text-4xl font-black">{data.usageThisMonth}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-indigo-100 text-sm mb-2 uppercase tracking-wider">Estimated Cost Saved</p>
                        <p className="text-4xl font-black text-white-300">₹{data.costSaved.toLocaleString('en-IN')}</p>
                        <p className="text-xs mt-2 text-indigo-100 opacity-80">vs. traditional photoshoots (₹800/shoot)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Update Section */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Update Profile</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={profileForm.brandName}
                                    onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Enter your brand name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={profileForm.mobile}
                                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Website URL</label>
                                <input
                                    type="url"
                                    value={profileForm.website}
                                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="https://your-website.com"
                                />
                            </div>
                        </div>

                        {profileMessage.text && (
                            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                                {profileMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-indigo-800 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdatingProfile ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </form>

                    {/* Change Password Section */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <h4 className="text-md font-bold text-gray-900 mb-4">Change Password</h4>
                        <form onSubmit={handlePasswordChange}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                                        placeholder="Confirm new password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {passwordMessage.text && (
                                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                    passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Billing & Settings */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Billing & Subscription</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className="text-sm font-bold text-green-600">{data.planDetails.status}</span>
                            </div>
                            <button
                                onClick={onNavigateToPricing}
                                className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-indigo-800 transition-all text-sm"
                            >
                                Upgrade Plan
                            </button>
                            {user.role === 'user' && (
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-addon-credits'))}
                                    className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all text-sm shadow-sm"
                                >
                                    Add-On Credits
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Member Since</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Last Login</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500">Account Status</span>
                                <span className="text-sm font-bold text-green-600">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
