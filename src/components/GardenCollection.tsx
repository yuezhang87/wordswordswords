import React from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, Star, Calendar, TreePine, Heart } from 'lucide-react';
import { CompletedTree } from '../types';

interface GardenCollectionProps {
  completedTrees: CompletedTree[];
  totalStars: number;
  streakDays: number;
  onPlantNewTree: () => void;
}

export const GardenCollection: React.FC<GardenCollectionProps> = ({
  completedTrees,
  totalStars,
  streakDays,
  onPlantNewTree,
}) => {
  return (
    <div className="w-full flex flex-col items-center bg-white rounded-[40px] border-8 border-blue-100 p-6 sm:p-10 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full mb-6 pb-4 border-b-4 border-dashed border-sky-100">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-2">
            🌲
          </div>
          <div>
            <h2 className="text-3xl font-black text-sky-900 tracking-tight font-['Fredoka']">
              MY MAGIC FOREST GARDEN
            </h2>
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs sm:text-sm">
              All the trees you've grown with your spelling skills!
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-amber-50 px-5 py-2.5 rounded-full border-4 border-yellow-200 shadow-sm flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xl font-black text-yellow-700 font-['Fredoka']">{totalStars} Stars</span>
          </div>

          <div className="bg-sky-50 px-5 py-2.5 rounded-full border-4 border-sky-200 shadow-sm flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-black text-sky-800 font-['Fredoka']">{streakDays} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Trees Grid */}
      {completedTrees.length === 0 ? (
        <div className="flex flex-col items-center text-center p-8 bg-sky-50 rounded-3xl border-4 border-sky-100 my-4 max-w-md">
          <div className="text-5xl mb-3">🌱</div>
          <h3 className="text-2xl font-black text-sky-900 font-['Fredoka']">
            Your Forest is Ready!
          </h3>
          <p className="text-sky-700 font-semibold text-sm mt-1 mb-6">
            Spell all 10 weekly words + bonus word to fully grow your first mighty champion tree and add it to your forest!
          </p>

          <button
            onClick={onPlantNewTree}
            className="px-8 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-lg border-b-8 border-green-700 shadow-lg font-['Fredoka'] active:translate-y-1 transition-all"
          >
            Start Spelling Now! 👉
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-4">
            {completedTrees.map((tree, idx) => (
              <motion.div
                key={tree.id}
                whileHover={{ scale: 1.03, y: -4 }}
                className="p-5 rounded-3xl bg-gradient-to-b from-sky-50 via-white to-emerald-50 border-4 border-emerald-200 shadow-md flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="text-6xl my-2">
                  {tree.treeType === 'golden' && '🌟🌳'}
                  {tree.treeType === 'rainbow' && '🌈🌳'}
                  {tree.treeType === 'apple' && '🍎🌳'}
                  {tree.treeType === 'blossom' && '🌸🌳'}
                  {tree.treeType === 'emerald' && '🌲'}
                </div>

                <h4 className="text-xl font-black text-emerald-950 font-['Fredoka'] mt-1">
                  {tree.name} #{idx + 1}
                </h4>

                <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{tree.date}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-100 w-full flex justify-between text-xs font-black text-emerald-800">
                  <span>Words: {tree.wordsMastered} / 11</span>
                  <span>{tree.accuracy}% Accuracy</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onPlantNewTree}
              className="px-8 py-4 rounded-3xl bg-green-500 hover:bg-green-600 text-white font-black text-lg border-b-8 border-green-700 shadow-xl font-['Fredoka'] active:translate-y-1 transition-all"
            >
              🌱 Grow Another Tree!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
