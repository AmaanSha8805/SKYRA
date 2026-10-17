'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { SkyraAssistant } from '../SkyraAssistant';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080818]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          'md:ml-[240px]',
          isSidebarCollapsed && 'md:ml-16'
        )}
      >
        <Header onMobileMenuToggle={() => setIsMobileNavOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* SKYRA Assistant */}
      <SkyraAssistant />
    </div>
  );
}
