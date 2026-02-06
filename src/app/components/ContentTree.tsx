'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, PLATFORM_LABELS, getContentLabel } from '../types/content';
import { stripHtml, truncateText, loadFeed } from '../utils/feed';
import { StatusBadge } from './StatusSelector';

interface ContentTreeProps {
  currentPostId: string;
  /** All posts that share the same root in the derivation chain */
  posts: Post[];
}

interface TreeNode {
  post: Post;
  children: TreeNode[];
}

function buildTree(posts: Post[], rootId: string): TreeNode | null {
  const root = posts.find((p) => p.id === rootId);
  if (!root) return null;

  function getChildren(parentId: string): TreeNode[] {
    return posts
      .filter((p) => p.sourceId === parentId)
      .map((p) => ({
        post: p,
        children: getChildren(p.id),
      }));
  }

  return { post: root, children: getChildren(rootId) };
}

function findRoot(posts: Post[], postId: string): string {
  const post = posts.find((p) => p.id === postId);
  if (!post || !post.sourceId) return postId;
  return findRoot(posts, post.sourceId);
}

/** Collect all post IDs in a derivation chain */
export function getRelatedPosts(postId: string): Post[] {
  const feed = loadFeed();
  const allPosts = feed.items;

  // Find the root
  const rootId = findRoot(allPosts, postId);

  // Collect all descendants
  const related = new Set<string>();
  related.add(rootId);

  function collectChildren(parentId: string) {
    for (const p of allPosts) {
      if (p.sourceId === parentId && !related.has(p.id)) {
        related.add(p.id);
        collectChildren(p.id);
      }
    }
  }
  collectChildren(rootId);

  return allPosts.filter((p) => related.has(p.id));
}

function TreeNodeItem({ node, currentPostId, depth = 0 }: { node: TreeNode; currentPostId: string; depth?: number }) {
  const router = useRouter();
  const isCurrent = node.post.id === currentPostId;
  const preview = node.post.title || truncateText(stripHtml(node.post.body || ''), 50) || `Untitled ${getContentLabel(node.post.platform)}`;

  return (
    <div>
      <button
        onClick={() => !isCurrent && router.push(`/posts/${node.post.id}`)}
        className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
          isCurrent
            ? 'bg-[var(--muted)] text-[var(--foreground)]'
            : 'text-[var(--muted-foreground)] hover:bg-[var(--button-hover)] hover:text-[var(--foreground)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {depth > 0 && (
          <span className="text-[var(--muted-foreground)] opacity-40">└</span>
        )}
        {node.post.platform && (
          <span className="text-xs shrink-0">
            {PLATFORM_LABELS[node.post.platform]}
          </span>
        )}
        <span className="truncate flex-1">{preview}</span>
        <StatusBadge status={node.post.status} size="sm" />
      </button>
      {node.children.map((child) => (
        <TreeNodeItem key={child.post.id} node={child} currentPostId={currentPostId} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ContentTree({ currentPostId, posts }: ContentTreeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (posts.length <= 1) return null;

  const rootId = findRoot(posts, currentPostId);
  const tree = buildTree(posts, rootId);
  if (!tree) return null;

  return (
    <div className="border border-[var(--toolbar-border)] rounded-lg mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--button-hover)] transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <path d="M21 12H9" /><path d="M21 6H9" /><path d="M21 18H9" />
            <path d="M3 12h.01" /><path d="M3 6h.01" /><path d="M3 18h.01" />
          </svg>
          <span className="text-[var(--muted-foreground)]">Content tree</span>
          <span className="text-xs text-[var(--muted-foreground)]">({posts.length} items)</span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-[var(--muted-foreground)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-2 pb-3">
          <TreeNodeItem node={tree} currentPostId={currentPostId} />
        </div>
      )}
    </div>
  );
}
