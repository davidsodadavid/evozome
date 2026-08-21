import EvozomeLanding from "@/components/EvozomeLanding";
import { getContent } from "@/lib/content";

// Content lives in R2, editable from the admin panel — it must be fetched
// fresh on every request, not baked in at build time (the CI build has no
// R2 credentials, and even if it did, edits made after a deploy wouldn't
// show up until the next rebuild).
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  return <EvozomeLanding content={content} />;
}
