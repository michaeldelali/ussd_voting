'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Crown, Loader2, Shield, Users } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // backgroundImage: `url('data:image/jpeg;base64,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')`
          backgroundImage: `url('/images/login.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 via-blue-900/90 to-purple-900/90"></div>
      </div>

      {/* Mobile-first responsive layout */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header with animated carnival elements */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              Borborbor Carnival 25
            </h1>
            <p className="text-white/90 text-base sm:text-lg font-medium flex items-center justify-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Dashboard
            </p>
          </div>

          {/* Login form with glassmorphism */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password field with toggle */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-sm p-3 rounded-xl backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Users className="h-5 w-5 mr-2" />
                    Access Dashboard
                  </div>
                )}
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              © 2025 Borborbor Carnival. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Floating particles animation (optional decorative element) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-red-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
      </div>
    </div>
  );
}