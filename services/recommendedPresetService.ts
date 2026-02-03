import { getAuthHeaders } from './apiClient';
import { PresetData } from './presetService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RecommendedPreset {
  id: string;
  name: string;
  description: string;
  category: 'men' | 'women' | 'kids' | 'jewellery';
  subcategory: string;
  preset_data: PresetData;
  thumbnail_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  display_order: number;
}

/**
 * Get active recommended presets for a specific category (public endpoint)
 */
export const getRecommendedPresets = async (category: string): Promise<RecommendedPreset[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommended-presets?category=${category}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch recommended presets');
    }

    const data = await response.json();

    // Parse preset_data from JSON string to object
    return data.presets.map((preset: any) => ({
      ...preset,
      preset_data: typeof preset.preset_data === 'string'
        ? JSON.parse(preset.preset_data)
        : preset.preset_data
    }));
  } catch (error) {
    console.error('Error fetching recommended presets:', error);
    return []; // Return empty array on error instead of throwing
  }
};

// ==================== ADMIN ONLY FUNCTIONS ====================

/**
 * Get all recommended presets (admin only)
 */
export const getAllRecommendedPresets = async (): Promise<RecommendedPreset[]> => {
  console.log('getAllRecommendedPresets - Making request to:', `${API_BASE_URL}/admin/recommended-presets`);
  console.log('getAllRecommendedPresets - Headers:', getAuthHeaders());

  const response = await fetch(`${API_BASE_URL}/admin/recommended-presets`, {
    headers: getAuthHeaders(),
  });

  console.log('getAllRecommendedPresets - Response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('getAllRecommendedPresets - Error response:', error);
    throw new Error(error.error || 'Failed to fetch recommended presets');
  }

  const data = await response.json();
  console.log('getAllRecommendedPresets - Response data:', data);

  // Parse preset_data from JSON string to object
  const parsedPresets = data.presets.map((preset: any) => ({
    ...preset,
    preset_data: typeof preset.preset_data === 'string'
      ? JSON.parse(preset.preset_data)
      : preset.preset_data
  }));

  console.log('getAllRecommendedPresets - Parsed presets:', parsedPresets);
  return parsedPresets;
};

/**
 * Create a new recommended preset (admin only)
 * Note: created_by will be automatically set by backend from JWT token
 */
export const createRecommendedPreset = async (
  presetData: Omit<RecommendedPreset, 'id' | 'created_at' | 'created_by'> & { created_by?: string }
): Promise<RecommendedPreset> => {
  const response = await fetch(`${API_BASE_URL}/admin/recommended-presets`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...presetData,
      // Convert preset_data object to JSON string for storage
      preset_data: typeof presetData.preset_data === 'object'
        ? JSON.stringify(presetData.preset_data)
        : presetData.preset_data
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create recommended preset');
  }

  const data = await response.json();

  return {
    ...data.preset,
    preset_data: typeof data.preset.preset_data === 'string'
      ? JSON.parse(data.preset.preset_data)
      : data.preset.preset_data
  };
};

/**
 * Update a recommended preset (admin only)
 */
export const updateRecommendedPreset = async (
  presetId: string,
  updates: Partial<Omit<RecommendedPreset, 'id' | 'created_at' | 'created_by'>>
): Promise<RecommendedPreset> => {
  const body: any = { ...updates };

  // Convert preset_data object to JSON string if present
  if (updates.preset_data) {
    body.preset_data = typeof updates.preset_data === 'object'
      ? JSON.stringify(updates.preset_data)
      : updates.preset_data;
  }

  const response = await fetch(`${API_BASE_URL}/admin/recommended-presets/${presetId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update recommended preset');
  }

  const data = await response.json();

  return {
    ...data.preset,
    preset_data: typeof data.preset.preset_data === 'string'
      ? JSON.parse(data.preset.preset_data)
      : data.preset.preset_data
  };
};

/**
 * Delete a recommended preset (admin only)
 */
export const deleteRecommendedPreset = async (presetId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/admin/recommended-presets/${presetId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete recommended preset');
  }
};

/**
 * Toggle active status of a recommended preset (admin only)
 */
export const toggleRecommendedPresetStatus = async (presetId: string, isActive: boolean): Promise<RecommendedPreset> => {
  return updateRecommendedPreset(presetId, { is_active: isActive });
};
