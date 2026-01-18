import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import { Activity, Ruler, Weight, User, Flame, ChevronDown, Check, X } from 'lucide-react';
import { playTapSound } from '../services/soundService';

interface BMICalculatorProps {
  onSaveHistory: (item: HistoryItem) => void;
}

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary (Little/no exercise)' },
  { value: 1.375, label: 'Lightly Active (1-3 days/wk)' },
  { value: 1.55, label: 'Moderately Active (3-5 days/wk)' },
  { value: 1.725, label: 'Very Active (6-7 days/wk)' },
  { value: 1.9, label: 'Extra Active (Physical job)' },
];

export const BMICalculator: React.FC<BMICalculatorProps> = ({ onSaveHistory }) => {
  const [system, setSystem] = useState<'metric' | 'imperial'>('metric');
  
  // Metric Inputs
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');

  // Imperial Inputs
  const [weightLb, setWeightLb] = useState<string>('');
  const [heightFt, setHeightFt] = useState<string>('');
  const [heightIn, setHeightIn] = useState<string>('');

  // New Inputs for Calories
  const [age, setAge] = useState<string>('25');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.2);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<{ label: string; color: string; message: string } | null>(null);
  const [calories, setCalories] = useState<{
    maintain: number;
    mildLoss: number;
    loss: number;
    mildGain: number;
    gain: number;
  } | null>(null);

  useEffect(() => {
    calculateResults();
  }, [weightKg, heightCm, weightLb, heightFt, heightIn, system, age, gender, activityLevel]);

  const calculateResults = () => {
    let wKg = 0;
    let hCm = 0;

    if (system === 'metric') {
      wKg = parseFloat(weightKg);
      hCm = parseFloat(heightCm);
    } else {
      const wLbVal = parseFloat(weightLb);
      const ftVal = parseFloat(heightFt || '0');
      const inVal = parseFloat(heightIn || '0');
      
      if (wLbVal > 0) wKg = wLbVal * 0.453592;
      const totalInches = (ftVal * 12) + inVal;
      if (totalInches > 0) hCm = totalInches * 2.54;
    }

    if (wKg > 0 && hCm > 0) {
      // BMI Calculation
      const bmiValue = wKg / Math.pow(hCm / 100, 2);
      setBmi(bmiValue);
      setCategory(getBMICategory(bmiValue));

      // Calorie Calculation (Mifflin-St Jeor)
      const ageVal = parseFloat(age);
      if (ageVal > 0) {
        let bmr = (10 * wKg) + (6.25 * hCm) - (5 * ageVal);
        bmr += gender === 'male' ? 5 : -161;
        
        const tdee = bmr * activityLevel;
        setCalories({
          maintain: Math.round(tdee),
          mildLoss: Math.round(tdee - 250),
          loss: Math.round(tdee - 500),
          mildGain: Math.round(tdee + 250),
          gain: Math.round(tdee + 500)
        });
      } else {
        setCalories(null);
      }
    } else {
      setBmi(null);
      setCategory(null);
      setCalories(null);
    }
  };

  const getBMICategory = (value: number) => {
    if (value < 18.5) return { label: 'Underweight', color: 'text-blue-500', message: "You're under-weight" };
    if (value < 25) return { label: 'Healthy Weight', color: 'text-emerald-500', message: "You're fit!" };
    if (value < 30) return { label: 'Overweight', color: 'text-amber-500', message: "You're over-weight" };
    return { label: 'Obesity', color: 'text-rose-500', message: "Focus on health!" };
  };

  const handleSave = () => {
    playTapSound();
    if (!bmi || !category) return;
    
    let expression = '';
    if (system === 'metric') {
      expression = `${weightKg}kg, ${heightCm}cm`;
    } else {
      expression = `${weightLb}lb, ${heightFt}'${heightIn}"`;
    }

    onSaveHistory({
      id: Date.now().toString(),
      type: 'bmi',
      expression: `BMI: ${expression}`,
      result: `${bmi.toFixed(1)} (${category.label})`,
      timestamp: Date.now(),
    });
  };

  const handleSystemChange = (s: 'metric' | 'imperial') => {
    playTapSound();
    setSystem(s);
  };

  const handleGenderChange = (g: 'male' | 'female') => {
    playTapSound();
    setGender(g);
  };

  const currentActivityLabel = ACTIVITY_LEVELS.find(l => l.value === activityLevel)?.label;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto scrollbar-thin relative">
      
      {/* System Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex">
          {(['metric', 'imperial'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSystemChange(s)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                system === s
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-sm sm:max-w-full md:max-w-2xl mx-auto w-full space-y-4">
        
        {/* Input Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Weight Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
                <Weight className="w-5 h-5" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weight</label>
            </div>
            
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                value={system === 'metric' ? weightKg : weightLb}
                onChange={(e) => system === 'metric' ? setWeightKg(e.target.value) : setWeightLb(e.target.value)}
                placeholder="0"
                className="w-full text-4xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none"
              />
              <span className="text-sm font-bold text-slate-400">{system === 'metric' ? 'kg' : 'lb'}</span>
            </div>
          </div>

          {/* Height Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-500">
                <Ruler className="w-5 h-5" />
              </div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Height</label>
            </div>

            {system === 'metric' ? (
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="0"
                  className="w-full text-4xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none"
                />
                <span className="text-sm font-bold text-slate-400">cm</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-4">
                <div className="flex items-baseline gap-1 flex-1">
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="0"
                    className="w-full text-4xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none text-right"
                  />
                  <span className="text-sm font-bold text-slate-400">ft</span>
                </div>
                <div className="flex items-baseline gap-1 flex-1">
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="0"
                    className="w-full text-4xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none text-right"
                  />
                  <span className="text-sm font-bold text-slate-400">in</span>
                </div>
              </div>
            )}
          </div>

          {/* Age & Gender Row */}
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                    <User className="w-5 h-5" />
                  </div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                </div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-4xl font-light bg-transparent text-slate-900 dark:text-white placeholder-slate-200 outline-none"
                />
            </div>
            
             <div className="bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl h-full">
                   <button
                     onClick={() => handleGenderChange('male')}
                     className={`flex-1 rounded-xl text-sm font-bold transition-all ${gender === 'male' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
                   >
                     Male
                   </button>
                   <button
                     onClick={() => handleGenderChange('female')}
                     className={`flex-1 rounded-xl text-sm font-bold transition-all ${gender === 'female' ? 'bg-white dark:bg-slate-700 shadow-sm text-pink-600 dark:text-pink-400' : 'text-slate-400'}`}
                   >
                     Female
                   </button>
                </div>
            </div>
          </div>

           {/* Activity Level - Custom iPhone-style Selector */}
           <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm sm:col-span-2 relative">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activity Level</label>
             </div>
             
             <button
               onClick={() => { playTapSound(); setIsPickerOpen(true); }}
               className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-3.5 rounded-xl font-medium text-sm outline-none transition-all active:scale-[0.98] border border-transparent focus:border-amber-500/30"
             >
               <span className="truncate">{currentActivityLabel}</span>
               <ChevronDown className="w-4 h-4 text-slate-400 flex-none" />
             </button>
           </div>
        </div>

        {/* Result Area */}
        <div className={`transition-all duration-500 ease-out transform ${bmi ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="bg-slate-900 dark:bg-white p-6 sm:p-8 rounded-[2rem] text-center shadow-xl relative overflow-hidden">
             {/* Background Glow */}
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 opacity-50`} />
             
             <div className="relative z-10">
                <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Your Body Mass Index</h3>
                
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-7xl font-bold text-white dark:text-slate-900 tracking-tighter">
                    {bmi?.toFixed(1)}
                  </span>
                </div>

                <div className={`text-2xl font-bold mb-1 ${category?.color}`}>
                   {category?.message}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                   Category: {category?.label}
                </div>

                {/* Visual Bar */}
                <div className="mt-8 relative h-3 bg-slate-800 dark:bg-slate-200 rounded-full w-full max-w-xs mx-auto overflow-hidden">
                   <div className="absolute top-0 bottom-0 left-0 w-1/4 bg-blue-500 opacity-60"></div>
                   <div className="absolute top-0 bottom-0 left-[25%] w-[40%] bg-emerald-500 opacity-80"></div>
                   <div className="absolute top-0 bottom-0 left-[65%] w-[20%] bg-amber-500 opacity-80"></div>
                   <div className="absolute top-0 bottom-0 right-0 w-[15%] bg-rose-500 opacity-80"></div>
                   
                   {/* Marker */}
                   <div 
                     className="absolute top-0 bottom-0 w-1 bg-white dark:bg-slate-900 shadow-[0_0_10px_rgba(255,255,255,1)] z-10 transition-all duration-500"
                     style={{ 
                       left: `${Math.min(Math.max(((bmi || 0) - 10) * 3, 0), 100)}%` 
                     }}
                   />
                </div>
                <div className="flex justify-between max-w-xs mx-auto mt-1 text-[10px] text-slate-500 font-mono">
                   <span>18.5</span>
                   <span className="ml-8">25.0</span>
                   <span className="ml-4">30.0</span>
                </div>

                {/* Calorie Estimates */}
                {calories && (
                  <div className="mt-8 pt-8 border-t border-slate-800 dark:border-slate-200/50">
                    <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">Daily Calorie Needs</h3>
                    
                    <div className="grid grid-cols-1 gap-3 text-left max-w-sm mx-auto">
                      {/* Maintain */}
                      <div className="bg-slate-800/50 dark:bg-slate-100 p-3 rounded-xl flex justify-between items-center">
                         <div>
                            <div className="text-white dark:text-slate-800 font-bold text-sm">Maintain Weight</div>
                            <div className="text-slate-500 text-xs">Unchanged</div>
                         </div>
                         <div className="text-indigo-400 dark:text-indigo-600 font-bold text-lg">{calories.maintain} <span className="text-xs font-normal">kcal</span></div>
                      </div>

                      {/* Mild Loss */}
                      <div className="bg-slate-800/30 dark:bg-slate-100/60 p-3 rounded-xl flex justify-between items-center">
                         <div>
                            <div className="text-white dark:text-slate-700 font-bold text-sm">Mild Weight Loss</div>
                            <div className="text-slate-500 text-xs">-0.25 kg/week</div>
                         </div>
                         <div className="text-emerald-400 dark:text-emerald-600 font-bold text-lg">{calories.mildLoss} <span className="text-xs font-normal">kcal</span></div>
                      </div>

                       {/* Loss */}
                       <div className="bg-slate-800/30 dark:bg-slate-100/60 p-3 rounded-xl flex justify-between items-center">
                         <div>
                            <div className="text-white dark:text-slate-700 font-bold text-sm">Weight Loss</div>
                            <div className="text-slate-500 text-xs">-0.5 kg/week</div>
                         </div>
                         <div className="text-emerald-400 dark:text-emerald-600 font-bold text-lg">{calories.loss} <span className="text-xs font-normal">kcal</span></div>
                      </div>

                       {/* Gain */}
                       <div className="bg-slate-800/30 dark:bg-slate-100/60 p-3 rounded-xl flex justify-between items-center">
                         <div>
                            <div className="text-white dark:text-slate-700 font-bold text-sm">Weight Gain</div>
                            <div className="text-slate-500 text-xs">+0.5 kg/week</div>
                         </div>
                         <div className="text-amber-400 dark:text-amber-600 font-bold text-lg">{calories.gain} <span className="text-xs font-normal">kcal</span></div>
                      </div>

                    </div>

                    <div className="mt-6 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Please consult with a doctor when losing 1 kg or more per week.
                    </div>
                  </div>
                )}

             </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-6 py-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-700 active:scale-98 transition-all"
          >
            Save Result
          </button>
        </div>

      </div>

      {/* iPhone Standard Action Sheet Picker */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <style>{`
            @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes sheetSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .animate-backdrop { animation: backdropFadeIn 0.3s ease-out forwards; }
            .animate-sheet { animation: sheetSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          `}</style>
          
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop"
            onClick={() => setIsPickerOpen(false)}
          />
          
          <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl animate-sheet border-t border-slate-100 dark:border-slate-800 pb-safe">
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-6" />
            
            <div className="px-6 mb-6 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Activity Level</h3>
               <button 
                 onClick={() => setIsPickerOpen(false)}
                 className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="px-4 pb-8 space-y-2">
              {ACTIVITY_LEVELS.map((level) => {
                const isSelected = activityLevel === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => {
                      playTapSound();
                      setActivityLevel(level.value);
                      setIsPickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-base">{level.label}</span>
                    {isSelected && <Check className="w-5 h-5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}