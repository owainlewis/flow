import TurndownService from 'turndown';
import { Feed, Post, AnyContent, ContentStatus, Platform, WeeklyCadence, DEFAULT_CADENCE } from '../types/content';

const STORAGE_KEY = 'contentflow-feed';
const CADENCE_KEY = 'contentflow-cadence';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createPost(body: string = ''): Post {
  const now = Date.now();
  return {
    id: generateId(),
    type: 'post',
    body,
    status: 'idea',
    platform: null,
    createdAt: now,
    updatedAt: now,
  };
}

function migratePost(item: Partial<Post> & { id: string; body: string; createdAt: number; updatedAt: number }): Post {
  // Migrate legacy 'other' platform to null (Doc)
  const platform = (item.platform as string) === 'other' ? null : (item.platform || null);
  return {
    ...item,
    type: 'post',
    status: item.status || 'idea',
    platform,
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
      // Migrate existing items (including old type: 'note') to type: 'post'
      const migratedItems = feed.items.map((item: AnyContent & { type: string }) => {
        if (item.type === 'post' || item.type === 'note') {
          return migratePost(item as Post);
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
        const items: Post[] = oldData.items.map((item: Partial<Post>) => migratePost(item as Post));
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
        const items: Post[] = oldData.docs.map((doc: { id: string; content: string; createdAt: number; updatedAt: number }) => ({
          id: doc.id,
          type: 'post' as const,
          body: doc.content || '',
          status: 'idea' as ContentStatus,
          platform: null,
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

export function deletePost(id: string): void {
  const feed = loadFeed();
  feed.items = feed.items.filter((item) => item.id !== id);
  saveFeed(feed);
}

// Filter helpers
export function filterByStatus(items: AnyContent[], status: ContentStatus): AnyContent[] {
  return items.filter((item) => item.type === 'post' && (item as Post).status === status);
}

export function filterByPlatform(items: AnyContent[], platform: Platform): AnyContent[] {
  return items.filter((item) => item.type === 'post' && (item as Post).platform === platform);
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


// Cadence management
export function loadCadence(): WeeklyCadence {
  if (typeof window === 'undefined') {
    return DEFAULT_CADENCE;
  }

  const stored = localStorage.getItem(CADENCE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Migrate old number-based cadence to boolean[] format
      const firstValue = parsed[Object.keys(parsed)[0]];
      if (typeof firstValue === 'number') {
        const migrated: WeeklyCadence = { ...DEFAULT_CADENCE };
        for (const key of Object.keys(parsed) as Platform[]) {
          const n = parsed[key] as number;
          const days = [false, false, false, false, false, false, false];
          // Set first n weekdays (Mon-Fri first, then weekend) to true
          for (let i = 0; i < Math.min(n, 7); i++) {
            days[i] = true;
          }
          migrated[key] = days;
        }
        saveCadence(migrated);
        return migrated;
      }
      return parsed;
    } catch {
      return DEFAULT_CADENCE;
    }
  }
  return DEFAULT_CADENCE;
}

export function saveCadence(cadence: WeeklyCadence): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CADENCE_KEY, JSON.stringify(cadence));
}

export function createPostWithMeta({ body, platform, scheduledFor }: { body?: string; platform?: Platform; scheduledFor?: number }): Post {
  const now = Date.now();
  return {
    id: generateId(),
    type: 'post',
    body: body || '',
    status: 'idea',
    platform: platform || null,
    createdAt: now,
    updatedAt: now,
    scheduledFor,
  };
}

export function getScheduledPostsForPlatformDay(items: AnyContent[], platform: Platform, dayStart: Date): Post[] {
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return items.filter((item): item is Post => {
    if (item.type !== 'post') return false;
    const post = item as Post;
    if (post.platform !== platform) return false;
    if (!post.scheduledFor) return false;
    const scheduled = new Date(post.scheduledFor);
    return scheduled >= dayStart && scheduled < dayEnd;
  });
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
});

export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}

export function getPinnedPosts(platform: Platform | null): Post[] {
  const feed = loadFeed();
  return feed.items
    .filter((item): item is Post => item.type === 'post' && !!item.pinned && item.platform === platform)
    .slice(0, 5);
}

export function countPinnedForPlatform(items: AnyContent[], platform: Platform | null): number {
  return items.filter((item) => item.type === 'post' && !!(item as Post).pinned && (item as Post).platform === platform).length;
}
