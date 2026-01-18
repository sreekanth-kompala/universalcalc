import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { MOCK_CURRENCY_NAMES, CURRENCY_SYMBOLS } from '../constants';

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currencyCode: string) => void;
  selectedCurrency: string;
  availableCodes: string[];
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCurrency,
  availableCodes,
}) => {
  const [search, setSearch] = useState('');

  const filteredCurrencies = useMemo(() => {
    return availableCodes.filter(code => {
      const name = MOCK_CURRENCY_NAMES[code] || '';
      const query = search.toLowerCase();
      return code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
  }, [availableCodes, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center sm:items-center" role="dialog">
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal/Bottom Sheet */}
      <div className="relative w-full sm:w-[400px] h-[85vh] sm:h-[600px] bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up sm:animate-fade-in transition-all border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex-none p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Select Currency</h3>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-slate-400"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCurrencies.map((code) => {
             const isSelected = code === selectedCurrency;
             const symbol = CURRENCY_SYMBOLS[code];
             return (
               <button
                 key={code}
                 onClick={() => onSelect(code)}
                 className={`w-full flex items-center justify-between p-4 rounded-xl transition-all active:scale-98 ${
                   isSelected 
                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                     : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                 }`}
               >
                 <div className="flex flex-col items-start text-left">
                   <div className="flex items-center gap-2">
                     <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{code}</span>
                     {symbol && (
                       <span className={`text-sm font-semibold px-1.5 py-0.5 rounded ${
                         isSelected ? 'bg-indigo-500/50 text-indigo-50' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                       }`}>
                         {symbol}
                       </span>
                     )}
                   </div>
                   <span className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-400'} font-medium truncate max-w-[240px]`}>
                     {MOCK_CURRENCY_NAMES[code] || 'Currency'}
                   </span>
                 </div>
                 {isSelected && <Check className="w-5 h-5 text-white" />}
               </button>
             );
          })}
          {filteredCurrencies.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <Search className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-sm">No currencies found</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};