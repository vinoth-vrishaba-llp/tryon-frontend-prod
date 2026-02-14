import React, { useState } from 'react';
import { signupStepOne, signupStepTwo, getStepOneData, clearSignupData } from '../services/authService';
import { SignupData, User } from '../types';
import loginBg from '../Image/bg.jpg';
import { User as UserIcon, Mail, Phone, Globe, Lock } from 'lucide-react';

interface SignupFlowProps {
  onSignupSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    brandName: '',
    email: '',
    mobile: '',
    website: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if we have stored step one data on mount
  React.useEffect(() => {
    const storedData = getStepOneData();
    if (storedData) {
      setFormData({
        fullName: storedData.fullName || '',
        brandName: storedData.brandName || '',
        email: storedData.email || '',
        mobile: storedData.mobile || '',
        website: storedData.website || ''
      });
      // If we have stored data, move to step 2
      if (storedData.email) {
        setStep(2);
      }
    }
  }, []);

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signupStepOne(formData);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to proceed to next step');
    } finally {
      setLoading(false);
    }
  };

  const handleStepTwoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate passwords
    if (!password || password.trim().length === 0) {
      setError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Match backend validation requirements
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    // Validate email
    if (!formData.email || !formData.email.trim()) {
      setError('Email is missing. Please go back to step 1.');
      return;
    }
    setLoading(true);
    try {
      console.log('Submitting step 2 with email:', formData.email);
      const response = await signupStepTwo(formData.email, password);
      console.log('Signup successful:', response.user);
      onSignupSuccess(response.user);
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Handle different error types
      if (err.message?.includes('Validation failed')) {
        setError('Please check all fields are filled correctly and try again.');
        setStep(1);
        clearSignupData();
      } else if (err.message?.includes('session expired') || 
                 err.message?.includes('invalid') ||
                 err.message?.includes('Signup session')) {
        setError('Your session expired. Please complete step 1 again.');
        setStep(1);
        clearSignupData();
      } else if (err.message?.includes('Email already exists')) {
        setError('This email is already registered. Please login instead.');
      } else {
        setError(err.message || 'Failed to complete signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStepOne = () => {
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-surface-inverse/60 via-surface-inverse/30 to-surface-inverse/60"></div>

      <div className="relative max-w-md w-full rounded-2xl bg-surface backdrop-blur-xl shadow-2xl border border-border p-6 sm:p-8 z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold text-content mb-1">Create Account</h1>
          <p className="text-content-secondary text-sm">Step {step} of 2</p>
        </div>

        {/* Step Progress Line */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-content-disabled'}`}>
              Business Info
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-content-tertiary'}`}>
              Set Password
            </span>
          </div>
          <div className="w-full bg-surface-tertiary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-surface-tertiary border-l-4 border-border-strong text-content text-sm rounded">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStepOneSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
              />
            </div>

            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="Brand Name"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email (john@gmail.com)"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Mobile (+1 298 232 121)"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
              />
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="Website (optional)"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-content-inverse font-bold rounded-lg shadow-lg hover:bg-interactive-hover transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex justify-center items-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-content-inverse border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Continue to Password'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStepTwoSubmit} className="space-y-4">
            <div className="mb-4 p-3 bg-surface-secondary rounded-lg">
              <p className="text-sm text-content-secondary">
                <span className="font-semibold">Email:</span> {formData.email}
              </p>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-16 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm text-primary font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-content-tertiary w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full pl-11 pr-16 py-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus focus:outline-none"
                minLength={8}
              />
            </div>

            <p className="text-xs text-content-tertiary">
              Must contain: uppercase, lowercase, and number
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleBackToStepOne}
                className="flex-1 bg-surface-tertiary text-content-secondary py-3 rounded-lg font-semibold hover:bg-border transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-primary text-content-inverse font-bold rounded-lg shadow-lg hover:bg-interactive-hover transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex justify-center items-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-content-inverse border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-content-secondary">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="text-primary font-bold hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupFlow;