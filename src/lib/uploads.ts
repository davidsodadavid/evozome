export const MAX_PHOTO_MB = 8;
export const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export const MAX_VIDEO_MB = 200;
export const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export type MediaKind = "photo" | "video";

export function constraintsFor(kind: MediaKind) {
  return kind === "photo"
    ? { allowed: ALLOWED_PHOTO_TYPES, maxBytes: MAX_PHOTO_BYTES, maxMb: MAX_PHOTO_MB }
    : { allowed: ALLOWED_VIDEO_TYPES, maxBytes: MAX_VIDEO_BYTES, maxMb: MAX_VIDEO_MB };
}
