import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, Shirt, Heart, Check, HelpCircle, Edit3, Coins, AlertCircle } from 'lucide-react';

interface MascotWardrobeProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
}

interface AccessoryItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  category: 'hat' | 'eyes' | 'companion' | 'magic';
  styleOffset: string; // Tailwind class positioning
}

export const MAIN_PET_SPECIES = [
  { id: 'dragon', name: 'Chippy the Red Dragon', emoji: '🐉', color: 'from-rose-450 to-orange-550', sound: 'Chippy lets out a sparky roar of glee!' },
  { id: 'unicorn', name: 'Sparky the Star Unicorn', emoji: '🦄', color: 'from-pink-400 to-violet-500', sound: 'Sparky whinnies merrily and flashes starlight!' },
  { id: 'owl', name: 'Ollie the Sage Owl', emoji: '🦉', color: 'from-amber-400 to-indigo-600', sound: 'Ollie hoot-hoots wisely and nods of respect!' },
  { id: 'panda', name: 'Boo the Sleepy Panda', emoji: '🐼', color: 'from-slate-700 to-slate-900', sound: 'Boo rolls over happily and munches a bamboo shoot!' }
];

export const ACCESSORY_SHOP: AccessoryItem[] = [
  { id: 'crown', name: 'Glittering Princess Crown', emoji: '👑', cost: 60, description: 'Fits for absolute royalty!', category: 'hat', styleOffset: '-top-6 left-1/2 -translate-x-1/2 text-4xl animate-bounce' },
  { id: 'witch-hat', name: 'Magician Sorcerer Hat', emoji: '🧙', cost: 80, description: 'Cast mysterious learning spells!', category: 'hat', styleOffset: '-top-7 left-1/2 -translate-x-1/2 text-4xl transform -rotate-12' },
  { id: 'sunglasses', name: 'Cool DJ Shades', emoji: '🕶️', cost: 40, description: 'Extremely cool and trendy look!', category: 'eyes', styleOffset: 'top-6 left-1/2 -translate-x-1/2 text-3xl z-10' },
  { id: 'space-helmet', name: 'Space Astro Helmet', emoji: '🧑‍🚀', cost: 100, description: 'Ready to land on Mars and orbit stars!', category: 'hat', styleOffset: '-top-3 left-1/2 -translate-x-1/2 text-5xl opacity-85 z-20' },
  { id: 'wizard-staff', name: 'Mystic Star Wand', emoji: '🪄', cost: 50, description: 'Glows with the power of curiosity!', category: 'magic', styleOffset: 'top-8 -right-6 text-4xl anim-pulse' },
  { id: 'lollipop', name: 'Golden Swirl Lollipop', emoji: '🍭', cost: 25, description: 'A delicious endless snack!', category: 'companion', styleOffset: 'bottom-0 -left-5 text-3xl' },
  { id: 'toy-ball', name: 'Glow Bounce Toy Ball', emoji: '⚽', cost: 10, description: 'Boing boing! Sparky loves playing with it.', category: 'companion', styleOffset: 'bottom-2 -right-5 text-2xl animate-spin' },
  { id: 'super-cape', name: 'Super Scholar Cape', emoji: '🧣', cost: 70, description: 'Fly like a legendary educator!', category: 'eyes', styleOffset: 'bottom-2 left-1/2 -translate-x-1/2 text-3xl opacity-90' }
];

export const MascotWardrobe: React.FC<MascotWardrobeProps> = ({
  profile,
  onUpdateProfile,
  onAwardXp
}) => {
  const currentPetType = profile.petType || 'dragon';
  const currentPetName = profile.petName || 'Chippy';
  const coinBalance = profile.coins !== undefined ? profile.coins : 150;
  const unlockedItems = profile.unlockedItems || ['toy-ball'];
  const equippedItems = profile.equippedItems || [];

  const [activeShopTab, setActiveShopTab] = useState<'shop' | 'petting'>('shop');
  const [petActionText, setPetActionText] = useState<string>('cuddle or give snacks to unlock happiness!');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(currentPetName);
  const [pettingStreak, setPettingStreak] = useState(0);

  const selectedSpecies = MAIN_PET_SPECIES.find(p => p.id === currentPetType) || MAIN_PET_SPECIES[0];

  const handlePetChange = (speciesId: 'dragon' | 'unicorn' | 'owl' | 'panda') => {
    const defaultNames = {
      dragon: 'Chippy',
      unicorn: 'Sparky',
      owl: 'Ollie',
      panda: 'Boo'
    };
    
    onUpdateProfile({
      ...profile,
      petType: speciesId,
      petName: defaultNames[speciesId]
    });
    setNewNameInput(defaultNames[speciesId]);
    setPetActionText(`Adopted your new pet! ${defaultNames[speciesId]} smiles at you!`);
  };

  const handleRenamePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameInput.trim()) return;
    
    onUpdateProfile({
      ...profile,
      petName: newNameInput.trim()
    });
    setIsEditingName(false);
    setPetActionText(`Your pet has been renamed to ${newNameInput}! 🎉`);
  };

  const cuddlePet = () => {
    const happyResponses = [
      `cuddles in your hands and purrs warmly! 🥰`,
      `flashes happy emoji bubbles and dances clockwise! 💃`,
      `gives you a tiny friendly high-five! 🐾`,
      `giggle-giggles and does a happy flip! 🤸`
    ];
    const chosenResponse = happyResponses[Math.floor(Math.random() * happyResponses.length)];
    setPetActionText(`${currentPetName} ${chosenResponse}`);
    setPettingStreak(prev => {
      const next = prev + 1;
      if (next === 5) {
        onAwardXp(15, 'Compassionate Keeper ❤️');
        setPetActionText(`PETTING CHAMPION! ${currentPetName} is deeply grateful! +15 XP rewarded!`);
      }
      return next;
    });
  };

  const feedPet = (foodEmoji: string, name: string) => {
    setPetActionText(`${currentPetName} happily gobbles the ${foodEmoji} ${name}! "Chomp chomp! Yum!" 😋`);
  };

  const buyItem = (item: AccessoryItem) => {
    if (coinBalance < item.cost) {
      setPetActionText(`Oops! You need ${item.cost - coinBalance} more Star Coins to buy the ${item.emoji} ${item.name}! Complete more stories or watch videos!`);
      return;
    }

    const updatedCoins = coinBalance - item.cost;
    const updatedUnlocked = [...unlockedItems, item.id];

    onUpdateProfile({
      ...profile,
      coins: updatedCoins,
      unlockedItems: updatedUnlocked
    });

    setPetActionText(`Hooray! Purchased the ${item.emoji} ${item.name}! Now wear it inside your wardrobe! 🎉`);
  };

  const toggleItemEquip = (itemId: string) => {
    let nextEquipped = [...equippedItems];
    if (nextEquipped.includes(itemId)) {
      nextEquipped = nextEquipped.filter(id => id !== itemId);
      setPetActionText(`Took off the accessory.`);
    } else {
      // Find category of proposed item to ensure we only have 1 item per category
      const itemToEquip = ACCESSORY_SHOP.find(i => i.id === itemId);
      if (itemToEquip) {
        // Filter out same category items
        nextEquipped = nextEquipped.filter(id => {
          const checkItem = ACCESSORY_SHOP.find(i => i.id === id);
          return checkItem?.category !== itemToEquip.category;
        });
        nextEquipped.push(itemId);
        setPetActionText(`Voila! ${currentPetName} looks absolutely beautiful wearing the ${itemToEquip.emoji}!`);
      }
    }

    onUpdateProfile({
      ...profile,
      equippedItems: nextEquipped
    });
  };

  return (
    <div className="flex flex-col gap-6" id="mascot-wardrobe-interface">
      {/* COIN BALANCE DISPLAY BANNER */}
      <div className="bg-gradient-to-r from-amber-450 to-orange-550 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 mb-2">
            🪙 ENTERTAINMENT HUB: ACCUMULATE TREASURE
          </span>
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Coins size={24} className="animate-pulse" /> Pet Sanctuary & Wardrobe
          </h2>
          <p className="text-xs text-amber-50 opacity-95 mt-1 leading-relaxed">
            Adopt your very own customizable virtual learner friend! Earn gold coins as you finish trivia quizzes, study spelling, and read articles. Spend your riches below on cute magic hats, sunglasses, and toys!
          </p>
        </div>
        
        {/* BIG COIN HUD */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 text-center shrink-0 flex items-center gap-3">
          <span className="text-4xl animate-bounce">🪙</span>
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-amber-200 block">Star Coins</span>
            <span className="text-2xl font-black leading-tight">{coinBalance} Gold</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE MASCOT DISPLAY FRAME (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[410px] relative">
          
          <div className="w-full flex justify-between items-center z-10">
            {/* Adopt species toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1.5 rounded-2xl self-start">
              {MAIN_PET_SPECIES.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => handlePetChange(spec.id as any)}
                  className={`p-1 text-xs rounded-xl hover:scale-105 duration-100 ${
                    currentPetType === spec.id ? 'bg-orange-100 shadow-sm' : 'opacity-60'
                  }`}
                  title={`Adopt ${spec.name}`}
                >
                  <span className="text-xl">{spec.emoji}</span>
                </button>
              ))}
            </div>

            {/* Rename Button */}
            {!isEditingName ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[10px] font-black underline hover:text-orange-655 flex items-center gap-1 py-1"
                id="rename-pet-btn"
              >
                <Edit3 size={11} /> Rename Pet
              </button>
            ) : (
              <form onSubmit={handleRenamePet} className="flex items-center gap-1">
                <input
                  type="text"
                  maxLength={12}
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  className="px-2 py-1 text-xs border border-orange-200 rounded-xl max-w-[90px] font-bold outline-orange-400 bg-white text-slate-800"
                />
                <button type="submit" className="p-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold hover:bg-emerald-600">
                  <Check size={11} />
                </button>
              </form>
            )}
          </div>

          <div className="text-xs font-extrabold text-orange-800/90 bg-orange-50/70 px-3 py-1.5 rounded-full border border-orange-200 mt-1.5 z-10" id="pet-ownership-badge">
            🐾 {currentPetName} the Companion belongs to {profile.displayName}
          </div>

          {/* ACTIVE MASCOT LIVE CANVAS VIEW */}
          <div className="my-6 relative flex items-center justify-center w-48 h-48 bg-white border border-slate-150 rounded-full shadow-inner transform hover:scale-102 transition duration-300">
            {/* Active pet animation halo */}
            <div className="absolute inset-2 bg-gradient-to-b from-orange-50/30 to-rose-50/50 rounded-full animate-pulse" />
            
            {/* MAIN SPECIES BIG EMOJI CARRIER */}
            <span className="text-8xl select-none z-10 filter drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }}>
              {selectedSpecies.emoji}
            </span>

            {/* DYNAMIC EQUIPPED ACCESSORIES LAYER */}
            {equippedItems.map((itemId) => {
              const item = ACCESSORY_SHOP.find(i => i.id === itemId);
              if (!item) return null;
              return (
                <span
                  key={item.id}
                  className={`absolute select-none pointer-events-none z-20 font-sans leading-none drop-shadow ${item.styleOffset}`}
                >
                  {item.emoji}
                </span>
              );
            })}
          </div>

          {/* CUDDLES & TALK STATUS BAR */}
          <div className="w-full z-10">
            <div className="bg-orange-50/80 border border-orange-150/80 rounded-2xl px-4 py-3 min-h-[50px] mb-4 flex items-center justify-center">
              <p className="text-xs font-bold text-orange-900 leading-tight">
                {petActionText}
              </p>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={cuddlePet}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-[11px] rounded-xl border border-rose-150 flex flex-col items-center gap-1 cursor-pointer"
              >
                <Heart size={14} className="text-rose-500 fill-rose-500" />
                Cuddle Friend
              </button>

              <button
                onClick={() => feedPet('🍎', 'Crispy Apple')}
                className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[11px] rounded-xl border border-emerald-150 flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>🍎</span>
                Feed Apple
              </button>

              <button
                onClick={() => feedPet('🍪', 'Cookie Treat')}
                className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-black text-[11px] rounded-xl border border-amber-150 flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>🍪</span>
                Feed Cookie
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ACCESSORY SHOP & PLAY CLOSET GRID (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header Tabs with Toggle */}
            <div className="flex border-b border-slate-150 pb-3 mb-4 items-center justify-between gap-4">
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-150">
                <button
                  onClick={() => setActiveShopTab('shop')}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                    activeShopTab === 'shop'
                      ? 'bg-white text-orange-700 shadow-sm border border-slate-150/50'
                      : 'text-slate-500 hover:text-slate-750'
                  }`}
                >
                  <ShoppingBag size={12} className="inline mr-1" /> Token Shop
                </button>
                <button
                  onClick={() => setActiveShopTab('petting')}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                    activeShopTab === 'petting'
                      ? 'bg-white text-orange-700 shadow-sm border border-slate-150/50'
                      : 'text-slate-500 hover:text-slate-750'
                  }`}
                >
                  <Shirt size={12} className="inline mr-1" /> Closet Wardrobe
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {activeShopTab === 'shop' ? 'Adopt new apparel' : 'Dress up Chippy!'}
              </span>
            </div>

            {/* TAB CONTENT 1: STORE ITEMS SHOP */}
            <AnimatePresence mode="wait">
              {activeShopTab === 'shop' ? (
                <motion.div
                  key="shop-grid"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {ACCESSORY_SHOP.map((item) => {
                    const hasUnlocked = unlockedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 group transition ${
                          hasUnlocked ? 'bg-slate-50/50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-4xl bg-orange-50/50 p-1.5 rounded-xl group-hover:scale-105 transition-transform">
                            {item.emoji}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                              {item.description}
                            </p>
                            <span className="text-[10px] font-black tracking-tight text-amber-600 flex items-center gap-0.5 mt-1">
                              🪙 {item.cost} Coins
                            </span>
                          </div>
                        </div>

                        {hasUnlocked ? (
                          <span className="text-[10px] text-slate-400 font-extrabold px-2 py-1 bg-slate-100 rounded-lg border border-slate-200">
                            Bought
                          </span>
                        ) : (
                          <button
                            onClick={() => buyItem(item)}
                            className="text-[10px] cursor-pointer font-black bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-3 py-1.5 rounded-xl transition shadow-sm hover:shadow"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                /* TAB CONTENT 2: PERSONAL CLOSET WARDROBE (Equip / Unequip unlocked stuff) */
                <motion.div
                  key="closet-grid"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {unlockedItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold">Your wardrobe closet is empty! Go browse the Token Shop and buy outfits.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                      {ACCESSORY_SHOP.filter(item => unlockedItems.includes(item.id)).map((item) => {
                        const isEquipped = equippedItems.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 group transition ${
                              isEquipped ? 'bg-orange-50/40 border-orange-250 ring-2 ring-orange-100' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-4xl bg-slate-50 p-1.5 rounded-xl">
                                {item.emoji}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                                  {item.name}
                                </h4>
                                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                  Category: {item.category}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleItemEquip(item.id)}
                              className={`text-[10px] cursor-pointer font-black px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 ${
                                isEquipped 
                                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-150'
                              }`}
                            >
                              {isEquipped ? 'Take Off X' : 'Wear Outfit 👔'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* HELP HINT TIP ROW */}
          <div className="mt-6 border-t border-slate-100 pt-4 flex items-start gap-2 text-[10px] text-slate-400 font-semibold leading-relaxed">
            <HelpCircle size={14} className="text-orange-400 shrink-0 mt-0.5" />
            <p>
              Your virtual pet companions are persistent. Each unlocked magical cosmetic will immediately be wearable across all profiles. Keep studying to collect infinite Star Coins!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
