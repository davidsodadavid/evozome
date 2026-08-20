const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Verifies a Cloudflare Turnstile response token server-side. Silently
 * passes (returns true) if TURNSTILE_SECRET_KEY isn't configured, so the
 * form still works before Turnstile is set up — only enforced once the key
 * is actually set. */
export async function verifyTurnstile(token: FormDataEntryValue | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token || typeof token !== "string") return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
