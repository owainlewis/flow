# ContentFlow Cleanup Tickets

## 1. Delete dead files

**Title:** Remove orphaned files (posts/new, Editor, Toolbar)

**Description:**
Three files are no longer used after recent refactors:

- `src/app/posts/new/page.tsx` — The new post flow was changed so `AppLayout.handleNewPost` creates a post in localStorage and navigates directly to `/posts/[id]`. This intermediate page is orphaned.
- `src/app/components/Editor.tsx` — Never imported. Both post pages use `useEditor()` from TipTap directly.
- `src/app/components/Toolbar.tsx` — Leftover from old architecture, replaced by Sidebar navigation.

Also update two stale navigation paths that still reference `/posts/new`:
- `src/app/page.tsx:38` — landing page CTA
- `src/app/posts/page.tsx:103` — empty state button

Both should create a post directly and navigate to `/posts/[id]` instead.

**Labels:** cleanup, tech-debt

---

## 2. Remove dead exports

**Title:** Remove unused exported functions and components

**Description:**
Three exports have no consumers anywhere in the codebase:

- `groupByPlatform()` in `src/app/utils/feed.ts` — was used for platform grouping but nothing imports it after recent changes
- `getPostsForWeek()` in `src/app/utils/feed.ts` — appears to be an older implementation, never imported
- `PlatformBadge` in `src/app/components/ContentTypeSelector.tsx` — was replaced by the full `ContentTypeSelector` dropdown on the post view

Delete all three.

**Labels:** cleanup, tech-debt

---

## 3. Consolidate duplicated PLATFORM_ICONS

**Title:** Extract PLATFORM_ICONS into a shared module

**Description:**
`PLATFORM_ICONS` is defined 4 separate times with identical SVG paths, differing only in size (14/16/18/20px):

- `src/app/components/PostCard.tsx` (14px)
- `src/app/components/ContentTypeSelector.tsx` (16px)
- `src/app/weekly/page.tsx` (18px)
- `src/app/settings/page.tsx` (20px)

This is ~220 LOC of duplication. Create a shared icon module (e.g. `src/app/utils/platform-icons.tsx`) that accepts a `size` parameter and export a single source of truth. Import it in all four files.

Additionally, PostCard types its icons as `Record<string, React.ReactNode>` instead of `Record<Platform, React.ReactNode>` — fix this during consolidation.

**Labels:** cleanup, tech-debt, dx

---

## 4. Consolidate duplicated utility functions

**Title:** Deduplicate stripHtml and truncateText implementations

**Description:**
**stripHtml** is implemented 3 times with different approaches:
- `src/app/utils/feed.ts` — regex-based (simplest, no SSR safety)
- `src/app/components/PostCard.tsx` — DOM-based (client only)
- `src/app/weekly/page.tsx` — DOM-based with SSR fallback (most robust)

Pick the SSR-safe DOM version, export it from `feed.ts`, and delete the local copies in PostCard and weekly page.

**truncateText** is implemented twice:
- `src/app/components/PostCard.tsx` (default 150 chars)
- `src/app/weekly/page.tsx` (default 60 chars)

Extract to `feed.ts` with a configurable `maxLength` parameter and import in both files.

**Labels:** cleanup, tech-debt
