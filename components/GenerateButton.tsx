import React from 'react';
import { User } from '../types';
import {
    hasActivePaidPlan,
    canUseQuality,
    getCreditCost,
    validateGenerationAttempt
} from '../services/authService';

interface GenerateButtonProps {
    user: User;
    quality: 'standard' | 'high' | 'ultra';
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    onNavigateToPricing: () => void;
    onNavigateToAddons: () => void;
    className?: string;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
    user,
    quality,
    onClick,
    disabled = false,
    loading = false,
    onNavigateToPricing,
    onNavigateToAddons,
    className = ''
}) => {
    const creditsNeeded = getCreditCost(quality);
    
    const handleClick = () => {
        // Validate the generation attempt
        const validation = validateGenerationAttempt(user, quality);
        
        if (!validation.allowed) {
            // Redirect based on the action needed
            if (validation.action === 'upgrade') {
                onNavigateToPricing();
            } else if (validation.action === 'buy-credits') {
                onNavigateToAddons();
            }
            return;
        }
        
        // All checks passed, proceed with generation
        onClick();
    };
    
    const getButtonText = (): string => {
        if (loading) {
            return 'Generating...';
        }
        
        // Check if user has active plan
        if (!hasActivePaidPlan(user)) {
            if (user.planType === 'Free') {
                return 'Upgrade to Generate';
            }
            if (user.paymentStatus === 'expired') {
                return 'Renew Plan to Generate';
            }
            return 'Get Plan to Generate';
        }
        
        // Check quality restriction
        if (!canUseQuality(user, quality)) {
            return 'Upgrade for This Quality';
        }
        
        // Check credits
        if (user.tokenBalance < creditsNeeded) {
            return 'Buy Credits to Generate';
        }
        
        // All good
        return `Generate (${creditsNeeded} credits)`;
    };
    
    const getButtonStyle = (): string => {
        const baseStyle = className || 'w-full max-w-xs mt-4 px-8 py-4 font-black rounded-xl shadow-2xl transition-all active:scale-95 ring-4 ring-white disabled:opacity-50';
        
        // Different colors based on state
        if (!hasActivePaidPlan(user)) {
            return `${baseStyle} bg-primary text-white hover:bg-indigo-800`; // Upgrade needed
        }
        
        if (!canUseQuality(user, quality)) {
            return `${baseStyle} bg-orange-600 text-white hover:bg-orange-700`; // Quality upgrade needed
        }
        
        if (user.tokenBalance < creditsNeeded) {
            return `${baseStyle} bg-yellow-600 text-white hover:bg-yellow-700`; // Credits needed
        }
        
        return `${baseStyle} bg-accent text-white hover:bg-pink-600`; // Ready to generate
    };
    
    return (
        <button
            onClick={handleClick}
            disabled={disabled || loading}
            className={getButtonStyle()}
            type="button"
        >
            {getButtonText()}
        </button>
    );
};

export default GenerateButton;