'use client';

import { useState, useRef, useCallback } from 'react';
import { MediaAttachment } from '../types/content';
import { uploadImage, isStorageAvailable } from '../utils/storage';
import { generateId } from '../utils/feed';

interface MediaUploadProps {
  mode: 'single' | 'multi';
  media: MediaAttachment[];
  onChange: (media: MediaAttachment[]) => void;
  disabled?: boolean;
  label?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function MediaUpload({ mode, media, onChange, disabled, label }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageAvailable = !disabled && isStorageAvailable();

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    // Validation
    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`Unsupported format: ${file.type}. Use JPEG, PNG, WebP, or GIF.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max 10MB.`);
        return;
      }
    }

    // For single mode, only take the first file
    const toUpload = mode === 'single' ? [fileArray[0]] : fileArray;

    setIsUploading(true);
    try {
      const newAttachments: MediaAttachment[] = [];
      for (const file of toUpload) {
        const { url } = await uploadImage(file);
        newAttachments.push({
          id: generateId(),
          type: 'image',
          url,
          order: media.length + newAttachments.length,
          mimeType: file.type,
          sizeBytes: file.size,
        });
      }

      if (mode === 'single') {
        onChange(newAttachments);
      } else {
        onChange([...media, ...newAttachments]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [media, mode, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(media.filter((m) => m.id !== id));
  }, [media, onChange]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const updated = [...media];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated.map((m, i) => ({ ...m, order: i })));
  }, [media, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  if (!storageAvailable) {
    return (
      <div>
        {label && (
          <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="border border-dashed border-[var(--toolbar-border)] rounded-lg p-6 text-center text-sm text-[var(--muted-foreground)]">
          Image upload requires Supabase configuration
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Image previews */}
      {media.length > 0 && (
        <div className={`gap-2 mb-3 ${mode === 'multi' ? 'grid grid-cols-3' : 'flex'}`}>
          {media.map((m, i) => (
            <div key={m.id} className="relative group rounded-lg overflow-hidden border border-[var(--toolbar-border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.caption || ''} className="w-full h-24 object-cover" />
              <button
                onClick={() => handleRemove(m.id)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              {mode === 'multi' && (
                <div className="absolute bottom-1 left-1 flex gap-0.5">
                  {i > 0 && (
                    <button
                      onClick={() => handleReorder(i, i - 1)}
                      className="p-0.5 bg-black/60 rounded text-white text-xs"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                  )}
                  {i < media.length - 1 && (
                    <button
                      onClick={() => handleReorder(i, i + 1)}
                      className="p-0.5 bg-black/60 rounded text-white text-xs"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone (only show if single and no media, or multi mode) */}
      {(mode === 'multi' || media.length === 0) && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center text-sm cursor-pointer transition-colors ${
            dragActive
              ? 'border-[var(--foreground)] bg-[var(--button-hover)]'
              : 'border-[var(--toolbar-border)] hover:border-[var(--muted-foreground)]'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2 text-[var(--muted-foreground)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Uploading...
            </div>
          ) : (
            <div className="text-[var(--muted-foreground)]">
              <p>Drop image here or click to upload</p>
              <p className="text-xs mt-1">JPEG, PNG, WebP, GIF up to 10MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={mode === 'multi'}
        onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
