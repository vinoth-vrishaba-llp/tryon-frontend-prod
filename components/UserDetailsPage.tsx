import React, { useEffect, useState } from 'react';
import { User, UserDetails, AdminUserImage, AdminUserImagesFilters, AdminUserImagesFilterOptions } from '../types';
import { getUserDetails, getUserImages, toggleUserStatus, adminResetPassword } from '../services/dashboardService';
import UserImageGallery from './admin/UserImageGallery';

interface UserDetailsPageProps {
    adminUser: User;
    userId: string;
    onBack: () => void;
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ adminUser, userId, onBack }) => {
    const [details, setDetails] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Tab and Images state
    const [activeTab, setActiveTab] = useState<'overview' | 'images'>('overview');
    const [images, setImages] = useState<AdminUserImage[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<AdminUserImage | null>(null);
    const [isModalImageLoading, setIsModalImageLoading] = useState(false);
    const [pagination, setPagination] = useState<{
        page: number;
        totalPages: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
    const [filters, setFilters] = useState<AdminUserImagesFilters>({});
    const [filterOptions, setFilterOptions] = useState<AdminUserImagesFilterOptions | undefined>();
    const [imagesInitialLoad, setImagesInitialLoad] = useState(true);

    // Action states
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<'suspend' | 'activate' | null>(null);

    // Password reset modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

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

    const fetchUserImages = async (page: number = 1, currentFilters?: AdminUserImagesFilters) => {
        setImagesLoading(true);
        try {
            const response = await getUserImages(userId, page, 20, currentFilters || filters);
            setImages(response.images);
            setPagination(response.pagination);
            if (response.filterOptions) {
                setFilterOptions(response.filterOptions);
            }
        } catch (err: any) {
            console.error('Failed to fetch user images:', err);
        } finally {
            setImagesLoading(false);
            setImagesInitialLoad(false);
        }
    };

    // Fetch images when switching to images tab
    useEffect(() => {
        if (activeTab === 'images' && imagesInitialLoad) {
            fetchUserImages(1, filters);
        }
    }, [activeTab]);

    // Handle filter changes
    const handleFilterChange = (newFilters: AdminUserImagesFilters) => {
        setFilters(newFilters);
        fetchUserImages(1, newFilters);
    };

    // Handle page changes
    const handlePageChange = (page: number) => {
        fetchUserImages(page, filters);
    };

    // Handle toggle user status (suspend/activate)
    const handleToggleStatus = async () => {
        if (!details) return;
        setIsTogglingStatus(true);
        setActionMessage(null);
        try {
            const newStatus = details.status === 'Active';
            const response = await toggleUserStatus(userId, !newStatus);
            if (response.success) {
                setDetails(prev => prev ? { ...prev, status: newStatus ? 'Blocked' : 'Active' } : null);
                setActionMessage({ type: 'success', text: response.message });
            }
        } catch (err: any) {
            setActionMessage({ type: 'error', text: err.message || 'Failed to update user status' });
        } finally {
            setIsTogglingStatus(false);
            setShowConfirmModal(null);
        }
    };

    // Validate password strength
    const validatePassword = (password: string): string | null => {
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        return null;
    };

    // Handle password reset
    const handleResetPassword = async () => {
        if (!details) return;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        // Validate password strength
        const validationError = validatePassword(newPassword);
        if (validationError) {
            setPasswordError(validationError);
            return;
        }

        setPasswordError('');
        setIsResettingPassword(true);
        setActionMessage(null);

        try {
            const response = await adminResetPassword(userId, newPassword);
            if (response.success) {
                setActionMessage({ type: 'success', text: `Password reset successfully for ${details.name}` });
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to reset password');
        } finally {
            setIsResettingPassword(false);
        }
    };

    // Close password modal and reset state
    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setShowPassword(false);
    };

    // Clear action message after 5 seconds
    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getQualityBadgeColor = (quality: string) => {
        switch (quality?.toLowerCase()) {
            case 'ultra':
            case '4k':
                return 'bg-purple-100 text-purple-700';
            case 'high':
            case '2k':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

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
                    <button
                        onClick={() => setShowConfirmModal(details.status === 'Active' ? 'suspend' : 'activate')}
                        disabled={isTogglingStatus}
                        className={`px-4 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-50 ${
                            details.status === 'Active'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                    >
                        {isTogglingStatus ? 'Processing...' : (details.status === 'Active' ? 'Suspend Account' : 'Activate Account')}
                    </button>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        disabled={isResettingPassword}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all text-sm disabled:opacity-50"
                    >
                        Reset Password
                    </button>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && (
                <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
                    actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {actionMessage.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className="font-medium">{actionMessage.text}</span>
                    </div>
                    <button onClick={() => setActionMessage(null)} className="p-1 hover:bg-black/10 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${
                            activeTab === 'overview'
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${
                            activeTab === 'images'
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Generated Images ({details.usageInsights.totalImages})
                    </button>
                </div>
            </div>

            {activeTab === 'overview' ? (
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subscription Start</label>
                                    <p className="text-sm font-medium text-gray-900">{details.subscriptionStart ? formatDate(details.subscriptionStart) : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subscription End</label>
                                    <p className="text-sm font-medium text-gray-900">{details.subscriptionEnd ? formatDate(details.subscriptionEnd) : 'N/A'}</p>
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
                            {(() => {
                                const maxValue = Math.max(...details.usageInsights.usageTrend.map(item => item.value), 1);
                                return (
                                    <div className="h-56 flex items-end justify-between gap-2">
                                        {details.usageInsights.usageTrend.map(item => {
                                            const heightPercent = (item.value / maxValue) * 100;
                                            return (
                                                <div key={item.label} className="flex-1 flex flex-col items-center group">
                                                    <span className="text-xs font-bold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {item.value}
                                                    </span>
                                                    <div className="w-full flex flex-col items-center justify-end h-40">
                                                        <div
                                                            className="w-full bg-gray-900 hover:bg-black transition-all rounded-t-lg min-h-[4px]"
                                                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                        >
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">{item.label}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                            <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Avg Credits / Session</p>
                                    <p className="text-xl font-black text-gray-900">{details.usageInsights.avgCreditsPerSession}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Last Active</p>
                                    <p className="text-xl font-black text-gray-900">{details.usageInsights.lastActive}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <UserImageGallery
                    images={images}
                    isLoading={imagesLoading}
                    pagination={pagination}
                    filterOptions={filterOptions}
                    filters={filters}
                    onPageChange={handlePageChange}
                    onFilterChange={handleFilterChange}
                    onImageClick={(img) => {
                        setIsModalImageLoading(true);
                        setSelectedImage(img);
                    }}
                />
            )}

            {/* Image Detail Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4"
                    onClick={() => {
                        setSelectedImage(null);
                        setIsModalImageLoading(false);
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
                            <div className="min-w-0 flex-1 mr-2">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {selectedImage.category || 'Virtual Try-On'}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {formatDate(selectedImage.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedImage(null);
                                    setIsModalImageLoading(false);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Image */}
                        <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 flex items-center justify-center min-h-0 relative">
                            {isModalImageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/95 backdrop-blur-sm z-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent"></div>
                                        <p className="text-sm text-gray-700 font-semibold">Loading high quality image...</p>
                                    </div>
                                </div>
                            )}
                            <img
                                src={selectedImage.imageUrl}
                                alt={selectedImage.category || 'Generated image'}
                                className={`max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg shadow-lg transition-opacity duration-500 ${
                                    isModalImageLoading ? 'opacity-0' : 'opacity-100'
                                }`}
                                onLoad={() => setIsModalImageLoading(false)}
                                onError={() => setIsModalImageLoading(false)}
                            />
                        </div>

                        {/* Modal Footer - Read Only */}
                        <div className="p-3 sm:p-4 border-t border-gray-100">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getQualityBadgeColor(selectedImage.quality)}`}>
                                    {selectedImage.quality || 'Standard'} Quality
                                </span>
                                <span className="text-sm text-gray-500">
                                    {selectedImage.creditsUsed} credits used
                                </span>
                                <span className="text-sm text-gray-500">
                                    Section: {selectedImage.section || 'N/A'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Category: {selectedImage.category || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal (Suspend/Activate) */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowConfirmModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            {showConfirmModal === 'suspend' && (
                                <>
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Suspend Account?</h3>
                                    <p className="text-gray-600 mb-6">
                                        Are you sure you want to suspend <strong>{details.name}</strong>'s account? They will not be able to access the platform until reactivated.
                                    </p>
                                </>
                            )}
                            {showConfirmModal === 'activate' && (
                                <>
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Activate Account?</h3>
                                    <p className="text-gray-600 mb-6">
                                        Are you sure you want to activate <strong>{details.name}</strong>'s account? They will regain full access to the platform.
                                    </p>
                                </>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    disabled={isTogglingStatus}
                                    className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 ${
                                        showConfirmModal === 'suspend'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {isTogglingStatus ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={closePasswordModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                                <p className="text-sm text-gray-500">Set a new password for {details.name}</p>
                            </div>
                            <button
                                onClick={closePasswordModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setPasswordError('');
                                        }}
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>

                            {/* Password Requirements */}
                            <div className="text-xs text-gray-500 space-y-1">
                                <p className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                                    {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                                </p>
                                <p className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                                    {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                                </p>
                                <p className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                                    {/[a-z]/.test(newPassword) ? '✓' : '○'} One lowercase letter
                                </p>
                                <p className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                                    {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                                </p>
                            </div>

                            {/* Error Message */}
                            {passwordError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                                    {passwordError}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closePasswordModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={isResettingPassword || !newPassword || !confirmPassword}
                                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetailsPage;
