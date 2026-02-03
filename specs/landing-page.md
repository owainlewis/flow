# Landing Page Spec

## Goal

Create a minimal landing page at `/` that explains Cleartype and provides a clear call-to-action to start writing. Move the existing notes feed to `/notes`.

## Non-goals

- User authentication or accounts
- Analytics or tracking
- Animated illustrations or complex graphics
- Multiple language support
- SEO optimization beyond basic meta tags

## User-facing behavior

### Landing page (`/`)

**What the user sees:**
```
                    Cleartype

         Write. Nothing else.

  A distraction-free space for your thoughts.
  No account needed. Works offline. Just write.

          [ Start writing ]

              Your notes →
```

**Interactions:**
- Click "Start writing" → navigates to `/notes/new`
- Click "Your notes" → navigates to `/notes`
- Dark mode toggle in corner (persists preference)

### Notes feed (`/notes`)

Same as current `/` page - shows all notes as cards.

## Technical approach

1. Create new landing page component at `src/app/page.tsx`
2. Move current feed page to `src/app/notes/page.tsx`
3. Update all internal links from `/new` → `/notes/new` and `/note/[id]` → `/notes/[id]`
4. Restructure route folders accordingly

## Data models & APIs

No new data models. Existing `Feed` and `Note` types unchanged.

Theme persistence uses existing `THEME_KEY = 'cleartype-theme'` in localStorage.

## Existing patterns to follow

- Dark mode toggle: see `src/app/page.tsx:50-52` for `handleToggleDarkMode`
- Theme initialization: see `src/app/page.tsx:18-27` for loading saved theme
- Button styling: use `toolbar-button` class from `src/app/globals.css:219-227`
- Typography: use `font-serif` variable for headlines (Source Serif 4)
- Layout: use `max-w-[700px] mx-auto` for content width consistency

## Files to create/modify

### Create
- `src/app/notes/page.tsx` - moved from current `src/app/page.tsx`
- `src/app/notes/new/page.tsx` - moved from `src/app/new/page.tsx`
- `src/app/notes/[id]/page.tsx` - moved from `src/app/note/[id]/page.tsx`

### Modify
- `src/app/page.tsx` - replace with landing page
- `src/app/components/Toolbar.tsx` - update "New" button link to `/notes/new`

### Delete
- `src/app/new/page.tsx` - moved to `/notes/new`
- `src/app/note/[id]/page.tsx` - moved to `/notes/[id]`

## Acceptance criteria

- [ ] Landing page renders at `/` with headline, subheadline, and CTA button
- [ ] "Start writing" button navigates to `/notes/new`
- [ ] "Your notes" link navigates to `/notes`
- [ ] Notes feed displays correctly at `/notes`
- [ ] Creating a new note at `/notes/new` works and redirects to `/notes/[id]`
- [ ] Viewing/editing notes at `/notes/[id]` works correctly
- [ ] Dark mode toggle on landing page works and persists
- [ ] All old routes (`/new`, `/note/[id]`) no longer exist
- [ ] No console errors or hydration mismatches
