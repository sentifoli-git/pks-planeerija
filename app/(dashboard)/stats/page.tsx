import { LISTS, UNITS, getUnitTotals, getAllTotals, UnitCode } from '@/lib/data';
import { BarChart3, TrendingUp, Target, Users } from 'lucide-react';

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={`font-medium ${value >= 90 ? 'text-emerald-600' : value >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
          {value}%
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${value >= 90 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-400'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function StatsPage() {
  const totals = getAllTotals();
  const units = Object.keys(UNITS) as UnitCode[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Statistika</h1>
        <p className="text-slate-600">PKS hõlmatuse ülevaade</p>
      </div>

      {/* Overall stats */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Kogu Perekliiniku hõlmatus
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{totals.listCount}</p>
            <p className="text-sm text-slate-500">Nimistut</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{totals.target}</p>
            <p className="text-sm text-slate-500">Sihtrühm</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{totals.doneCount}</p>
            <p className="text-sm text-slate-500">Tehtud</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{totals.donePercent}%</p>
            <p className="text-sm text-slate-500">Hõlmatus</p>
          </div>
        </div>

        <ProgressBar value={totals.donePercent} label="Kokku" />
      </div>

      {/* Per unit stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {units.map(unit => {
          const ut = getUnitTotals(unit);
          return (
            <div key={unit} className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-4">{UNITS[unit]}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Nimistuid</span>
                  <span className="font-medium">{ut.listCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sihtrühm</span>
                  <span className="font-medium text-emerald-600">{ut.target}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tehtud</span>
                  <span className="font-medium text-blue-600">{ut.doneCount}</span>
                </div>
              </div>

              <ProgressBar value={ut.donePercent} label="Hõlmatus" />
            </div>
          );
        })}
      </div>

      {/* Top performers */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Parimad tulemused
        </h2>
        
        <div className="space-y-3">
          {[...LISTS]
            .sort((a, b) => b.done - a.done)
            .slice(0, 5)
            .map((list, idx) => (
              <div key={list.id} className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-slate-200 text-slate-600' :
                  idx === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{list.name}</p>
                  <p className="text-xs text-slate-500">{UNITS[list.unit]}</p>
                </div>
                <span className="text-lg font-bold text-emerald-600">{list.done}%</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
