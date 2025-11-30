'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type { LoginFormData, RegisterFormData } from '@/types';
import { Check, Wrench } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
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
            <p className="text-xl text-blue-100 mb-8">{t('login.branding.tagline')}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">{t('login.branding.features.connect')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">{t('login.branding.features.ai')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">{t('login.branding.features.verified')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">{t('login.branding.features.payments')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-lg">{t('login.branding.features.tools')}</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('login.welcome')}</h2>
              <p className="text-gray-600">{t('login.subtitle')}</p>
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
                {t('login.tabs.login')}
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 text-center font-semibold transition-colors border-b-2 ${
                  activeTab === 'register'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('login.tabs.register')}
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
                    {t('login.form.email')}
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    placeholder={t('login.form.emailPlaceholder')}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.form.password')}
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
                  {loading ? <Spinner size="sm" /> : t('login.form.signIn')}
                </button>

                <div className="text-center">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    {t('login.form.forgotPassword')}
                  </a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.form.fullName')}
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder={t('login.form.namePlaceholder')}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.form.email')}
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder={t('login.form.emailPlaceholder')}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('login.form.password')}
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
                    {t('login.form.phone')}
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
                    {t('login.form.iAm')}
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
                    <option value="client">{t('login.form.client')}</option>
                    <option value="tradesperson">{t('login.form.tradesperson')}</option>
                  </select>
                </div>

                {registerForm.userType === 'tradesperson' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('login.form.tradeType')}
                      </label>
                      <select
                        value={registerForm.trade || ''}
                        onChange={(e) => setRegisterForm({ ...registerForm, trade: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        required
                        disabled={loading}
                      >
                        <option value="">{t('login.form.selectTrade')}</option>
                        <option value="Electrician">{t('common.trades.electrician')}</option>
                        <option value="Plumber">{t('common.trades.plumber')}</option>
                        <option value="HVAC">{t('common.trades.hvac')}</option>
                        <option value="Carpenter">{t('common.trades.carpenter')}</option>
                        <option value="Painter">{t('common.trades.painter')}</option>
                        <option value="Mason">{t('common.trades.mason')}</option>
                        <option value="Roofer">{t('common.trades.roofer')}</option>
                        <option value="General Contractor">{t('common.trades.generalContractor')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('login.form.yearsExperience')}
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
                        {t('login.form.hourlyRate')}
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
                          placeholder={t('login.form.minRate')}
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
                          placeholder={t('login.form.maxRate')}
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
                  {loading ? <Spinner size="sm" /> : t('login.form.createAccount')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
