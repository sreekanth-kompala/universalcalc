import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    // Handle Android/Desktop standard prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS prompt after a delay if not standalone
    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 flex justify-center animate-fade-in-up">
      <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-700 dark:border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-none">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">Install UniversalCalc</h3>
              <p className="text-xs opacity-80 mt-1">
                {isIOS 
                  ? "Install this app on your iPhone for the best experience." 
                  : "Add to Home Screen for offline access and better performance."}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-white/60 dark:text-slate-900/60 hover:text-white dark:hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS ? (
           <div className="mt-4 p-3 bg-white/10 dark:bg-slate-100 rounded-lg text-xs flex items-center gap-2">
             <span>Tap</span>
             <Share className="w-4 h-4" />
             <span>then "Add to Home Screen"</span>
           </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Add to Home Screen
          </button>
        )}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};