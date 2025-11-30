'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { messagesApi } from '@/lib/api/messages';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Poll for new messages every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await messagesApi.getUnreadCount(user._id) as any;
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
            🔧 Trade Shop
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              {t('nav.marketplace')}
            </Link>
            <Link href="/subscription" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              {t('nav.subscription')}
            </Link>
            
            {user ? (
              <>
                <Link href="/control-panel" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  {t('nav.controlPanel')}
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative">
                  {t('nav.messages')}
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.userType === 'tradesperson' && (
                  <>
                    <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      {t('nav.jobs')}
                    </Link>
                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      {t('nav.profile')}
                    </Link>
                  </>
                )}
                <Button variant="secondary" size="sm" onClick={logout}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    {t('home.getStarted')}
                  </Button>
                </Link>
              </>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="relative flex items-center w-[72px] h-9 bg-blue-100 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-200 transition-colors duration-200"
              title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              aria-label="Toggle language"
            >
              {/* Background labels */}
              <span className="absolute left-2.5 text-xs font-bold text-blue-400">EN</span>
              <span className="absolute right-2.5 text-xs font-bold text-blue-400">ES</span>
              {/* Sliding indicator */}
              <span 
                className="absolute w-8 h-7 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.32,1.15)]"
                style={{ left: language === 'en' ? '2px' : '34px' }}
              >
                {language === 'en' ? 'EN' : 'ES'}
              </span>
            </button>
          </div>

          {/* Mobile: Language Toggle + Menu */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="relative flex items-center w-16 h-8 bg-blue-100 border border-blue-200 rounded-full cursor-pointer"
              aria-label="Toggle language"
            >
              <span className="absolute left-2 text-[10px] font-bold text-blue-400">EN</span>
              <span className="absolute right-2 text-[10px] font-bold text-blue-400">ES</span>
              <span 
                className="absolute w-7 h-6 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.32,1.15)]"
                style={{ left: language === 'en' ? '2px' : '30px' }}
              >
                {language === 'en' ? 'EN' : 'ES'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
