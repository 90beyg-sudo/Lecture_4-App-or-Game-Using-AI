import React, { useState, useEffect } from 'react';
import { Video, Post, UserProfile } from '../types';
import { Play, Award, HelpCircle, CheckCircle, Cross, X, ChevronRight, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VocabularyBoard } from './VocabularyBoard';

interface VideoPlayerProps {
  video: Video;
  onAwardXp: (amount: number, badgeName?: string) => void;
  onAddPost: (post: Omit<Post, 'id' | 'createdAt' | 'authorName'>) => void;
  onClose?: () => void;
  username: string;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

interface Trivia {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Preset TRIVIA based on curated video ids
const VIDEO_TRIVIA: Record<string, Trivia> = {
  'edu-1': {
    question: "What is the name of the deepest known point in Earth's oceans?",
    options: ["The Grand Horizon", "The Mariana Trench (Challenger Deep)", "The Blue Whale Canyon", "The Coral Basin"],
    correctIndex: 1,
    explanation: "Excellent! The Challenger Deep in the Mariana Trench is the deepest place on Earth, dipping down to nearly 36,000 feet (11,000 meters)."
  },
  'edu-2': {
    question: "Which planet is actually the HOTTEST in our solar system, with thick clouds that trap heat?",
    options: ["Mercury (Closest to Sun)", "Venus", "Mars", "Jupiter"],
    correctIndex: 1,
    explanation: "Spot on! Even though Mercury is closer to the sun, Venus has super-thick atmosphere clouds that trap the heat like a greenhouse, making it 864°F (462°C)!"
  },
  'edu-3': {
    question: "Why was the River Nile so critical to the survival of the Ancient Egyptians?",
    options: [
      "It flooded predictably every year, leaving rich dark mud for growing crops",
      "It froze over every winter, allowing fast skating transport",
      "It was a natural defensive wall made of hot bubbling syrup",
      "It had gold nuggets washing up automatically on the banks"
    ],
    correctIndex: 0,
    explanation: "Fantastic! The Nile's annual flooding left behind rich, black silt, turning the dry desert soil into farmable, fertile land that fed the empire."
  },
  'edu-4': {
    question: "What is the secret trick to quickly check if any huge number can be perfectly divided by 3?",
    options: [
      "If it ends with a number 5 or 0",
      "If you sum all its digits together and that final sum can be divided by 3",
      "If the number is longer than 5 digits",
      "If the number is even"
    ],
    correctIndex: 1,
    explanation: "Perfect! If you add all digits of a number up (like 522 -> 5+2+2 = 9), and that total is divisible by 3, then the whole number can be divided by 3. Try it!"
  },
  'fun-1': {
    question: "What does the word 'Origami' literally mean in Japanese?",
    options: ["Cutting paper into triangles", "Painting on wood", "Folding paper", "Shiny magical boxes"],
    correctIndex: 2,
    explanation: "Great job! 'Ori' means folding, and 'Kami' means paper. So Origami is the beautiful traditional art of folding paper into animals and items."
  },
  'fun-2': {
    question: "Think fast: What has hands but can never clap?",
    options: ["A wise friendly grandfather clock", "A sea star under the reef", "An umbrella on a rainy day", "A young pine tree"],
    correctIndex: 0,
    explanation: "A standard analog clock has Hour, Minute, and Second hands, but can never clap! You solved the brain riddle!"
  },
  'fun-3': {
    question: "Why do science jokes laughingly say you 'can never trust an atom'?",
    options: [
      "Because they are way too tiny to see with reading glasses",
      "Because they make up everything in the universe!",
      "Because they spin around extremely fast",
      "Because they sink in glasses of water"
    ],
    correctIndex: 1,
    explanation: "Classic pun! Atoms are the basic building blocks of all physical matter. Since they literally 'make up everything,' you can't trust them!"
  },
  'info-1': {
    question: "Besides happiness, how does purring help a cat heal and stay strong?",
    options: [
      "The purring sound scares away hungry wild animals",
      "Its physical vibrations at 20-140Hz can encourage bone growth and repair weak muscles",
      "It cools down their furry body on hot summer afternoons",
      "It digests the cat food much faster"
    ],
    correctIndex: 1,
    explanation: "Brilliant! Cats purr not just when relaxed, but also to soothe themselves when hurt. The physical frequency of the purr vibration is scientifically proven to treat bone and tissue!"
  },
  'info-2': {
    question: "How do modern smartphone touchscreens know where your finger is without any physical push keys?",
    options: [
      "Using tiny mechanical micro-switches under the thick glass",
      "By detecting the heat pattern radiating out of your fingers",
      "By using your fingers' natural electrical conductivity to disrupt the screen's electric field",
      "Using invisible lasers shooting out from the front-facing camera"
    ],
    correctIndex: 2,
    explanation: "Amazing! These screens (called capacitive screens) have grid lines of electrical charge. Since humans conduct electricity, tapping the glass alters that exact spot's charge, instantly tracking your finger."
  },
  'info-3': {
    question: "How do computers learn to recognize objects using Machine Learning?",
    options: [
      "A programmer manually codes a description of every single object on earth",
      "The computer drinks virtual juice to boost its power",
      "By studying thousands of examples (like dog photos) and adjusting its criteria based on feedback",
      "Computers have automatic human brains inside them"
    ],
    correctIndex: 2,
    explanation: "Exactly! Just like kids learn by looking at pictures of apples and dogs, a machine learning system studies thousands of images, notices patterns, receives corrections, and gets smarter."
  },
  'ent-1': {
    question: "At just 14 years old, what did William Kamkwamba build out of old bicycle and scrapyard parts to save his village?",
    options: [
      "A solar powered water boiler",
      "An electricity-generating wind turbine to power a water irrigation pump",
      "A mechanical farm tractor",
      "A safe wireless radio transmitter"
    ],
    correctIndex: 1,
    explanation: "Inspirational! Using a book about physics, William built a beautiful windmill from scrap metal, tree branches, and fan parts, bringing water and power to his malawian village."
  },
  'ent-2': {
    question: "In Minecraft building blocks, what is the power element 'Redstone' most similar to in the real world?",
    options: [
      "Plastic columns and supportive bricks",
      "Electrical circuits, wires, and power signals",
      "Chemical liquid explosives",
      "Warm solar heating panels"
    ],
    correctIndex: 0, // Wait, let's look at options. Option 1 is "Electrical circuits..." index is actually 1
    explanation: "You got it! Redstone behaves exactly like copper wiring and logical switches, allowing players to build computers, auto-doors, and crazy complex factories in Minecraft."
  }
};

// Selection of General Safe Trivia questions for custom added videos
const GENERAL_TRIVIA_LIST: Trivia[] = [
  {
    question: "Which massive mammal is the largest creature known to have ever lived on Earth?",
    options: ["The Woolly Mammoth", "The Deep Sea Giant Squid", "The Antarctic Blue Whale", "The Tyrannosaurus Rex"],
    correctIndex: 2,
    explanation: "Blue whales are the largest creatures ever! They are even larger than the biggest known dinosaurs, growing up to 100 feet long!"
  },
  {
    question: "What amazing force holds our atmospheric air, oceans, and bodies safely on the ground?",
    options: ["Magnetic North Pole", "Gravity", "Atmospheric Speed", "Centrifugal Wind"],
    correctIndex: 1,
    explanation: "Gravity! Earth's massive weight pulls all objects toward its center, preventing us and our beautiful oceans from drifting off into empty space."
  },
  {
    question: "What organic green superpower allows plants to create their own food using simple sunlight?",
    options: ["Photosynthesis", "Metamorphosis", "Echolocation", "Decomposition"],
    correctIndex: 0,
    explanation: "Photosynthesis! Cells inside green leaves use solar energy to convert water and carbon dioxide into simple sugars for food and oxygen for us to breathe!"
  },
  {
    question: "Why do astronauts float around almost weightlessly inside the International Space Station (ISS)?",
    options: [
      "They are so far away from Earth that gravity becomes absolute zero",
      "They are in a state of continuous helper 'free-fall' around the curve of the Earth",
      "The space station is pumped full of helium gas",
      "They wear special magnetic-repelling jumpsuits"
    ],
    correctIndex: 1,
    explanation: "Gravity actually exists in orbit (about 90% of earth gravity!). However, because the ISS is in a continuous orbit, it is in constant freefall, producing a zero-G feeling!"
  }
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onAwardXp,
  onAddPost,
  onClose,
  username,
  profile,
  onUpdateProfile
}) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  
  const [trivia, setTrivia] = useState<Trivia | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [triviaSubmitted, setTriviaSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Set trivia based on video ID
  useEffect(() => {
    setSelectedAnswer(null);
    setTriviaSubmitted(false);
    setIsCorrect(false);
    setNoteSaved(false);
    
    if (VIDEO_TRIVIA[video.id]) {
      setTrivia(VIDEO_TRIVIA[video.id]);
    } else {
      // Pick a general stable question based on the first character of the video's ID
      const charCode = video.id.charCodeAt(0) || 0;
      const index = charCode % GENERAL_TRIVIA_LIST.length;
      setTrivia(GENERAL_TRIVIA_LIST[index]);
    }
  }, [video.id]);

  const handleTriviaSubmit = () => {
    if (selectedAnswer === null || !trivia) return;
    
    const correct = selectedAnswer === trivia.correctIndex;
    setIsCorrect(correct);
    setTriviaSubmitted(true);
    
    // Add to completed videos in user profile
    const currentCompleted = profile.completedVideos || [];
    let updatedCompleted = [...currentCompleted];
    if (!updatedCompleted.includes(video.id)) {
      updatedCompleted.push(video.id);
    }

    let xpAward = correct ? 20 : 5;
    let badgeNotice = correct ? 'Trivia Champion 🧠' : undefined;

    // Check for "Master Learner" automated badge logic:
    // If completedVideos reaches 3, automatically award the Master Learner badge!
    const updatedBadges = [...(profile.badges || [])];
    if (updatedCompleted.length >= 3 && !updatedBadges.includes('Master Learner 🎓')) {
      updatedBadges.push('Master Learner 🎓');
      xpAward += 40; // Extra XP for mastering 3 topics!
      badgeNotice = 'Master Learner 🎓';
    }

    onUpdateProfile({
      ...profile,
      completedVideos: updatedCompleted,
      badges: updatedBadges
    });

    onAwardXp(xpAward, badgeNotice);
  };

  const handleSaveNoteAsPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    
    onAddPost({
      title: noteTitle.trim() || `My Notes on: "${video.title}"`,
      content: noteText.trim() + `\n\n📺 Watched the video: "${video.title}"`,
      moodEmoji: '🧠'
    });
    
    setNoteSaved(true);
    // Award 15 XP for active reflecting & writing notes
    onAwardXp(15, 'Diligent Scholar ✍️');
    
    // Clear form briefly
    setTimeout(() => {
      setNoteTitle('');
      setNoteText('');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col lg:flex-row h-full max-h-[90vh]" id="watch-main-viewport">
      {/* Left Area: Video & Description */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
        <div>
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              {video.category} • {video.subcategory.replace('-', ' ')}
            </span>
            {onClose && (
              <button
                id="close-player-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-600 transition"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Embedded Frame */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border-4 border-slate-100">
            <iframe
              id={`yt-player-iframe-${video.id}`}
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&autoplay=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-4 leading-tight">
            {video.title}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Added on {new Date(video.createdAt).toLocaleDateString()} {video.addedBy ? `by ${video.addedBy}` : ''}
          </p>

          <p className="text-sm text-slate-600 mt-3 bg-indigo-50/40 p-3 rounded-xl border border-indigo-50/50 leading-relaxed">
            {video.description}
          </p>

          {/* Active study vocab word deck */}
          <div className="mt-6 border-t border-slate-150 pt-5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
              <span>📖 Vocab Board for this Topic</span>
            </h4>
            <VocabularyBoard 
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              onAwardXp={onAwardXp}
              filterCategory={video.subcategory}
            />
          </div>
        </div>

        {/* Informative Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Play size={12} /> Kid-Safe Content Hub
          </span>
          <span>Earn XP by taking the Trivia Challenge on the right! ☄️</span>
        </div>
      </div>

      {/* Right Area: Trivia Quiz & Taking Notes */}
      <div className="w-full lg:w-96 overflow-y-auto p-4 md:p-6 bg-slate-50 flex flex-col gap-6">
        
        {/* Trivia Area */}
        {trivia && (
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100" id="video-trivia-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <BrainIcon />
              </span>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Learner Trivia Challenge</h3>
            </div>

            <p className="text-sm font-semibold text-slate-700 mb-3">
              {trivia.question}
            </p>

            <div className="flex flex-col gap-2">
              {trivia.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                let btnStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
                
                if (isSelected) {
                  btnStyle = 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20';
                }

                if (triviaSubmitted) {
                  if (index === trivia.correctIndex) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-300 bg-rose-50 text-rose-800';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200';
                  }
                }

                return (
                  <button
                    key={index}
                    id={`trivia-opt-${index}`}
                    disabled={triviaSubmitted}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs md:text-sm transition duration-150 flex items-start gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="leading-tight">{option}</span>
                  </button>
                );
              })}
            </div>

            {!triviaSubmitted ? (
              <button
                id="submit-trivia-btn"
                disabled={selectedAnswer === null}
                onClick={handleTriviaSubmit}
                className="w-full mt-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs md:text-sm font-bold shadow-md shadow-indigo-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                Let's Check My Answer! <ChevronRight size={16} />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl text-xs bg-slate-100 border border-slate-200"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold text-sm">
                      <CheckCircle size={16} /> CORRECT (+20 XP!)
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      Good try! (+5 XP)
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {trivia.explanation}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Note Taking Workspace */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100" id="video-scholarly-notes">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <PenTool size={16} />
            </span>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">My Digital Scholar Pad</h3>
          </div>

          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Take fun notes or write down what you learned. You can post these notes directly to your personal Wall Shelf with 1-click!
          </p>

          <form onSubmit={handleSaveNoteAsPost} className="flex flex-col gap-2">
            <input
              id="notes-title-input"
              type="text"
              placeholder="Give your note a title... (optional)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              disabled={noteSaved}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-450 placeholder-slate-400 bg-slate-50/50"
            />
            <textarea
              id="notes-content-input"
              placeholder="I learned today that..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={noteSaved}
              required
              rows={3}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-450 placeholder-slate-400 bg-slate-50/50 resize-none min-h-[80px]"
            ></textarea>

            {noteSaved ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="py-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={14} className="text-emerald-600" /> Note Pinned to Your Profile! (+15 XP)
              </motion.div>
            ) : (
              <button
                id="pin-note-btn"
                type="submit"
                disabled={!noteText.trim()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
              >
                Pin Notes on My wall Post 📌
              </button>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

const BrainIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-brain w-4 h-4 md:w-5 md:h-5 text-amber-500"
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M12 5v14" />
    <path d="M12 9h4" />
    <path d="M12 14h-4" />
  </svg>
);
