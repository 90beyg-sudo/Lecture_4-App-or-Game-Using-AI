import { UserProfile } from '../types';

/**
 * Unicode-safe Base64 encoder for strings
 */
export function encodeProfile(profile: UserProfile): string {
  try {
    const minified = {
      id: profile.id,
      name: profile.displayName,
      avatar: profile.avatarUrl,
      bio: profile.bio,
      topic: profile.favoriteTopic,
      xp: profile.xpPoints,
      badges: profile.badges,
      videos: profile.addedVideos.map(v => ({
        id: v.id,
        t: v.title,
        y: v.youtubeId,
        c: v.category,
        s: v.subcategory,
        d: v.description,
        a: v.addedBy,
        ts: v.createdAt
      })),
      posts: profile.posts.map(p => ({
        id: p.id,
        t: p.title,
        c: p.content,
        ts: p.createdAt,
        m: p.moodEmoji,
        a: p.authorName,
        isCol: p.isCollaborative || undefined,
        coa: p.coAuthorName || undefined,
        coav: p.coAuthorAvatar || undefined,
        par: p.collabParagraphs || undefined,
        attVid: p.attachedVideo || undefined,
        attBook: p.attachedBook || undefined,
        attGame: p.attachedGame || undefined
      })),
      banner: profile.customBannerColor
    };
    
    const jsonStr = JSON.stringify(minified);
    return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (error) {
    console.error('Failed to encode profile:', error);
    return '';
  }
}

/**
 * Unicode-safe Base64 decoder for strings
 */
export function decodeProfile(base64Str: string): UserProfile | null {
  try {
    const rawStr = decodeURIComponent(
      Array.prototype.map.call(atob(base64Str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    const parsed = JSON.parse(rawStr);
    
    return {
      id: parsed.id || 'anonymous',
      displayName: parsed.name || 'Anonymous Learner',
      avatarUrl: parsed.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: parsed.bio || '',
      favoriteTopic: parsed.topic || 'science-space',
      xpPoints: typeof parsed.xp === 'number' ? parsed.xp : 120,
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      addedVideos: Array.isArray(parsed.videos) ? parsed.videos.map((v: any) => ({
        id: v.id || Math.random().toString(36).substr(2, 9),
        title: v.t || '',
        youtubeId: v.y || '',
        category: v.c || 'education',
        subcategory: v.s || '',
        description: v.d || '',
        addedBy: v.a || '',
        createdAt: v.ts || new Date().toISOString()
      })) : [],
      posts: Array.isArray(parsed.posts) ? parsed.posts.map((p: any) => ({
        id: p.id || Math.random().toString(36).substr(2, 9),
        title: p.t || '',
        content: p.c || '',
        createdAt: p.ts || new Date().toISOString(),
        moodEmoji: p.m || '😊',
        authorName: p.a || 'Friend',
        isCollaborative: p.isCol || undefined,
        coAuthorName: p.coa || undefined,
        coAuthorAvatar: p.coav || undefined,
        collabParagraphs: p.par || undefined,
        attachedVideo: p.attVid || undefined,
        attachedBook: p.attBook || undefined,
        attachedGame: p.attGame || undefined
      })) : [],
      customBannerColor: parsed.banner || 'from-sky-400 to-indigo-500'
    };
  } catch (error) {
    console.error('Failed to decode profile:', error);
    return null;
  }
}

/**
 * Generate a complete sharing link for a profile
 */
export function generateShareUrl(profile: UserProfile): string {
  const encoded = encodeProfile(profile);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?sharedProfile=${encoded}`;
}

/**
 * YouTube utility to extract video ID from a URL
 */
export function extractYoutubeId(urlStr: string): string | null {
  if (!urlStr) return null;
  
  // Try direct video ID
  if (urlStr.length === 11 && !urlStr.includes('/') && !urlStr.includes('?')) {
    return urlStr;
  }

  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlStr.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  } catch (e) {
    // Ignore error
  }
  
  return null;
}
