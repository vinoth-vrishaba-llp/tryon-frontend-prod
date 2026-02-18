import React, { useEffect, useState } from 'react';
import { User, UserDashboardData, Report } from '../types';
import { getUserDashboardData } from '../services/dashboardService';
import { apiClient } from '../services/apiClient';
import { encryptData } from '../services/encryption';
import { updateAvatar } from '../services/authService';
import { getAvatarById } from '../constants/avatars';
import AvatarPicker from './AvatarPicker';
import UserReportsList from './UserReportsList';
import ReportDetails from './admin/ReportDetails';
import { Pencil, X, Zap } from 'lucide-react';

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

    // Tab state
    const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');

    // Reports state
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportsRefreshTrigger, setReportsRefreshTrigger] = useState(0);

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

    // Avatar state
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(user.avatar);
    const [avatarLoading, setAvatarLoading] = useState(false);

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

    const handleAvatarSave = async () => {
        if (selectedAvatar) {
            setAvatarLoading(true);
            try {
                await updateAvatar(selectedAvatar);
                if (onUserUpdate) {
                    onUserUpdate({ ...user, avatar: selectedAvatar });
                }
                setShowAvatarPicker(false);
            } catch {
                // silently fail
            } finally {
                setAvatarLoading(false);
            }
        }
    };

    const avatarOption = getAvatarById(user.avatar);

    const handleReportSelect = (report: Report) => {
        setSelectedReport(report);
    };

    const handleReportUpdate = (updatedReport: Report) => {
        setReportsRefreshTrigger(prev => prev + 1);
        setSelectedReport(updatedReport);
    };

    const handleCloseReportDetails = () => {
        setSelectedReport(null);
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-feedback-error">Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-content">User Dashboard</h1>
                    <p className="text-content-secondary">Manage your account and view usage statistics</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-surface-tertiary text-content-secondary rounded-lg hover:bg-interactive-hover transition-all font-medium"
                >
                    Back to Studio
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'dashboard'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-content-tertiary hover:text-content-secondary hover:border-border-secondary'
                            }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'reports'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-content-tertiary hover:text-content-secondary hover:border-border-secondary'
                            }`}
                        >
                            My Reports
                        </button>
                    </nav>
                </div>
            </div>

            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <p className="text-sm text-content-tertiary mb-1">Brand Name</p>
                    <p className="text-xl font-bold text-content">{user.brandName || 'N/A'}</p>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <p className="text-sm text-content-tertiary mb-1">Account Type</p>
                    <p className="text-xl font-bold text-primary">{user.planType || 'Free'}</p>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <p className="text-sm text-content-tertiary mb-1">Subscription Expiry</p>
                    <p className="text-xl font-bold text-content">{user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                    <p className="text-sm text-content-tertiary mb-1">Remaining Credits</p>
                    <p className="text-xl font-bold text-feedback-success flex items-center gap-1">{user.tokenBalance} <Zap size={18} /></p>
                </div>
            </div>

            {/* Usage Summary */}
            <div className="bg-primary rounded-2xl p-8 mb-8 text-content-inverse shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Usage Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <p className="text-content-inverse/70 text-sm mb-2 uppercase tracking-wider">Total Try-Ons</p>
                        <p className="text-4xl font-black">{data.totalTryOns}</p>
                    </div>
                    <div className="text-center border-x border-content-inverse/20">
                        <p className="text-content-inverse/70 text-sm mb-2 uppercase tracking-wider">Usage This Month</p>
                        <p className="text-4xl font-black">{data.usageThisMonth}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-content-inverse/70 text-sm mb-2 uppercase tracking-wider">Estimated Cost Saved</p>
                        <p className="text-4xl font-black">₹{data.costSaved.toLocaleString('en-IN')}</p>
                        <p className="text-xs mt-2 text-content-inverse/60">vs. traditional photoshoots (₹800/shoot)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Update Section */}
                <div className="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold text-content">Update Profile</h3>
                        <p className="text-sm text-content-tertiary mt-1">Manage your account information</p>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="p-6">
                        {/* Avatar section */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                            <div className="relative group">
                                {avatarOption ? (
                                    <img src={avatarOption.src} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-surface-tertiary flex items-center justify-center text-primary font-bold text-xl">
                                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAvatar(user.avatar);
                                        setShowAvatarPicker(true);
                                    }}
                                    className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-content-inverse rounded-full shadow-md hover:bg-secondary transition-colors"
                                >
                                    <Pencil size={12} />
                                </button>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-content">{user.name || 'User'}</p>
                                <p className="text-xs text-content-tertiary">{user.email}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedAvatar(user.avatar);
                                        setShowAvatarPicker(true);
                                    }}
                                    className="text-xs text-primary font-medium mt-1 hover:underline"
                                >
                                    Change avatar
                                </button>
                            </div>
                        </div>

                        {/* Avatar picker modal */}
                        {showAvatarPicker && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div
                                    className="absolute inset-0 bg-surface-inverse/50"
                                    onClick={() => setShowAvatarPicker(false)}
                                />
                                <div className="relative bg-surface rounded-2xl shadow-2xl border border-border p-6 w-full max-w-sm mx-4 z-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowAvatarPicker(false)}
                                        className="absolute top-3 right-3 p-1 text-content-tertiary hover:text-content"
                                    >
                                        <X size={18} />
                                    </button>
                                    <AvatarPicker
                                        selectedAvatar={selectedAvatar}
                                        onSelect={(id) => setSelectedAvatar(id)}
                                        loading={avatarLoading}
                                        onConfirm={handleAvatarSave}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={profileForm.brandName}
                                    onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Enter your brand name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-surface-secondary text-content-tertiary cursor-not-allowed"
                                />
                                <p className="text-xs text-content-disabled mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={profileForm.mobile}
                                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">Website URL</label>
                                <input
                                    type="url"
                                    value={profileForm.website}
                                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="https://your-website.com"
                                />
                            </div>
                        </div>

                        {profileMessage.text && (
                            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                profileMessage.type === 'success' ? 'bg-feedback-success-light text-feedback-success' : 'bg-feedback-error-light text-feedback-error'
                            }`}>
                                {profileMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="mt-6 px-6 py-3 bg-primary text-content-inverse rounded-lg font-bold hover:bg-secondary transition-all disabled:opacity-50 flex items-center gap-2"
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
                    <div className="p-6 border-t border-border bg-surface-secondary">
                        <h4 className="text-md font-bold text-content mb-4">Change Password</h4>
                        <form onSubmit={handlePasswordChange}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-surface"
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-content-disabled mt-1">Minimum 6 characters</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-content-tertiary uppercase mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-surface"
                                        placeholder="Confirm new password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {passwordMessage.text && (
                                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                                    passwordMessage.type === 'success' ? 'bg-feedback-success-light text-feedback-success' : 'bg-feedback-error-light text-feedback-error'
                                }`}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="mt-4 px-6 py-2.5 bg-primary text-content-inverse rounded-lg font-bold hover:bg-secondary transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
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
                    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
                        <h3 className="text-lg font-bold text-content mb-4">Billing & Subscription</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                                <span className="text-sm text-content-secondary">Status</span>
                                <span className="text-sm font-bold text-feedback-success">{data.planDetails.status}</span>
                            </div>
                            <button
                                onClick={onNavigateToPricing}
                                className="w-full py-2 bg-primary text-content-inverse rounded-lg font-bold hover:bg-secondary transition-all text-sm"
                            >
                                Upgrade Plan
                            </button>
                            {user.role === 'user' && (
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-addon-credits'))}
                                    className="w-full py-2 bg-feedback-success text-content-inverse rounded-lg font-bold hover:opacity-90 transition-all text-sm shadow-sm"
                                >
                                    Add-On Credits
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
                        <h3 className="text-lg font-bold text-content mb-4">Account Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-border">
                                <span className="text-sm text-content-tertiary">Member Since</span>
                                <span className="text-sm font-medium text-content">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-border">
                                <span className="text-sm text-content-tertiary">Last Login</span>
                                <span className="text-sm font-medium text-content">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-content-tertiary">Account Status</span>
                                <span className="text-sm font-bold text-feedback-success">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice History */}
            {data.planDetails.invoiceHistory.length > 0 && (
                <div className="mt-8 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-bold text-content">Invoice History</h3>
                        <p className="text-sm text-content-tertiary mt-1">Your subscription payment history</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-surface-secondary">
                                    <th className="text-left text-xs font-bold text-content-tertiary uppercase px-6 py-3">Order ID</th>
                                    <th className="text-left text-xs font-bold text-content-tertiary uppercase px-6 py-3">Date</th>
                                    <th className="text-left text-xs font-bold text-content-tertiary uppercase px-6 py-3">Plan</th>
                                    <th className="text-left text-xs font-bold text-content-tertiary uppercase px-6 py-3">Amount</th>
                                    <th className="text-left text-xs font-bold text-content-tertiary uppercase px-6 py-3">Period</th>
                                    <th className="text-left text-xs font-bold text-content-tertiary uppercase px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.planDetails.invoiceHistory.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-surface-secondary/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-content font-mono">{invoice.id}</td>
                                        <td className="px-6 py-4 text-sm text-content">
                                            {new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                                {invoice.planType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-content">₹{Number(invoice.amount).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-sm text-content-secondary">
                                            {new Date(invoice.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            {' – '}
                                            {new Date(invoice.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                invoice.status === 'completed'
                                                    ? 'bg-feedback-success/10 text-feedback-success'
                                                    : 'bg-feedback-warning/10 text-feedback-warning'
                                            }`}>
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
                </>
            )}

            {/* Reports Tab Content */}
            {activeTab === 'reports' && (
                <div className="mb-8">
                    <UserReportsList
                        onSelectReport={handleReportSelect}
                        refreshTrigger={reportsRefreshTrigger}
                    />
                </div>
            )}

            {/* Report Details Modal */}
            {selectedReport && (
                <ReportDetails
                    report={selectedReport}
                    onClose={handleCloseReportDetails}
                    onUpdate={handleReportUpdate}
                    readOnly={true}
                />
            )}
        </div>
    );
};

export default UserDashboard;
