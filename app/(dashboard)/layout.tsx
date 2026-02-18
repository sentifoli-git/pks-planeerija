import { getSession, ROLE_NAMES } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PenSquare, CalendarDays, List, BarChart3, LogOut } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const navItems = [
    { href: '/overview', label: 'Ülevaade', icon: LayoutDashboard },
    { href: '/weekly', label: 'Nädal', icon: CalendarDays },
    { href: '/entry', label: 'Päev', icon: PenSquare },
    { href: '/lists', label: 'Nimistud', icon: List },
    { href: '/stats', label: 'Statistika', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-bold text-emerald-600">PKS Planeerija</h1>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{ROLE_NAMES[session.role]}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="p-2 text-slate-400 hover:text-slate-600">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-1 overflow-x-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 whitespace-nowrap"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
