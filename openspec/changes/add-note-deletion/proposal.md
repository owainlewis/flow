# Change: Add Note Deletion

## Why
Users need the ability to delete notes they no longer want. Currently, notes can only be created and edited but not removed, leading to clutter in the notes feed.

## What Changes
- Add a delete button to each note card in the feed view
- Add a confirmation dialog to prevent accidental deletions
- Add a `deleteNote` utility function to the feed utilities
- Update the notes feed to handle note removal

## Impact
- Affected specs: notes (new capability)
- Affected code:
  - `src/app/components/NoteCard.tsx` - Add delete button
  - `src/app/utils/feed.ts` - Add deleteNote function
  - `src/app/notes/page.tsx` - Handle deletion state updates
