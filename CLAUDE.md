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

Write a spec in `specs/<feature>.md` describing the change. The spec is the persistent design record — it captures context that individual tickets can't. Specs should include:

- **Why** — the motivation and problem being solved
- **What** — the desired outcome and user-facing behaviour
- **Constraints** — must-have, must-not, and out-of-scope boundaries
- **Tasks** — a list of discrete work items to create as tickets

See `specs/export-markdown.md` for an example.

### 2. Tickets (Linear)

Create Linear issues from the spec under the **Flow** project in the **Gradientwork** team.

**Parent issue:** Create one issue per spec with the spec summary as its description. This is the tracking hub — progress rolls up automatically from sub-issues.

**Sub-issues:** Create one sub-issue per task from the spec, linked to the parent via `parentId`. Each sub-issue should have:

- A clear title and description with file paths and acceptance criteria
- A reference to the spec file: `Spec: specs/<feature>.md`
- Labels: `feature`, `bug`, `cleanup`, `tech-debt`, `dx`
- Priority: 1=Urgent, 2=High, 3=Normal, 4=Low

### 3. Implement (Branch per ticket)

For each Linear sub-issue:

1. Read the sub-issue **and its parent issue** to get full context (why, constraints, current state)
2. Read the spec file referenced in the description if more detail is needed
3. Set the sub-issue status to **In Progress**
4. Create a branch following the naming convention below
5. Implement the change
6. Run `bun run build` to verify — never commit code that doesn't build
7. Commit with the Linear issue ID in the message (e.g., `GRA-12`)

#### Branch naming

Format: `<prefix>/<issue-id>-<slug>`

| Prefix | Use |
|--------|-----|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `cleanup/` | Refactoring, dead code removal, tech debt |
| `docs/` | Documentation-only changes |

Examples:
- `feature/gra-12-add-supabase-sync`
- `fix/gra-15-broken-dark-mode-toggle`
- `cleanup/gra-7-remove-unused-exports`

#### Commit messages

- Start with a verb in imperative mood (Add, Fix, Remove, Update)
- Include the Linear issue ID at the end: `Remove unused exports (GRA-7)`
- Keep the first line under 72 characters

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
