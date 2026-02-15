// frontend/App.tsx
import React, { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { Page, User, PaymentStatus, PlanType } from "./types";
import TryOnWizard from "./components/TryOnWizard";
import HomePage from "./components/HomePage";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import SignupFlow from "./components/SignupFlow";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import MaintenancePage from "./components/MaintenancePage";
import UserDetailsPage from "./components/UserDetailsPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import PricingPage from "./components/PricingPage";
import AddOnCreditsPage from "./components/AddOnCreditsPage";
import CheckoutPage from "./components/CheckoutPage";
import LibraryPage from "./components/LibraryPage";
import { checkMaintenanceStatus, getCurrentUserProfile } from "./services/dashboardService";
import { restoreSession, logout } from "./services/authService";
import { setStoredUser } from "./services/apiClient";
import { Plan } from "./types";

/**
 * Normalize backend payment status → frontend-safe value
 * (MUST match authService logic)
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

// Helper to get initial page from sessionStorage (for reload persistence)
const getInitialPage = (): Page => {
  const stored = sessionStorage.getItem("currentPage");
  return (stored as Page) || "home";
};

const getInitialUserId = (): string | null => {
  return sessionStorage.getItem("selectedUserId");
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(getInitialPage);
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(getInitialUserId);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Backend → Frontend user mapper
   * This is the SINGLE SOURCE OF TRUTH for subscription state
   */
  const mapBackendUserToFrontend = (backendUser: any): User => {
    const displayName =
      backendUser.fullName ||
      backendUser.name ||
      backendUser.email?.split("@")[0] ||
      "User";

    const paymentStatus = normalizePaymentStatus(
      backendUser.paymentStatus
    );

    const planType: PlanType = backendUser.planType || "Free";

    return {
      id: backendUser.id?.toString() || "",
      name: displayName,
      email: backendUser.email || "",
      role: backendUser.role || "user",
      brandName: backendUser.brandName,
      mobile: backendUser.mobile,
      website: backendUser.website,

      tokenBalance:
        backendUser.creditsBalance ??
        backendUser.tokenBalance ??
        0,

      planType,
      paymentStatus,

      subscriptionStart: backendUser.subscriptionStart,
      subscriptionEnd: backendUser.subscriptionEnd,
      subscriptionExpiry: backendUser.subscriptionEnd,

      fullName: backendUser.fullName,
      creditsBalance: backendUser.creditsBalance,
      isActive: backendUser.isActive,
      createdAt: backendUser.createdAt,
      lastLogin: backendUser.lastLogin
    };
  };

  // Restore session on mount
  useEffect(() => {
    const session = restoreSession();
    if (session?.user) {
      const mapped = mapBackendUserToFrontend(session.user);
      setUser(mapped);
      setStoredUser(mapped); // 🔑 overwrite stale storage
    }
    setIsLoading(false);
  }, []);

  // Browser history management for navigation
  useEffect(() => {
    // Push initial state if not already in history
    const currentState = window.history.state;
    if (!currentState?.page) {
      window.history.replaceState(
        { page, selectedUserId },
        "",
        window.location.pathname
      );
    }

    // Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.page) {
        startTransition(() => {
          setPage(event.state.page);
          setSelectedUserId(event.state.selectedUserId || null);
          // Update sessionStorage to stay in sync
          sessionStorage.setItem("currentPage", event.state.page);
          if (event.state.selectedUserId) {
            sessionStorage.setItem("selectedUserId", event.state.selectedUserId);
          } else {
            sessionStorage.removeItem("selectedUserId");
          }
        });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Password reset token handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setResetToken(token);
      setPage("reset-password");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // Maintenance check
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const status = await checkMaintenanceStatus();
        setIsMaintenance(status.maintenanceMode);
      } catch {
        console.error("Failed to check maintenance mode");
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Use ref to avoid recreating polling interval on every user change
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Fetch fresh user profile from server and update state
  const refreshUserProfile = useCallback(async () => {
    try {
      const { user: profile } = await getCurrentUserProfile();
      const current = userRef.current;
      if (!current) return;

      const newCredits = profile.creditsBalance || 0;
      const currentCredits = current.creditsBalance ?? current.tokenBalance ?? 0;

      if (
        newCredits !== currentCredits ||
        profile.planType !== current.planType ||
        profile.paymentStatus !== current.paymentStatus ||
        profile.isActive !== current.isActive
      ) {
        const mapped = mapBackendUserToFrontend(profile);
        setUser(mapped);
        setStoredUser(mapped);
      }
    } catch {
      // Silently ignore — apiClient handles 401s
    }
  }, []);

  // Poll user profile for credit/plan changes (e.g. admin adding credits)
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const pollProfile = () => {
      if (document.visibilityState !== 'visible') return;
      refreshUserProfile();
    };

    const interval = setInterval(pollProfile, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshUserProfile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.id, user?.role]);

  // Scroll to top and refresh credits when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Refresh user profile on navigation to keep credits in sync
    if (userRef.current && userRef.current.role !== 'admin') {
      refreshUserProfile();
    }
  }, [page]);

  // Global navigation events
  useEffect(() => {
    const navigateWithHistory = (newPage: Page) => {
      startTransition(() => setPage(newPage));
      sessionStorage.setItem("currentPage", newPage);
      window.history.pushState({ page: newPage }, "", window.location.pathname);
    };

    const dashboardNav = () => navigateWithHistory("dashboard");
    const addonNav = () => navigateWithHistory("add-on-credits");
    const libraryNav = () => navigateWithHistory("library");
    const pricingNav = () => navigateWithHistory("pricing");

    window.addEventListener("navigate-dashboard", dashboardNav);
    window.addEventListener("navigate-addon-credits", addonNav);
    window.addEventListener("navigate-library", libraryNav);
    window.addEventListener("navigate-pricing", pricingNav);

    return () => {
      window.removeEventListener("navigate-dashboard", dashboardNav);
      window.removeEventListener("navigate-addon-credits", addonNav);
      window.removeEventListener("navigate-library", libraryNav);
      window.removeEventListener("navigate-pricing", pricingNav);
    };
  }, []);

  const handleNavigate = (newPage: Page, userId?: string | null) => {
    startTransition(() => {
      setPage(newPage);
      if (userId !== undefined) {
        setSelectedUserId(userId);
      }

      // Persist to sessionStorage for reload
      sessionStorage.setItem("currentPage", newPage);
      if (userId) {
        sessionStorage.setItem("selectedUserId", userId);
      } else if (userId === null) {
        sessionStorage.removeItem("selectedUserId");
      }

      // Push to browser history for back/forward navigation
      window.history.pushState(
        { page: newPage, selectedUserId: userId || selectedUserId },
        "",
        window.location.pathname
      );
    });
  };

  const handleViewUser = (userId: string) => {
    handleNavigate("admin-user-details", userId);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage("home");
    setAuthView("login");
    setSelectedUserId(null);

    // Clear navigation state on logout
    sessionStorage.removeItem("currentPage");
    sessionStorage.removeItem("selectedUserId");
    window.history.replaceState({ page: "home" }, "", window.location.pathname);
  };

  const handleUserUpdate = (updatedUser: any) => {
    const mapped = mapBackendUserToFrontend(updatedUser);
    setUser(mapped);
    setStoredUser(mapped);
  };

  // Update user credits in real-time after generation
  const handleCreditsUpdate = useCallback((newCredits: number) => {
    const current = userRef.current;
    if (current) {
      const updatedUser = {
        ...current,
        tokenBalance: newCredits,
        creditsBalance: newCredits
      };
      setUser(updatedUser);
      setStoredUser(updatedUser);
    }
    // Also fetch fresh profile from server to ensure consistency
    refreshUserProfile();
  }, [refreshUserProfile]);

 const renderPage = () => {
    if (isMaintenance && user?.role !== "admin") {
      return <MaintenancePage />;
    }

    switch (page) {
      case "mens":
        return <TryOnWizard user={user!} category="men" onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "womens":
        return <TryOnWizard user={user!} category="women" onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "kids":
        return <TryOnWizard user={user!} category="kids" onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "jewellery":
        return <TryOnWizard user={user!} category="jewellery" onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "library":
        return <LibraryPage user={user!} onNavigate={handleNavigate} />;
      case "dashboard":
        return user?.role === "admin" ? (
          <AdminDashboard
            user={user}
            onBack={() => handleNavigate("home")}
            onViewUser={handleViewUser}
          />
        ) : (
          <UserDashboard
            user={user!}
            onBack={() => handleNavigate("home")}
            onNavigateToPricing={() => handleNavigate("pricing")}
            onUserUpdate={handleUserUpdate}
          />
        );
      case "admin-user-details":
        return user?.role === "admin" && selectedUserId ? (
          <UserDetailsPage
            adminUser={user}
            userId={selectedUserId}
            onBack={() => handleNavigate("dashboard")}
          />
        ) : (
          <HomePage user={user!} onNavigate={handleNavigate} />
        );
      case "reset-password":
        return resetToken ? (
          <ResetPasswordPage
            token={resetToken}
            onNavigateToLogin={() => {
              setResetToken(null);
              setAuthView("login");
              handleNavigate("home");
            }}
          />
        ) : (
          <HomePage user={user!} onNavigate={handleNavigate} />
        );
      case "pricing":
        return (
          <PricingPage
            user={user!}
            onPlanSelected={(plan) => {
              setSelectedPlan(plan);
              handleNavigate("checkout");
            }}
            onBack={() => handleNavigate("home")}
          />
        );
      case "checkout":
        return selectedPlan ? (
          <CheckoutPage
            user={user!}
            plan={selectedPlan}
            onPaymentSuccess={(updatedUser) => {
              handleUserUpdate(updatedUser);
              handleNavigate("home");
            }}
            onBack={() => handleNavigate("pricing")}
          />
        ) : (
          <HomePage user={user!} onNavigate={handleNavigate} />
        );
      case "add-on-credits":
        return (
          <AddOnCreditsPage
            user={user!}
            onCreditsPurchased={handleUserUpdate}
            onBack={() => handleNavigate("dashboard")}
            onNavigate={handleNavigate}
          />
        );
      case "home":
      default:
        return <HomePage user={user!} onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-content-secondary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (page === "reset-password" && resetToken) {
      return (
        <ResetPasswordPage
          token={resetToken}
          onNavigateToLogin={() => {
            setResetToken(null);
            setPage("home");
            setAuthView("login");
          }}
        />
      );
    }

    return authView === "signup" ? (
      <SignupFlow
        onSignupSuccess={(newUser) =>
          setUser(mapBackendUserToFrontend(newUser))
        }
        onNavigateToLogin={() => setAuthView("login")}
      />
    ) : (
      <LoginPage
        onLoginSuccess={(loggedUser) =>
          setUser(mapBackendUserToFrontend(loggedUser))
        }
        onNavigateToSignup={() => setAuthView("signup")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary text-content overflow-x-hidden">
      <Header
        onHomeClick={() => handleNavigate("home")}
        showHomeButton={page !== "home"}
        user={user}
        onLogout={handleLogout}
      />
      <main
        className={`p-4 sm:p-6 lg:p-8 transition-opacity duration-300 ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
