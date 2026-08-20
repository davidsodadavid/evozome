import Link from "next/link";
import MediaUploadForm from "@/components/MediaUploadForm";
import MediaThumbnail from "@/components/MediaThumbnail";
import DeleteMediaButton from "@/components/DeleteMediaButton";
import { listR2Objects, isR2Configured } from "@/lib/r2";
import type { MediaKind } from "@/lib/uploads";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const kind: MediaKind = type === "video" ? "video" : "photo";

  if (!isR2Configured()) {
    return (
      <>
        <h1 className="mb-4 text-xl font-semibold text-white">Media</h1>
        <p className="max-w-lg text-sm text-white/60">
          R2 isn&apos;t configured yet. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL in{" "}
          <code className="text-white/80">.env</code>, then restart the server.
        </p>
      </>
    );
  }

  const items = await listR2Objects(`media/${kind}s/`);

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${
      active ? "text-[rgb(20,21,22)]" : "text-white/70 hover:text-white"
    }`;

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-white">Media</h1>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Link
            href="/admin/media?type=photo"
            className={tabClass(kind === "photo")}
            style={kind === "photo" ? { backgroundColor: "rgb(226,224,213)" } : { backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            Photo
          </Link>
          <Link
            href="/admin/media?type=video"
            className={tabClass(kind === "video")}
            style={kind === "video" ? { backgroundColor: "rgb(226,224,213)" } : { backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            Video
          </Link>
        </div>
        <MediaUploadForm kind={kind} />
      </div>

      {items.length === 0 ? (
        <p className="text-white/60">No {kind}s uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/5 p-2"
            >
              <MediaThumbnail url={item.url} filename={item.filename} kind={kind} />
              <span className="truncate text-xs text-white/50">{item.filename}</span>
              <DeleteMediaButton mediaKey={item.key} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
