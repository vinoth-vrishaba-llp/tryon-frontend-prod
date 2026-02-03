import { getAuthHeaders } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface PresetData {
  id?: string;
  name: string;
  category: 'men' | 'women' | 'kids' | 'jewellery';
  createdAt?: string;
  updatedAt?: string;
  // Step 1 settings
  useCustomModel: boolean;
  uploadType: 'parts' | 'full';
  subCategory?: string;
  gender?: string;
  ageGroup?: string;
  accessories?: {
    jasmine: boolean;
    bangles: boolean;
    necklace: boolean;
  };
  skinToneId?: string;
  attireId?: string;
  hairStyleId?: string;
  fitTypeId?: string;
  bodyTypeId?: string;
  // Step 2 settings
  poseId: string;
  expressionId: string;
  viewId: string;
  aspectRatioId: string;
  previewOptions?: {
    showOutfitDetails: boolean;
    highlightFabricTexture: boolean;
  };
  // Step 3 settings
  timeId: string;
  cameraId: string;
  qualityId: string;
  backgroundId: string;
}

/**
 * Get all presets for the current user
 */
export const getPresets = async (): Promise<PresetData[]> => {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch presets');
  }

  const data = await response.json();
  return data.presets;
};

/**
 * Get presets filtered by category
 */
export const getPresetsByCategory = async (category: string): Promise<PresetData[]> => {
  const response = await fetch(`${API_BASE_URL}/presets/category/${category}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch presets');
  }

  const data = await response.json();
  return data.presets;
};

/**
 * Get a single preset by ID
 */
export const getPresetById = async (presetId: string): Promise<PresetData> => {
  const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch preset');
  }

  const data = await response.json();
  return data.preset;
};

/**
 * Create a new preset
 */
export const createPreset = async (presetData: Omit<PresetData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PresetData> => {
  const response = await fetch(`${API_BASE_URL}/presets`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presetData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create preset');
  }

  const data = await response.json();
  return data.preset;
};

/**
 * Update an existing preset
 */
export const updatePreset = async (presetId: string, updates: Partial<PresetData>): Promise<PresetData> => {
  const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update preset');
  }

  const data = await response.json();
  return data.preset;
};

/**
 * Delete a preset
 */
export const deletePreset = async (presetId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/presets/${presetId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete preset');
  }
};

/**
 * Rename a preset
 */
export const renamePreset = async (presetId: string, newName: string): Promise<PresetData> => {
  return updatePreset(presetId, { name: newName });
};
