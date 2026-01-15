import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { encryptData } from '../services/encryption';

interface User {
    id: string;
    email: string;
    fullName?: string;
    name?: string;
    brandName?: string;
    creditsBalance?: number;
}

interface AdminManualCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onCreditsAdded: () => void;
}

const CREDIT_PACKS = [
    { id: 'flash-s', name: 'Flash Pack S', credits: 50, price: 399 },
    { id: 'flash-m', name: 'Flash Pack M', credits: 150, price: 999 },
    { id: 'flash-l', name: 'Flash Pack L', credits: 300, price: 1799 }
];

const AdminManualCreditsModal: React.FC<AdminManualCreditsModalProps> = ({
    isOpen,
    onClose,
    users,
    onCreditsAdded
}) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedPack, setSelectedPack] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedUserId('');
            setSelectedPack('');
            setShowConfirmation(false);
            setMessage(null);
            setSearchTerm('');
        }
    }, [isOpen]);

    // Filter users based on search
    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.email?.toLowerCase().includes(searchLower) ||
            user.fullName?.toLowerCase().includes(searchLower) ||
            user.name?.toLowerCase().includes(searchLower) ||
            user.brandName?.toLowerCase().includes(searchLower)
        );
    });

    const selectedUser = users.find(u => u.id === selectedUserId);
    const selectedPackInfo = CREDIT_PACKS.find(p => p.id === selectedPack);

    const handleAddCreditsClick = () => {
        if (!selectedUserId || !selectedPack) {
            setMessage({ type: 'error', text: 'Please select a user and a credit pack' });
            return;
        }
        setMessage(null);
        setShowConfirmation(true);
    };

    const handleConfirmAddCredits = async () => {
        if (!selectedUserId || !selectedPack) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            // Encrypt sensitive data before sending
            const [encryptedUserId, encryptedPackId] = await Promise.all([
                encryptData(selectedUserId),
                encryptData(selectedPack)
            ]);

            const response = await apiClient.post<{
                success: boolean;
                message: string;
                user?: any;
                error?: string;
            }>('/admin/manual-credits', {
                userId: encryptedUserId,
                packId: encryptedPackId,
                encrypted: true
            });

            if (response.success) {
                setMessage({ type: 'success', text: response.message });
                setShowConfirmation(false);
                setSelectedUserId('');
                setSelectedPack('');

                // Notify parent to refresh data
                setTimeout(() => {
                    onCreditsAdded();
                }, 1500);
            } else {
                setMessage({ type: 'error', text: response.error || 'Failed to add credits' });
                setShowConfirmation(false);
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to add credits' });
            setShowConfirmation(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Admin Manual Credits Addon</h2>
                            <p className="text-sm text-gray-500 mt-1">Add credits to a user's account manually</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-xl border ${
                                message.type === 'success'
                                    ? 'bg-green-50 border-green-100 text-green-700'
                                    : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                                <p className="font-bold text-sm">{message.text}</p>
                            </div>
                        )}

                        {!showConfirmation ? (
                            <>
                                {/* User Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                        Select User
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name, email, or brand..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-2"
                                        />
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer bg-white"
                                        >
                                            <option value="">-- Select a user --</option>
                                            {filteredUsers.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.fullName || user.name || 'Unknown'} - {user.email} ({user.creditsBalance || 0} credits)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-[58px] pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {selectedUser && (
                                        <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                            <p className="text-xs text-indigo-700">
                                                <span className="font-bold">Current Balance:</span> {selectedUser.creditsBalance || 0} credits
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Credit Pack Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                        Select Credit Pack
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {CREDIT_PACKS.map(pack => (
                                            <button
                                                key={pack.id}
                                                type="button"
                                                onClick={() => setSelectedPack(pack.id)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                                    selectedPack === pack.id
                                                        ? 'border-primary bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <p className="text-lg font-black text-gray-900">{pack.credits}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">Credits</p>
                                                <p className="text-xs font-bold text-primary mt-1">{pack.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Credits Button */}
                                <button
                                    onClick={handleAddCreditsClick}
                                    disabled={!selectedUserId || !selectedPack}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm hover:bg-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Credits
                                </button>
                            </>
                        ) : (
                            /* Confirmation Dialog */
                            <div className="space-y-6">
                                <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-yellow-800 mb-2">Confirm Credit Addition</h3>
                                            <p className="text-sm text-yellow-700">
                                                Are you sure you want to add <span className="font-bold">{selectedPackInfo?.credits} credits</span> to the account of:
                                            </p>
                                            <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-200">
                                                <p className="text-sm font-bold text-gray-900">{selectedUser?.fullName || selectedUser?.name}</p>
                                                <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                                            </div>
                                            <p className="text-xs text-yellow-600 mt-3">
                                                This action will be logged as an admin manual credit addition.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmAddCredits}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm & Add Credits'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManualCreditsModal;
