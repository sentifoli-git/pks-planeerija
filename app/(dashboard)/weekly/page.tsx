'use client';

import React, { useState } from 'react';
import { LISTS, UNITS, UnitCode } from '@/lib/data';
import { Save, ChevronLeft, ChevronRight, Check, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getISOWeek } from 'date-fns';
import { et } from 'date-fns/locale';

interface WeeklyEntry {
  listId: number;
  called: number;
  completed: number;
  refused: number;
  noShow: number;
}

export default function WeeklyPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedUnit, setSelectedUnit] = useState<UnitCode>('PELGULINN');
  const [entries, setEntries] = useState<Record<number, WeeklyEntry>>({});
  const [saved, setSaved] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(currentDate);

  const unitLists = LISTS.filter(l => l.unit === selectedUnit);

  const goToPrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const updateEntry = (listId: number, field: keyof WeeklyEntry, value: number) => {
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
    console.log('Saving weekly:', { 
      week: weekNumber, 
      year: currentDate.getFullYear(),
      unit: selectedUnit, 
      entries 
    });
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

  const unitTarget = unitLists.reduce((s, l) => s + l.target, 0);
  const weeklyTarget = Math.round(unitTarget / 45); // 45 nädalat aastas

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nädala kokkuvõte</h1>
        <p className="text-slate-600">Sisesta nädala jooksul tehtud kroonikud</p>
      </div>

      {/* Week navigation */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <button onClick={goToPrevWeek} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-900">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Nädal {weekNumber}
            </div>
            <p className="text-sm text-slate-500">
              {format(weekStart, 'd. MMM', { locale: et })} – {format(weekEnd, 'd. MMM yyyy', { locale: et })}
            </p>
          </div>
          
          <button onClick={goToNextWeek} className="p-2 rounded-lg hover:bg-slate-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Unit selector */}
      <div className="flex gap-2">
        {(Object.keys(UNITS) as UnitCode[]).map(unit => (
          <button
            key={unit}
            onClick={() => {
              setSelectedUnit(unit);
              setEntries({});
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedUnit === unit
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {UNITS[unit]}
          </button>
        ))}
      </div>

      {/* Weekly target info */}
      <div className="card p-4 bg-emerald-50 border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-700">Nädala sihtarv ({UNITS[selectedUnit]})</p>
            <p className="text-2xl font-bold text-emerald-800">~{weeklyTarget} kroonikut</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-emerald-700">Sisestatud</p>
            <p className={`text-2xl font-bold ${totals.completed >= weeklyTarget ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totals.completed}
            </p>
          </div>
        </div>
      </div>

      {/* Entry table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Nimistu</th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">Sihtrühm</th>
                <th className="px-4 py-3 text-center font-medium text-emerald-600">Kutsutud</th>
                <th className="px-4 py-3 text-center font-medium text-emerald-600">Tehtud *</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Keeldus</th>
                <th className="px-4 py-3 text-center font-medium text-slate-400">Ei tulnud</th>
              </tr>
            </thead>
            <tbody>
              {unitLists.map((list, idx) => {
                const entry = entries[list.id] || { called: 0, completed: 0, refused: 0, noShow: 0 };
                const listWeeklyTarget = Math.round(list.target / 45);
                
                return (
                  <tr key={list.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{list.name}</span>
                      <span className="text-xs text-slate-400 ml-2">(~{listWeeklyTarget}/näd)</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">{list.target}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.called || ''}
                        onChange={(e) => updateEntry(list.id, 'called', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 mx-auto block px-2 py-1.5 text-center rounded border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.completed || ''}
                        onChange={(e) => updateEntry(list.id, 'completed', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 mx-auto block px-2 py-1.5 text-center rounded border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-emerald-50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.refused || ''}
                        onChange={(e) => updateEntry(list.id, 'refused', parseInt(e.target.value) || 0)}
                        placeholder="–"
                        className="w-20 mx-auto block px-2 py-1.5 text-center rounded border border-slate-200 text-slate-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={entry.noShow || ''}
                        onChange={(e) => updateEntry(list.id, 'noShow', parseInt(e.target.value) || 0)}
                        placeholder="–"
                        className="w-20 mx-auto block px-2 py-1.5 text-center rounded border border-slate-200 text-slate-500"
                      />
                    </td>
                  </tr>
                );
              })}
              {/* Totals */}
              <tr className="bg-emerald-50 border-t-2 border-emerald-200 font-semibold">
                <td className="px-4 py-3 text-slate-900">NÄDAL KOKKU</td>
                <td className="px-4 py-3 text-center text-slate-500">
                  {unitLists.reduce((s, l) => s + l.target, 0)}
                </td>
                <td className="px-4 py-3 text-center text-emerald-700">{totals.called}</td>
                <td className="px-4 py-3 text-center">
                  <span className={totals.completed >= weeklyTarget ? 'text-emerald-700' : 'text-amber-600'}>
                    {totals.completed}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-500">{totals.refused || '–'}</td>
                <td className="px-4 py-3 text-center text-slate-500">{totals.noShow || '–'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Nädala eesmärgi täitmine</span>
          <span className={`text-sm font-medium ${totals.completed >= weeklyTarget ? 'text-emerald-600' : 'text-amber-600'}`}>
            {totals.completed} / {weeklyTarget} ({weeklyTarget > 0 ? Math.round((totals.completed / weeklyTarget) * 100) : 0}%)
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${totals.completed >= weeklyTarget ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min((totals.completed / weeklyTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">* Tehtud = läbivaadatud kroonikud</p>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvestatud!' : 'Salvesta nädal'}
        </button>
      </div>
    </div>
  );
}
