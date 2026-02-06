# Spec: Platform-Aware Content Model

## Positioning

Flow is a **creation and management tool**, not a publishing tool. The hard problem for content creators isn't posting — it's the hours spent writing, adapting, and organizing content across platforms. Publishing is API calls; creation is craft.

Competitors like Blotato, Buffer, and Planable focus on scheduling and distribution. Flow focuses on the writing experience: platform-specific editors that understand what you're creating, AI that helps you write it, and a repurposing workflow that turns one piece of content into many.

## Why

Flow treats all content as "posts" with a single rich text body. This fails in three ways:

1. **The editor doesn't match the work.** A YouTube script has a hook, body, description, timestamps, and thumbnail. A newsletter has a subject line, preheader, and body. The editor gives everyone the same blank rich text field.

2. **Content is siloed per platform.** A creator's real workflow is: write a YouTube script → generate a newsletter from it → pull three LinkedIn posts from the newsletter → condense one into a tweet. Flow has no way to express these relationships or help with the adaptation.

3. **No media.** For a tool that supports Instagram, TikTok, and YouTube, having no way to attach images or video means half the workflow happens elsewhere.

## What

### 1. Repurposing as a core workflow

Content doesn't exist in isolation. A YouTube video becomes a newsletter, which becomes LinkedIn posts, which become tweets. Flow should model and support this.

**Content relationships:**

```typescript
export interface ContentLink {
  sourceId: string;       // the original content
  derivedId: string;      // the adapted version
  platform: Platform;     // what platform the derived content targets
  createdAt: number;
}
```

Every piece of content can have a `sourceId` pointing to what it was derived from. This creates a tree:

```
YouTube Script: "How I Ship 10x Faster"
  ├── Newsletter Edition: "This Week: Shipping Faster with AI"
  │   ├── LinkedIn Post: "Most engineers use AI wrong..."
  │   └── LinkedIn Post: "The 10 principles I follow..."
  ├── Tweet: "Your output isn't code. It's a delivery system."
  └── Instagram Post: carousel summary of key points
```

**Repurpose action:**

From any piece of content, the creator can hit "Repurpose" and choose a target platform. This:

1. Creates a new piece of content on the target platform
2. Sets `sourceId` to the original
3. Pre-fills the new content with an AI-adapted version using the target platform's playbook
4. Opens the new content in the platform-specific editor for the creator to refine

The AI adaptation uses the source content + the target platform's playbook to produce a first draft. The creator always edits — the AI gives them a starting point, not a final product.

**Source content view:**

When editing derived content, a collapsible panel shows the source content for reference. The creator can see what they're adapting from while they write.

**Content tree view:**

From the source content, a panel shows all derived content with their status (idea/draft/ready/published). This gives visibility into: "I published the YouTube video, but the newsletter and LinkedIn posts are still in draft."

### 2. Platform-specific content terminology

Stop calling everything a "post." Use language that matches each platform:

| Platform | Content label | Plural |
|----------|--------------|--------|
| LinkedIn | Post | Posts |
| Twitter | Tweet | Tweets |
| YouTube | Script | Scripts |
| Newsletter | Edition | Editions |
| Instagram | Post | Posts |
| TikTok | Script | Scripts |
| Doc (untagged) | Doc | Docs |

This affects: sidebar labels, page titles, empty states, button text, card previews.

### 3. Platform-specific editor fields

Each platform gets a tailored editor layout. The body field remains the primary writing area, but additional structured fields appear based on platform.

**LinkedIn**
- Body (rich text, 3000 char limit)
- No additional fields — the current editor is correct for LinkedIn

**Twitter**
- Body (plain text, 280 char limit)
- Thread mode: toggle to split into numbered segments, each with its own character count
- Thread segments stored as array, rendered as numbered blocks in editor

**YouTube**
- Video title (plain text, 100 char limit)
- Hook (plain text, the first 30 seconds — separate field so it gets focused attention)
- Script body (rich text or plain text, the full script)
- Video description (plain text, 5000 char limit)
- Timestamps (structured list: `time` + `label` pairs)
- Tags (comma-separated or chips)
- Thumbnail (single image upload)

**Newsletter**
- Subject line (plain text, 40-60 char target)
- Preheader (plain text, 40-100 chars, preview text in inbox)
- Body (rich text)
- Header image (single image upload, optional)

**Instagram**
- Caption (plain text, 2200 char limit)
- Hashtags (separate field, 5-15 tags)
- Carousel slides (ordered list, each with: image upload + optional caption)
- Single image mode vs carousel mode toggle

**TikTok**
- Hook (plain text, the first 1-3 seconds)
- Script body (plain text, conversational tone)
- Caption (plain text, 2200 char limit)
- Hashtags (separate field)
- Cover image (single image upload, optional)

**Doc (untagged)**
- Body (rich text, no limits)
- No additional fields

### 4. Media support

**Data model:**

```typescript
export interface MediaAttachment {
  id: string;
  type: 'image' | 'video-link';
  url: string;              // Supabase Storage URL or external link
  thumbnailUrl?: string;    // generated thumbnail for display
  caption?: string;         // per-slide caption (Instagram carousel)
  order: number;            // ordering for carousels
  mimeType?: string;
  sizeBytes?: number;
}
```

**Storage strategy:**
- Images uploaded to Supabase Storage (not localStorage — images are too large)
- Video files are NOT uploaded — too large, already hosted on YouTube/TikTok. Store as reference links only.
- Thumbnail images (YouTube, TikTok cover) uploaded to Supabase Storage
- Image URLs stored on the content record
- Supabase sync becomes required for media features (localStorage-only mode works but without media)

**Upload UX:**
- Drag-and-drop onto the editor or upload button
- Image preview with remove button
- Carousel reordering via drag-and-drop
- Max file size: 10MB per image
- Accepted formats: JPEG, PNG, WebP, GIF

### 5. Updated data model

```typescript
export interface Post extends Content {
  type: 'post';
  body: string;                    // primary content (HTML or plain text)
  format: 'html' | 'plaintext';   // content format
  title?: string;                  // YouTube video title, etc.
  description?: string;            // YouTube video description, etc.
  status: ContentStatus;
  platform: Platform | null;
  scheduledFor?: number;
  pinned?: boolean;

  // Repurposing
  sourceId?: string;               // ID of the content this was derived from

  // Platform-specific structured fields
  hook?: string;                   // YouTube/TikTok opening hook
  subjectLine?: string;            // Newsletter subject
  preheader?: string;              // Newsletter preheader
  hashtags?: string[];             // Instagram/TikTok hashtags
  tags?: string[];                 // YouTube tags
  timestamps?: { time: string; label: string }[];  // YouTube timestamps
  threadSegments?: string[];       // Twitter thread segments

  // Media
  media?: MediaAttachment[];       // images, thumbnails, cover images
}
```

Fields are optional and platform-agnostic at the type level. The editor UI determines which fields to show based on the selected platform. If a user switches platforms, existing data is preserved — fields just hide/show.

## Constraints

- **localStorage must still work for text-only content.** Media requires Supabase, but a user without Supabase configured can still write, plan, and manage all text content — including repurposing.
- **Switching platforms preserves data.** If you write a YouTube script with timestamps and switch to LinkedIn, the timestamps are hidden but not deleted. Switching back reveals them.
- **No video upload.** Videos are too large and already hosted elsewhere. Video platforms (YouTube, TikTok) get a reference link field, not an upload.
- **Repurposing always involves human editing.** The AI produces a first draft. The creator refines it. Flow is a writing tool — it doesn't auto-publish adapted content.
- **Backward compatible.** Existing posts continue to work. New fields are all optional. No migration needed.
- **Publishing is out of scope.** Flow does not connect to platform APIs to publish. It may in the future, but the creation and management workflow comes first.

## Current state

- `Post` type has: `body`, `title?`, `description?`, `status`, `platform`, `scheduledFor?`, `pinned?`
- `PLATFORM_FIELDS` defines title/description labels per platform (YouTube and Newsletter only)
- `PLATFORM_CHAR_LIMITS` defines per-field character limits
- Editor is TipTap with StarterKit (headings, lists, bold, italic)
- All storage is localStorage
- No media support exists
- No content relationships exist
- Everything is called a "post"
- AI playbooks exist per platform with platform-specific system prompts and quick actions

## Example workflow

A creator's weekly workflow in Flow:

1. **Write a YouTube script** using the YouTube editor. Fill in the hook, script body, description, timestamps, and upload a thumbnail. Status: draft.

2. **Repurpose → Newsletter.** From the YouTube script, hit "Repurpose → Newsletter." AI reads the script and generates a newsletter edition: subject line, preheader, body adapted from the script's key points. The creator edits it in the Newsletter editor. The source panel shows the YouTube script for reference.

3. **Repurpose → LinkedIn (×2).** From the newsletter, repurpose twice for LinkedIn. Each time the AI generates a different angle — one focused on the main takeaway, one on a supporting story. The creator refines each.

4. **Repurpose → Tweet.** From one of the LinkedIn posts, repurpose to Twitter. AI condenses to 280 characters. Creator tweaks.

5. **Check the tree.** From the YouTube script, the content tree shows: 1 newsletter (ready), 2 LinkedIn posts (draft), 1 tweet (idea). The creator can see what still needs work.

6. **Weekly planner.** The weekly view shows all content across platforms with their statuses. The creator can see gaps and create new content to fill them.

## Tasks

### Phase 1: Terminology, types, and editor refactor (no backend required)

1. **Add platform-specific content labels and structured fields to Post type**
   - Add `PLATFORM_CONTENT_LABELS` to `content.ts` with singular/plural per platform
   - Add `hook`, `subjectLine`, `preheader`, `hashtags`, `tags`, `timestamps`, `threadSegments`, `format`, `sourceId` to the Post interface
   - Update posts list page title, empty states, card text, sidebar labels
   - Files: `content.ts`, `PostCard.tsx`, `posts/page.tsx`, `Sidebar.tsx`, `AppLayout.tsx`

2. **Extract platform-specific editor components**
   - Refactor `posts/[id]/page.tsx` to dispatch to per-platform editor components
   - Create `components/editors/` directory with a component per platform
   - Shared toolbar and save logic stays in the parent; field layout is per-platform
   - Files: `posts/[id]/page.tsx`, new `components/editors/*.tsx`

3. **Build YouTube editor layout**
   - Hook, script body, title, description, timestamps, tags fields
   - Files: `components/editors/YouTubeEditor.tsx`

4. **Build Newsletter editor layout**
   - Subject line, preheader, body, header image placeholder
   - Files: `components/editors/NewsletterEditor.tsx`

5. **Build Twitter editor layout**
   - Plain text body, thread mode toggle, per-segment character counts
   - Files: `components/editors/TwitterEditor.tsx`

6. **Build Instagram editor layout**
   - Caption, hashtags, carousel slide planning (text-only, images in Phase 3)
   - Files: `components/editors/InstagramEditor.tsx`

7. **Build TikTok editor layout**
   - Hook, script body, caption, hashtags
   - Files: `components/editors/TikTokEditor.tsx`

### Phase 2: Repurposing (no backend required)

8. **Add repurpose action to content editor**
   - "Repurpose" button with platform selector dropdown
   - Creates new content with `sourceId` set, pre-fills with AI-adapted draft
   - Navigates to new content in the target platform's editor
   - Files: `posts/[id]/page.tsx`, `feed.ts`

9. **Add source content reference panel**
   - When editing derived content, collapsible panel showing the source content
   - Read-only view of the source with key fields visible
   - Files: `posts/[id]/page.tsx`, new `components/SourcePanel.tsx`

10. **Add content tree view**
    - From any content, show all derived content and their statuses
    - Tree visualization or flat list grouped by platform
    - Files: `posts/[id]/page.tsx`, new `components/ContentTree.tsx`

11. **Update weekly planner for content relationships**
    - Show content tree indicators on weekly planner items
    - Visual indicator when a piece of content has unpublished derivatives
    - Files: `weekly/page.tsx`

### Phase 3: Media support (requires Supabase)

12. **Set up Supabase Storage integration**
    - Configure Supabase client and storage bucket
    - Upload/delete/list helpers
    - Files: new `utils/storage.ts`, `utils/supabase.ts`

13. **Add MediaAttachment to data model**
    - Add `media` field to Post type
    - Serialization for localStorage (URLs only, not blob data)
    - Files: `content.ts`, `feed.ts`

14. **Build image upload component**
    - Drag-and-drop and button upload
    - Preview, remove, reorder (for carousels)
    - Progress indicator
    - Files: new `components/MediaUpload.tsx`

15. **Integrate media into platform editors**
    - YouTube: thumbnail upload field
    - Instagram: carousel image upload per slide
    - Newsletter: header image upload
    - TikTok: cover image upload
    - Files: platform editor components, `MediaUpload.tsx`

### File overlap analysis

Phase 1 overlaps are resolved by task 2 (editor refactor). Once per-platform editors are extracted, tasks 3-7 each touch their own file.

| File | Tasks |
|------|-------|
| `content.ts` | 1, 13 (Phase 1 vs Phase 3 — no conflict) |
| `posts/[id]/page.tsx` | 2, 8, 9, 10 (sequenced within phases) |
| `PostCard.tsx` | 1 |
| `posts/page.tsx` | 1 |
| `Sidebar.tsx` | 1 |
| `AppLayout.tsx` | 1 |
| `feed.ts` | 8, 13 (Phase 2 vs Phase 3 — no conflict) |
| `weekly/page.tsx` | 11 |
| `components/editors/*.tsx` | 3-7 (separate files, no conflict) |

**Recommended sequencing:**
1. Task 1 (types, labels, terminology)
2. Task 2 (editor refactor — critical path, unblocks all platform editors)
3. Tasks 3-7 in parallel (each platform editor is its own file)
4. Tasks 8-10 sequentially (repurposing features)
5. Task 11 (weekly planner update)
6. Tasks 12-15 sequentially (media, requires Supabase)
