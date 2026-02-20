import React, { useEffect, useRef, useState } from 'react';
import { User, AdminDashboardData, Report } from '../types';
import { getAdminDashboardData, toggleMaintenanceMode, sendBroadcastEmail, toggleUserStatus, triggerHistoryCleanup } from '../services/dashboardService';
import { getUnreadReportsCount, markAllReportsAsRead } from '../services/reportService';
import AdminManualCreditsModal from './AdminManualCreditsModal';
import ReportsList from './admin/ReportsList';
import ReportDetails from './admin/ReportDetails';
import RecommendedPresetsManager from './admin/RecommendedPresetsManager';
import CouponManager from './admin/CouponManager';

type AdminUser = User & { status: 'Active' | 'Blocked'; signupDate: string };

interface AdminDashboardProps {
    user: User;
    onBack: () => void;
    onViewUser: (userId: string) => void;
}

// ─── Pure helpers (module-level, stable references) ──────────────────────────
const getInitials = (name: string) =>
    name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

// ─── Inline SVG Line Chart ──────────────────────────────────────────────────
const LineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    if (!data.length) return <div className="h-40 bg-gray-50 rounded-lg" />;
    const W = 800, H = 140;
    const pad = { t: 10, r: 10, b: 28, l: 10 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value)) * 0.75;
    const xp = (i: number) => pad.l + (i / (data.length - 1)) * cw;
    const yp = (v: number) => pad.t + ch - ((v - min) / (max - min || 1)) * ch;
    const mainPts = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xp(i)} ${yp(d.value)}`).join(' ');
    const compPts = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xp(i)} ${yp(d.value * 0.72)}`).join(' ');
    const area = `${mainPts} L ${xp(data.length - 1)} ${pad.t + ch} L ${pad.l} ${pad.t + ch} Z`;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#191919" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#191919" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#chartFill)" />
            <path d={compPts} fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="6 4" />
            <path d={mainPts} fill="none" stroke="#191919" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((d, i) => (
                <text key={i} x={xp(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="system-ui, sans-serif">
                    {d.label}
                </text>
            ))}
        </svg>
    );
};

// ─── Sidebar nav item ────────────────────────────────────────────────────────
const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: React.ReactNode;
    onClick?: () => void;
    chevron?: boolean;
}> = ({ icon, label, active, badge, onClick, chevron = true }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        {badge}
        {chevron && (
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        )}
    </button>
);

// ─── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    badge: string;
}> = ({ icon, label, value, badge }) => (
    <div className="bg-white rounded-xl p-5 flex items-center gap-4 border border-gray-200">
        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <div className="flex items-center gap-2 flex-wrap">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 whitespace-nowrap">
                    ↑ {badge}
                </span>
            </div>
        </div>
    </div>
);

// ─── Users Table — MUST be at module level so React never remounts it ─────────
interface UsersTableProps {
    users: AdminUser[];
    title?: string;
    showSearch?: boolean;
    tableSearch: string;
    onTableSearchChange: (v: string) => void;
    onViewUser: (id: string) => void;
    onSuspend: (u: AdminUser) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
    users,
    title = 'Users',
    showSearch,
    tableSearch,
    onTableSearchChange,
    onViewUser,
    onSuspend,
}) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {showSearch && (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg w-64">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, email or plan…"
                        value={tableSearch}
                        onChange={e => onTableSearchChange(e.target.value)}
                        className="text-sm text-gray-700 flex-1 outline-none bg-transparent placeholder-gray-400"
                    />
                    {tableSearch && (
                        <button onClick={() => onTableSearchChange('')} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-200 bg-white">
                        <th className="px-6 py-3 w-10">
                            <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        {(['User', 'Email', 'Date', 'Status', 'Plan'] as const).map(col => (
                            <th key={col} className="px-4 py-3 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1">{col}</span>
                            </th>
                        ))}
                        <th className="px-4 py-3 w-20" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                                No users match your search.
                            </td>
                        </tr>
                    ) : users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <input type="checkbox" className="rounded border-gray-300" />
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#191919] text-xs font-bold">{getInitials(u.name || '')}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                        <p className="text-xs text-gray-500">@{u.email.split('@')[0]}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{u.signupDate}</td>
                            <td className="px-4 py-4">
                                {u.status === 'Active' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-md">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-md">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Blocked
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-4">
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                    {u.planType || 'Free'}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => onViewUser(u.id)}
                                        title="View user"
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onSuspend(u)}
                                        title={u.status === 'Active' ? 'Suspend user' : 'Activate user'}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// ─── Searchable sections for sidebar ─────────────────────────────────────────
type TabKey = 'dashboard' | 'users' | 'reports' | 'recommended-presets' | 'coupons';
const SECTIONS: { label: string; description: string; tab: TabKey | null; action?: string }[] = [
    { label: 'Dashboard', description: 'Overview, metrics & chart', tab: 'dashboard' },
    { label: 'Users', description: 'User management page', tab: 'users' },
    { label: 'Reports', description: 'View user reports', tab: 'reports' },
    { label: 'Presets', description: 'Recommended preset manager', tab: 'recommended-presets' },
    { label: 'Coupons', description: 'Coupon management', tab: 'coupons' },
    { label: 'Recent Sign-ups', description: 'Latest 5 new users on dashboard', tab: 'dashboard' },
    { label: 'System Logs', description: 'Error logs & API health', tab: 'dashboard' },
    { label: 'Broadcast Email', description: 'Send emails to all users', tab: 'dashboard' },
    { label: 'Maintenance Mode', description: 'Toggle site maintenance', tab: null, action: 'settings' },
    { label: 'Net Revenue Chart', description: 'Analytics line chart', tab: 'dashboard' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack, onViewUser }) => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    // Broadcast
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const [broadcastStatus, setBroadcastStatus] = useState('');
    const [showBroadcast, setShowBroadcast] = useState(false);

    // Modals
    const [isManualCreditsModalOpen, setIsManualCreditsModalOpen] = useState(false);
    const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; user: AdminUser | null; action: 'suspend' | 'activate' }>({ isOpen: false, user: null, action: 'suspend' });
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [cleanupModal, setCleanupModal] = useState(false);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    const [cleanupResult, setCleanupResult] = useState<{ success: boolean; message: string } | null>(null);

    // Navigation
    const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
    const [unreadReportsCount, setUnreadReportsCount] = useState(0);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportsRefreshTrigger, setReportsRefreshTrigger] = useState(0);

    // UI state
    const [timeRange, setTimeRange] = useState<'12m' | '30d' | '7d' | '24h'>('12m');
    const [tableSearch, setTableSearch] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Sidebar section search
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [sidebarSearchFocused, setSidebarSearchFocused] = useState(false);
    const sidebarSearchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getAdminDashboardData()
            .then(result => { setData(result); setIsMaintenanceMode(result.maintenanceMode); })
            .catch((err: any) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const fetch = async () => {
            try { setUnreadReportsCount(await getUnreadReportsCount()); }
            catch (err) { console.error('Failed to fetch unread reports count:', err); }
        };
        fetch();
        const id = setInterval(fetch, 30000);
        return () => clearInterval(id);
    }, []);

    const handleToggleMaintenance = async () => {
        try {
            const newState = !isMaintenanceMode;
            await toggleMaintenanceMode(newState);
            setIsMaintenanceMode(newState);
        } catch (err: any) { alert(err.message); }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setBroadcastStatus('');
        try {
            await sendBroadcastEmail(broadcastSubject, broadcastMessage, broadcastTarget);
            setBroadcastStatus('Email broadcast sent successfully!');
            setBroadcastSubject(''); setBroadcastMessage('');
        } catch (err: any) { setBroadcastStatus(`Error: ${err.message}`); }
        finally { setIsSending(false); }
    };

    const handleManualCreditsAdded = async () => {
        try { const r = await getAdminDashboardData(); setData(r); setIsManualCreditsModalOpen(false); }
        catch (err: any) { console.error('Failed to refresh data:', err); }
    };

    const openSuspendModal = (u: AdminUser) =>
        setSuspendModal({ isOpen: true, user: u, action: u.status === 'Active' ? 'suspend' : 'activate' });
    const closeSuspendModal = () => setSuspendModal({ isOpen: false, user: null, action: 'suspend' });

    const handleToggleUserStatus = async () => {
        if (!suspendModal.user) return;
        setIsTogglingStatus(true);
        try {
            const newIsActive = suspendModal.action === 'activate';
            await toggleUserStatus(suspendModal.user.id, newIsActive);
            setData(prev => prev ? {
                ...prev,
                users: prev.users.map(u =>
                    u.id === suspendModal.user!.id ? { ...u, status: newIsActive ? 'Active' : 'Blocked' as const } : u
                )
            } : prev);
            closeSuspendModal();
        } catch (err: any) { alert(`Failed to ${suspendModal.action} user: ${err.message}`); }
        finally { setIsTogglingStatus(false); }
    };

    const handleCleanupHistory = async () => {
        setIsCleaningUp(true); setCleanupResult(null);
        try {
            const r = await triggerHistoryCleanup();
            setCleanupResult({ success: true, message: r.message });
            setData(await getAdminDashboardData());
        } catch (err: any) { setCleanupResult({ success: false, message: err.message || 'Cleanup failed' }); }
        finally { setIsCleaningUp(false); }
    };

    const handleTabChange = async (tab: TabKey) => {
        setActiveTab(tab);
        setTableSearch('');
        if (tab === 'reports' && unreadReportsCount > 0) {
            try { await markAllReportsAsRead(); setUnreadReportsCount(0); }
            catch (err) { console.error('Failed to mark reports as read:', err); }
        }
    };

    const handleReportUpdate = (updatedReport: Report) => {
        setReportsRefreshTrigger(p => p + 1);
        setSelectedReport(updatedReport);
    };

    // Section search handler
    const handleSectionSelect = (section: typeof SECTIONS[0]) => {
        setSidebarSearch('');
        setSidebarSearchFocused(false);
        if (section.action === 'settings') { setSettingsOpen(true); return; }
        if (section.tab) handleTabChange(section.tab);
        if (section.label === 'Broadcast Email') setShowBroadcast(true);
    };

    const sidebarResults = sidebarSearch.trim()
        ? SECTIONS.filter(s => s.label.toLowerCase().includes(sidebarSearch.toLowerCase()) || s.description.toLowerCase().includes(sidebarSearch.toLowerCase()))
        : [];

    const getFilteredUsers = (users: AdminUser[]) => {
        const term = tableSearch.toLowerCase().trim();
        if (!term) return users;
        return users.filter(u =>
            u.name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term) ||
            u.planType?.toLowerCase().includes(term)
        );
    };

    const getRecentUsers = (users: AdminUser[]) =>
        [...users].sort((a, b) => {
            const da = new Date(a.signupDate).getTime();
            const db = new Date(b.signupDate).getTime();
            return isNaN(db) || isNaN(da) ? 0 : db - da;
        }).slice(0, 5);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-8 text-red-600 text-sm">Error: {error}</div>;
    if (!data) return null;

    const timeLabels = { '12m': '12 months', '30d': '30 days', '7d': '7 days', '24h': '24 hours' };
    const filteredUsers = getFilteredUsers(data.users);
    const recentUsers = getRecentUsers(data.users);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* ═══ SIDEBAR ═══════════════════════════════════════════════════════ */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

                {/* Header — "Admin Dashboard" text */}
                <div className="flex items-center gap-2.5 px-5 h-[61px] border-b border-gray-100 flex-shrink-0">
                    <div className="w-7 h-7 bg-[#191919] rounded-md flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">Admin Dashboard</span>
                </div>

                {/* Sidebar Section Search */}
                <div className="px-4 pt-4 pb-2 flex-shrink-0 relative">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={sidebarSearchRef}
                            type="text"
                            placeholder="Search sections…"
                            value={sidebarSearch}
                            onChange={e => setSidebarSearch(e.target.value)}
                            onFocus={() => setSidebarSearchFocused(true)}
                            onBlur={() => setTimeout(() => setSidebarSearchFocused(false), 150)}
                            className="text-sm text-gray-700 flex-1 outline-none bg-transparent placeholder-gray-400"
                        />
                        {sidebarSearch ? (
                            <button onClick={() => { setSidebarSearch(''); sidebarSearchRef.current?.focus(); }} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        ) : (
                            <kbd className="text-gray-400 text-[10px] border border-gray-300 rounded px-1 py-0.5 font-mono">⌘K</kbd>
                        )}
                    </div>

                    {/* Search results dropdown */}
                    {sidebarSearchFocused && sidebarResults.length > 0 && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                            {sidebarResults.map(s => (
                                <button
                                    key={s.label}
                                    onMouseDown={() => handleSectionSelect(s)}
                                    className="w-full flex flex-col px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                                >
                                    <span className="text-sm font-medium text-gray-900">{s.label}</span>
                                    <span className="text-[11px] text-gray-500">{s.description}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {sidebarSearchFocused && sidebarSearch.trim() && sidebarResults.length === 0 && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-3 py-3">
                            <p className="text-sm text-gray-400">No sections found.</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                    <NavItem
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>}
                        label="Home" onClick={onBack} chevron={false}
                    />
                    <NavItem
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        label="Dashboard" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')}
                    />
                    <NavItem
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        label="Users" active={activeTab === 'users'}
                        badge={<span className="text-[10px] font-bold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">{data.kpis.totalUsers}</span>}
                        onClick={() => handleTabChange('users')}
                    />
                    <NavItem
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        label="Reports" active={activeTab === 'reports'}
                        badge={unreadReportsCount > 0
                            ? <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadReportsCount}</span>
                            : undefined}
                        onClick={() => handleTabChange('reports')}
                    />
                    <NavItem
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>}
                        label="Presets" active={activeTab === 'recommended-presets'} onClick={() => handleTabChange('recommended-presets')}
                    />
                    <NavItem
                        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>}
                        label="Coupons" active={activeTab === 'coupons'} onClick={() => handleTabChange('coupons')}
                    />

                    <div className="my-2 border-t border-gray-100" />

                    {/* Settings — accordion for maintenance */}
                    <button
                        onClick={() => setSettingsOpen(p => !p)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <span className="w-4 h-4 flex-shrink-0">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </span>
                        <span className="flex-1 text-left">Settings</span>
                        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${settingsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {settingsOpen && (
                        <div className="mx-1 mt-0.5 mb-1 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Maintenance Mode</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-800">{isMaintenanceMode ? 'Currently ON' : 'Currently OFF'}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{isMaintenanceMode ? 'Users are blocked.' : 'Users have full access.'}</p>
                                </div>
                                {/* Toggle — inline style used to guarantee the knob moves correctly */}
                                <button
                                    onClick={handleToggleMaintenance}
                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${isMaintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                                >
                                    <span
                                        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
                                        style={{ transform: `translateX(${isMaintenanceMode ? '20px' : '2px'})` }}
                                    />
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* User profile */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{getInitials(user.name || '')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
            </aside>

            {/* ═══ MAIN CONTENT ══════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-start justify-between flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                            <div className="w-5 h-5 rounded-full bg-[#191919] flex items-center justify-center">
                                <span className="text-white text-[9px] font-bold">{getInitials(user.name || '')}</span>
                            </div>
                            <span>{user.name}</span>
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-gray-900 font-medium capitalize">{activeTab.replace('-', ' ')}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">My dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowBroadcast(p => !p)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Broadcast
                        </button>
                        <button
                            onClick={() => setIsManualCreditsModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#191919] text-white rounded-lg hover:bg-black transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Credits
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8">

                    {/* ── DASHBOARD ─────────────────────────────────────────────── */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <MetricCard
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                    label="Monthly Revenue" value={data.kpis.mrr} badge={data.kpis.growthRate}
                                />
                                <MetricCard
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                    label="Total Users" value={data.kpis.totalUsers.toLocaleString()} badge={`${data.kpis.totalBrands} brands`}
                                />
                                <MetricCard
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                    label="Total Images" value={data.kpis.totalImages.toLocaleString()} badge="generated"
                                />
                                <MetricCard
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
                                    label="Add-on Revenue" value={data.kpis.addonRevenue} badge="add-ons"
                                />
                            </div>

                            {/* Chart */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <button className="flex items-center gap-1.5 text-sm text-gray-600 font-medium mb-1 hover:text-gray-900">
                                            Net revenue
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <p className="text-3xl font-bold text-gray-900">{data.kpis.mrr}</p>
                                            <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">↑ {data.kpis.growthRate}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {(['12m', '30d', '7d', '24h'] as const).map(r => (
                                            <button key={r} onClick={() => setTimeRange(r)}
                                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${timeRange === r ? 'bg-[#191919] text-white' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                                                {timeLabels[r]}
                                            </button>
                                        ))}
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 ml-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                                            Filters
                                        </button>
                                    </div>
                                </div>
                                <LineChart data={data.analytics.usageByPeriod} />
                            </div>

                            {/* Recent Sign-ups — on dashboard */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <h3 className="text-base font-semibold text-gray-900">Recent Sign-ups</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">Last 5</span>
                                </div>
                                <div className="space-y-2">
                                    {recentUsers.map((u, i) => (
                                        <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                                            <div className="w-8 h-8 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-bold">{getInitials(u.name || '')}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xs text-gray-500">{u.signupDate}</span>
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-medium rounded">{u.planType || 'Free'}</span>
                                                <span className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} title={u.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Broadcast */}
                            {showBroadcast && (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4">Broadcast Email</h3>
                                    <form onSubmit={handleSendBroadcast} className="space-y-3">
                                        <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)}>
                                            <option value="all">All Users</option>
                                            <option value="pro">Pro Users Only</option>
                                            <option value="free">Free Users Only</option>
                                        </select>
                                        <input type="text" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none" placeholder="Subject" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} />
                                        <textarea required rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none resize-none" placeholder="Enter your message…" value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} />
                                        <button type="submit" disabled={isSending} className="px-4 py-2 bg-[#191919] text-white rounded-lg font-medium text-sm hover:bg-black transition-colors disabled:opacity-50">
                                            {isSending ? 'Sending…' : 'Send Broadcast'}
                                        </button>
                                        {broadcastStatus && <p className={`text-xs font-medium ${broadcastStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{broadcastStatus}</p>}
                                    </form>
                                </div>
                            )}

                            {/* System Health */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border border-gray-200 rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">System Health</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-[11px] font-semibold text-green-700 mb-1">API Success Rate</p>
                                            <p className="text-xl font-bold text-green-800">{data.systemHealth.apiSuccessRate}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-[11px] font-semibold text-blue-700 mb-1">Avg Latency</p>
                                            <p className="text-xl font-bold text-blue-800">{data.systemHealth.latency}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Error Logs</h3>
                                    <div className="space-y-2">
                                        {data.systemHealth.errorLogs.length > 0 ? data.systemHealth.errorLogs.map((log, i) => (
                                            <div key={i} className="p-2 bg-red-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">{log.source}</span>
                                                </div>
                                                <span className="text-xs font-medium text-red-600">{log.message}</span>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-xs">No recent errors</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── USERS ─────────────────────────────────────────────────── */}
                    {activeTab === 'users' && (
                        <UsersTable
                            users={filteredUsers}
                            title="User Management"
                            showSearch
                            tableSearch={tableSearch}
                            onTableSearchChange={setTableSearch}
                            onViewUser={onViewUser}
                            onSuspend={openSuspendModal}
                        />
                    )}

                    {activeTab === 'reports' && <ReportsList onSelectReport={setSelectedReport} refreshTrigger={reportsRefreshTrigger} />}
                    {activeTab === 'recommended-presets' && <RecommendedPresetsManager />}
                    {activeTab === 'coupons' && <CouponManager />}
                </div>
            </div>

            {/* ═══ MODALS ═════════════════════════════════════════════════════ */}
            {selectedReport && <ReportDetails report={selectedReport} onClose={() => setSelectedReport(null)} onUpdate={handleReportUpdate} />}

            <AdminManualCreditsModal isOpen={isManualCreditsModalOpen} onClose={() => setIsManualCreditsModalOpen(false)} users={data.users} onCreditsAdded={handleManualCreditsAdded} />

            {cleanupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !isCleaningUp && setCleanupModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Old Images?</h3>
                            <p className="text-gray-600 mb-4">Permanently delete all generated images and history records older than 30 days. This cannot be undone.</p>
                            {cleanupResult && <div className={`p-3 rounded-lg mb-4 ${cleanupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}><p className={`text-sm font-bold ${cleanupResult.success ? 'text-green-700' : 'text-red-700'}`}>{cleanupResult.message}</p></div>}
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setCleanupModal(false)} disabled={isCleaningUp} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50">{cleanupResult?.success ? 'Close' : 'Cancel'}</button>
                            {!cleanupResult?.success && <button onClick={handleCleanupHistory} disabled={isCleaningUp} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">{isCleaningUp ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</> : 'Delete Old Images'}</button>}
                        </div>
                    </div>
                </div>
            )}

            {suspendModal.isOpen && suspendModal.user && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeSuspendModal}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${suspendModal.action === 'suspend' ? 'bg-red-100' : 'bg-green-100'}`}>
                                {suspendModal.action === 'suspend'
                                    ? <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    : <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{suspendModal.action === 'suspend' ? 'Suspend User?' : 'Activate User?'}</h3>
                            <p className="text-gray-600 mb-4">{suspendModal.action === 'suspend' ? 'This user will no longer be able to access the platform.' : 'This user will regain full access to the platform.'}</p>
                            <div className="bg-gray-50 rounded-lg p-3 text-left">
                                <p className="text-sm font-bold text-gray-900">{suspendModal.user.name}</p>
                                <p className="text-xs text-gray-500">{suspendModal.user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase">{suspendModal.user.planType || 'Free'}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${suspendModal.user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{suspendModal.user.status === 'Active' ? 'Currently Active' : 'Currently Blocked'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={closeSuspendModal} disabled={isTogglingStatus} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                            <button onClick={handleToggleUserStatus} disabled={isTogglingStatus} className={`flex-1 px-4 py-2.5 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${suspendModal.action === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isTogglingStatus ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</> : suspendModal.action === 'suspend' ? 'Suspend User' : 'Activate User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
