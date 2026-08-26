export interface SpellingWord {
  id: string;
  word: string;
  category: 'th' | 'ch' | 'bonus' | 'other';
  phonics: string[]; // e.g. ['th', 'i', 'n'] or ['ch', 'a', 't']
  definition: string;
  sentence: string;
  funFact?: string;
  emoji: string;
  isBonus?: boolean;
}

export type GameMode = 'sprout' | 'phonics-sort' | 'balloon-pop' | 'friday-test' | 'garden';

export interface TreeProgress {
  currentStage: number; // 0 to maxWords
  totalWords: number;
  waterLevel: number;
  unlockedApples: number;
  unlockedBirds: number;
  unlockedButterflies: number;
  unlockedFlowers: number;
}

export interface UserStats {
  childName: string;
  bonusWord: string;
  stars: number;
  treesGrown: number;
  practiceStreak: number;
  lastPracticeDate: string;
  savedTrees: CompletedTree[];
  wordMastery: Record<string, { correctCount: number; attemptCount: number }>;
}

export interface CompletedTree {
  id: string;
  date: string;
  name: string;
  treeType: 'golden' | 'rainbow' | 'blossom' | 'apple' | 'emerald';
  wordsMastered: number;
  accuracy: number;
}

export interface TestResultItem {
  wordId: string;
  word: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface FridayTestReport {
  date: string;
  childName: string;
  score: number;
  total: number;
  percentage: number;
  items: TestResultItem[];
}
