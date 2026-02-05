'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  Building2, 
  ChevronDown,
  User,
  RefreshCw
} from 'lucide-react';
import { RoleCode, UnitCode } from '@/lib/types';

interface HeaderProps {
  roleName: string;
  unitName: string | null;
  role: RoleCode;
  selectedUnit: UnitCode | null;
}

const UNITS: { code: UnitCode; name: string }[] = [
  { code: 'PELGULINN', name: 'Pelgulinn' },
  { code: 'ULEMISTE', name: 'Ülemiste' },
];

export default function Header({ roleName, unitName, role, selectedUnit }: HeaderProps) {
  const router = useRouter();
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [changingUnit, setChangingUnit] = useState(false);

  const canChangeUnit = role === 'CALL_NURSE';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  const handleUnitChange = async (unit: UnitCode) => {
    setChangingUnit(true);
    setShowUnitMenu(false);
    
    try {
      const res = await fetch('/api/auth/change-unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Unit change error:', err);
    } finally {
      setChangingUnit(false);
    }
  };

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-slate-200 flex items-center justify-end px-4 lg:px-6">
      {/* Right side - user info */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Unit selector (for call nurse) */}
        {canChangeUnit && (
          <div className="relative">
            <button
              onClick={() => setShowUnitMenu(!showUnitMenu)}
              disabled={changingUnit}
              className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg bg-pks-50 text-pks-700 hover:bg-pks-100 transition-colors text-sm"
            >
              {changingUnit ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
              <span className="font-medium hidden sm:inline">{unitName || 'Vali'}</span>
              <span className="font-medium sm:hidden">{unitName?.slice(0, 3) || '...'}</span>
              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>

            {showUnitMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUnitMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1">
                  {UNITS.map((unit) => (
                    <button
                      key={unit.code}
                      onClick={() => handleUnitChange(unit.code)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50
                        ${selectedUnit === unit.code ? 'bg-pks-50 text-pks-700 font-medium' : 'text-slate-700'}
                      `}
                    >
                      {unit.name}
                      {selectedUnit === unit.code && ' ✓'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Non-changeable unit display */}
        {!canChangeUnit && unitName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{unitName}</span>
          </div>
        )}

        {/* Role badge - hidden on very small screens */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm">
          <User className="w-4 h-4" />
          <span>{roleName}</span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Logi välja"
        >
          {loggingOut ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
