export type ContentStatus = 'idea' | 'draft' | 'ready' | 'published';

export type Platform = 'linkedin' | 'youtube' | 'newsletter' | 'twitter' | 'instagram' | 'tiktok';

export interface Content {
  id: string;
  type: 'post' | 'image' | 'link' | 'video';
  createdAt: number;
  updatedAt: number;
}

export interface Post extends Content {
  type: 'post';
  body: string;
  format?: 'html' | 'plaintext';
  title?: string;
  description?: string;
  status: ContentStatus;
  platform: Platform | null;
  scheduledFor?: number;
  pinned?: boolean;

  // Repurposing
  sourceId?: string;

  // Platform-specific structured fields
  hook?: string;                   // YouTube/TikTok opening hook
  subjectLine?: string;            // Newsletter subject
  preheader?: string;              // Newsletter preheader
  hashtags?: string[];             // Instagram/TikTok hashtags
  tags?: string[];                 // YouTube tags
  timestamps?: { time: string; label: string }[];  // YouTube timestamps
  threadSegments?: string[];       // Twitter thread segments
}

export type AnyContent = Post;

export interface Feed {
  items: AnyContent[];
}


export const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  newsletter: 'Newsletter',
  twitter: 'Twitter',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  ready: 'Ready',
  published: 'Published',
};

export const PLATFORM_FIELDS: Record<Platform, { title?: string; description?: string }> = {
  youtube: { title: 'Video title', description: 'Video description' },
  newsletter: { title: 'Subject line' },
  linkedin: {},
  twitter: {},
  instagram: {},
  tiktok: {},
};

export const PLATFORM_CHAR_LIMITS: Partial<Record<Platform, { body?: number; title?: number; description?: number }>> = {
  twitter: { body: 280 },
  linkedin: { body: 3000 },
  instagram: { body: 2200 },
  tiktok: { body: 2200 },
  youtube: { title: 100, description: 5000 },
};

// boolean[7] indexed 0=Mon, 1=Tue, ..., 6=Sun
export type WeeklyCadence = Record<Platform, boolean[]>;

export const DEFAULT_CADENCE: WeeklyCadence = {
  linkedin: [false, false, false, false, false, false, false],
  youtube: [false, false, false, false, false, false, false],
  newsletter: [false, false, false, false, false, false, false],
  twitter: [false, false, false, false, false, false, false],
  instagram: [false, false, false, false, false, false, false],
  tiktok: [false, false, false, false, false, false, false],
};

export const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const PLATFORM_CONTENT_LABELS: Record<Platform | 'doc', { singular: string; plural: string }> = {
  linkedin: { singular: 'Post', plural: 'Posts' },
  twitter: { singular: 'Tweet', plural: 'Tweets' },
  youtube: { singular: 'Script', plural: 'Scripts' },
  newsletter: { singular: 'Edition', plural: 'Editions' },
  instagram: { singular: 'Post', plural: 'Posts' },
  tiktok: { singular: 'Script', plural: 'Scripts' },
  doc: { singular: 'Doc', plural: 'Docs' },
};

export function getContentLabel(platform: Platform | null, plural = false): string {
  const key = platform ?? 'doc';
  const labels = PLATFORM_CONTENT_LABELS[key];
  return plural ? labels.plural : labels.singular;
}
