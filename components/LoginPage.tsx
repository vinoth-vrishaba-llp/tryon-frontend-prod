import React, { useState } from 'react';
import { login } from '../services/authService';
import { User } from '../types';
import loginBg from '../Image/bg.jpg';
import { Mail, Lock } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
    onNavigateToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login(email, password);
            onLoginSuccess(response.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: `url(${loginBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Background overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/60"></div>

            <div
                className="relative max-w-md w-full rounded-2xl 
                bg-white backdrop-blur-xl 
                shadow-2xl border border-white/30 
                p-6 sm:p-8 z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-3 text-sm">
                        Sign in to your AI Try-On Studio
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            required
                            className="w-full pl-11 pr-4 py-3 rounded-lg border 
                            border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="w-full pl-11 pr-16 py-3 rounded-lg border 
                            border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-sm text-primary font-semibold"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-primary text-white font-bold 
                        rounded-lg shadow-lg hover:bg-indigo-800 
                        transition-all duration-300 transform hover:scale-[1.02] 
                        disabled:opacity-50 disabled:scale-100 
                        flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {/* Trust line */}
                    <p className="text-xs text-gray-500 text-center">
                        Secure login 
                    </p>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={onNavigateToSignup}
                            className="text-primary font-bold hover:underline"
                        >
                            Sign up now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;