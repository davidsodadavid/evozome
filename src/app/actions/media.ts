"use server";

import path from "path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { constraintsFor, type MediaKind } from "@/lib/uploads";
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

  const ext = path.extname(file.name).toLowerCase();
  const filename = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    url = await uploadToR2(`media/${kind}s/${filename}`, buffer, file.type);
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
