import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 flex flex-col items-center">
        {/* Launch Icon: High-fidelity SVG recreation of UniCalcLaunchIcon.png */}
        <div className="mb-12 animate-fade-in-down">
          <svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgGradL" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="uBadgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <filter id="boxShadow" x="-20%" y="-10%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="12"/>
                <feOffset dx="0" dy="15" result="offsetblur"/>
                <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            
            {/* Outer Container */}
            <rect width="512" height="512" rx="128" fill="url(#bgGradL)" />
            
            {/* Inner White Box */}
            <rect x="110" y="110" width="292" height="292" rx="64" fill="white" filter="url(#boxShadow)" />
            
            {/* Grid Dividers */}
            <line x1="256" y1="140" x2="256" y2="372" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" />
            <line x1="140" y1="256" x2="372" y2="256" stroke="#F1F5F9" strokeWidth="6" strokeLinecap="round" />
            
            {/* Symbols */}
            <g strokeWidth="22" strokeLinecap="round">
              {/* Blue Plus */}
              <path d="M194 164v56M166 192h56" stroke="#3B82F6" />
              {/* Orange Minus */}
              <path d="M298 192h56" stroke="#F97316" />
              {/* Purple Multiply */}
              <path d="M172 298l44 44M216 298l-44 44" stroke="#8B5CF6" />
              {/* Green Divide */}
              <g stroke="#10B981">
                <path d="M298 320h56" />
                <circle cx="326" cy="296" r="6" fill="#10B981" stroke="none" />
                <circle cx="326" cy="344" r="6" fill="#10B981" stroke="none" />
              </g>
            </g>
            
            {/* U Badge Overlay */}
            <rect x="96" y="88" width="104" height="84" rx="28" fill="url(#uBadgeGrad)" stroke="white" strokeWidth="4" />
            <path d="M124 114v16c0 6.6 5.4 12 12 12s12-5.4 12-12v-16" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>
        
        <div className="flex flex-col items-center">
             <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none">Universal</span>
             <span className="text-5xl font-light text-slate-600 dark:text-slate-300 tracking-tight leading-none mt-1">Calc</span>
        </div>
        
        {/* Loading Bar Container */}
        <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner mt-10">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-progress-loading"></div>
        </div>
        
        <div className="mt-4 flex flex-col items-center gap-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 text-center opacity-40">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Version 2.0</p>
      </div>

      <style>{`
        @keyframes progress-loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0); }
          100% { width: 100%; transform: translateX(0); }
        }
        .animate-progress-loading {
          animation: progress-loading 2.5s ease-out forwards;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};