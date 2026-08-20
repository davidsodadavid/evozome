"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { saveContent, type LandingContent } from "@/lib/content";

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

  const content: LandingContent = {
    heroTitle: str(formData, "heroTitle"),
    heroSubtitle: str(formData, "heroSubtitle"),
    heroImage: str(formData, "heroImage"),

    resonanceText: str(formData, "resonanceText"),

    fullBleedImage: str(formData, "fullBleedImage"),
    buildToHealImage: str(formData, "buildToHealImage"),

    aboutText: str(formData, "aboutText"),
    aboutImage1: str(formData, "aboutImage1"),
    aboutImage2: str(formData, "aboutImage2"),

    products: [0, 1, 2].map((i) => ({
      title: str(formData, `product-${i}-title`),
      desc: str(formData, `product-${i}-desc`),
      img: str(formData, `product-${i}-img`),
    })),

    armadilloText: str(formData, "armadilloText"),
    armadilloImage: str(formData, "armadilloImage"),

    gallery: [0, 1, 2, 3].map((i) => str(formData, `gallery-${i}`)),

    contactEmail: str(formData, "contactEmail"),
    contactPhone: str(formData, "contactPhone"),
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
