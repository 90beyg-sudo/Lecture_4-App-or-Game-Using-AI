import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, MapPin, CheckCircle, Lock, BookOpen, Video, Award, Gift, ArrowRight } from 'lucide-react';

interface AdventureTrailProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
}

interface TrailStep {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockHint: string;
  chestCoinsReward: number;
  condition: (prof: UserProfile) => boolean;
  colorTheme: string; // Tailwind colors
  xPercent: number; // For plotting node coordinates
  yPercent: number;
}

export const ADVENTURE_TRAIL_STEPS: TrailStep[] = [
  {
    id: 'step-1',
    name: "Basecamp Beginning 🎒",
    emoji: "⛺",
    description: "The beautiful starting woods of your learning voyage! Welcome to the hub, where curiosity begins.",
    unlockHint: "Unlocked immediately upon registration!",
    chestCoinsReward: 50,
    condition: () => true, // Always unlocked
    colorTheme: "from-emerald-400 to-teal-500",
    xPercent: 12,
    yPercent: 45
  },
  {
    id: 'step-2',
    name: "Story Telling Island 📚",
    emoji: "🌲",
    description: "An enchanted reading glade where kid scholars read science, climate, and insect stories to expand horizons.",
    unlockHint: "Read 1 story inside the Reading Corner or write 1 Book Club review!",
    chestCoinsReward: 60,
    condition: (p) => (p.readArticles && p.readArticles.length >= 1) || (p.books && p.books.filter(b => b.status === "completed").length >= 1),
    colorTheme: "from-teal-400 to-cyan-500",
    xPercent: 32,
    yPercent: 20
  },
  {
    id: 'step-3',
    name: "Wordplay Reef & Beach 🐝",
    emoji: "🏖️",
    description: "Shining sandy bay where spelling masteries are untangled, scrambled, and memorized!",
    unlockHint: "Study spelling or unscramble 1 word inside the Vocab Blackboard!",
    chestCoinsReward: 60,
    condition: (p) => (p.badges && (p.badges.includes('Spelling Bee Champion 🐝') || p.badges.includes('Polished Orator 🗣️'))) || (p.learnedWords && p.learnedWords.length >= 1),
    colorTheme: "from-amber-400 to-orange-500",
    xPercent: 52,
    yPercent: 65
  },
  {
    id: 'step-4',
    name: "Trivia Lagoon Volcano 🌋",
    emoji: "🔥",
    description: "A scorching hot crater of mind-boggling quizzes! Watch curious streams and lock-in your scores.",
    unlockHint: "Successfully complete 1 question on any video's companion trivia quiz!",
    chestCoinsReward: 80,
    condition: (p) => (p.completedVideos && p.completedVideos.length >= 1),
    colorTheme: "from-rose-500 to-pink-500",
    xPercent: 72,
    yPercent: 30
  },
  {
    id: 'step-5',
    name: "The Scholar Citadel 🏰",
    emoji: "🏆",
    description: "The final majestic cloud fortress! Only legendary kids with vast learning experience can enter here.",
    unlockHint: "Surpass 220 XP total through reading and spelling games!",
    chestCoinsReward: 120,
    condition: (p) => p.xpPoints >= 220,
    colorTheme: "from-purple-500 to-indigo-600",
    xPercent: 90,
    yPercent: 50
  }
];

export const AdventureTrail: React.FC<AdventureTrailProps> = ({
  profile,
  onUpdateProfile,
  onAwardXp
}) => {
  const [activeStep, setActiveStep] = useState<TrailStep | null>(ADVENTURE_TRAIL_STEPS[0]);
  const claimedChests = profile.claimedChests || [];

  const handleClaimChest = (step: TrailStep) => {
    if (!step.condition(profile)) return;
    if (claimedChests.includes(step.id)) return;

    // Apply reward
    const currentCoins = profile.coins !== undefined ? profile.coins : 150;
    const nextCoins = currentCoins + step.chestCoinsReward;
    const nextClaimed = [...claimedChests, step.id];

    onUpdateProfile({
      ...profile,
      coins: nextCoins,
      claimedChests: nextClaimed
    });

    onAwardXp(15); // Bonus XP
  };

  return (
    <div className="flex flex-col gap-6" id="golden-adventure-trail">
      {/* MAP HEADER CARDS */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-xl text-center md:text-left">
          <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 mb-2">
            🧭 INTERACTIVE WORLD MAP: GOLDEN TRAIL
          </span>
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Compass size={24} className="stroke-[2] text-yellow-300 animate-spin" style={{ animationDuration: '12s' }} /> Kid Voyager's Adventure Trail
          </h2>
          <p className="text-xs text-sky-50 opacity-95 mt-1 leading-relaxed">
            Travel along the Golden Learner's Route! Each island unlocks automatically as you write book club entries, play vocabulary unscrambles, and complete reading quizes. Click stops to claim hidden treasure boxes!
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 text-center shrink-0 min-w-[150px]">
          <span className="text-[10px] uppercase font-bold text-sky-200">Chests Looted</span>
          <p className="text-3xl font-black mt-0.5">{claimedChests.length} / {ADVENTURE_TRAIL_STEPS.length}</p>
          <div className="w-full bg-sky-800/50 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-yellow-400 h-full transition-all duration-300"
              style={{ width: `${(claimedChests.length / ADVENTURE_TRAIL_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INTERACTIVE BOARD AREA (7 COLS) */}
        <div className="lg:col-span-8 bg-gradient-to-b from-sky-100 to-sky-50 rounded-3xl border border-sky-200/60 p-5 shadow-inner min-h-[350px] relative overflow-hidden flex flex-col justify-between">
          
          {/* WATER PATTERN BACKBOARD */}
          <div className="absolute inset-0 opacity-15 pointer-events-none select-none flex flex-wrap gap-12 p-8 justify-around items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-4xl">🌊</span>
            ))}
          </div>

          <div className="z-10 text-center md:text-left mb-4">
            <h3 className="font-extrabold text-xs text-sky-850 uppercase tracking-widest">
              🏝️ Click an island on the map to navigate
            </h3>
          </div>

          {/* DYNAMIC MAP MAP PATHWAY */}
          <div className="w-full h-64 relative bg-sky-100/60 rounded-2xl border border-sky-150 p-4 shrink-0 flex items-center justify-around">
            
            {/* SVG Connecting Dotted Trail */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <path 
                d="M 12% 45% Q 22% 20% 32% 20% T 52% 65% T 72% 30% T 90% 50%" 
                fill="none" 
                stroke="#60a5fa" 
                strokeWidth="4" 
                strokeDasharray="8,8" 
                className="animate-pulse"
              />
            </svg>

            {/* Loop Stops */}
            {ADVENTURE_TRAIL_STEPS.map((step) => {
              const isUnlocked = step.condition(profile);
              const isClaimed = claimedChests.includes(step.id);
              const isSelected = activeStep?.id === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step)}
                  className="absolute cursor-pointer flex flex-col items-center group transition"
                  style={{ left: `${step.xPercent}%`, top: `${step.yPercent}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Outer circle halo */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow transition duration-200 ${
                    isSelected ? 'ring-4 ring-yellow-405 scale-110' : 'group-hover:scale-105'
                  } ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-white to-slate-50 border-sky-400 text-sky-700' 
                      : 'bg-slate-200 border-slate-350 text-slate-400'
                  }`}>
                    {isUnlocked ? (
                      <span className="text-2xl">{step.emoji}</span>
                    ) : (
                      <Lock size={18} className="text-slate-400" />
                    )}
                  </div>

                  {/* Marker text label below */}
                  <span className={`text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-md leading-none border shadow-sm ${
                    isUnlocked 
                      ? 'bg-white text-sky-800 border-sky-150' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {step.name.split(' ')[0]}
                  </span>

                  {/* Chest ready indicator */}
                  {isUnlocked && !isClaimed && (
                    <span className="absolute -top-3 -right-2 bg-yellow-400 text-slate-900 border border-yellow-500 rounded-full p-1 leading-none text-[8px] font-black animate-bounce">
                      🎁
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          <div className="z-10 mt-4 flex justify-between items-center text-[10px] font-extrabold text-sky-800 bg-white/40 border border-sky-150/40 p-2 rounded-xl">
            <span>🏁 Starter Base</span>
            <span>Grand Citadel 🏰</span>
          </div>

        </div>

        {/* DETAILS SIDE-DRAWER PANEL (5 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeStep ? (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-4 h-full"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeStep.colorTheme} text-white flex items-center justify-center text-2xl shadow-sm mb-3`}>
                    {activeStep.emoji}
                  </div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">
                    {activeStep.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                    {activeStep.description}
                  </p>
                </div>

                {/* Requirements / Status */}
                <div className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">How to Unlock:</span>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">{activeStep.unlockHint}</p>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-500">Requirements Check:</span>
                    {activeStep.condition(profile) ? (
                      <span className="text-emerald-650 font-black flex items-center gap-0.5">Unlocked! UNLOCKED</span>
                    ) : (
                      <span className="text-rose-600 font-black flex items-center gap-0.5">🔒 LOCKED</span>
                    )}
                  </div>
                </div>

                {/* Chest Loot Segment */}
                <div className="mt-auto border-t border-slate-100 pt-4">
                  {claimedChests.includes(activeStep.id) ? (
                    <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl p-4 flex items-center gap-3">
                      <span className="text-3xl">🔓</span>
                      <div>
                        <h5 className="text-xs font-black">Chest Successfully Looted!</h5>
                        <p className="text-[10px] text-emerald-650 font-semibold leading-relaxed mt-0.5">
                          You collected <strong>+{activeStep.chestCoinsReward} Star Coins</strong> from this island. Go spending on outfits!
                        </p>
                      </div>
                    </div>
                  ) : activeStep.condition(profile) ? (
                    <button
                      onClick={() => handleClaimChest(activeStep)}
                      className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 active:scale-[0.99] text-slate-900 border border-yellow-500 font-black text-xs md:text-sm py-3.5 rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Gift size={16} className="animate-bounce" /> Claim Secret Chest (+{activeStep.chestCoinsReward} Gold!) 🎁
                    </button>
                  ) : (
                    <div className="bg-slate-100 border border-slate-200 text-slate-400 rounded-2xl p-4 flex items-center gap-3">
                      <Lock size={20} className="shrink-0 text-slate-400" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-550">Secret Treasure Box Locked</h5>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-tight">
                          Fulfill the study requirement for this stop to claim <strong>{activeStep.chestCoinsReward} coins</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-12 text-slate-400">
                <Compass size={36} className="text-slate-350 mb-2 animate-pulse" />
                <p className="text-xs font-bold">Select any point to preview exploration objectives!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
