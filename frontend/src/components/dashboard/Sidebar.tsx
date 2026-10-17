'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems, NavItem } from '@/types/navigation';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300',
        'bg-[#0d0d1f]',
        isCollapsed ? 'w-16' : 'w-[240px]'
      )}
      style={{ borderColor: 'rgba(139,92,246,0.1)' }}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-12 items-center px-4 border-b border-[rgba(139,92,246,0.08)]">
          <Link href="/dashboard" className="flex items-center gap-1 font-semibold" style={{ background: 'transparent', padding: 0 }}>
            <Image
              src="/skyra-logo.png"
              alt="SKYRA Logo"
              width={34}
              height={34}
              className="h-[34px] w-auto object-contain"
              style={{ 
  filter: 'drop-shadow(0 0 8px rgba(233,30,140,0.4)) brightness(1.1)',
  mixBlendMode: 'screen'
}}
            />
            {!isCollapsed && <span className="text-white tracking-[10px] text-sm font-semibold ml-1">SKYRA</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-1.5 py-1">
          <ul className="flex flex-col gap-0">
            {navItems.map((item) => (
              <li key={item.id}>
                <SidebarItem
                  item={item}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={cn(
            'flex h-10 items-center justify-center hover:bg-[#080818] transition-colors text-white/60 hover:text-white',
            'border-t border-[rgba(139,92,246,0.08)]'
          )}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

// ============================================================
// Sidebar Item
// ============================================================

function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2 text-[13.5px] transition-all duration-[0.15s] ease m-0',
        isCollapsed ? 'justify-center px-1 py-[18px]' : 'px-4 py-[18px]',
        isActive
          ? 'bg-[rgba(139,92,246,0.2)] text-white border-l-[3px] border-[#E91E8C] rounded-r-[10px]'
          : 'text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)]'
      )}
    >
      <Icon className={cn('w-4 h-4', isActive && 'text-[#E91E8C]')} />
      {!isCollapsed && <span className="flex-1 font-medium">{item.label}</span>}
      {!isCollapsed && item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-[#a78bfa] border border-[rgba(139,92,246,0.3)]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}