import { Video } from '../types';

export interface Subcategory {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export interface Category {
  id: string; // 'education' | 'fun' | 'information' | 'entertainment'
  title: string;
  description: string;
  emoji: string;
  colorClass: string; // Tailwind bg/text color styles
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'education',
    title: 'Education',
    description: 'Learn something amazing about Science, Math, Languages, and History!',
    emoji: '🎓',
    colorClass: 'from-blue-500 to-indigo-600',
    subcategories: [
      {
        id: 'science-space',
        title: 'Science & Space',
        description: 'Explore stars, planets, molecules, and chemical reactions.',
        emoji: '🚀'
      },
      {
        id: 'math-tricks',
        title: 'Math Tricks',
        description: 'Discover fast mental calculation and cool number patterns.',
        emoji: '🔢'
      },
      {
        id: 'history-culture',
        title: 'History & Cultures',
        description: 'Travel back in time to ancient Egypt, Rome, and explore our world.',
        emoji: '🏛️'
      },
      {
        id: 'languages',
        title: 'Languages & Words',
        description: 'Fun word origins, grammar games, and learning new languages.',
        emoji: '🗣️'
      }
    ]
  },
  {
    id: 'fun',
    title: 'Fun Activities',
    description: 'Hands-on DIY crafts, hilarious jokes, and mind-boggling riddles!',
    emoji: '🧩',
    colorClass: 'from-amber-400 to-orange-500',
    subcategories: [
      {
        id: 'craft-diy',
        title: 'Craft & DIY',
        description: 'Step-by-step paper folding, painting, and cool kitchen experiments.',
        emoji: '🎨'
      },
      {
        id: 'riddles',
        title: 'Interactive Riddles',
        description: 'Train your brain with lateral-thinking questions and puzzles.',
        emoji: '🧠'
      },
      {
        id: 'kid-jokes',
        title: 'Kid Jokes',
        description: 'Silly puns, clean jokes, and funny skits that will make you giggle.',
        emoji: '🎈'
      },
      {
        id: 'amazing-facts',
        title: 'Amazing Trivia',
        description: 'Bizarre but true secrets of the universe that sound made up!',
        emoji: '✨'
      }
    ]
  },
  {
    id: 'information',
    title: 'Information',
    description: 'All about Animals, Nature, amazing Technology, and how things are made!',
    emoji: '🌍',
    colorClass: 'from-emerald-400 to-teal-600',
    subcategories: [
      {
        id: 'animals-nature',
        title: 'Animals & Nature',
        description: 'Diving deep into oceans and jungles to see incredible creatures.',
        emoji: '🦁'
      },
      {
        id: 'how-things-work',
        title: 'How It Works',
        description: 'The engineering behind engines, touchscreens, internet, and toys.',
        emoji: '⚙️'
      },
      {
        id: 'tech-future',
        title: 'Tech & Future',
        description: 'Robotics, AI, coding, and how cities might look in 100 years.',
        emoji: '💻'
      },
      {
        id: 'health-focus',
        title: 'Health & Focus',
        description: 'Understand how your brain works, why sleep is powerful, and food science.',
        emoji: '🍎'
      }
    ]
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    description: 'Safe animated stories, catchy sing-alongs, safe gaming, and amazing talents!',
    emoji: '🎬',
    colorClass: 'from-pink-500 to-rose-600',
    subcategories: [
      {
        id: 'stories',
        title: 'Animation & Stories',
        description: 'Beautiful folktales, short cartoons, and historical bedtime adventures.',
        emoji: '🎭'
      },
      {
        id: 'music-sing',
        title: 'Music & Sing-alongs',
        description: 'Learn instruments, sing along to fun beats, and make some noise.',
        emoji: '🎵'
      },
      {
        id: 'safe-gaming',
        title: 'Safe Gaming Tips',
        description: 'Cool level builds, sandbox logic, and being a kind online gamer.',
        emoji: '🎮'
      },
      {
        id: 'talents',
        title: 'Talents & Sports',
        description: 'Amazing magic tricks, simple kid-safe gymnastics, and super skills.',
        emoji: '⭐'
      }
    ]
  }
];

export const PRESET_VIDEOS: Video[] = [
  // --- EDUCATION ---
  {
    id: 'edu-1',
    title: 'How Deep is the Ocean? (Animated Expedition)',
    youtubeId: 'ge7711-UInU',
    category: 'education',
    subcategory: 'science-space',
    description: 'A deep plunge down to the Mariana Trench. Discover what strange lifeforms survive at 36,000 feet below sea level.',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'edu-2',
    title: 'Solar System 101 | National Geographic Kids',
    youtubeId: 'libKVRa01L8',
    category: 'education',
    subcategory: 'science-space',
    description: 'Check out the amazing planets orbiting our sun, from scorching Mercury to icy Neptune, and find out what makes the Earth so special.',
    createdAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'edu-3',
    title: 'Ancient Egypt: The Gift of the Nile',
    youtubeId: 'H7uF3vIsR14',
    category: 'education',
    subcategory: 'history-culture',
    description: 'How did pharaohs live? What are pyramids really built for? Embark on an exciting journey down the historic River Nile.',
    createdAt: '2026-02-15T10:00:00.000Z'
  },
  {
    id: 'edu-4',
    title: 'Cool Mental Math Tricks for Super Speed Counting',
    youtubeId: '30qg89K_6M4',
    category: 'education',
    subcategory: 'math-tricks',
    description: 'Impress your teachers and friends with these ninja math techniques to multiply huge numbers and check answers in your head in seconds.',
    createdAt: '2026-03-20T10:00:00.000Z'
  },

  // --- FUN ---
  {
    id: 'fun-1',
    title: '3 Easy Origami Animals for Beginners (Paper Folding)',
    youtubeId: 'wU_scidTzI0',
    category: 'fun',
    subcategory: 'craft-diy',
    description: 'Turn a simple square paper sheet into a jumpsome frog, an elegant crane, and a cute little puppy dog. Just grab some colorful paper!',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'fun-2',
    title: '10 Smart Brain Teasers and Lateral-Thinking Riddles',
    youtubeId: '6X_bZ8K9Z8U',
    category: 'fun',
    subcategory: 'riddles',
    description: 'Can you solve these mystery puzzles? Pay attention to the secret details and try to answer before the timer counts down!',
    createdAt: '2026-04-18T10:00:00.000Z'
  },
  {
    id: 'fun-3',
    title: 'The Funniest Science Puns and Jokes Explained',
    youtubeId: 'Y9jE64F8vN4',
    category: 'fun',
    subcategory: 'kid-jokes',
    description: 'Why can you never trust an atom? Because they make up everything! Have fun listening to hilarious puns and learn the dry science behind them.',
    createdAt: '2026-05-01T10:00:00.000Z'
  },

  // --- INFORMATION ---
  {
    id: 'info-1',
    title: 'Why Do Cats Purr? (The Hidden Feline superpower)',
    youtubeId: '768S-pbeX9M',
    category: 'information',
    subcategory: 'animals-nature',
    description: 'Is it only because they are happy? Dive into the biology of cats to see how their custom vocal vibrations help heal bones and comfort kittens.',
    createdAt: '2026-05-12T10:00:00.000Z'
  },
  {
    id: 'info-2',
    title: 'How Does a Telephone Touchscreen Actually Work?',
    youtubeId: '39a7HicvjM8',
    category: 'information',
    subcategory: 'how-things-work',
    description: 'Have you ever wondered how glass can tell exactly where your finger is tapping? See the electrostatic physics of modern smartphones in action!',
    createdAt: '2026-05-18T10:00:00.000Z'
  },
  {
    id: 'info-3',
    title: 'What is AI and Machine Learning? (For Kids!)',
    youtubeId: 'f_uwKZIAeX0',
    category: 'information',
    subcategory: 'tech-future',
    description: 'Understand how lines of code learn to recognize hand-drawn animals, play chess, and play safety guides in driverless vehicles.',
    createdAt: '2026-06-05T10:00:00.000Z'
  },

  // --- ENTERTAINMENT ---
  {
    id: 'ent-1',
    title: 'The Boy Who Harnessed the Wind (Heroic True Story Animation)',
    youtubeId: 'S-7A8iI-4-U',
    category: 'entertainment',
    subcategory: 'stories',
    description: 'Watch the inspiring true story of William Kamkwamba, a 14-year-old Malawian genius who saved his entire village from famine by building a wind turbine.',
    createdAt: '2026-06-12T10:00:00.000Z'
  },
  {
    id: 'ent-2',
    title: 'Minecraft Redstone Logic: Building 3 Simple Automated Gates',
    youtubeId: '3n_Qp3lU0xM',
    category: 'entertainment',
    subcategory: 'safe-gaming',
    description: 'A friendly guide to building secret mechanical doors, item filters, and piston traps in Minecraft using cool wiring logic.',
    createdAt: '2026-06-15T10:00:00.000Z'
  }
];
