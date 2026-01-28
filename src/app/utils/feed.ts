import TurndownService from 'turndown';
import { Feed, Note, AnyContent, ContentStatus, Platform, UserFormats, DEFAULT_FORMATS } from '../types/content';

const STORAGE_KEY = 'contentflow-feed';
const FORMATS_KEY = 'contentflow-formats';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createNote(body: string = ''): Note {
  const now = Date.now();
  return {
    id: generateId(),
    type: 'note',
    body,
    status: 'idea',
    platform: null,
    format: null,
    createdAt: now,
    updatedAt: now,
  };
}

function migrateNote(item: Partial<Note> & { id: string; type: 'note'; body: string; createdAt: number; updatedAt: number }): Note {
  return {
    ...item,
    status: item.status || 'idea',
    platform: item.platform || null,
    format: item.format || null,
  };
}

export function loadFeed(): Feed {
  if (typeof window === 'undefined') {
    return { items: [] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const feed = JSON.parse(stored);
      // Migrate existing notes to include new fields
      const migratedItems = feed.items.map((item: AnyContent) => {
        if (item.type === 'note') {
          return migrateNote(item as Note);
        }
        return item;
      });
      return { items: migratedItems };
    } catch {
      // Invalid JSON, start fresh
    }
  }

  // Migrate from old cleartype storage if it exists
  const oldStorage = localStorage.getItem('cleartype-feed');
  if (oldStorage) {
    try {
      const oldData = JSON.parse(oldStorage);
      if (oldData.items && Array.isArray(oldData.items)) {
        const items: Note[] = oldData.items.map((item: Partial<Note>) => migrateNote(item as Note));
        const feed: Feed = { items };
        saveFeed(feed);
        return feed;
      }
    } catch {
      // Migration failed
    }
  }

  // Migrate from legacy cleartype-documents storage
  const legacyStorage = localStorage.getItem('cleartype-documents');
  if (legacyStorage) {
    try {
      const oldData = JSON.parse(legacyStorage);
      if (oldData.docs && Array.isArray(oldData.docs)) {
        const items: Note[] = oldData.docs.map((doc: { id: string; content: string; createdAt: number; updatedAt: number }) => ({
          id: doc.id,
          type: 'note' as const,
          body: doc.content || '',
          status: 'idea' as ContentStatus,
          platform: null,
          format: null,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }));
        const feed: Feed = { items };
        saveFeed(feed);
        return feed;
      }
    } catch {
      // Migration failed, start fresh
    }
  }

  return { items: [] };
}

export function saveFeed(feed: Feed): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function countChars(html: string): number {
  return stripHtml(html).length;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function sortByNewest(items: AnyContent[]): AnyContent[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteNote(id: string): void {
  const feed = loadFeed();
  feed.items = feed.items.filter((item) => item.id !== id);
  saveFeed(feed);
}

// Filter helpers
export function filterByStatus(items: AnyContent[], status: ContentStatus): AnyContent[] {
  return items.filter((item) => item.type === 'note' && (item as Note).status === status);
}

export function filterByPlatform(items: AnyContent[], platform: Platform): AnyContent[] {
  return items.filter((item) => item.type === 'note' && (item as Note).platform === platform);
}

export function getNotesForWeek(items: AnyContent[], weekStart: Date): AnyContent[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return items.filter((item) => {
    if (item.type !== 'note') return false;
    const note = item as Note;
    const itemDate = note.scheduledFor ? new Date(note.scheduledFor) : new Date(note.createdAt);
    return itemDate >= weekStart && itemDate < weekEnd;
  });
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const year = weekStart.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export function groupByPlatform(items: AnyContent[]): Record<Platform, Note[]> {
  const groups: Record<Platform, Note[]> = {
    linkedin: [],
    youtube: [],
    newsletter: [],
    twitter: [],
    other: [],
  };

  items.forEach((item) => {
    if (item.type === 'note') {
      const note = item as Note;
      const platform = note.platform || 'other';
      groups[platform].push(note);
    }
  });

  return groups;
}

// User formats management
export function loadUserFormats(): UserFormats {
  if (typeof window === 'undefined') {
    return DEFAULT_FORMATS;
  }

  const stored = localStorage.getItem(FORMATS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_FORMATS;
    }
  }
  return DEFAULT_FORMATS;
}

export function saveUserFormats(formats: UserFormats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FORMATS_KEY, JSON.stringify(formats));
}

export function addUserFormat(platform: Platform, format: string): UserFormats {
  const formats = loadUserFormats();
  if (!formats[platform].includes(format)) {
    formats[platform] = [...formats[platform], format];
    saveUserFormats(formats);
  }
  return formats;
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
});

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}
