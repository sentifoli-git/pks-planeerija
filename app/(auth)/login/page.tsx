'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Building2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

type UnitCode = 'PELGULINN' | 'ULEMISTE';

const UNITS: { code: UnitCode; name: string }[] = [
  { code: 'PELGULINN', name: 'Pelgulinn' },
  { code: 'ULEMISTE', name: 'Ülemiste' },
];

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<UnitCode | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsUnitSelection, setNeedsUnitSelection] = useState(false);
  const [validatedRole, setValidatedRole] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kõigepealt valideeri parool
      const validateRes = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const validateData = await validateRes.json();

      if (!validateRes.ok) {
        setError(validateData.error || 'Vale parool');
        setLoading(false);
        return;
      }

      // Kui on kõneliini õde, küsi üksuse valikut
      if (validateData.needsUnitSelection) {
        setNeedsUnitSelection(true);
        setValidatedRole(validateData.role);
        setLoading(false);
        return;
      }

      // Muidu logi kohe sisse
      await performLogin(password, null);
    } catch (err) {
      setError('Viga sisselogimisel. Palun proovi uuesti.');
      setLoading(false);
    }
  };

  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) {
      setError('Palun vali üksus');
      return;
    }
    
    setLoading(true);
    await performLogin(password, selectedUnit);
  };

  const performLogin = async (pwd: string, unit: UnitCode | null) => {
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, selectedUnit: unit }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError(loginData.error || 'Viga sisselogimisel');
        setLoading(false);
        return;
      }

      // Edukas sisselogimine
      router.push('/overview');
      router.refresh();
    } catch (err) {
      setError('Viga sisselogimisel. Palun proovi uuesti.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pks-50 via-white to-pks-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo ja pealkiri */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pks-600 text-white mb-4 shadow-lg shadow-pks-600/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PKS Planeerija</h1>
          <p className="text-slate-600 mt-1">Perearsti kvaliteedisüsteem</p>
        </div>

        {/* Login kaart */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {!needsUnitSelection ? (
            // Parooli vorm
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <div className="mb-6">
                <label htmlFor="password" className="form-label">
                  Sisesta parool
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input mt-1"
                  placeholder="••••••••••"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="btn-primary w-full"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Logi sisse
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            // Üksuse valiku vorm (kõneliini õele)
            <form onSubmit={handleUnitSubmit} className="p-6">
              <div className="mb-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pks-100 text-pks-600 mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="font-semibold text-slate-900">Vali üksus</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Tere, {validatedRole}! Millise üksusega täna töötad?
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {UNITS.map((unit) => (
                  <label
                    key={unit.code}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedUnit === unit.code 
                        ? 'border-pks-500 bg-pks-50' 
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="unit"
                      value={unit.code}
                      checked={selectedUnit === unit.code}
                      onChange={(e) => setSelectedUnit(e.target.value as UnitCode)}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedUnit === unit.code 
                        ? 'border-pks-500' 
                        : 'border-slate-300'
                      }
                    `}>
                      {selectedUnit === unit.code && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pks-500" />
                      )}
                    </div>
                    <span className={`font-medium ${selectedUnit === unit.code ? 'text-pks-700' : 'text-slate-700'}`}>
                      {unit.name}
                    </span>
                  </label>
                ))}
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNeedsUnitSelection(false);
                    setPassword('');
                    setError('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Tagasi
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedUnit}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Jätka
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Perekliinik © 2026
        </p>
      </div>
    </div>
  );
}
