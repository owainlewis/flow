export type ContentStatus = 'idea' | 'draft' | 'ready' | 'published';

export type Platform = 'linkedin' | 'youtube' | 'newsletter' | 'twitter' | 'other';

export interface Content {
  id: string;
  type: 'note' | 'image' | 'link' | 'video';
  createdAt: number;
  updatedAt: number;
}

export interface Note extends Content {
  type: 'note';
  body: string;
  status: ContentStatus;
  platform: Platform | null;
  format: string | null;
  scheduledFor?: number;
}

export type AnyContent = Note;

export interface Feed {
  items: AnyContent[];
}

export interface UserFormats {
  linkedin: string[];
  youtube: string[];
  newsletter: string[];
  twitter: string[];
  other: string[];
}

export const DEFAULT_FORMATS: UserFormats = {
  linkedin: ['Post', 'Article', 'Carousel'],
  youtube: ['Script', 'Short', 'Tutorial'],
  newsletter: ['Weekly', 'Deep Dive', 'Curated'],
  twitter: ['Thread', 'Single Tweet', 'Quote Tweet'],
  other: ['Blog Post', 'Notes'],
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  newsletter: 'Newsletter',
  twitter: 'Twitter',
  other: 'Other',
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  draft: 'Draft',
  ready: 'Ready',
  published: 'Published',
};
