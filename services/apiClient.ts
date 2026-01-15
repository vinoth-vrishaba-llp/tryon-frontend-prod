/**
 * API Client with JWT Authentication and Access Control Error Handling
 * Automatically adds Authorization header to all requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Get stored token
 */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set token in storage
 */
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove token from storage
 */
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get stored user
 */
export const getStoredUser = (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
};

/**
 * Set user in storage
 */
export const setStoredUser = (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove user from storage
 */
export const removeStoredUser = (): void => {
    localStorage.removeItem(USER_KEY);
};

/**
 * Clear all auth data
 */
export const clearAuth = (): void => {
    removeToken();
    removeStoredUser();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

/**
 * Get authorization headers
 */
export const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Get authorization headers for FormData (no Content-Type)
 */
export const getAuthHeadersForFormData = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Handle API response with enhanced error logging and access control handling
 */
const handleResponse = async (response: Response) => {
    // CRITICAL: Handle 401 Unauthorized (session expired)
    if (response.status === 401) {
        clearAuth();
        window.location.reload();
        throw new Error('Session expired. Please log in again.');
    }

    // CRITICAL: Handle 402 Payment Required (no active plan)
    if (response.status === 402) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { error: 'Active subscription required' };
        }
        
        // If requiresPlan flag is set, trigger redirect
        if (errorData.requiresPlan) {
            // Dispatch custom event to trigger navigation
            setTimeout(() => {
                const event = new CustomEvent('navigate-pricing');
                window.dispatchEvent(event);
            }, 100);
        }
        
        throw new Error(errorData.error || 'Active paid subscription required');
    }

    // CRITICAL: Handle 403 Forbidden (plan restrictions, insufficient credits)
    if (response.status === 403) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { error: 'Access forbidden' };
        }
        
        // Enhanced error with access control details
        const error: any = new Error(errorData.error || 'Access forbidden');
        error.requiresUpgrade = errorData.requiresUpgrade;
        error.requiresCredits = errorData.requiresCredits;
        error.needed = errorData.needed;
        error.available = errorData.available;
        
        throw error;
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { error: `Request failed with status ${response.status}` };
        }
        
        // Extract error message with fallbacks
        let errorMessage = errorData.error || 
                          errorData.message || 
                          `Request failed with status ${response.status}`;
        
        // If there are validation details, include them
        if (errorData.details && Array.isArray(errorData.details)) {
            errorMessage += ': ' + errorData.details.join(', ');
        }
        
        // Log detailed error info for debugging
        console.error('API Request Failed:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            errorData: errorData,
            message: errorMessage
        });
        
        throw new Error(errorMessage);
    }

    return response.json();
};

/**
 * API client methods
 */
export const apiClient = {
    /**
     * GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    /**
     * POST request with JSON body
     */
    async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse(response);
    },

    /**
     * POST request with FormData
     */
    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeadersForFormData(),
            body: formData,
        });
        return handleResponse(response);
    },

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse(response);
    },

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    /**
     * Public POST request (no auth required) - Used for login/signup
     */
    async publicPost<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse(response);
    },

    /**
     * Public GET request (no auth required)
     */
    async publicGet<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return handleResponse(response);
    },
};

// Setup global event listener for pricing navigation
if (typeof window !== 'undefined') {
    window.addEventListener('navigate-pricing', () => {
        // This will be handled by App.tsx
    });
}

export default apiClient;