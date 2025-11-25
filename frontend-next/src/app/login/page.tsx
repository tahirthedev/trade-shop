'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type { LoginFormData, RegisterFormData } from '@/types';
import { Check, Wrench } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    name: '',
    userType: 'client',
    phone: '',
    trade: '',
    yearsExperience: 0,
    hourlyRate: { min: 0, max: 0 },
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt with:', loginForm.email);
      const response = await authApi.login(loginForm);
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, user:', response.user);
        login(response.token, response.user);
        
        // Redirect based on user type
        if (response.user.userType === 'tradesperson') {
          router.push('/jobs'); // Job board for professionals
        } else {
          router.push('/marketplace'); // Marketplace for clients
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(registerForm);
      
      if (response.success) {
        login(response.token, response.user);
        
        // Redirect based on user type
        if (response.user.userType === 'tradesperson') {
          router.push('/jobs');
        } else {
          router.push('/marketplace');
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-center text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Trade Shop</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">The Professional Trade Marketplace</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">Connect with quality tradespeople</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">AI-powered matching</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">Verified professionals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">Secure payments</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">Project management tools</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p className="text-gray-600">Sign in to continue to Trade Shop</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
                  activeTab === 'login'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
                  activeTab === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner size="sm" /> : 'Sign In'}
                </button>

                <div className="text-center">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a...
                  </label>
                  <select
                    value={registerForm.userType}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        userType: e.target.value as 'client' | 'tradesperson',
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    disabled={loading}
                  >
                    <option value="client">Client (Looking for tradespeople)</option>
                    <option value="tradesperson">Tradesperson (Offering services)</option>
                  </select>
                </div>

                {registerForm.userType === 'tradesperson' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trade Type
                      </label>
                      <select
                        value={registerForm.trade || ''}
                        onChange={(e) => setRegisterForm({ ...registerForm, trade: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                        disabled={loading}
                      >
                        <option value="">Select your trade</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="Painter">Painter</option>
                        <option value="Mason">Mason</option>
                        <option value="Roofer">Roofer</option>
                        <option value="General Contractor">General Contractor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={registerForm.yearsExperience?.toString() || '0'}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, yearsExperience: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="5"
                        min="0"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate Range
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          value={registerForm.hourlyRate?.min.toString() || '0'}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              hourlyRate: { ...registerForm.hourlyRate!, min: parseFloat(e.target.value) },
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Min ($50)"
                          min="0"
                          required
                          disabled={loading}
                        />
                        <input
                          type="number"
                          value={registerForm.hourlyRate?.max.toString() || '0'}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              hourlyRate: { ...registerForm.hourlyRate!, max: parseFloat(e.target.value) },
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="Max ($150)"
                          min="0"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner size="sm" /> : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
