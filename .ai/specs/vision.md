# Cleartype Vision

## Overview

Cleartype is a minimalist writing app inspired by [write.as](https://write.as), [iA Writer](https://ia.net/writer), and other distraction-free editors. The core philosophy is that writing should feel effortless—no accounts, no complex features, just you and your words.

## Core Principles

1. **Zero friction** - Start writing immediately. No sign-up required for local use.
2. **Distraction-free** - Clean typography, minimal UI, focus on content.
3. **Ephemeral by default, permanent by choice** - Notes live locally until you decide to share them.
4. **Beautiful simplicity** - Every feature must earn its place.

## Current State

- Feed-based home showing notes as cards
- Rich text editing with TipTap (headings, lists, quotes, bold, italic)
- Create, edit, delete notes
- Dark/light mode
- Local storage persistence
- Hemingway-inspired typography (Source Serif)

---

## URL Structure & Information Architecture

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page - explains the app, CTA to start writing |
| `/notes` | Your notes feed (private, local storage) |
| `/notes/new` | Create a new note |
| `/notes/[id]` | View note (read-only, shareable) |
| `/notes/[id]/edit` | Edit note |

### Landing Page

Inspired by [write.as](https://write.as) - simple, direct, no jargon.

**Content structure:**
- Headline: Clear, memorable tagline (e.g., "Write. Nothing else.")
- Subheadline: One sentence explaining what Cleartype is
- Primary CTA: "Start writing" → `/notes/new`
- Secondary CTA: "View your notes" → `/notes`
- Brief feature highlights (3 max): distraction-free, works offline, no account needed

**Design:**
- Minimal, lots of whitespace
- Show the editor in action (screenshot or live preview)
- Consistent with the app's typography (Source Serif for headings)

### View vs Edit Modes

**Problem:** Currently, clicking a note enters edit mode. There's no way to:
- View a note in a clean, read-only format
- Share a note via URL with someone else
- Publish a note publicly

**Solution:**

**View Mode** (`/notes/[id]}` - default when opening a note)
- Clean, read-only presentation
- "Edit" button to enter edit mode
- "Copy link" button for sharing
- Delete option (with confirmation)

**Edit Mode** (`/notes/[id]/edit`)
- Current TipTap editor experience
- Auto-save on changes
- "Done" button returns to view mode
- Back navigation returns to view mode

### Sharing Options (Future)

**Phase 1: Local sharing**
- Copy note content as plain text or markdown
- Copy link (works if recipient has access to same browser/storage)

**Phase 2: Public sharing**
- "Publish" action generates a public URL
- Published notes are read-only, accessible without auth
- Option to unpublish
- Requires backend (simple key-value store or serverless function)

**Phase 3: Anonymous accounts**
- Optional sign-up to sync notes across devices
- Keep the "no account required" ethos for local-only use

## Content Types Roadmap

The architecture supports multiple content types. Priority order:

### 1. Notes (Current)
Plain text/rich text writing. The core experience.

### 2. Links (Bookmarks)
- Paste a URL, auto-fetch title and description
- Display as a card with favicon, title, excerpt
- Optional personal annotation

### 3. Images
- Drag & drop or paste
- Display inline in feed
- Optional caption

### 4. Quotes
- Dedicated quote content type
- Author attribution
- Nice typography treatment

## Design Language

- **Typography**: Serif for content (Source Serif), sans-serif for UI
- **Colors**: High contrast, paper-like background, minimal accent color
- **Spacing**: Generous whitespace, comfortable reading measure (~65 chars)
- **Animation**: Subtle, functional (not decorative)

## Non-Goals

- Real-time collaboration
- Folders/nested organization (tags are enough)
- Mobile app (PWA is sufficient)
- Markdown export (maybe later, not core)
- Comments/social features

## Success Metrics

- Time to first note < 3 seconds
- Zero learning curve—intuitive for new users
- Works offline
- Loads instantly (< 100ms perceived)

## Technical Constraints

- Next.js App Router
- Client-side storage (localStorage) for MVP
- No backend required for core features
- Progressive enhancement for sharing features

## Open Questions

1. Should published notes have custom slugs or just IDs?
2. How to handle note discovery? (feed of public notes from all users?)
3. Should we support markdown input (parse on save) or stay WYSIWYG?
4. Character/word limit for notes? (Twitter-like constraints can encourage conciseness)
