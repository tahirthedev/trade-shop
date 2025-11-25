'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { messagesApi } from '@/lib/api/messages';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, logout } = useAuth();
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
              Find Professionals
            </Link>
            <Link href="/subscription" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Pricing
            </Link>
            
            {user ? (
              <>
                <Link href="/control-panel" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Control Panel
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative">
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.userType === 'tradesperson' && (
                  <>
                    <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Jobs
                    </Link>
                    <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      My Profile
                    </Link>
                  </>
                )}
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
