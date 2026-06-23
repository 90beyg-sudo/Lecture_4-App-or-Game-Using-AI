import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATAR_OPTIONS } from './AvatarSelector';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, CornerDownRight, ShieldAlert, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Navigation states: 'landing' | 'signup' | 'social-setup' | 'login-email'
  const [subView, setSubView] = useState<'landing' | 'signup' | 'login-email'>('landing');
  
  // Signup State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [ageStr, setAgeStr] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('owl');
  const [avatarEmoji, setAvatarEmoji] = useState('🦉');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');

  // Errors / Messaging state
  const [errorMsg, setErrorMsg] = useState('');
  const [isTooOld, setIsTooOld] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pick Avatar helper
  const handleSelectAvatar = (id: string, emoji: string) => {
    setSelectedAvatarId(id);
    setAvatarEmoji(emoji);
  };

  // Mock social login process (takes them to age verification to complete onboarding)
  const handleSocialGoogleLogin = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsLoading(false);
      // Generate standard names to make initial input fields super easy/fun
      const mockNames = ['Mia the Astrogazer 🪐', 'Leo Galaxy Cadet ☄️', 'Luna Starfinder ⭐', 'Nebula Rover 🛸'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      setDisplayName(randomName);
      setEmail('explorer.' + Math.random().toString(36).substring(7) + '@gmail.com');
      // Go to signup view to entering age and select avatar
      setSubView('signup');
    }, 700);
  };

  // Process SignUp with age-gated logic
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsTooOld(false);

    if (!displayName.trim()) {
      setErrorMsg('Please choose a legendary display name!');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid explorer email address.');
      return;
    }

    const age = parseInt(ageStr, 10);
    if (isNaN(age) || age <= 0) {
      setErrorMsg('Please enter a valid age number.');
      return;
    }

    // Age blocker rule: only strictly under 16
    if (age >= 16) {
      setIsTooOld(true);
      return;
    }

    // Success! Map profile with personalized initialized information
    const personalizedBio = `I am a ${age} year old space explorer on SpaceHub! Let's discover amazing things together.`;
    
    const newProfile: UserProfile = {
      id: 'cadet-' + Math.random().toString(36).substring(2, 6),
      displayName: displayName.trim(),
      avatarUrl: avatarEmoji,
      bio: personalizedBio,
      favoriteTopic: 'science-facts',
      xpPoints: 120, // start with welcome XP!
      badges: ['Star Cadet 🎖️'],
      addedVideos: [
        {
          id: 'onboard-vid',
          title: 'Solar System 101 | National Geographic Kids',
          youtubeId: 'libKVRa01L8',
          category: 'education',
          subcategory: 'science-facts',
          description: 'A great starter astronomy adventure shared globally.',
          addedBy: displayName.trim(),
          createdAt: new Date().toISOString()
        }
      ],
      posts: [
        {
          id: 'welcome-post',
          title: `Mission Brief: Arrived in SpaceHub! 👋`,
          content: `Hi everyone! I just landed in SpaceHub. I am ${age} years old and super excited to read cosmic articles, train my language on the Vocabulary Board, and feed my pet companion. Spot you around!`,
          createdAt: new Date().toISOString(),
          moodEmoji: '🚀',
          authorName: displayName.trim()
        }
      ],
      customBannerColor: 'from-indigo-600 via-purple-600 to-pink-500',
      coins: 150, // Welcome star coins to feed or buy toys for mascot
      petType: 'owl',
      petName: 'Nova',
      unlockedItems: ['toy-ball'],
      equippedItems: [],
      claimedChests: [],
      readArticles: [],
      completedVideos: [],
      email: email.trim(),
      age: age
    };

    onLoginSuccess(newProfile);
  };

  // Mock standard email login for existing profiles
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMsg('Please verify your email address format (need @).');
      return;
    }

    // Simulating instant authorization for existing profiles or auto-generates a lovely profile for them
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // Determine user name from email
      const usernamePart = loginEmail.split('@')[0];
      const stylizedName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1) + ' Explorer 🪐';

      const existingProfile: UserProfile = {
        id: 'user-' + Math.random().toString(36).substring(2, 6),
        displayName: stylizedName,
        avatarUrl: '🚀',
        bio: `Excited learner, age 11. Welcome back to my star-deck on SpaceHub!`,
        favoriteTopic: 'science-facts',
        xpPoints: 180,
        badges: ['Star Cadet 🎖️', 'Quiz Whiz 🧠'],
        addedVideos: [],
        posts: [
          {
            id: 'returning-post',
            title: `Explorer log: Returned to orbit! ✨`,
            content: `Engaging solar shields. Starting study video curation. Ready to learn more today!`,
            createdAt: new Date().toISOString(),
            moodEmoji: '🛸',
            authorName: stylizedName
          }
        ],
        customBannerColor: 'from-indigo-600 via-purple-600 to-pink-550',
        coins: 240,
        petType: 'panda',
        petName: 'Barnaby',
        unlockedItems: ['toy-ball'],
        equippedItems: [],
        claimedChests: [],
        readArticles: [],
        completedVideos: [],
        email: loginEmail.trim(),
        age: 11
      };

      onLoginSuccess(existingProfile);
    }, 600);
  };

  return (
    <div 
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #201a4e 0%, #030712 70%)'
      }}
    >
      {/* Absolute floating cosmic items */}
      <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-purple-600/10 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      {/* Stars Layer */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Header Container */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg">
            🚀
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              SPACEHUB
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold">Kids Safe Knowledge Platform</p>
          </div>
        </div>
        <div className="flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
          <span className="text-[10px] font-bold text-slate-300">Under-16 Safe Zones Active</span>
        </div>
      </header>

      {/* Main Authenticators Deck */}
      <main className="flex-1 flex items-center justify-center p-4 min-h-[480px] z-10 relative">
        <AnimatePresence mode="wait">
          
          {/* Subview 1: Landing / Standard Selection */}
          {subView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col gap-6 text-center"
            >
              <div>
                <span className="inline-block text-4xl mb-4 animate-bounce duration-1000">🧑‍🚀</span>
                <h2 className="text-2xl font-black tracking-tight text-white">Join the Mission</h2>
                <p className="text-xs text-slate-350 mt-2 max-w-xs mx-auto leading-relaxed">
                  Discover, Learn, and Share the Universe of Knowledge under cosmic safe flight.
                </p>
              </div>

              {/* Login Button Deck */}
              <div className="flex flex-col gap-3 pt-3">
                
                {/* Mock Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleSocialGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-xs transition duration-200 shadow bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-80 shrink-0 border-0"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.92-2.76 3.51-4.51 6.76-4.51z"></path>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.57l3.71 2.87c2.17-2 3.42-4.94 3.42-8.54z"></path>
                    <path fill="#FBBC05" d="M5.24 14.73C5.01 14.01 4.9 13.26 4.9 12.5s.11-1.51.34-2.23l-3.85-2.99C.53 9.07 0 10.73 0 12.5s.53 3.43 1.39 5.22l3.85-2.99z"></path>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.87c-1.03.69-2.36 1.1-3.85 1.1-3.25 0-5.84-1.75-6.76-4.51l-3.85 2.99C3.37 20.35 7.35 23 12 23z"></path>
                  </svg>
                  <span>{isLoading ? 'Booting engine...' : 'Continue with Google Account'}</span>
                </button>

                {/* Email Sign Up Option */}
                <button
                  type="button"
                  onClick={() => setSubView('signup')}
                  className="w-full py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-slate-800/40 hover:bg-slate-800/60 font-black text-xs text-indigo-200 transition duration-150 cursor-pointer flex items-center justify-center gap-2"
                >
                  📝 Create Explorer Email Profile
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">or existing pilots</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Email Login Option */}
                <button
                  type="button"
                  onClick={() => setSubView('login-email')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 bg-slate-950/40 hover:bg-slate-950/60 border border-white/5 rounded-xl"
                >
                  🔑 Sign In with Registered Email
                </button>
              </div>

              {/* Safety notice */}
              <div className="mt-2 text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1 bg-white/5 rounded-xl p-2.5">
                <span>🛡️</span>
                <p>Closed community built natively for child education & discovery.</p>
              </div>
            </motion.div>
          )}

          {/* Subview 2: Onboarding Signup & Age Verification */}
          {subView === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col gap-5"
            >
              {/* Back CTA */}
              <button
                type="button"
                onClick={() => {
                  setSubView('landing');
                  setErrorMsg('');
                  setIsTooOld(false);
                }}
                className="self-start text-[11px] font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 mb-2 cursor-pointer bg-transparent border-0"
              >
                <ArrowLeft size={12} />
                <span>Return to Launch Deck</span>
              </button>

              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>🛰️</span>
                  <span>Set Up Explorer Profile</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  Almost ready to orbit! Tell us about your role.
                </p>
              </div>

              {/* Error messages block */}
              {errorMsg && (
                <div id="signup-form-error" className="p-3.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-semibold flex items-start gap-2">
                  <span>⚠️</span>
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Age Restriction Filter Overlay */}
              {isTooOld ? (
                <div id="age-restriction-overlay" className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-600/5 border border-amber-500/30 flex flex-col gap-3.5 text-center items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl text-amber-40 level-glow">
                    🚧
                  </div>
                  <h3 className="text-sm font-bold text-amber-200">Space Explorer Age Warning</h3>
                  <p className="text-xs text-amber-100/80 leading-relaxed font-semibold">
                    "SpaceHub is specially designed for explorers under the age of 16."
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    This platform restricts user accounts above 16 to uphold child-centric storytelling, STEM puzzles, and safe cartoon streams.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTooOld(false);
                      setAgeStr('');
                    }}
                    className="mt-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition cursor-pointer"
                  >
                    Modify Age Input
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                  {/* Nickname */}
                  <div>
                    <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Explorer Code / Display Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Astro Scientist Mia"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full text-xs p-3 bg-slate-950/60 border border-white/10 hover:border-white/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Explorer Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. mia@cosmic.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full text-xs p-3 bg-slate-950/60 border border-white/10 hover:border-white/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 transition"
                    />
                  </div>

                  {/* Age Input */}
                  <div>
                    <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Enter Your Age (Verification)</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 11"
                      min={1}
                      max={99}
                      value={ageStr}
                      onChange={(e) => {
                        setAgeStr(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full text-xs p-3 bg-slate-950/60 border border-white/10 hover:border-white/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 transition"
                    />
                  </div>

                  {/* Avatar selection */}
                  <div>
                    <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Pick Your Companion Emblem</label>
                    <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-slate-950/45 rounded-2xl border border-white/5">
                      {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = selectedAvatarId === avatar.id;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => handleSelectAvatar(avatar.id, avatar.emoji)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition duration-150 cursor-pointer border-0 ${
                              isSelected ? 'bg-indigo-650/50 ring-2 ring-indigo-500 scale-105 shadow-lg' : 'bg-transparent hover:bg-white/5'
                            }`}
                          >
                            <span className="text-xl">{avatar.emoji}</span>
                            <span className="text-[8px] text-slate-400 mt-1 truncate w-12 font-bold text-center">{avatar.label.split(' ')[1] || avatar.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Trigger submit */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs rounded-xl text-white transition duration-150 flex items-center justify-center gap-1.5 shadow-lg cursor-pointer shrink-0 mt-3 border-0"
                  >
                    <span>Launch Into Orbit! ✨</span>
                    <ArrowRight size={13} className="animate-pulse" />
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* Subview 3: Login via Registered Email */}
          {subView === 'login-email' && (
            <motion.div
              key="login-email"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col gap-5"
            >
              {/* Back CTA */}
              <button
                type="button"
                onClick={() => {
                  setSubView('landing');
                  setErrorMsg('');
                }}
                className="self-start text-[11px] font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 mb-2 cursor-pointer bg-transparent border-0"
              >
                <ArrowLeft size={12} />
                <span>Return to Launch Deck</span>
              </button>

              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>🔑</span>
                  <span>Pilot Sign In</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your registered SpaceHub email code to unlock your custom pet.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-semibold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <p>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Registered Email</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. barnaby@explorer.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full text-xs p-3 bg-slate-950/60 border border-white/10 hover:border-white/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs rounded-xl text-white transition duration-150 flex items-center justify-center gap-1.5 shadow-lg cursor-pointer shrink-0 mt-3 border-0"
                >
                  <span>{isLoading ? 'Decrypting credentials...' : 'Resume Space Flight 🚀'}</span>
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer copyright decoratives */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-[10px] text-slate-500 font-semibold z-10 relative">
        <p>© 2026 SpaceHub Safe-Social System • Proudly Powered by Antigravity Engines • For explorers under 16</p>
      </footer>
    </div>
  );
};
