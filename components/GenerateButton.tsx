import React from 'react';
import { User } from '../types';
import {
    hasActivePaidPlan,
    hasRemainingCredits,
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
        
        // Check if user has active plan or remaining credits
        if (!hasActivePaidPlan(user) && !hasRemainingCredits(user)) {
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
        const baseStyle = className || 'w-full max-w-xs mt-4 px-8 py-4 font-black rounded-xl shadow-2xl transition-all active:scale-95 ring-4 ring-surface disabled:opacity-50';

        // Different colors based on state
        if (!hasActivePaidPlan(user) && !hasRemainingCredits(user)) {
            return `${baseStyle} bg-primary text-content-inverse hover:bg-interactive-hover`; // Upgrade needed
        }

        if (!canUseQuality(user, quality)) {
            return `${baseStyle} bg-secondary text-content-inverse hover:bg-interactive-hover`; // Quality upgrade needed
        }

        if (user.tokenBalance < creditsNeeded) {
            return `${baseStyle} bg-content-tertiary text-content-inverse hover:bg-content-secondary`; // Credits needed
        }

        return `${baseStyle} bg-primary text-content-inverse hover:bg-interactive-hover`; // Ready to generate
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