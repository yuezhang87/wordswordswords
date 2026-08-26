import React, { useState } from 'react';
import { GameMode } from '../types';
import { Settings, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { unlockAudio, playCorrectChime, speakWordSlow, speakText } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  masteredCount: number;
  totalWords: number;
  stars: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  masteredCount,
  totalWords,
  stars,
  onOpenSettings,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleTestSound = async () => {
    setIsPlayingTest(true);
    unlockAudio();
    playCorrectChime();
    await speakWordSlow('the');
    speakText("Sound is working! Let's practice spelling!", 0.85, 1.1);
    setTimeout(() => setIsPlayingTest(false), 2200);
  };

  const modes: { id: GameMode; label: string; icon: string; badge?: string }[] = [
    { id: 'sprout', label: 'Spelling Tree', icon: '🌳' },
    { id: 'phonics-sort', label: '"TH" vs "CH" Quest', icon: '🐿️' },
    { id: 'balloon-pop', label: 'Balloon Pop', icon: '🎈' },
    { id: 'friday-test', label: 'Friday Test Prep', icon: '📝', badge: 'Test' },
    { id: 'garden', label: 'Forest Garden', icon: '🌲' },
  ];

  return (
    <header className="w-full flex flex-col gap-4 mb-6">
      {/* Top Brand Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Level Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
            <span className="text-3xl sm:text-4xl">⭐</span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-sky-900 tracking-tight font-['Fredoka']">
              SPELLING TREE
            </h1>
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs sm:text-sm">
              Grade 1 • Aug 24-28, 2026 (#18)
            </p>
          </div>
        </div>

        {/* Status Badges, Audio Test & Parent Settings */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Audio Test Button */}
          <button
            onClick={handleTestSound}
            className={`px-4 py-2.5 rounded-full border-4 shadow-sm flex items-center gap-2 font-['Fredoka'] font-black text-xs sm:text-sm transition-all active:scale-95 ${
              isPlayingTest
                ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-200'
                : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-50'
            }`}
            title="Click to test speech and sound effects"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingTest ? 'animate-bounce text-white' : 'text-sky-600'}`} />
            <span>{isPlayingTest ? 'Testing Voice...' : '🔊 Test Sound'}</span>
          </button>

          {/* Apple Progress Pill */}
          <div className="bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-4 border-sky-200 shadow-sm flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">🍎</span>
            <span className="text-lg sm:text-2xl font-black text-sky-800 font-['Fredoka']">
              {masteredCount} / {totalWords}
            </span>
          </div>

          {/* Stars Pill */}
          <div className="bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-4 border-yellow-200 shadow-sm flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">✨</span>
            <span className="text-lg sm:text-2xl font-black text-yellow-600 font-['Fredoka']">
              {stars}
            </span>
          </div>

          {/* Parent Cog */}
          <button
            onClick={onOpenSettings}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-2xl border-4 border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-700 shadow-sm transition-all"
            title="Parent & Teacher Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm font-['Fredoka'] whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? 'bg-sky-600 text-white border-b-4 border-sky-800 shadow-md scale-105'
                  : 'bg-white text-sky-900 border-2 border-sky-100 hover:bg-sky-50'
              }`}
            >
              <span className="text-base">{m.icon}</span>
              <span>{m.label}</span>
              {m.badge && (
                <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
