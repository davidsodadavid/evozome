import Link from "next/link";
import { notFound } from "next/navigation";
import ContentForm from "@/components/ContentForm";
import { PRODUCTS } from "@/lib/products";
import { getContent } from "@/lib/content";
import { listR2Objects } from "@/lib/r2";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  const [content, photos, videos] = await Promise.all([
    getContent(),
    listR2Objects("media/photos/"),
    listR2Objects("media/videos/"),
  ]);
  const mediaLibrary = [
    ...photos.map((p) => ({ ...p, kind: "photo" as const })),
    ...videos.map((v) => ({ ...v, kind: "video" as const })),
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Edit {product.name}</h1>
        <Link href="/admin/products" className="text-sm text-white/60 hover:text-white">
          ← Products
        </Link>
      </div>

      <ContentForm content={content} mediaLibrary={mediaLibrary} />
    </>
  );
}
