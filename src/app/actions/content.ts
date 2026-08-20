"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getContent, saveContent, type LandingContent } from "@/lib/content";

export type ContentFormState = { error?: string };

function str(formData: FormData, key: string) {
  // Textareas submit CRLF line breaks — normalize to \n so stored content
  // and the split('\n') rendering in EvozomeLanding stay clean.
  return String(formData.get(key) ?? "").replace(/\r\n/g, "\n").trim();
}

export async function updateContent(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin();

  // Contact email/phone are edited separately, under General Info — carry
  // whatever's currently saved forward instead of wiping it here.
  const existing = await getContent();

  const content: LandingContent = {
    heroTitle: str(formData, "heroTitle"),
    heroSubtitle: str(formData, "heroSubtitle"),
    heroImage: str(formData, "heroImage"),
    heroImageMobile: str(formData, "heroImageMobile"),

    introLabel: str(formData, "introLabel"),
    introStatement: str(formData, "introStatement"),
    introImageLeft: str(formData, "introImageLeft"),
    introImageRight: str(formData, "introImageRight"),

    resonanceText: str(formData, "resonanceText"),
    resonanceImage1: str(formData, "resonanceImage1"),
    resonanceImage2: str(formData, "resonanceImage2"),

    aboutText: str(formData, "aboutText"),

    windowImage: str(formData, "windowImage"),
    windowHeading: str(formData, "windowHeading"),
    windowText: str(formData, "windowText"),

    armadilloImage: str(formData, "armadilloImage"),
    armadilloImageMobile: str(formData, "armadilloImageMobile"),

    gallery: [0, 1, 2, 3].map((i) => str(formData, `gallery-${i}`)),

    contactEmail: existing.contactEmail,
    contactPhone: existing.contactPhone,
  };

  try {
    await saveContent(content);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save" };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateGeneralInfo(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin();

  const existing = await getContent();
  const content: LandingContent = {
    ...existing,
    contactEmail: str(formData, "contactEmail"),
    contactPhone: str(formData, "contactPhone"),
  };

  try {
    await saveContent(content);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save" };
  }

  revalidatePath("/");
  revalidatePath("/admin/general-info");
  redirect("/admin/general-info");
}
