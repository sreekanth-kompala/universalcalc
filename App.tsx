import React, { useState, useEffect, useRef } from 'react';
import { Calculator as CalculatorIcon, ArrowRightLeft, DollarSign, History as HistoryIcon, Settings as SettingsIcon, Smartphone, Activity } from 'lucide-react';
import { Calculator } from './components/Calculator';
import { UnitConverter } from './components/UnitConverter';
import { CurrencyConverter } from './components/CurrencyConverter';
import { BMICalculator } from './components/BMICalculator';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { LoadingScreen } from './components/LoadingScreen';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AppMode, HistoryItem, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { isNative } from './services/nativeBridge';
import { playTapSound } from './services/soundService';
import { initAdMob, showBannerAd, showInterstitialAd } from './services/adService';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>('calculator');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const isNativeApp = isNative();
  
  const navCountRef = useRef(0);
  const AD_FREQUENCY = 4;

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('uc_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const startup = async () => {
      if (isNativeApp) {
        await initAdMob();
        setTimeout(() => {
          showBannerAd((visible) => setIsAdVisible(visible));
        }, 2000);
      }
      setTimeout(() => setLoading(false), 2500);
    };
    startup();
  }, [isNativeApp]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        const orientation = screen.orientation as any;
        if (orientation?.lock) await orientation.lock('portrait');
      } catch (e) {}
    };
    lockOrientation();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') lockOrientation();
    });
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('uc_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('uc_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('uc_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: HistoryItem) => setHistory(prev => [...prev, item]);
  const clearHistory = () => setHistory([]);

  const handleModeChange = (targetMode: AppMode) => {
    if (mode === targetMode) return;
    playTapSound();
    setMode(targetMode);
    navCountRef.current += 1;
    if (isNativeApp && navCountRef.current % AD_FREQUENCY === 0) showInterstitialAd();
  };

  const NavButton = ({ targetMode, icon: Icon, label }: { targetMode: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => handleModeChange(targetMode)}
      className={`relative flex flex-col items-center justify-center w-full py-4 transition-all duration-300 ${
        mode === targetMode 
          ? 'text-indigo-600 dark:text-indigo-400' 
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      <div className={`absolute top-0 w-10 h-1 bg-indigo-500 rounded-b-full transition-all duration-300 ${mode === targetMode ? 'opacity-100' : 'opacity-0'}`} />
      <Icon className="w-6 h-6 mb-1" strokeWidth={mode === targetMode ? 2.5 : 2} />
      <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
    </button>
  );

  return (
    <>
      <div className="landscape-warning fixed inset-0 z-[100] bg-slate-950 flex-col items-center justify-center text-white p-10 text-center hidden">
         <Smartphone className="w-16 h-16 mb-6 animate-pulse rotate-90 text-indigo-500" />
         <h2 className="text-2xl font-bold mb-3">Rotate Device</h2>
         <p className="text-slate-400">Please use portrait mode.</p>
      </div>

      <style>{`
        @media screen and (orientation: landscape) and (max-height: 500px) {
          .landscape-warning { display: flex !important; }
        }
      `}</style>

      <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${loading ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <LoadingScreen />
      </div>

      {!loading && !isNativeApp && <PWAInstallPrompt />}

      <div className={`flex flex-col h-full w-full mx-auto bg-white dark:bg-slate-950 pt-safe transition-all duration-700 ${loading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Header */}
        <header className="flex-none h-16 md:h-20 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/30">U</div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Calc</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { playTapSound(); setShowHistory(true); }}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { playTapSound(); setShowSettings(true); }}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area - min-h-0 is crucial for flex items containing overflow content */}
        <main className="flex-1 min-h-0 overflow-hidden relative">
          <div className="h-full w-full">
            {mode === 'calculator' && <Calculator onSaveHistory={addToHistory} settings={settings} />}
            {mode === 'converter' && <UnitConverter onSaveHistory={addToHistory} settings={settings} />}
            {mode === 'currency' && <CurrencyConverter onSaveHistory={addToHistory} settings={settings} />}
            {mode === 'bmi' && <BMICalculator onSaveHistory={addToHistory} />}
          </div>

          <History items={history} onClear={clearHistory} isOpen={showHistory} onClose={() => setShowHistory(false)} />
          <Settings settings={settings} onUpdate={setSettings} isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </main>

        {/* Bottom Navigation */}
        <nav className="flex-none flex bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-20 pb-safe">
          <NavButton targetMode="calculator" icon={CalculatorIcon} label="Calc" />
          <NavButton targetMode="converter" icon={ArrowRightLeft} label="Units" />
          <NavButton targetMode="currency" icon={DollarSign} label="Currency" />
          <NavButton targetMode="bmi" icon={Activity} label="Health" />
        </nav>

        {isAdVisible && (
          <div className="flex-none h-[50px] bg-slate-900 flex items-center justify-center z-30">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ad</span>
          </div>
        )}
      </div>
    </>
  );
}