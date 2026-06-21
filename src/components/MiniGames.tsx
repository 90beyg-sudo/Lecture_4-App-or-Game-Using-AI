import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, RefreshCw, HelpCircle, Gamepad2, Coins, AlertCircle, CheckCircle, Flame, ArrowLeft } from 'lucide-react';

interface MiniGamesProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
}

// Memory Game Card Schema
interface MemoryCard {
  id: number;
  pairId: string;
  emoji: string;
  label: string;
  fact: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Spelling Unscramble Words
const LEARNING_WORDS = [
  { word: "RAINBOW", hint: "Formaged by sunlight refraction through water droplets 🌈" },
  { word: "GALAXY", hint: "A giant cosmic cluster filled with millions of stars and solar systems 🌌" },
  { word: "HONEYBEE", hint: "Fuzzy insect that performs the Waggle Dance and builds honeycombs 🐝" },
  { word: "VOLCANO", hint: "A giant mountain that vents red hot molten magma from Earth's core 🌋" },
  { word: "DINOSAUR", hint: "Ancient fossils of majestic reptiles that walked Earth millions of years ago 🦖" },
  { word: "PHOTOSYNTHESIS", hint: "How green trees and plants convert sunshine into delicious food 🍃" }
];

export const MiniGames: React.FC<MiniGamesProps> = ({
  profile,
  onUpdateProfile,
  onAwardXp
}) => {
  const [activeGame, setActiveGame] = useState<'match' | 'scramble' | null>(null);
  const coinBalance = profile.coins !== undefined ? profile.coins : 150;

  // --- MEMORY GAME STATE ---
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [latestFactRevealed, setLatestFactRevealed] = useState<string | null>(null);
  const [isMemoryFinished, setIsMemoryFinished] = useState(false);

  // --- SPELLING GAME STATE ---
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState("");
  const [userGuess, setUserGuess] = useState("");
  const [scrambleFeedback, setScrambleFeedback] = useState<{ status: 'idle' | 'correct' | 'wrong', msg: string }>({ status: 'idle', msg: '' });
  const [scrambleSolvedCount, setScrambleSolvedCount] = useState(0);

  // Initialize Memory Deck
  const initializeMemoryGame = () => {
    const rawPairs = [
      { pairId: 'space', emoji: '🚀', label: 'Space Star Voyager', fact: 'Outer space is completely silent because there is no air for sound waves to travel through!' },
      { pairId: 'bio', emoji: '🌲', label: 'Secret Woods Web', fact: 'Trees secretly talk and share food underground using a web of tiny mushroom threads!' },
      { pairId: 'weather', emoji: '🌈', label: 'Sunlight Rainbow', fact: 'Double rainbows happen when sunlight bounces off the inside of a raindrop twice!' },
      { pairId: 'chemistry', emoji: '🧪', label: 'Magic Lab Reaction', fact: 'Everything in the universe is made of tiny building blocks called atoms!' },
      { pairId: 'prehistoric', emoji: '🦖', label: 'Majestic Dinosaur', fact: 'Some dinosaurs actually had soft colorful feathers instead of scaly lizard skin!' },
      { pairId: 'insect', emoji: '🐝', label: 'Super Honeybee', fact: 'Honeybees can recognize human faces and have tiny hairs on their eyes to collect pollen!' }
    ];

    // Double the items
    const doubled = [...rawPairs, ...rawPairs].map((item, index) => ({
      ...item,
      id: index,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle
    const shuffled = doubled.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIds([]);
    setMatchCount(0);
    setMemoryMoves(0);
    setLatestFactRevealed(null);
    setIsMemoryFinished(false);
  };

  // Initialize Word Scramble
  const initializeScrambleGame = (index = 0) => {
    const target = LEARNING_WORDS[index];
    // Shuffle characters
    let shuffled = target.word.split('').sort(() => Math.random() - 0.5).join(' ');
    // Keep shuffling if it matches original
    while (shuffled.replace(/\s/g, '') === target.word) {
      shuffled = target.word.split('').sort(() => Math.random() - 0.5).join(' ');
    }
    setScrambledWord(shuffled);
    setUserGuess("");
    setScrambleFeedback({ status: 'idle', msg: '' });
  };

  // Run on game activation
  useEffect(() => {
    if (activeGame === 'match') {
      initializeMemoryGame();
    } else if (activeGame === 'scramble') {
      setCurrentWordIndex(0);
      setScrambleSolvedCount(0);
      initializeScrambleGame(0);
    }
  }, [activeGame]);

  // Handle Card Click
  const handleCardClick = (cardId: number) => {
    if (flippedIds.length >= 2) return; // Prevent double-clicking third card too fast
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip the card
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));
    const nextFlipped = [...flippedIds, cardId];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const firstCard = cards.find(c => c.id === nextFlipped[0])!;
      const secondCard = clickedCard;

      if (firstCard.pairId === secondCard.pairId) {
        // MATCH!
        setMatchCount(prev => {
          const nextMatches = prev + 1;
          setLatestFactRevealed(`🎓 Connected: ${firstCard.label}! Did you know: ${firstCard.fact}`);
          
          if (nextMatches === 6) {
            handleCompleteMemoryGame();
          }
          return nextMatches;
        });

        setCards(prev => prev.map(c => c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c));
        setFlippedIds([]);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstCard.id || c.id === secondCard.id) ? { ...c, isFlipped: false } : c));
          setFlippedIds([]);
        }, 1200);
      }
    }
  };

  // Award stats for memory game match
  const handleCompleteMemoryGame = () => {
    setIsMemoryFinished(true);
    let rewardXp = 30;
    let rewardCoins = 60;

    // Fast memory champion bonus
    if (memoryMoves <= 12) {
      rewardXp += 20;
      rewardCoins += 40;
    }

    const updatedBadges = [...(profile.badges || [])];
    let badgeNotice = undefined;
    if (!updatedBadges.includes('Brain Explorer 🧠')) {
      updatedBadges.push('Brain Explorer 🧠');
      rewardXp += 25;
      badgeNotice = 'Brain Explorer 🧠';
    }

    onUpdateProfile({
      ...profile,
      coins: (profile.coins !== undefined ? profile.coins : 150) + rewardCoins,
      badges: updatedBadges
    });

    onAwardXp(rewardXp, badgeNotice);
  };

  // Submit Spelling Unscramble Guess
  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuess = userGuess.toUpperCase().trim();
    const correctWord = LEARNING_WORDS[currentWordIndex].word;

    if (cleanGuess === correctWord) {
      let rewardXp = 15;
      let rewardCoins = 30;

      // Unlocked spelling badge checklist check
      const updatedBadges = [...(profile.badges || [])];
      let badgeAdded = undefined;
      if (!updatedBadges.includes('Spelling Bee Champion 🐝')) {
        updatedBadges.push('Spelling Bee Champion 🐝');
        rewardXp += 50; // Mass bonus!
        badgeAdded = 'Spelling Bee Champion 🐝';
      }

      setScrambleSolvedCount(prev => prev + 1);
      setScrambleFeedback({ status: 'correct', msg: `🌟 Brilliant! "${correctWord}" is perfectly correct! You claimed +${rewardXp} XP & +${rewardCoins} Coins!` });

      onUpdateProfile({
        ...profile,
        coins: (profile.coins !== undefined ? profile.coins : 150) + rewardCoins,
        badges: updatedBadges
      });

      onAwardXp(rewardXp, badgeAdded);
    } else {
      setScrambleFeedback({ status: 'wrong', msg: `❌ Whoops, that spelling is a bit scrambled! Examine the letter bubbles below and tickle your brain cells again!` });
    }
  };

  // Go to next word
  const nextScrambleWord = () => {
    const nextIndex = (currentWordIndex + 1) % LEARNING_WORDS.length;
    setCurrentWordIndex(nextIndex);
    initializeScrambleGame(nextIndex);
  };

  return (
    <div className="flex flex-col gap-6" id="educational-arcade-mini-game">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-purple-550 to-indigo-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-xl text-center md:text-left">
          <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 mb-2">
            👾 ARCADE PORTAL: EDUCATIONAL MINI-GAMES
          </span>
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Gamepad2 size={24} className="stroke-[2.5]" /> Kid Scholar's Learning Arcade
          </h2>
          <p className="text-xs text-indigo-50 opacity-95 mt-1 leading-relaxed">
            Relax and exercise your synapses with interactive puzzles! Unscramble heavy science words, or flip matching cards to learn amazing facts. Earn lots of **Star Coins** to buy cute outfits for your pets!
          </p>
        </div>
        
        {/* BIG TREASURE DISPLAY */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 text-center shrink-0 min-w-[150px] flex items-center justify-center gap-2">
          <span className="text-3xl animate-bounce">🪙</span>
          <div className="text-left">
            <span className="text-[9px] uppercase font-black text-indigo-200 block">Current Balance</span>
            <span className="text-xl font-black leading-none">{coinBalance} Gold</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeGame ? (
          
          /* SELECT GAME HUB */
          <motion.div
            key="game-hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* CARD 1: SCIENCE MEMORY MATCH */}
            <div
              onClick={() => setActiveGame('match')}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between gap-6 cursor-pointer group"
              id="game-selection-match"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl p-4 bg-purple-50 rounded-2xl group-hover:scale-105 transition-transform">
                  🧠
                </span>
                <div>
                  <span className="bg-purple-100 text-purple-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-200">
                    Memory Game
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-2 leading-tight group-hover:text-indigo-700 transition">
                    Brain Explorer Match Quest
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">
                    Flip, memorize, and match pairs of cute educational emojis. Every match unlocks a fun science or biology fact!
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                <span className="font-extrabold text-amber-600 flex items-center gap-1">
                  👑 Rewards: up to +50 XP / +100 Coins! ✨
                </span>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-750 font-black rounded-xl text-[11px] group-hover:bg-indigo-650 group-hover:text-white transition cursor-pointer">
                  Play Free &rarr;
                </button>
              </div>
            </div>

            {/* CARD 2: SPELLING BEE WORD SCRAMBLER */}
            <div
              onClick={() => setActiveGame('scramble')}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between gap-6 cursor-pointer group"
              id="game-selection-scramble"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl p-4 bg-amber-50 rounded-2xl group-hover:scale-105 transition-transform">
                  🐝
                </span>
                <div>
                  <span className="bg-amber-100 text-amber-850 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                    Word Puzzle
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-2 leading-tight group-hover:text-indigo-700 transition">
                    Spelling Bee Unscrambler
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">
                    Letters are totally mismatched! Examine scientific vocab and drag, type, or arrange the bubbles to spell it correctly.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                <span className="font-extrabold text-amber-600 flex items-center gap-1">
                  🐝 Rewards: +15 XP / +30 Coins per word!
                </span>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-750 font-black rounded-xl text-[11px] group-hover:bg-indigo-650 group-hover:text-white transition cursor-pointer">
                  Play Free &rarr;
                </button>
              </div>
            </div>
            
          </motion.div>
        ) : activeGame === 'match' ? (
          
          /* ACTIVE GAME 1: SCIENCE MEMORY MATCH */
          <motion.div
            key="game-play-match"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-6"
            id="active-memory-game-workspace"
          >
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <button
                onClick={() => { setActiveGame(null); setLatestFactRevealed(null); }}
                className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 text-slate-600 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Arcade
              </button>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span>Moves: <strong className="text-slate-800 font-black">{memoryMoves}</strong></span>
                <span>Matches: <strong className="text-emerald-600 font-black">{matchCount} / 6</strong></span>
              </div>

              <button
                onClick={initializeMemoryGame}
                className="p-2 border border-slate-150 rounded-xl hover:bg-slate-50 transition text-slate-500 shrink-0 cursor-pointer"
                title="Reset Match Grid"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* MAIN PORT GRID */}
            {!isMemoryFinished ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 max-w-4xl mx-auto w-full py-4">
                {cards.map((card) => {
                  const showFront = card.isFlipped || card.isMatched;

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      disabled={card.isMatched || flippedIds.includes(card.id)}
                      className={`h-24 md:h-28 rounded-2xl border-2 flex items-center justify-center font-sans relative transition transform duration-300 outline-none select-none cursor-pointer ${
                        showFront 
                          ? 'bg-indigo-50 border-indigo-305 text-4xl shadow-inner scale-102' 
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {showFront ? (
                        <span>{card.emoji}</span>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-indigo-150">
                          <span className="text-2xl">❓</span>
                        </div>
                      )}

                      {card.isMatched && (
                        <span className="absolute bottom-1 right-1 p-0.5 bg-emerald-500 text-white rounded-full leading-none text-[8px] border border-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* MEMORY COMPLETED SCREEN */
              <div className="text-center py-10 flex flex-col items-center gap-4 max-w-xl mx-auto">
                <span className="text-6xl animate-bounce">🏆</span>
                <h3 className="font-black text-slate-800 text-xl leading-tight">
                  CONGRATULATIONS! Matching Master!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  You cracked the Brain Match Quest in <strong className="text-indigo-600 font-black">{memoryMoves} moves</strong>! You unlocked the gorgeous **Brain Explorer 🧠** badge and filled your pocket!
                </p>

                <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-4 w-full flex items-center justify-around text-xs font-black text-amber-800">
                  <span className="flex items-center gap-1">🪙 +60 Star Coins</span>
                  <span className="flex items-center gap-1">👑 +30 XP Points</span>
                </div>

                <button
                  onClick={initializeMemoryGame}
                  className="mt-2 w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs md:text-sm shadow"
                >
                  Play Grid Again! 🔁
                </button>
              </div>
            )}

            {/* BOTTOM DYNAMIC LEARNING LIVE HINT */}
            {latestFactRevealed && !isMemoryFinished && (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-start gap-3 mt-4 animate-fade-in claim-reward-feedback shadow-inner">
                <span className="text-2xl mt-0.5">📚</span>
                <div>
                  <h5 className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Fast Fun Learning Fact!</h5>
                  <p className="text-xs text-slate-705 leading-relaxed font-semibold mt-0.5">{latestFactRevealed}</p>
                </div>
              </div>
            )}

          </motion.div>
        ) : (
          
          /* ACTIVE GAME 2: SPELLING BEE UNSCRAMBLER */
          <motion.div
            key="game-play-scramble"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-6"
            id="active-vocab-scramble-workspace"
          >
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <button
                onClick={() => setActiveGame(null)}
                className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 text-slate-600 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Arcade
              </button>

              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-705 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl">
                <Flame size={12} className="text-amber-500 shrink-0 fill-amber-500 animate-pulse" />
                <span>Solved: <strong className="text-slate-900 font-black">{scrambleSolvedCount} words</strong></span>
              </div>
            </div>

            {/* PLAYBOARD CARDS MAP */}
            <div className="max-w-xl mx-auto w-full py-4 flex flex-col gap-5 text-center">
              
              {/* Question / Word Tip box */}
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-black mb-1 block">CLUE FOR SCIENTIST:</span>
                <p className="text-sm md:text-base text-slate-700 font-black leading-snug">
                  {LEARNING_WORDS[currentWordIndex].hint}
                </p>
              </div>

              {/* Scrambled Bubble letters container */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                {scrambledWord.split(' ').map((char, index) => (
                  <span
                    key={index}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border border-slate-250 rounded-full font-black text-slate-800 text-base md:text-lg shadow-sm hover:-translate-y-0.5 duration-100 select-none animate-bounce"
                    style={{ animationDelay: `${index * 80}ms`, animationDuration: '2s' }}
                  >
                    {char}
                  </span>
                ))}
              </div>

              {/* Spelling Guess input form */}
              <form onSubmit={handleScrambleSubmit} className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  required
                  placeholder="Rearrange alphabet bubbles above and enter answer..."
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-250 rounded-2xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-extrabold text-sm text-slate-800 bg-white"
                />
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 active:scale-98 transition text-white rounded-2xl font-black text-xs md:text-sm shadow-md"
                >
                  Verify Guess! 🚀
                </button>
              </form>

              {/* FEEDBACK PROMPTS */}
              {scrambleFeedback.status !== 'idle' && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 mt-2 text-left animate-fade-in ${
                  scrambleFeedback.status === 'correct' 
                    ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                    : 'bg-rose-50 border-rose-150 text-rose-800'
                }`}>
                  <span className="text-2xl shrink-0">
                    {scrambleFeedback.status === 'correct' ? '🎉' : '🤔'}
                  </span>
                  <div>
                    <p className="text-xs font-black leading-tight">Spelling Evaluation Message:</p>
                    <p className="text-xs mt-1 font-semibold leading-relaxed opacity-95">
                      {scrambleFeedback.msg}
                    </p>
                    {scrambleFeedback.status === 'correct' && (
                      <button
                        type="button"
                        onClick={nextScrambleWord}
                        className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg cursor-pointer"
                      >
                        Keep going: Next Word &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
