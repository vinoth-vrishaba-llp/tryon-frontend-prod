import { ImageHistoryItem } from './types';
import { apiClient } from './services/apiClient';

/**
 * Save image to history
 * Note: History is automatically saved by the backend during image generation.
 * This function is kept for backwards compatibility but does nothing.
 */
export const saveImageToHistory = async (
  _imageDataUrl: string,
  _category: string,
  _cost: number = 1,
  _customAvatarFile?: File
): Promise<void> => {
  // History is saved automatically by the backend during /generate-tryon
  // No need to make a separate API call
};

/**
 * Get image history for current user
 * Note: Email is now extracted from JWT token on the backend
 */
export const getImageHistory = async (): Promise<ImageHistoryItem[]> => {
  try {
    return await apiClient.get<ImageHistoryItem[]>('/history');
  } catch (e) {
    console.error("Failed to get history:", e);
    return [];
  }
};

/**
 * Delete image from history
 */
export const deleteImageFromHistory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/history/${id}`);
  } catch (e) {
    console.error("Failed to delete history:", e);
  }
};
