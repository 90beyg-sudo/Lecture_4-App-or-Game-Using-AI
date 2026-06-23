import React, { useState } from 'react';
import { CATEGORIES, Category, PRESET_VIDEOS } from '../data/categories';
import { Video, UserProfile } from '../types';
import { Search, Compass, Pin, Play, AlertCircle, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryHubProps {
  currentProfile: UserProfile;
  customAddedVideos: Video[];
  onWatchVideo: (video: Video) => void;
  onPinVideoToShelf: (video: Video) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
}

export const CategoryHub: React.FC<CategoryHubProps> = ({
  currentProfile,
  customAddedVideos,
  onWatchVideo,
  onPinVideoToShelf,
  onUpdateProfile,
  onAwardXp
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('education');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Direct study video upload state variables
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoCategory, setVideoCategory] = useState('education');
  const [videoSubcategory, setVideoSubcategory] = useState('science-facts');
  const [isUnder16Approved, setIsUnder16Approved] = useState(false);
  const [noInappropriateContent, setNoInappropriateContent] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Helper utility to extract YouTube ID
  const extractYoutubeIdLocal = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handlePublishVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    const ytId = extractYoutubeIdLocal(videoUrl);
    if (!ytId) {
      setFormError('Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=libKVRa01L8)!');
      return;
    }

    if (!videoTitle.trim()) {
      setFormError('Please write an exciting video title so other kids know what to expect!');
      return;
    }

    if (!isUnder16Approved || !noInappropriateContent) {
      setFormError('Please click and check both child-safe verification guidelines. All videos must be safe under 16!');
      return;
    }

    const newVideo: Video = {
      id: 'vid-' + Math.random().toString(36).substr(2, 9),
      title: videoTitle.trim(),
      youtubeId: ytId,
      category: videoCategory,
      subcategory: videoSubcategory,
      description: videoDesc.trim() || 'A fun and peer-recommended safe learning video shared in SpaceHub.',
      addedBy: currentProfile.displayName,
      createdAt: new Date().toISOString()
    };

    onUpdateProfile({
      ...currentProfile,
      addedVideos: [newVideo, ...currentProfile.addedVideos]
    });

    onAwardXp(15, 'Video Curator 🎓');
    
    // reset form fields
    setVideoTitle('');
    setVideoUrl('');
    setVideoDesc('');
    setIsUnder16Approved(false);
    setNoInappropriateContent(false);
    setFormSuccess(true);

    setTimeout(() => {
      setFormSuccess(false);
      setIsUploadModalOpen(false);
    }, 1200);
  };

  // Find active category
  const activeCategory = CATEGORIES.find(c => c.id === selectedCategoryId) || CATEGORIES[0];

  // Merge PRESET_VIDEOS with any Custom Added Videos from this profile, or preloaded shared user videos
  const allVideos = [...PRESET_VIDEOS, ...customAddedVideos];

  // Deduplicate videos by their youtubeId to prevent duplicates from overlapping profiles
  const uniqueVideosMap = new Map<string, Video>();
  allVideos.forEach(v => {
    uniqueVideosMap.set(v.youtubeId, v);
  });
  const filteredMedia = Array.from(uniqueVideosMap.values()).filter((video) => {
    const matchesCategory = video.category === selectedCategoryId;
    const matchesSubcategory = selectedSubcategoryId === 'all' || video.subcategory === selectedSubcategoryId;
    const matchesSearch = 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const handleCategorySwitch = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId('all');
    setSearchQuery('');
  };

  const handlePin = (video: Video) => {
    onPinVideoToShelf(video);
  };

  return (
    <div className="flex flex-col gap-6" id="category-stream-explorer">
      
      {/* 1. TOP HERO DASHBOARD BANNER */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-650 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none hidden md:block select-none transform rotate-12 scale-110">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,15 15,80 85,80" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-3xl relative z-10">
          <div>
            <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              🚀 Youth Knowledge Hub & Feed
            </span>
            <h2 className="text-2xl md:text-3.5xl font-black mt-2 tracking-tight leading-none text-white">
              What do you want to learn & share details about today?
            </h2>
            <p className="text-xs md:text-sm text-sky-50 mt-2 max-w-xl font-medium leading-relaxed">
              Explore safe, curated videos across science, crafts, and animal biology. Click any stream, play fun quizzes, and pin things to your personal Facebook-style timeline to share with classmates!
            </p>
          </div>
        </div>
      </div>

      {/* 2. THE 4 MAIN CATEGORY CHANNELS GRID (Colourful selectors) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" id="main-category-selectors-grid">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === selectedCategoryId;
          return (
            <button
              key={cat.id}
              id={`cat-channel-btn-${cat.id}`}
              onClick={() => handleCategorySwitch(cat.id)}
              className={`p-4 md:p-5 rounded-2xl text-left border cursor-pointer hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between h-28 md:h-32 ${
                isActive 
                  ? `bg-gradient-to-br ${cat.colorClass} border-transparent text-white ring-4 ring-blue-100 scale-[1.02] shadow` 
                  : 'bg-white border-slate-200 hover:border-slate-350 text-slate-705'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl md:text-2xl leading-none">{cat.emoji}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base tracking-tight">{cat.title}</h3>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-450'}`}>
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. CONTROL PANEL: SUB-SECTIONS HORIZONTAL TAB LIST + SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4" id="control-panel-filter-bar">
        {/* Horizontal scrollable subcategory badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none shrink-0" id="subcategories-scroller">
          <button
            id="subcat-tab-all"
            onClick={() => setSelectedSubcategoryId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition duration-150 ${
              selectedSubcategoryId === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
            }`}
          >
            All Topics 🧭
          </button>
          {activeCategory.subcategories.map((sub) => {
            const isSubActive = selectedSubcategoryId === sub.id;
            return (
              <button
                key={sub.id}
                id={`subcat-tab-${sub.id}`}
                onClick={() => setSelectedSubcategoryId(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition duration-150 flex items-center gap-1 ${
                  isSubActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                }`}
              >
                <span>{sub.emoji}</span>
                <span>{sub.title}</span>
              </button>
            );
          })}
        </div>

        {/* Actions container: search and share button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <input
              id="stream-search-input"
              type="text"
              placeholder="Search matching videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white text-slate-700 transition"
            />
            <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
          </div>

          <button
            id="open-share-modal-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition whitespace-nowrap shadow-sm cursor-pointer border border-transparent"
          >
            <Sparkles size={11} className="animate-pulse text-yellow-300" />
            <span>+ Share Study Video</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN VIDEOS GRID PRESENTATION */}
      <div id="filtered-videos-results">
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-150 shadow-inner flex flex-col items-center justify-center gap-3">
            <AlertCircle size={36} className="text-slate-405 stroke-[1.5]" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">No videos found here</h3>
              <p className="text-xs text-slate-500 mt-1">Try expanding your filters, searching for alternate keywords, or add your first video shelf item!</p>
            </div>
            <button
              id="clear-search-btn"
              onClick={() => { setSelectedSubcategoryId('all'); setSearchQuery(''); }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((video) => {
              const staticThumb = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
              const isPinned = currentProfile.addedVideos.some(v => v.youtubeId === video.youtubeId);
              
              return (
                <div
                  key={video.id}
                  id={`stream-video-card-${video.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-150 shadow-sm hover:shadow-md transition duration-200 flex flex-col group relative"
                >
                  {/* Visual container thumbnail */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0">
                    <img 
                      src={staticThumb} 
                      alt={video.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                    />
                    <div 
                      onClick={() => onWatchVideo(video)}
                      className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/30 flex items-center justify-center cursor-pointer opacity-100 transition duration-150"
                    >
                      <span className="w-12 h-12 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transform transition">
                        <Play size={20} className="fill-current ml-1" />
                      </span>
                    </div>

                    {/* Left category tag sticker */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-700 tracking-wider">
                      {video.subcategory.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Body description panel */}
                  <div className="p-4 flex flex-col gap-2 flex-grow justify-between">
                    <div>
                      <h4 
                        onClick={() => onWatchVideo(video)}
                        className="font-black text-slate-800 text-sm md:text-base hover:text-blue-650 line-clamp-2 cursor-pointer leading-snug"
                      >
                        {video.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50 text-xs">
                      {video.addedBy && (
                        <span className="text-[10px] text-slate-600 flex items-center gap-0.5 max-w-[120px] truncate">
                          👤 Shared by: <strong className="truncate">{video.addedBy}</strong>
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          id={`pin-action-${video.id}`}
                          onClick={() => handlePin(video)}
                          disabled={isPinned}
                          className={`p-1.5 px-3 rounded-xl border font-bold text-[10px] flex items-center gap-1 cursor-pointer transition ${
                            isPinned
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-250 cursor-default'
                              : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                          }`}
                        >
                          <Pin size={10} className={isPinned ? 'fill-emerald-500 text-emerald-500' : ''} />
                          <span>{isPinned ? 'Pinned!' : 'Pin to Shelf'}</span>
                        </button>

                        <button
                          id={`watch-action-${video.id}`}
                          onClick={() => onWatchVideo(video)}
                          className="p-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl cursor-pointer shadow-sm transition"
                        >
                          Watch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Direct Study Video Publication Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto align-middle flex items-center justify-center" role="dialog" aria-modal="true" id="publish-video-modal-overlay">
            {/* Backdrop shading */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsUploadModalOpen(false)}></div>

            <div className="flex min-h-full items-center justify-center p-4 text-center z-10 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-lg border border-slate-100 flex flex-col"
              >
                {/* Header portion */}
                <div className="border-b border-slate-100 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📹</span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Post Safe YouTube video links</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">Share high-quality science, crafts, and educational streams!</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100/80 hover:bg-slate-150/80 w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Form content */}
                <form onSubmit={handlePublishVideo} className="p-6 flex flex-col gap-4">
                  
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-1.5 animate-bounce">
                      <span>⚠️</span>
                      <p>{formError}</p>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
                      <span>🎉</span>
                      <p>Exciting! Video shared in categories successfully! 15 XP awarded.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">YouTube Video Link / URL</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=libKVRa01L8"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setFormError('');
                      }}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-705 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Exciting Video Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Why Oceans Have High Tides"
                      value={videoTitle}
                      onChange={(e) => {
                        setVideoTitle(e.target.value);
                        setFormError('');
                      }}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-705 transition"
                    />
                  </div>

                  {/* Dual category selectors */}
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Main Stream Category</label>
                      <select
                        value={videoCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVideoCategory(val);
                          const matched = CATEGORIES.find(c => c.id === val);
                          if (matched && matched.subcategories.length > 0) {
                            setVideoSubcategory(matched.subcategories[0].id);
                          }
                        }}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white text-slate-705 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Subcategory Topic Tag</label>
                      <select
                        value={videoSubcategory}
                        onChange={(e) => setVideoSubcategory(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white text-slate-705 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {CATEGORIES.find(c => c.id === videoCategory)?.subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.emoji} {sub.title}</option>
                        )) || <option value="">Select Category First</option>}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Fun Summary / Description (Optional)</label>
                    <textarea
                      placeholder="Briefly state what other kids will learn from this cool video link..."
                      value={videoDesc}
                      onChange={(e) => setVideoDesc(e.target.value)}
                      maxLength={180}
                      rows={2}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-705 transition resize-none"
                    ></textarea>
                  </div>

                  {/* Safety suitability checker */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex flex-col gap-2.5">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      🛡️ Child-Safe Stream Standards (Under 16 Verification)
                    </span>

                    <div className="flex items-start gap-2.5">
                      <input
                        required
                        id="safe-content-check-1"
                        type="checkbox"
                        checked={isUnder16Approved}
                        onChange={(e) => setIsUnder16Approved(e.target.checked)}
                        className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="safe-content-check-1" className="text-[10.5px] text-slate-650 font-medium select-none cursor-pointer leading-tight">
                        I certify this video contains <strong>healthy, safe educational or positive learning</strong> patterns.
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        required
                        id="safe-content-check-2"
                        type="checkbox"
                        checked={noInappropriateContent}
                        onChange={(e) => setNoInappropriateContent(e.target.checked)}
                        className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="safe-content-check-2" className="text-[10.5px] text-slate-650 font-medium select-none cursor-pointer leading-tight">
                        I guarantee there is <strong>zero bad language, scary moments, or mature content</strong>. Suitable for all age sets.
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Publish to Hub 🚀</span>
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
