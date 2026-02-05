'use client';

import { useState } from 'react';
import { Save, RefreshCw, Target, Calendar, Clock, Hash } from 'lucide-react';

interface SettingsForm {
  targetPct: number;
  inviteLeadDaysMin: number;
  inviteLeadDaysMax: number;
  periodStart: string;
  periodEnd: string;
  slotsPerDayFull: number;
  slotsPerDayHalf: number;
  weeklyConfirmationDay: string;
}

const INITIAL_SETTINGS: SettingsForm = {
  targetPct: 90,
  inviteLeadDaysMin: 7,
  inviteLeadDaysMax: 10,
  periodStart: '2026-02-01',
  periodEnd: '2026-12-13',
  slotsPerDayFull: 8,
  slotsPerDayHalf: 4,
  weeklyConfirmationDay: 'FRIDAY',
};

const WEEKDAYS = [
  { value: 'MONDAY', label: 'Esmaspäev' },
  { value: 'TUESDAY', label: 'Teisipäev' },
  { value: 'WEDNESDAY', label: 'Kolmapäev' },
  { value: 'THURSDAY', label: 'Neljapäev' },
  { value: 'FRIDAY', label: 'Reede' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(INITIAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof SettingsForm, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seaded</h1>
          <p className="text-slate-600 mt-1">Süsteemi globaalsed seaded</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvesta
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
          Seaded salvestatud!
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-pks-100"><Target className="w-5 h-5 text-pks-600" /></div>
          <h2 className="font-semibold text-slate-900">Sihtmärgid</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">Sihtprotsent (%)</label>
            <input type="number" value={settings.targetPct} onChange={(e) => handleChange('targetPct', parseInt(e.target.value) || 0)} className="form-input mt-1" min="0" max="100" />
          </div>
          <div>
            <label className="form-label">Min ettejooks (päeva)</label>
            <input type="number" value={settings.inviteLeadDaysMin} onChange={(e) => handleChange('inviteLeadDaysMin', parseInt(e.target.value) || 0)} className="form-input mt-1" min="1" max="30" />
          </div>
          <div>
            <label className="form-label">Max ettejooks (päeva)</label>
            <input type="number" value={settings.inviteLeadDaysMax} onChange={(e) => handleChange('inviteLeadDaysMax', parseInt(e.target.value) || 0)} className="form-input mt-1" min="1" max="30" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-100"><Calendar className="w-5 h-5 text-amber-600" /></div>
          <h2 className="font-semibold text-slate-900">PKS periood</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">Algus</label>
            <input type="date" value={settings.periodStart} onChange={(e) => handleChange('periodStart', e.target.value)} className="form-input mt-1" />
          </div>
          <div>
            <label className="form-label">Lõpp</label>
            <input type="date" value={settings.periodEnd} onChange={(e) => handleChange('periodEnd', e.target.value)} className="form-input mt-1" />
          </div>
          <div>
            <label className="form-label">Kinnitamise päev</label>
            <select value={settings.weeklyConfirmationDay} onChange={(e) => handleChange('weeklyConfirmationDay', e.target.value)} className="form-select mt-1">
              {WEEKDAYS.map(day => (<option key={day.value} value={day.value}>{day.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100"><Hash className="w-5 h-5 text-purple-600" /></div>
          <h2 className="font-semibold text-slate-900">Slotid</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Slotte täispäeval</label>
            <input type="number" value={settings.slotsPerDayFull} onChange={(e) => handleChange('slotsPerDayFull', parseInt(e.target.value) || 0)} className="form-input mt-1" min="1" max="20" />
          </div>
          <div>
            <label className="form-label">Slotte poolpäeval</label>
            <input type="number" value={settings.slotsPerDayHalf} onChange={(e) => handleChange('slotsPerDayHalf', parseInt(e.target.value) || 0)} className="form-input mt-1" min="1" max="20" />
          </div>
        </div>
      </div>
    </div>
  );
}
