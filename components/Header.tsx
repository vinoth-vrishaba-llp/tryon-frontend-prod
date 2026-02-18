import React, { useState, useRef, useEffect } from 'react';
import { User, PlanType } from '../types';
import { hasActivePaidPlan } from '../services/authService';
import { getAvatarById } from '../constants/avatars';
import logo from '../Image/logo-tryon.webp';
import {
  Images,
  ArrowUpCircle,
  Zap,
  LogOut,
  LayoutDashboard,
  X,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  showHomeButton: boolean;
  user?: User;
  onLogout?: () => void;
  onAvatarChange?: (avatarId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getEffectivePaymentStatus = (user: User): string => {
    if (user.paymentStatus === 'expired') return 'expired';
    if (user.subscriptionEnd && user.planType !== 'Free') {
      const endDate = new Date(user.subscriptionEnd);
      if (endDate < new Date()) return 'expired';
    }
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
    if (paymentStatus === 'expired') return 'Expired';
    if (paymentStatus !== 'active' && planType !== 'Free') return 'Inactive';
    return planType;
  };

  const getCreditColor = (credits: number, planType: PlanType): string => {
    if (!hasActivePaidPlan(user || null)) return 'text-content-tertiary';
    const threshold = planType === 'Basic' ? 15 : planType === 'Pro' ? 50 : 100;
    if (credits === 0) return 'text-content-tertiary animate-pulse';
    if (credits < threshold) return 'text-content-secondary';
    return 'text-primary';
  };

  const avatarOption = user ? getAvatarById(user.avatar) : undefined;

  const navigateTo = (event: string) => {
    window.dispatchEvent(new CustomEvent(event));
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const menuItems = user
    ? [
        {
          label: user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard',
          icon: LayoutDashboard,
          onClick: () => navigateTo('navigate-dashboard'),
        },
        {
          label: 'Library',
          icon: Images,
          onClick: () => navigateTo('navigate-library'),
        },
        {
          label: 'Upgrade Plan',
          icon: ArrowUpCircle,
          onClick: () => navigateTo('navigate-pricing'),
        },
        ...(user.role === 'user' && hasActivePaidPlan(user)
          ? [
              {
                label: 'Add-On Credits',
                icon: Zap,
                onClick: () => navigateTo('navigate-addon-credits'),
                highlight: true,
              },
            ]
          : []),
      ]
    : [];

  const effectiveStatus = user ? getEffectivePaymentStatus(user) : '';

  // Render avatar helper
  const renderAvatar = (size: string) => {
    const sizeClass = size === 'sm' ? 'h-8 w-8 text-sm' : size === 'md' ? 'h-10 w-10' : 'h-14 w-14 text-lg';
    if (avatarOption) {
      return <img src={avatarOption.src} alt="Avatar" className={`${sizeClass} rounded-full object-cover`} />;
    }
    return (
      <div className={`${sizeClass} rounded-full bg-surface-tertiary flex items-center justify-center text-primary font-bold`}>
        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <header className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="TryON Logo" className="w-28 object-contain" />
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-content-secondary hover:text-content rounded-lg hover:bg-surface-secondary transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            {/* Desktop profile */}
            {user && (
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-surface-secondary transition-colors"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-semibold text-content leading-tight">
                      {user.name || 'User'}
                    </p>
                    <span
                      className={`text-xs font-medium flex items-center gap-0.5 justify-end ${getCreditColor(
                        user.tokenBalance,
                        user.planType
                      )}`}
                    > Credits:
                      <Zap size={10} />
                      {user.tokenBalance || 0}
                    </span>
                  </div>
                  {renderAvatar('sm')}
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl shadow-xl border border-border py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info with larger avatar */}
                    <div className="px-4 py-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        {renderAvatar('lg')}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-content truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-content-tertiary truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPlanBadgeColor(
                                user.planType,
                                effectiveStatus
                              )}`}
                            >
                              {getPlanBadgeText(user.planType, effectiveStatus)}
                            </span>
                            <span
                              className={`text-xs font-medium flex items-center gap-0.5 ${getCreditColor(
                                user.tokenBalance,
                                user.planType
                              )}`}
                            >
                              <Zap size={12} />
                              {user.tokenBalance || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-secondary transition-colors ${
                            item.highlight
                              ? 'text-primary font-semibold'
                              : 'text-content-secondary font-medium'
                          }`}
                        >
                          <item.icon size={16} />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border pt-1">
                      <button
                        onClick={() => {
                          onLogout?.();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:bg-surface-secondary font-medium transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-surface-inverse/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-surface shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold text-content">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-content-tertiary hover:text-content"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile user info */}
          {user && (
            <div className="p-4 bg-surface-secondary border-b border-border">
              <div className="flex items-center gap-3">
                {renderAvatar('md')}
                <div>
                  <p className="text-sm font-bold text-content">{user.name || 'User'}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPlanBadgeColor(
                        user.planType,
                        effectiveStatus
                      )}`}
                    >
                      {getPlanBadgeText(user.planType, effectiveStatus)}
                    </span>
                    <span
                      className={`text-xs font-medium flex items-center gap-0.5 ${getCreditColor(
                        user.tokenBalance,
                        user.planType
                      )}`}
                    >
                      <Zap size={12} />
                      {user.tokenBalance || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors ${
                  item.highlight
                    ? 'text-primary font-semibold'
                    : 'text-content-secondary font-medium'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile logout */}
          {user && (
            <div className="p-4 border-t border-border">
              <button
                onClick={() => {
                  onLogout?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-tertiary text-content-secondary rounded-lg hover:bg-border font-medium transition-colors"
              >
                <LogOut size={18} />
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
