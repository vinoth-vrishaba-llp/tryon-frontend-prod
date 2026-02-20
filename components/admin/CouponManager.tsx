import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Loader2, Tag } from 'lucide-react';
import { Coupon } from '../../types';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/couponService';

interface FormData {
    code: string;
    type: 'flat' | 'percentage';
    value: number | '';
    status: 'active' | 'inactive';
}

const defaultForm: FormData = {
    code: '',
    type: 'flat',
    value: '',
    status: 'active'
};

const CouponManager: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>(defaultForm);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const data = await getAllCoupons();
            setCoupons(data.coupons);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = () => {
        setEditingCoupon(null);
        setFormData(defaultForm);
        setFormError(null);
        setShowModal(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            status: coupon.status
        });
        setFormError(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.code.trim()) {
            setFormError('Coupon code is required');
            return;
        }
        if (formData.value === '' || Number(formData.value) <= 0) {
            setFormError('Discount value must be greater than 0');
            return;
        }
        if (formData.type === 'percentage' && Number(formData.value) > 100) {
            setFormError('Percentage discount cannot exceed 100');
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);

            const payload = {
                code: formData.code.trim().toUpperCase(),
                type: formData.type,
                value: Number(formData.value),
                status: formData.status
            };

            if (editingCoupon) {
                await updateCoupon(editingCoupon.id, payload);
            } else {
                await createCoupon(payload);
            }

            await fetchCoupons();
            setShowModal(false);
        } catch (err: any) {
            setFormError(err.message || 'Failed to save coupon');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmId) return;
        try {
            setDeletingId(deleteConfirmId);
            await deleteCoupon(deleteConfirmId);
            await fetchCoupons();
        } catch (err: any) {
            setError(err.message || 'Failed to delete coupon');
        } finally {
            setDeletingId(null);
            setDeleteConfirmId(null);
        }
    };

    const deleteTarget = coupons.find(c => c.id === deleteConfirmId);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Coupon Manager</h2>
                    <p className="text-sm text-gray-500 mt-1">Create and manage discount codes for plan purchases</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Coupon
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Tag className="w-14 h-14 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-semibold">No coupons yet</p>
                    <p className="text-gray-400 text-sm mt-1">Create your first coupon to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {coupons.map(coupon => (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{coupon.type}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {coupon.type === 'flat'
                                            ? `₹${coupon.value.toLocaleString()}`
                                            : `${coupon.value}%`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            coupon.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(coupon.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(coupon.id)}
                                                disabled={deletingId === coupon.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deletingId === coupon.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                                    {formError}
                                </div>
                            )}

                            {/* Code */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Coupon Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase text-sm"
                                    placeholder="e.g. LAUNCH50"
                                    maxLength={50}
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Discount Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as 'flat' | 'percentage', value: '' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="flat">Flat (₹ off)</option>
                                    <option value="percentage">Percentage (% off)</option>
                                </select>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    {formData.type === 'flat' ? 'Amount (₹)' : 'Percentage (%)'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value === '' ? '' : Number(e.target.value) })}
                                    min={1}
                                    max={formData.type === 'percentage' ? 100 : undefined}
                                    step={formData.type === 'flat' ? 1 : 0.01}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                    placeholder={formData.type === 'flat' ? 'e.g. 500' : 'e.g. 20'}
                                />
                                {formData.type === 'percentage' && (
                                    <p className="text-xs text-gray-400 mt-1">Enter a value between 1 and 100</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    : editingCoupon ? 'Save Changes' : 'Create Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Coupon?</h3>
                            <p className="text-gray-500 text-sm mb-1">
                                You are about to permanently delete:
                            </p>
                            <p className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block mb-4">
                                {deleteTarget?.code}
                            </p>
                            <p className="text-gray-400 text-xs mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={!!deletingId}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManager;
