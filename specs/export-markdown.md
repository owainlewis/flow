# Export Notes as Markdown

## Why

Users need to get their notes out of the app for backup, sharing, or use in other tools. Markdown is the universal format for portable plain-text notes.

## What

Add an "Export" button to the note detail page that downloads the current note as a `.md` file.

- Download button in toolbar next to existing Copy button
- Converts TipTap HTML to clean Markdown
- Downloads file as `{id}.md` (or first 30 chars of content if available)
- Works offline (no server needed)

## Constraints

### Must
- Use browser download API (create blob, trigger download)
- Use `turndown` library for HTML-to-Markdown conversion (robust, handles edge cases)
- Follow existing toolbar button patterns from `src/app/notes/[id]/page.tsx`

### Must Not
- No changes to data model or storage

### Out of Scope
- Bulk export of all notes
- Export as other formats (PDF, HTML, JSON)
- Import from Markdown

## Current State

- Note detail page: `src/app/notes/[id]/page.tsx`
- Has "Copy" button that uses `stripHtml()` for plain text
- Utilities in `src/app/utils/feed.ts` include `stripHtml()`
- Notes stored as HTML strings from TipTap editor

## Tasks

### T1: Add HTML-to-Markdown converter
**What:** Install `turndown` and create `htmlToMarkdown()` wrapper function
**Files:** `package.json`, `src/app/utils/feed.ts`
**Tests:** Manual - call function with sample HTML, verify output
**Verify:** `console.log(htmlToMarkdown('<h1>Title</h1><p><strong>bold</strong></p>'))`

### T2: Add Export button to note page
**What:** Add download button next to Copy button, wire up to trigger .md file download
**Files:** `src/app/notes/[id]/page.tsx`
**Tests:** Manual - click Export, verify file downloads with correct content
**Verify:** Open note, click Export, check downloaded file contains valid Markdown
