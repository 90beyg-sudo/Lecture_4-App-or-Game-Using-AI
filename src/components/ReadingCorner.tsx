import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Article, EDUCATIONAL_ARTICLES } from '../data/articles';
import { BookOpen, AlertCircle, CheckCircle, GraduationCap, ArrowLeft, Award, Sparkles, BookMarked, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReadingCornerProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
}

export const ReadingCorner: React.FC<ReadingCornerProps> = ({
  profile,
  onUpdateProfile,
  onAwardXp
}) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const myReadArticles = profile.readArticles || [];

  const handleOpenArticle = (art: Article) => {
    setSelectedArticle(art);
    setSelectedOpt(null);
    setChecked(false);
    setIsCorrect(false);
  };

  const handleQuizSubmit = () => {
    if (!selectedArticle || selectedOpt === null) return;

    const correct = selectedOpt === selectedArticle.quiz.correctIndex;
    setIsCorrect(correct);
    setChecked(true);

    if (correct) {
      // Mark as read article
      const alreadyRead = myReadArticles.includes(selectedArticle.id);
      let updatedRead = [...myReadArticles];
      let xpAward = 30; // 30 XP for reading and getting quiz right!

      if (!alreadyRead) {
        updatedRead.push(selectedArticle.id);
        
        // Automated Badge Logic check!
        const updatedBadges = [...(profile.badges || [])];
        let achievedBadge = '';

        // Check Bookworm Badge
        if (!updatedBadges.includes('Bookworm 🐛')) {
          updatedBadges.push('Bookworm 🐛');
          achievedBadge = 'Bookworm 🐛';
          xpAward += 25; // Extra bonus for badge unlock!
        }

        const updatedProfile = {
          ...profile,
          readArticles: updatedRead,
          badges: updatedBadges
        };

        onUpdateProfile(updatedProfile);
        onAwardXp(xpAward, achievedBadge || undefined);
      } else {
        // Just review XP
        onAwardXp(10);
      }
    } else {
      // Small try-again reward for reading
      onAwardXp(5);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="educational-reading-corner">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-teal-550 to-emerald-600 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-xl text-center md:text-left">
          <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 mb-2">
            ✨ BRAND NEW: INTERACTIVE ARTICLE CORNER
          </span>
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <BookMarked size={24} className="stroke-[2]" /> Kid Scholar's Reading Woods
          </h2>
          <p className="text-xs text-emerald-50 opacity-95 mt-1 leading-relaxed">
            Read fun science & nature stories rewritten specifically for kids. Complete each story's quick comprehension challenge to instantly claim <strong>+30 XP</strong> and unlock the secret <strong>Bookworm 🐛</strong> badge!
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 text-center shrink-0 min-w-[150px]">
          <span className="text-[10px] uppercase font-bold text-emerald-200">Stories Read</span>
          <p className="text-3xl font-black mt-0.5">{myReadArticles.length} / {EDUCATIONAL_ARTICLES.length}</p>
          <div className="w-full bg-emerald-800/50 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${(myReadArticles.length / EDUCATIONAL_ARTICLES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          /* GRID LIST OF ARTICLES */
          <motion.div
            key="article-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {EDUCATIONAL_ARTICLES.map((art) => {
              const isRead = myReadArticles.includes(art.id);
              return (
                <div
                  key={art.id}
                  id={`article-card-${art.id}`}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-teal-350 shadow-sm transition hover:shadow-md flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-4xl p-2 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                        {art.icon}
                      </span>
                      <div>
                        <span className="text-[9px] font-black uppercase text-teal-600 tracking-wider">
                          {art.category}
                        </span>
                        <h3 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug group-hover:text-teal-700 transition">
                          {art.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            art.difficulty === 'Easy Peasy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            art.difficulty === 'Super Scholar' ? 'bg-indigo-50 text-indigo-705 border-indigo-100' :
                            'bg-violet-50 text-violet-700 border-violet-100'
                          }`}>
                            {art.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">⏱️ {art.readTime}</span>
                        </div>
                      </div>
                    </div>
                    {isRead && (
                      <span className="p-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100" title="Completed article!">
                        <CheckCircle size={16} className="fill-emerald-50 text-emerald-650" />
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {art.paragraphs[0]}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isRead ? '✅ Finished' : '📖 Unread story'}
                    </span>
                    <button
                      onClick={() => handleOpenArticle(art)}
                      className="text-xs font-black bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-850 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      Open Story &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          /* ACTIVE ARTICLE SCREEN */
          <motion.div
            key="article-reader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            id="active-article-view"
          >
            {/* ARTICLE WRAPPER HEADER */}
            <div className="bg-slate-50/80 p-5 md:p-6 border-b border-slate-150 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-150 font-bold text-xs rounded-xl flex items-center gap-1.5 text-slate-600 transition cursor-pointer"
                id="back-to-articles-btn"
              >
                <ArrowLeft size={14} /> Back to Corner
              </button>

              <div className="flex items-center gap-2 text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedArticle.category}</span>
                <span className="text-2xl">{selectedArticle.icon}</span>
              </div>
            </div>

            {/* ARTILCE CONTENT BODY */}
            <div className="p-6 md:p-8 flex flex-col gap-6 max-w-3xl mx-auto">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    selectedArticle.difficulty === 'Easy Peasy' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                    selectedArticle.difficulty === 'Super Scholar' ? 'bg-indigo-50 text-indigo-705 border-indigo-150' :
                    'bg-violet-50 text-violet-700 border-violet-150'
                  }`}>
                    {selectedArticle.difficulty} Reading Challenge
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-0.5">
                    ⏱️ {selectedArticle.readTime}
                  </span>
                </div>
              </div>

              {/* READ ALOUD PARAGRAPHS */}
              <div className="flex flex-col gap-5 text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                {selectedArticle.paragraphs.map((para, i) => (
                  <p key={i} className="first-letter:text-3xl first-letter:font-black first-letter:text-teal-600 first-letter:mr-1.5">
                    {para}
                  </p>
                ))}
              </div>

              {/* FUN FACT GLOW BOX */}
              <div className="bg-amber-50/60 rounded-3xl p-5 border border-amber-200/50 flex items-start gap-4 shadow-inner mt-4">
                <span className="text-3xl shrink-0">💡</span>
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider">Super Awesome Fun Fact!</h4>
                  <p className="text-slate-705 text-xs md:text-sm font-semibold mt-1 leading-relaxed italic">
                    {selectedArticle.funFact}
                  </p>
                </div>
              </div>

              {/* COMPREHENSION CHALLENGE BOX */}
              <div className="mt-8 border-t border-dashed border-slate-200 pt-8" id="article-quiz-segment">
                <div className="flex items-center gap-2 mb-4 bg-teal-50/50 px-4 py-2.5 rounded-2xl border border-teal-100 inline-block">
                  <span className="text-lg">🧠</span>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-850">Story Comprehension Challenge</span>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-5 md:p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                    {selectedArticle.quiz.question}
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    {selectedArticle.quiz.options.map((opt, index) => {
                      const isSelected = selectedOpt === index;
                      let optionStyle = 'border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-100/30';

                      if (isSelected) {
                        optionStyle = 'border-teal-550 bg-teal-50 ring-2 ring-teal-400/20 text-teal-900';
                      }

                      if (checked) {
                        if (index === selectedArticle.quiz.correctIndex) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400/20';
                        } else if (isSelected) {
                          optionStyle = 'border-rose-300 bg-rose-50 text-rose-800 opacity-80';
                        } else {
                          optionStyle = 'opacity-50 border-slate-200 bg-white';
                        }
                      }

                      return (
                        <button
                          key={index}
                          disabled={checked}
                          onClick={() => setSelectedOpt(index)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs md:text-sm font-bold duration-150 flex items-start gap-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="leading-tight mt-0.5">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!checked ? (
                    <button
                      disabled={selectedOpt === null}
                      onClick={handleQuizSubmit}
                      className="w-full mt-2 py-3 bg-teal-650 hover:bg-teal-700 active:scale-[0.99] transition text-white font-black text-xs md:text-sm rounded-2xl shadow-md disabled:opacity-50 disabled:shadow-none cursor-pointer text-center"
                    >
                      Submit Answer to Finalize Story! 🚀
                    </button>
                  ) : (
                    <div className="mt-2 p-4 bg-white rounded-2xl border border-slate-205">
                      {isCorrect ? (
                        <div className="flex flex-col gap-1.5 md:flex-row md:items-center justify-between">
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            🎉 PERFECT! You answered correctly! +30 XP claimed.
                          </span>
                          <button
                            onClick={() => setSelectedArticle(null)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg text-center"
                          >
                            Finish Article &rarr;
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-rose-700 font-bold">
                            ❌ Nice try, but that is not correct. Check the paragraphs and try again!
                          </span>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                            Hint: {selectedArticle.quiz.explanation}
                          </p>
                          <button
                            onClick={() => {
                              setChecked(false);
                              setSelectedOpt(null);
                            }}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-250 text-slate-700 text-[10px] font-bold rounded-lg self-start cursor-pointer"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
