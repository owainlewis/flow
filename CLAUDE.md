# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flow is a writing-first content creation tool for content creators built with Next.js 16. It features status workflow (idea/draft/ready/published), platform tagging (LinkedIn, YouTube, Newsletter, Twitter), and weekly content planning. Posts are stored in localStorage with optional Supabase sync.

- **Repo:** https://github.com/owainlewis/flow
- **Linear project:** Flow (Gradientwork team)

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

## Development Workflow

This project uses a spec-driven workflow with Linear for tracking and GitHub for code review.

### 1. Spec (Plan)

Write a spec in `.ai/specs/<feature>.md` describing the change: what, why, and how. Specs should include:

- **Goal** — what problem this solves
- **Approach** — high-level design decisions
- **Scope** — files affected, new files needed
- **Tickets** — a list of discrete issues to create

### 2. Tickets (Linear)

Create Linear issues from the spec under the **Flow** project in the **Gradientwork** team. Each ticket should have:

- A clear title and description with file paths and acceptance criteria
- Appropriate labels (e.g., `feature`, `bug`, `cleanup`, `tech-debt`)
- Priority set (1=Urgent, 2=High, 3=Normal, 4=Low)

### 3. Implement (Branch per ticket)

For each Linear ticket:

1. Set the issue status to **In Progress**
2. Create a branch using the Linear-suggested name: `owain/<issue-id>-<slug>`
3. Implement the change
4. Run `bun run build` to verify — never commit code that doesn't build
5. Commit with the Linear issue ID in the message (e.g., `GRA-12`)

### 4. Push & PR (GitHub)

1. Push the branch to `origin`
2. Create a PR with `gh pr create` linking back to the Linear issue
3. PR description should summarize changes and include the Linear issue URL

### 5. Merge & Close

After review/merge:

1. Mark the Linear issue as **Done**
2. Delete the feature branch

## Architecture

### Routes (App Router)
- `/` — Landing page
- `/posts` — Posts list (feed view)
- `/posts/[id]` — View/edit existing post
- `/settings` — App settings
- `/weekly` — Weekly content planner

### Key Components
- `src/app/components/AppLayout.tsx` — Shell layout with sidebar
- `src/app/components/Sidebar.tsx` — Navigation sidebar
- `src/app/components/PostCard.tsx` — Post preview card for the feed
- `src/app/components/ContentTypeSelector.tsx` — Platform picker dropdown

### Data Layer
- `src/app/types/content.ts` — TypeScript types for Post, ContentStatus, Platform, Feed
- `src/app/utils/feed.ts` — localStorage CRUD operations, utility functions, filter helpers
- Storage key: `contentflow-feed`
- Formats storage: `contentflow-formats`

### Styling
- Tailwind CSS 4 with CSS variables for theming
- Dark mode via `dark` class on `<html>`
- Theme stored in `contentflow-theme` localStorage key
- Source Serif 4 font for editor typography

### Editor Configuration
TipTap StarterKit with limited extensions: headings (1-3), lists, bold, italic. Code blocks and horizontal rules are disabled.
