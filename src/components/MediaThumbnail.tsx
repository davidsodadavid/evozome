"use client";

import { useEffect, useState } from "react";
import type { MediaKind } from "@/lib/uploads";

export default function MediaThumbnail({
  url,
  filename,
  kind,
}: {
  url: string;
  filename: string;
  kind: MediaKind;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative h-32 w-full cursor-pointer overflow-hidden rounded-md border border-white/10 bg-black/30"
      >
        {kind === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video src={url} className="h-full w-full object-cover" muted />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-white"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-4xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {kind === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={filename} className="max-h-full max-w-full object-contain" />
            ) : (
              <video src={url} className="max-h-full max-w-full" controls autoPlay />
            )}
          </div>
        </div>
      )}
    </>
  );
}
