import { getSupabase, isSupabaseConfigured } from './supabase';
import { generateId } from './feed';

const BUCKET = 'flow-media';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isStorageAvailable(): boolean {
  return isSupabaseConfigured();
}

function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is 10MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Accepted: JPEG, PNG, WebP, GIF.`);
  }
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured. Media uploads require Supabase Storage.');
  }

  validateFile(file);

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${generateId()}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}

export async function deleteImage(url: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  // Extract path from the public URL
  const bucketPrefix = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(bucketPrefix);
  if (idx === -1) return;

  const path = url.slice(idx + bucketPrefix.length);

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function listImages(prefix: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return (data || []).map((file) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`${prefix}/${file.name}`);
    return urlData.publicUrl;
  });
}
