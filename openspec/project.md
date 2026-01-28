# Project Context

## Purpose
Cleartype is a minimalist, distraction-free note-taking app. The goal is to provide a clean writing experience with minimal UI chrome, focused on content creation rather than features. Notes are organized in a simple feed view.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4
- **Editor**: TipTap (rich text with limited formatting)
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM (in progress, currently localStorage)
- **Testing**: Playwright (E2E)
- **Package Manager**: Bun
- **UI Components**: Radix UI primitives, Lucide icons

## Project Conventions

### Code Style
- TypeScript strict mode
- ESLint with Next.js config
- Functional React components with hooks
- CSS via Tailwind utility classes
- CSS variables for theming (dark mode support)

### Architecture Patterns
- **App Router**: File-based routing under `src/app/`
- **Route Structure**: `/` (landing), `/notes` (feed), `/notes/new`, `/notes/[id]`
- **Components**: Shared components in `src/app/components/`
- **Data Layer**: Types in `types/`, utilities in `utils/`
- **Storage**: localStorage with `cleartype-` prefix (migrating to PostgreSQL)

### Testing Strategy
- Playwright for end-to-end testing
- Tests run via `bun run test`
- Visual testing with `bun run screenshots` for snapshot updates
- Headed mode available for debugging (`bun run test:headed`)

### Git Workflow
- Main branch for stable code
- Concise commit messages focused on what changed
- No "Co-Authored-By" lines in commits

## Domain Context
- **Note**: Core entity with id, title, content (HTML), timestamps
- **Feed**: Collection of notes displayed in reverse chronological order
- **Editor**: Click-outside-to-save behavior, minimal formatting (headings 1-3, lists, bold, italic)
- **Theme**: Dark/light mode stored in `cleartype-theme` localStorage key

## Important Constraints
- Offline-first: App must work without network connectivity
- Minimal UI: Avoid feature bloat, prioritize writing experience
- Performance: Fast load times, no unnecessary dependencies
- Typography: Source Serif 4 font for editor content

## External Dependencies
- **Clerk**: Authentication service (clerk.com)
- **PostgreSQL**: Database (setup in progress via Drizzle)
