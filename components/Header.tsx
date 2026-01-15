import React from 'react';
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
  const getPlanBadgeColor = (planType: PlanType, paymentStatus: string): string => {
    if (paymentStatus !== 'active') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    
    switch (planType) {
      case 'Ultimate':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-700';
      case 'Pro':
        return 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-700';
      case 'Basic':
        return 'bg-gray-600 text-white border-gray-700';
      case 'Free':
      default:
        return 'bg-gray-200 text-gray-700 border-gray-300';
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
      return 'text-red-600';
    }
    
    // Determine low credits threshold based on plan
    const threshold = planType === 'Basic' ? 15 : planType === 'Pro' ? 50 : 100;
    
    if (credits === 0) {
      return 'text-red-600 animate-pulse';
    } else if (credits < threshold) {
      return 'text-orange-600';
    }
    return 'text-primary';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="TryON Logo" 
              className="h-12 w-15 object-contain"
            />
            <h1 className="text-xl md:text-3xl font-extrabold text-blue-900 leading-snug -ml-1">TryON</h1>
          </div>


          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative group flex items-center space-x-4 mr-4 cursor-pointer py-2">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <p className="text-sm font-bold text-gray-900">{user.name || 'User'}</p>
                    {/* PLAN BADGE */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      getPlanBadgeColor(user.planType, user.paymentStatus)
                    }`}>
                      {getPlanBadgeText(user.planType, user.paymentStatus)}
                    </span>
                  </div>
                  {/* CREDIT BALANCE */}
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`text-xs font-medium ${getCreditColor(user.tokenBalance, user.planType)}`}>
                      {user.tokenBalance || 0} ⚡
                    </span>
                    {user.tokenBalance === 0 && hasActivePaidPlan(user) && (
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 mt-2">
                  {/* Plan Status in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Current Plan</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-black px-3 py-1 rounded-full border ${
                        getPlanBadgeColor(user.planType, user.paymentStatus)
                      }`}>
                        {getPlanBadgeText(user.planType, user.paymentStatus)}
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
                    onClick={() => onHomeClick()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Studio Home
                  </button>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('navigate-dashboard');
                      window.dispatchEvent(event);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                  </button>
                  {user.role === 'user' && hasActivePaidPlan(user) && (
                    <button
                      onClick={() => {
                        const event = new CustomEvent('navigate-addon-credits');
                        window.dispatchEvent(event);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-indigo-50 font-bold"
                    >
                      ⚡ Add-On Credits
                    </button>
                  )}
                  {user.role === 'user' && !hasActivePaidPlan(user) && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate-pricing'));
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-bold"
                    >
                      📈 Upgrade Plan
                    </button>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {user && (
              <button
                onClick={() => {
                  const event = new CustomEvent('navigate-library');
                  window.dispatchEvent(event);
                }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Library
              </button>
            )}

            {showHomeButton && (
              <button
                onClick={onHomeClick}
                className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors duration-300"
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
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
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
    </header>
  );
};

export default Header;