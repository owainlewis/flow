# Weekly Planner Drag-and-Drop

## Why

The weekly content planner lets creators see their scheduled content across platforms, but posts are locked to whatever day they were created on. There's no way to reschedule without editing the post directly. Drag-and-drop rescheduling within a platform row makes reorganizing a content week fast and visual.

## What

- Post cards in the weekly planner grid become draggable
- Grid cells in the same platform row accept drops
- Dropping a post on a different day updates its `scheduledFor` timestamp
- Visual feedback during drag: source card dims, valid drop targets highlight
- Drag is constrained to the same platform row (no cross-platform moves)

## Constraints

### Must
- Use HTML5 native drag-and-drop (no new dependencies)
- Only allow drops within the same platform row
- Persist changes to localStorage immediately via existing `saveFeed()`
- Follow existing Tailwind CSS variable patterns for all styling

### Must Not
- No new npm dependencies
- No cross-platform drag (dragging YouTube → Newsletter is not allowed)
- Don't change the grid layout structure or cadence logic

### Out of Scope
- Dragging between weeks
- Reordering multiple posts within the same day cell
- Touch/mobile drag support (HTML5 DnD doesn't work on mobile)
- Undo/redo for drag operations

## Current State

**Scheduling mechanism:**
- `Post.scheduledFor?: number` — optional timestamp in milliseconds
- `getScheduledPostsForPlatformDay()` in `feed.ts:229` matches posts to grid cells via 24-hour window
- Each cell renders at most one post (`[0] ?? null`)
- Empty active cells show a "+" button to create a new post

**Weekly planner:** `src/app/weekly/page.tsx`
- CSS grid: `minmax(140px, auto) repeat(7, 1fr)` — sticky platform column + 7 day columns
- Platform rows loop over `activePlatforms` (platforms with cadence configured)
- Post cards are `<button>` elements with status badge, text preview, derivative count
- State: `feed` (Feed), `cadence` (WeeklyCadence), `currentWeekStart` (Date)

**Feed utilities:** `src/app/utils/feed.ts`
- `loadFeed()` / `saveFeed()` — localStorage CRUD
- `getScheduledPostsForPlatformDay(items, platform, dayStart)` — returns Post[]
- No existing function to update a single post's `scheduledFor`

## Tasks

### T1: Add reschedulePost utility
**What:** Add a `reschedulePost(postId: string, newScheduledFor: number)` function to `feed.ts` that loads the feed, finds the post by ID, updates its `scheduledFor` and `updatedAt`, and saves.
**Files:** `src/app/utils/feed.ts`
**Verify:** `bun run build` passes. Function is exported.

### T2: Add drag-and-drop to weekly planner
**Blocked by:** T1
**What:** Make post cards draggable and grid cells droppable within the same platform row. On drop, call `reschedulePost()` and refresh the feed state. Add visual feedback: source card opacity during drag, drop target highlight on dragover.
**Files:** `src/app/weekly/page.tsx`
**Verify:** `bun run build` passes. Manual test: drag a post from Monday to Wednesday in the same platform row — post moves. Dragging to a different platform row should not work (drop is rejected).
