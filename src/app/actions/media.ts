"use server";

import path from "path";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  constraintsFor,
  PHOTO_MAX_DIMENSION,
  PHOTO_WEBP_QUALITY,
  type MediaKind,
} from "@/lib/uploads";
import { uploadToR2, deleteR2Object } from "@/lib/r2";

export type UploadState = { error?: string; url?: string };

export async function uploadMedia(
  _prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireAdmin();

  const kind = formData.get("kind");
  if (kind !== "photo" && kind !== "video") {
    return { error: "Invalid media kind" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file" };
  }

  const { allowed, maxBytes, maxMb } = constraintsFor(kind as MediaKind);
  if (!allowed.includes(file.type)) {
    return { error: `File type not allowed for ${kind}s` };
  }
  if (file.size > maxBytes) {
    return { error: `File must be smaller than ${maxMb}MB` };
  }

  let ext = path.extname(file.name).toLowerCase();
  let buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;

  // Photos get downscaled and re-encoded to WebP before they ever reach R2
  // — this is where the 25MB-camera-photo problem gets solved. Animated
  // GIFs are left alone so they keep their animation.
  if (kind === "photo" && file.type !== "image/gif") {
    try {
      buffer = await sharp(buffer, { failOn: "none" })
        .rotate() // apply EXIF orientation, then drop it
        .resize({
          width: PHOTO_MAX_DIMENSION,
          height: PHOTO_MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: PHOTO_WEBP_QUALITY })
        .toBuffer();
      contentType = "image/webp";
      ext = ".webp";
    } catch (e) {
      return { error: e instanceof Error ? `Could not process image: ${e.message}` : "Could not process image" };
    }
  }

  const filename = `${crypto.randomUUID()}${ext}`;

  let url: string;
  try {
    url = await uploadToR2(`media/${kind}s/${filename}`, buffer, contentType);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  revalidatePath("/admin/media");
  return { url };
}

export async function deleteMedia(key: string) {
  await requireAdmin();
  await deleteR2Object(key);
  revalidatePath("/admin/media");
}
