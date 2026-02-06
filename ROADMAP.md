# Roadmap: UI Polish & Weekly Planner Drag-and-Drop

## 1. Fix the landing page

**File:** `src/app/page.tsx`

The landing page loads a video from `pixabay.com` — an external dependency that's slow, fragile, and adds no value. Replace with a clean static landing page.

- Remove the `<video>` element and overlay div
- Keep the nav bar (ContentFlow, Posts, Weekly, dark mode toggle)
- Keep the hero text and CTA buttons ("Start writing", "Your posts")
- Result: instant load, no external dependencies

**Complexity:** Low — single file, delete more than you add.

---

## 2. Surface pinned posts in the feed

**Files:** `src/app/components/PostCard.tsx`, `src/app/posts/page.tsx`

Pinned posts can be toggled from the editor toolbar but are invisible everywhere else. Two changes:

**PostCard.tsx** — Add a small amber pin icon in the metadata row when `post.pinned` is true.

**posts/page.tsx** — Sort pinned posts to the top of the feed list (pinned first, then by newest). This makes "style example" posts easy to find without a separate section.

**Complexity:** Low — small additive changes, no new components.

---

## 3. YouTube editor: remove timestamps/tags, reorder metadata above script

**Files:** `src/app/components/editors/YouTubeEditor.tsx`, `src/app/types/content.ts`

Current field order: Title → Hook → Script → Description → Timestamps → Tags → Thumbnail

Target field order: **Title → Thumbnail → Description → Hook → Script**

Changes:
- Delete the Timestamps section and all its handler functions (`addTimestamp`, `updateTimestamp`, `removeTimestamp`)
- Delete the Tags section
- Move Thumbnail (MediaUpload) and Description above the Hook/Script
- Remove `timestamps` and `tags` fields from the Post interface in `content.ts` (only used by YouTubeEditor — confirmed via grep)

**Complexity:** Low — delete code, reorder JSX blocks.

---

## 4. Weekly planner drag-and-drop rescheduling

**Files:** `src/app/weekly/page.tsx`, `src/app/utils/feed.ts`

Currently, posts can only be created in empty planner slots. There's no way to move a post from Tuesday to Thursday or reschedule by dragging.

### How scheduling works today

- `Post.scheduledFor` is an optional timestamp (milliseconds)
- `getScheduledPostsForPlatformDay()` matches posts to grid cells using a 24-hour window
- Each cell shows at most one post
- Empty active slots show a "+" button to create a new post

### What needs to change

**a) Make post cards draggable**
- Add `draggable` attribute to the post button in each grid cell
- Store `postId` in drag data via `onDragStart` / `dataTransfer.setData`

**b) Make grid cells drop targets**
- Add `onDragOver` (preventDefault to allow drop) and `onDrop` handlers to each cell
- On drop: update the dragged post's `scheduledFor` to the target cell's day timestamp
- Also update `platform` if the target cell is a different platform row

**c) Visual feedback during drag**
- Highlight valid drop targets (cells in active cadence slots)
- Show a drop indicator on the hovered cell
- Dim the source cell while dragging

**d) Persist the change**
- Add a `reschedulePost(postId, newScheduledFor, newPlatform?)` function in `feed.ts`
- Save to localStorage and refresh the feed state

**e) Cross-platform moves**
- If dragging from YouTube row to Newsletter row, the post's `platform` changes too
- This is powerful but potentially surprising — consider either allowing it freely or showing a confirmation

### Dependency decision

Two options:
- **HTML5 native drag-and-drop** — zero dependencies, adequate for a simple grid. More verbose event handling but keeps the bundle small.
- **@dnd-kit** — modern React DnD library, better animations and accessibility. Adds a dependency.

Recommendation: Start with HTML5 native. The planner grid is a simple case (dragging cards between grid cells, no sorting within cells). If the UX feels clunky, upgrade to @dnd-kit later.

**Complexity:** Medium — new event handlers, state management during drag, visual feedback CSS. Core logic is simple (update `scheduledFor` timestamp) but polishing the drag UX takes iteration.

---

## Execution order

1. **Landing page fix** — independent, zero risk
2. **Pinned post visibility** — independent, zero risk
3. **YouTube editor cleanup** — independent, zero risk
4. **Weekly planner drag-and-drop** — most complex, do last

Items 1–3 can be done in parallel. Item 4 depends on nothing but should be done with care since it introduces new interaction patterns.
