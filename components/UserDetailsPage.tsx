import React, { useEffect, useState } from 'react';
import { User, UserDetails, AdminUserImage, AdminUserImagesFilters, AdminUserImagesFilterOptions } from '../types';
import { getUserDetails, getUserImages, toggleUserStatus, adminResetPassword } from '../services/dashboardService';
import UserImageGallery from './admin/UserImageGallery';
import { getAvatarById } from '../constants/avatars';

const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// Pastel colors for model donut segments
const MODEL_COLORS = ['#b8d4e8', '#ffc2d4', '#c3f0ca', '#e8d8f0', '#ffd6a5', '#bde0fe'];

const ModelDonut: React.FC<{ models: { label: string; value: number }[] }> = ({ models }) => {
    const R = 36, CX = 50, CY = 50, SW = 14;
    const circ = 2 * Math.PI * R;
    const active = models.filter(m => m.value > 0);
    let cumLen = 0;
    const slices = active.map((m, i) => {
        const len = (m.value / 100) * circ;
        const dashOffset = -cumLen;
        cumLen += len;
        return { ...m, len, dashOffset, color: MODEL_COLORS[i % MODEL_COLORS.length] };
    });
    const dominant = slices[0];
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-44 h-44">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth={SW} />
                    {slices.map((s, i) => (
                        <circle
                            key={i}
                            cx={CX} cy={CY} r={R}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={SW}
                            strokeDasharray={`${s.len} ${circ}`}
                            strokeDashoffset={s.dashOffset}
                            strokeLinecap="butt"
                        />
                    ))}
                </svg>
                {dominant && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-bold text-gray-900">{dominant.value}%</span>
                        <span className="text-[9px] text-gray-400 font-medium text-center leading-tight px-1">{dominant.label}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[11px] text-gray-600">{s.label} <span className="text-gray-400 font-medium">{s.value}%</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TrendLineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const n = data.length;
    if (n === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const VW = 600, VH = 130, PAD_T = 18, PAD_B = 6, PAD_X = 16;
    const plotW = VW - PAD_X * 2;
    const plotH = VH - PAD_T - PAD_B;

    // Current period points
    const pts = data.map((item, i) => ({
        x: PAD_X + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW),
        y: PAD_T + plotH - (item.value / maxValue) * plotH,
        ...item,
    }));

    // Synthetic "previous period": 3-point smoothed + scaled to ~72%
    const compPts = data.map((_, i) => {
        const prev = data[Math.max(0, i - 1)].value;
        const curr = data[i].value;
        const next = data[Math.min(n - 1, i + 1)].value;
        const v = Math.round(((prev + curr + next) / 3) * 0.72);
        return { x: pts[i].x, y: PAD_T + plotH - (v / maxValue) * plotH, value: v };
    });

    // Smooth catmull-rom bezier path
    const makePath = (points: { x: number; y: number }[]) => {
        if (points.length < 2) return `M ${points[0].x},${points[0].y}`;
        const d = [`M ${points[0].x},${points[0].y}`];
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(i - 1, 0)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(i + 2, points.length - 1)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
        }
        return d.join(' ');
    };

    const linePath = makePath(pts);
    const compPath = makePath(compPts);

    // Tooltip dimensions + positioning
    const TT_W = 150, TT_H = 64, TT_GAP = 12;

    return (
        <div className="overflow-visible">
            <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full overflow-visible">

                {/* Previous period — dashed */}
                <path d={compPath} fill="none" stroke="#d1d5db" strokeWidth="1.2"
                    strokeLinecap="round" strokeDasharray="4,4" />

                {/* Current period — solid */}
                <path d={linePath} fill="none" stroke="#374151" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />

                {/* Hover state */}
                {(() => {
                    if (hoveredIdx === null) return null;
                    const p = pts[hoveredIdx];
                    const cp = compPts[hoveredIdx];
                    const item = data[hoveredIdx];
                    const showRight = p.x < VW - TT_W - TT_GAP - PAD_X;
                    const ttX = showRight ? p.x + TT_GAP : p.x - TT_W - TT_GAP;
                    const ttY = Math.max(0, Math.min(p.y - TT_H / 2, VH - TT_H));
                    return (
                        <>
                            {/* Vertical dashed guide */}
                            <line x1={p.x} y1={PAD_T} x2={p.x} y2={VH - PAD_B}
                                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
                            {/* Dot on current line */}
                            <circle cx={p.x} cy={p.y} r="4.5" fill="white" stroke="#374151" strokeWidth="2" />
                            {/* Dot on previous line */}
                            <circle cx={cp.x} cy={cp.y} r="3" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                            {/* Tooltip card */}
                            <rect x={ttX} y={ttY} width={TT_W} height={TT_H} rx="7" fill="#111827" />
                            {/* Header */}
                            <text x={ttX + 12} y={ttY + 19} fontSize="10.5" fill="white" fontWeight="700"
                                fontFamily="system-ui,sans-serif">
                                {item.label}
                            </text>
                            {/* Current period row */}
                            <text x={ttX + 12} y={ttY + 37} fontSize="9" fill="#9ca3af"
                                fontFamily="system-ui,sans-serif">
                                Current period:
                            </text>
                            <text x={ttX + TT_W - 12} y={ttY + 37} fontSize="9" fill="white"
                                fontWeight="600" textAnchor="end" fontFamily="system-ui,sans-serif">
                                {item.value}
                            </text>
                            {/* Previous period row */}
                            <text x={ttX + 12} y={ttY + 53} fontSize="9" fill="#9ca3af"
                                fontFamily="system-ui,sans-serif">
                                Previous period:
                            </text>
                            <text x={ttX + TT_W - 12} y={ttY + 53} fontSize="9" fill="white"
                                fontWeight="600" textAnchor="end" fontFamily="system-ui,sans-serif">
                                {cp.value}
                            </text>
                        </>
                    );
                })()}

                {/* Invisible hit areas for each column */}
                {pts.map((p, i) => (
                    <rect key={i}
                        x={p.x - (plotW / n) / 2} y={0}
                        width={plotW / n} height={VH}
                        fill="transparent" style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    />
                ))}
            </svg>
            <div className="flex mt-3">
                {data.map((item) => (
                    <span key={item.label} className="flex-1 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

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

    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">Loading user details...</div>;
    if (error) return <div className="p-8 text-red-600 text-sm">Error: {error}</div>;
    if (!details) return null;

    const avatarSrc = getAvatarById(details.avatar)?.src;

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

            {/* ── Header ────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <span>Users</span>
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{details.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowConfirmModal(details.status === 'Active' ? 'suspend' : 'activate')}
                        disabled={isTogglingStatus}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                            details.status === 'Active'
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        }`}
                    >
                        {isTogglingStatus ? 'Processing...' : (details.status === 'Active' ? 'Suspend Account' : 'Activate Account')}
                    </button>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        disabled={isResettingPassword}
                        className="flex items-center gap-2 px-3 py-2 bg-[#191919] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset Password
                    </button>
                </div>
            </header>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-auto p-8">

                {/* Action toast */}
                {actionMessage && (
                    <div className={`mb-6 px-4 py-3 rounded-xl flex items-center justify-between border ${
                        actionMessage.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {actionMessage.type === 'success' ? (
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className="text-sm font-medium">{actionMessage.text}</span>
                        </div>
                        <button onClick={() => setActionMessage(null)} className="p-1 hover:bg-black/10 rounded-md">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Profile Hero Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between gap-6">
                        {/* Left: avatar + identity */}
                        <div className="flex items-center gap-4 min-w-0">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={details.name}
                                    className="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg font-bold">{getInitials(details.name || '')}</span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h2 className="text-lg font-bold text-gray-900 truncate">{details.name}</h2>
                                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md flex-shrink-0">
                                        {details.planType || 'Free'}
                                    </span>
                                    {details.status === 'Active' ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md flex-shrink-0">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md flex-shrink-0">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Blocked
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{details.email}</p>
                            </div>
                        </div>

                        {/* Right: key stats */}
                        <div className="flex items-center divide-x divide-gray-200 flex-shrink-0">
                            <div className="px-6 text-center">
                                <p className="text-xs text-gray-400 mb-0.5">Total Images</p>
                                <p className="text-xl font-bold text-gray-900">{details.usageInsights.totalImages.toLocaleString()}</p>
                            </div>
                            <div className="px-6 text-center">
                                <p className="text-xs text-gray-400 mb-0.5">Credits Used</p>
                                <p className="text-xl font-bold text-gray-900">{details.usageInsights.totalTokens}</p>
                            </div>
                            <div className="pl-6 text-center">
                                <p className="text-xs text-gray-400 mb-0.5">Last Active</p>
                                <p className="text-sm font-bold text-gray-900">{details.usageInsights.lastActive}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === 'overview'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === 'images'
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Generated Images
                        <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                            {details.usageInsights.totalImages}
                        </span>
                    </button>
                </div>

                {/* ── Overview Tab ───────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">

                        {/* Row 1: Image Stats + Peak Usage */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-5">Image Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Total Images</p>
                                        <p className="text-3xl font-bold text-gray-900">{details.usageInsights.totalImages.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Credits Used</p>
                                        <p className="text-3xl font-bold text-gray-900">{details.usageInsights.totalTokens}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-5">Peak Usage</h3>
                                <p className="text-base font-bold text-gray-900">{details.usageInsights.peakUsage.day}</p>
                                <p className="text-sm text-gray-500 mt-0.5 mb-5">{details.usageInsights.peakUsage.time}</p>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-800 rounded-full" style={{ width: '85%' }} />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Usage intensity</p>
                            </div>
                        </div>

                        {/* Row 2: Personal Info + Usage Breakdown */}
                        <div className="grid grid-cols-3 gap-6">

                            {/* Personal & Account Info */}
                            <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Info</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Full Name', value: details.name },
                                        { label: 'Email Address', value: details.email },
                                        { label: 'Brand Name', value: details.brandName || '—' },
                                        { label: 'Website', value: details.website || '—' },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                                            <p className="text-sm text-gray-900 font-medium break-all">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 my-5" />

                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Plan</p>
                                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                                            {details.planType || 'Free'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Status</p>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                            details.status === 'Active' ? 'text-green-700' : 'text-red-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${details.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {details.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Subscription Start</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {details.subscriptionStart ? formatDate(details.subscriptionStart) : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Subscription End</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {details.subscriptionEnd ? formatDate(details.subscriptionEnd) : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Breakdown */}
                            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-6">Usage Breakdown</h3>
                                <div className="grid grid-cols-2 divide-x divide-gray-100">
                                    {/* Categories — progress bars */}
                                    <div className="pr-6">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Categories</p>
                                        <div className="space-y-4">
                                            {details.usageInsights.categories.map(cat => (
                                                <div key={cat.label}>
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-gray-600 font-medium">{cat.label}</span>
                                                        <span className="text-gray-900 font-bold">{cat.value}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gray-800 rounded-full" style={{ width: `${cat.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Models — donut chart */}
                                    <div className="pl-6 flex flex-col">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Models</p>
                                        <div className="flex-1 flex items-center justify-center">
                                            <ModelDonut models={details.usageInsights.models} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Monthly Trend */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-6">Usage Trend (Monthly)</h3>
                            <TrendLineChart data={details.usageInsights.usageTrend} />
                            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Avg Credits / Session</p>
                                    <p className="text-xl font-bold text-gray-900">{details.usageInsights.avgCreditsPerSession}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Last Active</p>
                                    <p className="text-xl font-bold text-gray-900">{details.usageInsights.lastActive}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* ── Generated Images Tab ───────────────────────────────────── */}
                {activeTab === 'images' && (
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
            </div>

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

                        {/* Prompt Details */}
                        {selectedImage.promptData && (
                            <div className="px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                                    {selectedImage.promptData.background && (
                                        <div>
                                            <span className="font-medium text-gray-500">Background:</span>{' '}
                                            <span className="text-gray-800">{selectedImage.promptData.background}</span>
                                        </div>
                                    )}
                                    {selectedImage.promptData.pose && (
                                        <div>
                                            <span className="font-medium text-gray-500">Pose:</span>{' '}
                                            <span className="text-gray-800">{selectedImage.promptData.pose}</span>
                                        </div>
                                    )}
                                    {selectedImage.promptData.expression && (
                                        <div>
                                            <span className="font-medium text-gray-500">Expression:</span>{' '}
                                            <span className="text-gray-800">{selectedImage.promptData.expression}</span>
                                        </div>
                                    )}
                                    {selectedImage.promptData.view && (
                                        <div>
                                            <span className="font-medium text-gray-500">View:</span>{' '}
                                            <span className="text-gray-800">{selectedImage.promptData.view}</span>
                                        </div>
                                    )}
                                </div>
                                {selectedImage.promptData.fullPrompt && (
                                    <details className="mt-2">
                                        <summary className="text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                                            View Full Prompt
                                        </summary>
                                        <pre className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                            {selectedImage.promptData.fullPrompt}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

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
