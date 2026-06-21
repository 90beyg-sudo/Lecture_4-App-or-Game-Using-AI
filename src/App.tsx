import React, { useState, useEffect } from 'react';
import { UserProfile, Video, Post, FriendProfile } from './types';
import { CategoryHub } from './components/CategoryHub';
import { ProfileFeed } from './components/ProfileFeed';
import { VideoPlayer } from './components/VideoPlayer';
import { decodeProfile, generateShareUrl } from './utils/sharing';
import { PRESET_VIDEOS } from './data/categories';
import { 
  Compass, User, Users, GraduationCap, Sparkles, Award, 
  Trash2, ArrowLeft, RefreshCw, Star, Info, Moon, Sun, Check, BookOpen, Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyBoard } from './components/VocabularyBoard';
import { ReadingCorner } from './components/ReadingCorner';
import { MascotWardrobe } from './components/MascotWardrobe';
import { AdventureTrail } from './components/AdventureTrail';
import { MiniGames } from './components/MiniGames';

// Default pre-populated, kid-pleasant profile for first-time loaders
const INITIAL_MY_PROFILE: UserProfile = {
  id: 'me-' + Math.random().toString(36).substr(2, 5),
  displayName: 'Future Scientist 🚀',
  avatarUrl: '🦉',
  bio: 'I love exploring deep ocean mysteries, doing cool paper origami, and learning mind-boggling trivia!',
  favoriteTopic: 'science-space',
  xpPoints: 120,
  badges: ['Early Explorer 📜'],
  addedVideos: [
    {
      id: 'custom-init-1',
      title: 'Solar System 101 | National Geographic Kids',
      youtubeId: 'libKVRa01L8',
      category: 'education',
      subcategory: 'science-space',
      description: 'Check out the amazing planets orbiting our sun, from scorching Mercury to icy Neptune!',
      addedBy: 'Future Scientist 🚀',
      createdAt: new Date().toISOString()
    }
  ],
  posts: [
    {
      id: 'post-init-1',
      title: 'Welcome to My Wall! 👋',
      content: 'Hey other learners! This is my safe profile feed. I am keeping my favorite science and craft videos here. Let\'s explore some brain riddles together!',
      createdAt: new Date().toISOString(),
      moodEmoji: '😊',
      authorName: 'Future Scientist 🚀'
    }
  ],
  customBannerColor: 'from-purple-500 via-indigo-600 to-blue-700',
  coins: 150,
  petType: 'dragon',
  petName: 'Chippy',
  unlockedItems: ['toy-ball'],
  equippedItems: [],
  claimedChests: [],
  readArticles: [],
  completedVideos: []
};

const DEFAULT_AVATARS = ['🦉', '🚀', '🤖', '🦊', '🦖', '🦄', '🐨', '🐿️'];

export default function App() {
  // Navigation states: 'streams' | 'profile' | 'friends' | 'vocab' | 'reading' | 'mascot' | 'trail' | 'games'
  const [activeTab, setActiveTab] = useState<'streams' | 'profile' | 'friends' | 'vocab' | 'reading' | 'mascot' | 'trail' | 'games'>('streams');
  
  // Profile states
  const [myProfile, setMyProfile] = useState<UserProfile>(INITIAL_MY_PROFILE);
  const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
  const [savedFriends, setSavedFriends] = useState<{ id: string; name: string; avatar: string; payload: string }[]>([]);
  
  // Active Watch video overlay state
  const [activeWatchVideo, setActiveWatchVideo] = useState<Video | null>(null);
  
  // Global XP notification state
  const [xpNotification, setXpNotification] = useState<{ show: boolean; msg: string; amt: number } | null>(null);

  // Dynamic Kid Social Interactive Hub Branding Name Options
  const BRANDING_OPTIONS = [
    { id: 'spacehub', name: 'SPACE-HUB', tag: 'Interactive Space, Science & Shared Profile Base 🚀', emoji: '🚀', bg: 'bg-purple-600', textColor: 'text-purple-650', hoverBg: 'hover:bg-purple-50/50' },
    { id: 'wonderpulse', name: 'WONDER-PULSE', tag: 'Creative Kids Discovery & Profile Hub ✨', emoji: '✨', bg: 'bg-indigo-650', textColor: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50/50' },
    { id: 'kidnexus', name: 'KIDNEXUS', tag: 'Interactive Social Study Club 🌌', emoji: '🌌', bg: 'bg-violet-650', textColor: 'text-violet-650', hoverBg: 'hover:bg-violet-50/50' },
    { id: 'curiospace', name: 'CURIO-SPACE', tag: 'Safe Exploration & Learning Adventure Spot 🧩', emoji: '🧩', bg: 'bg-amber-500', textColor: 'text-amber-650', hoverBg: 'hover:bg-amber-50/50' },
    { id: 'campfire', name: 'CAMPFIRE HUB', tag: 'Social Study & Joint Journal Spot 🔥', emoji: '🔥', bg: 'bg-rose-500', textColor: 'text-rose-600', hoverBg: 'hover:bg-rose-50/50' }
  ];

  const [activeBrandingIdx, setActiveBrandingIdx] = useState(() => {
    const saved = localStorage.getItem('kidtube_branding_idx');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < 5) return parsed;
    }
    return 0; // default is WONDER-PULSE
  });

  const activeBranding = BRANDING_OPTIONS[activeBrandingIdx];

  const handleSetBranding = (index: number) => {
    setActiveBrandingIdx(index);
    localStorage.setItem('kidtube_branding_idx', index.toString());
    toastNotification(10, `Hub vibe changed to ${BRANDING_OPTIONS[index].name}! ${BRANDING_OPTIONS[index].emoji}`);
  };

  // Load from LocalStorage and coordinate URL parameters on mount
  useEffect(() => {
    // 1. Load active profile
    const savedMe = localStorage.getItem('kidtube_my_profile');
    if (savedMe) {
      try {
        setMyProfile(JSON.parse(savedMe));
      } catch (e) {
        console.error('Failed to parse my profile from storage:', e);
      }
    } else {
      localStorage.setItem('kidtube_my_profile', JSON.stringify(INITIAL_MY_PROFILE));
    }

    // 2. Load stored friends snapshot
    const savedFriendsList = localStorage.getItem('kidtube_saved_friends');
    if (savedFriendsList) {
      try {
        setSavedFriends(JSON.parse(savedFriendsList));
      } catch (e) {
        console.error('Failed to parse saved friends list:', e);
      }
    }

    // 3. Scan URL for sharedProfile queries
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get('sharedProfile');
    if (sharedPayload) {
      const decoded = decodeProfile(sharedPayload);
      if (decoded) {
        setFriendProfile(decoded);
        setActiveTab('profile'); // Automatically route to profile view to examine friend
      }
    }
  }, []);

  // Sync My Profile state to localStorage on modifications
  const handleUpdateMyProfile = (updatedProfile: UserProfile) => {
    setMyProfile(updatedProfile);
    localStorage.setItem('kidtube_my_profile', JSON.stringify(updatedProfile));
  };

  // Switch visitors back inside their own timeline
  const handleBackToMyProfile = () => {
    setFriendProfile(null);
    setActiveTab('streams');
    // Clear the URL share parameter without reloading the page
    const baseUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, baseUrl);
  };

  // Import a friend profile into local quick select list
  const handleSaveFriendToNetwork = () => {
    if (!friendProfile) return;
    
    // Check if friend is already saved
    const exists = savedFriends.some(f => f.id === friendProfile.id);
    if (exists) {
      toastNotification(5, 'Already added to friends network! ❤️');
      return;
    }

    // Capture complete encoded Base64 payload
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get('sharedProfile') || '';
    
    if (!sharedPayload) return;

    const newFriendEntry = {
      id: friendProfile.id,
      name: friendProfile.displayName,
      avatar: friendProfile.avatarUrl,
      payload: sharedPayload
    };

    const updatedList = [newFriendEntry, ...savedFriends];
    setSavedFriends(updatedList);
    localStorage.setItem('kidtube_saved_friends', JSON.stringify(updatedList));
    
    toastNotification(20, `Added "${friendProfile.displayName}" to Friends List! 💌`);
    handleAwardXp(15, 'Sociable Friend 🌟'); // Reward them for connecting!
  };

  // Remove a friend from stored networking
  const handleDeleteFromNetwork = (friendId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = savedFriends.filter(f => f.id !== friendId);
    setSavedFriends(updatedList);
    localStorage.setItem('kidtube_saved_friends', JSON.stringify(updatedList));
  };

  // Load a friend profile snapshot from the local network list
  const handleLoadSavedFriend = (friendPayload: string) => {
    const decoded = decodeProfile(friendPayload);
    if (decoded) {
      setFriendProfile(decoded);
      setActiveTab('profile');
      
      // Update URL search parameters safely
      const baseUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, `${baseUrl}?sharedProfile=${friendPayload}`);
    }
  };

  // Interactive Award XP Helper (pop a beautiful floating alert card)
  const handleAwardXp = (amount: number, badgeName?: string) => {
    // 1. Calculate new XP
    const updatedXp = myProfile.xpPoints + amount;
    const currentLvl = Math.floor(myProfile.xpPoints / 100) + 1;
    const newLvl = Math.floor(updatedXp / 100) + 1;

    let updatedBadges = [...myProfile.badges];
    if (badgeName && !updatedBadges.includes(badgeName)) {
      updatedBadges.push(badgeName);
    }

    // Celebrate level ups
    if (newLvl > currentLvl) {
      updatedBadges.push(`Level ${newLvl} Scholar 🔮`);
      toastNotification(50, `LEVEL UP! Welcome to Level ${newLvl}! 🎉`);
    }

    // Award 2 Star Coins for every 1 XP point!
    const updatedCoins = (myProfile.coins !== undefined ? myProfile.coins : 150) + (amount * 2);

    handleUpdateMyProfile({
      ...myProfile,
      xpPoints: updatedXp,
      badges: updatedBadges,
      coins: updatedCoins
    });

    toastNotification(amount, badgeName ? `Unlocked Badge: ${badgeName}` : 'Keep up the curious mind!');
  };

  // Trigger floating temporary notification
  const toastNotification = (amount: number, message: string) => {
    setXpNotification({
      show: true,
      msg: message,
      amt: amount
    });
    setTimeout(() => {
      setXpNotification(null);
    }, 4000);
  };

  // Pin any streaming video to My custom video shelf with 1-click
  const handlePinVideoToShelf = (video: Video) => {
    const alreadyPinned = myProfile.addedVideos.some(v => v.youtubeId === video.youtubeId);
    if (alreadyPinned) return;

    const pinnedVideo: Video = {
      ...video,
      id: 'vid-' + Math.random().toString(36).substr(2, 9),
      addedBy: myProfile.displayName,
      createdAt: new Date().toISOString()
    };

    handleUpdateMyProfile({
      ...myProfile,
      addedVideos: [pinnedVideo, ...myProfile.addedVideos]
    });
    
    handleAwardXp(10, 'Keeper of Mysteries 📌'); // Curation points
  };

  // Inline Note Save Post callback inside active watch window
  const handleAddPostFromNotes = (postInput: Omit<Post, 'id' | 'createdAt' | 'authorName'>) => {
    const newPost: Post = {
      id: 'post-' + Math.random().toString(36).substr(2, 9),
      ...postInput,
      createdAt: new Date().toISOString(),
      authorName: myProfile.displayName
    };

    handleUpdateMyProfile({
      ...myProfile,
      posts: [newPost, ...myProfile.posts]
    });
  };

  // Extract list of all custom shelf-videos so they appear blended inside Category streams
  const customVideosInStreams = myProfile.addedVideos;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans antialiased text-slate-705" id="youth-kids-applet-root">
      
      {/* GLOBAL LEVEL UP/XP TOAST ALERTER */}
      <AnimatePresence>
        {xpNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3.5 max-w-sm pointer-events-none"
            id="global-xp-badge-alert"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 flex items-center justify-center font-black text-sm shrink-0">
              +{xpNotification.amt}
            </div>
            <div>
              <h4 className="font-black text-xs text-amber-400 uppercase tracking-widest leading-none">XP Points Earned!</h4>
              <p className="font-semibold text-xs mt-1 text-slate-100">{xpNotification.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEDICATED VISITING BANNERS (If visiting a friend) */}
      {friendProfile && (
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white text-center py-3 px-4 flex flex-wrap items-center justify-center gap-3 relative z-30" id="friend-visitor-announcement">
          <span className="text-xs md:text-sm font-bold flex items-center gap-1.5">
            <GraduationCap size={16} /> You are exploring <strong>{friendProfile.displayName}'s</strong> custom Knowledge Tube! 👋
          </span>
          <div className="flex gap-2">
            <button
              id="friend-import-btn"
              onClick={handleSaveFriendToNetwork}
              className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 font-extrabold text-[10px] md:text-xs rounded-lg shadow-sm transition cursor-pointer"
            >
              ❤️ Save to Friends List
            </button>
            <button
              id="friend-return-home-btn"
              onClick={handleBackToMyProfile}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 font-extrabold text-[10px] md:text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={10} /> Back to My Hub
            </button>
          </div>
        </div>
      )}

      {/* MAIN TOP HEADER BAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between" id="applet-primary-header">
        
        {/* Custom Kids Social Interactive Hub Logo & Live Name Selector */}
        <div className="flex items-center gap-3.5" id="applet-logo-branding">
          <div className={`w-10 h-10 ${activeBranding.bg} transition-colors duration-500 rounded-xl flex items-center justify-center text-white text-xl shadow-sm font-black`}>
            {activeBranding.emoji}
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Dynamic Selective Title with inline toggle click */}
              <div className="relative group">
                <select
                  value={activeBrandingIdx}
                  onChange={(e) => handleSetBranding(Number(e.target.value))}
                  className={`font-black text-base md:text-lg tracking-tight bg-slate-55/60 border border-slate-200 rounded-lg py-0.5 px-2 text-slate-800 focus:outline-none cursor-pointer hover:border-purple-300 transition-all uppercase`}
                >
                  {BRANDING_OPTIONS.map((opt, oidx) => (
                    <option key={opt.id} value={oidx} className="font-extrabold text-xs">
                      {opt.emoji} {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[9px] bg-slate-100 text-slate-600 font-black px-1.5 py-0.5 rounded-md border border-slate-200 uppercase tracking-widest">
                Interactive Hub 💬
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 block max-w-[280px] xs:max-w-none truncate transition-colors duration-500">
              {activeBranding.tag}
            </p>
          </div>
        </div>

        {/* Profile overview bar or Friend selection */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 pr-3 rounded-2xl cursor-pointer transition hidden sm:flex animate-fade-in"
            id="header-mini-profile"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${myProfile.customBannerColor} flex items-center justify-center text-xl text-white shadow-sm`}>
              {myProfile.avatarUrl}
            </div>
            <div className="text-left leading-none">
              <h4 className="text-xs font-extrabold text-slate-700 truncate max-w-[100px]">{myProfile.displayName}</h4>
              <span className="text-[9px] font-bold text-blue-600">{myProfile.xpPoints} XP • Lvl {Math.floor(myProfile.xpPoints / 100) + 1}</span>
            </div>
          </div>

          {/* Quick link to explore Streams */}
          <button
            id="quick-explore-header-btn"
            onClick={() => { setFriendProfile(null); setActiveTab('streams'); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer hidden md:flex items-center gap-1.5"
          >
            <GraduationCap size={14} /> Knowledge Streams
          </button>
        </div>
      </header>

      {/* MASTER CORE LAYOUT SPLIT */}
      <div className="flex-1 flex flex-col md:flex-row" id="applet-grid-body">
        
        {/* SIDEBAR NAVIGATION CONTROL (Sleek geometric balance menu) */}
        <nav className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible scrollbar-none" id="applet-sidebar-nav">
          
          <div className="text-[10px] tracking-wider font-extrabold text-slate-400 uppercase mb-1 px-2 hidden md:block">Navigation Channels</div>

          <button
            id="tab-stream-channels"
            onClick={() => { setFriendProfile(null); setActiveTab('streams'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'streams' && !friendProfile
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Compass size={18} className={activeTab === 'streams' && !friendProfile ? 'text-blue-600' : 'text-slate-400'} />
            <span>Graduate Streams</span>
          </button>

          <button
            id="tab-my-timeline"
            onClick={() => { setFriendProfile(null); setActiveTab('profile'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'profile' && !friendProfile
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <User size={18} className={activeTab === 'profile' && !friendProfile ? 'text-blue-600' : 'text-slate-400'} />
            <span>My Profile Wall</span>
          </button>

          <button
            id="tab-friends-timeline"
            onClick={() => setActiveTab('friends')}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'friends'
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Users size={18} className={activeTab === 'friends' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="flex-1 text-left font-black">Friends Directory</span>
            {savedFriends.length > 0 && (
              <span className="bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full text-[9px]">
                {savedFriends.length}
              </span>
            )}
          </button>

          <button
            id="tab-vocabulary-booster"
            onClick={() => { setFriendProfile(null); setActiveTab('vocab'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'vocab'
                ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <BookOpen size={18} className={activeTab === 'vocab' ? 'text-purple-650' : 'text-slate-400'} />
            <span className="flex-1 text-left font-black">Vocab Blackboard</span>
          </button>

          <button
            id="tab-reading-corner"
            onClick={() => { setFriendProfile(null); setActiveTab('reading'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'reading'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <BookOpen size={18} className={activeTab === 'reading' ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="flex-1 text-left font-black">Reading Corner</span>
          </button>

          <button
            id="tab-mascot-wardrobe"
            onClick={() => { setFriendProfile(null); setActiveTab('mascot'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'mascot'
                ? 'bg-orange-50 text-orange-700 border border-orange-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Sparkles size={18} className={activeTab === 'mascot' ? 'text-orange-550' : 'text-slate-400'} />
            <span className="flex-1 text-left font-black">Mascot Wardrobe</span>
            <span className="bg-orange-100 text-orange-850 font-black px-1.5 py-0.5 rounded-full text-[8px] uppercase">
              Pet 🦄
            </span>
          </button>

          <button
            id="tab-adventure-trail"
            onClick={() => { setFriendProfile(null); setActiveTab('trail'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'trail'
                ? 'bg-sky-50 text-sky-700 border border-sky-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Compass size={18} className={activeTab === 'trail' ? 'text-sky-650' : 'text-slate-400'} />
            <span className="flex-1 text-left font-black">Adventure Trail</span>
            <span className="bg-sky-100 text-sky-850 font-black px-1.5 py-0.5 rounded-full text-[8px] uppercase animate-pulse">
              Map
            </span>
          </button>

          <button
            id="tab-mini-games"
            onClick={() => { setFriendProfile(null); setActiveTab('games'); }}
            className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition cursor-pointer shrink-0 ${
              activeTab === 'games'
                ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Gamepad2 size={18} className={activeTab === 'games' ? 'text-purple-650' : 'text-slate-400'} />
            <span className="flex-1 text-left font-black">Mini-Arcade</span>
            <span className="bg-purple-100 text-purple-850 font-black px-1.5 py-0.5 rounded-full text-[8px] uppercase">
              Play 🎮
            </span>
          </button>

          {/* Stored Quick Select Friends row */}
          {savedFriends.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 hidden md:flex flex-col gap-2 animate-fade-in">
              <div className="text-[10px] tracking-wider font-extrabold text-slate-400 uppercase px-2 mb-1">Quick Visits</div>
              {savedFriends.map((f) => (
                <button
                  key={f.id}
                  id={`quick-friend-visit-${f.id}`}
                  onClick={() => handleLoadSavedFriend(f.payload)}
                  className={`w-full p-1.5 rounded-xl text-left hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 border ${
                    friendProfile?.id === f.id ? 'border-blue-300 bg-blue-50/20' : 'border-transparent'
                  }`}
                >
                  <span className="text-xl shrink-0 p-1 bg-slate-50 rounded-lg">{f.avatar}</span>
                  <div className="text-left leading-tight overflow-hidden">
                    <h5 className="text-[11px] font-bold text-slate-700 truncate">{f.name}</h5>
                    <span className="text-[9px] text-slate-400 font-medium">Click to study</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Design-System Gradient Promo Panel */}
          <div className="mt-auto pt-6 hidden md:block">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-xl text-white text-center shadow-sm">
              <p className="text-xs font-bold mb-1 uppercase tracking-widest">Knowledge Hub</p>
              <p className="text-[10px] opacity-90 leading-tight">Share your profile wall with classmates!</p>
              <button 
                onClick={() => {
                  const url = generateShareUrl(myProfile);
                  navigator.clipboard.writeText(url);
                  toastNotification(15, "Copied your profile link! Send to friends to build a network! 🚀");
                  handleAwardXp(10, "Super Connector 🔗");
                }}
                className="mt-3 w-full bg-white text-blue-600 hover:bg-blue-50 hover:scale-[1.02] transition duration-200 text-xs font-bold py-2 rounded-lg cursor-pointer"
              >
                Copy Link
              </button>
            </div>
          </div>
        </nav>

        {/* COMPONENT STREAM DISPATCHER */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full" id="applet-main-stage">
          
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: KNOWLEDGE EXPLORER */}
            {activeTab === 'streams' && (
              <motion.div
                key="streams-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <CategoryHub
                  currentProfile={myProfile}
                  customAddedVideos={customVideosInStreams}
                  onWatchVideo={(v) => { setActiveWatchVideo(v); handleAwardXp(5); }} // Get 5 XP for clicking and opening to watch!
                  onPinVideoToShelf={handlePinVideoToShelf}
                  onUpdateProfile={handleUpdateMyProfile}
                  onAwardXp={handleAwardXp}
                />
              </motion.div>
            )}

            {/* VIEW 2: PROFILE FEED WALL (Active or friend) */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ProfileFeed
                  profile={friendProfile || myProfile}
                  isOwnProfile={!friendProfile}
                  onUpdateProfile={handleUpdateMyProfile}
                  onWatchVideo={(v) => { setActiveWatchVideo(v); handleAwardXp(5); }}
                  onAwardXp={handleAwardXp}
                  savedFriends={savedFriends}
                />
              </motion.div>
            )}

            {/* VIEW 3: FRIENDS LIST NETWORK INDEX */}
            {activeTab === 'friends' && (
              <motion.div
                key="friends-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Users size={24} className="text-indigo-600" /> Stored Friends List Networks
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    When friends share their profile links with you, they'll decode in your App! You can save them here to easily watch their favorite videos, look at notes they write, or check their updated XP scores anytime offline!
                  </p>
                </div>

                {savedFriends.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-slate-150 text-center flex flex-col items-center justify-center gap-3">
                    <span className="text-4xl">💌</span>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm md:text-base">Your friends directory is currently empty</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                        To add friends, ask a classmate for their customized profile sharing link. Once you open their link inside your browser, tap the <strong>"Save to Friends List"</strong> button!
                      </p>
                    </div>
                    <button
                      id="share-my-profile-demo-btn"
                      onClick={() => {
                        setActiveTab('profile');
                        setTimeout(() => {
                          const url = generateShareUrl(myProfile);
                          navigator.clipboard.writeText(url);
                          toastNotification(10, 'Your link was copied! Give it to a friend. 🚀');
                        }, 100);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Copy My Own Link to Send to Friends!
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedFriends.map((friend) => (
                      <div
                        key={friend.id}
                        id={`saved-friend-card-${friend.id}`}
                        onClick={() => handleLoadSavedFriend(friend.payload)}
                        className="bg-white border hover:border-indigo-300 rounded-2xl p-4 flex items-center gap-4 hover:shadow shadow-sm transition duration-150 cursor-pointer relative group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl shrink-0">
                          {friend.avatar}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="font-extrabold text-slate-800 text-sm md:text-base truncate">{friend.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">Click to load and study custom wall</span>
                        </div>
                        
                        <button
                          id={`remove-friend-network-${friend.id}`}
                          onClick={(e) => handleDeleteFromNetwork(friend.id, e)}
                          className="absolute right-4 p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Remove Friend"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 4: FOCUSED STANDALONE VOCABULARY BOARD */}
            {activeTab === 'vocab' && (
              <motion.div
                key="vocab-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <BookOpen size={24} className="text-purple-650" /> Interactive Vocabulary Board
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Practice spelling, listen to correct pronunciations, and learn multi-lingual translations (English, Spanish, French, German) to collect XP and unlock trophy achievements!
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                  <VocabularyBoard 
                    profile={myProfile}
                    onUpdateProfile={handleUpdateMyProfile}
                    onAwardXp={handleAwardXp}
                  />
                </div>
              </motion.div>
            )}

            {/* VIEW 5: INTERACTIVE READING WOODS/CORNER */}
            {activeTab === 'reading' && (
              <motion.div
                key="reading-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                <ReadingCorner 
                  profile={myProfile}
                  onUpdateProfile={handleUpdateMyProfile}
                  onAwardXp={handleAwardXp}
                />
              </motion.div>
            )}

            {/* VIEW 6: MASCOT WARDROBE ADOPTION SANCTUARY */}
            {activeTab === 'mascot' && (
              <motion.div
                key="mascot-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                <MascotWardrobe 
                  profile={myProfile}
                  onUpdateProfile={handleUpdateMyProfile}
                  onAwardXp={handleAwardXp}
                />
              </motion.div>
            )}

            {/* VIEW 7: ADVENTURE GOLDEN TRAIL MAP */}
            {activeTab === 'trail' && (
              <motion.div
                key="trail-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                <AdventureTrail 
                  profile={myProfile}
                  onUpdateProfile={handleUpdateMyProfile}
                  onAwardXp={handleAwardXp}
                />
              </motion.div>
            )}

            {/* VIEW 8: ARCADE MINI GAMES */}
            {activeTab === 'games' && (
              <motion.div
                key="games-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                <MiniGames 
                  profile={myProfile}
                  onUpdateProfile={handleUpdateMyProfile}
                  onAwardXp={handleAwardXp}
                />
              </motion.div>
            )}

          </AnimatePresence>

        </main>

      </div>

      {/* --- WATCH OVERLAY INTERACTIVE BACKDROP TRANSITION --- */}
      <AnimatePresence>
        {activeWatchVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-3 md:p-6 flex items-center justify-center overflow-y-auto"
            id="theater-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <VideoPlayer
                video={activeWatchVideo}
                onAwardXp={handleAwardXp}
                onAddPost={handleAddPostFromNotes}
                onClose={() => setActiveWatchVideo(null)}
                username={myProfile.displayName}
                profile={myProfile}
                onUpdateProfile={handleUpdateMyProfile}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAMILY BRIGHTNESS FOOTER ACCENT */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 px-4 mt-auto">
        <p className="font-semibold">Designed for Kids under 16 • Safety and Exploration is our Top Priority 🤍</p>
        <p className="mt-1 text-[10px] text-slate-400">All external YouTube videos are curated and loaded inside secure sandbox frames.</p>
      </footer>

    </div>
  );
}
