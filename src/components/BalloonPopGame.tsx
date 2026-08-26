import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpellingWord } from '../types';
import {
  playPopSound,
  playCorrectChime,
  playGentleBoing,
  playGrowSound,
  speakWordSlow,
  speakRandomCheer,
} from '../utils/audio';

interface BalloonPopGameProps {
  words: SpellingWord[];
  onWordMastered: (wordId: string) => void;
}

const BALLOON_COLORS = [
  { bg: 'bg-red-400', border: 'border-red-500', text: 'text-white', shadow: 'shadow-red-200' },
  { bg: 'bg-sky-400', border: 'border-sky-500', text: 'text-white', shadow: 'shadow-sky-200' },
  { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-amber-950', shadow: 'shadow-amber-200' },
  { bg: 'bg-emerald-400', border: 'border-emerald-500', text: 'text-white', shadow: 'shadow-emerald-200' },
  { bg: 'bg-purple-400', border: 'border-purple-500', text: 'text-white', shadow: 'shadow-purple-200' },
  { bg: 'bg-pink-400', border: 'border-pink-500', text: 'text-white', shadow: 'shadow-pink-200' },
];

export const BalloonPopGame: React.FC<BalloonPopGameProps> = ({ words, onWordMastered }) => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [options, setOptions] = useState<SpellingWord[]>([]);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [score, setScore] = useState(0);

  const targetWord = words[roundIndex];

  // Setup options for current round
  useEffect(() => {
    if (!targetWord) return;
    setPoppedId(null);

    // Pick 3 distractors
    const otherWords = words.filter(w => w.id !== targetWord.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    const roundOptions = [targetWord, ...shuffledOthers.slice(0, 3)].sort(
      () => Math.random() - 0.5
    );

    setOptions(roundOptions);

    // Speak target word
    const timer = setTimeout(() => {
      speakWordSlow(targetWord.word);
    }, 300);

    return () => clearTimeout(timer);
  }, [roundIndex, targetWord, words]);

  const handleBalloonClick = (clickedWord: SpellingWord) => {
    if (poppedId !== null || isDone) return;

    if (clickedWord.id === targetWord.id) {
      // Correct pop!
      playPopSound();
      playCorrectChime();
      setPoppedId(clickedWord.id);
      setScore(prev => prev + 1);
      onWordMastered(clickedWord.id);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        if (roundIndex + 1 < words.length) {
          setRoundIndex(prev => prev + 1);
        } else {
          setIsDone(true);
          playGrowSound();
          speakRandomCheer();
        }
      }, 900);
    } else {
      // Wrong balloon
      playGentleBoing();
    }
  };

  const handleRestart = () => {
    setRoundIndex(0);
    setScore(0);
    setIsDone(false);
    setPoppedId(null);
  };

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-[40px] border-8 border-blue-100 p-6 sm:p-8 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-400 rounded-2xl flex items-center justify-center text-2xl shadow-md transform rotate-2">
            🎈
          </div>
          <div>
            <h3 className="text-2xl font-black text-sky-900 tracking-tight font-['Fredoka']">
              BALLOON POP
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
              Listen & Pop the Right Word!
            </p>
          </div>
        </div>

        <div className="bg-sky-50 px-5 py-2 rounded-full border-4 border-sky-200 font-black text-sky-800 text-sm font-['Fredoka']">
          {isDone ? 'Completed!' : `Round ${roundIndex + 1} / ${words.length}`}
        </div>
      </div>

      {!isDone && targetWord && (
        <div className="w-full flex flex-col items-center">
          {/* Audio Prompt Section */}
          <div className="flex flex-col items-center my-3 bg-sky-50/80 p-5 rounded-3xl border-4 border-sky-100 w-full max-w-md">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-500 mb-2">
              Pop The Balloon For:
            </span>
            <button
              onClick={() => speakWordSlow(targetWord.word)}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-black text-xl shadow-lg border-b-4 border-yellow-600 font-['Fredoka'] active:translate-y-1 transition-all"
            >
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span>"{targetWord.word}"</span>
            </button>
            <p className="text-xs text-sky-700 italic mt-2 text-center">
              "{targetWord.sentence}"
            </p>
          </div>

          {/* Floating Balloons Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg my-6">
            {options.map((word, idx) => {
              const color = BALLOON_COLORS[idx % BALLOON_COLORS.length];
              const isTargetPopped = poppedId === word.id;

              return (
                <div key={word.id} className="flex justify-center">
                  <AnimatePresence>
                    {!isTargetPopped ? (
                      <motion.button
                        onClick={() => handleBalloonClick(word)}
                        animate={{
                          y: [0, -8, 0],
                          rotate: [-1, 1.5, -1],
                        }}
                        transition={{
                          duration: 3 + (idx % 3) * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        whileHover={{ scale: 1.08, y: -12 }}
                        whileTap={{ scale: 0.92 }}
                        className={`relative w-36 h-44 sm:w-44 sm:h-52 rounded-[50%] ${color.bg} ${color.text} shadow-xl ${color.shadow} border-4 ${color.border} flex flex-col items-center justify-center p-3 cursor-pointer group`}
                      >
                        {/* Balloon highlight reflection */}
                        <div className="absolute top-4 left-5 w-4 h-9 bg-white/40 rounded-full rotate-[-25deg] pointer-events-none" />

                        {/* Word Text */}
                        <span className="text-2xl sm:text-3xl font-black font-['Fredoka'] tracking-wider drop-shadow-sm">
                          {word.word}
                        </span>

                        {/* Category badge */}
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full mt-2">
                          {word.category}
                        </span>

                        {/* Balloon string knot */}
                        <div className="absolute -bottom-2 w-3 h-3 bg-inherit border-2 border-inherit rotate-45" />
                        <div className="absolute -bottom-6 w-0.5 h-6 bg-slate-400" />
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.4, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-36 h-44 sm:w-44 sm:h-52 flex items-center justify-center"
                      >
                        <Sparkles className="w-16 h-16 text-yellow-500 animate-spin" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center p-8 bg-sky-50 rounded-3xl border-4 border-sky-200 my-4 max-w-md"
        >
          <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center text-5xl shadow-lg transform rotate-3 mb-4">
            🏆
          </div>
          <h4 className="text-3xl font-black text-sky-900 font-['Fredoka']">
            Balloon Champion!
          </h4>
          <p className="text-sky-700 font-bold text-base mt-2 mb-6">
            You popped every single word balloon! Your tree is watered and thriving!
          </p>

          <button
            onClick={handleRestart}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-green-500 hover:bg-green-600 text-white font-black text-lg border-b-8 border-green-700 shadow-xl font-['Fredoka'] active:translate-y-1 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Play Again</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
