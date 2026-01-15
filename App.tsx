// frontend/App.tsx
import React, { useState, useTransition, useEffect } from "react";
import { Page, User, PaymentStatus, PlanType } from "./types";
import MensTryOn from "./components/MensTryOn";
import WomensTryOn from "./components/WomensTryOn";
import KidsTryOn from "./components/KidsTryOn";
import JewelleryTryOn from "./components/JewelleryTryOn";
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
import { checkMaintenanceStatus } from "./services/dashboardService";
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

const App: React.FC = () => {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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

  // Global navigation events
  useEffect(() => {
    const dashboardNav = () =>
      startTransition(() => setPage("dashboard"));
    const addonNav = () =>
      startTransition(() => setPage("add-on-credits"));
    const libraryNav = () =>
      startTransition(() => setPage("library"));

    window.addEventListener("navigate-dashboard", dashboardNav);
    window.addEventListener("navigate-addon-credits", addonNav);
    window.addEventListener("navigate-library", libraryNav);

    return () => {
      window.removeEventListener("navigate-dashboard", dashboardNav);
      window.removeEventListener("navigate-addon-credits", addonNav);
      window.removeEventListener("navigate-library", libraryNav);
    };
  }, []);

  const handleNavigate = (newPage: Page) =>
    startTransition(() => setPage(newPage));

  const handleViewUser = (userId: string) =>
    startTransition(() => {
      setSelectedUserId(userId);
      setPage("admin-user-details");
    });

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage("home");
    setAuthView("login");
    setSelectedUserId(null);
  };

  const handleUserUpdate = (updatedUser: any) => {
    const mapped = mapBackendUserToFrontend(updatedUser);
    setUser(mapped);
    setStoredUser(mapped);
  };

  // Update user credits in real-time after generation
  const handleCreditsUpdate = (newCredits: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        tokenBalance: newCredits,
        creditsBalance: newCredits
      };
      setUser(updatedUser);
      setStoredUser(updatedUser);
    }
  };

 const renderPage = () => {
    if (isMaintenance && user?.role !== "admin") {
      return <MaintenancePage />;
    }

    switch (page) {
      case "mens":
        return <MensTryOn user={user!} onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "womens":
        return <WomensTryOn user={user!} onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "kids":
        return <KidsTryOn user={user!} onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
      case "jewellery":
        return <JewelleryTryOn user={user!} onNavigate={handleNavigate} onCreditsUpdate={handleCreditsUpdate} />;
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
              setPage("home");
              setAuthView("login");
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
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
    <div className="min-h-screen bg-slate-100 text-gray-800">
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
