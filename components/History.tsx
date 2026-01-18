import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, Copy, X } from 'lucide-react';

interface HistoryProps {
  items: HistoryItem[];
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const History: React.FC<HistoryProps> = ({ items, onClear, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex justify-end backdrop-blur-sm transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-[320px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800 animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-16 px-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-end bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">History</h2>
          <div className="flex gap-2">
            <button onClick={onClear} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 rounded-full transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
             <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <span className="text-sm">No recent history</span>
            </div>
          ) : (
            items.slice().reverse().map((item) => (
              <div key={item.id} className="group relative bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    item.type === 'calculator' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    item.type === 'converter' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    item.type === 'currency' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400 font-mono break-all mb-1">{item.expression}</div>
                <div className="text-xl font-medium text-slate-800 dark:text-white flex items-center justify-between">
                   <span>= {item.result}</span>
                   <button 
                     onClick={() => handleCopy(item.result)} 
                     className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                   >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};