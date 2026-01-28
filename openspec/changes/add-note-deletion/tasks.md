# Tasks: Add Note Deletion

## T1. Data Layer
- [ ] 1.1 Add `deleteNote(id: string)` function to `src/app/utils/feed.ts`

## T2. UI Components
- [ ] 2.1 Add delete button to `NoteCard` component with trash icon
- [ ] 2.2 Create confirmation dialog using Radix AlertDialog
- [ ] 2.3 Style delete button to appear on hover (desktop) or always visible (mobile)

## T3. Integration
- [ ] 3.1 Wire up delete action in notes feed page
- [ ] 3.2 Ensure feed updates immediately after deletion

## T4. Testing
- [ ] 4.1 Add Playwright test for note deletion flow
- [ ] 4.2 Test confirmation dialog cancel behavior
