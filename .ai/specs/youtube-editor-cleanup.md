# YouTube Editor Field Cleanup

## Why

The YouTube editor has fields (Tags, Timestamps) that add clutter without enough value, and the Thumbnail is buried at the bottom where it's easy to miss. Reordering puts the visual asset (thumbnail) closer to the top where creators set it early in their workflow.

## What

- Remove the **Tags** field from the YouTube editor
- Remove the **Timestamps** field from the YouTube editor
- Move the **Thumbnail** upload above the **Script** field

Final field order:
1. Video title
2. Thumbnail
3. Video description
4. Hook
5. Script (rich text)

## Constraints

### Must
- Keep all other fields and their behaviour unchanged
- Remove the `addTimestamp`, `updateTimestamp`, `removeTimestamp` callbacks (now dead code)
- Keep the `timestamps` import/references in types — other code may still use them

### Must Not
- Change any other platform editor
- Remove `timestamps` or `tags` from the `Post` type (data stays; UI removed)

### Out of Scope
- Adding new fields to replace Tags/Timestamps
- Changing field styling or spacing

## Current State

- YouTube editor: `src/app/components/editors/YouTubeEditor.tsx`
- Current field order: Title → Hook → Script → Description → Timestamps → Tags → Thumbnail
- Timestamp logic (lines 54-69): three callbacks for add/update/remove
- Tags input (lines 167-182): comma-separated text input
- Thumbnail (lines 184-193): MediaUpload component at the bottom

## Tasks

### T1: Remove Tags, Timestamps and reorder Thumbnail
**What:** In `YouTubeEditor.tsx`: delete the Tags section (lines 167-182), delete the Timestamps section (lines 126-165), remove the three timestamp callbacks (`addTimestamp`, `updateTimestamp`, `removeTimestamp`) and the `timestamps` const. Move the Thumbnail `<MediaUpload>` block to render between Hook and Script.
**Files:** `src/app/components/editors/YouTubeEditor.tsx`
**Verify:** `bun run build` passes. Open a YouTube post — only Title, Hook, Thumbnail, Script, Description are visible.
