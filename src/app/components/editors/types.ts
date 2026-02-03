import { Editor } from '@tiptap/react';
import { Post } from '../../types/content';

export interface PlatformEditorProps {
  post: Post;
  onBodyChange: (html: string) => void;
  onFieldChange: (updates: Partial<Post>) => void;
  /** Ref callback so the parent page can access the TipTap editor for copy/export/AI insert */
  onEditorReady?: (editor: Editor | null) => void;
  /** Initial body content to load into the editor */
  initialBody?: string;
}
