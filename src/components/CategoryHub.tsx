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

        {/* Action search */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            id="stream-search-input"
            type="text"
            placeholder="Search matching videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white placeholder-slate-405 text-slate-700 transition"
          />
          <Search size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
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

    </div>
  );
};
