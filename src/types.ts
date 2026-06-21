/**
 * TYPES FOR THE YOUTUBE KIDS KNOWLEDGE & PROFILE HUB
 */

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  category: string; // e.g., 'education', 'fun', 'information', 'entertainment'
  subcategory: string; // e.g., 'science', 'riddles', etc.
  description: string;
  addedBy?: string; // username
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  moodEmoji?: string;
  authorName: string;
  isCollaborative?: boolean;
  coAuthorName?: string;
  coAuthorAvatar?: string;
  collabParagraphs?: { writerName: string; text: string; avatar: string }[];
  attachedVideo?: Video;
  attachedBook?: { title: string; author: string };
  attachedGame?: { id: string; name: string; icon: string };
}

export interface UserProfile {
  id: string; // Unique string or slug for routing/sharing
  displayName: string;
  avatarUrl: string;
  bio: string;
  favoriteTopic: string;
  xpPoints: number;
  badges: string[];
  addedVideos: Video[];
  posts: Post[];
  customBannerColor: string; // e.g., gradient or solid color
  birthday?: string; // Birthdate e.g. YYYY-MM-DD
  gradeClass?: string; // School grade / class status
  books?: {
    id: string;
    title: string;
    author: string;
    review: string;
    status: 'reading' | 'completed';
    createdAt: string;
  }[];
  learnedWords?: string[]; // Word IDs or terms they learned
  readArticles?: string[]; // IDs of educational articles read in the reading corner
  completedVideos?: string[]; // IDs of videos watched or trivia finished
  coins?: number; // Educational treasure coins collected
  petType?: 'dragon' | 'unicorn' | 'owl' | 'panda'; // Chosen magical pet species
  petName?: string; // Custom pet name
  unlockedItems?: string[]; // Accessory item IDs that the kid bought
  equippedItems?: string[]; // Accessory item IDs active on the pet
  claimedChests?: string[]; // Adventure trail chest IDs claimed
}

export interface FriendProfile {
  id: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
}
