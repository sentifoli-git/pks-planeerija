import { LISTS, UNITS, UnitCode } from '@/lib/data';
import { Users, Target } from 'lucide-react';

export default function ListsPage() {
  const units = Object.keys(UNITS) as UnitCode[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nimistud</h1>
        <p className="text-slate-600">Kõik nimistud ja sihtrühmad</p>
      </div>

      {units.map(unit => {
        const lists = LISTS.filter(l => l.unit === unit);
        const totalTarget = lists.reduce((s, l) => s + l.target, 0);
        const totalDone = lists.reduce((s, l) => s + Math.round(l.target * l.done / 100), 0);

        return (
          <div key={unit} className="card overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">{UNITS[unit]}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">{lists.length} nimistut</span>
                <span className="text-emerald-600 font-medium">Sihtrühm: {totalTarget}</span>
                <span className="text-blue-600 font-medium">Tehtud: {totalDone}</span>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nimistu</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Sihtrühm</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Tehtud</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Hõlmatus</th>
                </tr>
              </thead>
              <tbody>
                {lists.map((list, idx) => {
                  const doneCount = Math.round(list.target * list.done / 100);
                  return (
                    <tr key={list.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="font-medium text-slate-900">{list.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{list.target}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{doneCount}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${
                          list.done >= 90 ? 'text-emerald-600' : 
                          list.done >= 70 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {list.done}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
