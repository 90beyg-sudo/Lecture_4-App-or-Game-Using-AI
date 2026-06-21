import React, { useState } from 'react';
import { UserProfile, Video, Post } from '../types';
import { AvatarSelector, AVATAR_OPTIONS, AvatarIcon } from './AvatarSelector';
import { extractYoutubeId, generateShareUrl } from '../utils/sharing';
import { PRESET_VIDEOS } from '../data/categories';
import { 
  Camera, Edit, Share2, Plus, MessageSquare, Video as VideoIcon, 
  Trash2, Award, Sparkles, Smile, BookOpen, Clock, Heart, CheckCircle2, Copy, Play,
  Book, Gamepad2, Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const calculateAge = (birthdayString?: string): number | string => {
  if (!birthdayString) return '';
  const today = new Date();
  const birthDate = new Date(birthdayString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
};

interface ProfileFeedProps {
  profile: UserProfile;
  isOwnProfile: boolean; // True if browsing target user's own profile, False if visiting a shared link
  onUpdateProfile: (updated: UserProfile) => void;
  onWatchVideo: (video: Video) => void;
  onAwardXp: (amount: number, badgeName?: string) => void;
  savedFriends?: { id: string; name: string; avatar: string; payload: string }[];
}

const BANNER_THEMES = [
  { id: 'space', label: 'Space Space', class: 'from-purple-500 via-indigo-600 to-blue-700' },
  { id: 'sunset', label: 'Sunset Glow', class: 'from-amber-400 via-pink-500 to-rose-500' },
  { id: 'ocean', label: 'Sea Glow', class: 'from-sky-400 via-teal-400 to-indigo-500' },
  { id: 'forest', label: 'Forest Neon', class: 'from-emerald-400 via-teal-500 to-blue-600' }
];

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🚀', label: 'Excited' },
  { emoji: '🧠', label: 'Brainy' },
  { emoji: '🎨', label: 'Creative' },
  { emoji: '📚', label: 'Studious' },
  { emoji: '🦖', label: 'Playful' }
];

export const ProfileFeed: React.FC<ProfileFeedProps> = ({
  profile,
  isOwnProfile,
  onUpdateProfile,
  onWatchVideo,
  onAwardXp,
  savedFriends = []
}) => {
  // Modal & Form Toggles
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Profile Customization state
  const [tempName, setTempName] = useState(profile.displayName);
  const [tempBio, setTempBio] = useState(profile.bio);
  const [tempTopic, setTempTopic] = useState(profile.favoriteTopic);
  const [tempAvatar, setTempAvatar] = useState(profile.avatarUrl);
  const [tempBanner, setTempBanner] = useState(profile.customBannerColor);

  // New Post state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postMood, setPostMood] = useState('😊');

  // Collaborative Journal Builder States
  const [isAddingCollab, setIsAddingCollab] = useState(false);
  const [collabStep, setCollabStep] = useState<1 | 2>(1);
  const [collabTitle, setCollabTitle] = useState('');
  const [collabCoAuthorId, setCollabCoAuthorId] = useState('mascot-ollie');
  const [collabCoAuthorName, setCollabCoAuthorName] = useState('Ollie the Sage Owl 🦉');
  const [collabCoAuthorAvatar, setCollabCoAuthorAvatar] = useState('🦉');
  const [activeTurn, setActiveTurn] = useState<1 | 2 | 3 | 4>(1);
  const [collabDraft1, setCollabDraft1] = useState('');
  const [collabDraft2, setCollabDraft2] = useState('');
  const [collabDraft3, setCollabDraft3] = useState('');
  const [collabDraft4, setCollabDraft4] = useState('');

  // Connected/Attached Resources
  const [attachedCollabVideo, setAttachedCollabVideo] = useState<Video | null>(null);
  const [attachedCollabBook, setAttachedCollabBook] = useState<{ title: string; author: string } | null>(null);
  const [attachedCollabGame, setAttachedCollabGame] = useState<{ id: string; name: string; icon: string } | null>(null);

  // Custom Co-Author option state variables
  const [customCoAuthorNameInput, setCustomCoAuthorNameInput] = useState('');
  const [customCoAuthorAvatarInput, setCustomCoAuthorAvatarInput] = useState('🧑‍🚀');

  // Built-in Mascot Options
  const MASCOTS = [
    { id: 'mascot-ollie', name: 'Ollie the Sage Owl 🦉', avatar: '🦉', bio: 'Knows all the secrets of ancient forests!' },
    { id: 'mascot-chippy', name: 'Chippy the Mini Dragon 🐉', avatar: '🐉', bio: 'Fires up crazy volcanic trivia!' },
    { id: 'mascot-nova', name: 'Nova Space Explorer 🚀', avatar: '🚀', bio: 'Travels across the cosmic Milky Way!' },
    { id: 'mascot-pippin', name: 'Pippin the Studious Panda 🐼', avatar: '🐼', bio: 'Master of bamboo engineering!' },
    { id: 'mascot-spark', name: 'Sparky Code Robot 🤖', avatar: '🤖', bio: 'Flashes digital wires & fun science calculations!' },
    { id: 'mascot-luna', name: 'Luna Star Unicorn 🦄', avatar: '🦄', bio: 'Sprinkles magical stardust and sweet dream stories!' },
    { id: 'mascot-barnaby', name: 'Barnaby Fossil Explorer 🦖', avatar: '🦖', bio: 'Digs deep to discover ancient dino fossils!' },
    { id: 'mascot-bubbles', name: 'Bubbles Deepsea Octopus 🐙', avatar: '🐙', bio: 'Unlocks marine mysteries and sunken pirate logs!' }
  ];

  // Creative Prompts
  const COLLAB_PROMPTS = [
    {
      title: 'Volcano Exploration Mission 🌋',
      starter: 'While exploring the mysterious Volcanic Reef, we noticed strange purple steam rising...',
      personaReplie3: {
        'mascot-ollie': 'Hoot! Heat sensors indicate the purple steam carries mineral salt. Excellent study material!',
        'mascot-chippy': 'Rawr! Let\'s roast marshmallows over these vents! I hope the lava is sweet.',
        'mascot-nova': 'My cosmic radar detects these volcanic rifts exist on Jupiter\'s moon, Io, too!',
        'mascot-pippin': 'I am taking notes in our soil journal. This volcanic dust is full of minerals!'
      },
      personaReplie4: {
        'mascot-ollie': 'To wrap up: We concluded the heat was perfectly safe if we stayed 10 paces back.',
        'mascot-chippy': 'Conclusion: Marshmallows are delicious when cooked by volcanic steam!',
        'mascot-nova': 'Mission success! We charted a new geological hotspot for our study.',
        'mascot-pippin': 'And we planted a lovely heat-friendly research flower on the mountainside!'
      }
    },
    {
      title: 'The Magic Treehouse Discovery 🌳',
      starter: 'We climbed the absolute tallest oak tree in the valley and found an ancient telescope pointing to...',
      personaReplie3: {
        'mascot-ollie': 'Hoot! It is aiming straight at Ursa Major. A beautiful choice!',
        'mascot-chippy': 'A dragon nest! I see happy little green scales glowing on the distant peak!',
        'mascot-nova': 'A secret solar satellite reflecting the sunlight! Let\'s transmit a hello!',
        'mascot-pippin': 'A grove of golden bamboo. It has been hidden there for centuries!'
      },
      personaReplie4: {
        'mascot-ollie': 'Our combined maps now include this amazing night-sky viewing station.',
        'mascot-chippy': 'We had so much fun that we nearly fell down the rope ladder!',
        'mascot-nova': 'That was one small climb for a kid, but one giant leap for our explorer logs!',
        'mascot-pippin': 'We resolved to return every Friday to look for new secret coordinates.'
      }
    },
    {
      title: 'The Secret Dinosaur Expedition 🦖',
      starter: 'We found a fossilized footprint in the garden, and suddenly a friendly hatchling came running into...',
      personaReplie3: {
        'mascot-ollie': 'Hoot! I think it stands as a junior Triceratops. Look at those tiny horn buds!',
        'mascot-chippy': 'Rawr! A cousin of mine! Let\'s play tag and teach him how to fetch sticks!',
        'mascot-nova': 'The hatchling had glowing stellar scales! Perhaps a space asteroid brought him here.',
        'mascot-pippin': 'It was hungry! Fortunately, I had some organic leafy snacks in my lunchbox.'
      },
      personaReplie4: {
        'mascot-ollie': 'We took its photo, built a safe brush fence, and promised to keep his home secret.',
        'mascot-chippy': 'He gave us a sweet baby-reptile high five before running back to his mother!',
        'mascot-nova': 'And that is how we became official, high-scoring dinosaur guardians!',
        'mascot-pippin': 'We logged the plant types he liked to eat to help future palaeontologists!'
      }
    },
    {
      title: 'Mysterious Deep Sea Expedition 🐙',
      starter: 'Our hand-crafted cardboard submarine dove under the bubble bath and discovered...',
      personaReplie3: {
        'mascot-ollie': 'Hoot! A school of neon bath-toys orbiting a swirling whirlpool of soap!',
        'mascot-chippy': 'A grand treasure! Underneath the bubbles lay the long-lost gold shampoo bottle!',
        'mascot-nova': 'A submerged space station! The jellyfish had glowing antenna communicating with satellites!',
        'mascot-pippin': 'Excellent water pressure! It is the perfect ecosystem for studying deep-sea algae!'
      },
      personaReplie4: {
        'mascot-ollie': 'With our logs complete, we safely surfaced and towel-dried our research equipment.',
        'mascot-chippy': 'We celebrated with a double-scoop of bubbly strawberry soap-cones!',
        'mascot-nova': 'We entered coordinates for the soap-galaxy in our navigators.',
        'mascot-pippin': 'And we proved that bath-tub biology is extremely fun and safe!'
      }
    }
  ];

  const handleSelectPrompt = (index: number) => {
    const p = COLLAB_PROMPTS[index];
    setCollabTitle(p.title);
    setCollabDraft1(p.starter);
    setActiveTurn(2); // First line is written, next is Co-author!

    const pId = collabCoAuthorId as string;
    let turn2Replie = (p.personaReplie3 as any)[pId];
    if (!turn2Replie) {
      if (pId === 'mascot-spark') {
        const prompts3: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `Beep boop! Core temperature rises! Analyzing magma elements: 42% silicon, 100% glowing steam! Let's hack a drone to orbit the crater.`,
          'The Magic Treehouse Discovery 🌳': `Bzzz! Recalibrating ancient telescope lenses! I loaded a star tracker script and aligned it to discover the Milky Way's core.`,
          'The Secret Dinosaur Expedition 🦖': `Beep! Running skeletal database... This footprint belongs to a friendly T-Rex hatchling! Generating a fun biome simulator.`,
          'Mysterious Deep Sea Expedition 🐙': `Submarine battery level: 98%. Scanning underwater coordinates! Found a micro-shipwreck covered in electric bioluminescent corals!`
        };
        turn2Replie = prompts3[p.title] || `Beep boop! Initializing digital exploration data! I loaded a cool code script loaded with science to help us study!`;
      } else if (pId === 'mascot-luna') {
        const prompts3: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `Sparkle sparkle! The volcano is breathing pastel violet star-fire! Let's write down the colors of the heat aurora!`,
          'The Magic Treehouse Discovery 🌳': `Ooh! The telescope is looking at a hidden constellation shaped like a celestial kitten sleeping on a crescent moon!`,
          'The Secret Dinosaur Expedition 🦖': `He has shiny starry scales and wears a flower crown of sweet blue daisies! Let's sing a gentle nursery rhyme to them.`,
          'Mysterious Deep Sea Expedition 🐙': `The bubbles are glowing in pink and aqua colors because magic mermaid dust is swirling below our submarine!`
        };
        turn2Replie = prompts3[p.title] || `Sparkles! I detected magical star paths! Let's write down the dreamiest parts.`;
      } else if (pId === 'mascot-barnaby') {
        const prompts3: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `Whoa! Look at the rock layers uncovered by the hot steam! We might find rare prehistoric obsidian gems!`,
          'The Magic Treehouse Discovery 🌳': `This telescope has a rusty brass mount from 1895! Look, there is a hidden drawing of a stegosaurus carved on the tripod!`,
          'The Secret Dinosaur Expedition 🦖': `Golly! A real live hatchling! Let's check his teeth structures to see if he's an herbivore dinosaur!`,
          'Mysterious Deep Sea Expedition 🐙': `I found a prehistoric ammonite fossil buried in the sandy sea-bottom! It must be millions of years old!`
        };
        turn2Replie = prompts3[p.title] || `Incredible! This is a grand historic discovery! Let's study its timeline under my magnifying glass!`;
      } else if (pId === 'mascot-bubbles') {
        const prompts3: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `Blub blub! The underwater vents are puffing cool saltwater geysers! Look at those beautiful red shrimp swimming nearby!`,
          'The Magic Treehouse Discovery 🌳': `Wow, looking from the treetop reveals the lake waves swirling in beautiful spiral patterns like a giant blue jellyfish!`,
          'The Secret Dinosaur Expedition 🦖': `Oh! The dinosaur hatchling is trying to swim! Let's build a safe, splashy raft using floating branches and lily pads!`,
          'Mysterious Deep Sea Expedition 🐙': `Blub! Eight high fives for discovering a sunken treasure chest filled with glowing coral beads and ancient clay marbles!`
        };
        turn2Replie = prompts3[p.title] || `Glug! Let's dive deep into the water currents and write down what we find!`;
      } else {
        turn2Replie = `Hey! I love studying this with you! Let's write down our research findings and add a fun twist next!`;
      }
    }
    setCollabDraft2(turn2Replie);
    setCollabDraft3("Then we decided that...");

    let turn4Replie = (p.personaReplie4 as any)[pId];
    if (!turn4Replie) {
      if (pId === 'mascot-spark') {
        const prompts4: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `Data package compiled and securely saved to the learning core server! Beep boop!`,
          'The Magic Treehouse Discovery 🌳': `We mapped the stellar coordinates and successfully updated our astronomical records!`,
          'The Secret Dinosaur Expedition 🦖': `Dinosaur tracking system activated! Safe tracking code is set to run.`,
          'Mysterious Deep Sea Expedition 🐙': `Submarine docked! Successfully uploaded bathymetric maps into our main dashboard!`
        };
        turn4Replie = prompts4[p.title] || `Beep! System log saved. We are an unstoppable science crew!`;
      } else if (pId === 'mascot-luna') {
        const prompts4: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `We sprinkled some pink glitter pebbles to thank the hot mountain, and walked home singing!`,
          'The Magic Treehouse Discovery 🌳': `We made a secret wish on the kitten constellation, and left a sketch for other kids to find.`,
          'The Secret Dinosaur Expedition 🦖': `The happy hatchling fell fast asleep under a warm blanket of grass. Sweet dreams, dino buddy!`,
          'Mysterious Deep Sea Expedition 🐙': `We wrapped our treasures in glowing seaweed ribbons and swam safely back home under the moon!`
        };
        turn4Replie = prompts4[p.title] || `All our dreamy wishes came true during this beautiful lesson! ✨`;
      } else if (pId === 'mascot-barnaby') {
        const prompts4: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `We safely pocketed a small piece of light pumice stone for our classroom science cabinet!`,
          'The Magic Treehouse Discovery 🌳': `We carbon-dated the telescope tree and recorded it as the most historic treehouse in the reserve!`,
          'The Secret Dinosaur Expedition 🦖': `We gave him a cute scientific name, 'Gigglesaurus', and promised to check on him tomorrow!`,
          'Mysterious Deep Sea Expedition 🐙': `We labeled the ammonite fossil and carefully displayed it in our bedroom mini-museum!`
        };
        turn4Replie = prompts4[p.title] || `This goes straight down into our official history books as a magnificent discovery!`;
      } else if (pId === 'mascot-bubbles') {
        const prompts4: Record<string, string> = {
          'Volcano Exploration Mission 🌋': `We waved goodbye to the shrimp, and returned to shore to rinse our goggles in fresh water!`,
          'The Magic Treehouse Discovery 🌳': `We drew a map of the swirling lake-currents and pinned it in our science club notebook!`,
          'The Secret Dinosaur Expedition 🦖': `The baby dino splattered us with water, giving us the most hilarious wet high five ever!`,
          'Mysterious Deep Sea Expedition 🐙': `We shared our bubble-bath adventure with the rest of the science club over warm cocoa!`
        };
        turn4Replie = prompts4[p.title] || `Blub blub! Let's make as many fun splashes as we can! Exploration rules!`;
      } else {
        turn4Replie = `We learned so many cool things together and can't wait to launch our next social study project!`;
      }
    }
    setCollabDraft4(turn4Replie);
    setCollabStep(2);
  };

  const handleTriggerMascotBrainstorm = (turnNumber: 2 | 4) => {
    // Find active prompt
    const activePrompt = COLLAB_PROMPTS.find(p => p.title === collabTitle);
    if (!activePrompt) return;
    
    const pId = collabCoAuthorId as string;
    if (turnNumber === 2) {
      let ans = (activePrompt.personaReplie3 as any)[pId];
      if (!ans) {
        if (pId === 'mascot-spark') {
          ans = "Beep boop! Science modules aligned! Let's record the chemical elements together.";
        } else if (pId === 'mascot-luna') {
          ans = "Sparkle! Let's paint this scenery with starry twilight colors! ✨";
        } else if (pId === 'mascot-barnaby') {
          ans = "Look! I found historical footprint clues left from over two centuries ago!";
        } else if (pId === 'mascot-bubbles') {
          ans = "Blub blub! I spotted colorful electric jellyfish swimming in a circle!";
        } else {
          ans = `Hey there! This is ${collabCoAuthorName.split(' ')[0]} joining. Let's research this adventure zone and write down what we find!`;
        }
      }
      setCollabDraft2(ans);
    } else {
      let ans = (activePrompt.personaReplie4 as any)[pId];
      if (!ans) {
        if (pId === 'mascot-spark') {
          ans = "Mission success! Code and log compiled gracefully at 100% capacity.";
        } else if (pId === 'mascot-luna') {
          ans = "And so, we promised to always chase our bright, glowing stars together!";
        } else if (pId === 'mascot-barnaby') {
          ans = "This ancient mystery has been officially cataloged in our museum vault!";
        } else if (pId === 'mascot-bubbles') {
          ans = "We high-fived all eight tickly arms and splashed happily back to the beach!";
        } else {
          ans = "We learned a lot, had so much fun under the sun, and finished our homework early! 🎉";
        }
      }
      setCollabDraft4(ans);
    }
  };

  const handlePublishCollaborativeJournal = () => {
    if (!collabTitle.trim()) return;
    
    // Concatenate paragraphs into cohesive summary content or detailed list format
    const completeContent = `${collabDraft1}\n\n✍️ *Contribution by ${collabCoAuthorName}*:\n"${collabDraft2}"\n\n✍️ *My continuation*:\n"${collabDraft3}"\n\n✍️ *${collabCoAuthorName}\'s conclusion*:\n"${collabDraft4}"`;

    const collabParagraphs = [
      { writerName: profile.displayName, avatar: profile.avatarUrl, text: collabDraft1 },
      { writerName: collabCoAuthorName, avatar: collabCoAuthorAvatar, text: collabDraft2 },
      { writerName: profile.displayName, avatar: profile.avatarUrl, text: collabDraft3 },
      { writerName: collabCoAuthorName, avatar: collabCoAuthorAvatar, text: collabDraft4 }
    ];

    const newCollabPost: Post = {
      id: 'collab-' + Math.random().toString(36).substr(2, 9),
      title: collabTitle,
      content: completeContent,
      createdAt: new Date().toISOString(),
      moodEmoji: '📝',
      authorName: profile.displayName,
      isCollaborative: true,
      coAuthorName: collabCoAuthorName,
      coAuthorAvatar: collabCoAuthorAvatar,
      collabParagraphs: collabParagraphs,
      attachedVideo: attachedCollabVideo || undefined,
      attachedBook: attachedCollabBook || undefined,
      attachedGame: attachedCollabGame || undefined
    };

    onUpdateProfile({
      ...profile,
      posts: [newCollabPost, ...profile.posts]
    });

    // Reset collab states
    setIsAddingCollab(false);
    setCollabStep(1);
    setCollabTitle('');
    setCollabDraft1('');
    setCollabDraft2('');
    setCollabDraft3('');
    setCollabDraft4('');
    setAttachedCollabVideo(null);
    setAttachedCollabBook(null);
    setAttachedCollabGame(null);
    onAwardXp(40, 'Cooperative Creator 🤝');
  };

  // New Video state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCategory, setVideoCategory] = useState('education');
  const [videoSubcategory, setVideoSubcategory] = useState('science-space');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoError, setVideoError] = useState('');

  // Likes Tracking state (simulated interactive likes for visitor-engagement)
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});

  // Profile expanded properties
  const [tempBirthday, setTempBirthday] = useState(profile.birthday || '');
  const [tempGrade, setTempGrade] = useState(profile.gradeClass || '');
  const [tempAvatarUrlField, setTempAvatarUrlField] = useState(profile.avatarUrl.match(/^https?:\/\//) ? profile.avatarUrl : '');

  // Book Shelf state
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookReview, setBookReview] = useState('');
  const [bookStatus, setBookStatus] = useState<'reading' | 'completed'>('completed');

  // Word Scrabble Game state
  const SCRAMBLE_WORDS_POOL = [
    { original: 'WISDOM', scrambled: 'I-S-D-W-M-O', hint: 'Having good knowledge and smart judgment.' },
    { original: 'GRAVITY', scrambled: 'V-T-Y-G-I-R-A', hint: 'The force that pulls apples down to the earth!' },
    { original: 'ORIGAMI', scrambled: 'M-O-R-I-G-I-A', hint: 'Traditional Japanese art of paper folding.' },
    { original: 'ALGORITHM', scrambled: 'O-R-M-I-G-L-T-H-A', hint: 'Step-by-step instructions coding recipe.' },
    { original: 'ECOSYSTEM', scrambled: 'C-O-S-Y-S-T-E-M-E', hint: 'A bubble of living organisms in nature.' }
  ];
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [gameInput, setGameInput] = useState('');
  const [gameChecked, setGameChecked] = useState(false);
  const [isGameCorrect, setIsGameCorrect] = useState(false);

  // Trigger link generation to clipboard
  const handleShareProfile = () => {
    const url = generateShareUrl(profile);
    navigator.clipboard.writeText(url)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
        onAwardXp(10, 'Super Connector 🔗'); // Award 10 XP for choosing to share knowledge!
      })
      .catch(err => {
        console.error('Could not copy link:', err);
      });
  };

  // Submit profile edits
  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      displayName: tempName.trim() || profile.displayName,
      bio: tempBio.trim(),
      favoriteTopic: tempTopic,
      avatarUrl: tempAvatar,
      customBannerColor: tempBanner,
      birthday: tempBirthday || undefined,
      gradeClass: tempGrade || undefined
    });
    setIsEditingInfo(false);
    onAwardXp(15, 'Profile Designer 🎨'); // Reward child's customization
  };

  // Submit Text Post to Wall
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost: Post = {
      id: 'post-' + Math.random().toString(36).substr(2, 9),
      title: postTitle.trim() || 'Quick thoughts',
      content: postContent.trim(),
      createdAt: new Date().toISOString(),
      moodEmoji: postMood,
      authorName: profile.displayName
    };

    onUpdateProfile({
      ...profile,
      posts: [newPost, ...profile.posts]
    });

    setPostTitle('');
    setPostContent('');
    setPostMood('😊');
    setIsAddingPost(false);
    onAwardXp(25, 'Creative Author ✍️'); // Higher XP for writing thoughts
  };

  // Submit Custom Video
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError('');

    const ytId = extractYoutubeId(videoUrl);
    if (!ytId) {
      setVideoError('Please paste a valid YouTube URL! Check example: https://www.youtube.com/watch?v=libKVRa01L8');
      return;
    }

    const newVideo: Video = {
      id: 'vid-' + Math.random().toString(36).substr(2, 9),
      title: videoTitle.trim() || 'Cool YouTube video',
      youtubeId: ytId,
      category: videoCategory,
      subcategory: videoSubcategory,
      description: videoDesc.trim() || 'A safe educational video shared in my custom knowledge library.',
      addedBy: profile.displayName,
      createdAt: new Date().toISOString()
    };

    onUpdateProfile({
      ...profile,
      addedVideos: [newVideo, ...profile.addedVideos]
    });

    setVideoTitle('');
    setVideoUrl('');
    setVideoDesc('');
    setIsAddingVideo(false);
    onAwardXp(30, 'Curator Extraordinaire 📂'); // Extra rewards for sharing real videos
  };

  // Delete Video from personal shelf
  const handleDeleteVideo = (videoId: string) => {
    onUpdateProfile({
      ...profile,
      addedVideos: profile.addedVideos.filter(v => v.id !== videoId)
    });
  };

  // Delete Post from personal shelf
  const handleDeletePost = (postId: string) => {
    onUpdateProfile({
      ...profile,
      posts: profile.posts.filter(p => p.id !== postId)
    });
  };

  // Submit Custom Book Entry
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim()) return;

    const newBook = {
      id: 'book-' + Math.random().toString(36).substr(2, 9),
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
      review: bookReview.trim(),
      status: bookStatus,
      createdAt: new Date().toISOString()
    } as any;

    const currentBooks = profile.books || [];
    const updatedBooks = [newBook, ...currentBooks];

    // Trigger badge award logic
    const updatedBadges = [...(profile.badges || [])];
    let xpReward = 15;
    let badgeNotice = 'Bookworm Club 📚';

    // Literature badge condition
    if (updatedBooks.length === 1 && !updatedBadges.includes('Lover of Literature 📖')) {
      updatedBadges.push('Lover of Literature 📖');
      xpReward += 15;
    }
    // Completed status reward
    if (bookStatus === 'completed' && !updatedBadges.includes('Dedicated Reader 🧠')) {
      updatedBadges.push('Dedicated Reader 🧠');
      xpReward += 20;
    }
    // Bookworm badge condition
    if (!updatedBadges.includes('Bookworm 🐛')) {
      updatedBadges.push('Bookworm 🐛');
      xpReward += 10;
      badgeNotice = 'Bookworm 🐛';
    }

    onUpdateProfile({
      ...profile,
      books: updatedBooks,
      badges: updatedBadges
    });

    // Reset fields
    setBookTitle('');
    setBookAuthor('');
    setBookReview('');
    setBookStatus('completed');
    setIsAddingBook(false);
    onAwardXp(xpReward, badgeNotice);
  };

  const handleToggleBookStatus = (bookId: string) => {
    const currentBooks = profile.books || [];
    const updatedBadges = [...(profile.badges || [])];
    let xpReward = 10;
    let badgeNotice = 'Finished Book Club! 📖';
    
    const updatedBooks = currentBooks.map(b => {
      if (b.id === bookId) {
        const nextStatus = b.status === 'reading' ? 'completed' : 'reading';
        if (nextStatus === 'completed') {
          if (!updatedBadges.includes('Dedicated Reader 🧠')) {
            updatedBadges.push('Dedicated Reader 🧠');
            xpReward += 15;
          }
          if (!updatedBadges.includes('Bookworm 🐛')) {
            updatedBadges.push('Bookworm 🐛');
            xpReward += 10;
            badgeNotice = 'Bookworm 🐛';
          }
        }
        return { ...b, status: nextStatus };
      }
      return b;
    });

    onUpdateProfile({
      ...profile,
      books: updatedBooks as any,
      badges: updatedBadges
    });

    onAwardXp(xpReward, badgeNotice);
  };

  const handleDeleteBook = (bookId: string) => {
    const currentBooks = profile.books || [];
    onUpdateProfile({
      ...profile,
      books: currentBooks.filter(b => b.id !== bookId)
    });
  };

  // Submit scramble word solve
  const handleCheckScrambleWord = (e: React.FormEvent) => {
    e.preventDefault();
    const active = SCRAMBLE_WORDS_POOL[scrambleIndex];
    const isCorrect = gameInput.trim().toUpperCase() === active.original;
    setIsGameCorrect(isCorrect);
    setGameChecked(true);

    if (isCorrect) {
      const updatedBadges = [...(profile.badges || [])];
      let xpRew = 25;
      if (!updatedBadges.includes('Spelling Bee Champion 🐝')) {
        updatedBadges.push('Spelling Bee Champion 🐝');
      }

      onUpdateProfile({
        ...profile,
        badges: updatedBadges
      });

      onAwardXp(xpRew, 'Word Wizard Solver 🧩');
    }
  };

  const handleNextScramble = () => {
    setScrambleIndex((prev) => (prev + 1) % SCRAMBLE_WORDS_POOL.length);
    setGameInput('');
    setGameChecked(false);
  };

  // Profile avatar picker callback
  const handleAvatarSelect = (avatar: AvatarIcon) => {
    setTempAvatar(avatar.emoji);
  };

  // Handle high-fives / likes on friend profiles
  const handleLikePost = (postId: string) => {
    setPostLikes(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6" id="kids-facebook-profile-feed">
      
      {/* 1. STYLISH COVER BANNER AND PROFILE PILL ROW */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 pb-6 relative">
        {/* Cover photo banner */}
        <div className={`h-40 md:h-52 bg-gradient-to-r ${profile.customBannerColor} relative transition-all duration-350`}>
          {isOwnProfile && (
            <button
              id="edit-banner-gear"
              onClick={() => setIsEditingInfo(true)}
              className="absolute top-4 right-4 bg-white/30 backdrop-blur-md hover:bg-white/80 p-2 rounded-xl text-white hover:text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Camera size={14} /> Customize Theme
            </button>
          )}
          {/* Decorative floating stickers to make it fun for kids */}
          <div className="absolute top-4 left-6 hidden md:flex items-center gap-2">
            <span className="animate-bounce bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white">⭐ Safe Hub</span>
            <span className="animate-pulse bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white">🎓 Keep Learning</span>
          </div>
        </div>

        {/* Profile Info Details Row */}
        <div className="px-6 md:px-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            {/* Avatar block with negative margin to overlap beautifully without pulling text/buttons on top of the cover photo */}
            <div className={`-mt-16 md:-mt-20 w-28 h-28 rounded-3xl bg-gradient-to-br ${profile.customBannerColor.includes('from-') ? profile.customBannerColor : 'from-indigo-400 to-indigo-600'} flex items-center justify-center text-6xl shadow-lg ring-8 ring-white shrink-0 transform hover:scale-105 transition duration-200 overflow-hidden relative z-20`}>
              {profile.avatarUrl.match(/^https?:\/\//) ? (
                <img src={profile.avatarUrl} alt="Display Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile.avatarUrl.length <= 2 ? profile.avatarUrl : '🦉'
              )}
            </div>

            {/* Title bio details */}
            <div className="mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 leading-tight">
                  {profile.displayName}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-105">
                  💖 Fav: {profile.favoriteTopic.replace('-', ' ')}
                </span>
                {profile.gradeClass && (
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 text-purple-750 font-bold text-xs rounded-full border border-purple-150">
                    🏫 {profile.gradeClass}
                  </span>
                )}
                {profile.birthday && (
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-150" title={`Birthday: ${profile.birthday}`}>
                    🎂 Age: {calculateAge(profile.birthday) || 'N/A'}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-1 max-w-md font-medium">
                {profile.bio || "Welcome to my knowledge shelf! Check out my favourite YouTube videos and questions below. Let's study and have fun!"}
              </p>
            </div>
          </div>

          {/* XP & Sharing Panel */}
          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            {/* Level status */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-2xl px-4 py-2 border border-amber-300 shadow-sm">
              <Sparkles size={18} className="text-white fill-white animate-spin-slow" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest uppercase opacity-75">Knowledge Level</span>
                <span className="text-lg font-black leading-none">{Math.floor(profile.xpPoints / 100) + 1} ({profile.xpPoints} XP)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    id="edit-profile-btn"
                    onClick={() => {
                      setTempName(profile.displayName);
                      setTempBio(profile.bio);
                      setTempTopic(profile.favoriteTopic);
                      setTempAvatar(profile.avatarUrl);
                      setTempBanner(profile.customBannerColor);
                      setIsEditingInfo(!isEditingInfo);
                    }}
                    className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit size={12} /> Edit Profile
                  </button>

                  <button
                    id="share-profile-btn"
                    onClick={handleShareProfile}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-sm hover:shadow cursor-pointer relative"
                  >
                    <Share2 size={12} /> {linkCopied ? 'Copied Share Link!' : 'Share My Profile'}
                  </button>
                </>
              ) : (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                  👀 Browsing Friend's Library
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Badges display */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="px-6 md:px-8 mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] tracking-widest text-slate-400 font-bold uppercase mb-2">My Brag Badges ({profile.badges.length})</h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-705 border border-amber-250 rounded-xl text-xs font-semibold cursor-default transition">
                  🏆 {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quest milestones / Badge requirements Dashboard */}
        <div className="px-6 md:px-8 mt-5 pt-4 border-t border-slate-100 bg-slate-50/40 pb-5 rounded-b-3xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-[11px] tracking-widest text-slate-500 font-extrabold uppercase flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> Badge Quests & Milestone Metres
              </h4>
              <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">Track your achievements live as you learn and explore!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Bookworm Quest */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    📖 Bookworm 🐛
                  </span>
                  {profile.badges?.includes('Bookworm 🐛') ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md border border-emerald-100">Claimed! 🏆</span>
                  ) : (
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md border border-amber-100">In Progress</span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 leading-tight font-medium">Read 1 story in Reading Woods or write 1 book review.</p>
              </div>
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.min(1, (profile.readArticles?.length || 0) + (profile.books?.filter(b => b.status === "completed").length || 0))} / 1
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (((profile.readArticles?.length || 0) + (profile.books?.filter(b => b.status === "completed").length || 0)) >= 1 ? 100 : 0))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Master Learner Quest */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    🎓 Master Learner 🎓
                  </span>
                  {profile.badges?.includes('Master Learner 🎓') ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md border border-emerald-100">Claimed! 🏆</span>
                  ) : (
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md border border-amber-100">In Progress</span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 leading-tight font-medium">Watch 3 educational videos and complete their trivia quizzes.</p>
              </div>
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{profile.completedVideos?.length || 0} / 3</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-505 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (((profile.completedVideos?.length || 0) / 3) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Spelling Champion Quest */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    🐝 Spelling Bee 🐝
                  </span>
                  {profile.badges?.includes('Spelling Bee Champion 🐝') ? (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md border border-emerald-100">Claimed! 🏆</span>
                  ) : (
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md border border-amber-100">In Progress</span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 leading-tight font-medium">Unscramble any word in the Scrambled Spelling game below!</p>
              </div>
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{profile.badges?.includes('Spelling Bee Champion 🐝') ? '1 / 1' : '0 / 1'}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-450 h-full transition-all duration-300"
                    style={{ width: `${profile.badges?.includes('Spelling Bee Champion 🐝') ? 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROFILE CUSTOMIZATION MODAL ENGINE (Only visible when active) */}
      <AnimatePresence>
        {isOwnProfile && isEditingInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-5 shadow-inner border border-slate-100 flex flex-col gap-4 overflow-hidden"
            id="profile-editor-panel"
          >
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-lg">Express Yourself! Customize Profile</h3>
              <p className="text-xs text-slate-500">Pick any cartoon avatar and customize your showcase banner gradient!</p>
            </div>

            <form onSubmit={handleSaveProfileInfo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form: text fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Display Name</label>
                  <input
                    id="profile-edit-name-input"
                    type="text"
                    maxLength={18}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    required
                    placeholder="Enter your cool name"
                    className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-indigo-505 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Profile Bio (What do you like to learn?)</label>
                  <textarea
                    id="profile-edit-bio-input"
                    maxLength={150}
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows={3}
                    placeholder="Tell your friends what you love to explore about Science, Crafts, etc.!"
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-indigo-505 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Favorite Learner Subject</label>
                  <select
                    id="profile-edit-subject-select"
                    value={tempTopic}
                    onChange={(e) => setTempTopic(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-indigo-505 focus:outline-none"
                  >
                    <option value="science-space">🚀 Science & Space</option>
                    <option value="math-tricks">🔢 Math Shortcuts</option>
                    <option value="craft-diy">🎨 Craft & Paper Origami</option>
                    <option value="riddles">🧠 Brain Teasers & Mystery Puzzles</option>
                    <option value="animals-nature">🦁 Oceans & Animal Biology</option>
                    <option value="how-things-work">⚙️ Engineering & Physics</option>
                    <option value="tech-future">💻 AI & Modern Robotics</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">📅 Birthday Date</label>
                    <input
                      id="profile-edit-birthday-input"
                      type="date"
                      value={tempBirthday}
                      onChange={(e) => setTempBirthday(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-indigo-505 focus:outline-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">🏫 Class / Grade</label>
                    <select
                      id="profile-edit-grade-select"
                      value={tempGrade}
                      onChange={(e) => setTempGrade(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-indigo-505 focus:outline-none text-slate-700"
                    >
                      <option value="">Select Stage...</option>
                      <option value="Preschool">Preschool</option>
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="1st Grade">1st Grade</option>
                      <option value="2nd Grade">2nd Grade</option>
                      <option value="3rd Grade">3rd Grade</option>
                      <option value="4th Grade">4th Grade</option>
                      <option value="5th Grade">5th Grade</option>
                      <option value="6th Grade">6th Grade</option>
                      <option value="7th Grade">7th Grade</option>
                      <option value="8th Grade">8th Grade</option>
                      <option value="9th Grade">9th Grade</option>
                      <option value="10th Grade">10th Grade</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Form: Banner gradient and Avatar chooser */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Your Cover Banner Glow</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BANNER_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        id={`theme-btn-${theme.id}`}
                        type="button"
                        onClick={() => setTempBanner(theme.class)}
                        className={`p-2 rounded-xl border text-[10px] font-bold text-center text-white bg-gradient-to-r ${theme.class} hover:scale-[1.02] transition cursor-pointer relative ${
                          tempBanner === theme.class ? 'ring-2 ring-indigo-650 ring-offset-1 border-white' : 'border-transparent'
                        }`}
                      >
                        {theme.label}
                        {tempBanner === theme.class && <span className="absolute top-1 right-1">✅</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pick Avatar Cartoon Mascot</label>
                  <AvatarSelector selectedId={tempAvatar} onSelect={handleAvatarSelect} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">📷 Custom Display Photo (URL)</label>
                  <input
                    id="profile-edit-avatar-url-input"
                    type="url"
                    placeholder="https://images.unsplash.com/... or paste any visual link!"
                    value={tempAvatarUrlField}
                    onChange={(e) => {
                      setTempAvatarUrlField(e.target.value);
                      if (e.target.value.trim()) {
                        setTempAvatar(e.target.value.trim());
                      }
                    }}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-1 focus:ring-indigo-505 focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400">Pasting an image URL overrides the emoji mascot avatar!</p>
                </div>
              </div>

              {/* Action grid */}
              <div className="flex gap-2 justify-end md:col-span-2 border-t border-slate-100 pt-4">
                <button
                  id="cancel-profile-edit"
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  id="save-profile-edit"
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Lock In Style! ☄️
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. TWOFOLD TIMELINE SPLIT (Left side: Video shelf, Right side: Post wall) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* --- LEFT HAND SIDE: MY CURATED SHELF OF VIDEOS (5/12 grid elements) --- */}
        <div className="lg:col-span-5 flex flex-col gap-4" id="video-shelf-timeline">
          <div className="flex items-center justify-between font-sans">
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-1.5 uppercase tracking-tight">
              <VideoIcon className="text-blue-500" size={18} /> My Video Shelf ({profile.addedVideos.length})
            </h3>
            {isOwnProfile && (
              <button
                id="toggle-add-video-btn"
                onClick={() => setIsAddingVideo(!isAddingVideo)}
                className="p-1 px-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold text-xs flex items-center gap-0.5 hover:bg-blue-100 transition cursor-pointer"
              >
                <Plus size={14} /> Add Video
              </button>
            )}
          </div>

          {/* Add custom Video Inline Area */}
          <AnimatePresence>
            {isOwnProfile && isAddingVideo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border-2 border-blue-100 shadow-sm flex flex-col gap-3"
                id="add-video-panel"
              >
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide">Share YouTube Video</h4>
                  <p className="text-[10px] text-slate-500">Paste an educational or fun link to share it on your public shelf!</p>
                </div>

                <form onSubmit={handleSaveVideo} className="flex flex-col gap-2">
                  <input
                    id="video-title-input"
                    type="text"
                    required
                    placeholder="Enter Video Title (e.g. Science of Fireflies!)"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400 placeholder-slate-400"
                  />

                  <input
                    id="video-url-input"
                    type="text"
                    required
                    placeholder="Paste YouTube Link (e.g. www.youtube.com/watch?...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400 placeholder-slate-400"
                  />

                  {videoError && <p className="text-[10px] text-red-500 font-bold">{videoError}</p>}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Stream</label>
                      <select
                        id="video-category-select"
                        value={videoCategory}
                        onChange={(e) => setVideoCategory(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="education">🎓 Education</option>
                        <option value="fun">🧩 Fun Activites</option>
                        <option value="information">🌍 Information</option>
                        <option value="entertainment">🎬 Entertainment</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Topic Tag</label>
                      <select
                        id="video-subcategory-select"
                        value={videoSubcategory}
                        onChange={(e) => setVideoSubcategory(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="science-space">🚀 Science / Space</option>
                        <option value="craft-diy">🖌️ Crafts / DIY</option>
                        <option value="riddles">💡 Brain Riddles</option>
                        <option value="animals-nature">🐾 Animals / Nature</option>
                        <option value="how-things-work">⚙️ Engineering</option>
                        <option value="safe-gaming">🎮 Safe Gaming</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    id="video-desc-input"
                    placeholder="Short summary about why you like this video... (optional)"
                    value={videoDesc}
                    maxLength={160}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400 placeholder-slate-400 resize-none"
                  ></textarea>

                  <div className="flex justify-end gap-1.5 mt-1 border-t border-slate-100 pt-2">
                    <button
                      id="video-add-cancel"
                      type="button"
                      onClick={() => setIsAddingVideo(false)}
                      className="px-3 py-1.5 border border-slate-100 hover:bg-slate-50 text-[10px] font-bold text-slate-500 rounded-lg"
                    >
                      Nevermind
                    </button>
                    <button
                      id="video-add-save"
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer transition"
                    >
                      Add to Shelf ➕
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Videos Grid display */}
          <div className="flex flex-col gap-3 min-h-[150px]">
            {profile.addedVideos.length === 0 ? (
              <div className="bg-slate-50 border-4 border-dashed border-slate-150 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <VideoIcon size={30} className="stroke-[1.5]" />
                <p className="text-xs font-semibold">Your custom Video Shelf is empty!</p>
                {isOwnProfile && (
                  <p className="text-[10px] text-slate-400">Click "+ Add Video" above or explore the streaming sections on the left sidebar to add curation items!</p>
                )}
              </div>
            ) : (
              profile.addedVideos.map((video) => (
                <div
                  key={video.id}
                  id={`shelf-video-card-${video.id}`}
                  className="bg-white hover:bg-blue-50/20 rounded-2xl p-3 border border-slate-150/70 hover:border-blue-200/50 hover:shadow-md transition duration-200 flex items-start gap-3 relative group animate-fade-in"
                >
                  {/* YouTube static thumbnail snippet */}
                  <div className="relative w-24 aspect-video rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/5 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-800 shadow">
                        <Play size={10} className="fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4
                      onClick={() => onWatchVideo(video)}
                      className="font-bold text-slate-800 text-xs md:text-sm hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
                    >
                      {video.title}
                    </h4>
                    <span className="inline-block mt-1 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                      #{video.subcategory}
                    </span>
                    <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">
                      {video.description}
                    </p>
                  </div>

                  {/* Actions (like delete on personalized library) */}
                  {isOwnProfile ? (
                    <button
                      id={`delete-vid-btn-${video.id}`}
                      onClick={() => handleDeleteVideo(video.id)}
                      className="absolute right-2 bottom-2 p-1.5 text-slate-350 hover:text-rose-650 rounded-lg hover:bg-rose-50 transition cursor-pointer md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onWatchVideo(video)}
                      className="absolute right-2 top-2 p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg text-[10px] font-bold"
                    >
                      Watch
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT HAND SIDE: THE FACEBOOK-STYLE TEXT FEED WALL (7/12 grid elements) --- */}
        <div className="lg:col-span-7 flex flex-col gap-4" id="text-post-timeline">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-1.5 uppercase tracking-tight">
              <MessageSquare className="text-blue-500" size={20} /> My Post Feeds & Questions ({profile.posts.length})
            </h3>
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <button
                  id="toggle-add-post-btn"
                  onClick={() => { setIsAddingPost(!isAddingPost); setIsAddingCollab(false); }}
                  className={`p-1 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer border ${
                    isAddingPost 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-blue-50 text-blue-700 border-blue-105 hover:bg-blue-100'
                  }`}
                >
                  <Plus size={14} /> Write Post
                </button>
                <button
                  id="toggle-add-collab-btn"
                  onClick={() => { setIsAddingCollab(!isAddingCollab); setIsAddingPost(false); }}
                  className={`p-1 px-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                    isAddingCollab 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs' 
                      : 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100'
                  }`}
                >
                  <span className="text-xs">👥</span> Joint Journal
                </button>
              </div>
            )}
          </div>

          {/* Add custom text post modal form */}
          <AnimatePresence>
            {isOwnProfile && isAddingPost && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 border-2 border-blue-105 shadow-sm flex flex-col gap-3"
                id="add-post-panel"
              >
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide">Write to My Wall</h4>
                  <p className="text-[10px] text-slate-500">Ask a learning question, share an amazing fact, or describe your day!</p>
                </div>

                <form onSubmit={handleSavePost} className="flex flex-col gap-2">
                  <input
                    id="post-title-input"
                    type="text"
                    placeholder="Post Subject/Title... (optional)"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-400"
                  />

                  <textarea
                    id="post-content-input"
                    required
                    placeholder="Did you know that... / When I watch space videos, I wonder..."
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-400 resize-none"
                  ></textarea>

                  {/* Mood Selector Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Mood:</span>
                    <div className="flex flex-wrap gap-1">
                      {MOODS.map((m) => (
                        <button
                          key={m.emoji}
                          id={`mood-btn-${m.label}`}
                          type="button"
                          onClick={() => setPostMood(m.emoji)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:scale-105 hover:bg-slate-100 transition cursor-pointer ${
                            postMood === m.emoji ? 'bg-blue-50 border border-blue-300 scale-105' : 'bg-transparent border border-transparent'
                          }`}
                          title={m.label}
                        >
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-2 border-t border-slate-100 pt-2">
                    <button
                      id="post-add-cancel"
                      type="button"
                      onClick={() => setIsAddingPost(false)}
                      className="px-3 py-1.5 border border-slate-100 hover:bg-slate-50 text-[10px] font-bold text-slate-500 rounded-lg"
                    >
                      Nevermind
                    </button>
                    <button
                      id="post-add-save"
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer transition"
                    >
                      Broadside to Wall 📝
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {isOwnProfile && isAddingCollab && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-4 md:p-5 border-2 border-purple-200 shadow-sm flex flex-col gap-4"
                id="add-collab-panel"
              >
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <div>
                    <h4 className="font-black text-purple-800 text-xs md:text-sm uppercase tracking-wide flex items-center gap-1.5">
                      <span>👥</span> Collaborative Joint Journal Builder
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Brainstorm and publish safe, exciting learning stories together with friends!</p>
                  </div>
                  <span className="bg-purple-100 text-purple-800 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-md">
                    Step {collabStep} of 2
                  </span>
                </div>

                {collabStep === 1 ? (
                  <div className="flex flex-col gap-4">
                    {/* Choose Partner */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 flex items-center gap-1">
                        <span>1. Select Your Co-Author Partner:</span>
                      </label>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* Mascots List */}
                        {MASCOTS.map((m) => {
                          const isSelected = collabCoAuthorId === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setCollabCoAuthorId(m.id);
                                setCollabCoAuthorName(m.name);
                                setCollabCoAuthorAvatar(m.avatar);
                              }}
                              className={`p-2 rounded-xl text-left border transition flex items-center gap-2 relative cursor-pointer ${
                                isSelected 
                                  ? 'border-purple-400 bg-purple-50 hover:ring-2 hover:ring-purple-100 shadow-xs' 
                                  : 'border-slate-150 hover:bg-slate-50/50'
                              }`}
                            >
                              <span className="text-2xl shrink-0">{m.avatar}</span>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-snug">{m.name.split(' ')[0]}</h5>
                                <p className="text-[8px] text-slate-400 truncate mt-0.5">Mascot Pal</p>
                              </div>
                              {isSelected && (
                                <span className="absolute right-1.5 top-1.5 text-purple-750 font-bold text-[8px] bg-purple-100 px-1 rounded-sm uppercase">Active</span>
                              )}
                            </button>
                          );
                        })}

                        {/* Stored Friends List integration */}
                        {savedFriends.map((f) => {
                          const isSelected = collabCoAuthorId === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                setCollabCoAuthorId(f.id);
                                setCollabCoAuthorName(f.name);
                                setCollabCoAuthorAvatar(f.avatar);
                              }}
                              className={`p-2 rounded-xl text-left border transition flex items-center gap-2 relative cursor-pointer ${
                                isSelected 
                                  ? 'border-purple-400 bg-purple-50 hover:ring-2 hover:ring-purple-100 shadow-xs' 
                                  : 'border-slate-150 hover:bg-slate-50/50'
                              }`}
                            >
                              <span className="text-2xl shrink-0">{f.avatar}</span>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-snug">{f.name}</h5>
                                <p className="text-[8px] text-emerald-650 truncate mt-0.5">Saved Network</p>
                              </div>
                              {isSelected && (
                                <span className="absolute right-1.5 top-1.5 text-emerald-650 font-bold text-[8px] bg-emerald-100 px-1 rounded-sm uppercase">Active</span>
                              )}
                            </button>
                          );
                        })}

                        {/* Custom Classmate/Buddy Option Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCollabCoAuthorId('custom-co-author');
                            setCollabCoAuthorName(customCoAuthorNameInput || 'My Secret Buddy 🌟');
                            setCollabCoAuthorAvatar(customCoAuthorAvatarInput);
                          }}
                          className={`p-2 rounded-xl text-left border transition flex items-center gap-2 relative cursor-pointer ${
                            collabCoAuthorId === 'custom-co-author'
                              ? 'border-purple-400 bg-purple-50 hover:ring-2 hover:ring-purple-100 shadow-xs'
                              : 'border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 text-slate-500'
                          }`}
                        >
                          <span className="text-2xl shrink-0">✍️</span>
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-snug">Custom Buddy</h5>
                            <p className="text-[8px] text-purple-650 truncate mt-0.5">Type Any Name</p>
                          </div>
                          {collabCoAuthorId === 'custom-co-author' && (
                            <span className="absolute right-1.5 top-1.5 text-purple-750 font-bold text-[8px] bg-purple-100 px-1 rounded-sm uppercase">Active</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Custom Buddy Inputs if Active */}
                    {collabCoAuthorId === 'custom-co-author' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-purple-50/45 p-3 rounded-xl border border-purple-100 flex flex-col gap-2.5"
                      >
                        <span className="text-[9px] uppercase font-black text-purple-800">Customize Your Partner Profile:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Classmate / Buddy Name</span>
                            <input
                              type="text"
                              value={customCoAuthorNameInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomCoAuthorNameInput(val);
                                setCollabCoAuthorName(val || 'Custom Buddy 🌟');
                              }}
                              placeholder="e.g. Leo, Sarah, Dr. Quantum..."
                              className="bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-purple-400 text-slate-800 font-bold"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Choose their Avatar Emoji</span>
                            <div className="flex gap-1 flex-wrap">
                              {['🧑‍🚀', '👾', '🦊', '🎨', '⚽', '😺', '🧙', '🐧', '🧚', '🌟'].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setCustomCoAuthorAvatarInput(emoji);
                                    setCollabCoAuthorAvatar(emoji);
                                  }}
                                  className={`p-1.5 rounded-md text-sm hover:bg-white border transition ${
                                    customCoAuthorAvatarInput === emoji ? 'border-purple-400 bg-purple-50 scale-110' : 'border-slate-100'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Creative prompts / Title options */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                        2. Choose an Exciting Adventure Topic to Begin:
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {COLLAB_PROMPTS.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button; button"
                            onClick={() => handleSelectPrompt(pIdx)}
                            className="bg-slate-50/60 hover:bg-purple-50/10 border border-slate-200 hover:border-purple-250 p-2.5 rounded-xl text-left transition cursor-pointer flex flex-col gap-1 group"
                          >
                            <h5 className="font-extrabold text-xs text-slate-800 group-hover:text-purple-700 flex items-center gap-1">
                              {prompt.title}
                            </h5>
                            <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed">
                              "{prompt.starter}"
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Or Start a Custom Blank Story */}
                      <div className="pt-2 border-t border-slate-100 mt-2 flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-black tracking-wider text-slate-400">
                          Or Start a Custom Blank Story:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Our custom adventure title..."
                            value={collabTitle}
                            onChange={(e) => setCollabTitle(e.target.value)}
                            className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!collabTitle.trim()) return;
                              setCollabDraft1("Once upon a time, we...");
                              setCollabDraft2("We saw an interesting...");
                              setCollabDraft3("Then we learned...");
                              setCollabDraft4("In conclusion, exploration rules!");
                              setCollabStep(2);
                            }}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] rounded-lg transition"
                          >
                            Let's Draft 📝
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 🔗 CONNECT ADVENTURE MATERIAL PORTAL */}
                    <div className="pt-3 border-t border-purple-100 flex flex-col gap-2.5 bg-purple-50/20 p-3 rounded-2xl border border-purple-100/40">
                      <label className="text-[10px] uppercase font-black tracking-wider text-purple-800 flex items-center gap-1.5">
                        <span className="text-sm">🔗</span> 3. Connect Adventure Material (YouTube Videos, Books, or Games):
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {/* Video Connector option */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-black text-slate-400">Attach YouTube Video</span>
                          <select
                            value={attachedCollabVideo ? attachedCollabVideo.youtubeId : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                setAttachedCollabVideo(null);
                              } else {
                                const allVids = [...(profile.addedVideos || []), ...PRESET_VIDEOS];
                                const found = allVids.find(v => v.youtubeId === val);
                                if (found) setAttachedCollabVideo(found);
                              }
                            }}
                            className="bg-white border border-slate-200 text-[10px] p-2 rounded-lg text-slate-755 font-bold focus:ring-1 focus:ring-purple-400 focus:outline-none"
                          >
                            <option value="">-- Pin No Video --</option>
                            {(profile.addedVideos || []).map(v => (
                              <option key={v.youtubeId || v.id} value={v.youtubeId}>📺 {v.title}</option>
                            ))}
                            <option disabled>──────────</option>
                            <option value="edu-1">📺 Volcano Expedition (Mariana Trench)</option>
                            <option value="edu-2">📺 Space Science: Venus Planet Secrets</option>
                            <option value="edu-3">📺 History: Nile River Expedition</option>
                            <option value="edu-4">📺 Math: Smart Division of 3s</option>
                          </select>
                        </div>

                        {/* Book Connector option */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-black text-slate-400">Attach Book studied</span>
                          <select
                            value={attachedCollabBook ? `${attachedCollabBook.title}||${attachedCollabBook.author}` : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                setAttachedCollabBook(null);
                              } else {
                                const [t, a] = val.split('||');
                                setAttachedCollabBook({ title: t, author: a });
                              }
                            }}
                            className="bg-white border border-slate-200 text-[10px] p-2 rounded-lg text-slate-755 font-bold focus:ring-1 focus:ring-purple-400 focus:outline-none"
                          >
                            <option value="">-- Link No Book --</option>
                            {profile.books && profile.books.map(b => (
                              <option key={b.id || b.title} value={`${b.title}||${b.author}`}>📖 {b.title}</option>
                            ))}
                            <option disabled>──────────</option>
                            <option value="The Magic Treehouse Discovery||Mary Pope Osborne">📖 The Magic Treehouse</option>
                            <option value="The Secret Lake Mystery||Karen Inglis">📖 The Secret Lake Mystery</option>
                            <option value="Awesome Science Volcanoes||Doctor Dino">📖 Awesome Science Volcanoes</option>
                            <option value="Math Wizards Riddle Codex||Socrates Sums">📖 Math Wizards Riddle Codex</option>
                          </select>
                        </div>

                        {/* Mini-game Connector option */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] uppercase font-black text-slate-400">Attach Arcade Game played</span>
                          <select
                            value={attachedCollabGame ? attachedCollabGame.id : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                setAttachedCollabGame(null);
                              } else if (val === 'match') {
                                setAttachedCollabGame({ id: 'match', name: 'Memory Matcher 🧠', icon: '🧠' });
                              } else if (val === 'scramble') {
                                setAttachedCollabGame({ id: 'scramble', name: 'Spelling Bee Unscrambler 🐝', icon: '🐝' });
                              }
                            }}
                            className="bg-white border border-slate-200 text-[10px] p-2 rounded-lg text-slate-755 font-bold focus:ring-1 focus:ring-purple-400 focus:outline-none"
                          >
                            <option value="">-- Link No Game --</option>
                            <option value="match">🎮 Memory Matcher 🧠</option>
                            <option value="scramble">🎮 Spelling Bee Unscrambler 🐝</option>
                          </select>
                        </div>
                      </div>

                      {/* Attachment Status Preview Bubble */}
                      {(attachedCollabVideo || attachedCollabBook || attachedCollabGame) && (
                        <div className="text-[9px] font-black text-purple-900 bg-purple-100/65 px-2.5 py-2 rounded-xl border border-purple-200/50 flex flex-wrap gap-2.5 items-center">
                          <span className="animate-pulse">✨ Connected live attachments:</span>
                          {attachedCollabVideo && <span className="bg-white text-purple-700 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 font-bold">📺 {attachedCollabVideo.title}</span>}
                          {attachedCollabBook && <span className="bg-white text-purple-700 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 font-bold">📖 {attachedCollabBook.title}</span>}
                          {attachedCollabGame && <span className="bg-white text-purple-700 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 font-bold">🎮 {attachedCollabGame.name}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingCollab(false)}
                        className="px-3 py-1.5 border border-slate-150 hover:bg-slate-50 text-[10px] font-bold text-slate-500 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // STEP 2: ALTERNATING story creation
                  <div className="flex flex-col gap-4">
                    <div className="bg-purple-50/40 border border-purple-100 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-purple-650 block">Active Topic</span>
                        <h4 className="font-extrabold text-slate-800 text-xs md:text-sm truncate">{collabTitle}</h4>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[8px] font-black uppercase tracking-widest text-purple-650 block font-bold">Collaborating With</span>
                        <span className="text-[11px] font-black text-purple-800 flex items-center justify-end gap-1">
                          <span>{collabCoAuthorAvatar}</span> {collabCoAuthorName.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="text-[10px] text-slate-500 font-medium">
                        ✨ Take turns building details! If writing with a mascot, you can click <strong className="text-purple-700">Spark Mascot Ideas</strong> to automatically load their creative lines based on your selected prompt!
                      </p>

                      {/* Paragraph 1: Me */}
                      <div className="border border-slate-150 rounded-xl p-3 bg-white flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{profile.avatarUrl}</span>
                          <span className="text-[9px] uppercase font-black text-blue-600">Turn 1: {profile.displayName} (Introduction)</span>
                        </div>
                        <textarea
                          rows={2}
                          value={collabDraft1}
                          onChange={(e) => setCollabDraft1(e.target.value)}
                          placeholder="Introduce the adventure prompt..."
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Paragraph 2: Partner */}
                      <div className="border border-purple-105 rounded-xl p-3 bg-purple-50/10 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{collabCoAuthorAvatar}</span>
                            <span className="text-[9px] uppercase font-black text-purple-700">Turn 2: {collabCoAuthorName} (Development)</span>
                          </div>
                          {collabCoAuthorId.startsWith('mascot') && (
                            <button
                              type="button"
                              onClick={() => handleTriggerMascotBrainstorm(2)}
                              className="text-[8px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 hover:bg-purple-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                            >
                              ✨ Spark Mascot Ideas
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={collabDraft2}
                          onChange={(e) => setCollabDraft2(e.target.value)}
                          placeholder="Collaborator contribution..."
                          className="w-full text-xs p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Paragraph 3: Me */}
                      <div className="border border-slate-150 rounded-xl p-3 bg-white flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{profile.avatarUrl}</span>
                          <span className="text-[9px] uppercase font-black text-blue-600">Turn 3: {profile.displayName} (Plot Twist)</span>
                        </div>
                        <textarea
                          rows={2}
                          value={collabDraft3}
                          onChange={(e) => setCollabDraft3(e.target.value)}
                          placeholder="What interesting turn did the project take next?"
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Paragraph 4: Partner */}
                      <div className="border border-purple-105 rounded-xl p-3 bg-purple-50/10 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{collabCoAuthorAvatar}</span>
                            <span className="text-[9px] uppercase font-black text-purple-700">Turn 4: {collabCoAuthorName} (Conclusion)</span>
                          </div>
                          {collabCoAuthorId.startsWith('mascot') && (
                            <button
                              type="button"
                              onClick={() => handleTriggerMascotBrainstorm(4)}
                              className="text-[8px] font-black uppercase tracking-wider text-purple-700 bg-purple-100/90 hover:bg-purple-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                            >
                              ✨ Spark Mascot Ideas
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={collabDraft4}
                          onChange={(e) => setCollabDraft4(e.target.value)}
                          placeholder="How did the discovery conclude?"
                          className="w-full text-xs p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setCollabStep(1)}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        ↩️ Back to Prompts
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCollab(false)}
                          className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handlePublishCollaborativeJournal}
                          className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-750 hover:to-indigo-750 text-white font-black text-[10px] rounded-lg shadow-md transition cursor-pointer"
                        >
                          Publish Joint Journal 🎉
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts Wall listing */}
          <div className="flex flex-col gap-4 min-h-[200px]">
            {profile.posts.length === 0 ? (
              <div className="bg-slate-50 border-4 border-dashed border-slate-150 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <MessageSquare size={30} className="stroke-[1.5]" />
                <p className="text-xs font-semibold">No posts on your wall yet!</p>
                {isOwnProfile && (
                  <p className="text-[10px] text-slate-400">Be the first to share an interesting thing you learned! Tap "Write Post" above.</p>
                )}
              </div>
            ) : (
              profile.posts.map((post) => {
                const isSystemPost = post.content.includes('Watched the video:');
                const likes = postLikes[post.id] || 0;
                return (
                  <div
                    key={post.id}
                    id={`wall-post-${post.id}`}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-slate-150/70 hover:shadow shadow-sm transition flex flex-col gap-3 relative group"
                  >
                    {/* Post Card Header */}
                    <div className="flex items-center gap-3">
                      {/* Circle mini emblem */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {post.moodEmoji || '😊'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 text-xs md:text-sm flex flex-wrap items-center gap-1">
                            <span>{post.authorName === profile.displayName ? profile.displayName : post.authorName}</span>
                            {post.isCollaborative && (
                              <span className="text-slate-400 font-medium flex items-center gap-1">
                                <span>&amp;</span>
                                <span className="bg-purple-100/80 text-purple-800 font-extrabold px-1.5 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                                  <span className="text-xs">{post.coAuthorAvatar || '🦉'}</span> {post.coAuthorName}
                                </span>
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-blue-650 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                            Level {Math.floor(profile.xpPoints / 100) + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Clock size={10} />
                          <span>{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Post delete for owner */}
                      {isOwnProfile && (
                        <button
                          id={`delete-post-${post.id}`}
                          onClick={() => handleDeletePost(post.id)}
                          className="absolute right-4 top-4 p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete Post"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="mt-1">
                      <h4 className="font-black text-slate-850 text-sm md:text-base leading-snug flex items-center gap-1.5">
                        {post.isCollaborative && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[9px] uppercase font-black border border-purple-100 shrink-0">👥 Co-op Journal</span>}
                        <span>{post.title}</span>
                      </h4>

                      {post.isCollaborative && post.collabParagraphs ? (
                        <div className="mt-3 flex flex-col gap-2.5 bg-gradient-to-br from-purple-50/20 to-indigo-50/10 rounded-2xl p-3 border border-purple-100/50">
                          {post.collabParagraphs.map((par, pIdx) => {
                            const isMe = par.writerName === profile.displayName;
                            return (
                              <div 
                                key={pIdx} 
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl transition ${
                                  isMe 
                                    ? 'bg-white border border-slate-100/80 shadow-2xs' 
                                    : 'bg-purple-50/40 border border-purple-100/40 shadow-2xs'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base border border-slate-150 shadow-xs shrink-0">
                                  {par.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`block text-[9px] uppercase font-black tracking-wider ${isMe ? 'text-blue-600' : 'text-purple-600'}`}>
                                    {par.writerName}
                                  </span>
                                  <p className="text-xs text-slate-755 font-medium mt-0.5 whitespace-pre-line leading-relaxed">
                                    {par.text}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs md:text-sm text-slate-650 mt-1.5 whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>
                      )}

                      {/* Render Linked/Attached Materials */}
                      {(post.attachedVideo || post.attachedBook || post.attachedGame) && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-dashed border-slate-200/80 pt-3">
                          {/* Attached Video */}
                          {post.attachedVideo && (
                            <button
                              type="button"
                              onClick={() => {
                                if (post.attachedVideo && onWatchVideo) {
                                  onWatchVideo(post.attachedVideo);
                                }
                              }}
                              className="text-left bg-blue-50/70 hover:bg-blue-100 border border-blue-150 p-2.5 rounded-xl transition flex items-center gap-2.5 group/vid cursor-pointer"
                            >
                              <div className="w-9 h-9 rounded-lg bg-blue-650 flex items-center justify-center shrink-0 shadow-xs text-white group-hover/vid:scale-105 transition">
                                <Play size={12} className="fill-white ml-0.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] uppercase font-black text-blue-600 block tracking-wider">📺 Linked YouTube Video</span>
                                <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-tight mt-0.5">{post.attachedVideo.title}</h5>
                                <p className="text-[9px] text-blue-650 font-bold mt-0.5">Click to Watch & Play Trivia! 🍿</p>
                              </div>
                            </button>
                          )}

                          {/* Attached Book */}
                          {post.attachedBook && (
                            <div className="bg-amber-50/75 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 shadow-xs text-white">
                                <BookOpen size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] uppercase font-black text-amber-700 block tracking-wider">📖 Linked Book Study</span>
                                <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-tight mt-0.5">{post.attachedBook.title}</h5>
                                <p className="text-[9px] text-amber-750 font-bold mt-0.5">By {post.attachedBook.author} 📜</p>
                              </div>
                            </div>
                          )}

                          {/* Attached Game */}
                          {post.attachedGame && (
                            <div className="bg-purple-50/70 border border-purple-150 p-2.5 rounded-xl flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 shadow-xs text-white">
                                <Gamepad2 size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] uppercase font-black text-purple-700 block tracking-wider">🎮 Associated Arcade Game</span>
                                <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-tight mt-0.5">{post.attachedGame.name}</h5>
                                <p className="text-[9px] text-purple-755 font-bold mt-0.5">Play in the Arcade zone! 🏆</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fun Interactive Panel for visitors to show support */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <button
                        id={`post-like-btn-${post.id}`}
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-pink-600 transition cursor-pointer group"
                      >
                        <Heart size={14} className={`group-active:scale-125 transition ${likes > 0 ? 'fill-pink-500 stroke-pink-500' : ''}`} />
                        <span className="font-semibold">{likes > 0 ? `${likes} Hearts!` : "Give a Heart"}</span>
                      </button>

                      <span className="text-[10px] text-slate-400 italic">
                        {isSystemPost ? '📖 Study Reflection' : '💡 Public Post'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 4. EXPANDED BOARDS: CURATED BOOKSHELF & SPELLING BOARD MINI-GAME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* --- LEFT HAND SIDE: MY BOOK SHELF (5/12 grid elements) --- */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm" id="literature-bookshelf-timeline">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-1.5 uppercase tracking-tight">
                <Book className="text-purple-650" size={18} /> Shared Book Shelf ({(profile.books || []).length})
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Log what you read and write nice reviews!</p>
            </div>
            {isOwnProfile && (
              <button
                id="toggle-add-book-btn"
                onClick={() => setIsAddingBook(!isAddingBook)}
                className="p-1 px-3 bg-purple-50 hover:bg-purple-100 text-purple-750 border border-purple-150 rounded-xl font-bold text-xs flex items-center gap-0.5 transition cursor-pointer"
              >
                <Plus size={14} /> Log Book
              </button>
            )}
          </div>

          {/* Add custom Book Inline Area */}
          <AnimatePresence>
            {isOwnProfile && isAddingBook && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-purple-50/50 rounded-2xl p-4 border border-purple-150 flex flex-col gap-3"
                id="add-book-panel"
              >
                <form onSubmit={handleSaveBook} className="flex flex-col gap-2">
                  <input
                    id="book-title-input"
                    type="text"
                    required
                    placeholder="Book Title (e.g. Harry Potter)"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 text-slate-800 font-bold"
                  />

                  <input
                    id="book-author-input"
                    type="text"
                    required
                    placeholder="Author Name (e.g. J. K. Rowling)"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 text-slate-800 font-bold"
                  />

                  <textarea
                    id="book-review-input"
                    placeholder="Tell your friends what you learned or loved about this book (optional)..."
                    rows={2}
                    value={bookReview}
                    onChange={(e) => setBookReview(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-slate-400 text-slate-700 resize-none"
                  ></textarea>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Status:</span>
                    <div className="flex gap-1.5Box">
                      <button
                        type="button"
                        onClick={() => setBookStatus('completed')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          bookStatus === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Completed 🎉
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookStatus('reading')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          bookStatus === 'reading'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Reading 📖
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-2 border-t border-purple-200/50 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingBook(false)}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-500 font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] rounded-lg shadow cursor-pointer text-center"
                    >
                      Place on Shelf 📕
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Books */}
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-none">
            {(!profile.books || profile.books.length === 0) ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                <BookOpen size={24} className="stroke-[1.5]" />
                <p className="text-xs font-semibold">No books on your shelf yet!</p>
                {isOwnProfile && (
                  <p className="text-[9px] text-slate-400">Share your favorite literature easily! Click "Log Book" above to begin.</p>
                )}
              </div>
            ) : (
              profile.books.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-50/70 border border-slate-150/80 p-3 rounded-2xl flex flex-col gap-1 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-xs truncate max-w-[200px]">
                      📕 {b.title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => isOwnProfile && handleToggleBookStatus(b.id)}
                        disabled={!isOwnProfile}
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          b.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {b.status === 'completed' ? 'Completed 🎉' : 'Reading 📖'}
                      </button>

                      {isOwnProfile && (
                        <button
                          onClick={() => handleDeleteBook(b.id)}
                          className="text-slate-350 hover:text-rose-600 transition p-0.5 rounded"
                          title="Delete book entry"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold italic">By {b.author}</p>
                  
                  {b.review && (
                    <div className="bg-white border border-slate-100 rounded-lg p-2 mt-1.5 text-[10px] text-slate-600 leading-relaxed font-mono">
                      {b.review}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT HAND SIDE: INTERACTIVE SCIENTIFIC GAMES TARGET (7/12 elements) --- */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4" id="achievement-games-panel">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-1.5 uppercase tracking-tight">
              <Gamepad2 className="text-amber-500 animate-spin-slow" size={18} /> Interactive Spelling Games
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Solve word puzzles and complete spelling tests to unlock shiny profile stickers and badges!</p>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1">
                📌 Scrambled Words Mini Game
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Word {scrambleIndex + 1} of {SCRAMBLE_WORDS_POOL.length}</span>
            </div>

            <div className="text-center py-3">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Unscramble the letters below:</p>
              <h4 className="text-2xl font-black text-indigo-900 tracking-widest mt-1.5 bg-indigo-50 border border-indigo-150 inline-block px-5 py-2 rounded-2xl shadow-inner">
                {SCRAMBLE_WORDS_POOL[scrambleIndex].scrambled}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-2 italic">
                💡 Hint: {SCRAMBLE_WORDS_POOL[scrambleIndex].hint}
              </p>
            </div>

            <form onSubmit={handleCheckScrambleWord} className="flex gap-2">
              <input
                type="text"
                placeholder="Type your solved answer..."
                value={gameInput}
                onChange={(e) => setGameInput(e.target.value)}
                disabled={gameChecked && isGameCorrect}
                className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
              />
              <button
                type="submit"
                disabled={!gameInput.trim() || (gameChecked && isGameCorrect)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 active:scale-95 transition text-slate-900 font-black text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Submit Solve!
              </button>
            </form>

            {gameChecked && (
              <div className="p-3 bg-white border rounded-xl">
                {isGameCorrect ? (
                  <div className="text-xs text-emerald-700 flex items-center justify-between">
                    <span className="font-bold">🎉 Brilliant! You've solved the scrambled word correctly! +25 XP awarded.</span>
                    <button
                      onClick={handleNextScramble}
                      type="button"
                      className="px-2.5 py-1 bg-emerald-600 font-bold text-[9px] text-white rounded-lg whitespace-nowrap"
                    >
                      Next Puzzle &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-rose-700 flex items-center justify-between">
                    <span className="font-semibold">❌ Not quite right. Review the hint and letters, and try again!</span>
                    <button
                      onClick={() => {
                        setGameChecked(false);
                        setGameInput('');
                      }}
                      type="button"
                      className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold text-[9px] rounded-lg"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Locked achievement overview */}
          <div className="border border-slate-150 rounded-2xl p-4 flex flex-col gap-2.5 bg-slate-50/30">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">🔒 Trophy Badge Unlock Quests</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-start gap-2.5">
                <span className="text-lg mt-0.5">📚</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-800">Lover of Literature</p>
                  <p className="text-[9px] text-slate-500 leading-tight">Log your very first book item on your personal shelf.</p>
                  <span className={`text-[8px] font-bold uppercase mt-1 inline-block ${profile.badges?.includes('Lover of Literature 📖') ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {profile.badges?.includes('Lover of Literature 📖') ? '✅ Completed!' : '⏳ Not Complete'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-start gap-2.5">
                <span className="text-lg mt-0.5">🐝</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-800">Spelling Bee Champion</p>
                  <p className="text-[9px] text-slate-500 leading-tight">Unscramble any spelling word or pass school levels.</p>
                  <span className={`text-[8px] font-bold uppercase mt-1 inline-block ${profile.badges?.includes('Spelling Bee Champion 🐝') ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {profile.badges?.includes('Spelling Bee Champion 🐝') ? '✅ Completed!' : '⏳ Not Complete'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
