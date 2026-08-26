import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Undo2,
  Lightbulb,
  X,
  Play,
} from 'lucide-react';
import { SpellingWord } from '../types';
import {
  playWaterDropSound,
  playCorrectChime,
  playGrowSound,
  playGentleBoing,
  playLetterClickSound,
  playPhonemeSound,
  speakWordSlow,
  speakSentence,
  speakPhonicsSlow,
  speakRandomCheer,
  speakLetter,
  unlockAudio,
} from '../utils/audio';

interface SpellingGameProps {
  words: SpellingWord[];
  currentIndex: number;
  onWordCorrect: (wordId: string) => void;
  onNextWord: () => void;
  onPrevWord: () => void;
  onSelectWord: (index: number) => void;
  masteredWords: Set<string>;
}

export const SpellingGame: React.FC<SpellingGameProps> = ({
  words,
  currentIndex,
  onWordCorrect,
  onNextWord,
  onPrevWord,
  onSelectWord,
  masteredWords,
}) => {
  const currentWord = words[currentIndex] || words[0];
  const targetWord = currentWord.word.toLowerCase();
  
  // Selected letters state
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [isPeekOpen, setIsPeekOpen] = useState(false);
  const [showPhonicsModal, setShowPhonicsModal] = useState(false);
  const [activePhonicIndex, setActivePhonicIndex] = useState<number | null>(null);
  const [isPlayingPhonics, setIsPlayingPhonics] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Pronounce word with animated feedback
  const handleHearWord = async () => {
    setIsSpeaking(true);
    unlockAudio();
    try {
      await speakWordSlow(currentWord.word);
    } finally {
      setTimeout(() => setIsSpeaking(false), 1200);
    }
  };

  // Play full phonics sounding out sequence
  const playPhonicsSequence = async () => {
    if (isPlayingPhonics) return;
    setIsPlayingPhonics(true);
    unlockAudio();
    try {
      await speakPhonicsSlow(currentWord.phonics, currentWord.word, idx => {
        setActivePhonicIndex(idx);
      });
    } finally {
      setTimeout(() => {
        setActivePhonicIndex(null);
        setIsPlayingPhonics(false);
      }, 500);
    }
  };

  // Play an individual phoneme when clicked
  const handlePlaySinglePhoneme = (phoneme: string, index: number) => {
    unlockAudio();
    setActivePhonicIndex(index);
    playPhonemeSound(phoneme);
    setTimeout(() => {
      setActivePhonicIndex(null);
    }, 600);
  };

  // Initialize available letters when word changes
  useEffect(() => {
    setPlacedLetters([]);
    setIsSuccess(false);
    setShakeError(false);
    setIsPeekOpen(false);

    // Build letter bank: exact letters + 2 fun distractors
    const chars = targetWord.split('');
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = ['t', 'h', 'c', 'p', 'b', 'm', 'n', 's', 'l', 'd', 'r'];
    
    // Pick 1-2 random distractors not in word
    const distractors: string[] = [];
    const pool = [...vowels, ...consonants].filter(c => !chars.includes(c));
    for (let i = 0; i < Math.min(2, pool.length); i++) {
      distractors.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    const all = [...chars, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((char, i) => ({
        id: `${char}-${i}-${Date.now()}`,
        char,
        used: false,
      }));

    setAvailableLetters(all);

    // Automatically speak the word on load
    const timer = setTimeout(() => {
      speakWordSlow(currentWord.word);
    }, 350);

    return () => clearTimeout(timer);
  }, [currentIndex, currentWord.word, targetWord]);

  // Handle clicking a letter tile to place it
  const handleLetterClick = (letterItem: { id: string; char: string; used: boolean }) => {
    if (letterItem.used || isSuccess) return;
    if (placedLetters.length >= targetWord.length) return;

    unlockAudio();
    playLetterClickSound(letterItem.char);

    const newPlaced = [...placedLetters, letterItem.char];
    setPlacedLetters(newPlaced);

    // Mark as used
    setAvailableLetters(prev =>
      prev.map(item => (item.id === letterItem.id ? { ...item, used: true } : item))
    );

    // Check if word completed
    if (newPlaced.length === targetWord.length) {
      const spelled = newPlaced.join('');
      if (spelled === targetWord) {
        // Correct!
        handleCorrectSpelling();
      } else {
        // Incorrect
        playGentleBoing();
        setShakeError(true);
        setTimeout(() => setShakeError(false), 800);
      }
    }
  };

  // Remove the last placed letter or specific index
  const handleRemovePlaced = (indexToRemove: number) => {
    if (isSuccess) return;
    const charToRemove = placedLetters[indexToRemove];
    if (!charToRemove) return;

    const newPlaced = placedLetters.filter((_, idx) => idx !== indexToRemove);
    setPlacedLetters(newPlaced);

    // Return the first matching used letter back to available
    let found = false;
    setAvailableLetters(prev =>
      prev.map(item => {
        if (!found && item.char === charToRemove && item.used) {
          found = true;
          return { ...item, used: false };
        }
        return item;
      })
    );
  };

  // Reset current attempt
  const handleResetLetters = () => {
    if (isSuccess) return;
    setPlacedLetters([]);
    setAvailableLetters(prev => prev.map(item => ({ ...item, used: false })));
  };

  // When word is successfully spelled
  const handleCorrectSpelling = () => {
    setIsSuccess(true);
    playCorrectChime();
    playGrowSound();
    speakRandomCheer();

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#22c55e', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'],
    });

    onWordCorrect(currentWord.id);
  };

  // Peek word helper
  const handlePeek = () => {
    setIsPeekOpen(true);
    speakWordSlow(currentWord.word);
    setTimeout(() => {
      setIsPeekOpen(false);
    }, 2500);
  };

  // Phonics breakdown helper
  const handlePhonicsBreakdown = () => {
    setShowPhonicsModal(true);
    setTimeout(() => {
      playPhonicsSequence();
    }, 200);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Word Navigation Pills */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 px-1">
        <button
          onClick={onPrevWord}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-2xl bg-white border-2 border-amber-200 text-amber-800 font-bold hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-white shadow-sm flex items-center gap-1 text-sm font-['Fredoka']"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Word Select Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-2 scrollbar-none max-w-[280px] sm:max-w-md">
          {words.map((w, idx) => {
            const isDone = masteredWords.has(w.id);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={w.id}
                onClick={() => onSelectWord(idx)}
                className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs sm:text-sm font-['Fredoka'] flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-md scale-110 ring-2 ring-amber-300'
                    : isDone
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
                }`}
                title={`Word ${idx + 1}: ${w.word}`}
              >
                {isDone ? '✓' : idx + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={onNextWord}
          disabled={currentIndex === words.length - 1 && !isSuccess}
          className="p-2.5 rounded-2xl bg-white border-2 border-amber-200 text-amber-800 font-bold hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-white shadow-sm flex items-center gap-1 text-sm font-['Fredoka']"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Card */}
      <div className="w-full bg-white rounded-[40px] border-8 border-blue-100 p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col items-center">
        
        {/* Word Category Badge */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center border-4 border-pink-100 text-2xl shadow-sm">
              {currentWord.emoji}
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider font-['Fredoka'] ${
                currentWord.category === 'th'
                  ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                  : currentWord.category === 'ch'
                  ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-300'
                  : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
              }`}
            >
              {currentWord.isBonus
                ? '⭐ BONUS WORD'
                : `Pattern: "${currentWord.category.toUpperCase()}" Digraph`}
            </span>
          </div>

          <div className="text-xs font-black uppercase tracking-widest text-sky-400">
            Word {currentIndex + 1} of {words.length}
          </div>
        </div>

        {/* Audio Listen Buttons (Big & Kid-Friendly) */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-2">
          {/* Main Pronounce Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHearWord}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl font-black text-lg sm:text-xl shadow-lg border-b-8 font-['Fredoka'] active:translate-y-1 transition-all ${
              isSpeaking
                ? 'bg-amber-400 text-amber-950 border-amber-600 ring-4 ring-amber-300'
                : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-yellow-600'
            }`}
          >
            <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-bounce text-amber-900' : 'animate-pulse'}`} />
            <span>{isSpeaking ? `Saying "${currentWord.word}"!` : 'Hear Word'}</span>
          </motion.button>

          {/* Phonics Sound Breakdown Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePhonicsBreakdown}
            className="flex items-center gap-2 px-5 py-3.5 rounded-3xl bg-white hover:bg-sky-50 text-sky-800 font-black text-sm sm:text-base border-4 border-sky-200 border-b-8 border-b-sky-300 font-['Fredoka'] shadow-sm active:translate-y-1 transition-all"
          >
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>Phonics ({currentWord.phonics.join(' - ')})</span>
          </motion.button>

          {/* Hear in sentence */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speakSentence(currentWord.sentence)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-3xl bg-white hover:bg-pink-50 text-pink-700 font-black text-sm sm:text-base border-4 border-pink-200 border-b-8 border-b-pink-300 font-['Fredoka'] shadow-sm active:translate-y-1 transition-all"
          >
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span>Sentence</span>
          </motion.button>
        </div>

        {/* Sample sentence display */}
        <p className="text-sky-900 font-bold opacity-70 text-base sm:text-lg text-center my-3 max-w-md">
          "{currentWord.sentence}"
        </p>

        {/* Peek Helper Modal / Overlay */}
        <AnimatePresence>
          {isPeekOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="my-3 px-8 py-3 bg-yellow-100 border-4 border-dashed border-yellow-400 rounded-3xl text-yellow-900 font-black text-3xl tracking-widest font-['Fredoka'] shadow-inner"
            >
              {currentWord.word}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Target Spelling Slots (Where letters land) */}
        <span className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mt-2 mb-1">
          Spell the Word
        </span>

        <motion.div
          animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-3 sm:gap-4 my-4 flex-wrap"
        >
          {Array.from({ length: targetWord.length }).map((_, idx) => {
            const char = placedLetters[idx];
            const isFilled = Boolean(char);
            return (
              <motion.button
                key={idx}
                onClick={() => isFilled && handleRemovePlaced(idx)}
                whileHover={isFilled ? { scale: 1.05 } : {}}
                whileTap={isFilled ? { scale: 0.95 } : {}}
                className={`w-18 h-24 sm:w-22 sm:h-28 rounded-2xl flex flex-col items-center justify-center font-black text-4xl sm:text-5xl font-['Fredoka'] transition-all shadow-md ${
                  isSuccess
                    ? 'bg-green-500 text-white border-b-8 border-green-700'
                    : isFilled
                    ? 'bg-sky-50 text-sky-800 border-b-8 border-sky-300 cursor-pointer hover:bg-sky-100'
                    : 'bg-white border-4 border-dashed border-sky-200 text-sky-100'
                }`}
              >
                {char || '?'}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Success Celebration Banner */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full bg-green-50 border-4 border-green-300 p-5 rounded-3xl flex flex-col items-center gap-2 my-2 shadow-inner text-center"
            >
              <div className="flex items-center gap-2 text-green-700 font-extrabold text-xl sm:text-2xl font-['Fredoka']">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
                <span>Super Job! You Spelled "{currentWord.word}"!</span>
              </div>
              <p className="text-green-800 text-sm font-bold">
                💧 Water droplet added! Watch your little tree grow taller!
              </p>
              
              <div className="flex items-center gap-4 mt-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onNextWord}
                  className="px-8 py-3.5 rounded-3xl bg-green-500 hover:bg-green-600 text-white font-black font-['Fredoka'] text-lg shadow-xl border-b-8 border-green-700 active:translate-y-1 transition-all flex items-center gap-2"
                >
                  <span>Next Word</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <button
                  onClick={handleResetLetters}
                  className="px-5 py-3 rounded-2xl bg-white border-4 border-green-200 text-green-700 text-sm font-black hover:bg-green-100 font-['Fredoka']"
                >
                  Spell Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letter Bank (Scrambled Letter Blocks in Geometric Balance Grid) */}
        {!isSuccess && (
          <div className="w-full mt-3 flex flex-col items-center">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 max-w-lg w-full">
              {availableLetters.map((item, idx) => {
                const borderColors = [
                  'border-orange-200 text-orange-500',
                  'border-green-200 text-green-500',
                  'border-purple-200 text-purple-500',
                  'border-pink-200 text-pink-500',
                  'border-sky-200 text-sky-600',
                ];
                const colorClass = borderColors[idx % borderColors.length];

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleLetterClick(item)}
                    disabled={item.used}
                    whileHover={!item.used ? { scale: 1.08, y: -2 } : {}}
                    whileTap={!item.used ? { scale: 0.92 } : {}}
                    className={`h-20 sm:h-24 bg-white rounded-3xl border-b-8 flex items-center justify-center text-4xl sm:text-5xl font-black font-['Fredoka'] shadow-md transition-all ${
                      item.used
                        ? 'bg-slate-100 text-slate-300 border-slate-200 opacity-40 cursor-not-allowed border-b-4'
                        : `${colorClass} hover:bg-slate-50 active:translate-y-1 cursor-pointer`
                    }`}
                  >
                    {item.char.toUpperCase()}
                  </motion.button>
                );
              })}
            </div>

            {/* Helper action tools */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={handleResetLetters}
                disabled={placedLetters.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-black font-['Fredoka'] disabled:opacity-40"
              >
                <Undo2 className="w-4 h-4" />
                <span>Clear</span>
              </button>

              <button
                onClick={handlePeek}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border-2 border-yellow-200 hover:bg-yellow-50 text-yellow-800 text-xs sm:text-sm font-black font-['Fredoka']"
              >
                <Eye className="w-4 h-4" />
                <span>Peek Word</span>
              </button>

              <button
                onClick={() => speakSentence(currentWord.sentence)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border-2 border-sky-200 hover:bg-sky-50 text-sky-800 text-xs sm:text-sm font-black font-['Fredoka']"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Hint</span>
              </button>
            </div>
          </div>
        )}

        {/* Fun word fact footer */}
        {currentWord.funFact && (
          <div className="mt-4 pt-3 border-t border-sky-100 w-full text-center text-xs text-sky-800 font-bold">
            {currentWord.funFact}
          </div>
        )}
      </div>

      {/* Interactive Phonics "Sound It Out" Modal */}
      <AnimatePresence>
        {showPhonicsModal && (
          <div className="fixed inset-0 bg-sky-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl border-4 border-sky-300 shadow-2xl p-6 sm:p-8 max-w-lg w-full flex flex-col items-center relative overflow-hidden"
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🐿️</span>
                  <div>
                    <h3 className="text-2xl font-black text-sky-900 font-['Fredoka']">
                      Sound It Out!
                    </h3>
                    <p className="text-xs font-bold text-sky-600">
                      Tap each sound block to hear its phoneme
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPhonicsModal(false)}
                  className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sound Tiles Board */}
              <div className="w-full bg-sky-50 rounded-2xl p-4 sm:p-6 border-2 border-sky-100 flex flex-col items-center my-2">
                <p className="text-xs font-black uppercase tracking-widest text-sky-500 mb-3">
                  Phonics Breakdown
                </p>

                {/* Individual Sound Tiles */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap my-2">
                  {currentWord.phonics.map((chunk, idx) => {
                    const isStepActive = activePhonicIndex === idx;
                    const isDigraph = chunk.toLowerCase() === 'th' || chunk.toLowerCase() === 'ch';

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handlePlaySinglePhoneme(chunk, idx)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        animate={
                          isStepActive
                            ? { scale: [1, 1.18, 1.1], y: -6 }
                            : { scale: 1, y: 0 }
                        }
                        className={`min-w-[64px] sm:min-w-[76px] h-20 sm:h-24 px-3 rounded-2xl border-b-8 font-black font-['Fredoka'] flex flex-col items-center justify-center transition-all cursor-pointer shadow-md ${
                          isStepActive
                            ? 'bg-amber-400 text-amber-950 border-amber-600 ring-4 ring-amber-300 shadow-xl'
                            : isDigraph
                            ? 'bg-sky-500 text-white border-sky-700 hover:bg-sky-400'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        <span className="text-3xl sm:text-4xl leading-none">
                          {chunk.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold mt-1 opacity-80">
                          /{chunk.toLowerCase()}/
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Arrow blending to whole word */}
                <div className="flex items-center gap-2 my-3 text-sky-400 font-bold text-sm">
                  <span>Blend Together</span>
                  <span>⬇️</span>
                </div>

                {/* Full Word Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => speakWordSlow(currentWord.word)}
                  className={`px-8 py-3.5 rounded-2xl font-black text-2xl font-['Fredoka'] border-b-8 shadow-lg flex items-center gap-3 transition-all ${
                    activePhonicIndex === -1
                      ? 'bg-green-500 text-white border-green-700 ring-4 ring-green-300 scale-105'
                      : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-yellow-600'
                  }`}
                >
                  <Volume2 className="w-6 h-6" />
                  <span>{currentWord.word.toUpperCase()}</span>
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={playPhonicsSequence}
                  disabled={isPlayingPhonics}
                  className="flex-1 py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm font-['Fredoka'] border-b-4 border-sky-800 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isPlayingPhonics ? 'Playing Sounds...' : 'Sound Out Again'}</span>
                </button>

                <button
                  onClick={() => setShowPhonicsModal(false)}
                  className="py-3 px-6 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-sm font-['Fredoka'] border-b-4 border-green-700 transition-all"
                >
                  Got It! 👍
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
