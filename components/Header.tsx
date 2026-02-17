import React, { useState } from 'react';
import { User, PlanType } from '../types';
import { hasActivePaidPlan } from '../services/authService';
import logo from '../Image/TryOn.png';

interface HeaderProps {
  onHomeClick: () => void;
  showHomeButton: boolean;
  user?: User;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, showHomeButton, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to determine effective payment status (auto-detect expiration)
  const getEffectivePaymentStatus = (user: User): string => {
    // If already marked as expired, return expired
    if (user.paymentStatus === 'expired') return 'expired';

    // Check if subscription end date has passed
    if (user.subscriptionEnd && user.planType !== 'Free') {
      const endDate = new Date(user.subscriptionEnd);
      const now = new Date();
      if (endDate < now) return 'expired'; // Auto-detect expiration
    }

    // Otherwise return the actual payment status
    return user.paymentStatus;
  };

  const getPlanBadgeColor = (planType: PlanType, paymentStatus: string): string => {
    if (paymentStatus !== 'active') {
      return 'bg-surface-tertiary text-content-secondary border-border';
    }

    switch (planType) {
      case 'Ultimate':
        return 'bg-primary text-content-inverse border-border-strong';
      case 'Pro':
        return 'bg-secondary text-content-inverse border-border-strong';
      case 'Basic':
        return 'bg-content-tertiary text-content-inverse border-border-secondary';
      case 'Free':
      default:
        return 'bg-surface-tertiary text-content-secondary border-border';
    }
  };

  const getPlanBadgeText = (planType: PlanType, paymentStatus: string): string => {
    if (paymentStatus === 'expired') {
      return 'Expired';
    }
    if (paymentStatus !== 'active' && planType !== 'Free') {
      return 'Inactive';
    }
    return planType;
  };

  const getCreditColor = (credits: number, planType: PlanType): string => {
    if (!hasActivePaidPlan(user || null)) {
      return 'text-content-tertiary';
    }

    // Determine low credits threshold based on plan
    const threshold = planType === 'Basic' ? 15 : planType === 'Pro' ? 50 : 100;

    if (credits === 0) {
      return 'text-content-tertiary animate-pulse';
    } else if (credits < threshold) {
      return 'text-content-secondary';
    }
    return 'text-primary';
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-surface shadow-md border-b border-border">
     
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Clickable Logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={logo}
              alt="TryON Logo"
              className="h-12 w-15 object-contain"
            />
            <h1 className="text-xl md:text-3xl font-extrabold text-primary leading-snug -ml-1">TryON</h1>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-content-secondary hover:text-content transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="relative group flex items-center space-x-4 mr-4 cursor-pointer py-2">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <p className="text-sm font-bold text-content">{user.name || 'User'}</p>
                    {/* PLAN BADGE */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      getPlanBadgeColor(user.planType, getEffectivePaymentStatus(user))
                    }`}>
                      {getPlanBadgeText(user.planType, getEffectivePaymentStatus(user))}
                    </span>
                  </div>
                  {/* CREDIT BALANCE */}
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`text-xs font-medium ${getCreditColor(user.tokenBalance, user.planType)}`}>
                      {user.tokenBalance || 0} ⚡
                    </span>
                    {user.tokenBalance === 0 && hasActivePaidPlan(user) && (
                      <svg className="w-3 h-3 text-content-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-surface-tertiary flex items-center justify-center text-primary font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full w-56 bg-surface rounded-xl shadow-xl border border-border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 mt-2">
                  {/* Plan Status in Dropdown */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs text-content-tertiary mb-1">Current Plan</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-black px-3 py-1 rounded-full border ${
                        getPlanBadgeColor(user.planType, getEffectivePaymentStatus(user))
                      }`}>
                        {getPlanBadgeText(user.planType, getEffectivePaymentStatus(user))}
                      </span>
                      {user.paymentStatus !== 'active' && user.role !== 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('navigate-pricing'));
                          }}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                  
                  
                  <button
                    onClick={() => {
                      const event = new CustomEvent('navigate-dashboard');
                      window.dispatchEvent(event);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-content-secondary hover:bg-surface-secondary font-medium"
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                  </button>
                  {user.role === 'user' && hasActivePaidPlan(user) && (
                    <button
                      onClick={() => {
                        const event = new CustomEvent('navigate-addon-credits');
                        window.dispatchEvent(event);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-surface-secondary font-bold"
                    >
                      ⚡ Add-On Credits
                    </button>
                  )}
                  {user.role === 'user' && !hasActivePaidPlan(user) && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate-pricing'));
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-content-secondary hover:bg-surface-secondary font-bold"
                    >
                      📈 Upgrade Plan
                    </button>
                  )}
                  <div className="border-t border-border my-1"></div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-content-secondary hover:bg-surface-tertiary font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {user && (
              <>
                <button
                  onClick={() => {
                    const event = new CustomEvent('navigate-library');
                    window.dispatchEvent(event);
                  }}
                  className="flex items-center px-4 py-2 bg-surface-secondary text-content-secondary rounded-lg hover:bg-surface-tertiary transition-colors duration-300 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Library
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate-pricing'));
                  }}
                  className="flex items-center px-4 py-2 bg-surface-tertiary text-primary rounded-lg hover:bg-border transition-colors duration-300 font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Plans & Pricing
                </button>
              </>
            )}

            {showHomeButton && (
              <button
                onClick={onHomeClick}
                className="flex items-center px-4 py-2 bg-primary text-content-inverse rounded-lg hover:bg-secondary transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
            )}

            {user && (
              <button
                onClick={onLogout}
                className="p-2 text-content-tertiary hover:text-content transition-colors"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-surface-inverse bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-surface shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold text-content">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-content-tertiary hover:text-content-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 bg-surface-secondary border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-surface-tertiary flex items-center justify-center text-primary font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-content">{user.name || 'User'}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      getPlanBadgeColor(user.planType, getEffectivePaymentStatus(user))
                    }`}>
                      {getPlanBadgeText(user.planType, getEffectivePaymentStatus(user))}
                    </span>
                    <span className={`text-xs font-medium ${getCreditColor(user.tokenBalance, user.planType)}`}>
                      {user.tokenBalance || 0} ⚡
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
           

            {user && (
              <>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate-dashboard'));
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center px-4 py-3 text-content-secondary hover:bg-surface-secondary font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </button>

                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate-library'));
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center px-4 py-3 text-content-secondary hover:bg-surface-secondary font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Library
                </button>

                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate-pricing'));
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center px-4 py-3 text-primary hover:bg-surface-secondary font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Plans & Pricing
                </button>

                {user.role === 'user' && hasActivePaidPlan(user) && (
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate-addon-credits'));
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center px-4 py-3 text-primary hover:bg-surface-secondary font-bold"
                  >
                    <span className="mr-3">⚡</span>
                    Add-On Credits
                  </button>
                )}

                {user.role === 'user' && !hasActivePaidPlan(user) && (
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate-pricing'));
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center px-4 py-3 text-content-secondary hover:bg-surface-secondary font-bold"
                  >
                    <span className="mr-3">📈</span>
                    Upgrade Plan
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Logout Button */}
          {user && (
            <div className="p-4 border-t border-border">
              <button
                onClick={() => {
                  onLogout?.();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-center px-4 py-3 bg-surface-tertiary text-content-secondary rounded-lg hover:bg-border font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;