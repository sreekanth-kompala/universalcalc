import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ArrowRightLeft, ChevronDown } from 'lucide-react';
import { UNIT_CATEGORIES } from '../constants';
import { convertUnit } from '../services/conversionService';
import { playTapSound } from '../services/soundService';
import { HistoryItem, UnitCategory, UnitDefinition } from '../types';

interface UnitConverterProps {
  onSaveHistory: (item: HistoryItem) => void;
  settings: { precision: number };
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ onSaveHistory, settings }) => {
  const [category, setCategory] = useState<UnitCategory>(UNIT_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState<UnitDefinition>(UNIT_CATEGORIES[0].units[0]);
  const [toUnit, setToUnit] = useState<UnitDefinition>(UNIT_CATEGORIES[0].units[1]);
  const [value, setValue] = useState<string>('1');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    setFromUnit(category.units[0]);
    setToUnit(category.units[1] || category.units[0]);
  }, [category]);

  useEffect(() => {
    const valNum = parseFloat(value);
    if (!isNaN(valNum)) {
      const res = convertUnit(valNum, fromUnit, toUnit, category.id);
      setResult(res);
    } else {
      setResult(0);
    }
  }, [value, fromUnit, toUnit, category]);

  const handleSwap = () => {
    playTapSound();
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCategoryChange = (cat: UnitCategory) => {
    playTapSound();
    setCategory(cat);
  };

  const saveConversion = () => {
    playTapSound();
    onSaveHistory({
      id: Date.now().toString(),
      type: 'converter',
      expression: `${value} ${fromUnit.symbol} to ${toUnit.symbol}`,
      result: result.toFixed(settings.precision),
      timestamp: Date.now(),
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-2 overflow-y-auto no-scrollbar">
      
      {/* Category Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-2 mb-2 flex-none md:mb-6">
        <div className="flex space-x-2 px-2 md:justify-center">
          {UNIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                category.id === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center max-w-sm sm:max-w-full md:max-w-4xl mx-auto w-full space-y-3 sm:space-y-0 pb-4">
        
        {/* Converter Container - Responsive Row on Landscape (sm+) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch w-full sm:gap-3 md:gap-4 mb-4">
          
          {/* From Card */}
          <div className="w-full sm:flex-1 bg-white dark:bg-slate-900 p-5 sm:p-4 md:p-6 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative z-0 sm:flex sm:flex-col sm:justify-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">From</label>
            <div className="flex flex-col space-y-2">
               <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full text-4xl sm:text-2xl md:text-4xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none transition-all"
                placeholder="0"
              />
              <div className="relative inline-block w-full">
                <select
                  value={fromUnit.name}
                  onChange={(e) => setFromUnit(category.units.find(u => u.name === e.target.value)!)}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 pl-4 pr-10 py-2.5 rounded-xl font-medium text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500/20"
                >
                  {category.units.map((u) => (
                    <option key={u.name} value={u.name}>{u.name} ({u.symbol})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="z-10 -my-7 sm:my-0 flex justify-center sm:items-center">
             <button 
              onClick={handleSwap}
              className="bg-indigo-600 text-white p-3 rounded-full shadow-lg shadow-indigo-500/30 hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-slate-50 dark:border-slate-950 sm:border-transparent sm:dark:border-transparent"
            >
              <ArrowUpDown className="w-5 h-5 sm:hidden" />
              <ArrowRightLeft className="w-5 h-5 hidden sm:block" />
            </button>
          </div>

          {/* To Card */}
          <div className="w-full sm:flex-1 bg-slate-200/50 dark:bg-slate-800/40 p-5 sm:p-4 md:p-6 rounded-[1.5rem] border border-transparent dark:border-slate-800 pt-7 sm:pt-5 sm:flex sm:flex-col sm:justify-center">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">To</label>
             <div className="flex flex-col space-y-2">
              <div className="w-full text-4xl sm:text-2xl md:text-4xl font-light text-slate-900 dark:text-white py-1 overflow-x-auto no-scrollbar whitespace-nowrap transition-all">
                 {result.toLocaleString(undefined, { maximumFractionDigits: settings.precision })}
              </div>
              <div className="relative inline-block w-full">
                <select
                  value={toUnit.name}
                  onChange={(e) => setToUnit(category.units.find(u => u.name === e.target.value)!)}
                  className="w-full appearance-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 pl-4 pr-10 py-2.5 rounded-xl font-medium text-sm outline-none shadow-sm transition-shadow focus:ring-2 focus:ring-indigo-500/20"
                >
                  {category.units.map((u) => (
                    <option key={u.name} value={u.name}>{u.name} ({u.symbol})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={saveConversion}
          className="w-full sm:max-w-xs py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98 transition-all"
        >
          Save to History
        </button>
      </div>
    </div>
  );
};