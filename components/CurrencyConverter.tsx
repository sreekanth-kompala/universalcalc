import React, { useState, useEffect } from 'react';
import { ArrowUpDown, RefreshCw, TrendingUp, ChevronDown, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, Area, AreaChart, XAxis, YAxis } from 'recharts';
import { MOCK_CURRENCY_RATES, MOCK_CURRENCY_NAMES, CURRENCY_SYMBOLS } from '../constants';
import { playTapSound } from '../services/soundService';
import { HistoryItem } from '../types';
import { CurrencySelector } from './CurrencySelector';

interface CurrencyConverterProps {
  onSaveHistory: (item: HistoryItem) => void;
  settings: { currencyProviderUrl: string };
}

const CACHE_KEY = 'uc_currency_data';
const CACHE_TTL = 6 * 60 * 60 * 1000;

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSaveHistory, settings }) => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState<Record<string, number>>(MOCK_CURRENCY_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // Selector state
  const [selectorMode, setSelectorMode] = useState<'from' | 'to' | null>(null);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    generateChartData();
  }, [fromCurrency, toCurrency, rates]);

  const fetchRates = async (force: boolean | unknown = false) => {
    if (force === true) playTapSound();
    
    setLoading(true);
    const isForce = force === true || (typeof force === 'object' && force !== null);
    
    // 1. Try Valid Cache First (if not forced)
    if (!isForce) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const { rates: cachedRates, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_TTL) {
            setRates(cachedRates);
            setLastUpdated(timestamp);
            setLoading(false);
            return;
          }
        } catch (e) { localStorage.removeItem(CACHE_KEY); }
      }
    }

    try {
      const response = await fetch(settings.currencyProviderUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (data && data.rates) {
        setRates(data.rates);
        const now = Date.now();
        setLastUpdated(now);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, timestamp: now }));
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.warn('Currency API failed, falling back to cache/mock', err);
      
      // Fallback: Stale Cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const { rates: cachedRates, timestamp } = JSON.parse(cachedData);
          setRates(cachedRates);
          setLastUpdated(timestamp); // Keep the old timestamp
          setLoading(false);
          return;
        } catch (e) { /* ignore */ }
      }

      // Fallback: Mock Data
      setRates(MOCK_CURRENCY_RATES);
      setLastUpdated(null); // Indicates offline/mock
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const rate = getRate(fromCurrency, toCurrency);
    const data = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const randomChange = 1 + (Math.random() * 0.04 - 0.02);
      data.push({
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: Number((rate * randomChange).toFixed(4)),
      });
    }
    setChartData(data);
  };

  const getRate = (from: string, to: string) => {
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return toRate / fromRate;
  };

  const result = (parseFloat(amount) || 0) * getRate(fromCurrency, toCurrency);

  const handleCurrencySelect = (code: string) => {
    playTapSound();
    if (selectorMode === 'from') {
      setFromCurrency(code);
    } else if (selectorMode === 'to') {
      setToCurrency(code);
    }
    setSelectorMode(null);
  };

  const handleSwap = () => {
    playTapSound();
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleOpenSelector = (mode: 'from' | 'to') => {
    playTapSound();
    setSelectorMode(mode);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto no-scrollbar pb-24 md:pb-4">
      
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 px-2 flex-none">
         <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Exchange</h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
             {lastUpdated 
               ? `Rates updated ${new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
               : 'Offline / Mock Rates'}
            </span>
         </div>
         <button 
           onClick={() => fetchRates(true)} 
           className={`p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-all ${loading ? 'animate-spin' : ''}`}
         >
           <RefreshCw className="w-5 h-5" />
         </button>
      </div>

      <div className="flex-1 flex flex-col max-w-sm sm:max-w-full md:max-w-5xl mx-auto w-full space-y-4 md:space-y-6">
        
        {/* Converter Section */}
        <div className="relative flex flex-col sm:flex-row sm:items-stretch sm:gap-4">
          
          {/* From Card */}
          <div className="w-full sm:flex-1 bg-white dark:bg-slate-900 p-6 sm:p-4 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative z-0 sm:flex sm:flex-col sm:justify-center">
             <div className="flex justify-between items-start mb-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Selling</label>
               <div className="flex flex-col items-end">
                  <button
                    onClick={() => handleOpenSelector('from')}
                    className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white pl-4 pr-3 py-2 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 max-w-[140px]"
                  >
                    <span className="truncate">{fromCurrency}</span>
                    {CURRENCY_SYMBOLS[fromCurrency] && <span className="text-sm font-normal opacity-60 ml-1">{CURRENCY_SYMBOLS[fromCurrency]}</span>}
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-none ml-1" />
                  </button>
                 <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[120px] font-medium">{MOCK_CURRENCY_NAMES[fromCurrency]}</div>
               </div>
             </div>
             
             <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-5xl sm:text-3xl md:text-5xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none tracking-tight transition-all"
                placeholder="0"
              />
          </div>

          {/* Floating Swap Button */}
          <div className="z-10 -my-8 sm:my-0 flex justify-center sm:items-center">
             <button 
              onClick={handleSwap}
              className="bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-500/30 hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-slate-50 dark:border-slate-950 sm:border-transparent sm:dark:border-transparent"
            >
              <ArrowUpDown className="w-6 h-6 sm:hidden" />
              <ArrowRightLeft className="w-6 h-6 hidden sm:block" />
            </button>
          </div>

          {/* To Card */}
          <div className="w-full sm:flex-1 bg-slate-900 dark:bg-white p-6 sm:p-4 md:p-6 rounded-[2rem] shadow-lg shadow-slate-900/10 dark:shadow-none border border-transparent pt-8 sm:pt-6 text-white dark:text-slate-900 sm:flex sm:flex-col sm:justify-center">
             <div className="flex justify-between items-start mb-4">
               <label className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2">Buying</label>
               <div className="flex flex-col items-end">
                  <button
                    onClick={() => handleOpenSelector('to')}
                    className="flex items-center justify-between gap-2 bg-white/10 dark:bg-slate-100/50 text-white dark:text-slate-900 pl-4 pr-3 py-2 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-slate-900/10 transition-all hover:bg-white/20 dark:hover:bg-slate-200/50 backdrop-blur-sm max-w-[140px]"
                  >
                    <span className="truncate">{toCurrency}</span>
                    {CURRENCY_SYMBOLS[toCurrency] && <span className="text-sm font-normal opacity-60 ml-1">{CURRENCY_SYMBOLS[toCurrency]}</span>}
                    <ChevronDown className="w-4 h-4 opacity-70 flex-none ml-1" />
                  </button>
                 <div className="text-[10px] opacity-60 mt-1 truncate max-w-[120px] font-medium">{MOCK_CURRENCY_NAMES[toCurrency]}</div>
               </div>
             </div>
             
             <div className="w-full text-5xl sm:text-3xl md:text-5xl font-light py-1 overflow-x-auto no-scrollbar whitespace-nowrap tracking-tight transition-all">
                 {CURRENCY_SYMBOLS[toCurrency] ? CURRENCY_SYMBOLS[toCurrency] : ''}{result.toFixed(2)}
             </div>
             <div className="text-xs opacity-50 mt-2 font-mono">
                1 {fromCurrency} = {getRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
             </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full bg-white dark:bg-slate-900 p-5 sm:p-4 md:p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 mt-2 sm:mt-0 sm:flex-1 md:flex-none min-h-[220px] sm:min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Market Trend (16 Days)</h3>
          </div>
          <div className="h-32 sm:h-24 md:h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis 
                   dataKey="date" 
                   axisLine={false}
                   tickLine={false}
                   tick={{ fontSize: 10, fill: '#94a3b8' }}
                   minTickGap={30}
                   dy={10}
                 />
                 <YAxis hide domain={['auto', 'auto']} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                   itemStyle={{ color: '#818cf8' }}
                   formatter={(val: number) => [val, '']}
                   labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                   cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="value" 
                   stroke="#6366f1" 
                   strokeWidth={3}
                   fillOpacity={1} 
                   fill="url(#colorVal)" 
                 />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Currency Selector Modal */}
      <CurrencySelector 
        isOpen={!!selectorMode}
        onClose={() => setSelectorMode(null)}
        onSelect={handleCurrencySelect}
        selectedCurrency={selectorMode === 'from' ? fromCurrency : toCurrency}
        availableCodes={Object.keys(rates)}
      />
    </div>
  );
};