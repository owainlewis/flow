<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ContentFlow is a writing-first content creation tool for content creators built with Next.js 16. It features status workflow (idea/draft/ready/published), platform tagging (LinkedIn, YouTube, Newsletter, Twitter), and weekly content planning. Notes are stored in localStorage with optional Supabase sync.

## Commands

```bash
bun run dev          # Start development server (localhost:3000)
bun run build        # Build for production
bun run lint         # Run ESLint
bun run test         # Run Playwright tests
bun run test:ui      # Run tests with Playwright UI
bun run test:headed  # Run tests in headed browser mode
```

All commands are also available via `make` (e.g., `make dev`, `make test`).

## Architecture

### Routes (App Router)
- `/` - Landing page with dark mode toggle
- `/notes` - Notes list (feed view)
- `/notes/new` - Create new note
- `/notes/[id]` - View/edit existing note

### Key Components
- `src/app/components/Editor.tsx` - TipTap-based rich text editor with click-outside-to-save behavior
- `src/app/components/NoteCard.tsx` - Note preview card for the feed
- `src/app/components/Toolbar.tsx` - Top navigation bar

### Data Layer
- `src/app/types/content.ts` - TypeScript types for Note, ContentStatus, Platform, Feed
- `src/app/utils/feed.ts` - localStorage CRUD operations, utility functions, filter helpers
- Storage key: `contentflow-feed`
- Formats storage: `contentflow-formats`

### Styling
- Tailwind CSS 4 with CSS variables for theming
- Dark mode via `dark` class on `<html>`
- Theme stored in `contentflow-theme` localStorage key
- Source Serif 4 font for editor typography

### Editor Configuration
TipTap StarterKit with limited extensions: headings (1-3), lists, bold, italic. Code blocks and horizontal rules are disabled.
