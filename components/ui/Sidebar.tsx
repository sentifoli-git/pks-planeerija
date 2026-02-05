'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList,
  Settings,
  ScrollText,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { RoleCode, UnitCode } from '@/lib/types';
import { RolePermissions } from '@/lib/auth';

interface SidebarProps {
  role: RoleCode;
  permissions: RolePermissions;
  selectedUnit: UnitCode | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  show: boolean;
  showInBottomNav?: boolean;
}

export default function Sidebar({ role, permissions, selectedUnit }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sulge mobiilimenüü kui leht muutub
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    {
      href: '/overview',
      label: 'Ülevaade',
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: true,
      showInBottomNav: true,
    },
    {
      href: '/lists',
      label: 'Nimistud',
      icon: <Users className="w-5 h-5" />,
      show: true,
      showInBottomNav: true,
    },
    {
      href: '/calendar',
      label: 'Graafik',
      icon: <Calendar className="w-5 h-5" />,
      show: true,
      showInBottomNav: false,
    },
    {
      href: '/weekly',
      label: 'Sisestus',
      icon: <ClipboardList className="w-5 h-5" />,
      show: permissions.canEnterDailyData,
      showInBottomNav: true,
    },
    {
      href: '/settings',
      label: 'Seaded',
      icon: <Settings className="w-5 h-5" />,
      show: permissions.canEditSettings,
      showInBottomNav: false,
    },
    {
      href: '/audit',
      label: 'Auditlogi',
      icon: <ScrollText className="w-5 h-5" />,
      show: permissions.canViewAuditLog,
      showInBottomNav: false,
    },
  ];

  const visibleItems = navItems.filter(item => item.show);
  const bottomNavItems = visibleItems.filter(item => item.showInBottomNav).slice(0, 4);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg bg-pks-600 text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">PKS</h1>
            <p className="text-xs text-slate-500 leading-tight">Planeerija</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'nav-link-active' : 'nav-link'}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="px-4 py-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Periood: 01.02 – 13.12.2026
          </p>
        </div>
      </aside>

      {/* Mobile Header Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-slate-200"
        aria-label="Ava menüü"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu panel */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-xl flex flex-col">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pks-600 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900 text-lg leading-tight">PKS</h1>
                  <p className="text-xs text-slate-500 leading-tight">Planeerija</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label="Sulge menüü"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${isActive ? 'nav-link-active' : 'nav-link'} text-base py-3`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Periood: 01.02 – 13.12.2026
              </p>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[64px]
                  ${isActive 
                    ? 'text-pks-600' 
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
          {/* More button for additional items */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[64px] text-slate-500 hover:text-slate-700"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Veel</span>
          </button>
        </div>
      </nav>
    </>
  );
}
