"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMedia } from "@/app/actions/media";
import { ALLOWED_PHOTO_TYPES, ALLOWED_VIDEO_TYPES, constraintsFor, isVideoUrl, type MediaKind } from "@/lib/uploads";

type MediaItem = { key: string; url: string; filename: string; kind: MediaKind };

export default function ImagePicker({
  name,
  label,
  initialUrl,
  mediaLibrary,
  kinds = ["photo"],
}: {
  name: string;
  label: string;
  initialUrl: string;
  mediaLibrary: MediaItem[];
  /** Which media kinds this field accepts — pass ["photo","video"] for a
   * background slot that can hold either. Defaults to photo-only. */
  kinds?: MediaKind[];
}) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | undefined>();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowsVideo = kinds.includes("video");
  const accept = [
    ...(kinds.includes("photo") ? ALLOWED_PHOTO_TYPES : []),
    ...(allowsVideo ? ALLOWED_VIDEO_TYPES : []),
  ].join(",");
  const libraryItems = mediaLibrary.filter((m) => kinds.includes(m.kind));
  const previewIsVideo = allowsVideo && isVideoUrl(url);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileKind: MediaKind = file.type.startsWith("video/") ? "video" : "photo";
    const { maxBytes, maxMb } = constraintsFor(fileKind);
    if (file.size > maxBytes) {
      setError(`File must be smaller than ${maxMb}MB`);
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", fileKind);
    setError(undefined);
    setLibraryOpen(false);

    startTransition(async () => {
      const result = await uploadMedia({}, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setUrl(result.url);
      }
      e.target.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-white/15 bg-black/30">
          {url ? (
            previewIsVideo ? (
              <video src={url} className="h-full w-full object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">
              No {allowsVideo ? "media" : "image"}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
            >
              {isPending ? "Uploading…" : allowsVideo ? "Upload photo or video" : "Upload new"}
            </button>
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
            >
              Choose from library
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {libraryOpen && (
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          {libraryItems.length === 0 ? (
            <p className="text-xs text-white/50">Nothing uploaded yet — use the upload button above.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {libraryItems.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setUrl(m.url);
                    setLibraryOpen(false);
                  }}
                  title={m.filename}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                    url === m.url ? "border-[rgb(226,224,213)]" : "border-transparent hover:border-white/30"
                  }`}
                >
                  {m.kind === "video" ? (
                    <video src={m.url} className="h-full w-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
