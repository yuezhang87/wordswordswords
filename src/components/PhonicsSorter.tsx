import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, CheckCircle2, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpellingWord } from '../types';
import {
  playWaterDropSound,
  playCorrectChime,
  playGentleBoing,
  playGrowSound,
  playPhonemeSound,
  speakWordSlow,
  speakRandomCheer,
  unlockAudio,
} from '../utils/audio';

interface PhonicsSorterProps {
  words: SpellingWord[];
  onWordMastered: (wordId: string) => void;
}

export const PhonicsSorter: React.FC<PhonicsSorterProps> = ({ words, onWordMastered }) => {
  // Only use th and ch words for this mode
  const sorterWords = words.filter(w => w.category === 'th' || w.category === 'ch');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedList, setSortedList] = useState<{ id: string; category: 'th' | 'ch' }[]>([]);
  const [shakeBox, setShakeBox] = useState<'th' | 'ch' | null>(null);
  const [isDone, setIsDone] = useState(false);

  const currentWord = sorterWords[currentIndex];

  const handleSort = (chosenCategory: 'th' | 'ch') => {
    if (!currentWord || isDone) return;
    unlockAudio();
    playPhonemeSound(chosenCategory);

    if (currentWord.category === chosenCategory) {
      // Correct!
      playWaterDropSound();
      playCorrectChime();
      onWordMastered(currentWord.id);

      const nextSorted = [...sortedList, { id: currentWord.id, category: chosenCategory }];
      setSortedList(nextSorted);

      if (currentIndex + 1 < sorterWords.length) {
        setCurrentIndex(prev => prev + 1);
        const nextWord = sorterWords[currentIndex + 1];
        setTimeout(() => speakWordSlow(nextWord.word), 400);
      } else {
        setIsDone(true);
        playGrowSound();
        speakRandomCheer();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } else {
      // Wrong bin
      playGentleBoing();
      setShakeBox(chosenCategory);
      setTimeout(() => setShakeBox(null), 600);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSortedList([]);
    setIsDone(false);
    if (sorterWords[0]) speakWordSlow(sorterWords[0].word);
  };

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-3xl p-5 sm:p-7 border-4 border-teal-300 shadow-xl">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐿️</span>
          <span className="font-bold text-teal-800 text-base sm:text-lg font-['Fredoka']">
            Digraph Sort: "TH" vs "CH"
          </span>
        </div>
        <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-['Fredoka']">
          {isDone ? 'Complete!' : `${currentIndex + 1} of ${sorterWords.length}`}
        </span>
      </div>

      <p className="text-slate-600 text-xs sm:text-sm text-center mb-4 max-w-md">
        Listen to the word! Does it have the <span className="font-bold text-amber-700">"th"</span> sound (like <i>thin</i>, <i>bath</i>) or the <span className="font-bold text-cyan-700">"ch"</span> sound (like <i>chat</i>, <i>lunch</i>)?
      </p>

      {!isDone && currentWord && (
        <div className="flex flex-col items-center my-4">
          <motion.div
            key={currentWord.id}
            initial={{ scale: 0.8, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-amber-50 border-3 border-amber-300 shadow-lg min-w-[240px]"
          >
            <span className="text-4xl">{currentWord.emoji}</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-800 font-['Fredoka'] tracking-wide">
              {currentWord.word}
            </div>

            <button
              onClick={() => speakWordSlow(currentWord.word)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-sm shadow font-['Fredoka']"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear "{currentWord.word}"</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Sorting Bins (TH Treehouse vs CH Clubhouse) */}
      {!isDone && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg mt-4">
          {/* TH Bin */}
          <motion.button
            onClick={() => handleSort('th')}
            animate={shakeBox === 'th' ? { x: [-8, 8, -8, 8, 0] } : {}}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-400 hover:border-amber-500 shadow-lg text-center cursor-pointer transition-all"
          >
            <div className="text-3xl mb-1">🪵</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-['Fredoka']">
              "TH" House
            </div>
            <div className="text-xs text-amber-800 font-bold mt-1">
              the, this, that, thin, bath
            </div>
            <div className="mt-3 px-4 py-1.5 rounded-full bg-amber-500 text-white font-black text-sm shadow">
              Put here 👉
            </div>
          </motion.button>

          {/* CH Bin */}
          <motion.button
            onClick={() => handleSort('ch')}
            animate={shakeBox === 'ch' ? { x: [-8, 8, -8, 8, 0] } : {}}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-cyan-100 to-cyan-200 border-4 border-cyan-400 hover:border-cyan-500 shadow-lg text-center cursor-pointer transition-all"
          >
            <div className="text-3xl mb-1">🏡</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-900 font-['Fredoka']">
              "CH" House
            </div>
            <div className="text-xs text-cyan-800 font-bold mt-1">
              chat, chin, chip, much, lunch
            </div>
            <div className="mt-3 px-4 py-1.5 rounded-full bg-cyan-600 text-white font-black text-sm shadow">
              Put here 👉
            </div>
          </motion.button>
        </div>
      )}

      {/* Completion View */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center p-6 bg-teal-50 border-2 border-teal-300 rounded-3xl my-4 text-center max-w-md"
        >
          <div className="text-5xl mb-2">🎉</div>
          <div className="text-2xl font-black text-teal-900 font-['Fredoka']">
            Digraph Master!
          </div>
          <p className="text-sm text-teal-800 font-semibold mt-1 mb-4">
            You correctly sorted all "TH" and "CH" words! Your tree loved every single drop!
          </p>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-base shadow-md font-['Fredoka']"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
