"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { addSubscriber, removeSubscriber } from "@/lib/subscribers";
import { verifyTurnstile } from "@/lib/turnstile";

export type SubscribeState = { error?: string; success?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address" };
  }
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    return { error: "Verification failed — please try again" };
  }

  try {
    await addSubscriber(email);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not subscribe" };
  }

  revalidatePath("/admin/subscribers");
  return { success: true };
}

export async function deleteSubscriber(email: string) {
  await requireAdmin();
  await removeSubscriber(email);
  revalidatePath("/admin/subscribers");
}
