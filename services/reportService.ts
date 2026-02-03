import { getAuthHeaders, getAuthHeadersForFormData } from './apiClient';
import { Report, CreateReportData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Submit a new report with images
 */
export const submitReport = async (
  reportData: CreateReportData,
  generatedImage?: Blob,
  productImages?: Blob[]
): Promise<Report> => {
  const formData = new FormData();

  // Add text fields
  formData.append('feedbackType', reportData.feedbackType);
  formData.append('section', reportData.section);
  formData.append('category', reportData.category);
  formData.append('qualityUsed', reportData.qualityUsed);

  if (reportData.issueCategory) {
    formData.append('issueCategory', reportData.issueCategory);
  }

  if (reportData.customMessage) {
    formData.append('customMessage', reportData.customMessage);
  }

  if (reportData.historyId) {
    formData.append('historyId', reportData.historyId);
  }

  // Add generated image
  if (generatedImage) {
    formData.append('generatedImage', generatedImage, 'generated.png');
  }

  // Add product images
  if (productImages && productImages.length > 0) {
    productImages.forEach((image, index) => {
      formData.append('productImages', image, `product-${index}.png`);
    });
  }

  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit report');
  }

  const data = await response.json();
  return data.report;
};

/**
 * Get user's own reports
 */
export const getUserReports = async (): Promise<Report[]> => {
  const response = await fetch(`${API_BASE_URL}/user/reports`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch reports');
  }

  const data = await response.json();
  return data.reports;
};

/**
 * Get all reports (admin only)
 */
export const getAllReports = async (): Promise<Report[]> => {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch reports');
  }

  const data = await response.json();
  return data.reports;
};

/**
 * Get unread reports count (admin only)
 */
export const getUnreadReportsCount = async (): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/reports/unread-count`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch unread count');
  }

  const data = await response.json();
  return data.count;
};

/**
 * Get single report by ID (admin only)
 */
export const getReportById = async (reportId: string): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch report');
  }

  const data = await response.json();
  return data.report;
};

/**
 * Mark report as read (admin only)
 */
export const markReportAsRead = async (reportId: string): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/mark-read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark report as read');
  }

  const data = await response.json();
  return data.report;
};

/**
 * Mark all reports as read (admin only)
 */
export const markAllReportsAsRead = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/reports/mark-all-read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark all reports as read');
  }
};

/**
 * Update report status (admin only)
 */
export const updateReportStatus = async (
  reportId: string,
  status: 'new' | 'reviewed' | 'resolved'
): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update report status');
  }

  const data = await response.json();
  return data.report;
};

/**
 * Update report notes (admin only)
 */
export const updateReportNotes = async (
  reportId: string,
  notes: string
): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/notes`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update report notes');
  }

  const data = await response.json();
  return data.report;
};
