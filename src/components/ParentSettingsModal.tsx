import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Plus, Trash2, Volume2, Save, RefreshCw } from 'lucide-react';
import { SpellingWord } from '../types';

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  onUpdateChildName: (name: string) => void;
  bonusLastName: string;
  onUpdateBonusLastName: (name: string) => void;
  words: SpellingWord[];
  onUpdateWords: (newWords: SpellingWord[]) => void;
  onResetProgress: () => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  isOpen,
  onClose,
  childName,
  onUpdateChildName,
  bonusLastName,
  onUpdateBonusLastName,
  words,
  onUpdateWords,
  onResetProgress,
}) => {
  const [localChildName, setLocalChildName] = useState(childName);
  const [localLastName, setLocalLastName] = useState(bonusLastName);
  const [newWordInput, setNewWordInput] = useState('');
  const [newCategory, setNewCategory] = useState<'th' | 'ch' | 'other'>('th');

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateChildName(localChildName);
    onUpdateBonusLastName(localLastName);
    onClose();
  };

  const handleAddWord = () => {
    const clean = newWordInput.trim().toLowerCase();
    if (!clean) return;

    const newWordObj: SpellingWord = {
      id: `custom-${Date.now()}`,
      word: clean,
      category: newCategory,
      phonics: clean.split(''),
      definition: 'Custom practice word',
      sentence: `Let's practice the word ${clean}!`,
      emoji: newCategory === 'th' ? '🪵' : newCategory === 'ch' ? '🏡' : '⭐',
    };

    onUpdateWords([...words, newWordObj]);
    setNewWordInput('');
  };

  const handleDeleteWord = (id: string) => {
    onUpdateWords(words.filter(w => w.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-xl bg-white rounded-[40px] border-8 border-sky-100 p-6 sm:p-8 shadow-2xl relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl shadow-md">
            ⚙️
          </div>
          <div>
            <h3 className="text-2xl font-black text-sky-900 font-['Fredoka']">
              PARENT & TEACHER SETTINGS
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
              Customize Child's Name, Bonus Word & Spelling List
            </p>
          </div>
        </div>

        {/* Profile Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-sky-800 mb-1">
              Child's First Name:
            </label>
            <input
              type="text"
              value={localChildName}
              onChange={(e) => setLocalChildName(e.target.value)}
              placeholder="e.g. Leo"
              className="w-full px-4 py-3 rounded-2xl bg-sky-50 border-2 border-sky-200 font-bold text-sky-900 text-base focus:border-sky-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-sky-800 mb-1">
              Bonus Word (Last Name from Homework Sheet):
            </label>
            <input
              type="text"
              value={localLastName}
              onChange={(e) => setLocalLastName(e.target.value)}
              placeholder="e.g. Zhang"
              className="w-full px-4 py-3 rounded-2xl bg-sky-50 border-2 border-sky-200 font-bold text-sky-900 text-base focus:border-sky-400 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Matches the homework: "Bonus Word: Your last name"
            </p>
          </div>
        </div>

        {/* Current Words List Manager */}
        <div className="mb-6 pt-4 border-t-2 border-slate-100">
          <label className="block text-xs font-black uppercase tracking-wider text-sky-800 mb-2">
            Weekly Word List ({words.length} words):
          </label>

          <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
            {words.map((w, idx) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-sm font-bold font-['Fredoka']"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">{idx + 1}.</span>
                  <span className="text-slate-800">{w.word}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {w.category}
                  </span>
                </div>

                {!w.isBonus && (
                  <button
                    onClick={() => handleDeleteWord(w.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Delete word"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Word Row */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              placeholder="Add new word..."
              className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold outline-none"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as 'th' | 'ch' | 'other')}
              className="px-2 py-2 rounded-xl bg-white border-2 border-slate-200 text-xs font-bold"
            >
              <option value="th">"th"</option>
              <option value="ch">"ch"</option>
              <option value="other">other</option>
            </select>
            <button
              onClick={handleAddWord}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Reset & Save actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-slate-100">
          <button
            onClick={() => {
              if (confirm('Reset tree growth to start fresh?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Tree Growth</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow border-b-4 border-green-700 font-['Fredoka'] active:translate-y-0.5"
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
