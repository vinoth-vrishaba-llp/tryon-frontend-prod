import {
    SignupData,
    AuthResponse,
    User,
    SubscriptionStatus,
    PaymentStatus,
    PlanType,
    CREDIT_COSTS
} from "../types";
import {
    apiClient,
    setToken,
    setStoredUser,
    clearAuth,
    getStoredUser,
    getToken
} from "./apiClient";
import { encryptData } from "./encryption";

// Session storage key for signup flow
const SIGNUP_STEP_ONE_KEY = "signup_step_one_data";

/**
 * Normalize backend payment status into frontend-safe value
 */
const normalizePaymentStatus = (status?: any): PaymentStatus => {
    // Handle null/undefined/empty
    if (status === null || status === undefined || status === "") return "none";

    // Extract string value from various formats
    let statusStr: string;

    if (typeof status === "object" && status !== null) {
        // Handle Baserow single-select format: { id: 1, value: 'active' }
        statusStr = status.value || status.name || "";
    } else {
        statusStr = String(status);
    }

    if (!statusStr) return "none";

    const s = statusStr.toLowerCase().trim();

    // Check for active statuses
    if (
        s === "active" ||
        s === "paid" ||
        s === "success" ||
        s === "captured" ||
        s === "completed"
    ) {
        return "active";
    }

    if (s === "expired") return "expired";
    if (s === "none") return "none";

    return "inactive";
};

/**
 * Login user and store credentials
 * Password is encrypted before transmission for security
 */
export const login = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    // Encrypt password before sending
    const encryptedPassword = await encryptData(password);

    const response = await apiClient.publicPost<AuthResponse>(
        "/auth/login",
        { email, password: encryptedPassword, encrypted: true }
    );

    setToken(response.token);
    setStoredUser(response.user);

    return response;
};

/**
 * Signup step one
 */
export const signupStepOne = async (data: SignupData): Promise<void> => {
    try {
        await apiClient.publicPost("/auth/signup/step-one", data);
        sessionStorage.setItem(
            SIGNUP_STEP_ONE_KEY,
            JSON.stringify({ ...data, timestamp: Date.now() })
        );
    } catch (error) {
        sessionStorage.removeItem(SIGNUP_STEP_ONE_KEY);
        throw error;
    }
};

/**
 * Get stored step one data
 */
export const getStepOneData = (): SignupData | null => {
    const dataStr = sessionStorage.getItem(SIGNUP_STEP_ONE_KEY);
    if (!dataStr) return null;

    try {
        const data = JSON.parse(dataStr);
        const age = Date.now() - (data.timestamp || 0);
        if (age < 600000) return data;
    } catch {}

    sessionStorage.removeItem(SIGNUP_STEP_ONE_KEY);
    return null;
};

/**
 * Signup step two
 * Password is encrypted before transmission for security
 */
export const signupStepTwo = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    if (!email?.trim()) throw new Error("Email is required");
    if (!password || password.length < 8)
        throw new Error("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password))
        throw new Error("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
        throw new Error("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(password))
        throw new Error("Password must contain at least one number");

    // Encrypt password before sending
    const encryptedPassword = await encryptData(password);

    const response = await apiClient.publicPost<AuthResponse>(
        "/auth/signup/step-two",
        { email: email.trim(), password: encryptedPassword, encrypted: true }
    );

    setToken(response.token);
    setStoredUser(response.user);
    sessionStorage.removeItem(SIGNUP_STEP_ONE_KEY);

    return response;
};

/**
 * ✅ MISSING EXPORT – REQUIRED BY SignupFlow
 */
export const clearSignupData = (): void => {
    sessionStorage.removeItem(SIGNUP_STEP_ONE_KEY);
};

/**
 * Logout
 */
export const logout = (): void => {
    clearAuth();
    clearSignupData();
};

/**
 * Restore session
 */
export const restoreSession = (): AuthResponse | null => {
    const token = getToken();
    const user = getStoredUser();
    return token && user ? { token, user } : null;
};

// =============================================================================
// ACCESS CONTROL
// =============================================================================

export const hasActivePaidPlan = (user: User | null): boolean => {
    if (!user) return false;
    if (user.planType === "Free") return false;

    const status = normalizePaymentStatus(user.paymentStatus);
    if (status !== "active") return false;

    if (user.subscriptionEnd || user.subscriptionExpiry) {
        const end = new Date(
            user.subscriptionEnd || user.subscriptionExpiry || ""
        );
        if (!isNaN(end.getTime()) && end < new Date()) {
            return false;
        }
    }

    return true;
};

export const canGenerateImages = (
    user: User | null,
    creditsNeeded = 3
): boolean => {
    if (!hasActivePaidPlan(user)) return false;
    return (user?.tokenBalance || 0) >= creditsNeeded;
};

export const canPurchaseAddons = (user: User | null): boolean => {
    return hasActivePaidPlan(user);
};

export const canUseQuality = (
    user: User | null,
    quality: "standard" | "high" | "ultra"
): boolean => {
    if (!hasActivePaidPlan(user)) return false;
    if (user?.planType === "Basic") return quality === "standard";
    return true;
};

export const getCreditCost = (
    quality: "standard" | "high" | "ultra"
): number => {
    return CREDIT_COSTS[quality];
};

export const isFreeUser = (user: User | null): boolean => {
    if (!user) return true;
    return (
        user.planType === "Free" ||
        normalizePaymentStatus(user.paymentStatus) !== "active"
    );
};

export const isSubscriptionExpired = (user: User | null): boolean => {
    if (!user) return false;

    if (normalizePaymentStatus(user.paymentStatus) === "expired") return true;

    if (user.subscriptionEnd || user.subscriptionExpiry) {
        const end = new Date(
            user.subscriptionEnd || user.subscriptionExpiry || ""
        );
        if (!isNaN(end.getTime())) return end < new Date();
    }

    return false;
};

export const getSubscriptionStatus = (
    user: User | null
): SubscriptionStatus => {
    const hasActive = hasActivePaidPlan(user);

    return {
        hasActivePlan: hasActive,
        planType: user?.planType || "Free",
        paymentStatus: normalizePaymentStatus(user?.paymentStatus),
        creditsRemaining: user?.tokenBalance || 0,
        subscriptionEnd:
            user?.subscriptionEnd || user?.subscriptionExpiry || null,
        canGenerateImages: hasActive && (user?.tokenBalance || 0) > 0,
        canPurchaseAddons: hasActive,
        isExpired: isSubscriptionExpired(user),
        isFree: isFreeUser(user)
    };
};

export const validateGenerationAttempt = (
    user: User | null,
    quality: "standard" | "high" | "ultra"
) => {
    if (!user)
        return { allowed: false, error: "Please log in", action: "login" };

    if (!hasActivePaidPlan(user))
        return {
            allowed: false,
            error: "No active subscription. Please upgrade.",
            action: "upgrade"
        };

    if (!canUseQuality(user, quality))
        return {
            allowed: false,
            error: "Upgrade plan to use this quality",
            action: "upgrade"
        };

    const cost = getCreditCost(quality);
    if ((user.tokenBalance || 0) < cost)
        return {
            allowed: false,
            error: "Insufficient credits",
            action: "buy-credits"
        };

    return { allowed: true };
};

export const validateAddonPurchase = (user: User | null) => {
    if (!user)
        return { allowed: false, error: "Please log in", action: "login" };

    if (!hasActivePaidPlan(user))
        return {
            allowed: false,
            error: "Purchase a plan before add-ons",
            action: "upgrade"
        };

    return { allowed: true };
};

/**
 * Request password reset email
 */
export const requestPasswordReset = async (
    email: string
): Promise<{ message: string }> => {
    return apiClient.publicPost<{ message: string }>(
        "/auth/forgot-password",
        { email }
    );
};

/**
 * Reset password with token
 * Password is encrypted before transmission for security
 */
export const resetPassword = async (
    token: string,
    newPassword: string
): Promise<void> => {
    // Encrypt password before sending
    const encryptedPassword = await encryptData(newPassword);

    await apiClient.publicPost("/auth/reset-password", {
        token,
        newPassword: encryptedPassword,
        encrypted: true
    });
};
