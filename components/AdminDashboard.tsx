import React, { useEffect, useState } from 'react';
import { User, AdminDashboardData, Report } from '../types';
import { getAdminDashboardData, toggleMaintenanceMode, sendBroadcastEmail, toggleUserStatus } from '../services/dashboardService';
import { getUnreadReportsCount, markAllReportsAsRead } from '../services/reportService';
import AdminManualCreditsModal from './AdminManualCreditsModal';
import ReportsList from './admin/ReportsList';
import ReportDetails from './admin/ReportDetails';
import RecommendedPresetsManager from './admin/RecommendedPresetsManager';

type AdminUser = User & { status: 'Active' | 'Blocked'; signupDate: string };

interface AdminDashboardProps {
    user: User;
    onBack: () => void;
    onViewUser: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack, onViewUser }) => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    // Broadcast Email State
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const [broadcastStatus, setBroadcastStatus] = useState('');

    // Manual Credits Modal State
    const [isManualCreditsModalOpen, setIsManualCreditsModalOpen] = useState(false);

    // Suspend User Modal State
    const [suspendModal, setSuspendModal] = useState<{
        isOpen: boolean;
        user: AdminUser | null;
        action: 'suspend' | 'activate';
    }>({ isOpen: false, user: null, action: 'suspend' });
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'recommended-presets'>('dashboard');
    const [unreadReportsCount, setUnreadReportsCount] = useState(0);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportsRefreshTrigger, setReportsRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAdminDashboardData();
                setData(result);
                setIsMaintenanceMode(result.maintenanceMode);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch unread reports count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await getUnreadReportsCount();
                setUnreadReportsCount(count);
            } catch (err) {
                console.error('Failed to fetch unread reports count:', err);
            }
        };
        fetchUnreadCount();

        // Poll every 30 seconds for new reports
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleToggleMaintenance = async () => {
        try {
            const newState = !isMaintenanceMode;
            await toggleMaintenanceMode(newState);
            setIsMaintenanceMode(newState);
            alert(`Maintenance Mode turned ${newState ? 'ON' : 'OFF'}`);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setBroadcastStatus('');
        try {
            await sendBroadcastEmail(broadcastSubject, broadcastMessage, broadcastTarget);
            setBroadcastStatus('Email broadcast sent successfully!');
            setBroadcastSubject('');
            setBroadcastMessage('');
        } catch (err: any) {
            setBroadcastStatus(`Error: ${err.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const handleManualCreditsAdded = async () => {
        // Refresh admin dashboard data
        try {
            const result = await getAdminDashboardData();
            setData(result);
            setIsManualCreditsModalOpen(false);
        } catch (err: any) {
            console.error('Failed to refresh data:', err);
        }
    };

    const openSuspendModal = (user: AdminUser) => {
        const action = user.status === 'Active' ? 'suspend' : 'activate';
        setSuspendModal({ isOpen: true, user, action });
    };

    const closeSuspendModal = () => {
        setSuspendModal({ isOpen: false, user: null, action: 'suspend' });
    };

    const handleToggleUserStatus = async () => {
        if (!suspendModal.user) return;

        setIsTogglingStatus(true);
        try {
            const newIsActive = suspendModal.action === 'activate';
            await toggleUserStatus(suspendModal.user.id, newIsActive);

            // Update local state
            setData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    users: prev.users.map(u =>
                        u.id === suspendModal.user!.id
                            ? { ...u, status: newIsActive ? 'Active' : 'Blocked' as const }
                            : u
                    )
                };
            });

            closeSuspendModal();
        } catch (err: any) {
            alert(`Failed to ${suspendModal.action} user: ${err.message}`);
        } finally {
            setIsTogglingStatus(false);
        }
    };

    const handleTabChange = async (tab: 'dashboard' | 'reports' | 'recommended-presets') => {
        setActiveTab(tab);

        // Mark all reports as read when opening Reports tab
        if (tab === 'reports' && unreadReportsCount > 0) {
            try {
                await markAllReportsAsRead();
                setUnreadReportsCount(0);
            } catch (err) {
                console.error('Failed to mark reports as read:', err);
            }
        }
    };

    const handleReportUpdate = (updatedReport: Report) => {
        setReportsRefreshTrigger(prev => prev + 1);
        setSelectedReport(updatedReport);
    };

    const formatExpiryDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading Admin Dashboard...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Command Center</h1>
                    <p className="text-gray-600">System-wide performance and user management</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-all font-medium"
                >
                    Back to Studio
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => handleTabChange('dashboard')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${
                            activeTab === 'dashboard'
                                ? 'text-primary border-b-2 border-primary bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => handleTabChange('reports')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                            activeTab === 'reports'
                                ? 'text-primary border-b-2 border-primary bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Reports
                        {unreadReportsCount > 0 && (
                            <span className="absolute top-2 right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                {unreadReportsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange('recommended-presets')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${
                            activeTab === 'recommended-presets'
                                ? 'text-primary border-b-2 border-primary bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Recommended Presets
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Users</p>
                    <p className="text-2xl font-black text-gray-900">{data.kpis.totalUsers}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Brands</p>
                    <p className="text-2xl font-black text-gray-900">{data.kpis.totalBrands}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Monthly-Recurring-Revenue</p>
                    <p className="text-2xl font-black text-indigo-600">{data.kpis.mrr}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Add-on Revenue</p>
                    <p className="text-2xl font-black text-purple-600">{data.kpis.addonRevenue}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Growth</p>
                    <p className="text-2xl font-black text-green-600">{data.kpis.growthRate}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Images</p>
                    <p className="text-2xl font-black text-gray-900">{data.kpis.totalImages}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Analytics Chart Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Usage Analytics (Weekly)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {data.analytics.usageByPeriod.map(item => (
                            <div key={item.label} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
                                    style={{ height: `${(item.value / 800) * 100}%` }}
                                ></div>
                                <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Breakdown Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">System Breakdown</h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Quality Mode</p>
                            <div className="flex h-2 rounded-full overflow-hidden">
                                <div className="bg-primary" style={{ width: `${data.analytics.breakdown.quality.pro}%` }}></div>
                                <div className="bg-indigo-200" style={{ width: `${data.analytics.breakdown.quality.standard}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] font-bold">
                                <span>PRO ({data.analytics.breakdown.quality.pro}%)</span>
                                <span>STD ({data.analytics.breakdown.quality.standard}%)</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Category</p>
                            <div className="flex h-2 rounded-full overflow-hidden">
                                <div className="bg-pink-500" style={{ width: `${data.analytics.breakdown.category.women}%` }}></div>
                                <div className="bg-blue-500" style={{ width: `${data.analytics.breakdown.category.men}%` }}></div>
                                <div className="bg-yellow-500" style={{ width: `${data.analytics.breakdown.category.kids}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] font-bold">
                                <span>WOMEN ({data.analytics.breakdown.category.women}%)</span>
                                <span>MEN ({data.analytics.breakdown.category.men}%)</span>
                                <span>KIDS ({data.analytics.breakdown.category.kids}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Broadcast Email Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Broadcast Email</h3>
                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Audience</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={broadcastTarget}
                                onChange={(e) => setBroadcastTarget(e.target.value)}
                            >
                                <option value="all">All Users</option>
                                <option value="pro">Pro Users Only</option>
                                <option value="free">Free Users Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Important Platform Update"
                                value={broadcastSubject}
                                onChange={(e) => setBroadcastSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                placeholder="Enter your message here..."
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-indigo-800 transition-all text-sm disabled:opacity-50"
                        >
                            {isSending ? 'Sending...' : 'Send Broadcast Email'}
                        </button>
                        {broadcastStatus && (
                            <p className={`text-xs font-bold mt-2 ${broadcastStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                                {broadcastStatus}
                            </p>
                        )}
                    </form>
                </div>

                {/* Admin Settings & Maintenance */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Admin Settings</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Maintenance Mode</p>
                                <p className="text-xs text-gray-500">Block access for regular users</p>
                            </div>
                            <button
                                onClick={handleToggleMaintenance}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isMaintenanceMode ? 'bg-red-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setIsManualCreditsModalOpen(true)}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Manual Add Credits
                            </button>
                            <button className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm">
                                Rotate API Keys
                            </button>
                            <button className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm">
                                Export System Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200">Export CSV</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">User / Brand</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Signup Date</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-indigo-50 text-primary rounded text-[10px] font-bold uppercase">
                                            {u.planType || 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.status === 'Active' ? (
                                            <span className="flex items-center text-[10px] font-bold text-green-600">
                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-[10px] font-bold text-red-600">
                                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5"></span>
                                                SUSPENDED
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">{u.signupDate}</td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        {u.planType === 'Free' ? (
                                            <span className="text-gray-400">—</span>
                                        ) : (
                                            formatExpiryDate(u.subscriptionEnd)
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewUser(u.id)}
                                            className="text-primary font-bold text-xs hover:underline mr-3"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => openSuspendModal(u)}
                                            className={`font-bold text-xs hover:underline ${
                                                u.status === 'Active' ? 'text-red-600' : 'text-green-600'
                                            }`}
                                        >
                                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs font-bold text-green-700 uppercase mb-1">API Success Rate</p>
                            <p className="text-2xl font-black text-green-800">{data.systemHealth.apiSuccessRate}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Avg Latency</p>
                            <p className="text-2xl font-black text-blue-800">{data.systemHealth.latency}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Error Logs</h3>
                    <div className="space-y-3">
                        {data.systemHealth.errorLogs.length > 0 ? (
                            data.systemHealth.errorLogs.map((log, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded uppercase">{log.source}</span>
                                        </div>
                                        <span className="text-xs font-bold text-red-600 mt-1">{log.message}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <p className="text-sm font-medium">No recent errors</p>
                                <p className="text-xs">System is running smoothly</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
                </>
            ) : activeTab === 'reports' ? (
                <div className="space-y-6">
                    <ReportsList
                        onSelectReport={setSelectedReport}
                        refreshTrigger={reportsRefreshTrigger}
                    />
                </div>
            ) : activeTab === 'recommended-presets' ? (
                <RecommendedPresetsManager />
            ) : null}

            {/* Report Details Modal */}
            {selectedReport && (
                <ReportDetails
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onUpdate={handleReportUpdate}
                />
            )}

            {/* Admin Manual Credits Modal */}
            <AdminManualCreditsModal
                isOpen={isManualCreditsModalOpen}
                onClose={() => setIsManualCreditsModalOpen(false)}
                users={data.users}
                onCreditsAdded={handleManualCreditsAdded}
            />

            {/* Suspend/Activate User Confirmation Modal */}
            {suspendModal.isOpen && suspendModal.user && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={closeSuspendModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                suspendModal.action === 'suspend' ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                                {suspendModal.action === 'suspend' ? (
                                    <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {suspendModal.action === 'suspend' ? 'Suspend User?' : 'Activate User?'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {suspendModal.action === 'suspend'
                                    ? 'This user will no longer be able to access the platform or use any features.'
                                    : 'This user will regain access to the platform and all their features.'}
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 text-left">
                                <p className="text-sm font-bold text-gray-900">{suspendModal.user.name}</p>
                                <p className="text-xs text-gray-500">{suspendModal.user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-primary rounded text-[10px] font-bold uppercase">
                                        {suspendModal.user.planType || 'Free'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        suspendModal.user.status === 'Active'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-red-50 text-red-600'
                                    }`}>
                                        {suspendModal.user.status === 'Active' ? 'Currently Active' : 'Currently Suspended'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={closeSuspendModal}
                                disabled={isTogglingStatus}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleToggleUserStatus}
                                disabled={isTogglingStatus}
                                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    suspendModal.action === 'suspend'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {isTogglingStatus ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    suspendModal.action === 'suspend' ? 'Suspend User' : 'Activate User'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
