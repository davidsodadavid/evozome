"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMedia } from "@/app/actions/media";
import { constraintsFor, type MediaKind } from "@/lib/uploads";

export default function MediaUploadForm({ kind }: { kind: MediaKind }) {
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { allowed, maxBytes, maxMb } = constraintsFor(kind);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const tooBig = files.filter((f) => f.size > maxBytes);
    const toUpload = files.filter((f) => f.size <= maxBytes);
    const initialErrors = tooBig.map((f) => `${f.name}: must be smaller than ${maxMb}MB`);

    setErrors(initialErrors);
    setProgress(toUpload.length > 0 ? { done: 0, total: toUpload.length } : null);

    startTransition(async () => {
      const failures: string[] = [...initialErrors];
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const formData = new FormData();
        formData.set("file", file);
        formData.set("kind", kind);
        const result = await uploadMedia({}, formData);
        if (result.error) {
          failures.push(`${file.name}: ${result.error}`);
        }
        setProgress({ done: i + 1, total: toUpload.length });
      }
      setErrors(failures);
      setProgress(null);
      e.target.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowed.join(",")}
          multiple
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
          {progress ? `Uploading ${progress.done}/${progress.total}…` : `Upload ${kind}s`}
        </button>
      </div>
      {errors.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {errors.map((msg, i) => (
            <li key={i} className="text-sm text-red-400">
              {msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
