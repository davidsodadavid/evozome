// This is the cap on what you can pick in the file dialog — the original,
// before compression. Uploaded photos get resized/re-encoded to WebP on
// the server (see uploadMedia), so the object that actually lands in R2 is
// much smaller than this.
export const MAX_PHOTO_MB = 30;
export const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Longest edge (px) photos get downscaled to before upload — plenty for
// full-bleed hero use, well beyond what a screen actually needs.
export const PHOTO_MAX_DIMENSION = 2560;
export const PHOTO_WEBP_QUALITY = 82;

export const MAX_VIDEO_MB = 200;
export const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export type MediaKind = "photo" | "video";

export function constraintsFor(kind: MediaKind) {
  return kind === "photo"
    ? { allowed: ALLOWED_PHOTO_TYPES, maxBytes: MAX_PHOTO_BYTES, maxMb: MAX_PHOTO_MB }
    : { allowed: ALLOWED_VIDEO_TYPES, maxBytes: MAX_VIDEO_BYTES, maxMb: MAX_VIDEO_MB };
}

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

// Content fields that can hold either a photo or a video URL (e.g. the hero
// background) don't store which kind was picked — this tells them apart by
// extension at render time.
export function isVideoUrl(url: string) {
  return VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
}
