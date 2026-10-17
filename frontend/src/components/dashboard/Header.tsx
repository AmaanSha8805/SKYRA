'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu, Bell, LogOut, ChevronDown, Settings, User, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load voice mute state from localStorage
  useEffect(() => {
    const savedMuteState = localStorage.getItem('voice_welcome_muted');
    if (savedMuteState !== null) {
      setIsVoiceMuted(JSON.parse(savedMuteState));
    }
  }, []);

  const toggleVoiceMute = () => {
    const newState = !isVoiceMuted;
    setIsVoiceMuted(newState);
    localStorage.setItem('voice_welcome_muted', JSON.stringify(newState));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#050508]/95 backdrop-blur supports-[backdrop-filter]:bg-[#050508]/60">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 hover:bg-[#12121c] rounded-lg transition-colors text-white"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Voice Toggle */}
        <button
          onClick={toggleVoiceMute}
          className="p-2 hover:bg-[#12121c] rounded-lg transition-colors text-white"
          aria-label={isVoiceMuted ? "Unmute voice" : "Mute voice"}
          title={isVoiceMuted ? "Unmute welcome voice" : "Mute welcome voice"}
        >
          {isVoiceMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 hover:bg-[#12121c] rounded-lg transition-colors text-white"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-skyra-pink" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-[#12121c] rounded-lg transition-colors text-white"
            aria-label="User menu"
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium text-white"
              style={{
                background: 'linear-gradient(135deg, #E91E8C, #8b5cf6)'
              }}
            >
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-white">
                {user?.full_name || user?.email?.split('@')[0]}
              </div>
              <div className="text-xs text-white/60">
                {user?.email}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/60" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a12] shadow-lg animate-in fade-in slide-in-from-top-1">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <div className="text-sm font-medium text-white">
                      {user?.full_name || user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-white/60">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/dashboard/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#12121c] rounded-lg transition-colors text-left text-white"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#12121c] rounded-lg transition-colors text-left text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Clock */}
        <div className="hidden sm:block text-right" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }} suppressHydrationWarning>
          <div suppressHydrationWarning>{formatTime(currentTime)}</div>
          <div suppressHydrationWarning>{formatDate(currentTime)}</div>
        </div>
      </div>
    </header>
  );
}
