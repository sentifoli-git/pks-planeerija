import { LISTS, UNITS, getUnitTotals, getAllTotals, UnitCode } from '@/lib/data';
import { Users, Target, TrendingUp } from 'lucide-react';

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-400'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function UnitCard({ unit }: { unit: UnitCode }) {
  const totals = getUnitTotals(unit);
  const lists = LISTS.filter(l => l.unit === unit);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{UNITS[unit]}</h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          totals.donePercent >= 90 ? 'bg-emerald-100 text-emerald-700' :
          totals.donePercent >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}>
          {totals.donePercent}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900">{totals.listCount}</p>
          <p className="text-xs text-slate-500">nimistut</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-600">{totals.target}</p>
          <p className="text-xs text-slate-500">sihtrühm</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-700">{totals.doneCount}</p>
          <p className="text-xs text-slate-500">tehtud</p>
        </div>
      </div>

      <ProgressBar value={totals.doneCount} max={totals.target} />

      <div className="mt-4 space-y-2">
        {lists.map(list => (
          <div key={list.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{list.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{list.target}</span>
              <span className={`font-medium ${list.done >= 90 ? 'text-emerald-600' : list.done >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                {list.done}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const totals = getAllTotals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ülevaade</h1>
        <p className="text-slate-600">PKS 2026 · Perekliiniku kvaliteedisüsteem</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totals.listCount}</p>
            <p className="text-sm text-slate-500">Nimistut kokku</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{totals.target}</p>
            <p className="text-sm text-slate-500">Sihtrühm kokku</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{totals.donePercent}%</p>
            <p className="text-sm text-slate-500">Hõlmatus ({totals.doneCount})</p>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UnitCard unit="PELGULINN" />
        <UnitCard unit="ULEMISTE" />
        <UnitCard unit="KIILI" />
      </div>
    </div>
  );
}
