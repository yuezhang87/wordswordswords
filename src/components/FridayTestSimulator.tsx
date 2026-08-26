import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Printer,
  RotateCcw,
  Star,
  FileCheck,
  BookOpen,
  Play,
} from 'lucide-react';
import { SpellingWord, FridayTestReport } from '../types';
import {
  playCorrectChime,
  playCelebrationFanfare,
  playWaterDropSound,
  speakWordSlow,
  speakSentence,
  dictateTestWord,
  unlockAudio,
} from '../utils/audio';

interface FridayTestSimulatorProps {
  words: SpellingWord[];
  childName: string;
  bonusLastName: string;
  onTestCompleted: (report: FridayTestReport) => void;
}

export const FridayTestSimulator: React.FC<FridayTestSimulatorProps> = ({
  words,
  childName,
  bonusLastName,
  onTestCompleted,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGraded, setIsGraded] = useState(false);
  const [report, setReport] = useState<FridayTestReport | null>(null);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  // Dictate single word with studio recording
  const handleSayWord = async (word: SpellingWord) => {
    setPlayingWordId(word.id);
    unlockAudio();
    try {
      if (word.isBonus) {
        await dictateTestWord(bonusLastName || 'Zhang', '', true, bonusLastName || 'Zhang');
      } else {
        await speakWordSlow(word.word);
      }
    } finally {
      setTimeout(() => setPlayingWordId(null), 1200);
    }
  };

  // Dictate word with sentence
  const handleDictateFull = async (word: SpellingWord, index: number) => {
    setPlayingWordId(word.id);
    unlockAudio();
    try {
      if (word.isBonus) {
        await dictateTestWord(bonusLastName || 'Zhang', '', true, bonusLastName || 'Zhang');
      } else {
        await speakWordSlow(word.word);
        if (word.sentence) {
          setTimeout(() => speakSentence(word.sentence), 800);
        }
      }
    } finally {
      setTimeout(() => setPlayingWordId(null), 1800);
    }
  };

  // Play context sentence
  const handleSaySentence = (sentence: string, wordId: string) => {
    setPlayingWordId(wordId);
    unlockAudio();
    speakSentence(sentence);
    setTimeout(() => setPlayingWordId(null), 1800);
  };

  const handleInputChange = (wordId: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [wordId]: val,
    }));
  };

  const handleGradeTest = () => {
    let correctCount = 0;
    const items = words.map(w => {
      const userAns = (answers[w.id] || '').trim().toLowerCase();
      const targetAns = w.isBonus
        ? (bonusLastName || 'zhang').trim().toLowerCase()
        : w.word.trim().toLowerCase();
      const isCorrect = userAns === targetAns;
      if (isCorrect) correctCount++;
      return {
        wordId: w.id,
        word: w.isBonus ? (bonusLastName || 'Zhang') : w.word,
        userAnswer: userAns,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / words.length) * 100);
    const testReport: FridayTestReport = {
      date: 'Aug 24-28, 2026',
      childName: childName || 'Awesome Student',
      score: correctCount,
      total: words.length,
      percentage,
      items,
    };

    setReport(testReport);
    setIsGraded(true);
    onTestCompleted(testReport);

    if (percentage >= 80) {
      playCelebrationFanfare();
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
    } else {
      playCorrectChime();
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setIsGraded(false);
    setReport(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container with Geometric Balance aesthetic */}
      <div className="w-full bg-white rounded-[40px] border-8 border-blue-100 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Lined Notebook Paper Header */}
        <div className="border-b-4 border-dashed border-sky-200 pb-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform -rotate-2">
                📝
              </div>
              <div>
                <h2 className="text-3xl font-black text-sky-900 tracking-tight font-['Fredoka']">
                  FRIDAY SPELLING TEST
                </h2>
                <p className="text-sky-600 font-bold uppercase tracking-widest text-xs sm:text-sm">
                  Aug 24-28, 2026 • List #18
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-sky-50 px-4 py-2 rounded-2xl border-2 border-sky-200 text-sky-900 font-bold text-sm">
                Name: <span className="text-sky-700 font-black">{childName || 'Student'}</span>
              </div>
              <div className="bg-yellow-100 px-4 py-2 rounded-2xl border-2 border-yellow-300 text-yellow-900 font-black text-sm">
                No. 18
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-slate-700 text-xs sm:text-sm bg-sky-50 p-3 rounded-2xl border border-sky-200">
            <span className="text-xl">🔊</span>
            <span>
              <strong>How to take the test:</strong> Click the yellow <strong>"Hear Word"</strong> button next to each number to listen to the teacher say the word, then type your spelling in the box!
            </span>
          </div>
        </div>

        {/* Test Words Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-4">
          {words.map((word, idx) => {
            const userAns = answers[word.id] || '';
            const target = word.isBonus
              ? (bonusLastName || 'zhang').trim().toLowerCase()
              : word.word.trim().toLowerCase();
            const isCorrect = isGraded && (userAns.trim().toLowerCase() === target);
            const isWrong = isGraded && !isCorrect;
            const isPlaying = playingWordId === word.id;

            return (
              <div
                key={word.id}
                className={`p-4 rounded-3xl border-4 transition-all flex flex-col gap-3 ${
                  isCorrect
                    ? 'bg-green-50 border-green-300'
                    : isWrong
                    ? 'bg-rose-50 border-rose-300'
                    : isPlaying
                    ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-sky-50/70 border-sky-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left Number & Audio Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white border-2 border-sky-300 flex items-center justify-center font-black text-sky-800 text-sm font-['Fredoka'] shadow-sm">
                      {word.isBonus ? '⭐' : idx + 1}
                    </span>

                    {/* Primary Hear Word Button */}
                    <button
                      onClick={() => handleSayWord(word)}
                      className={`px-3 py-2 rounded-2xl font-black text-xs sm:text-sm font-['Fredoka'] shadow-sm border-b-2 flex items-center gap-1.5 active:translate-y-0.5 transition-all ${
                        isPlaying
                          ? 'bg-emerald-500 text-white border-emerald-700 ring-2 ring-emerald-200 animate-pulse'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-yellow-600'
                      }`}
                      title="Click to hear word pronunciation"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                      <span>{isPlaying ? 'Speaking...' : 'Hear Word'}</span>
                    </button>

                    {/* Sentence Context Audio */}
                    {word.sentence && !word.isBonus && (
                      <button
                        onClick={() => handleSaySentence(word.sentence, word.id)}
                        className="px-2.5 py-2 rounded-2xl bg-white hover:bg-sky-100 text-sky-800 font-black text-xs border border-sky-200 shadow-xs flex items-center gap-1"
                        title="Hear sentence example"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                        <span className="hidden sm:inline">Sentence</span>
                      </button>
                    )}
                  </div>

                  {/* Right Status Icon */}
                  <div className="w-8 flex items-center justify-center">
                    {isCorrect && <CheckCircle2 className="w-7 h-7 text-green-500 fill-green-100" />}
                    {isWrong && <XCircle className="w-7 h-7 text-rose-500 fill-rose-100" />}
                  </div>
                </div>

                {/* Input line */}
                <div className="w-full">
                  <input
                    type="text"
                    value={userAns}
                    onChange={(e) => handleInputChange(word.id, e.target.value)}
                    disabled={isGraded}
                    placeholder={word.isBonus ? `Type last name (${bonusLastName || 'Your Last Name'})...` : 'Type word here...'}
                    className={`w-full px-4 py-2.5 rounded-2xl bg-white border-2 text-lg sm:text-xl font-bold font-['Fredoka'] tracking-wider outline-none transition-all ${
                      isCorrect
                        ? 'border-green-500 text-green-800 bg-green-50/50'
                        : isWrong
                        ? 'border-rose-400 text-rose-800 bg-rose-50/50'
                        : 'border-sky-300 text-sky-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
                    }`}
                  />
                  {/* Correction and audio if wrong */}
                  {isWrong && (
                    <div className="text-xs text-rose-700 font-bold mt-1.5 pl-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span>Correct: </span>
                        <span className="underline font-black">{word.isBonus ? bonusLastName : word.word}</span>
                      </div>
                      <button
                        onClick={() => handleSayWord(word)}
                        className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 pt-4 border-t-2 border-slate-100">
          {!isGraded ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleGradeTest}
              className="flex items-center gap-3 px-10 py-4 rounded-3xl bg-green-500 hover:bg-green-600 text-white font-black text-xl shadow-xl border-b-8 border-green-700 font-['Fredoka'] active:translate-y-1 transition-all"
            >
              <FileCheck className="w-7 h-7" />
              <span>Grade My Test! 🌟</span>
            </motion.button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-4 border-sky-200 hover:bg-sky-50 text-sky-800 font-black text-base shadow font-['Fredoka']"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base shadow border-b-4 border-sky-800 font-['Fredoka']"
              >
                <Printer className="w-5 h-5" />
                <span>Print Certificate</span>
              </button>
            </div>
          )}
        </div>

        {/* Graded Certificate Card */}
        <AnimatePresence>
          {isGraded && report && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50 border-8 border-yellow-300 shadow-2xl text-center flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-8 h-8 fill-yellow-400 text-yellow-500 animate-bounce" style={{ animationDelay: `${s * 100}ms` }} />
                ))}
              </div>

              <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-700">
                Official Spelling Award
              </span>

              <h3 className="text-3xl sm:text-4xl font-black text-amber-950 font-['Fredoka'] mt-1">
                {report.percentage === 100
                  ? '🌟 100% PERFECT SCORE! 🌟'
                  : report.percentage >= 80
                  ? '🎉 SUPER SPELLER CHAMPION! 🎉'
                  : '🌱 GREAT EFFORT, KEEP GROWING! 🌱'}
              </h3>

              <p className="text-amber-900 font-bold text-lg sm:text-xl mt-2">
                {report.childName} scored <span className="underline font-black">{report.score} out of {report.total}</span> ({report.percentage}%) on the Friday Spelling Test!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t-2 border-amber-200 text-xs sm:text-sm text-amber-800 font-bold">
                <div>Date: {report.date}</div>
                <div>Teacher / Parent: ⭐ Approved ⭐</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
