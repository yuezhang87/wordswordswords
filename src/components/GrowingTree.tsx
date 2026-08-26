import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Sparkles, Sun, Cloud, Heart, Award, Volume2 } from 'lucide-react';
import { playWaterDropSound, playGrowSound, playCorrectChime } from '../utils/audio';

interface GrowingTreeProps {
  currentStage: number; // 0 to 11
  totalStages: number;  // 11
  isWatering?: boolean;
  onWaterClick?: () => void;
  celebrateBonus?: boolean;
}

export const GrowingTree: React.FC<GrowingTreeProps> = ({
  currentStage,
  totalStages,
  isWatering = false,
  onWaterClick,
}) => {
  const [clickedCritter, setClickedCritter] = useState<string | null>(null);

  // Clamp stage
  const stage = Math.min(Math.max(0, currentStage), totalStages);
  const progressPercent = Math.round((stage / totalStages) * 100);

  // Growth metrics
  const trunkHeight = Math.min(220, 20 + stage * 18);
  const trunkWidth = Math.min(34, 12 + stage * 2);
  const canopyScale = 0.3 + (stage / totalStages) * 0.9;
  const leafCount = Math.min(12, stage * 1.5);
  const flowerCount = stage >= 4 ? Math.min(6, stage - 3) : 0;
  const appleCount = stage >= 6 ? Math.min(8, stage - 5) : 0;
  const hasBird = stage >= 5;
  const hasButterfly = stage >= 7;
  const hasRainbow = stage >= 10;
  const hasSquirrel = stage >= 8;

  const stageTitles = [
    '🌱 Magic Seed in the Soil',
    '🌿 Tiny Green Sprout',
    '🌱 Healthy Seedling',
    '🪴 Young Sapling',
    '🌳 Growing Leafy Tree',
    '🌸 Blossom Buds Opening',
    '🍎 Sweet Apples Growing',
    '🦋 Butterfly Haven Tree',
    '🐿️ Woodland Paradise Tree',
    '🌟 Golden Apple Champion Tree',
    '🌈 Rainbow Forest Giant Tree',
    '👑 Grand Spelling Champion Wonder Tree!',
  ];

  const currentTitle = stageTitles[stage] || stageTitles[stageTitles.length - 1];

  const handleCritterClick = (name: string, soundEffect?: () => void) => {
    setClickedCritter(name);
    if (soundEffect) soundEffect();
    else playWaterDropSound();
    setTimeout(() => setClickedCritter(null), 1200);
  };

  return (
    <div className="relative w-full h-full rounded-[40px] bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 border-8 border-white shadow-xl overflow-hidden flex flex-col justify-between items-center">
      {/* Background clouds and sun */}
      <div className="absolute top-4 left-6 flex items-center gap-2 text-sky-400 opacity-80 pointer-events-none">
        <motion.div
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Cloud className="w-8 h-8 fill-sky-200 text-sky-300" />
        </motion.div>
      </div>

      <div className="absolute top-4 right-6 flex items-center gap-2 z-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="cursor-pointer"
          onClick={() => handleCritterClick('sun', playGrowSound)}
        >
          <Sun className="w-11 h-11 text-amber-400 fill-amber-300 drop-shadow-md hover:scale-110 transition-transform" />
        </motion.div>
      </div>

      {/* Rainbow when near completion */}
      {hasRainbow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 inset-x-0 mx-auto w-4/5 h-24 pointer-events-none"
        >
          <svg viewBox="0 0 200 60" className="w-full h-full">
            <path d="M 10 60 A 90 90 0 0 1 190 60" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.7" />
            <path d="M 16 60 A 84 84 0 0 1 184 60" fill="none" stroke="#f97316" strokeWidth="4" opacity="0.7" />
            <path d="M 22 60 A 78 78 0 0 1 178 60" fill="none" stroke="#eab308" strokeWidth="4" opacity="0.7" />
            <path d="M 28 60 A 72 72 0 0 1 172 60" fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.7" />
            <path d="M 34 60 A 66 66 0 0 1 166 60" fill="none" stroke="#3b82f6" strokeWidth="4" opacity="0.7" />
            <path d="M 40 60 A 60 60 0 0 1 160 60" fill="none" stroke="#a855f7" strokeWidth="4" opacity="0.7" />
          </svg>
        </motion.div>
      )}

      {/* Top Status Badge */}
      <div className="z-10 flex flex-wrap items-center justify-between w-full gap-2 mb-2">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border-2 border-emerald-400 shadow-sm">
          <span className="text-xl">🌳</span>
          <span className="font-bold text-emerald-800 text-sm sm:text-base font-['Fredoka']">
            {currentTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-1.5 rounded-full font-bold text-sm shadow-sm font-['Fredoka']">
          <span>Level {stage} / {totalStages}</span>
          <span className="bg-emerald-800/80 px-2 py-0.5 rounded-full text-xs text-amber-200">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar with Step Milestones */}
      <div className="z-10 w-full max-w-md bg-white/80 rounded-full h-3.5 p-0.5 border border-emerald-300 shadow-inner mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
      </div>

      {/* Main Interactive Stage Display (SVG Tree Scene) */}
      <div className="relative w-full h-[280px] sm:h-[320px] flex items-end justify-center">
        
        {/* Animated Watering Can Effect */}
        <AnimatePresence>
          {isWatering && (
            <motion.div
              initial={{ opacity: 0, y: -40, x: 60, rotate: 0 }}
              animate={{ opacity: 1, y: 0, x: 40, rotate: -25 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="absolute top-6 right-1/4 z-30 pointer-events-none"
            >
              <div className="text-5xl drop-shadow-lg">🚿</div>
              {/* Falling droplets */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: -10 + i * 6, opacity: 1, scale: 0.8 }}
                  animate={{ y: [0, 80, 130], opacity: [1, 0.9, 0], scale: [0.8, 1.2, 0.4] }}
                  transition={{ duration: 0.7, delay: i * 0.1, repeat: 2 }}
                  className="absolute text-cyan-400"
                >
                  <Droplet className="w-4 h-4 fill-cyan-400 text-cyan-500" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tree SVG Animation Canvas */}
        <svg
          viewBox="0 0 300 280"
          className="w-full h-full max-w-[340px] sm:max-w-[400px] overflow-visible"
        >
          <defs>
            <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="goldenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ground & Grass Mound */}
          <ellipse cx="150" cy="265" rx="130" ry="22" fill="#15803d" opacity="0.9" />
          <ellipse cx="150" cy="260" rx="120" ry="18" fill="#22c55e" />
          <ellipse cx="150" cy="256" rx="100" ry="14" fill="#4ade80" />

          {/* Soil patch in center */}
          <ellipse cx="150" cy="255" rx="35" ry="8" fill="#78350f" />

          {/* Flowers in grass */}
          <g className="cursor-pointer" onClick={() => handleCritterClick('grass-flower')}>
            <circle cx="80" cy="252" r="4" fill="#f43f5e" />
            <circle cx="80" cy="252" r="1.5" fill="#fef08a" />

            <circle cx="220" cy="254" r="4" fill="#a855f7" />
            <circle cx="220" cy="254" r="1.5" fill="#fef08a" />

            {stage >= 3 && (
              <>
                <circle cx="105" cy="260" r="3.5" fill="#fbbf24" />
                <circle cx="195" cy="260" r="3.5" fill="#38bdf8" />
              </>
            )}
          </g>

          {/* STAGE 0: Seed only */}
          {stage === 0 && (
            <motion.g
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ellipse cx="150" cy="252" rx="7" ry="5" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
              <path d="M 150 248 Q 152 242 153 238" stroke="#86efac" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="153" cy="237" r="2" fill="#4ade80" />
            </motion.g>
          )}

          {/* STAGE 1: Little Sprout */}
          {stage === 1 && (
            <motion.g
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 120 }}
              style={{ transformOrigin: '150px 255px' }}
            >
              {/* Sprout Stem */}
              <path d="M 150 255 Q 149 235 150 220" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Left Leaf */}
              <motion.path
                d="M 150 225 Q 135 220 135 210 Q 145 210 150 225"
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ transformOrigin: '150px 225px' }}
              />
              {/* Right Leaf */}
              <motion.path
                d="M 150 220 Q 165 215 165 205 Q 155 205 150 220"
                fill="#86efac"
                stroke="#15803d"
                strokeWidth="1"
                animate={{ rotate: [3, -3, 3] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                style={{ transformOrigin: '150px 220px' }}
              />
            </motion.g>
          )}

          {/* STAGE 2+: Full Growing Trunk and Branches */}
          {stage >= 2 && (
            <g>
              {/* Main Trunk */}
              <motion.path
                d={`M ${150 - trunkWidth / 2} 255 
                    C ${150 - trunkWidth / 2.5} ${255 - trunkHeight * 0.4}, 
                      ${148 - trunkWidth / 3} ${255 - trunkHeight * 0.7}, 
                      ${148} ${255 - trunkHeight} 
                    C ${152 + trunkWidth / 3} ${255 - trunkHeight * 0.7}, 
                      ${150 + trunkWidth / 2.5} ${255 - trunkHeight * 0.4}, 
                      ${150 + trunkWidth / 2} 255 Z`}
                fill={stage >= 10 ? 'url(#goldenGrad)' : 'url(#trunkGrad)'}
                initial={{ scaleY: 0.3 }}
                animate={{ scaleY: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                style={{ transformOrigin: '150px 255px' }}
              />

              {/* Side Branches */}
              {stage >= 3 && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Left branch */}
                  <path
                    d={`M 148 ${255 - trunkHeight * 0.55} Q 120 ${255 - trunkHeight * 0.65} 100 ${255 - trunkHeight * 0.75}`}
                    stroke={stage >= 10 ? '#ca8a04' : '#78350f'}
                    strokeWidth={Math.max(4, trunkWidth * 0.3)}
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Right branch */}
                  <path
                    d={`M 152 ${255 - trunkHeight * 0.6} Q 180 ${255 - trunkHeight * 0.7} 200 ${255 - trunkHeight * 0.8}`}
                    stroke={stage >= 10 ? '#ca8a04' : '#78350f'}
                    strokeWidth={Math.max(4, trunkWidth * 0.3)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.g>
              )}

              {/* Canopy foliage puffs */}
              <motion.g
                initial={{ scale: 0.2 }}
                animate={{ scale: canopyScale }}
                transition={{ type: 'spring', stiffness: 90, damping: 14 }}
                style={{ transformOrigin: `150px ${255 - trunkHeight}px` }}
              >
                {/* Main Canopy Clouds */}
                <circle
                  cx="150"
                  cy={255 - trunkHeight - 20}
                  r="45"
                  fill="url(#leafGrad)"
                  filter={stage >= 10 ? 'url(#glow)' : undefined}
                />
                <circle cx="118" cy={255 - trunkHeight - 10} r="36" fill="#22c55e" opacity="0.95" />
                <circle cx="182" cy={255 - trunkHeight - 10} r="36" fill="#16a34a" opacity="0.95" />
                <circle cx="132" cy={255 - trunkHeight - 42} r="34" fill="#4ade80" />
                <circle cx="168" cy={255 - trunkHeight - 40} r="32" fill="#86efac" />
                <circle cx="150" cy={255 - trunkHeight - 55} r="26" fill="#bbf7d0" opacity="0.8" />

                {/* Additional foliage layers for stage 5+ */}
                {stage >= 5 && (
                  <>
                    <circle cx="95" cy={255 - trunkHeight + 10} r="26" fill="#15803d" opacity="0.85" />
                    <circle cx="205" cy={255 - trunkHeight + 8} r="26" fill="#15803d" opacity="0.85" />
                  </>
                )}

                {/* Sparkle highlights for Champion trees */}
                {stage >= 9 && (
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: `150px ${255 - trunkHeight - 20}px` }}
                  >
                    <polygon points="150,110 153,118 161,121 153,124 150,132 147,124 139,121 147,118" fill="#fde047" />
                    <polygon points="120,140 122,146 128,148 122,150 120,156 118,150 112,148 118,146" fill="#fef08a" />
                    <polygon points="180,140 182,146 188,148 182,150 180,156 178,150 172,148 178,146" fill="#fde047" />
                  </motion.g>
                )}
              </motion.g>

              {/* Flowers blooming on canopy (Stage 4+) */}
              {flowerCount > 0 && (
                <g className="cursor-pointer" onClick={() => handleCritterClick('flower')}>
                  {[
                    { cx: 125, cy: 255 - trunkHeight - 25, color: '#f43f5e' },
                    { cx: 175, cy: 255 - trunkHeight - 30, color: '#ec4899' },
                    { cx: 145, cy: 255 - trunkHeight - 50, color: '#fb7185' },
                    { cx: 110, cy: 255 - trunkHeight - 5, color: '#e879f9' },
                    { cx: 190, cy: 255 - trunkHeight - 12, color: '#f43f5e' },
                    { cx: 155, cy: 255 - trunkHeight - 15, color: '#f472b6' },
                  ].slice(0, flowerCount).map((fl, idx) => (
                    <motion.g
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1, type: 'spring' }}
                    >
                      <circle cx={fl.cx} cy={fl.cy} r="5" fill={fl.color} />
                      <circle cx={fl.cx} cy={fl.cy} r="2" fill="#fef08a" />
                    </motion.g>
                  ))}
                </g>
              )}

              {/* Apples forming and ripening on canopy (Stage 6+) */}
              {appleCount > 0 && (
                <g className="cursor-pointer" onClick={() => handleCritterClick('apple', playCorrectChime)}>
                  {[
                    { cx: 135, cy: 255 - trunkHeight - 15, isGold: stage >= 9 },
                    { cx: 165, cy: 255 - trunkHeight - 20, isGold: false },
                    { cx: 115, cy: 255 - trunkHeight - 35, isGold: stage >= 10 },
                    { cx: 185, cy: 255 - trunkHeight - 32, isGold: false },
                    { cx: 150, cy: 255 - trunkHeight - 38, isGold: stage >= 9 },
                    { cx: 100, cy: 255 - trunkHeight - 12, isGold: false },
                    { cx: 200, cy: 255 - trunkHeight - 15, isGold: true },
                    { cx: 145, cy: 255 - trunkHeight + 5, isGold: false },
                  ].slice(0, appleCount).map((ap, idx) => (
                    <motion.g
                      key={idx}
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: [1, 1.15, 1], y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      whileHover={{ scale: 1.3 }}
                    >
                      {/* Apple Body */}
                      <circle
                        cx={ap.cx}
                        cy={ap.cy}
                        r="7"
                        fill={ap.isGold ? '#eab308' : '#ef4444'}
                        stroke={ap.isGold ? '#ca8a04' : '#b91c1c'}
                        strokeWidth="1"
                      />
                      {/* Apple stem */}
                      <path d={`M ${ap.cx} ${ap.cy - 7} Q ${ap.cx + 2} ${ap.cy - 10} ${ap.cx + 3} ${ap.cy - 12}`} stroke="#78350f" strokeWidth="1.5" fill="none" />
                      {/* Apple tiny leaf */}
                      <ellipse cx={ap.cx + 4} cy={ap.cy - 10} rx="2" ry="1" fill="#4ade80" />
                      {/* Shine spot */}
                      <circle cx={ap.cx - 2} cy={ap.cy - 2} r="1.5" fill="#ffffff" opacity="0.6" />
                    </motion.g>
                  ))}
                </g>
              )}

              {/* Bluebird perched on branch (Stage 5+) */}
              {hasBird && (
                <motion.g
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.25 }}
                  className="cursor-pointer"
                  onClick={() => handleCritterClick('bird')}
                >
                  {/* Bird body */}
                  <ellipse cx="102" cy={255 - trunkHeight * 0.78} rx="7" ry="5.5" fill="#38bdf8" />
                  {/* Bird head */}
                  <circle cx="97" cy={255 - trunkHeight * 0.78 - 3} r="4.5" fill="#0284c7" />
                  {/* Beak */}
                  <polygon points={`93,${255 - trunkHeight * 0.78 - 3} 90,${255 - trunkHeight * 0.78 - 2} 93,${255 - trunkHeight * 0.78 - 1}`} fill="#f59e0b" />
                  {/* Eye */}
                  <circle cx="96" cy={255 - trunkHeight * 0.78 - 4} r="1" fill="#0f172a" />
                  {/* Wing */}
                  <ellipse cx="104" cy={255 - trunkHeight * 0.78} rx="4" ry="2.5" fill="#0369a1" />
                </motion.g>
              )}

              {/* Squirrel on ground / trunk (Stage 8+) */}
              {hasSquirrel && (
                <motion.g
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.25 }}
                  className="cursor-pointer"
                  onClick={() => handleCritterClick('squirrel')}
                >
                  <ellipse cx="180" cy="245" rx="7" ry="9" fill="#b45309" />
                  <circle cx="178" cy="235" r="5" fill="#b45309" />
                  <circle cx="176" cy="234" r="1" fill="#000" />
                  <polygon points="174,236 172,235 174,234" fill="#f59e0b" />
                  {/* Big fluffy tail */}
                  <path d="M 185 250 C 195 245, 195 230, 185 228 C 182 232, 186 240, 183 248" fill="#d97706" />
                  {/* Tiny acorn */}
                  <circle cx="173" cy="242" r="2.5" fill="#78350f" />
                </motion.g>
              )}

              {/* Butterfly fluttering near canopy (Stage 7+) */}
              {hasButterfly && (
                <motion.g
                  animate={{
                    x: [0, 15, -10, 0],
                    y: [0, -10, 8, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.3 }}
                  className="cursor-pointer"
                  onClick={() => handleCritterClick('butterfly')}
                >
                  <ellipse cx="215" cy={255 - trunkHeight - 40} rx="1.5" ry="5" fill="#475569" />
                  {/* Left wing */}
                  <ellipse cx="210" cy={255 - trunkHeight - 42} rx="4" ry="5" fill="#ec4899" opacity="0.9" />
                  {/* Right wing */}
                  <ellipse cx="220" cy={255 - trunkHeight - 42} rx="4" ry="5" fill="#a855f7" opacity="0.9" />
                  <circle cx="210" cy={255 - trunkHeight - 42} r="1.5" fill="#fef08a" />
                  <circle cx="220" cy={255 - trunkHeight - 42} r="1.5" fill="#fef08a" />
                </motion.g>
              )}
            </g>
          )}
        </svg>

        {/* Floating popup toast when clicking animal/plant */}
        <AnimatePresence>
          {clickedCritter && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="absolute top-1/3 bg-white/95 px-3.5 py-1.5 rounded-full shadow-lg border-2 border-emerald-400 text-emerald-800 text-xs sm:text-sm font-bold font-['Fredoka'] pointer-events-none z-40 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {clickedCritter === 'sun' && '☀️ Warm sunshine gives your tree energy!'}
              {clickedCritter === 'apple' && '🍎 Crunchy sweet apple! Great spelling!'}
              {clickedCritter === 'bird' && '🐦 Tweet tweet! "You can do it!"'}
              {clickedCritter === 'squirrel' && '🐿️ The squirrel loves your big tree!'}
              {clickedCritter === 'butterfly' && '🦋 Flap flap! Beautiful spelling!'}
              {clickedCritter === 'flower' && '🌸 Sweet blossom blooming!'}
              {clickedCritter === 'grass-flower' && '🌼 Magic garden flowers!'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Growth Helper Info */}
      <div className="z-10 mt-2 flex items-center justify-between w-full text-xs text-emerald-800 font-bold">
        <div className="flex items-center gap-1">
          <Droplet className="w-3.5 h-3.5 text-cyan-600 fill-cyan-400" />
          <span>Each correct word gives 1 water drop!</span>
        </div>

        {stage < totalStages ? (
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {totalStages - stage} more word{totalStages - stage === 1 ? '' : 's'} to full bloom!
          </span>
        ) : (
          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Fully Grown Champion Tree!
          </span>
        )}
      </div>
    </div>
  );
};
