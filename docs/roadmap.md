# ClearType Product Roadmap

A focused roadmap for building the best distraction-free note-taking experience.

---

## Killer Features

### 1. Privacy-First

**What it is**
All notes are stored locally in the browser's localStorage. No accounts, no servers, no data collection. The app works completely offline—your notes never leave your device.

**Why we need it**
Cloud-based note apps (Notion, Evernote, Bear) require accounts and store user data on remote servers. With growing concerns about data privacy, "your notes never leave your device" is a compelling differentiator. Users get full ownership of their data with zero trust required.

**User Stories**
- As a user, I want my notes stored only on my device so no one else can access them
- As a user, I want to use the app without creating an account or signing up
- As a user, I want the app to work without an internet connection
- As a user, I want assurance that my notes aren't being sent to any server

**Success Criteria**
- [x] No external API calls for note storage
- [x] No analytics or tracking scripts
- [x] No account or authentication required
- [x] App functions fully offline
- [ ] Clear messaging about local-only storage in UI/landing page

---

### 2. View Mode

**What it is**
A clean, read-only presentation of notes that removes all editing UI. Notes display in a polished typography-focused layout optimized for reading.

**Why we need it**
Currently, opening a note always enters edit mode with the cursor active. Users reviewing their notes don't need editing controls—they want a calm reading experience. View mode also prevents accidental edits.

**User Stories**
- As a user, I want to read my notes without seeing editing controls so I can focus on the content
- As a user, I want to click an "Edit" button to switch to editing mode when I need to make changes
- As a user, I want view mode to be the default when opening existing notes

**Success Criteria**
- [ ] Notes open in view mode by default
- [ ] Edit button transitions to edit mode
- [ ] Click-outside or Escape returns to view mode
- [ ] View mode has enhanced typography (larger text, better line spacing)
- [ ] No visible cursor or toolbar in view mode

---

### 3. Quick Search

**What it is**
A search bar at the top of the notes feed that filters notes in real-time as the user types. Search matches against note titles and content.

**Why we need it**
As users accumulate notes, finding a specific one becomes tedious. Quick search lets users instantly narrow down their notes without pagination or scrolling.

**User Stories**
- As a user, I want to type in a search box and see matching notes instantly
- As a user, I want search to match both titles and note content
- As a user, I want to clear the search and see all notes again
- As a user, I want the search to be case-insensitive

**Success Criteria**
- [ ] Search input visible at top of notes feed
- [ ] Notes filter in real-time as user types (debounced)
- [ ] Matches title and stripped HTML content
- [ ] Clear button resets the search
- [ ] Empty state when no results match
- [ ] Search term persists during session

---

### 4. Keyboard-First Navigation

**What it is**
Global keyboard shortcuts that let power users navigate and manage notes without touching the mouse. Includes shortcuts for creating, searching, navigating, and deleting notes.

**Why we need it**
Writers and note-takers value speed. Keyboard shortcuts reduce friction and keep users in flow state. This differentiates ClearType as a tool for serious users.

**User Stories**
- As a user, I want to press `Cmd+K` to open quick search
- As a user, I want to press `Cmd+N` to create a new note
- As a user, I want to press `Escape` to close modals and exit edit mode
- As a user, I want to press `J/K` to navigate between notes in the feed
- As a user, I want to see a keyboard shortcut cheatsheet

**Success Criteria**
- [ ] `Cmd+K` / `Ctrl+K` opens search (command palette style)
- [ ] `Cmd+N` / `Ctrl+N` creates new note
- [ ] `Escape` exits edit mode / closes overlays
- [ ] `J` / `K` navigates note list (when not in editor)
- [ ] `Enter` opens selected note
- [ ] `?` shows keyboard shortcut help
- [ ] Shortcuts don't conflict with browser defaults

---

### 5. Export & Copy

**What it is**
Options to export notes in multiple formats and copy content to clipboard. Supports plain text, Markdown, and copying a shareable link (for future sharing features).

**Why we need it**
Notes are only valuable if users can get content out of the app. Export enables workflows like copying to emails, documents, or other apps. This is table-stakes functionality for any note app.

**User Stories**
- As a user, I want to copy my note as plain text to paste elsewhere
- As a user, I want to export my note as Markdown for use in other tools
- As a user, I want to download my note as a `.md` file
- As a user, I want visual feedback when content is copied

**Success Criteria**
- [ ] "Copy as Text" button in note view/edit
- [ ] "Copy as Markdown" button converts HTML to Markdown
- [ ] "Download" option saves as `.md` file with note title as filename
- [ ] Toast notification confirms copy success
- [ ] Export menu accessible from note toolbar

---

### 6. Bookmark Cards

**What it is**
A new note type for saving links with rich metadata. When a user pastes a URL, ClearType fetches the page title, description, and favicon to create a visual bookmark card. Users can add their own annotations.

**Why we need it**
Users often save interesting links in notes. Raw URLs are ugly and lose context over time. Bookmark cards make saved links visually appealing and informative, turning ClearType into a personal knowledge base.

**User Stories**
- As a user, I want to paste a URL and have it automatically become a bookmark card
- As a user, I want to see the page title, description, and favicon for my bookmarks
- As a user, I want to add my own notes/annotations to bookmarks
- As a user, I want to click a bookmark to open the link in a new tab
- As a user, I want bookmarks to be searchable like regular notes

**Success Criteria**
- [ ] Pasting URL triggers metadata fetch (client-side via proxy or API)
- [ ] Bookmark card displays: title, description, favicon, URL
- [ ] Annotation field for user notes
- [ ] Cards are visually distinct from regular notes
- [ ] Graceful fallback when metadata unavailable
- [ ] Bookmarks included in search results

---

## Smaller Improvements

### Quality of Life
- [ ] Note count displayed in feed header
- [ ] "Last edited" timestamp on note cards
- [ ] Confirmation dialog before deleting notes
- [ ] Auto-save indicator in editor
- [ ] Empty state with helpful onboarding

### Visual Polish
- [ ] Smooth transitions between view/edit modes
- [ ] Skeleton loading states
- [ ] Improved mobile responsiveness
- [ ] Custom scrollbar styling
- [ ] Focus ring improvements for accessibility

### Technical Debt
- [ ] Add comprehensive test coverage
- [ ] Implement error boundaries
- [ ] Add localStorage quota handling
- [ ] Performance optimization for large note collections

---

## Implementation Phases

### Phase 1: Core Reading Experience
- Privacy-First ✓ (implemented)
- View Mode
- Quick Search

### Phase 2: Power User Features
- Keyboard-First Navigation
- Export & Copy

### Phase 3: Knowledge Management
- Bookmark Cards

### Phase 4: Polish & Scale
- Quality of life improvements
- Technical debt reduction
- Performance optimization

---

## Principles

1. **Privacy-first** — Your notes never leave your device. No servers, no accounts, no tracking
2. **Simplicity over features** — Every feature must justify its complexity
3. **Offline-first** — The app must work without internet
4. **Speed matters** — Interactions should feel instant
5. **Keyboard accessible** — Power users shouldn't need a mouse
