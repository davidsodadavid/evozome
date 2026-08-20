import EvozomeLanding from "@/components/EvozomeLanding";
import { getContent } from "@/lib/content";

export default async function Home() {
  const content = await getContent();
  return <EvozomeLanding content={content} />;
}
