import React, { useState, useEffect, useRef } from 'react';
import { evaluateExpression } from '../services/calculatorService';
import { playCalculatorSound } from '../services/soundService';
import { HistoryItem } from '../types';

interface CalculatorProps {
  onSaveHistory: (item: HistoryItem) => void;
  settings: { precision: number };
}

const BUTTON_LAYOUT = [
  ['C', '(', ')', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['.', '0', 'DEL', '='],
];

const SCI_BUTTONS = [
  ['SIN', 'COS', 'TAN'],
  ['LOG', 'LN', 'π'],
  ['SQRT', '^', 'E'],
  ['!', '1/X', '%'],
];

export const Calculator: React.FC<CalculatorProps> = ({ onSaveHistory, settings }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [lastResult, setLastResult] = useState('');
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');
  const [error, setError] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  // Auto-scroll display to the right
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  const handlePress = (key: string) => {
    playCalculatorSound();
    setError(false);

    if (key === 'C') {
      setExpression('');
      setResult('');
      setLastResult('');
      return;
    }

    if (key === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    if (key === '=') {
      if (!expression) return;
      try {
        const evalResult = evaluateExpression(expression);
        const numRes = parseFloat(evalResult);
        const displayRes = isNaN(numRes) ? evalResult : Number(numRes.toFixed(settings.precision)).toString();
        
        setResult(displayRes);
        setLastResult(expression);
        onSaveHistory({
          id: Date.now().toString(),
          type: 'calculator',
          expression: expression,
          result: displayRes,
          timestamp: Date.now(),
        });
        setExpression(displayRes);
      } catch (e) {
        setError(true);
        setResult('Error');
      }
      return;
    }

    // Guard: Prevent multiple decimal points in a single number segment
    if (key === '.') {
      const lastNumberMatch = expression.match(/[0-9.]*$/);
      if (lastNumberMatch && lastNumberMatch[0].includes('.')) {
        return;
      }
    }

    const lastChar = expression.slice(-1);
    const operators = ['+', '-', '×', '÷', '^', '.'];
    if (operators.includes(key) && operators.includes(lastChar) && key !== '-') {
      setExpression(prev => prev.slice(0, -1) + key);
      return;
    }
    
    let append = key;
    if (['SIN', 'COS', 'TAN', 'LOG', 'LN', 'SQRT'].includes(key)) {
      append = key.toLowerCase() + '(';
    } else if (key === '1/X') {
      if (!expression) return;
      setExpression(prev => `1/(${prev})`);
      return;
    } else if (key === 'π') {
      append = 'π';
    } else if (key === 'E') {
      append = 'e';
    }

    setExpression((prev) => prev + append);
  };

  const isScientific = mode === 'scientific';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* Display Area - Adjusted pb-2 to drag numbers down further for better visibility */}
      <div className="flex-1 min-h-[100px] w-full flex flex-col justify-end p-5 md:p-10 pb-2 overflow-hidden relative">
        <div className="w-full text-right text-slate-400 dark:text-slate-500 text-lg md:text-xl font-medium mb-1 h-7 truncate">
          {lastResult && `${lastResult}`}
        </div>
        <div 
          ref={displayRef}
          className={`w-full text-right font-light tracking-tight overflow-x-auto no-scrollbar whitespace-nowrap transition-all duration-300 ${
            error ? 'text-rose-500' : 'text-slate-900 dark:text-white'
          } ${
            expression.length > 10 
            ? 'text-4xl md:text-6xl' 
            : 'text-6xl md:text-8xl'
          }`}
        >
          {expression || '0'}
        </div>
      </div>

      {/* Keypad Container - Highly compact for mobile Scientific mode */}
      <div className={`flex-none bg-slate-50 dark:bg-slate-900/50 rounded-t-[2.5rem] border-t border-slate-100 dark:border-slate-800 p-3 sm:p-6 pt-5 transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-5xl mx-auto">
          
          {/* Scientific Panel - Corrected sm:grid to sm:flex to prevent horizontal squishing on tablets */}
          <div className={`${isScientific ? 'flex' : 'hidden'} flex-col gap-1.5 sm:flex sm:w-1/3 content-start animate-fade-in`}>
             <div className="sm:hidden w-full flex justify-start pb-0.5">
                <button 
                  onClick={() => { playCalculatorSound(); setMode('standard'); }}
                  className="text-[9px] uppercase font-bold tracking-widest text-indigo-500 dark:text-indigo-400 py-1.5 px-4 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  Standard
                </button>
             </div>
             
             <div className="grid grid-cols-3 gap-1.5 w-full">
               {SCI_BUTTONS.flat().map((btn) => (
                 <button
                   key={btn}
                   onClick={() => handlePress(btn)}
                   className="h-10 sm:h-18 lg:h-20 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] sm:text-xs font-bold uppercase tracking-widest hover:bg-white/80 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
                 >
                   {btn}
                 </button>
               ))}
             </div>
          </div>

          {/* Standard Numeric Panel */}
          <div className="flex flex-col w-full sm:w-2/3 gap-2 sm:gap-3">
             {!isScientific && (
               <div className="sm:hidden w-full flex justify-start pb-1">
                  <button 
                    onClick={() => { playCalculatorSound(); setMode('scientific'); }}
                    className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 dark:text-indigo-400 py-2 px-5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 transition-colors shadow-sm"
                  >
                    Scientific
                  </button>
               </div>
             )}

             <div className="grid grid-cols-4 gap-1.5 sm:gap-3 content-start">
               {BUTTON_LAYOUT.flat().map((btn) => {
                 const isOp = ['÷', '×', '-', '+'].includes(btn);
                 const isEquals = btn === '=';
                 const isClear = btn === 'C';
                 const isDel = btn === 'DEL';
                 
                 let btnClass = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200";
                 
                 if (isOp) {
                   btnClass = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400";
                 } else if (isEquals) {
                   btnClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30";
                 } else if (isClear) {
                   btnClass = "bg-rose-50 dark:bg-rose-900/20 text-rose-500 font-bold";
                 } else if (isDel) {
                   btnClass = "bg-white dark:bg-slate-800 text-rose-500";
                 }

                 return (
                   <button
                     key={btn}
                     onClick={() => handlePress(btn)}
                     className={`flex items-center justify-center transition-all duration-150 active:scale-90 ${isScientific ? 'h-12 sm:h-18' : 'h-14 sm:h-18'} md:h-18 lg:h-20 text-xl sm:text-2xl font-medium rounded-2xl shadow-sm ${btnClass}`}
                   >
                     {isDel ? (
                       <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                     ) : btn}
                   </button>
                 );
               })}
             </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}