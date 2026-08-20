"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMedia } from "@/app/actions/media";
import { constraintsFor, type MediaKind } from "@/lib/uploads";

export default function MediaUploadForm({ kind }: { kind: MediaKind }) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { allowed, maxBytes, maxMb } = constraintsFor(kind);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxBytes) {
      setError(`File must be smaller than ${maxMb}MB`);
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);
    setError(undefined);

    startTransition(async () => {
      const result = await uploadMedia({}, formData);
      if (result.error) {
        setError(result.error);
      }
      e.target.value = "";
    });
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={allowed.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
      >
        {isPending ? "Uploading…" : `Upload ${kind}`}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
