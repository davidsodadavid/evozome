import { getR2Json, putR2Json } from "@/lib/r2";

export type Subscriber = { email: string; subscribedAt: string };

const SUBSCRIBERS_KEY = "data/subscribers.json";

export async function getSubscribers(): Promise<Subscriber[]> {
  const stored = await getR2Json<Subscriber[]>(SUBSCRIBERS_KEY);
  return stored ?? [];
}

export async function addSubscriber(email: string) {
  const subscribers = await getSubscribers();
  if (subscribers.some((s) => s.email === email)) return; // already on the list
  subscribers.unshift({ email, subscribedAt: new Date().toISOString() });
  await putR2Json(SUBSCRIBERS_KEY, subscribers);
}

export async function removeSubscriber(email: string) {
  const subscribers = await getSubscribers();
  await putR2Json(SUBSCRIBERS_KEY, subscribers.filter((s) => s.email !== email));
}
