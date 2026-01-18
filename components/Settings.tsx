import React from 'react';
import { AppSettings } from '../types';
import { X, Moon, Sun, Smartphone } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appearance</span>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                onClick={() => onUpdate({ ...settings, theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  settings.theme === 'light' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2"><Sun className="w-4 h-4" /> Light</span>
              </button>
              <button
                onClick={() => onUpdate({ ...settings, theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  settings.theme === 'dark' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</span>
              </button>
            </div>
          </div>

          {/* Precision */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Precision</span>
               <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">{settings.precision} decimals</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={settings.precision}
              onChange={(e) => onUpdate({ ...settings, precision: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 text-center">
          <p className="text-[10px] text-slate-400">UniversalCalc v2.0 &bull; Designed for Mobile</p>
        </div>
      </div>
    </div>
  );
};