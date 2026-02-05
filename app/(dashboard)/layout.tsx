import { redirect } from 'next/navigation';
import { getSession, ROLE_NAMES, UNIT_NAMES, ROLE_PERMISSIONS } from '@/lib/auth';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const permissions = ROLE_PERMISSIONS[session.role];
  const roleName = ROLE_NAMES[session.role];
  const unitName = session.selectedUnit ? UNIT_NAMES[session.selectedUnit] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (includes mobile menu) */}
      <Sidebar 
        role={session.role} 
        permissions={permissions}
        selectedUnit={session.selectedUnit}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          roleName={roleName}
          unitName={unitName}
          role={session.role}
          selectedUnit={session.selectedUnit}
        />

        {/* Page content - with padding for mobile bottom nav */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
