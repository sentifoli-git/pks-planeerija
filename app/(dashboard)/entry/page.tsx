'use client';

import React, { useState } from 'react';
import { LISTS, UNITS, UnitCode } from '@/lib/data';
import { Save, Calendar, Check } from 'lucide-react';
import { format } from 'date-fns';
import { et } from 'date-fns/locale';

interface EntryData {
  listId: number;
  called: number;
  completed: number;
  refused: number;
  noShow: number;
}

export default function EntryPage() {
  const [selectedUnit, setSelectedUnit] = useState<UnitCode>('PELGULINN');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<Record<number, EntryData>>({});
  const [saved, setSaved] = useState(false);

  const unitLists = LISTS.filter(l => l.unit === selectedUnit);

  const updateEntry = (listId: number, field: keyof EntryData, value: number) => {
    setEntries(prev => ({
      ...prev,
      [listId]: {
        ...prev[listId],
        listId,
        called: prev[listId]?.called || 0,
        completed: prev[listId]?.completed || 0,
        refused: prev[listId]?.refused || 0,
        noShow: prev[listId]?.noShow || 0,
        [field]: Math.max(0, value),
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Save to database
    console.log('Saving:', { date: selectedDate, unit: selectedUnit, entries });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totals = Object.values(entries).reduce(
    (acc, e) => ({
      called: acc.called + (e.called || 0),
      completed: acc.completed + (e.completed || 0),
      refused: acc.refused + (e.refused || 0),
      noShow: acc.noShow + (e.noShow || 0),
    }),
    { called: 0, completed: 0, refused: 0, noShow: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Päeva sisestus</h1>
        <p className="text-slate-600">Sisesta kutsutud ja tehtud per nimistu</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-auto"
          />
        </div>
        <div className="flex gap-2">
          {(Object.keys(UNITS) as UnitCode[]).map(unit => (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedUnit === unit
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {UNITS[unit]}
            </button>
          ))}
        </div>
      </div>

      {/* Entry table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Nimistu</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Sihtrühm</th>
                <th className="px-4 py-3 text-center font-medium text-emerald-600">Kutsutud *</th>
                <th className="px-4 py-3 text-center font-medium text-emerald-600">Tehtud *</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Keeldujad</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Ei tulnud</th>
              </tr>
            </thead>
            <tbody>
              {unitLists.map((list, idx) => {
                const entry = entries[list.id] || { called: 0, completed: 0, refused: 0, noShow: 0 };
                return (
                  <tr key={list.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-3 font-medium text-slate-900">{list.name}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{list.target}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.called || ''}
                        onChange={(e) => updateEntry(list.id, 'called', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 mx-auto block px-2 py-1 text-center rounded border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.completed || ''}
                        onChange={(e) => updateEntry(list.id, 'completed', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 mx-auto block px-2 py-1 text-center rounded border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.refused || ''}
                        onChange={(e) => updateEntry(list.id, 'refused', parseInt(e.target.value) || 0)}
                        placeholder="–"
                        className="w-20 mx-auto block px-2 py-1 text-center rounded border border-slate-200 focus:border-slate-400 text-slate-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.noShow || ''}
                        onChange={(e) => updateEntry(list.id, 'noShow', parseInt(e.target.value) || 0)}
                        placeholder="–"
                        className="w-20 mx-auto block px-2 py-1 text-center rounded border border-slate-200 focus:border-slate-400 text-slate-500"
                      />
                    </td>
                  </tr>
                );
              })}
              {/* Totals */}
              <tr className="bg-emerald-50 border-t-2 border-emerald-200 font-semibold">
                <td className="px-4 py-3 text-slate-900">KOKKU</td>
                <td className="px-4 py-3 text-center text-slate-500">
                  {unitLists.reduce((s, l) => s + l.target, 0)}
                </td>
                <td className="px-4 py-3 text-center text-emerald-700">{totals.called}</td>
                <td className="px-4 py-3 text-center text-emerald-700">{totals.completed}</td>
                <td className="px-4 py-3 text-center text-slate-500">{totals.refused || '–'}</td>
                <td className="px-4 py-3 text-center text-slate-500">{totals.noShow || '–'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">* Kohustuslikud väljad</p>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvestatud!' : 'Salvesta'}
        </button>
      </div>
    </div>
  );
}
