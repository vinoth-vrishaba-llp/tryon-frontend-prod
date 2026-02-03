import React, { useState, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, Save, X, Check, Star, Eye, EyeOff, Loader2, ChevronUp, ChevronDown
} from 'lucide-react';
import {
  getAllRecommendedPresets,
  createRecommendedPreset,
  updateRecommendedPreset,
  deleteRecommendedPreset,
  toggleRecommendedPresetStatus,
  RecommendedPreset
} from '../../services/recommendedPresetService';
import { PresetData } from '../../services/presetService';
import { useConfig } from '../../hooks/useConfig';

const RecommendedPresetsManager: React.FC = () => {
  const [presets, setPresets] = useState<RecommendedPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<RecommendedPreset | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'men' as 'men' | 'women' | 'kids' | 'jewellery',
    subcategory: '',
    display_order: 0,
    is_active: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get current config from hook to use as default
  const { config } = useConfig();

  // Fetch all recommended presets
  const fetchPresets = async () => {
    try {
      setLoading(true);
      console.log('Fetching all recommended presets...');
      const data = await getAllRecommendedPresets();
      console.log('Received recommended presets:', data);
      setPresets(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching recommended presets:', err);
      setError(err.message || 'Failed to fetch recommended presets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  // Handle create new preset
  const handleCreate = () => {
    setEditingPreset(null);
    setFormData({
      name: '',
      description: '',
      category: 'men',
      subcategory: '',
      display_order: presets.length,
      is_active: true
    });
    setShowCreateModal(true);
  };

  // Handle edit preset
  const handleEdit = (preset: RecommendedPreset) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      description: preset.description,
      category: preset.category,
      subcategory: preset.subcategory,
      display_order: preset.display_order,
      is_active: preset.is_active
    });
    setShowCreateModal(true);
  };

  // Handle save preset (create or update)
  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.subcategory) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create preset data from current config
      const presetData: PresetData = {
        name: formData.name,
        category: formData.category,
        useCustomModel: false,
        uploadType: 'parts',
        subCategory: formData.subcategory,
        poseId: config.pose.id,
        expressionId: config.expression.id,
        viewId: config.view.id,
        aspectRatioId: config.aspectRatio.id,
        timeId: config.time.id,
        cameraId: config.camera.id,
        qualityId: config.quality.id,
        backgroundId: config.background.id,
        hairStyleId: config.hairStyle.id,
        fitTypeId: config.fitType.id,
        bodyTypeId: config.bodyType.id,
        previewOptions: config.previewOptions
      };

      if (editingPreset) {
        // Update existing preset
        await updateRecommendedPreset(editingPreset.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          preset_data: presetData,
          is_active: formData.is_active,
          display_order: formData.display_order
        });
      } else {
        // Create new preset
        // Note: created_by will be automatically set by backend from JWT token
        await createRecommendedPreset({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          preset_data: presetData,
          is_active: formData.is_active,
          display_order: formData.display_order
          // created_by is omitted - backend will set it from JWT token
        });
      }

      await fetchPresets();
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save preset');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete preset
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preset? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteRecommendedPreset(id);
      await fetchPresets();
    } catch (err: any) {
      setError(err.message || 'Failed to delete preset');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle toggle active status
  const handleToggleStatus = async (preset: RecommendedPreset) => {
    try {
      await toggleRecommendedPresetStatus(preset.id, !preset.is_active);
      await fetchPresets();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle preset status');
    }
  };

  // Handle reorder
  const handleReorder = async (preset: RecommendedPreset, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? preset.display_order - 1 : preset.display_order + 1;
    try {
      await updateRecommendedPreset(preset.id, { display_order: newOrder });
      await fetchPresets();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder preset');
    }
  };

  // Group presets by category
  const presetsByCategory = presets.reduce((acc, preset) => {
    console.log('Grouping preset:', preset.name, 'Category:', preset.category, 'Type:', typeof preset.category);
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, RecommendedPreset[]>);

  console.log('presetsByCategory:', presetsByCategory);
  console.log('Object.keys(presetsByCategory):', Object.keys(presetsByCategory));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended Presets Manager</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage quick-start presets visible to all users
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Preset
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-800 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(presetsByCategory).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No recommended presets yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first preset to get started</p>
            </div>
          ) : (
            ['men', 'women', 'kids', 'jewellery'].map((category) => {
              const categoryPresets = presetsByCategory[category] || [];
              console.log(`Rendering category "${category}":`, categoryPresets.length, 'presets');
              if (categoryPresets.length === 0) {
                console.log(`Skipping category "${category}" - no presets`);
                return null;
              }

              return (
                <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 capitalize flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      {category}
                      <span className="text-sm text-gray-500 font-normal">
                        ({categoryPresets.length} preset{categoryPresets.length !== 1 ? 's' : ''})
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {categoryPresets
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((preset) => (
                        <div
                          key={preset.id}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-gray-900">{preset.name}</h4>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {preset.subcategory}
                                </span>
                                {preset.is_active ? (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" />
                                    Hidden
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  Order: {preset.display_order}
                                </span>
                              </div>
                              {preset.description && (
                                <p className="text-sm text-gray-600">{preset.description}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                Created by {preset.created_by} on{' '}
                                {new Date(preset.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReorder(preset, 'up')}
                                disabled={preset.display_order === 0}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReorder(preset, 'down')}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(preset)}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title={preset.is_active ? 'Hide from users' : 'Show to users'}
                              >
                                {preset.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleEdit(preset)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(preset.id)}
                                disabled={deletingId === preset.id}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === preset.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gray-50 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-xl text-gray-900">
                {editingPreset ? 'Edit Preset' : 'Create New Preset'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Preset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Traditional Wedding"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Brief description for users..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="jewellery">Jewellery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., casual, saree, western"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-4 h-full">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Active (visible to users)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The preset configuration will be taken from your current
                  selections (pose, expression, view, background, etc.). Make sure to configure these
                  settings in the try-on wizard before creating the preset.
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={submitting || !formData.name || !formData.category || !formData.subcategory}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingPreset ? 'Update Preset' : 'Create Preset'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedPresetsManager;
