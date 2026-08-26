import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  GameMode,
  SpellingWord,
  UserStats,
  CompletedTree,
  FridayTestReport,
} from './types';
import {
  INITIAL_SPELLING_WORDS,
  getBonusWord,
  DEFAULT_WEEK_TITLE,
} from './data/spellingWords';
import { Header } from './components/Header';
import { GrowingTree } from './components/GrowingTree';
import { SpellingGame } from './components/SpellingGame';
import { PhonicsSorter } from './components/PhonicsSorter';
import { BalloonPopGame } from './components/BalloonPopGame';
import { FridayTestSimulator } from './components/FridayTestSimulator';
import { GardenCollection } from './components/GardenCollection';
import { ParentSettingsModal } from './components/ParentSettingsModal';
import {
  playCelebrationFanfare,
  playCorrectChime,
  playGrowSound,
  playWaterDropSound,
  speakRandomCheer,
  speakText,
} from './utils/audio';

const STORAGE_KEY = 'spelling_tree_game_stats_v1';

export default function App() {
  // Persistence state
  const [childName, setChildName] = useState<string>('Leo');
  const [bonusLastName, setBonusLastName] = useState<string>('Zhang');
  const [currentMode, setCurrentMode] = useState<GameMode>('sprout');
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(new Set());
  const [stars, setStars] = useState<number>(120);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [completedTrees, setCompletedTrees] = useState<CompletedTree[]>([]);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customWordsList, setCustomWordsList] = useState<SpellingWord[]>(INITIAL_SPELLING_WORDS);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.childName) setChildName(parsed.childName);
        if (parsed.bonusLastName) setBonusLastName(parsed.bonusLastName);
        if (Array.isArray(parsed.masteredWordIds)) {
          setMasteredWordIds(new Set(parsed.masteredWordIds));
        }
        if (typeof parsed.stars === 'number') setStars(parsed.stars);
        if (typeof parsed.streakDays === 'number') setStreakDays(parsed.streakDays);
        if (Array.isArray(parsed.completedTrees)) setCompletedTrees(parsed.completedTrees);
      }
    } catch (e) {
      console.warn('Failed to load local game stats:', e);
    }
  }, []);

  // Save state on updates
  useEffect(() => {
    try {
      const data = {
        childName,
        bonusLastName,
        masteredWordIds: Array.from(masteredWordIds),
        stars,
        streakDays,
        completedTrees,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save local game stats:', e);
    }
  }, [childName, bonusLastName, masteredWordIds, stars, streakDays, completedTrees]);

  // Combine default words with the bonus word
  const bonusWord = getBonusWord(bonusLastName);
  const allWords: SpellingWord[] = [
    ...customWordsList.filter(w => !w.isBonus),
    bonusWord,
  ];

  const totalWords = allWords.length;
  const currentGrowthStage = masteredWordIds.size;
  const progressPercent = Math.min(100, Math.round((currentGrowthStage / totalWords) * 100));

  // Handle word correct event
  const handleWordCorrect = (wordId: string) => {
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 1600);

    const isFirstTime = !masteredWordIds.has(wordId);
    if (isFirstTime) {
      const newSet = new Set(masteredWordIds);
      newSet.add(wordId);
      setMasteredWordIds(newSet);
      setStars(prev => prev + 15);

      // Check if all words finished for full tree
      if (newSet.size === totalWords) {
        handleFullTreeComplete();
      }
    } else {
      setStars(prev => prev + 5);
    }
  };

  // When all 11 words are mastered!
  const handleFullTreeComplete = () => {
    playCelebrationFanfare();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.4 },
    });

    const newTree: CompletedTree = {
      id: `tree-${Date.now()}`,
      date: 'Aug 24-28, 2026',
      name: `${childName}'s Wonder Tree`,
      treeType: 'golden',
      wordsMastered: totalWords,
      accuracy: 100,
    };

    setCompletedTrees(prev => [newTree, ...prev]);
    setStars(prev => prev + 100);
    speakText(`Congratulations ${childName}! You grew your tree to full bloom! Added to your forest!`, 0.85, 1.1);
  };

  // Reset current tree growth to plant a new one
  const handlePlantNewTree = () => {
    setMasteredWordIds(new Set());
    setActiveWordIndex(0);
    setCurrentMode('sprout');
    playWaterDropSound();
  };

  // Test completed handler
  const handleTestCompleted = (report: FridayTestReport) => {
    setStars(prev => prev + report.score * 10);
    // Mark all correct test words as mastered
    const nextSet = new Set(masteredWordIds);
    report.items.forEach(item => {
      if (item.isCorrect) nextSet.add(item.wordId);
    });
    setMasteredWordIds(nextSet);
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col p-4 sm:p-6 lg:p-8 font-sans selection:bg-yellow-200">
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1">
        
        {/* Geometric Balance Header */}
        <Header
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          masteredCount={currentGrowthStage}
          totalWords={totalWords}
          stars={stars}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Geometric Grid Content */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT SECTION (Col 5): Growing Tree Stage (Always Visible Progress) */}
          <section className="lg:col-span-5 w-full flex flex-col items-center h-full min-h-[380px] sm:min-h-[460px]">
            <GrowingTree
              currentStage={currentGrowthStage}
              totalStages={totalWords}
              isWatering={isWatering}
              onWaterClick={() => playWaterDropSound()}
            />
          </section>

          {/* RIGHT SECTION (Col 7): Interactive Game Modes */}
          <section className="lg:col-span-7 w-full flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {currentMode === 'sprout' && (
                <motion.div
                  key="sprout"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <SpellingGame
                    words={allWords}
                    currentIndex={activeWordIndex}
                    onWordCorrect={handleWordCorrect}
                    onNextWord={() =>
                      setActiveWordIndex(prev => Math.min(allWords.length - 1, prev + 1))
                    }
                    onPrevWord={() => setActiveWordIndex(prev => Math.max(0, prev - 1))}
                    onSelectWord={setActiveWordIndex}
                    masteredWords={masteredWordIds}
                  />
                </motion.div>
              )}

              {currentMode === 'phonics-sort' && (
                <motion.div
                  key="phonics-sort"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <PhonicsSorter
                    words={allWords}
                    onWordMastered={handleWordCorrect}
                  />
                </motion.div>
              )}

              {currentMode === 'balloon-pop' && (
                <motion.div
                  key="balloon-pop"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <BalloonPopGame
                    words={allWords}
                    onWordMastered={handleWordCorrect}
                  />
                </motion.div>
              )}

              {currentMode === 'friday-test' && (
                <motion.div
                  key="friday-test"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <FridayTestSimulator
                    words={allWords}
                    childName={childName}
                    bonusLastName={bonusLastName}
                    onTestCompleted={handleTestCompleted}
                  />
                </motion.div>
              )}

              {currentMode === 'garden' && (
                <motion.div
                  key="garden"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <GardenCollection
                    completedTrees={completedTrees}
                    totalStars={stars}
                    streakDays={streakDays}
                    onPlantNewTree={handlePlantNewTree}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>

        {/* Geometric Balance Footer Capsule Progress Bar */}
        <footer className="mt-8 pt-4 flex flex-col items-center gap-2">
          <div className="w-full max-w-2xl bg-sky-200 h-6 rounded-full overflow-hidden p-1 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full relative shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, progressPercent)}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 14 }}
            >
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 font-['Fredoka']">
            <span>🌱 Progress to Full Bloom: {currentGrowthStage} of {totalWords} words ({progressPercent}%)</span>
            {currentGrowthStage === totalWords && (
              <span className="text-yellow-600 font-black">🌟 FULL BLOOM! 🌟</span>
            )}
          </div>
        </footer>

        {/* Parent / Teacher Settings Modal */}
        <ParentSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          childName={childName}
          onUpdateChildName={setChildName}
          bonusLastName={bonusLastName}
          onUpdateBonusLastName={setBonusLastName}
          words={customWordsList}
          onUpdateWords={setCustomWordsList}
          onResetProgress={handlePlantNewTree}
        />
      </div>
    </div>
  );
}
