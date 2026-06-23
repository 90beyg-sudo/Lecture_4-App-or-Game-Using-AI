import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { VOCABULARY_WORDS, VocabWord } from '../data/vocabulary';
import { 
  Volume2, Languages, HelpCircle, CheckCircle2, AlertCircle, 
  Sparkles, Award, RotateCcw, ChevronRight, BookOpen, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VocabularyBoardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
  filterCategory?: string; // Optional subcategory to focus on (from watched video)
}

export const VocabularyBoard: React.FC<VocabularyBoardProps> = ({
  profile,
  onUpdateProfile,
  onAwardXp,
  filterCategory
}) => {
  // Available words list based on category filter
  const [selectedCategory, setSelectedCategory] = useState<string>(filterCategory || 'all');
  const [words, setWords] = useState<VocabWord[]>(VOCABULARY_WORDS);
  const [selectedWord, setSelectedWord] = useState<VocabWord>(VOCABULARY_WORDS[0]);
  
  // Translation Language: 'English' | 'Spanish' | 'French' | 'German'
  const [targetLang, setTargetLang] = useState<'English' | 'Spanish' | 'French' | 'German'>('Spanish');

  // Spelling Quiz Game state
  const [quizInput, setQuizInput] = useState('');
  const [quizChecked, setQuizChecked] = useState(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [consecutiveWins, setConsecutiveWins] = useState(0);

  // Filter words when the selected subcategory changes
  useEffect(() => {
    let filtered = VOCABULARY_WORDS;
    if (selectedCategory !== 'all') {
      filtered = VOCABULARY_WORDS.filter(w => w.category === selectedCategory);
    }
    // Fallback if empty
    if (filtered.length === 0) {
      filtered = VOCABULARY_WORDS;
    }
    setWords(filtered);
    setSelectedWord(filtered[0] || VOCABULARY_WORDS[0]);
    // Reset quiz
    setQuizInput('');
    setQuizChecked(false);
  }, [selectedCategory]);

  useEffect(() => {
    if (filterCategory) {
      setSelectedCategory(filterCategory);
    }
  }, [filterCategory]);

  // Speech Pronunciation helper
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop anything playing
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for kid friendly pacing
      utterance.pitch = 1.1; // Slightly higher/friendly tone
      // Find an English voice if possible
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Oops! Audio pronunciation isn't supported on your browser, but you can still spell it! 📣");
    }
  };

  // Submit spelling check
  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizInput.trim()) return;

    const isMatch = quizInput.trim().toLowerCase() === selectedWord.word.toLowerCase();
    setIsQuizCorrect(isMatch);
    setQuizChecked(true);

    if (isMatch) {
      const currentWins = consecutiveWins + 1;
      setConsecutiveWins(currentWins);

      // Save learned word in profile progress list
      const prevLearned = profile.learnedWords || [];
      const updatedLearned = prevLearned.includes(selectedWord.id)
        ? prevLearned
        : [...prevLearned, selectedWord.id];

      // Update profile
      onUpdateProfile({
        ...profile,
        learnedWords: updatedLearned
      });

      // Award XP
      const xpAmt = 15;
      if (currentWins >= 3) {
        // Double reward for hitting a spelling bee streak!
        onAwardXp(xpAmt + 15, 'Spelling Bee Champion 🐝');
        setConsecutiveWins(0); // reset streak of consecutive wins after claiming the giant award
      } else {
        onAwardXp(xpAmt, 'Wordsmith Apprentice 📚');
      }
    } else {
      setConsecutiveWins(0); // break streak
    }
  };

  // Skip or go to next word
  const handleNextWord = () => {
    const currentIndex = words.findIndex(w => w.id === selectedWord.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      nextIndex = 0; // wrap around
    }
    setSelectedWord(words[nextIndex]);
    setQuizInput('');
    setQuizChecked(false);
  };

  // Get localized subcategory label
  const getSubcategoryLabel = (catId: string) => {
    switch (catId) {
      case 'science-facts':
      case 'science-space': return '🚀 Science Facts';
      case 'math-puzzles':
      case 'math-tricks': return '🔢 Math Puzzles';
      case 'animals-nature': return '🦁 Animals & Nature';
      case 'coding-basics': return '💻 Coding Basics';
      case 'history-lessons':
      case 'history-culture': return '🏛️ History Lessons';
      case 'craft-diy': return '✂️ Craft & DIY';
      case 'jokes':
      case 'riddles': return '🎈 Jokes & Riddles';
      case 'games': return '🎮 Games & Puzzles';
      case 'cartoons': return '🎨 Cartoons & Stories';
      case 'amazing-facts': return '✨ Science Trivia';
      default: return '🌟 General Core';
    }
  };

  // Gather unique categories available in vocabulary
  const subcategoryList = Array.from(new Set(VOCABULARY_WORDS.map(w => w.category)));

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col gap-6" id="vocab-board-component">
      
      {/* HEADER SECTION WITH TITLE AND SPELL MASTER STATS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <span className="text-2xl">🗣️</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Vocab Master Blackboard
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                Level {Math.floor((profile.xpPoints) / 100) + 1} Scholar
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Learn spelling, pronunciation and meanings from stream topics!</p>
          </div>
        </div>

        {/* PROGRESS DISPLAY */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-150 p-2.5 rounded-2xl">
          <div className="text-left leading-none pr-3 border-r border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Mastered Words</p>
            <p className="text-lg font-black text-blue-600 mt-1">{(profile.learnedWords || []).length} / {VOCABULARY_WORDS.length}</p>
          </div>
          <div className="text-left leading-none" id="spelling-streak-tracker">
            <p className="text-[10px] uppercase font-bold text-slate-400">Spelling Streak</p>
            <p className="text-lg font-black text-amber-500 mt-1 flex items-center gap-1">
              {consecutiveWins} 🔥 {consecutiveWins >= 3 ? '🏆 (Streak Claimed!)' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS ROW (For easy discovery, hidden when filterCategory matches single video watch focus) */}
      {!filterCategory && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" id="vocab-filter-row">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All Streaming Vocab
          </button>
          {subcategoryList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {getSubcategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {/* DETAILED DOUBLE-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LIST OF WORDS UNDER SELECT (5 Columns) */}
        <div className="lg:col-span-4 max-h-[460px] overflow-y-auto border border-slate-150 rounded-2xl p-2 bg-slate-50/50 flex flex-col gap-1.5 scrollbar-none" id="vocab-word-selector-list">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-2 border-b border-slate-100">Select a Word to Study</p>
          {words.map(w => {
            const isStudying = selectedWord.id === w.id;
            const mastered = (profile.learnedWords || []).includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => {
                  setSelectedWord(w);
                  setQuizInput('');
                  setQuizChecked(false);
                }}
                className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between border ${
                  isStudying 
                    ? 'bg-white border-blue-500 text-blue-700 shadow-sm font-bold' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs">{isStudying ? '📖' : '💡'}</span>
                  <span className="text-xs truncate">{w.word}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-slate-400 opacity-80 truncate hidden md:inline max-w-[80px]">
                    {w.category.split('-')[1] || w.category}
                  </span>
                  {mastered && (
                    <span className="text-emerald-500 font-bold text-xs" title="Mastered Spelling!">✅</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* STUDY BLACKBOARD CANVAS & SPELLING CHALLENGE (8/12 elements) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-indigo-950 to-blue-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-md flex flex-col gap-6" id="vocab-blackboard-canvas">
          
          {/* Subtle grid background for school-slate aesthetics */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          {/* ACTIVE WORD & AUDIO SPEAKER */}
          <div className="flex items-center justify-between border-b border-indigo-900 pb-4 relative z-10">
            <div>
              <span className="text-[9px] font-bold text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-full uppercase tracking-widest border border-indigo-800">
                {getSubcategoryLabel(selectedWord.category)}
              </span>
              <h3 className="text-3xl font-black tracking-tight text-white mt-1">{selectedWord.word}</h3>
            </div>
            
            {/* Pronunciation triggers text to speech */}
            <button
              onClick={() => handleSpeak(selectedWord.word)}
              className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition cursor-pointer flex items-center gap-1.5 border border-white/20"
              title="Click to hear correct pronunciation"
            >
              <Volume2 size={20} className="text-blue-200 animate-pulse" />
              <span className="text-[10px] font-bold hidden sm:inline">Hear Voice!</span>
            </button>
          </div>

          {/* WORD MEANINGS & MULTILINGUAL OPTION */}
          <div className="relative z-10 flex flex-col gap-4 bg-indigo-900/40 p-5 rounded-2xl border border-indigo-800">
            <div>
              <h4 className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <BookOpen size={10} /> English Meaning
              </h4>
              <p className="text-sm font-medium leading-relaxed text-slate-200 mt-1">
                {selectedWord.meaning}
              </p>
            </div>

            {/* Language translations - if different */}
            <div className="pt-3 border-t border-indigo-900/60">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Languages size={10} /> Bilingual Version
                </h4>
                {/* select tool */}
                <div className="flex gap-1">
                  {['Spanish', 'French', 'German'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTargetLang(lang as any)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition ${
                        targetLang === lang
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs italic leading-relaxed text-amber-100">
                {selectedWord.translations[targetLang] || `${targetLang} translation loading...`}
              </p>
            </div>

            {/* Playful Fact bubble */}
            {selectedWord.funFact && (
              <div className="mt-2 bg-blue-900/30 p-3 rounded-xl border border-blue-800 text-xs text-blue-100 flex items-start gap-2">
                <Sparkles size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                <span><strong>Fun Fact:</strong> {selectedWord.funFact}</span>
              </div>
            )}
          </div>

          {/* BEE INTERACTIVE SPELLING CHALLENGE FORM */}
          <div className="relative z-10 bg-indigo-950/80 p-5 rounded-2xl border border-indigo-900 mt-2">
            <h4 className="text-xs font-black text-white flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-yellow-400 animate-bounce" />
              Spelling Bee Quiz Challenger!
            </h4>
            <p className="text-[11px] text-indigo-200 mb-3 leading-tight">
              Listen to the voice and type the CORRECT spelling below to test yourself and earn <strong className="text-green-400">+15 XP</strong>! Get 3 correct to win a badge status.
            </p>

            <form onSubmit={handleCheckSpelling} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type correct spelling..."
                  value={quizInput}
                  onChange={(e) => setQuizInput(e.target.value)}
                  disabled={quizChecked && isQuizCorrect}
                  className="w-full bg-indigo-900/60 border border-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl px-4 py-2.5 text-sm font-bold tracking-wide placeholder-indigo-400/80 text-white"
                />
                
                {/* quick hear button */}
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedWord.word)}
                  className="absolute right-3 top-2 text-indigo-300 hover:text-white transition"
                  title="Speak target word"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  id="submit-spelling-btn"
                  type="submit"
                  disabled={!quizInput.trim() || (quizChecked && isQuizCorrect)}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Verify Spelling
                </button>

                <button
                  type="button"
                  onClick={handleNextWord}
                  className="p-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl text-xs flex items-center justify-center cursor-pointer transition"
                  title="Next word"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </form>

            <AnimatePresence>
              {quizChecked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  {isQuizCorrect ? (
                    <div className="p-3.5 bg-emerald-950/80 rounded-xl border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span>Fantastic! Your spelling is <strong>correct</strong>! You gained <strong>+15 XP</strong>!</span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleNextWord}
                        className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px]"
                      >
                        Next Word &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-rose-950/80 rounded-xl border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span>Spelling isn't quite right. Keep practicing!</span>
                          <p className="text-[10px] text-rose-400 font-semibold mt-0.5">Tip: Click the speaker button at the top to hear the syllables, or study the letters in study menu.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuizChecked(false);
                          setQuizInput('');
                        }}
                        className="p-1 px-2.5 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg text-[10px] whitespace-nowrap"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};
